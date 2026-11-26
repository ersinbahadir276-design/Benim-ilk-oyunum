// ===================== Kael's cape: verlet cloth chain on the CapeA/B/C bones =====================
// The cape used to hang rigid from the upper chest. Now a 4-point chain (CapeA anchor, CapeB, CapeC, hem) is
// simulated in WORLD space, so running, turning, jumping and falling swing it with real inertia and air drag.
// The points are then pushed out of the body and the legs (model space) and the bones are aimed along the chain.
const CAPE={pts:null,old:null,len:null,rest:null,tipRest:null,on:true};
// DRAG: air (sets how far it flies back at a sprint), INNER: cloth friction vs. the shoulders,
// SIDE: max sideways reach per segment (m), MINDROP: each segment must fall at least this share of its length
const CAPE_G=9.8,CAPE_DRAG=1.3,CAPE_INNER=4.5,CAPE_SIDE=.13,CAPE_MINDROP=.35,CAPE_ITER=3;
function capeInit(){const H=HB,B=PLD.bones;if(H.capeA==null)return false;
 const ids=[H.capeA,H.capeB,H.capeC],r=ids.map(i=>B[i].r);CAPE.tipRest=[0,.5,-.3];r.push(CAPE.tipRest);
 CAPE.ids=ids;CAPE.rest=r;CAPE.len=[1,2,3].map(i=>Math.hypot(...vsub(r[i],r[i-1])));
 CAPE.dirRest=[0,1,2].map(i=>vnorm(vsub(r[i+1],r[i])));return true}
const capeW=(M,p)=>mpt(M,p);
// world -> model for a rigid matrix with uniform scale PSC (playerMatrix: yaw, plus ragdoll tilt)
function capeM(M,w){const d=[w[0]-M[12],w[1]-M[13],w[2]-M[14]],s=1/(PSC*PSC);
 return[(M[0]*d[0]+M[1]*d[1]+M[2]*d[2])*s,(M[4]*d[0]+M[5]*d[1]+M[6]*d[2])*s,(M[8]*d[0]+M[9]*d[1]+M[10]*d[2])*s]}
// the current anchor and the rest pose of the chain hanging from the posed upper chest
function capeRestWorld(M){const uc=HB.upperChest,g=SK.GR[uc],a=SK.GP[HB.capeA];const out=[a];
 for(let i=1;i<4;i++)out.push(vadd(out[i-1],vmul(r3v(g,CAPE.dirRest[i-1]),CAPE.len[i-1])));return out.map(p=>capeW(M,p))}
// leg z (model space) at height y along hip->knee->foot, or null if y is outside the leg
function legZAt(side,y){const H=HB,a=SK.GP[H[side+'UpperLeg']],b=SK.GP[H[side+'LowerLeg']],c=SK.GP[H[side+'Foot']];
 const seg=(p,q)=>{const lo=Math.min(p[1],q[1]),hi=Math.max(p[1],q[1]);if(y<lo||y>hi||hi-lo<1e-4)return null;return lp(p[2],q[2],(y-p[1])/(q[1]-p[1]))};
 const z1=seg(a,b),z2=seg(b,c);if(z1==null)return z2;if(z2==null)return z1;return Math.min(z1,z2)}
// keep a model-space cape point behind the back and behind both legs, and above the ground
function capeCollide(p){const H=HB,hipY=SK.GP[H.hips][1],shY=SK.GP[H.upperChest][1];
 if(p[1]>hipY-.05&&p[1]<shY+.1){const zb=lp(SK.GP[H.hips][2],SK.GP[H.upperChest][2],cl((p[1]-hipY)/Math.max(.1,shY-hipY),0,1))-.19;if(p[2]>zb)p[2]=zb}
 for(const s of['left','right']){const lz=legZAt(s,p[1]);if(lz!=null&&p[2]>lz-.15)p[2]=lz-.15}
 if(p[1]<.04)p[1]=.04;return p}
