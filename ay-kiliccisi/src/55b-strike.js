// ===================== STRIKE CORE (v20): swings, blade sweep hits, motion warp, hit feel, blade trail =====================
// Every sword attack is a SWING: wind-up (cock the blade to the start direction) -> active (the blade sweeps from
// start to end direction; hits are found by sweeping the real skinned blade against each foe's body volume, once per
// foe per swing) -> recovery (blade returns to the idle grip). Swings are defined by blade direction (yaw, pitch in the
// hero's space: yaw<0 = his right side, pitch>0 = up) and solved with arm IK, so every stance cuts differently.
const SWG={
 stone:{L:[{a:[-1.3,.95],b:[1.0,-.6],step:.35},{a:[1.15,-.55],b:[-1.2,.75],step:.3},{a:[-1.85,.2],b:[1.6,-.15],two:1,fin:1,step:.6,max:3}],
  H:{a:[-.12,1.95],b:[0,-.95],two:1,step:.5,max:3}},
 wind:{L:[{a:[-.12,.04],b:[0,-.02],thrust:1,step:.6,max:1},{a:[1.45,.25],b:[-1.45,-.05],step:.3},{a:[-.1,.08],b:[0,-.04],thrust:1,fin:1,lunge:2.4,max:2}],
  H:{a:[-1.25,-.75],b:[1.05,1.15],two:1,step:.4,max:3}},
 moon:{L:[{a:[1.85,.05],b:[-1.9,-.25],two:1,step:.4,max:4},{a:[0,2.05],b:[0,-1.05],two:1,fin:1,step:.5,max:3}],
  H:{a:[-1.55,.02],b:[-1.55,-.12],two:1,spin:1,max:8}},
 water:{L:[{a:[-.9,.15],b:[.75,-.22],step:.2},{a:[.85,.25],b:[-.85,-.1],step:.2},{a:[-.85,-.15],b:[.85,-.7],step:.25},{a:[-.25,-1.0],b:[.1,1.35],fin:1,step:.3}],
  H:{a:[-1.1,1.1],b:[.9,-.85],two:1,step:.45,max:3}},
 run:{a:[-1.55,.3],b:[1.45,-.25],step:0,max:3}};
// windows (fraction of the attack time): wind-up ends at a0, the blade is live a0..a1, then recovery
const SWT={light:[.34,.56],fin:[.38,.6],heavy:[.4,.6],run:[.25,.5]};
const swDir=(y,p)=>[Math.sin(y)*Math.cos(p),Math.sin(p),Math.cos(y)*Math.cos(p)];
// rotate unit vector a toward b by fraction k along the great circle (stable even when a and b are nearly opposite)
function slerpDir(a,b,k){const d=cl(vdot(a,b),-1,1),ang=Math.acos(d);if(ang<1e-3)return b.slice();let ax=vcross(a,b);if(Math.hypot(...ax)<1e-3)ax=vcross(a,Math.abs(a[1])<.9?[0,1,0]:[1,0,0]);ax=vnorm(ax);const t=ang*k,c=Math.cos(t),s=Math.sin(t);return vnorm(vadd(vadd(vmul(a,c),vmul(vcross(ax,a),s)),vmul(ax,vdot(ax,a)*(1-c))))}
const easeSw=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
// blade direction and hand position (model space) at the current moment of the current attack
function swingFrame(){const A=P.atk;if(!A)return null;const u=cl(P.t/A.T,0,1),sw=A.sw,w0=A.a0,w1=A.a1;
 let D,H,reach=.55;const piv=sw.two?[-.1,1.45,.14]:[-.2,1.52,.08];
 const po=A.pOff||0,at=s=>{const y=lp(sw.a[0],sw.b[0],s),p=lp(sw.a[1],sw.b[1],s)+po;return swDir(y,p)};
 if(u<w0){const k=sst(0,1,u/w0);D=slerpDir(A.D0,at(0),k);if(sw.thrust)reach=lp(.55,.18,k)}
 else if(u<=w1){const s=easeSw((u-w0)/(w1-w0));D=at(s);if(sw.thrust)reach=lp(.18,.78,s)}
 else{const k=sst(w1,1,u);D=slerpDir(at(1),P.idleD||at(1),k);if(sw.thrust)reach=lp(.78,.55,k)}
 H=vadd(piv,vmul(D,reach));if(u>w1&&P.idleH){const k=sst(w1,1,u);H=vadd(vmul(H,1-k),vmul(P.idleH,k))}
 return{D,H,u,two:sw.two?1:0}}
