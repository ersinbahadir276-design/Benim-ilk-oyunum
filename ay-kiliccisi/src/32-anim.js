// ===================== keyframe clip layer: real motion clips on Kael's skeleton =====================
// data/anims.js holds Quaternius "Universal Animation Library" loops (CC0) retargeted offline by tools/anim/import_clips.mjs:
// per bone local quaternions (int16) + hip height. Locomotion (idle / walk / jog / sprint / crouch) plays these clips;
// the sword arm stays procedural (applyPose + IK) so the greatsword grip is untouched. Moving clips share one normalised
// gait phase (every loop starts with the left foot forward), so blends between them never cross the legs.
const CLIP={ready:false},GAIT={ph:0,it:0,w:{idle:1}};
// game speed each moving clip is played at its natural cadence (m/s); measured clip speeds are in ANIMS.clips[k].speed
const GAIT_REF={walk:1.4,jog:3.7,sprint:6.6,cwalk:1.3};
// bones the clips drive: hips, spine, head and both legs, plus the free (left) arm. Right arm = sword arm, procedural.
const CLIP_SKIP={rightShoulder:1,rightUpperArm:1,rightLowerArm:1,rightHand:1};
function animInit(){CLIP.init=true;if(typeof ANIMS==='undefined'||!HB)return;
 const b64=s=>{const t=atob(s),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);return u.buffer};
 const hum=n=>n[0].toLowerCase()+n.slice(1);CLIP.idx=[];CLIP.slot=[];
 ANIMS.bones.forEach((n,k)=>{const h=hum(n);if(HB[h]===undefined||CLIP_SKIP[h])return;CLIP.idx.push(HB[h]);CLIP.slot.push(k)});
 CLIP.nb=ANIMS.bones.length;CLIP.clips={};
 for(const k in ANIMS.clips){const c=ANIMS.clips[k],q16=new Int16Array(b64(c.q)),hy=new Int16Array(b64(c.hy)),q=new Float32Array(q16.length);
  for(let i=0;i<q.length;i++)q[i]=q16[i]/32767;CLIP.clips[k]={n:c.n,dur:c.dur,q,hy}}
 CLIP.acc=new Float32Array(CLIP.idx.length*4);CLIP.ready=true}
// gait weights + phase from the hero's real ground speed (called once per frame from poseTarget)
function gaitUpdate(dt,moving){if(!CLIP.init)animInit();if(!CLIP.ready)return;const s=moving?P.spd:0,W={};
 if(P.crouch){const k=sst(.08,.7,s);W.cidle=1-k;W.cwalk=k}
 else{const K=[['idle',0],['walk',GAIT_REF.walk],['jog',GAIT_REF.jog],['sprint',GAIT_REF.sprint]];
  if(s<=.12)W.idle=1;else if(s>=K[3][1])W.sprint=1;
  else for(let i=0;i<3;i++)if(s<K[i+1][1]){const t=(s-K[i][1])/(K[i+1][1]-K[i][1]),u=i===0?sst(0,1,t):t;W[K[i][0]]=1-u;W[K[i+1][0]]=u;break}}
 // moving clips: phase advances so each one keeps its own cadence at its reference speed
 let rate=0;for(const k in W){const c=CLIP.clips[k];if(!c||!GAIT_REF[k])continue;rate+=W[k]*cl(s/GAIT_REF[k],.45,1.6)/c.dur}
 GAIT.ph=(GAIT.ph+rate*dt)%1;GAIT.it+=dt;GAIT.w=W}
// blended local rotation (quaternion) of every driven bone + hip height offset (m)
function clipSample(){const acc=CLIP.acc,nb=CLIP.nb,idx=CLIP.idx;acc.fill(0);let hy=0,tw=0;
 for(const k in GAIT.w){const w=GAIT.w[k],c=CLIP.clips[k];if(!c||w<1e-3)continue;tw+=w;
  const u=(GAIT_REF[k]?GAIT.ph:(GAIT.it/c.dur)%1)*c.n,f0=Math.floor(u)%c.n,f1=(f0+1)%c.n,t=u-Math.floor(u);
  hy+=w*lp(c.hy[f0],c.hy[f1],t)/1000;
  for(let j=0;j<idx.length;j++){const s=CLIP.slot[j],a=(f0*nb+s)*4,b=(f1*nb+s)*4,o=j*4,Q=c.q;
   let x=lp(Q[a],Q[b],t),y=lp(Q[a+1],Q[b+1],t),z=lp(Q[a+2],Q[b+2],t),ww=lp(Q[a+3],Q[b+3],t);
   if(acc[o]*x+acc[o+1]*y+acc[o+2]*z+acc[o+3]*ww<0){x=-x;y=-y;z=-z;ww=-ww}
   acc[o]+=w*x;acc[o+1]+=w*y;acc[o+2]+=w*z;acc[o+3]+=w*ww}}
 return tw>0?hy/tw:0}
// row-major 3x3 <-> quaternion [x,y,z,w]
function q2r3(x,y,z,w){const l=Math.hypot(x,y,z,w)||1;x/=l;y/=l;z/=l;w/=l;
 return[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]}
function r32q(m){const tr=m[0]+m[4]+m[8];let q;
 if(tr>0){const s=.5/Math.sqrt(tr+1);q=[(m[7]-m[5])*s,(m[2]-m[6])*s,(m[3]-m[1])*s,.25/s]}
 else if(m[0]>m[4]&&m[0]>m[8]){const s=2*Math.sqrt(1+m[0]-m[4]-m[8]);q=[.25*s,(m[1]+m[3])/s,(m[2]+m[6])/s,(m[7]-m[5])/s]}
 else if(m[4]>m[8]){const s=2*Math.sqrt(1+m[4]-m[0]-m[8]);q=[(m[1]+m[3])/s,.25*s,(m[5]+m[7])/s,(m[2]-m[6])/s]}
 else{const s=2*Math.sqrt(1+m[8]-m[0]-m[4]);q=[(m[2]+m[6])/s,(m[5]+m[7])/s,.25*s,(m[3]-m[1])/s]}return q}
// called by applyPose after the procedural joint angles: overrides the driven bones by weight cw, returns the clip hip offset
function applyClips(cw){if(!CLIP.init)animInit();if(!CLIP.ready||cw<.01)return null;const hy=clipSample(),acc=CLIP.acc,R=SK.R;
 for(let j=0;j<CLIP.idx.length;j++){const b=CLIP.idx[j],o=j*4;let x=acc[o],y=acc[o+1],z=acc[o+2],w=acc[o+3];
  if(cw<.999){const p=r32q(R[b]);if(p[0]*x+p[1]*y+p[2]*z+p[3]*w<0){x=-x;y=-y;z=-z;w=-w}const l=Math.hypot(x,y,z,w)||1;
   x=lp(p[0],x/l,cw);y=lp(p[1],y/l,cw);z=lp(p[2],z/l,cw);w=lp(p[3],w/l,cw)}
  R[b]=q2r3(x,y,z,w)}
 return hy}
// after skUpdate: put the lowest foot back on the ground (the source rig's legs are not exactly Kael's)
function clipGround(cw){const H=HB,rest=SK.rest,GP=SK.GP;let d=1e9;
 for(const b of[H.leftFoot,H.rightFoot,H.leftToes,H.rightToes])d=Math.min(d,GP[b][1]-rest[b][1]);
 if(Math.abs(d)>1e-4){SK.root[1]-=d*cw;skUpdate()}}