function capeReset(M){const r=capeRestWorld(M);CAPE.pts=r.map(p=>p.slice());CAPE.old=r.map(p=>p.slice())}
// one simulation step; call after applyPose() and playerMatrix(). Writes SK.R for the cape bones.
function capeStep(dt,M){if(!CAPE.on||!PLD)return;if(!CAPE.rest&&!capeInit()){CAPE.on=false;return}
 if(!CAPE.pts)capeReset(M);
 const anchor=capeW(M,SK.GP[HB.capeA]);
 // teleport / respawn / first frame after a long pause: snap to the rest shape instead of whipping across the map
 if(Math.hypot(...vsub(anchor,CAPE.pts[0]))>2.5)capeReset(M);
 if(!(dt>0)){capeAim(M);return}
 const h=Math.min(dt,1/30),damp=Math.exp(-h*CAPE_DRAG),inner=Math.exp(-h*CAPE_INNER),t=GT.time||0;
 const vA=vsub(anchor,CAPE.pts[0]);CAPE.old[0]=CAPE.pts[0];CAPE.pts[0]=anchor;
 for(let i=1;i<4;i++){const p=CAPE.pts[i],o=CAPE.old[i],vw=vsub(p,o);
  // cloth damps its motion relative to the shoulders (internal friction), the air damps it relative to the world
  const v=vmul(vadd(vA,vmul(vsub(vw,vA),inner)),damp);
  // a little flutter that grows with speed (lower points flap more)
  const sp=Math.hypot(vA[0],vA[2])/h,fl=Math.min(1,sp/7)*.5*i;
  const ax=Math.sin(t*11+i*1.7)*fl,az=Math.cos(t*9.3+i*2.3)*fl;
  CAPE.old[i]=p;CAPE.pts[i]=[p[0]+v[0]+ax*h*h,p[1]+v[1]-CAPE_G*h*h,p[2]+v[2]+az*h*h]}
 for(let k=0;k<CAPE_ITER;k++){capeLengths();
  // shape limits in model space; their corrections are also applied to the previous positions,
  // so pushing the cloth out of a leg or clamping it never injects velocity (no pumping / flipping over the head)
  const mp=CAPE.pts.map(p=>capeM(M,p));
  for(let i=1;i<4;i++){const q=mp[i],pr=mp[i-1],a0=mp[0];
   q[0]=cl(q[0],a0[0]-CAPE_SIDE*i,a0[0]+CAPE_SIDE*i);
   const maxY=pr[1]-CAPE.len[i-1]*CAPE_MINDROP;if(q[1]>maxY)q[1]=maxY;
   if(q[2]>pr[2]+.05)q[2]=pr[2]+.05;
   capeCollide(q);const w=capeW(M,q),d=vsub(w,CAPE.pts[i]);CAPE.pts[i]=w;CAPE.old[i]=vadd(CAPE.old[i],d)}}
 capeLengths();
 capeAim(M)}
function capeLengths(){for(let i=1;i<4;i++){const a=CAPE.pts[i-1],d=vsub(CAPE.pts[i],a),L=Math.hypot(...d)||1e-6;CAPE.pts[i]=vadd(a,vmul(d,CAPE.len[i-1]/L))}}
// aim CapeA/B/C along the chain, keeping the parent's twist (so the cape still turns with the torso)
function capeAim(M){const ids=CAPE.ids;let G=SK.GR[HB.upperChest];
 const mp=CAPE.pts.map(p=>capeM(M,p));
 for(let i=0;i<3;i++){const base=vnorm(r3v(G,CAPE.dirRest[i])),want=vnorm(vsub(mp[i+1],mp[i])),Gi=r3m(fromTo(base,want),G);
  SK.R[ids[i]]=r3m(r3t(G),Gi);G=Gi}
 skUpdate()}
// how far the hem has swung back from hanging straight down (radians, model space) - used by tests
function capeSwing(){if(!CAPE.pts)return 0;const M=PM,a=capeM(M,CAPE.pts[0]),b=capeM(M,CAPE.pts[3]),d=vnorm(vsub(b,a));return Math.atan2(-d[2],-d[1])}
