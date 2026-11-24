// ===================== secondary motion: cape dynamics + terrain foot IK =====================
// The cape hangs on three bones (CapeA -> CapeB -> CapeC, built in heroBuild). Each joint is a damped spring
// whose target comes from gravity (the cape stays off the back when he leans), forward speed (it flares),
// vertical speed (it lifts while falling), turning and side-stepping (it swings) and legs kicking back into it.
// The lower joints are softer and are pushed by the upper joint's angular velocity, so the hem whips and lags.
// Foot IK: on slopes each foot is lifted to the ground under it with a two-bone leg IK, the hips drop to reach
// the lower foot and the soles tilt to the slope. Weight fades out in the air, while lying, rolling or swimming.
const CAPE={a:.04,av:0,b:0,bv:0,c:0,cv:0,s:0,sv:0,px:null,pz:0,yaw:0};
const FIK={l:0,r:0,pl:0,pr:0,w:0,base:0,px:null,pz:0};
// damped spring, sub-stepped so a long frame cannot explode it
function spr(o,x,v,t,k,d,dt){const n=Math.max(1,Math.ceil(dt/.008)),h=dt/n;let X=o[x],V=o[v];for(let i=0;i<n;i++){V+=((t-X)*k-V*d)*h;X+=V*h}o[x]=X;o[v]=V}
function capeStep(dt,q){if(!(dt>0)||HB.capeA===undefined)return;const C=CAPE;
 if(C.px===null||Math.hypot(P.x-C.px,P.z-C.pz)>3){C.px=P.x;C.pz=P.z;C.yaw=P.yaw}
 const vx=(P.x-C.px)/dt,vz=(P.z-C.pz)/dt,sy=Math.sin(P.yaw),cy=Math.cos(P.yaw),vf=vx*sy+vz*cy,vl=vx*cy-vz*sy,w=angd(P.yaw,C.yaw)/dt;C.px=P.x;C.pz=P.z;C.yaw=P.yaw;
 const lean=(q.pel||0)+(q.spX||0)+(q.chX||0),legBack=Math.max(0,Math.max(q.LthX||0,q.RthX||0)-(q.spX||0)-(q.chX||0)*.5);
 const fall=P.air?cl(-P.vy*.06,-.25,.55):0,sp=Math.hypot(vx,vz),f=cl(sp/6,0,1),t=GT.time;
 const aT=cl(Math.max(.04,-lean)+.07*Math.max(0,vf)+fall+legBack*.45,-.05,.9);
 spr(C,'a','av',aT,70,10,dt);
 spr(C,'b','bv',aT*.25+Math.sin(t*10.3+P.x)*.07*f-C.av*.06,38,5.5,dt);
 spr(C,'c','cv',aT*.2+Math.sin(t*13.7+1.3)*.1*f-C.bv*.06,26,4,dt);
 spr(C,'s','sv',cl(-vl*.07+w*.09,-.55,.55)+Math.sin(t*7.1)*.04*f,40,7,dt);
 C.a=cl(C.a,-.1,1.4);C.b=cl(C.b,-.4,.9);C.c=cl(C.c,-.5,.9);C.s=cl(C.s,-.6,.6)}
// ground under each foot, measured from last frame's skeleton; offsets are relative to the root height P.y
const FIK_OFF={air:1,jump:1,jumpatk:1,down:1,dead:1,getup:1,dodge:1,td:1};
function footStep(dt){if(!(dt>0))return;const F=FIK,H=HB;
 if(F.px===null||Math.hypot(P.x-F.px,P.z-F.pz)>3){F.l=F.r=F.pl=F.pr=0;F.w=0}F.px=P.x;F.pz=P.z;
 const on=!P.air&&!FIK_OFF[P.st]&&P.rag.ang<.05&&Math.abs(P.y-hAt(P.x,P.z))<.05;
 const M=mtrs([P.x,P.y,P.z],[0,P.yaw,0]),fx=Math.sin(P.yaw)*.12,fz=Math.cos(P.yaw)*.12,k=Math.min(1,dt*14);
 for(const[S,o,p]of[['left','l','pl'],['right','r','pr']]){const wp=mpt(M,SK.GP[H[S+'Foot']]),g=cl(hAt(wp[0],wp[2])-P.y,-.35,.35),sl=(hAt(wp[0]+fx,wp[2]+fz)-hAt(wp[0]-fx,wp[2]-fz))/.24;
  F[o]+=((on?g:0)-F[o])*k;F[p]+=((on?-Math.atan(sl):0)-F[p])*k}
 F.w+=((on?1-.45*cl(P.spd/6,0,1):0)-F.w)*Math.min(1,dt*8)}
// two-bone leg IK in model space (hip -> knee -> ankle), knee bends forward (+z)
function legIK(side,dy,pitch){const H=HB,U=H[side+'UpperLeg'],Lo=H[side+'LowerLeg'],Ft=H[side+'Foot'],B=PLD.bones,keep=SK.GR[Ft].slice();
 if(dy>.004){const S=SK.GP[U],L1=SK.L1,L2=SK.L2,T=vadd(SK.GP[Ft],[0,dy,0]);
  const st=vsub(T,S),d=cl(Math.hypot(...st),.05,L1+L2-.002),u=vnorm(st),kn=vsub(SK.GP[Lo],vadd(S,vmul(u,vdot(vsub(SK.GP[Lo],S),u))));
  const pole=Math.hypot(...kn)>.01?kn:[0,0,1],pv=vsub(pole,vmul(u,vdot(pole,u))),v=vnorm(Math.hypot(...pv)>1e-4?pv:[0,0,1]);
  const ca=cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1),sa=Math.sqrt(1-ca*ca),E=vadd(S,vadd(vmul(u,L1*ca),vmul(v,L1*sa)));
  const PG=SK.GR[SK.par[U]],Gu=r3m(fromTo(r3v(SK.GR[U],vnorm(vsub(B[Lo].r,B[U].r))),vnorm(vsub(E,S))),SK.GR[U]);
  const Gl0=r3m(Gu,r3t(SK.GR[U])),cur=r3m(Gl0,SK.GR[Lo]),Gl=r3m(fromTo(r3v(cur,vnorm(vsub(B[Ft].r,B[Lo].r))),vnorm(vsub(vadd(S,vmul(u,d)),E))),cur);
  SK.R[U]=r3m(r3t(PG),Gu);SK.R[Lo]=r3m(r3t(Gu),Gl);skUpdate()}
 // sole: keep the walk cycle's toe pitch, add the slope
SK.R[Ft]=r3m(r3t(SK.GR[Lo]),r3m(rX(pitch),keep))}
// hips drop so the lower foot can reach its ground (applied to the root before the skeleton update)
function fikBase(){const F=FIK;return F.w<.01?0:Math.min(0,F.l*F.w,F.r*F.w)}
function feetIK(){const F=FIK;if(F.w<.01)return;const base=fikBase();
 legIK('left',F.l*F.w-base,F.pl*F.w);legIK('right',F.r*F.w-base,F.pr*F.w);skUpdate()}
