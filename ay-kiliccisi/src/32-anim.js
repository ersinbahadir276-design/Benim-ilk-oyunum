// ===================== keyframe clip layer: real motion clips on Kael's skeleton =====================
// data/anims.js holds Quaternius "Universal Animation Library" loops (CC0) retargeted offline by tools/anim/import_clips.mjs:
// per bone local quaternions (int16) + hip height. Locomotion (idle / walk / jog / sprint / crouch) plays these clips;
// the sword arm stays procedural (applyPose + IK) so the greatsword grip is untouched. Moving clips share one normalised
// gait phase (every loop starts with the left foot forward), so blends between them never cross the legs.
const CLIP={ready:false,match:1},CGAIT={ph:0,it:0,w:{idle:1},u:{}};
// game speed each moving clip is played at its natural cadence (m/s); measured clip speeds are in ANIMS.clips[k].speed
const GAIT_REF={walk:1.4,jog:3.7,sprint:6.6,cwalk:1.3};
// bones the clips drive: hips, spine, head and both legs, plus the free (left) arm. Right arm = sword arm: procedural,
// except in the sword-combo clips (ARM_CLIPS), which also drive it so the cut comes from the hips through the arm.
const CLIP_ARM={rightShoulder:1,rightUpperArm:1,rightLowerArm:1,rightHand:1},ARM_CLIPS={swA:1,swB:1,swC:1,death:1};
function animInit(){CLIP.init=true;if(typeof ANIMS==='undefined'||!HB)return;
 const b64=s=>{const t=atob(s),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);return u.buffer};
 const hum=n=>n[0].toLowerCase()+n.slice(1);CLIP.idx=[];CLIP.slot=[];
 CLIP.arm=[];ANIMS.bones.forEach((n,k)=>{const h=hum(n);if(HB[h]===undefined)return;CLIP.idx.push(HB[h]);CLIP.slot.push(k);CLIP.arm.push(CLIP_ARM[h]?1:0)});
 CLIP.nb=ANIMS.bones.length;CLIP.clips={};
 for(const k in ANIMS.clips){const c=ANIMS.clips[k],q16=new Int16Array(b64(c.q)),hy=new Int16Array(b64(c.hy)),q=new Float32Array(q16.length);
  for(let i=0;i<q.length;i++)q[i]=q16[i]/32767;CLIP.clips[k]={n:c.n,dur:c.dur,q,hy}}
 CLIP.acc=new Float32Array(CLIP.idx.length*4);CLIP.ready=true}
const clipHas=k=>{if(!CLIP.init)animInit();return!!(CLIP.ready&&CLIP.clips[k])};
// gait weights + phase from the hero's real ground speed (called once per frame from poseTarget)
function gaitUpdate(dt,moving){if(!CLIP.init)animInit();if(!CLIP.ready)return;const s=moving?P.spd:0,W={};
 // one-shot action clips, played by normalised time (u 0..1) so they always fit the game state's own duration
 if(ACTION_CLIP(W)){CGAIT.it+=dt;gaitBlend(W,dt);return}
 if(P.crouch){const k=sst(.08,.7,s);W.cidle=1-k;W.cwalk=k}
 else{const K=[['idle',0],['walk',GAIT_REF.walk],['jog',GAIT_REF.jog],['sprint',GAIT_REF.sprint]];
  if(s<=.12)W.idle=1;else if(s>=K[3][1])W.sprint=1;
  else for(let i=0;i<3;i++)if(s<K[i+1][1]){const t=(s-K[i][1])/(K[i+1][1]-K[i][1]),u=i===0?sst(0,1,t):t;W[K[i][0]]=1-u;W[K[i+1][0]]=u;break}}
 // moving clips: while a foot is on the ground the phase advances so that foot sweeps back exactly as fast as the body
 // moves (CLIP.sweep = metres the planted foot travels per unit phase, measured once on Kael's legs by clipStrides);
 // in the flight / swing parts the clip keeps its old cadence (natural cadence scaled by speed/reference, .45-1.6x).
 // The result is a speed-dependent duty factor: at a slow jog the feet stay down longer, as in a real run.
 // CLIP.match=0 restores the old cadence everywhere.
 if(!CLIP.sweep&&SK&&SK.GP)clipStrides();
 let rate=0,wm=0,gb=0,lo=0,hi=0;for(const k in W){const c=CLIP.clips[k];if(!c||!GAIT_REF[k])continue;rate+=W[k]*cl(s/GAIT_REF[k],.45,1.6)/c.dur;
  wm+=W[k];lo+=W[k]*.3/c.dur;hi+=W[k]*1.8/c.dur;const g=CLIP.sweep&&CLIP.sweep[k];if(g)gb+=W[k]*g[Math.floor(CGAIT.ph*g.length)%g.length]}
 CLIP.planted=0;if(CLIP.match&&wm>.05&&gb>.3*wm){rate=cl(s/gb,lo/wm,hi/wm);CLIP.planted=1}
 CGAIT.ph=(CGAIT.ph+rate*dt)%1;CGAIT.it+=dt;gaitBlend(W,dt)}
