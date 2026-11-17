// ===================== player model: skeleton, CPU skinning, pose, IK =====================
const SK={},skins=[],pObjs=[],PSC=1.0;let HB;
function skInit(){const B=PLD.bones;SK.n=B.length;SK.par=B.map(b=>b.p);SK.rest=B.map(b=>b.r);SK.loc=B.map(b=>b.p<0?b.r:vsub(b.r,B[b.p].r));SK.R=B.map(()=>R3I);SK.GR=B.map(()=>R3I);SK.GP=B.map(b=>b.r.slice());
 SK.A=new Float32Array(SK.n*12);SK.root=[0,0,0];HB=PLD.hum;SK.L1=Math.hypot(...vsub(B[HB.leftLowerLeg].r,B[HB.leftUpperLeg].r));SK.L2=Math.hypot(...vsub(B[HB.leftFoot].r,B[HB.leftLowerLeg].r))}
function skUpdate(){const{n,par,loc,R,GR,GP,rest,A}=SK;
 for(let i=0;i<n;i++){const p=par[i];if(p<0){GR[i]=R[i];GP[i]=vadd(rest[i],SK.root)}else{GR[i]=r3m(GR[p],R[i]);GP[i]=vadd(GP[p],r3v(GR[p],loc[i]))}
  const g=GR[i],t=vsub(GP[i],r3v(g,rest[i])),o=i*12;A[o]=g[0];A[o+1]=g[1];A[o+2]=g[2];A[o+3]=t[0];A[o+4]=g[3];A[o+5]=g[4];A[o+6]=g[5];A[o+7]=t[1];A[o+8]=g[6];A[o+9]=g[7];A[o+10]=g[8];A[o+11]=t[2]}}
function skinAll(){const A=SK.A;for(const s of skins){const p=s.restP,q=s.restN,J=s.J,W=s.W,P=s.P,N=s.N,nv=s.nv;
 for(let v=0;v<nv;v++){const v3=v*3,v4=v*4,x=p[v3],y=p[v3+1],z=p[v3+2],nx=q[v3],ny=q[v3+1],nz=q[v3+2];let px=0,py=0,pz=0,ax=0,ay=0,az=0;
  for(let k=0;k<4;k++){const w=W[v4+k];if(w===0)continue;const o=J[v4+k]*12,a0=A[o],a1=A[o+1],a2=A[o+2],a4=A[o+4],a5=A[o+5],a6=A[o+6],a8=A[o+8],a9=A[o+9],a10=A[o+10];
   px+=w*(a0*x+a1*y+a2*z+A[o+3]);py+=w*(a4*x+a5*y+a6*z+A[o+7]);pz+=w*(a8*x+a9*y+a10*z+A[o+11]);ax+=w*(a0*nx+a1*ny+a2*nz);ay+=w*(a4*nx+a5*ny+a6*nz);az+=w*(a8*nx+a9*ny+a10*nz)}
  P[v3]=px;P[v3+1]=py;P[v3+2]=pz;N[v3]=ax;N[v3+1]=ay;N[v3+2]=az}
 updGeo(s.geo,P,N)}}
function addSkin(g,J,W,o){const nv=g.P.length/3,s={restP:Float32Array.from(g.P),restN:Float32Array.from(g.N),J,W,nv,P:new Float32Array(nv*3),N:new Float32Array(nv*3)};
 s.geo=geo({P:s.restP,N:s.restN,U:g.U,C:g.C,W:g.W,M:g.M,I:g.I},true);skins.push(s);const ob=obj(s.geo,o);pObjs.push(ob);return ob}
