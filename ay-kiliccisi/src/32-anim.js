// ===================== hero animation layer: foot IK on terrain, cape physics, lean, look-at =====================
// Runs on top of the hand-made poses in poseTarget (55-player.js):
//  * animLayer(q,dt)  — before smoothing: body leans into turns and acceleration, idle weight shift + breathing,
//                       head turns towards the locked target, per-foot ground height + slope for the leg IK.
//  * legIK(q)         — inside applyPose: pelvis drops to the lower foot, the uphill leg bends (2-bone, sagittal),
//                       feet tilt with the slope. Without ground data (cutscenes: gL=gR=0) it is the old behaviour.
//  * animCape(dt)     — damped springs on CapeA/B/C: hangs with gravity, lifts with speed and falling,
//                       lags behind turns, never folds into the thighs.
const ANIM={yaw:null,spd:0,acc:0,yawRate:0,on:true};
const capeState=()=>P.cape||(P.cape={a:[0,0,0],v:[0,0,0],r:0,rv:0});
function animLayer(q,dt){if(!ANIM.on||!(dt>0))return;
 // yaw rate and forward acceleration, filtered (raw values jitter with the frame time)
 if(ANIM.yaw===null)ANIM.yaw=P.yaw;const yr=angd(P.yaw,ANIM.yaw)/dt;ANIM.yaw=P.yaw;ANIM.yawRate+=(cl(yr,-8,8)-ANIM.yawRate)*Math.min(1,dt*8);
 const ac=(P.spd-ANIM.spd)/dt;ANIM.spd=P.spd;ANIM.acc+=(cl(ac,-30,30)-ANIM.acc)*Math.min(1,dt*6);
 const st=P.st,loco=st==='move'||st==='land',mv=cl(P.spd/3.4,0,1.6);
 if(loco&&!P.crouch){
  // bank into turns (spine roll; +x is the hero's left, a left turn raises yaw), lean with acceleration
  q.spZ+=cl(-ANIM.yawRate*mv*.05,-.22,.22);q.pel+=cl(ANIM.acc*.012,-.12,.16)*cl(mv,0,1);q.spX+=cl(ANIM.acc*.01,-.08,.12)*cl(mv,0,1);
  if(mv<.08){const t=GT.time;// idle: slow weight shift between the feet, breathing lifts the shoulders
   q.spZ+=Math.sin(t*.42)*.025;q.LthZ+=Math.sin(t*.42)*.02;q.RthZ+=Math.sin(t*.42)*.02;q.hipY-=.006*(1+Math.sin(t*.84));
   const br=Math.sin(t*1.6);q.chX+=br*.012;q.LaZ-=br*.015;q.RaZ-=br*.015}}
 // look at the locked target (head first, chest a little), only while the body is free to do so
 if(P.lock&&!P.lock.dead&&(loco||st==='block'||st==='charge'||st==='shoot')){const d=angd(Math.atan2(P.lock.x-P.x,P.lock.z-P.z),P.yaw);
  if(Math.abs(d)<2.2){q.hdY+=cl(d,-.85,.85)*.75;q.chY+=cl(d,-.85,.85)*.2}}
 // ground under each foot (model space offset from the root height) + slope along the facing
 const grounded=!P.air&&(loco||st==='block'||st==='parry'||st==='charge'||st==='drink'||st==='shoot'||st==='hurt'||st==='attack'||st==='heavy'||st==='exec'||st==='skill'&&!P.air);
 if(grounded&&P.rag.ang<.05&&Math.abs(P.y-hAt(P.x,P.z))<.08){const s=Math.sin(P.yaw),c=Math.cos(P.yaw),fx=s,fz=c,H=HB;
  for(const[k,sl,b]of[['gL','slL',H.leftFoot],['gR','slR',H.rightFoot]]){const g=SK.GP[b],wx=P.x+c*g[0]*PSC+s*g[2]*PSC,wz=P.z-s*g[0]*PSC+c*g[2]*PSC;
   q[k]=cl(hAt(wx,wz)-P.y,-.4,.4);const ahead=hAt(wx+fx*.15,wz+fz*.15),behind=hAt(wx-fx*.15,wz-fz*.15);q[sl]=cl(Math.atan2(ahead-behind,.3),-.4,.4)}}}
