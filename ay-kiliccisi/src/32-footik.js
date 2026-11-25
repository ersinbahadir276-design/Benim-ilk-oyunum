// ===================== foot IK: feet planted on uneven ground =====================
// Runs after applyPose + playerMatrix. Each ankle is moved by the terrain height under it (relative to the body
// centre), the pelvis drops to the lower foot so the downhill leg can reach, a two-bone leg IK bends the knee
// towards the front, and planted soles tilt to follow the slope. Off in the air, lying, rolling, swimming.
const FIK={on:1,w:0,off:0,dbg:null,lock:1,lockW:[0,0],anc:[null,null],held:[0,0],pw:[null,null],v:[0,0],clr:[0,0],cpi:[0,0],dl:[[0,0],[0,0]]};
// stride foot locking: while walking/running, a foot that touches down is pinned to its world spot until the
// animation lifts it again (or the leg would have to stretch too far), so the sole does not skate over the ground.
// A foot that reaches the ground while still sweeping forward fast is finishing its swing: it gets a little clearance
// and is pinned only once it has slowed down (vSlow), so it never skates on touchdown.
// Contact point: the ankle or the toe joint, whichever is nearer its rest height. The motion clips plant on the heel,
// roll over the sole and push off from the toes (heel already up), so an ankle-only test never saw a planted clip foot.
// When the contact moves from heel to toe the anchor is handed over where the toe is drawn, so nothing jumps.
const FLOCK={on:.03,off:.075,drift:.34,up:30,down:14,vSlow:1.2,vFast:3.5,lift:.045};
function fikLockable(){return FIK.lock&&P.st==='move'&&!P.air&&P.spd>.3&&!P.td&&!P.pinBy}
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
 if(FIK.w<.01){FIK.w=Math.max(0,FIK.w);FIK.off*=1-k;FIK.dbg=null;FIK.lockW=[0,0];FIK.anc=[null,null];FIK.held=[0,0];FIK.pw=[null,null];FIK.clr=[0,0];FIK.cpi=[0,0];return}
 const w=FIK.w,legs=[];
 for(const S of['left','right']){const f=H[S+'Foot'],a=SK.GP[f],wp=mpt(M,a),g=hAt(wp[0],wp[2]);
  // swing height = how far the animation lifted this ankle above its rest height (no tilt mid-swing)
  const lift=Math.max(0,a[1]-B[f].r[1]),t=H[S+'Toes'],ct=SK.GP[t][1]-B[t].r[1],ti=ct<a[1]-B[f].r[1]?1:0,wt=mpt(M,SK.GP[t]);
  legs.push({S,f,a:a.slice(),wp,wt,ti,cp:ti?wt:wp,c:Math.max(0,Math.min(lift,ct)),d:cl(g-P.y,-.45,.45),lift})}
 const can=fikLockable()&&w>.5;
 legs.forEach((L,i)=>{let A=FIK.anc[i];const pw=FIK.pw[i];
  // heel <-> toe hand-over while anchored: the new point is anchored where it is shown now (FK + current pin offset)
  if(A&&FIK.cpi[i]!==L.ti){const D=FIK.dl[i];A=FIK.anc[i]=[L.cp[0]+D[0],L.cp[1],L.cp[2]+D[1]]}FIK.cpi[i]=L.ti;
  const pp=pw&&(L.ti?pw.t:pw.a);FIK.v[i]=pp&&dt?Math.hypot(L.cp[0]-pp[0],L.cp[2]-pp[2])/dt:0;FIK.pw[i]={a:L.wp,t:L.wt};
  const sweep=can&&!FIK.held[i]?sst(FLOCK.vSlow,FLOCK.vFast,FIK.v[i])*(1-sst(.03,.08,L.c)):0;FIK.clr[i]=Math.max(sweep,FIK.clr[i]*(1-(dt?Math.min(1,dt*20):1)));L.clr=FIK.clr[i]*FLOCK.lift*(1+cl((FIK.v[i]-FLOCK.vFast)/8,0,1.5));
  if(A&&(!can||L.c>FLOCK.off||Math.hypot(L.cp[0]-A[0],L.cp[2]-A[2])>FLOCK.drift))FIK.held[i]=0;
  if(!FIK.held[i]&&can&&L.c<FLOCK.on&&FIK.v[i]<FLOCK.vSlow){
   // pin where the foot is shown right now (FK blended with a fading old anchor), so re-planting never pops
   const lw=A?FIK.lockW[i]:0;FIK.anc[i]=A=A?[lp(L.cp[0],A[0],lw),L.cp[1],lp(L.cp[2],A[2],lw)]:[L.cp[0],L.cp[1],L.cp[2]];FIK.held[i]=1}
  const tgt=FIK.held[i]?1:0;FIK.lockW[i]+=(tgt-FIK.lockW[i])*(dt?Math.min(1,dt*(tgt?FLOCK.up:FLOCK.down)):1);
  if(FIK.lockW[i]<.01){FIK.lockW[i]=0;if(!FIK.held[i])FIK.anc[i]=null}
  // pin offset (world xz) of the contact point; the ankle target is shifted by it (the sole keeps its orientation, so the
  // contact point lands on the anchor)
  if(FIK.anc[i]&&FIK.lockW[i]>0){const D=FIK.dl[i]=[A[0]-L.cp[0],A[2]-L.cp[2]],q=fikToModel(M,[D[0],0,D[1]]);L.lk=[q[0],q[2],FIK.lockW[i]]}});
 // pelvis offset: drop to the lower foot (never lift much: the body centre already stands on the ground)
 const want=cl(Math.min(legs[0].d,legs[1].d),-.4,.06)*w;FIK.off+=(want-FIK.off)*(dt?Math.min(1,dt*16):1);
 SK.root=vadd(SK.root,[0,FIK.off,0]);skUpdate();
 for(const L of legs){const U=H[L.S+'UpperLeg'],Lo=H[L.S+'LowerLeg'],f=L.f;
  const T=[SK.GP[f][0],L.a[1]+L.d*w+(L.clr||0),SK.GP[f][2]];
  if(L.lk){T[0]+=L.lk[0]*L.lk[2];T[2]+=L.lk[1]*L.lk[2]}
  const Gf0=SK.GR[f].slice();
  if(Math.abs(T[1]-SK.GP[f][1])+Math.abs(T[0]-SK.GP[f][0])+Math.abs(T[2]-SK.GP[f][2])>1e-4){const hip=SK.GP[U],kn=SK.GP[Lo],mid=vmul(vadd(hip,T),.5);
   limbIK(U,Lo,T,vadd([0,0,.3],vmul(vsub(kn,mid),4)),1);skUpdate()}
  // sole: keep the pre-IK foot orientation (applyPose keeps it level), then tilt it with the ground under it
  const n=fikToModel(M,fikNormal(L.wp[0],L.wp[2])),plant=w*(1-sst(.03,.14,L.lift));
  let tn=vnorm(vadd([0,1,0],vmul(vsub(n,[0,1,0]),plant)));const ang=Math.acos(cl(tn[1],-1,1));
  if(ang>.4){const h=Math.hypot(tn[0],tn[2]);tn=[tn[0]/h*Math.sin(.4),Math.cos(.4),tn[2]/h*Math.sin(.4)]}
  SK.R[f]=r3m(r3t(SK.GR[Lo]),r3m(fromTo([0,1,0],tn),Gf0));skUpdate();
  L.err=SK.GP[f][1]-T[1]}
 FIK.dbg=legs}
