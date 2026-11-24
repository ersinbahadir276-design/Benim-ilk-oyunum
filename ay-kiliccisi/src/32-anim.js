// ===================== hero animation realism: gait layer + terrain foot IK =====================
// gaitExtras(q): adds secondary motion on top of the state pose targets (before blending):
//   walk/run hip sway, lean into turns, lean with acceleration, head kept level, idle breathing and weight shift.
// footIK(dt): after applyPose, plants both feet on the real terrain under them (two-bone leg IK),
//   drops the pelvis to the lower foot and tilts each foot to the ground normal. Works only while grounded.
const ANIM={yaw:null,turn:0,spd:0,acc:0,w:0,drop:0,dyL:0,dyR:0,on:true};
const FIK_STATES={move:1,land:1,attack:1,charge:1,heavy:1,runatk:1,block:1,parry:1,gbreak:1,exec:1,assn:1,shoot:1,drink:1,hurt:1,skill:1};
function gaitExtras(q){const dt=GT.dt||0,t=GT.time;if(dt<=0)return;
 // smoothed yaw rate (rad/s) and forward acceleration (m/s^2)
 if(ANIM.yaw===null)ANIM.yaw=P.yaw;const tr=angd(P.yaw,ANIM.yaw)/dt;ANIM.yaw=P.yaw;ANIM.turn+=(cl(tr,-8,8)-ANIM.turn)*Math.min(1,dt*8);
 const acc=(P.spd-ANIM.spd)/dt;ANIM.spd=P.spd;ANIM.acc+=(cl(acc,-25,25)-ANIM.acc)*Math.min(1,dt*6);
 if(P.st!=='move'||P.crouch){if(P.st==='move'&&P.crouch)q.hdX-=q.spX*.3;return}
 const mv=cl(P.spd/3.4,0,1.6),s=Math.sin(P.ph),c2=Math.cos(2*P.ph);
 if(mv>.08){
  // pelvis/torso sway over the stance leg, slight vertical bob twice per stride
  q.spZ+=-s*.045*Math.min(mv,1);q.hipY+=-c2*.006*Math.min(mv,1);
  // bank into turns: the body leans towards the centre of the turn (model +x when yaw grows; rZ(+) tips the head to -x, hence the minus), stronger at speed
  q.spZ-=cl(ANIM.turn*.05*mv,-.22,.22);q.chY+=cl(ANIM.turn*.04,-.15,.15);
  // lean forward while speeding up, back while braking
  q.spX+=cl(ANIM.acc*.018,-.12,.16);
  // head stays level: counter the torso pitch and part of the sway
  q.hdX-=(q.spX+q.pel)*.55;q.hdY-=q.chY*.5}
 else{// idle: breathing (chest + shoulders), slow weight shift between legs, small look-around
  const br=Math.sin(t*1.7),ws=Math.sin(t*.37);q.chX+=br*.018;q.LaZ-=br*.02;q.RaZ-=br*.02;
  q.spZ+=ws*.03;q.LthZ+=.03+ws*.025;q.RthZ-=.03-ws*.025;q.Lkn+=Math.max(0,-ws)*.08;q.Rkn+=Math.max(0,ws)*.08;q.hipY-=Math.abs(ws)*.008}}
// leg: rotate upper/lower leg so the ankle moves by dy (model-space y); foot turned by slope rotation S
function legIK(side,dy,S){const H=HB,U=H[side+'UpperLeg'],Lo=H[side+'LowerLeg'],F=H[side+'Foot'],GP=SK.GP,GR=SK.GR;
 const Sp=GP[U],K=GP[Lo],A=GP[F],L1=Math.hypot(...vsub(K,Sp)),L2=Math.hypot(...vsub(A,K)),T=[A[0],A[1]+dy,A[2]];
 const st=vsub(T,Sp),d=cl(Math.hypot(...st),.05,L1+L2-.002),u=vnorm(st);
 // knee bends forward (+z) unless the pose already bends it some other way
 let pv=vadd(vsub(K,vmul(vadd(Sp,A),.5)),[0,0,.02]);pv=vsub(pv,vmul(u,vdot(pv,u)));const v=Math.hypot(...pv)>1e-5?vnorm(pv):[0,0,1];
 const ca=cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1),sa=Math.sqrt(1-ca*ca),E=vadd(Sp,vadd(vmul(u,L1*ca),vmul(v,L1*sa))),Tc=vadd(Sp,vmul(u,d));
 const D1=fromTo(vnorm(vsub(K,Sp)),vnorm(vsub(E,Sp))),Gu=r3m(D1,GR[U]);
 const D2=fromTo(vnorm(r3v(D1,vsub(A,K))),vnorm(vsub(Tc,E))),Gl=r3m(D2,r3m(D1,GR[Lo])),Gf=r3m(S,GR[F]);
 SK.R[U]=r3m(r3t(GR[SK.par[U]]),Gu);SK.R[Lo]=r3m(r3t(Gu),Gl);SK.R[F]=r3m(r3t(Gl),Gf)}
function footIK(dt){const want=ANIM.on&&!P.air&&FIK_STATES[P.st]&&P.rag.ang<.05&&waterAt(P.x,P.z)<hAt(P.x,P.z)+.05?1:0;
 ANIM.w+=(want-ANIM.w)*Math.min(1,(dt||0)*(want?6:12));if(!dt&&want)ANIM.w=1;if(ANIM.w<.01){ANIM.w=0;ANIM.drop=0;return}
 const H=HB,M=mtrs([P.x,P.y,P.z],[0,P.yaw,0]),o=mpt(M,[0,0,0]),ax=vsub(mpt(M,[1,0,0]),o),az=vsub(mpt(M,[0,0,1]),o),e=.15,w=ANIM.w,res={};
 for(const side of['left','right']){const a=SK.GP[H[side+'Foot']],wp=mpt(M,a),h=(dx,dz)=>hAt(wp[0]+ax[0]*dx+az[0]*dz,wp[2]+ax[2]*dx+az[2]*dz);
  const dy=cl(h(0,0)-P.y,-.4,.4)*w,sx=(h(e,0)-h(-e,0))/(2*e),sz=(h(0,e)-h(0,-e))/(2*e);
  let n=vnorm([-sx,1,-sz]);const tilt=Math.acos(cl(n[1],-1,1));if(tilt>.5)n=vnorm(vadd(vmul([0,1,0],1),vmul(vnorm([n[0],0,n[2]]),Math.tan(.5))));
  res[side]={dy,S:fromTo([0,1,0],vnorm(vadd(vmul([0,1,0],1-w),vmul(n,w))))}}
 // pelvis drops so the lower foot can still reach the ground (smoothed so steps don't pop)
 const target=Math.min(.32,Math.max(0,-Math.min(res.left.dy,res.right.dy)));ANIM.drop+=(target-ANIM.drop)*Math.min(1,(dt||1)*14);
 ANIM.dyL=res.left.dy;ANIM.dyR=res.right.dy;
 SK.root=[SK.root[0],SK.root[1]-ANIM.drop,SK.root[2]];skUpdate();
 legIK('left',res.left.dy+ANIM.drop,res.left.S);legIK('right',res.right.dy+ANIM.drop,res.right.S);skUpdate()}