// start an attack: pick a swing, remember where the blade is now (smooth wind-up), choose a warp target
function beginSwing(kind,sw,T){const win=SWT[kind==='light'&&sw.fin?'fin':kind];const rh=HB.rightHand;
 P.atk={kind,sw,T,a0:win[0],a1:win[1],hits:new Set(),max:sw.max||2,prev:null,started:0,D0:vnorm(r3v(SK.GR[rh],SK.gripAx)),fin:!!sw.fin};
 const f=warpTarget(kind==='run'?7:4.4);P.atk.tg=f;if(f){P.yaw=Math.atan2(f.x-P.x,f.z-P.z);
  // aim the cut at the body: a low target (wolf, rat, spider) tilts the swing down, fully for thrusts
  const ty=(f.y!==undefined?f.y:hAt(f.x,f.z))+foeBodyH(f)*.5-P.y,hd=Math.max(1,foeDist(f)+foeBodyR(f)),po=cl(Math.atan2(ty-1.5,hd),-.75,.25);P.atk.pOff=po*(sw.thrust?1:.55)}}
function warpTarget(range){if(P.lock&&!P.lock.dead&&foeDist(P.lock)<range+1)return P.lock;const want=Math.hypot(IN.wx,IN.wz)>.3?Math.atan2(IN.wx,IN.wz):P.yaw;let best=null,bs=1e9;
 for(const f of foes()){const d=foeDist(f);if(d>range)continue;const a=Math.abs(angd(Math.atan2(f.x-P.x,f.z-P.z),want));if(a>1.3)continue;const s=d+a*2.2;if(s<bs){bs=s;best=f}}return best}
// motion warp: during wind-up and the first part of the cut, close the distance so the blade's sweet spot meets the body
function swingMove(dt){const A=P.atk;if(!A)return;const u=P.t/A.T,f=A.tg;let vx=0,vz=0;
 if(f&&!f.dead&&u<A.a0+(A.a1-A.a0)*.5){const dx=f.x-P.x,dz=f.z-P.z,d=Math.hypot(dx,dz)||1,want=foeBodyR(f)+(A.sw.thrust?1.25:1.05);
  P.yaw+=angd(Math.atan2(dx,dz),P.yaw)*Math.min(1,dt*18);if(d>want){const left=Math.max(.06,(A.a0+(A.a1-A.a0)*.5-u)*A.T),sp=Math.min(A.sw.lunge?14:8.5,(d-want)/left);vx=dx/d*sp;vz=dz/d*sp}}
 else if(u>A.a0-.1&&u<A.a1){const sp=(A.sw.lunge?A.sw.lunge*4:(A.sw.step||.3)*3.2);vx=Math.sin(P.yaw)*sp;vz=Math.cos(P.yaw)*sp}// weight shift: a short step into the cut
 P.vx=lp(P.vx,vx,Math.min(1,dt*20));P.vz=lp(P.vz,vz,Math.min(1,dt*20))}
// ---------------- foe body volumes (vertical capsules) for the blade sweep
function foeBodyR(f){if(isWolf(f))return .5*(f.sc||1);if(f.T)return f.rad+.05;if(CROCS.includes(f))return .7;if(GOBS.includes(f))return f.big?.75*f.sc:.36*f.sc;return f.rad||.4}
function foeBodyH(f){if(isWolf(f))return .95*(f.sc||1);if(f.T)return(f.T.quad?.85:1.75)*f.sc;if(CROCS.includes(f))return .7;if(GOBS.includes(f))return(f.big?2.3:1.3)*f.sc;return 1.6*(f.sc||1)}
function bodyDist(f,p){if(f.hitPts){let b=1e9;for(const h of f.hitPts())b=Math.min(b,Math.hypot(p[0]-h[0],p[1]-h[1],p[2]-h[2])-h[3]);return b}
 const y0=(f.y!==undefined?f.y:hAt(f.x,f.z))+(f.air||0)+.1,y1=y0+foeBodyH(f),r=foeBodyR(f),cy=cl(p[1],y0+r*.5,Math.max(y0+r*.5,y1-r*.5));return Math.hypot(p[0]-f.x,p[1]-cy,p[2]-f.z)-r}
