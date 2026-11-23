// ===================== Kael's cape: cloth secondary motion =====================
// The sculpted cape is skinned to three bones (CapeA/B/C) that used to be left at rest, so the cloth moved
// like a rigid plate glued to the chest. Here a 4-point Verlet chain (anchor + 3 free points) is simulated in
// WORLD space every frame: still air drags it behind a running hero, gravity pulls it down, turning swings it,
// a soft pull towards the animated rest drape keeps its shape. In model space it is then pushed out of the
// torso and leg capsules (always towards the back, so a stride kicks the hem instead of passing through it),
// and finally each chain segment is turned into a bone rotation with fromTo().
const CAPE={on:false,p:null,q:null,rest:null,len:null,last:null};
function capeRest(){const H=HB,B=PLD.bones,a=B[H.capeA].r,b=B[H.capeB].r,c=B[H.capeC].r,d=vnorm(vsub(c,b));
 return[a,b,c,vadd(c,vmul(d,.2))]} // tip: just above the 0.5 m hem (folds hang below it)
function capeInit(){if(!HB||HB.capeA===undefined)return;CAPE.rest=capeRest();const r=CAPE.rest;CAPE.len=[1,2,3].map(i=>Math.hypot(...vsub(r[i],r[i-1])));CAPE.p=null;CAPE.on=true}
// model-space point of rest point i, carried by the animated upper chest (where the cape hangs from)
function capeDrape(i){const uc=HB.upperChest,g=SK.GR[uc];return vadd(SK.GP[uc],r3v(g,vsub(CAPE.rest[i],PLD.bones[uc].r)))}
function m4inv(M){const s2=M[0]*M[0]+M[1]*M[1]+M[2]*M[2],R=[M[0]/s2,M[1]/s2,M[2]/s2,M[4]/s2,M[5]/s2,M[6]/s2,M[8]/s2,M[9]/s2,M[10]/s2],t=[M[12],M[13],M[14]];
 return p=>{const d=[p[0]-t[0],p[1]-t[1],p[2]-t[2]];return[R[0]*d[0]+R[1]*d[1]+R[2]*d[2],R[3]*d[0]+R[4]*d[1]+R[5]*d[2],R[6]*d[0]+R[7]*d[1]+R[8]*d[2]]}}
// push model-space point q out of the capsule a-b (radius r) — only backwards (-z), the cape never ends up in front
function capeCapsule(q,a,b,r){const ab=vsub(b,a),t=cl(vdot(vsub(q,a),ab)/Math.max(1e-6,vdot(ab,ab)),0,1),c=vadd(a,vmul(ab,t)),dx=q[0]-c[0],dy=q[1]-c[1];
 const h2=r*r-dx*dx-dy*dy*.25;if(h2<=0)return;const zb=c[2]-Math.sqrt(h2);if(q[2]>zb)q[2]=zb}
function capeCollide(q){const H=HB,G=SK.GP,hz=G[H.hips][2]-.13;if(q[2]>hz)q[2]=hz; // never slips forward between the legs
 capeCapsule(q,G[H.hips],G[H.upperChest],.215);
 for(const S of['left','right']){capeCapsule(q,G[H[S+'UpperLeg']],G[H[S+'LowerLeg']],.12);capeCapsule(q,G[H[S+'LowerLeg']],G[H[S+'Foot']],.09)}}
// dt=0 (manhwa panels, paused frames) → keep the current drape; big jumps (teleport, respawn) → reset
function updateCape(M,dt){if(!CAPE.on)capeInit();if(!CAPE.on)return;const H=HB,toW=p=>mpt(M,p),toL=m4inv(M),N=4;
 const anchor=toW(SK.GP[H.capeA]);
 if(!CAPE.p||Math.hypot(...vsub(anchor,CAPE.last||anchor))>3||CAPE.p.some(p=>!isFinite(p[0]+p[1]+p[2]))){CAPE.p=[];CAPE.q=[];for(let i=0;i<N;i++){const w=toW(capeDrape(i));CAPE.p.push(w);CAPE.q.push(w.slice())}}
 CAPE.last=anchor;
 if(dt>0){const steps=dt>1/45?2:1,h=Math.min(dt,1/20)/steps;
  for(let s=0;s<steps;s++){const P_=CAPE.p,Q=CAPE.q;P_[0]=anchor.slice();Q[0]=anchor.slice();
   for(let i=1;i<N;i++){const p=P_[i],v=vmul(vsub(p,Q[i]),.955),tgt=toW(capeDrape(i)),k=.055+.03*(N-1-i);// stiffer near the shoulders
    Q[i]=p.slice();P_[i]=vadd(vadd(p,v),vadd([0,-9.8*h*h*1.4,0],vmul(vsub(tgt,p),k)))}
   for(let it=0;it<4;it++){for(let i=1;i<N;i++){const a=P_[i-1],b=P_[i],d=vsub(b,a),l=Math.hypot(...d)||1e-6,e=(l-CAPE.len[i-1])/l;
     if(i===1)P_[i]=vsub(b,vmul(d,e));else{P_[i-1]=vadd(a,vmul(d,e*.5));P_[i]=vsub(b,vmul(d,e*.5))}}
    for(let i=1;i<N;i++){const q=toL(P_[i]);capeCollide(q);P_[i]=toW(q)}}}}
 // chain → bone rotations (model space). Each bone keeps its rest twist; only the hanging direction changes.
 const L=CAPE.p.map(toL),R=CAPE.rest,bones=[H.capeA,H.capeB,H.capeC];
 for(let i=0;i<3;i++){const b=bones[i],par=SK.par[b],want=fromTo(vnorm(vsub(R[i+1],R[i])),vnorm(vsub(L[i+1],L[i])));
  SK.R[b]=r3m(r3t(SK.GR[par]),want);skUpdate()}
 CAPE.L=L}
