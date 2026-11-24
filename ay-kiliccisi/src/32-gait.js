// ===================== Kael's locomotion: keyframed gait cycles + terrain foot IK =====================
// The old cycle was one sine for every joint (legs swung like pendulums, feet slid, both feet floated or sank on slopes).
// Here each gait is an authored key-pose table over one stride (u = 0..1, left heel strike at 0, right at .5):
// contact → loading → mid-stance → terminal stance → toe-off → swing → reach. Keys are joined with a periodic
// Catmull-Rom spline so velocities are continuous. After the pose, a two-bone leg IK plants the feet on the real
// terrain (hips drop to the lower foot, the upper knee bends) and tilts each foot to the slope.
// Signs: thigh flex f>0 = leg forward (q.LthX = -f), knee k>0 = shin back, foot a>0 = toes down.
const GAIT={
 // u, thigh flex, knee, foot pitch
 walk:{k:[[0,.42,.05,-.22],[.1,.36,.3,.02],[.25,.08,.14,0],[.42,-.22,.1,.02],[.56,-.3,.5,.38],[.7,-.02,1.02,.12],[.84,.34,.66,-.05],[.94,.46,.12,-.2]],
  pel:.03,lean:.04,bob:.018,sway:.035,twist:.1,arm:.62,el:[.35,.6],hd:.03},
 jog:{k:[[0,.5,.22,-.18],[.12,.18,.62,.05],[.3,-.38,.3,.32],[.44,-.24,1.12,.25],[.6,.26,1.72,0],[.76,.72,1.2,-.1],[.9,.64,.42,-.2]],
  pel:.06,lean:.1,bob:.035,sway:.025,twist:.16,arm:.8,el:[.75,1.1],hd:.05},
 sprint:{k:[[0,.58,.28,-.12],[.11,.2,.7,.05],[.28,-.5,.35,.45],[.42,-.3,1.4,.3],[.58,.35,2.0,.05],[.74,.95,1.45,-.1],[.89,.8,.5,-.15]],
  pel:.12,lean:.2,bob:.05,sway:.018,twist:.2,arm:1.0,el:[1.05,1.35],hd:.07}};
// periodic Catmull-Rom over key table column c
function gaitS(G,u,c){const K=G.k,n=K.length;u-=Math.floor(u);let i=n-1;for(let j=0;j<n;j++)if(K[j][0]>u){i=j-1;break}if(i<0)i=n-1;
 const at=j=>K[((j%n)+n)%n],u0=K[i][0],u1=i+1<n?K[i+1][0]:1,t=(u-u0+(u<u0?1:0))/(u1-u0),p0=at(i-1)[c],p1=at(i)[c],p2=at(i+1)[c],p3=at(i+2)[c],t2=t*t,t3=t2*t;
 return .5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3)}
// one gait's pose terms at stride phase u (left leg at u, right leg half a stride later)
function gaitTerms(G,u){const fL=gaitS(G,u,1),fR=gaitS(G,u+.5,1),c2=Math.cos(4*PI*u),s1=Math.sin(2*PI*u);
 return{LthX:-fL,RthX:-fR,Lkn:gaitS(G,u,2),Rkn:gaitS(G,u+.5,2),Lft:gaitS(G,u,3),Rft:gaitS(G,u+.5,3),
  // arms counter-swing with the opposite leg, trailing a little; the elbow bends more on the back swing
  LaX:gaitS(G,u-.04,1)*G.arm*.8,RaX:-.3+gaitS(G,u+.46,1)*G.arm*.45,Lel:G.el[0]+Math.max(0,gaitS(G,u-.04,1))*.35,Rel:G.el[1]*.7+.2,
  pel:G.pel,spX:G.lean,hipY:-G.bob*(.5+.5*c2),pelZ:G.sway*s1,spZ:-G.sway*.6*s1,spY:-G.twist*.5*s1,chY:G.twist*s1,hdX:G.hd*c2*.5,hdY:-G.twist*.35*s1}}
// heroGait: blended gait for the move state: walk → jog by speed, sprint on top
function heroGait(q,spd,sprint){const u=P.ph/(2*PI),wj=sst(1.4,3.3,spd),ws=sprint?sst(4.2,6,spd):0,mv=cl(spd/1.2,0,1);
 const A=gaitTerms(GAIT.walk,u),B=gaitTerms(GAIT.jog,u),C=gaitTerms(GAIT.sprint,u);
 for(const n in A){const v=lp(lp(A[n],B[n],wj),C[n],ws);q[n]=lp(q[n]||0,v,mv)}}
// idle: breathing, a slow weight shift from foot to foot, a glance around, a tired heave when stamina is low
function heroIdle(q,t){const br=Math.sin(t*1.7),ws=Math.sin(t*.42)*.8+Math.sin(t*.17)*.2,tired=P.exhausted||P.sta<25?1:0;
 q.chX=br*(.022+tired*.03)-tired*.08;q.spX=.02+tired*.12;q.hdX=tired*.12+br*.01;q.hdY=Math.sin(t*.5)*.14+Math.sin(t*1.3)*.03;
 q.pelZ=ws*.045;q.LthZ=.04-ws*.045;q.RthZ=-.04-ws*.045;q.spZ=-ws*.03;q.LaX=.05+br*.02;q.LaZ=1.22-br*.015;q.RaZ=1.12-br*.012;
 q.Lkn=.04+Math.max(0,-ws)*.1;q.Rkn=.04+Math.max(0,ws)*.1}
