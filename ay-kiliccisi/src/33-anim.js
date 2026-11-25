// ===================== Kael's locomotion layer: terrain foot IK, pelvis motion, heel-toe roll, body lean, breathing =====================
// poseTarget() builds the keyframe-like pose; this layer adds what makes it read as a real body moving over real ground:
//  - each foot is planted on the terrain under it (two-bone sagittal IK, pelvis lowered so the lower foot still reaches),
//    and the sole is tilted to the slope;
//  - the pelvis rolls (drops on the swing side), twists with the stride and shifts its weight over the stance foot;
//  - the ankle rolls heel -> toe (toes up at heel strike, toes down at push-off);
//  - the whole body leans into turns and into acceleration, the head stays level when the spine pitches;
//  - idle breathing deepens when stamina is low, with a slow weight shift between the feet.
const LIK={w:0,hL:0,hR:0,pitch:0,roll:0,x:1e9,z:1e9,lean:0,leanF:0,lyaw:0,lspd:0,acc:0};
const IK_STATES={move:1,land:1,attack:1,charge:1,heavy:1,block:1,parry:1,gbreak:1,exec:1,assn:1,shoot:1,drink:1,hurt:1,skill:1};
// local model offset (x right/left, z forward) -> world, matching mtrs([x,y,z],[0,yaw,0])
function locToWorld(lx,lz){const c=Math.cos(P.yaw),s=Math.sin(P.yaw);return[P.x+lx*c+lz*s,P.z-lx*s+lz*c]}
// foot forward offset of a leg in the sagittal plane (model units, +z forward)
function legFwd(pel,th,kn){return-(SK.L1*Math.sin(pel+th)+SK.L2*Math.sin(pel+th+kn))}
// secondary motion added to the target pose (called at the end of poseTarget, before smoothing)
function locoExtras(q){const t=GT.time;
 if(P.st==='move'&&!P.crouch){const mv=cl(P.spd/3.4,0,1);
  if(mv>.08){const s=Math.sin(P.ph),c=Math.cos(P.ph),spr=P.sprinting&&P.spd>4.6,k=spr?.6:1;
   q.pelZ=-.055*c*mv*k;q.pelY=-s*.11*mv;q.hipX=-c*.022*mv*k;           // swing-side hip drop, stride twist, weight over the stance foot
   q.spZ-=q.pelZ*.8;q.spY-=q.pelY*.6;q.LthZ-=q.pelZ;q.RthZ-=q.pelZ;    // torso and legs stay upright over the rolling pelvis
   q.Lft=mv*(-.22*Math.max(0,s)+.4*Math.max(0,-s)*cl(c+.4,0,1));       // heel strike toes-up, push-off toes-down
   q.Rft=mv*(-.22*Math.max(0,-s)+.4*Math.max(0,s)*cl(-c+.4,0,1));
   q.hdX-=(q.spX+q.pel)*.55}                                           // eyes level when the body pitches forward
  else{// idle: slow weight shift and breathing (heavier when out of breath)
   const tired=1-cl(P.sta/100,0,1),br=t*(1.6+tired*1.8),amp=1+tired*2.6,ws=Math.sin(t*.37);
   q.chX+=Math.sin(br)*.018*amp;q.spX+=Math.sin(br)*.008*amp;q.LaZ-=Math.sin(br)*.025*amp;q.RaZ-=Math.sin(br)*.02*amp;q.hdX+=Math.sin(br+.6)*.02*amp+tired*.12;
   q.hipX=ws*.014;q.pelZ=ws*.03;q.spZ-=q.pelZ*.8;q.LthZ-=q.pelZ;q.RthZ-=q.pelZ;q.Lkn+=.07*Math.max(0,-ws);q.Rkn+=.07*Math.max(0,ws)}}}