const mix3=(a,b,t)=>[lp(a[0],b[0],t),lp(a[1],b[1],t),lp(a[2],b[2],t)];
let PLD=null;
// the hero: canonical skeleton from the berserk_armor proportions + our own armour mesh (src/31-hero.js)
function buildPlayer(TX){PLD=heroBuild();skInit();
 // fists: the right hand grips the greatsword, the left hand is half-closed (it joins the grip for two-handed moves)
 for(const f of['Index','Middle','Ring','Little'])for(const[seg,a]of[['Proximal',1.1],['Intermediate',1.2],['Distal',.7]]){SK.R[HB['right'+f+seg]]=rZ(a);SK.R[HB['left'+f+seg]]=rZ(-a*.55)}
 SK.R[HB.rightThumbProximal]=r3m(rY(.2),rZ(.45));SK.R[HB.rightThumbIntermediate]=rZ(.6);SK.R[HB.rightThumbDistal]=rZ(.45);
 heroMesh(TX)}
// ---------- pose application (procedural joint angles) + optional arm IK targets
const POSE0={hipY:0,pel:0,spX:0,spY:0,spZ:0,chX:0,chY:0,hdX:0,hdY:0,LthX:0,RthX:0,LthZ:.04,RthZ:-.04,Lkn:0,Rkn:0,LaZ:1.22,LaX:.05,LaY:0,Lel:.25,RaZ:1.12,RaX:-.3,RaY:0,Rel:.55,RwX:0,RwY:0,RwZ:0,LwX:0,LwY:0,two:0,rev:0,choke:0};
function applyPose(q){const R=SK.R,H=HB;
 R[H.hips]=rX(q.pel);R[H.spine]=r3m(rX(q.spX),r3m(rY(q.spY),rZ(q.spZ)));R[H.chest]=r3m(rX(q.chX),rY(q.chY));R[H.neck]=rX(q.hdX*.4);R[H.head]=r3m(rX(q.hdX*.6),rY(q.hdY));
 R[H.leftUpperLeg]=r3m(rX(q.LthX),rZ(q.LthZ));R[H.rightUpperLeg]=r3m(rX(q.RthX),rZ(q.RthZ));R[H.leftLowerLeg]=rX(q.Lkn);R[H.rightLowerLeg]=rX(q.Rkn);
 R[H.leftFoot]=rX(cl(-(q.pel+q.LthX+q.Lkn),-.9,.9));R[H.rightFoot]=rX(cl(-(q.pel+q.RthX+q.Rkn),-.9,.9));
 R[H.leftUpperArm]=r3m(rY(q.LaY),r3m(rX(q.LaX),rZ(-q.LaZ)));R[H.leftLowerArm]=rY(-q.Lel);R[H.leftHand]=r3m(rX(q.LwX),rY(q.LwY));
 R[H.rightUpperArm]=r3m(rY(q.RaY),r3m(rX(q.RaX),rZ(q.RaZ)));R[H.rightLowerArm]=rY(q.Rel);R[H.rightHand]=r3m(rX(q.RwX),r3m(rY(q.RwY),rZ(q.RwZ)));
 const e=(th,kn)=>SK.L1*Math.cos(q.pel+th)+SK.L2*Math.cos(q.pel+th+kn);
 SK.root=[0,-(SK.L1+SK.L2-Math.max(e(q.LthX,q.Lkn),e(q.RthX,q.Rkn)))+q.hipY,0];skUpdate();
 // reverse grip (blade tip down, both hands): right hand to a point in front of the chest, blade axis turned straight down
 if(q.rev>.02){const h=lp(1.02,.82,cl(q.revDn||0,0,1));armIK('right',[-.02,h,.27],[-.6,.2,-.5],[0,-1,0],q.rev)}
 // left hand joins the grip (two-handed swings, charged heavy attack, guard, reverse grip)
 if(q.two>.02||q.rev>.02){const rh=HB.rightHand,g=SK.GR[rh],gp=vadd(SK.GP[rh],r3v(g,vsub(SK.gripRest,PLD.bones[rh].r))),ax=r3v(g,SK.gripAx),t=vsub(gp,vmul(ax,.085));armIK('left',t,[.6,.1,-.5],null,Math.max(q.two,q.rev))}
 // choke hold: both forearms around a neck in front of the chest
 if(q.choke>.02){const h=q.chokeH||.84;armIK('right',[.04,h,.3],[-.7,-.1,-.4],null,q.choke);armIK('left',[-.03,h+.04,.33],[.7,-.1,-.4],null,q.choke)}}
