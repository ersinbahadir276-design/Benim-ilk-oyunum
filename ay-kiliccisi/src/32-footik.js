// ===================== hero: ground-adaptive feet (foot IK) =====================
// Runs after applyPose + playerMatrix. Every authored pose assumes flat ground at the hero's centre; on slopes,
// steps and rocks one foot floated and the other sank. Here each foot is moved by the terrain height difference
// under it, the pelvis drops so the downhill leg can reach, the knee bends with two-bone IK (keeping the knee
// direction the animation gave it) and the sole tilts to the terrain normal. Offsets are smoothed and fade out
// in the air, in water, while rolling, lying or in takedowns, so authored poses stay untouched there.
const FIK={pel:0,l:0,r:0,w:0,nl:[0,1,0],nr:[0,1,0],on:true,
 // states in which both feet are on the ground and the IK may act
 ok:{move:1,land:1,attack:1,charge:1,heavy:1,runatk:1,block:1,parry:1,gbreak:1,exec:1,assn:1,shoot:1,drink:1,hurt:1,skill:1}};
const FIK_MAXUP=.45,FIK_MAXDN=.42,FIK_ANKLE=.095;
// terrain normal from central differences of the height field (world space)
function groundN(x,z){const e=.25,dx=hAt(x+e,z)-hAt(x-e,z),dz=hAt(x,z+e)-hAt(x,z-e);return vnorm([-dx,2*e,-dz])}
// generic two-bone IK in model space (U->Lo->Hd), bend plane given by `pole` (a direction from the root-target line)
function twoBoneIK(U,Lo,Hd,target,pole){const B=PLD.bones,S=SK.GP[U],L1=Math.hypot(...vsub(B[Lo].r,B[U].r)),L2=Math.hypot(...vsub(B[Hd].r,B[Lo].r));
 const st=vsub(target,S),d=cl(Math.hypot(...st),.05,L1+L2-.002),u=vnorm(st),pv=vsub(pole,vmul(u,vdot(pole,u))),v=vnorm(Math.hypot(...pv)>1e-4?pv:[0,0,1]);
 const ca=cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1),sa=Math.sqrt(1-ca*ca),E=vadd(S,vadd(vmul(u,L1*ca),vmul(v,L1*sa)));
 const PG=SK.GR[SK.par[U]],Gu0=SK.GR[U],Gl0=SK.GR[Lo];
 // rotate the current (animated) upper bone so its bone vector hits E, then the lower bone so it hits the target
 const cu=vnorm(r3v(Gu0,vsub(B[Lo].r,B[U].r))),Gu=r3m(fromTo(cu,vnorm(vsub(E,S))),Gu0);
 const cl0=vnorm(r3v(r3m(Gu,r3m(r3t(Gu0),Gl0)),vsub(B[Hd].r,B[Lo].r))),Glp=r3m(Gu,r3m(r3t(Gu0),Gl0)),Gl=r3m(fromTo(cl0,vnorm(vsub(vadd(S,vmul(u,d)),E))),Glp);
 SK.R[U]=r3m(r3t(PG),Gu);SK.R[Lo]=r3m(r3t(Gu),Gl)}
// model-space vector of a world-space direction (M = yaw * PSC, no shear)
const toModelDir=(M,w)=>vnorm([M[0]*w[0]+M[1]*w[1]+M[2]*w[2],M[4]*w[0]+M[5]*w[1]+M[6]*w[2],M[8]*w[0]+M[9]*w[1]+M[10]*w[2]]);
function footIK(M,dt){const H=HB,k=Math.min(1,(dt||0)*14),kf=1;
 const wet=waterAt(P.x,P.z)-1.25>hAt(P.x,P.z),act=FIK.on&&!P.air&&!wet&&FIK.ok[P.st]&&P.rag.ang<.02&&!(P.st==='skill'&&P.air);
 FIK.w+=((act?1:0)-FIK.w)*Math.min(1,(dt||0)*10);
 const side=(S,key)=>{const f=H[S+'Foot'],w=mpt(M,SK.GP[f]);let d=cl(hAt(w[0],w[2])-P.y,-FIK_MAXDN,FIK_MAXUP);if(!act)d=0;FIK[key]+=(d-FIK[key])*(d>FIK[key]?kf:k*1.6);
  const n=act?toModelDir(M,groundN(w[0],w[2])):[0,1,0],nk='n'+key[0];FIK[nk]=vnorm(vadd(FIK[nk],vmul(vsub(n,FIK[nk]),k)));return FIK[key]};
 const dl=side('left','l'),dr=side('right','r');
 FIK.pel+=(Math.min(0,dl,dr)-FIK.pel)*k;
 if(FIK.w<.003&&Math.abs(FIK.pel)<1e-3&&Math.abs(dl)<1e-3&&Math.abs(dr)<1e-3)return;
 const W=FIK.w;SK.root=[SK.root[0],SK.root[1]+FIK.pel*W,SK.root[2]];skUpdate();
 for(const[S,d,n]of[['left',dl,FIK.nl],['right',dr,FIK.nr]]){const U=H[S+'UpperLeg'],Lo=H[S+'LowerLeg'],F=H[S+'Foot'];
  const G0=SK.GR[F],a=SK.GP[F],need=(d-FIK.pel)*W;
  if(Math.abs(need)>1e-4){const mid=vmul(vadd(SK.GP[U],a),.5),pole=vsub(SK.GP[Lo],mid);
   twoBoneIK(U,Lo,F,[a[0],a[1]+need,a[2]],Math.hypot(...pole)>1e-3?pole:[0,0,1]);skUpdate()}
  // sole follows the slope (limited tilt), on top of the animated foot angle
  const nn=vnorm(vadd([0,1,0],vmul(vsub(n,[0,1,0]),W))),tilt=Math.acos(cl(nn[1],-1,1));
  const nc=tilt>.5?vnorm(vadd([0,1,0],vmul(vsub(nn,[0,1,0]),.5/tilt))):nn,Gf=r3m(fromTo([0,1,0],nc),G0);
  SK.R[F]=r3m(r3t(SK.GR[Lo]),Gf)}
 skUpdate()}
// sole height above the terrain, world space (used by tests and debugging)
function footClear(M){const o={};for(const S of['left','right']){const w=mpt(M,SK.GP[HB[S+'Foot']]);o[S]=w[1]-FIK_ANKLE-hAt(w[0],w[2])}return o}