// ---------------- the sweep, run every step after the hero's pose is final
const BLADE_F=[0,.3,.6,.85,1.04];
function sweepHits(){const A=P.atk;if(!A||(P.st!=='attack'&&P.st!=='heavy'&&P.st!=='runatk')){if(A&&A.trail)A.trail=null;return}
 const u=P.t/A.T;trailPush(u>A.a0-.06&&u<A.a1+.06);if(u<A.a0-.03||u>A.a1+.04){A.prev=null;return}
 const cur=BLADE_F.map(bladeAt),prev=A.prev||cur;A.prev=cur;
 if(!A.started){A.started=1;if(DUN.on)dunSwing(A.kind==='heavy'?'heavy':'light0');if(A.kind==='heavy'&&hasFx('fire'))for(let i=0;i<4;i++)BURNS.push({x:P.x+Math.sin(P.yaw)*(1.2+i*.9),z:P.z+Math.cos(P.yaw)*(1.2+i*.9),t:0,life:4,mine:1});P.noise=14}
 if(A.hits.size>=A.max)return;
 for(const f of foes()){if(A.hits.has(f))continue;if(Math.hypot(f.x-P.x,f.z-P.z)>6.5+(f.hitPts?8:0))continue;if(f.alt&&f.alt()>2.2)continue;
  let hit=null;for(let k=1;k<=3&&!hit;k++){const t=k/3;for(let j=0;j<BLADE_F.length&&!hit;j++){const p=[lp(prev[j][0],cur[j][0],t),lp(prev[j][1],cur[j][1],t),lp(prev[j][2],cur[j][2],t)];if(bodyDist(f,p)<.14)hit=p}}
  if(!hit)continue;A.hits.add(f);const tv=vsub(cur[4],prev[4]),tl=Math.hypot(tv[0],tv[2])||1,ox=f.x-P.x,oz=f.z-P.z,ol=Math.hypot(ox,oz)||1;
  const dx=(tv[0]/tl)*.5+ox/ol*.5,dz=(tv[2]/tl)*.5+oz/ol*.5,dl=Math.hypot(dx,dz)||1;
  strikeFoe(f,A.kind==='heavy'?'heavy':A.kind==='run'?'runatk':'light'+P.combo,dx/dl,dz/dl,hit,A);if(A.hits.size>=A.max)break}}
// ---------------- hit feel: material, hit-stop and shake by attack weight; no reaction on a miss
function foeMat(f){if(f.T){const m=f.T.m;return m==='skeleton'||m==='skmage'?'bone':m==='knight'?'metal':m==='golem'?'stone':'flesh'}if(f===DRAGON||CROCS.includes(f))return'scale';return'flesh'}
const MATFX={flesh:{c:[.75,.06,.05],n:7,s:3},bone:{c:[.92,.88,.76],n:9,s:3.5},metal:{c:[1,.9,.55],n:14,s:6},stone:{c:[.62,.6,.56],n:12,s:4},scale:{c:[.85,.5,.25],n:9,s:4}};
function hitFeel(f,A,p,dead,crit){const m=foeMat(f),F=MATFX[m],w=A.kind==='heavy'?2:A.fin||A.kind==='run'?1.4:1,big=f.big||f.boss||f===DRAGON;
 spawnSparks(p[0],p[1],p[2],Math.round(F.n*(dead?1.8:w>1?1.4:1)),F.c,F.s);
 if(m==='metal')sfx.clang();else if(m==='bone')sfx.bone();else if(m==='stone')sfx.thud();else sfx.flesh(w);
 GT.stop=Math.max(GT.stop,(w>1.9?.095:w>1.3?.075:.05)+(dead?.03:0)+(crit?.02:0));
 if(w>1.3||dead||big)CAM.shake=Math.max(CAM.shake,w>1.9?.38:dead?.24:.18);if(navigator.vibrate)try{navigator.vibrate(w>1.9?35:15)}catch(e){}}
// ---------------- blade trail: a ribbon through the last blade positions while the blade is live
let trailOb=null,trailGeo=null;const TRN=10,trailP=new Float32Array((TRN+1)*2*3),trailN=new Float32Array((TRN+1)*2*3),trailBuf=[];
function trailInit(){const g=G();for(let i=0;i<=TRN;i++)for(let s=0;s<2;s++){g.P.push(0,0,0);g.N.push(0,1,0);const k=1-i/TRN;g.C.push(.6+.4*k,.7+.3*k,1);g.U.push(0,0);g.W.push(0)}
 for(let i=0;i<TRN;i++){const o=i*2;g.I.push(o,o+1,o+2,o+1,o+3,o+2)}trailGeo=geo(g,true);trailOb=obj(trailGeo,{unlit:1,blend:1,noOff:1,shade:0,pos:[0,0,0],cull:0});trailOb.vis=false;trailOb.alpha=.5}
function trailPush(live){if(!trailOb)trailInit();if(live){const b=bladeAt(.25),t=bladeAt(1.02);trailBuf.unshift([b,t]);if(trailBuf.length>TRN+1)trailBuf.pop()}else if(trailBuf.length)trailBuf.pop()}
function drawTrail(){if(!trailOb)return;if(trailBuf.length<2){trailOb.vis=false;return}for(let i=0;i<=TRN;i++){const e=trailBuf[Math.min(i,trailBuf.length-1)];for(let s=0;s<2;s++){const q=(i*2+s)*3,p=e[s];trailP[q]=p[0];trailP[q+1]=p[1];trailP[q+2]=p[2]}}
 updGeo(trailGeo,trailP,trailN);trailOb.vis=true;trailOb.M=MID;trailOb.pos=[P.x,0,P.z];trailOb.alpha=.42}