// rotation taking unit vector a onto unit vector b (Rodrigues), row-major 3x3
function fromTo(a,b){const v=vcross(a,b),c=cl(vdot(a,b),-1,1),s=Math.hypot(v[0],v[1],v[2]);if(s<1e-6){if(c>0)return R3I.slice();const p=Math.abs(a[0])<.9?[1,0,0]:[0,1,0],ax=vnorm(vcross(a,p));return axisAng(ax,PI)}return axisAng(vmul(v,1/s),Math.atan2(s,c))}
function axisAng(k,t){const c=Math.cos(t),s=Math.sin(t),C=1-c,[x,y,z]=k;return[c+x*x*C,x*y*C-z*s,x*z*C+y*s,y*x*C+z*s,c+y*y*C,y*z*C-x*s,z*x*C-y*s,z*y*C+x*s,c+z*z*C]}
const r3t=m=>[m[0],m[3],m[6],m[1],m[4],m[7],m[2],m[5],m[8]];
// two-bone arm IK in model space: shoulder->elbow->hand reaches `target`, elbow bends towards `pole`;
// `axisDown` (optional) turns the hand so the sword grip axis points that way. w = blend weight.
function armIK(side,target,pole,axisDown,w){const H=HB,U=H[side+'UpperArm'],Lo=H[side+'LowerArm'],Hd=H[side+'Hand'],B=PLD.bones;
 const S=SK.GP[U],L1=Math.hypot(...vsub(B[Lo].r,B[U].r)),L2=Math.hypot(...vsub(B[Hd].r,B[Lo].r));
 let T=target;if(w<1){const cur=SK.GP[Hd];T=vadd(cur,vmul(vsub(target,cur),w))}
 const st=vsub(T,S),d=cl(Math.hypot(...st),.05,L1+L2-.002),u=vnorm(st),pv=vsub(pole,vmul(u,vdot(pole,u))),v=vnorm(Math.hypot(...pv)>1e-4?pv:[0,-1,0]);
 const ca=cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1),sa=Math.sqrt(1-ca*ca),E=vadd(S,vadd(vmul(u,L1*ca),vmul(v,L1*sa)));
 const PG=SK.GR[SK.par[U]],r1=vnorm(vsub(B[Lo].r,B[U].r)),Gu=fromTo(r1,vnorm(vsub(E,S)));
 const r2=r3v(Gu,vnorm(vsub(B[Hd].r,B[Lo].r))),Gl=r3m(fromTo(r2,vnorm(vsub(vadd(S,vmul(u,d)),E))),Gu);
 SK.R[U]=r3m(r3t(PG),Gu);SK.R[Lo]=r3m(r3t(Gu),Gl);
 if(axisDown&&side==='right'){skUpdate();const g=SK.GR[Hd],cur=r3v(g,SK.gripAx),Gh=r3m(fromTo(vnorm(cur),axisDown),g);SK.R[Hd]=r3m(r3t(Gl),Gh)}
 skUpdate()}
