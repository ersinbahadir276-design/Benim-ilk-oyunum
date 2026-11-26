// ===================== Kael: ground-adaptive legs (foot IK) + head look-at =====================
// Runs after applyPose (procedural joint angles) and before playerMatrix. On uneven ground each foot is placed
// on the terrain under it: the pelvis sinks for the lower foot, the other leg bends (two-bone IK that keeps the
// thigh/shin twist), and the soles tilt to the slope. The head turns towards the locked / nearest enemy.
const FIK={on:1,drop:0,L:0,R:0,w:0,tL:[0,0],tR:[0,0],look:0,lookP:0,dbg:null};
// rotate `v` (row-major 3x3) helpers on top of the engine's r3m / r3v
function legIK(side,target){const H=HB,U=H[side+'UpperLeg'],Lo=H[side+'LowerLeg'],Ft=H[side+'Foot'],B=PLD.bones;
 const L1=Math.hypot(...vsub(B[Lo].r,B[U].r)),L2=Math.hypot(...vsub(B[Ft].r,B[Lo].r));
 const S=SK.GP[U],K=SK.GP[Lo],A=SK.GP[Ft],u=vsub(K,S),v=vsub(A,K);
 // 1) knee: change the bend so |hip-ankle| equals |hip-target|
 const d=cl(Math.hypot(...vsub(target,S)),Math.abs(L1-L2)+.02,L1+L2-.004);
 const beta=Math.acos(cl(vdot(vnorm(u),vnorm(v)),-1,1)),beta2=PI-Math.acos(cl((L1*L1+L2*L2-d*d)/(2*L1*L2),-1,1));
 let n=vcross(u,v);n=Math.hypot(...n)>1e-5?vnorm(n):vnorm(r3v(SK.GR[U],[1,0,0]));
 const GU=SK.GR[U];let GL=r3m(axisAng(n,beta2-beta),SK.GR[Lo]);
 // 2) swing the whole leg about the hip so the ankle lands on the target
 const A2=vadd(K,r3v(GL,vsub(B[Ft].r,B[Lo].r))),sw=fromTo(vnorm(vsub(A2,S)),vnorm(vsub(target,S)));
 const GU2=r3m(sw,GU);GL=r3m(sw,GL);
 SK.R[U]=r3m(r3t(SK.GR[SK.par[U]]),GU2);SK.R[Lo]=r3m(r3t(GU2),GL)}
// terrain normal (world) by central differences
function terrN(x,z){const e=.25;return vnorm([hAt(x-e,z)-hAt(x+e,z),2*e,hAt(x,z-e)-hAt(x,z+e)])}
function footIK(dt){const H=HB;if(!PLD)return;
 // where it applies: standing, walking, fighting on the ground (not in the air, rolling, lying, wading, held)
 const st=P.st,ground=hAt(P.x,P.z),ok=FIK.on&&!P.air&&P.alive!==false&&P.st!=='td'&&!P.pinBy&&P.rag.ang<.02&&!(st==='dodge'&&(P.spin||P.roll))&&
  !['down','dead','getup','jump','jumpatk'].includes(st)&&Math.abs(P.y-ground)<.04;
 const k=Math.min(1,(dt||0)*12);FIK.w+=((ok?1:0)-FIK.w)*(dt?Math.min(1,dt*8):1);
 const M=mtrs([P.x,P.y,P.z],[0,P.yaw,0]),Mi=mtrs([0,0,0],[0,-P.yaw,0]);
 // terrain height under each ankle, relative to the ground under the root
 const off=s=>{const w=mpt(M,SK.GP[H[s+'Foot']]);return cl(hAt(w[0],w[2])-ground,-.4,.4)};
 const oL=ok?off('left'):0,oR=ok?off('right'):0;
 FIK.L+=(oL-FIK.L)*k;FIK.R+=(oR-FIK.R)*k;const drop=Math.min(0,FIK.L,FIK.R);FIK.drop+=(drop-FIK.drop)*k;
 const W=FIK.w;
 if(W>.01&&(Math.abs(FIK.L)>.003||Math.abs(FIK.R)>.003||Math.abs(FIK.drop)>.003)){
  SK.root=[SK.root[0],SK.root[1]+FIK.drop*W,SK.root[2]];skUpdate();
  for(const[s,o]of[['left',FIK.L],['right',FIK.R]]){const a=SK.GP[H[s+'Foot']],t=[a[0],a[1]+(o-FIK.drop)*W,a[2]];legIK(s,t);skUpdate()}}
 // soles follow the slope (foot is flat in model space after applyPose; tilt it to the local terrain normal)
 if(W>.01)for(const s of['left','right']){const f=H[s+'Foot'],w=mpt(M,SK.GP[f]),nW=terrN(w[0],w[2]),nM=vnorm(mpt(Mi,nW));
  const tilt=fromTo([0,1,0],vnorm(vadd([0,1,0],vmul(vsub(nM,[0,1,0]),W*.85)))),Gf=SK.GR[f],flat=r3m(tilt,Gf);
  SK.R[f]=r3m(r3t(SK.GR[SK.par[f]]),flat)}
 if(W>.01)skUpdate();
 // head look-at: locked target, else the nearest enemy in front (within 10 m)
 let f=P.lock&&!P.lock.dead?P.lock:null;if(!f&&typeof nearestFoe==='function')f=nearestFoe(10,2.1);
 const busy=['down','dead','getup','td','dodge'].includes(st);let ly=0,lp2=0;
 if(f&&!busy){ly=cl(angd(Math.atan2(f.x-P.x,f.z-P.z),P.yaw),-1.1,1.1);const fy=(f.y!==undefined?f.y:hAt(f.x,f.z))+(f.big?1.6:.9),dist=Math.max(.5,Math.hypot(f.x-P.x,f.z-P.z));lp2=cl(-Math.atan2(fy-(P.y+1.75),dist),-.5,.5)}
 const kl=dt?Math.min(1,dt*6):1;FIK.look+=(ly-FIK.look)*kl;FIK.lookP+=(lp2-FIK.lookP)*kl;
 if(Math.abs(FIK.look)>.005||Math.abs(FIK.lookP)>.005){SK.R[H.neck]=r3m(SK.R[H.neck],r3m(rY(FIK.look*.35),rX(FIK.lookP*.4)));SK.R[H.head]=r3m(SK.R[H.head],r3m(rY(FIK.look*.5),rX(FIK.lookP*.6)));skUpdate()}}