// Foot sweep of each locomotion loop on Kael's skeleton: pose every half frame (clip only, flat ground), take the lower
// foot's contact point (ankle or toe, whichever is nearer its rest height) and, while it is on the ground and moving back,
// store how many metres it travels per unit of gait phase (CLIP.sweep[k], lightly smoothed; 0 = no planted foot here).
// Measured once; the live pose is rebuilt by the next applyPose of the same frame. On Kael the planted foot of the
// Quaternius loops sweeps at about walk 1.1-1.5, jog ~7, sprint ~10 m/s at their natural cadence, while the game moves at
// 1.4 / 3.7 / 6.6 m/s: played at natural cadence the feet skated backwards.
function clipStrides(){if(!CLIP.ready||!PLD)return;const H=HB,sv={w:CGAIT.w,u:CGAIT.u,ph:CGAIT.ph},R0=SK.R.map(m=>m.slice()),root=SK.root.slice();CLIP.sweep={};CLIP.stride={};
 for(const k in GAIT_REF){const c=CLIP.clips[k];if(!c)continue;const N=c.n*2,fr=[];CGAIT.w={[k]:1};CGAIT.u={};
  for(let i=0;i<=N;i++){CGAIT.ph=(i/N)%1;applyPose(Object.assign({},POSE0,{clipW:1}));
   fr.push(['left','right'].map(S=>{const a=SK.GP[H[S+'Foot']],t=SK.GP[H[S+'Toes']],ca=a[1]-SK.rest[H[S+'Foot']][1],ct=t[1]-SK.rest[H[S+'Toes']][1];return{c:Math.min(ca,ct),ti:ct<ca,z:ca<ct?a[2]:t[2]}}))}
  const g=new Float32Array(N);let back=0,fwd=0;
  for(let i=0;i<N;i++){const p=fr[i][0].c<fr[i][1].c?0:1,a=fr[i][p],b=fr[i+1][p];if(a.c<.02&&b.c<.02&&a.ti===b.ti){const dz=a.z-b.z;if(dz>0){back+=dz;g[i]=dz*N}else fwd-=dz}}
  // a loop whose ground contact is mostly forward slip (double support, e.g. the crouch walk) is not trustworthy
  if(back<.3||fwd>back*.35)continue;
  const sm=new Float32Array(N);for(let i=0;i<N;i++){const p=g[(i+N-1)%N],q=g[(i+1)%N];sm[i]=g[i]>0?(g[i]*2+(p||g[i])+(q||g[i]))/4:0}
  CLIP.sweep[k]=sm;CLIP.stride[k]=back}
 CGAIT.w=sv.w;CGAIT.u=sv.u;CGAIT.ph=sv.ph;R0.forEach((m,i)=>SK.R[i]=m);SK.root=root;skUpdate()}
// locomotion weights are already continuous in speed; a switch into or out of an action clip cross-fades (~0.1 s)
// instead of popping. A fading one-shot keeps the last normalised time it was given (holds its final pose).
const ONE_SHOT={jstart:1,jloop:1,jland:1,hit:1,roll:1,swA:1,swB:1,swC:1,death:1};
function gaitBlend(W,dt){const O=CGAIT.w;let act=false;for(const k in W)if(ONE_SHOT[k])act=true;for(const k in O)if(ONE_SHOT[k])act=true;
 if(!act){CGAIT.w=W;return}const a=Math.min(1,dt*12),N={};let tot=0;
 for(const k in O)N[k]=(O[k]||0)*(1-a);for(const k in W)N[k]=(N[k]||0)+W[k]*a;
 for(const k in N){if(N[k]<.01)delete N[k];else tot+=N[k]}for(const k in N)N[k]/=tot;CGAIT.w=N}