// per-frame: terrain under each foot, slope, lean (called after poseTarget, before applyPose)
function updateLoco(dt){const q=P.ps,on=P.alive!==false&&!P.air&&!P.pinBy&&IK_STATES[P.st]&&P.rag.ang<.02&&!(P.st==='skill'&&P.air);
 const ground=hAt(P.x,P.z),wet=P.y>ground+.04;LIK.w+=((on&&!wet&&!LIK.off?1:0)-LIK.w)*Math.min(1,dt*10);
 const k=Math.min(1,dt*16),lx=PLD.bones[HB.leftUpperLeg].r[0],hc=(h)=>cl(h,-.38,.38);
 const fL=legFwd(q.pel,q.LthX,q.Lkn),fR=legFwd(q.pel,q.RthX,q.Rkn),[ax,az]=locToWorld(lx,fL),[bx,bz]=locToWorld(-lx,fR);
 LIK.hL+=(hc((hAt(ax,az)-P.y)/PSC)-LIK.hL)*k;LIK.hR+=(hc((hAt(bx,bz)-P.y)/PSC)-LIK.hR)*k;
 const sx=(hAt(P.x+.3,P.z)-hAt(P.x-.3,P.z))/.6,sz=(hAt(P.x,P.z+.3)-hAt(P.x,P.z-.3))/.6,c=Math.cos(P.yaw),s=Math.sin(P.yaw);
 LIK.pitch+=(cl(-Math.atan(sx*s+sz*c),-.5,.5)-LIK.pitch)*k;LIK.roll+=(cl(Math.atan(sx*c-sz*s),-.4,.4)-LIK.roll)*k;
 // lean into turns (roll) and into acceleration (pitch); only while running on the ground
 const yr=dt>0?angd(P.yaw,LIK.lyaw)/dt:0,acc=dt>0?(P.spd-LIK.lspd)/dt:0;LIK.lyaw=P.yaw;LIK.lspd=P.spd;LIK.acc+=(acc-LIK.acc)*Math.min(1,dt*6);
 const mov=P.st==='move'&&!P.air&&!P.crouch,tl=mov?cl(-yr*P.spd*.016,-.2,.2):0,tf=mov?cl(LIK.acc*.025,-.1,.16):0;
 LIK.lean+=(tl-LIK.lean)*Math.min(1,dt*7);LIK.leanF+=(tf-LIK.leanF)*Math.min(1,dt*5);LIK.x=P.x;LIK.z=P.z}
// is the layer's state for where the hero stands now? (cut-scenes teleport the hero and pose it directly)
function likLive(){return Math.abs(LIK.x-P.x)+Math.abs(LIK.z-P.z)<.6}
// leg angles after planting the feet, and the pelvis height (called from applyPose)
function legIK(q){const L1=SK.L1,L2=SK.L2,pel=q.pel;let Lth=q.LthX,Lkn=q.Lkn,Rth=q.RthX,Rkn=q.Rkn;
 const ext=(th,kn)=>L1*Math.cos(pel+th)+L2*Math.cos(pel+th+kn),eL=ext(Lth,Lkn),eR=ext(Rth,Rkn),base=Math.max(eL,eR);let hip=base;
 const w=likLive()?LIK.w:0;
 if(w>.001){const hL=LIK.hL*w,hR=LIK.hR*w;hip=Math.min(Math.max(eL+hL,eR+hR),Math.min(hL,hR)+base);
  // a foot whose ground is closer than the pose's leg length gets its leg shortened (foot stays at the same forward offset)
  const fit=(th,kn,ei,h)=>{const te=Math.max(.25,hip-h);if(te>=ei-1e-4)return[th,kn];const g=-legFwd(pel,th,kn),d=cl(Math.hypot(g,te),.2,L1+L2-1e-4);
   const kk=Math.acos(cl((d*d-L1*L1-L2*L2)/(2*L1*L2),-1,1)),b=Math.atan2(L2*Math.sin(kk),L1+L2*Math.cos(kk));return[Math.atan2(g,te)-b-pel,kk]};
  [Lth,Lkn]=fit(Lth,Lkn,eL,hL);[Rth,Rkn]=fit(Rth,Rkn,eR,hR)}
 return{Lth,Lkn,Rth,Rkn,root:hip-(L1+L2),pitch:LIK.pitch*w,roll:LIK.roll*w}}
// whole-body lean about the feet (applied in playerMatrix)
function leanMatrix(M){if(!likLive()||(Math.abs(LIK.lean)<1e-3&&Math.abs(LIK.leanF)<1e-3))return M;return mmul(M,mmul(rot4(rX(LIK.leanF)),rot4(rZ(LIK.lean))))}
function rot4(A){return new Float32Array([A[0],A[3],A[6],0,A[1],A[4],A[7],0,A[2],A[5],A[8],0,0,0,0,1])}