// leg extension (hip to ankle, vertical) for thigh angle th, knee kn and pelvis tilt p
const legExt=(p,th,kn)=>SK.L1*Math.cos(p+th)+SK.L2*Math.cos(p+th+kn);
// bend a leg (knee +d, thigh -d/2 keeps the foot under the hip) until its extension is `target`
function legBend(p,th,kn,target){if(legExt(p,th,kn)<=target)return[th,kn];let lo=0,hi=2.3;for(let i=0;i<14;i++){const m=(lo+hi)/2;if(legExt(p,th-m/2,kn+m)>target)lo=m;else hi=m}return[th-hi/2,kn+hi]}
function legIK(q){const R=SK.R,H=HB,Lt=SK.L1+SK.L2,gL=q.gL||0,gR=q.gR||0;let LthX=q.LthX,Lkn=q.Lkn,RthX=q.RthX,Rkn=q.Rkn;
 const eL=legExt(q.pel,LthX,Lkn),eR=legExt(q.pel,RthX,Rkn);let root;
 if(Math.abs(gL)<1e-4&&Math.abs(gR)<1e-4)root=-(Lt-Math.max(eL,eR));
 else{// pelvis follows the lower ground (but a leg may not have to fold more than ~55%); the other leg bends to reach its ground
  root=Math.min(gL,gR)-(Lt-Math.max(eL,eR));const minE=Lt*.45;root=Math.max(root,Math.max(gL,gR)+minE-Lt);
  [LthX,Lkn]=legBend(q.pel,LthX,Lkn,Lt+root-gL);[RthX,Rkn]=legBend(q.pel,RthX,Rkn,Lt+root-gR)}
 R[H.leftUpperLeg]=r3m(rX(LthX),rZ(q.LthZ));R[H.rightUpperLeg]=r3m(rX(RthX),rZ(q.RthZ));R[H.leftLowerLeg]=rX(Lkn);R[H.rightLowerLeg]=rX(Rkn);
 // feet stay level with the ground: undo the leg chain, then tilt by the slope (uphill = toes up), only for a planted foot
 const pl=(g,th,kn)=>{const e=legExt(q.pel,th,kn);return cl(1-Math.abs(Lt+root-g-e)/.06,0,1)};
 R[H.leftFoot]=rX(cl(-(q.pel+LthX+Lkn)-(q.slL||0)*pl(gL,LthX,Lkn),-.9,.9));R[H.rightFoot]=rX(cl(-(q.pel+RthX+Rkn)-(q.slR||0)*pl(gR,RthX,Rkn),-.9,.9));
 return root+q.hipY}
// cape: three hinged segments on damped springs, angles relative to the upper chest (+ = swings back)
function animCape(dt){const C=capeState(),q=P.ps;if(!(dt>0))return;dt=Math.min(dt,1/30);
 const lying=P.st==='down'||P.st==='dead'||P.st==='getup'||P.st==='dodge'&&P.roll||P.rag.ang>.3;
 const body=lying?0:(q.pel||0)+(q.spX||0)+(q.chX||0);// how far the chest is pitched forward
 const drag=lying?0:cl(P.spd/6.5,0,1),fall=P.air?cl(-P.vy*.07,0,.7):0,t=GT.time;
 const flutter=drag*(.07*Math.sin(t*9.3)+.04*Math.sin(t*15.7+1));
 // the world angle the wind and gravity want; relative = world - body pitch; the cape may not fold under the thighs
 const thighBack=Math.max(0,(q.LthX||0)+(q.pel||0),(q.RthX||0)+(q.pel||0));
 const want=[.04+drag*.55+fall*.6-body,drag*.35+fall*.5+flutter,drag*.25+fall*.4+flutter*1.6];
 want[0]=Math.max(want[0],thighBack*.45-.05,-.12);
 const K=[70,55,45],D=[9,7,5.5];
 for(let i=0;i<3;i++){const acc=K[i]*(want[i]-C.a[i])-D[i]*C.v[i];C.v[i]+=acc*dt;C.a[i]+=C.v[i]*dt;C.a[i]=cl(C.a[i],-.5,1.6)}
 const rw=lying?0:cl(ANIM.yawRate*.12,-.4,.4)*(.4+drag);C.rv+=(60*(rw-C.r)-8*C.rv)*dt;C.r+=C.rv*dt}
function applyCape(){const H=HB,C=capeState();if(H.capeA===undefined)return;const R=SK.R;R[H.capeA]=r3m(rZ(C.r),rX(C.a[0]));R[H.capeB]=rX(C.a[1]);R[H.capeC]=rX(C.a[2])}
