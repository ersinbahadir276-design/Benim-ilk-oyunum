// ===================== hero locomotion polish: terrain-adaptive feet (leg IK) + body lean =====================
// applyPose() plants the lower foot on a flat plane through P.y. On slopes, steps and uneven ground that leaves the
// uphill foot buried and the downhill foot floating. footIK() runs after the pose and the model matrix:
//  1. samples the terrain under each foot (ankle and toe), relative to P.y
//  2. drops the pelvis to the lower foot so the downhill leg can reach the ground
//  3. two-bone leg IK raises the other foot to its own ground height; the knee keeps the gait's bend plane
//  4. pitches/rolls each foot to the local slope
// Offsets are smoothed so stepping over small bumps doesn't jitter. Off in the air, rolling, lying and deep water.
const FIK={on:1,L:0,R:0,aL:[0,0],aR:[0,0],pel:0,last:null};
const FIK_ST=new Set(['move','land','attack','charge','heavy','runatk','block','parry','gbreak','exec','assn','shoot','drink','skill','hurt']);
const FIK_MAX=.42; // largest per-foot correction (m); bigger steps are walls, not slopes
function fikGround(M,p){const w=mpt(M,p);return hAt(w[0],w[2])}
// slope under the foot in model space: [pitch about model X, roll about model Z]
function fikSlope(M,p){const s=.16,f=mpt(M,[p[0],p[1],p[2]+s]),b=mpt(M,[p[0],p[1],p[2]-s]),r=mpt(M,[p[0]+s,p[1],p[2]]),l=mpt(M,[p[0]-s,p[1],p[2]]);
 const gz=(hAt(f[0],f[2])-hAt(b[0],b[2]))/(2*s),gx=(hAt(r[0],r[2])-hAt(l[0],l[2]))/(2*s);return[cl(-Math.atan(gz),-.5,.5),cl(Math.atan(gx),-.4,.4)]}
// two-bone leg IK that keeps the existing twist: the thigh and shin are turned by the smallest rotation that moves
// the knee/ankle to the solution, so the gait's hip yaw and knee hinge plane survive. Returns the new global shin rotation.
function legIK(side,T){const H=HB,U=H[side+'UpperLeg'],Lo=H[side+'LowerLeg'],F=H[side+'Foot'],B=PLD.bones,GP=SK.GP,GR=SK.GR;
 const S=GP[U],K=GP[Lo],A=GP[F],L1=Math.hypot(...vsub(B[Lo].r,B[U].r)),L2=Math.hypot(...vsub(B[F].r,B[Lo].r));
 const st=vsub(T,S),d=cl(Math.hypot(...st),.08,L1+L2-.003),u=vnorm(st);
 let pv=vsub(vsub(K,S),vmul(u,vdot(vsub(K,S),u)));if(Math.hypot(...pv)<1e-3)pv=vsub([0,0,1],vmul(u,u[2]));const v=vnorm(pv);
 const ca=cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1),sa=Math.sqrt(1-ca*ca),E=vadd(S,vadd(vmul(u,L1*ca),vmul(v,L1*sa))),Tc=vadd(S,vmul(u,d));
 const dU=fromTo(vnorm(vsub(K,S)),vnorm(vsub(E,S))),GU=r3m(dU,GR[U]);
 const s1=r3v(dU,vnorm(vsub(A,K))),dL=fromTo(vnorm(s1),vnorm(vsub(Tc,E))),GL=r3m(dL,r3m(dU,GR[Lo]));
 SK.R[U]=r3m(r3t(GR[SK.par[U]]),GU);SK.R[Lo]=r3m(r3t(GU),GL);return GL}
function footIK(dt){const H=HB,k=dt>0?Math.min(1,dt*14):1;
 const want=FIK.on&&!P.air&&FIK_ST.has(P.st)&&P.rag.ang<.02&&depthAt(P.x,P.z)<.35;
 const tgt={L:0,R:0,aL:[0,0],aR:[0,0]};
 if(want)for(const s of['L','R']){const side=s==='L'?'left':'right',a=SK.GP[H[side+'Foot']],t=SK.GP[H[side+'Toes']]||a;
  const h=Math.max(fikGround(PM,a),fikGround(PM,t))-P.y;tgt[s]=cl(h,-FIK_MAX,FIK_MAX);tgt['a'+s]=fikSlope(PM,a)}
 for(const s of['L','R']){FIK[s]+=(tgt[s]-FIK[s])*k;const a=FIK['a'+s],b=tgt['a'+s];a[0]+=(b[0]-a[0])*k;a[1]+=(b[1]-a[1])*k}
 const pel=Math.min(0,FIK.L,FIK.R);FIK.pel=pel;
 if(Math.abs(FIK.L)<.002&&Math.abs(FIK.R)<.002&&Math.abs(FIK.aL[0])+Math.abs(FIK.aL[1])+Math.abs(FIK.aR[0])+Math.abs(FIK.aR[1])<.004)return;
 SK.root=[SK.root[0],SK.root[1]+pel,SK.root[2]];skUpdate();
 const keep={};for(const s of['L','R'])keep[s]=SK.GR[H[(s==='L'?'left':'right')+'Foot']];
 for(const s of['L','R']){const side=s==='L'?'left':'right',F=H[side+'Foot'],a=SK.GP[F],up=FIK[s]-pel;
  const GL=up>.002?legIK(side,[a[0],a[1]+up,a[2]]):SK.GR[H[side+'LowerLeg']];
  // keep the pose's foot attitude, then tilt it onto the slope (model space)
  const sl=FIK['a'+s],G=r3m(r3m(rZ(sl[1]),rX(sl[0])),keep[s]);SK.R[F]=r3m(r3t(GL),G)}
 skUpdate();FIK.last={L:FIK.L,R:FIK.R,pel}}
// lean into turns and accelerations while moving (called from poseTarget for the 'move' state)
function leanPose(q,mv){const dt=GT.dt;if(dt>0){const tr=angd(P.yaw,P.lyaw===undefined?P.yaw:P.lyaw)/dt;P.lyaw=P.yaw;P.turn=lp(P.turn||0,cl(tr,-7,7),Math.min(1,dt*8));
  const ac=(P.spd-(P.lspd===undefined?P.spd:P.lspd))/dt;P.lspd=P.spd;P.acc=lp(P.acc||0,cl(ac,-25,25),Math.min(1,dt*6))}
 if(P.st!=='move'||P.crouch)return;const m=cl(mv,0,1);
 q.spZ=cl(-(P.turn||0)*.045*m,-.24,.24);q.chY+=cl((P.turn||0)*.03*m,-.12,.12);q.hdY+=cl((P.turn||0)*.05,-.25,.25);// head leads the turn
 q.spX+=cl((P.acc||0)*.012,-.1,.16);q.pel+=cl((P.acc||0)*.006,-.05,.08)}