// ===================== terrain foot IK (planted feet follow slopes and steps) =====================
// applyPose() assumes flat ground. Here each foot samples the terrain under it: the pelvis drops to the lower foot,
// each leg is re-solved (two-bone, keeping the knee's bending plane), and the sole tilts to the slope normal.
// Offsets and weight are smoothed so walking over bumps never pops. Off while airborne, rolling, lying or wading.
const FIK={w:0,l:0,r:0,drop:0,nl:[0,1,0],nr:[0,1,0],on:true};
function slopeN(x,z){const e=.22,dx=hAt(x+e,z)-hAt(x-e,z),dz=hAt(x,z+e)-hAt(x,z-e);return vnorm([-dx/(2*e),1,-dz/(2*e)])}
function legIK(side,T,nM,w){const H=HB,U=H[side+'UpperLeg'],Lo=H[side+'LowerLeg'],F=H[side+'Foot'],B=PLD.bones,par=SK.par;
 const S=SK.GP[U],K=SK.GP[Lo],A=SK.GP[F],L1=Math.hypot(...vsub(B[Lo].r,B[U].r)),L2=Math.hypot(...vsub(B[F].r,B[Lo].r));
 const st=vsub(T,S),d=cl(Math.hypot(...st),.12,L1+L2-.003),u=vnorm(st);
 // bending plane: keep the current knee direction; a straight leg bends forwards (+z in model space)
 let pv=vsub(vsub(K,S),vmul(u,vdot(vsub(K,S),u)));if(Math.hypot(...pv)<.01)pv=vsub([0,0,1],vmul(u,u[2]));const v=vnorm(pv);
 const ca=cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1),E=vadd(S,vadd(vmul(u,L1*ca),vmul(v,L1*Math.sqrt(1-ca*ca))));
 const D1=fromTo(vnorm(vsub(K,S)),vnorm(vsub(E,S))),GU=r3m(D1,SK.GR[U]);
 const D2=fromTo(vnorm(r3v(D1,vsub(A,K))),vnorm(vsub(vadd(S,vmul(u,d)),E))),GL=r3m(D2,r3m(D1,SK.GR[Lo]));
 const GF=r3m(fromTo([0,1,0],nM),SK.GR[F]),blend=(a,b)=>w>=1?b:a.map((x,i)=>lp(x,b[i],w));
 const nU=r3m(r3t(SK.GR[par[U]]),GU),nL=r3m(r3t(GU),GL),nF=r3m(r3t(GL),GF);
 SK.R[U]=blend(SK.R[U],nU);SK.R[Lo]=blend(SK.R[Lo],nL);SK.R[F]=blend(SK.R[F],nF)}
function footIK(dt){const H=HB,k=1-Math.exp(-(dt||.016)*14),rag=P.rag&&P.rag.ang>.05;
 const ok=FIK.on&&!P.air&&!rag&&!['td','down','dead','getup','dodge','jump'].includes(P.st)&&P.y-hAt(P.x,P.z)<.03;
 FIK.w=lp(FIK.w,ok?1:0,k);if(FIK.w<.01){FIK.l=FIK.r=FIK.drop=0;return}
 const M=mtrs([P.x,P.y,P.z],[0,P.yaw,0]),c=Math.cos(P.yaw),s=Math.sin(P.yaw),toM=n=>vnorm([n[0]*c-n[2]*s,n[1],n[0]*s+n[2]*c]);
 const samp=(F)=>{const w=mpt(M,SK.GP[F]);return[cl(hAt(w[0],w[2])-P.y,-.4,.4),toM(slopeN(w[0],w[2]))]};
 const[ol,nl]=samp(H.leftFoot),[or,nr]=samp(H.rightFoot);
 FIK.l=lp(FIK.l,ol,k);FIK.r=lp(FIK.r,or,k);FIK.drop=lp(FIK.drop,Math.max(-.32,Math.min(0,ol,or)),k);
 FIK.nl=vnorm(FIK.nl.map((x,i)=>lp(x,nl[i],k)));FIK.nr=vnorm(FIK.nr.map((x,i)=>lp(x,nr[i],k)));
 const w=FIK.w,yl=SK.GP[H.leftFoot][1],yr=SK.GP[H.rightFoot][1];
 SK.root[1]+=FIK.drop*w;skUpdate();
 const tL=SK.GP[H.leftFoot].slice(),tR=SK.GP[H.rightFoot].slice();tL[1]=yl+FIK.l*w;tR[1]=yr+FIK.r*w;
 legIK('left',tL,FIK.nl,w);legIK('right',tR,FIK.nr,w);skUpdate()}