// jump: take-off (from the frame the feet leave the ground) -> airborne tuck loop; land: first 0.45 s of Jump_Land (the
// knee-bend absorbing the fall) squeezed into the short land state; hurt: Hit_Chest over the 0.38 s flinch.
// Jump-attack landings (landT .38) keep their procedural slam pose. Returns true when an action clip owns the pose.
const JS_T0=.1,JS_RATE=1.5,JL_SPAN=.45;
function ACTION_CLIP(W){const C=CLIP.clips,st=P.st;
 if(st==='jump'&&C.jstart&&C.jloop){const k=sst(.38,.6,P.t);W.jstart=1-k;W.jloop=k;CGAIT.u.jstart=cl((JS_T0+P.t*JS_RATE)/C.jstart.dur,0,1);return true}
 if(st==='land'&&C.jland&&(P.landT||.15)<.3){W.jland=1;CGAIT.u.jland=cl(P.t/(P.landT||.15),0,1)*JL_SPAN/C.jland.dur;return true}
 // death: Death01 in real time (stagger, knees give, falls on the back by ~0.93 s, lies still); whole body incl. sword arm
 if(deathClip()){W.death=1;CGAIT.u.death=Math.min(P.t*DEATH_RATE,DEATH_T1)/C.death.dur;return true}
 if(st==='hurt'&&C.hit){W.hit=1;CGAIT.u.hit=cl(P.t/.38,0,1);return true}
 // forward dodge: Roll from the dive (crouched start skipped) to back on the feet, squeezed into the dodge's own duration
 if(rollClip()){W.roll=1;CGAIT.u.roll=(ROLL_T0+sst(0,1,P.t/P.dodgeT)*(ROLL_T1-ROLL_T0))/C.roll.dur;return true}
 // light combo: the combo pose picks the clip; its time is warped so the clip's blade-speed peak lands on the game's hit
 const k=swordClip();if(k){W[k]=1;CGAIT.u[k]=swordTime(k,P.t/(P.atkT||.46))/C[k].dur;return true}
 return false}
// Sword_Regular A/B/C (Universal Animation Library 2): A = forehand cut into a deep lunge (left foot back, hips side-on),
// B = backhand return from that lunge, C = spinning leap into an overhead finisher. Times (s) measured from the right
// hand's speed in tools/anim/import_clips.mjs: t0 = start, imp = fastest blade frame, t1 = recovered enough to hand back.
const SWORD={swA:{t0:0,imp:.25,t1:.43},swB:{t0:0,imp:.27,t1:.53},swC:{t0:.3,imp:.66,t1:1.05}},SW_HIT=.4,SW_POSE=['swA','swB','swC'];
const swordClip=()=>{if(P.st!=='attack'||!CLIP.ready)return null;const k=SW_POSE[curStance().pose[P.combo]||0];return CLIP.clips[k]?k:null};
// normalised attack time u (0..1) -> clip time: wind-up until SW_HIT (the game's hit is at u .36, its slash .3-.58), then follow-through
function swordTime(k,u){const S=SWORD[k];u=cl(u,0,1);return u<SW_HIT?lp(S.t0,S.imp,sst(0,1,u/SW_HIT)*.5+u/SW_HIT*.5):lp(S.imp,S.t1,(u-SW_HIT)/(1-SW_HIT))}
// Roll (1.47 s): 0.04 s crouch -> dive (hip 1.37 m) -> on the back (hip 0.06 m) -> up by ~1.1 s. The dodge plays 0.04-1.1 s.
// Death01 (2.4 s): hip 1.06 m -> 0.59 m at 0.6 s -> on the back (0.06 m) at 0.93 s; legs settle by ~1.4 s. Played 1.1x, held from 2.2 s.
// P.deathClip is set by die() only when standing (a death while already knocked down keeps the procedural ragdoll).
const DEATH_RATE=1.1,DEATH_T1=2.2,DEATH_HIT=.93,deathClip=()=>P.st==='dead'&&!!P.deathClip&&!!(CLIP.ready&&CLIP.clips.death);
const ROLL_T0=.04,ROLL_T1=1.1,rollClip=()=>P.st==='dodge'&&P.dodgeKind==='fwd'&&!!(CLIP.ready&&CLIP.clips.roll);
// clip weight wanted by a pose state (1 = the clip layer drives legs/spine/left arm)
const clipStateW=()=>P.st==='move'||rollClip()||deathClip()||!!swordClip()||P.st==='jump'||P.st==='hurt'||(P.st==='land'&&(P.landT||.15)<.3)?1:0;
// blended local rotation (quaternion) of every driven bone + hip height offset (m)
// right-arm bones accumulate only from ARM_CLIPS; CLIP.armW = their share of the blend (procedural arm keeps the rest)
function clipSample(){const acc=CLIP.acc,nb=CLIP.nb,idx=CLIP.idx,arm=CLIP.arm;acc.fill(0);let hy=0,tw=0,aw=0;
 for(const k in CGAIT.w){const w=CGAIT.w[k],c=CLIP.clips[k];if(!c||w<1e-3)continue;tw+=w;const ak=!!ARM_CLIPS[k];if(ak)aw+=w;
  const one=CGAIT.u[k]!==undefined,u=one?CGAIT.u[k]*(c.n-1):(GAIT_REF[k]?CGAIT.ph:(CGAIT.it/c.dur)%1)*c.n,f0=Math.floor(u)%c.n,f1=one?Math.min(f0+1,c.n-1):(f0+1)%c.n,t=u-Math.floor(u);
  hy+=w*lp(c.hy[f0],c.hy[f1],t)/1000;
  for(let j=0;j<idx.length;j++){if(arm[j]&&!ak)continue;const s=CLIP.slot[j],a=(f0*nb+s)*4,b=(f1*nb+s)*4,o=j*4,Q=c.q;
   let x=lp(Q[a],Q[b],t),y=lp(Q[a+1],Q[b+1],t),z=lp(Q[a+2],Q[b+2],t),ww=lp(Q[a+3],Q[b+3],t);
   if(acc[o]*x+acc[o+1]*y+acc[o+2]*z+acc[o+3]*ww<0){x=-x;y=-y;z=-z;ww=-ww}
   acc[o]+=w*x;acc[o+1]+=w*y;acc[o+2]+=w*z;acc[o+3]+=w*ww}}
 CLIP.armW=tw>0?aw/tw:0;return tw>0?hy/tw:0}