// ---------- terrain foot IK (model space; the model matrix is yaw + translation, PSC = 1)
const FIK={w:0,drop:0,lift:[0,0]};
function legIK(side,T,pole){const H=HB,U=H[side+'UpperLeg'],Lo=H[side+'LowerLeg'],Ft=H[side+'Foot'],B=PLD.bones;
 const S=SK.GP[U],L1=SK.L1,L2=SK.L2,st=vsub(T,S),d=cl(Math.hypot(...st),.05,L1+L2-.001),u=vnorm(st),pv=vsub(pole,vmul(u,vdot(pole,u))),v=vnorm(Math.hypot(...pv)>1e-4?pv:[0,0,1]);
 const ca=cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1),sa=Math.sqrt(1-ca*ca),E=vadd(S,vadd(vmul(u,L1*ca),vmul(v,L1*sa)));
 const PG=SK.GR[SK.par[U]],gu=SK.GR[U],r1=r3v(gu,vnorm(vsub(B[Lo].r,B[U].r))),Gu=r3m(fromTo(r1,vnorm(vsub(E,S))),gu);
 const gl=r3m(Gu,SK.R[Lo]),r2=r3v(gl,vnorm(vsub(B[Ft].r,B[Lo].r))),Gl=r3m(fromTo(r2,vnorm(vsub(vadd(S,vmul(u,d)),E))),gl);
 SK.R[U]=r3m(r3t(PG),Gu);SK.R[Lo]=r3m(r3t(Gu),Gl);return Gl}
function footIK(dt){if(FIK.off){FIK.w=0;FIK.drop=0;return}const H=HB,on=!P.air&&P.st!=='td'&&P.st!=='dodge'&&P.st!=='jump'&&P.st!=='jumpatk'&&P.st!=='down'&&P.st!=='dead'&&P.st!=='getup'&&P.rag.ang<.05&&Math.abs(P.y-hAt(P.x,P.z))<.05;
 FIK.w+=((on?1:0)-FIK.w)*Math.min(1,(dt||0)*10);if(!dt)FIK.w=on?1:0;if(FIK.w<.01){FIK.drop=0;return}
 const M=mtrs([P.x,P.y,P.z],[0,P.yaw,0]),o=mpt(M,[0,0,0]),ex=vsub(mpt(M,[1,0,0]),o),ez=vsub(mpt(M,[0,0,1]),o),aH=PLD.bones[H.leftFoot].r[1];
 const sides=['left','right'],F=sides.map(s=>SK.GP[H[s+'Foot']]),lo=Math.min(F[0][1],F[1][1]),moving=P.st==='move'&&P.spd>.3;
 const info=F.map((f,i)=>{const w=mpt(M,f),g=hAt(w[0],w[2])-P.y,e=.18,hx=(hAt(w[0]+ex[0]*e,w[2]+ex[2]*e)-hAt(w[0]-ex[0]*e,w[2]-ex[2]*e))/(2*e),hz=(hAt(w[0]+ez[0]*e,w[2]+ez[2]*e)-hAt(w[0]-ez[0]*e,w[2]-ez[2]*e))/(2*e);
  // swing height above the planted foot; small differences count as planted (soft knee, not a hovering foot)
  let lift=f[1]-lo;lift=lift<.04?lift*lift/.08:lift-.02;if(!moving&&P.st==='move')lift=0;
  const tgtY=g+aH+lift;return{f,g,n:vnorm([-hx,1,-hz]),d:cl(tgtY-f[1],-.35,.35)}});
 // the body drops so the lower foot reaches its ground; smoothed so steps up and down don't jolt
 const want=Math.min(0,info[0].d,info[1].d);FIK.drop+=(want-FIK.drop)*Math.min(1,(dt||1)*14);const drop=Math.max(FIK.drop,-.35)*FIK.w;
 if(Math.abs(drop)<1e-4&&Math.abs(info[0].d)<1e-3&&Math.abs(info[1].d)<1e-3)return;
 const Gf0=sides.map(s=>SK.GR[H[s+'Foot']]);SK.root=vadd(SK.root,[0,drop,0]);skUpdate();
 sides.forEach((s,i)=>{const I=info[i],cur=SK.GP[H[s+'Foot']],T=[cur[0],lp(cur[1],I.f[1]+I.d,FIK.w),cur[2]];
  const pole=vadd(vsub(SK.GP[H[s+'LowerLeg']],SK.GP[H[s+'UpperLeg']]),[0,0,.15]),Gl=legIK(s,T,pole);
  // keep the animated heel/toe pitch, then tilt it onto the slope (limited to ~25°)
  let n=I.n;const tilt=Math.acos(cl(n[1],-1,1));if(tilt>.44){const k=.44/tilt;n=vnorm([n[0]*k,1,n[2]*k])}
  const Gd=r3m(fromTo([0,1,0],vnorm(vadd(vmul(n,FIK.w),[0,1-FIK.w,0]))),Gf0[i]);SK.R[H[s+'Foot']]=r3m(r3t(Gl),Gd)});
 skUpdate()}
