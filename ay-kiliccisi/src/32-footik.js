// ===================== Kael: terrain foot IK (feet planted on slopes, steps and rocks) =====================
// The pose system animates the legs on flat ground. After the pose is applied and the world matrix is known,
// each ankle is measured against the real terrain under it: the pelvis drops to the lower foot, the other leg
// bends more (two-bone IK, knee keeps the animation's bend direction) and the sole tilts to the slope.
// Offsets are smoothed so steps never pop; the whole thing fades out in the air, while lying, rolling or swimming.
const FIK={L:0,R:0,pel:0,w:0,tL:R3I,tR:R3I,on:1,maxOff:.42,maxTilt:.5};
// generic two-bone IK in model space (used by the legs; armIK keeps its own grip logic)
function limbIK(U,Lo,Hd,target,pole){const B=PLD.bones,S=SK.GP[U],L1=Math.hypot(...vsub(B[Lo].r,B[U].r)),L2=Math.hypot(...vsub(B[Hd].r,B[Lo].r));
 const st=vsub(target,S),d=cl(Math.hypot(...st),.05,L1+L2-.002),u=vnorm(st),pv=vsub(pole,vmul(u,vdot(pole,u))),v=vnorm(Math.hypot(...pv)>1e-4?pv:[0,0,1]);
 const ca=cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1),sa=Math.sqrt(1-ca*ca),E=vadd(S,vadd(vmul(u,L1*ca),vmul(v,L1*sa)));
 const PG=SK.GR[SK.par[U]],Gu0=SK.GR[U],Gu=r3m(fromTo(vnorm(r3v(Gu0,vnorm(vsub(B[Lo].r,B[U].r)))),vnorm(vsub(E,S))),Gu0);
 const Gl0=r3m(Gu,SK.R[Lo]),Gl=r3m(fromTo(vnorm(r3v(Gl0,vnorm(vsub(B[Hd].r,B[Lo].r)))),vnorm(vsub(vadd(S,vmul(u,d)),E))),Gl0);
 SK.R[U]=r3m(r3t(PG),Gu);SK.R[Lo]=r3m(r3t(Gu),Gl)}
// terrain normal (world) by central differences
function terrNormal(x,z){const e=.25;return vnorm([hAt(x-e,z)-hAt(x+e,z),2*e,hAt(x,z-e)-hAt(x,z+e)])}
// world -> model direction for a yaw-only matrix (column-major, uniform scale PSC)
const m2l=(M,v)=>[(M[0]*v[0]+M[1]*v[1]+M[2]*v[2])/PSC,(M[4]*v[0]+M[5]*v[1]+M[6]*v[2])/PSC,(M[8]*v[0]+M[9]*v[1]+M[10]*v[2])/PSC];
// how much the IK should act this frame (0..1)
function footIKWeight(){if(!FIK.on||P.air)return 0;const s=P.st;
 if(s==='down'||s==='dead'||s==='getup'||s==='dodge'||s==='td'||s==='jump'||P.pinBy||(P.rag&&P.rag.ang>.02))return 0;
 if(typeof waterAt==='function'&&waterAt(P.x,P.z)-1.25>hAt(P.x,P.z)+.02)return 0; // swimming: body held by the water, not the ground
 return 1}
// M: player world matrix (yaw only at this point). Returns the pelvis drop (<=0) to add to M[13].
function footIK(M,dt){const H=HB,k=dt>0?1-Math.exp(-dt*14):1,wT=footIKWeight();FIK.w+=(wT-FIK.w)*(dt>0?1-Math.exp(-dt*8):1);
 const base=M[13],side=[['left','L'],['right','R']],info={};
 for(const[S,K]of side){const a=mpt(M,SK.GP[H[S+'Foot']]),g=hAt(a[0],a[2]);info[K]={off:cl(g-base,-FIK.maxOff,FIK.maxOff),x:a[0],z:a[2],h:SK.GP[H[S+'Foot']][1]-SK.root[1]}}
 // a foot high in its swing (ankle well above its rest height) follows the terrain only partly
 const rest=PLD.bones[H.leftFoot].r[1];for(const K of['L','R']){const f=info[K],lift=f.h-rest;f.plant=1-sst(.06,.3,lift);f.off*=lp(.6,1,f.plant)}
 const pelT=Math.min(0,info.L.off,info.R.off);
 FIK.pel+=(pelT-FIK.pel)*k;FIK.L+=(info.L.off-FIK.L)*k;FIK.R+=(info.R.off-FIK.R)*k;
 const W=FIK.w;if(W<.002)return 0;
 for(const[S,K]of side){const U=H[S+'UpperLeg'],Lo=H[S+'LowerLeg'],Ft=H[S+'Foot'],f=info[K];
  const lift=(FIK[K]-FIK.pel)*W;
  // keep the foot's world orientation from the animation, then tilt it to the slope (only when planted)
  const G0=SK.GR[Ft];
  if(Math.abs(lift)>.002){const A=SK.GP[Ft],tgt=[A[0],A[1]+lift,A[2]],pole=vadd(vsub(SK.GP[Lo],vmul(vadd(SK.GP[U],A),.5)),[0,0,.12]);limbIK(U,Lo,Ft,tgt,pole);skUpdate()}
  const n=m2l(M,terrNormal(f.x,f.z)),ang=Math.acos(cl(n[1],-1,1)),lim=Math.min(ang,FIK.maxTilt)*f.plant*W;
  const tilt=ang>1e-3?axisAng(vnorm(vcross([0,1,0],n)),lim):R3I;FIK['t'+K]=tilt;
  SK.R[Ft]=r3m(r3t(SK.GR[Lo]),r3m(tilt,G0))}
 skUpdate();return FIK.pel*W}
