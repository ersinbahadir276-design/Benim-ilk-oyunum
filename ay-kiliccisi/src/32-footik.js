// ===================== foot IK: feet planted on uneven ground =====================
// Runs after applyPose + playerMatrix. Each ankle is moved by the terrain height under it (relative to the body
// centre), the pelvis drops to the lower foot so the downhill leg can reach, a two-bone leg IK bends the knee
// towards the front, and planted soles tilt to follow the slope. Off in the air, lying, rolling, swimming.
const FIK={on:1,w:0,off:0,dbg:null};
function fikTarget(){const st=P.st;if(!FIK.on)return 0;
 if(P.air||st==='jump'||st==='down'||st==='dead'||st==='getup'||st==='td'||P.td||P.pinBy)return 0;
 if(st==='dodge'&&(P.spin||P.roll))return 0;
 if(P.rag&&P.rag.ang>.05)return 0;if(P.lift>.002)return 0;
 if(waterAt(P.x,P.z)-1.25>hAt(P.x,P.z)-.05)return 0;// swimming / wading deep
 return 1}
// model-space direction from a world-space one (M is a rigid transform: inverse rotation = transpose)
const fikToModel=(M,v)=>[M[0]*v[0]+M[1]*v[1]+M[2]*v[2],M[4]*v[0]+M[5]*v[1]+M[6]*v[2],M[8]*v[0]+M[9]*v[1]+M[10]*v[2]];
function fikNormal(x,z){const e=.18,hx=(hAt(x+e,z)-hAt(x-e,z))/(2*e),hz=(hAt(x,z+e)-hAt(x,z-e))/(2*e);return vnorm([-hx,1,-hz])}
function footIK(M,dt){const H=HB,B=PLD.bones,k=Math.min(1,(dt||0)*12);
 FIK.w+=(fikTarget()-FIK.w)*(dt?k:1);
 if(FIK.w<.01){FIK.w=Math.max(0,FIK.w);FIK.off*=1-k;FIK.dbg=null;return}
 const w=FIK.w,legs=[];
 for(const S of['left','right']){const f=H[S+'Foot'],a=SK.GP[f],wp=mpt(M,a),g=hAt(wp[0],wp[2]);
  // swing height = how far the animation lifted this ankle above its rest height (no tilt mid-swing)
  const lift=Math.max(0,a[1]-B[f].r[1]);
  legs.push({S,f,a:a.slice(),wp,d:cl(g-P.y,-.45,.45),lift})}
 // pelvis offset: drop to the lower foot (never lift much: the body centre already stands on the ground)
 const want=cl(Math.min(legs[0].d,legs[1].d),-.4,.06)*w;FIK.off+=(want-FIK.off)*(dt?Math.min(1,dt*16):1);
 SK.root=vadd(SK.root,[0,FIK.off,0]);skUpdate();
 for(const L of legs){const U=H[L.S+'UpperLeg'],Lo=H[L.S+'LowerLeg'],f=L.f;
  const T=[SK.GP[f][0],L.a[1]+L.d*w,SK.GP[f][2]];
  const Gf0=SK.GR[f].slice();
  if(Math.abs(T[1]-SK.GP[f][1])>1e-4){const hip=SK.GP[U],kn=SK.GP[Lo],mid=vmul(vadd(hip,T),.5);
   limbIK(U,Lo,T,vadd([0,0,.3],vmul(vsub(kn,mid),4)),1);skUpdate()}
  // sole: keep the pre-IK foot orientation (applyPose keeps it level), then tilt it with the ground under it
  const n=fikToModel(M,fikNormal(L.wp[0],L.wp[2])),plant=w*(1-sst(.03,.14,L.lift));
  let tn=vnorm(vadd([0,1,0],vmul(vsub(n,[0,1,0]),plant)));const ang=Math.acos(cl(tn[1],-1,1));
  if(ang>.4){const h=Math.hypot(tn[0],tn[2]);tn=[tn[0]/h*Math.sin(.4),Math.cos(.4),tn[2]/h*Math.sin(.4)]}
  SK.R[f]=r3m(r3t(SK.GR[Lo]),r3m(fromTo([0,1,0],tn),Gf0));skUpdate();
  L.err=SK.GP[f][1]-T[1]}
 FIK.dbg=legs}