// row-major 3x3 <-> quaternion [x,y,z,w]
function q2r3(x,y,z,w){const l=Math.hypot(x,y,z,w)||1;x/=l;y/=l;z/=l;w/=l;
 return[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]}
function r32q(m){const tr=m[0]+m[4]+m[8];let q;
 if(tr>0){const s=.5/Math.sqrt(tr+1);q=[(m[7]-m[5])*s,(m[2]-m[6])*s,(m[3]-m[1])*s,.25/s]}
 else if(m[0]>m[4]&&m[0]>m[8]){const s=2*Math.sqrt(1+m[0]-m[4]-m[8]);q=[.25*s,(m[1]+m[3])/s,(m[2]+m[6])/s,(m[7]-m[5])/s]}
 else if(m[4]>m[8]){const s=2*Math.sqrt(1+m[4]-m[0]-m[8]);q=[(m[1]+m[3])/s,.25*s,(m[5]+m[7])/s,(m[2]-m[6])/s]}
 else{const s=2*Math.sqrt(1+m[8]-m[0]-m[4]);q=[(m[2]+m[6])/s,(m[5]+m[7])/s,.25*s,(m[3]-m[1])/s]}return q}
// called by applyPose after the procedural joint angles: overrides the driven bones by weight cw, returns the clip hip offset
function applyClips(cw){if(!CLIP.init)animInit();if(!CLIP.ready||cw<.01)return null;const hy=clipSample(),acc=CLIP.acc,R=SK.R,aw=cw*CLIP.armW;
 for(let j=0;j<CLIP.idx.length;j++){const b=CLIP.idx[j],o=j*4,bw=CLIP.arm[j]?aw:cw;if(bw<.01)continue;let x=acc[o],y=acc[o+1],z=acc[o+2],w=acc[o+3];
  if(bw<.999){const p=r32q(R[b]);if(p[0]*x+p[1]*y+p[2]*z+p[3]*w<0){x=-x;y=-y;z=-z;w=-w}const l=Math.hypot(x,y,z,w)||1;
   x=lp(p[0],x/l,bw);y=lp(p[1],y/l,bw);z=lp(p[2],z/l,bw);w=lp(p[3],w/l,bw)}
  R[b]=q2r3(x,y,z,w)}
 return hy}
// after skUpdate: put the lowest foot back on the ground (the source rig's legs are not exactly Kael's)
// (not while rolling or dying: the feet are in the air, playerMatrix's lying clearance keeps the body above the ground instead)
// (nor during the airborne spin of Sword_Regular_C, whose own hip curve lifts the body)
function clipGround(cw){cw*=1-(CGAIT.w.roll||0)-(CGAIT.w.death||0)-(CGAIT.w.swC&&CGAIT.u.swC*CLIP.clips.swC.dur<.58?CGAIT.w.swC:0);if(cw<.01)return;const H=HB,rest=SK.rest,GP=SK.GP;let d=1e9;
 for(const b of[H.leftFoot,H.rightFoot,H.leftToes,H.rightToes])d=Math.min(d,GP[b][1]-rest[b][1]);
 if(Math.abs(d)>1e-4){SK.root[1]-=d*cw;skUpdate()}}
