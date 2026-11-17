// ===================== hero animation layers: foot IK on slopes, turn banking, head stabilisation =====================
// poseTarget() (55-player.js) builds the key pose; these layers are applied on top, every frame, without touching P.ps
// (P.ps is the smoothed key pose and is also saved by the story scenes, so terrain corrections must not leak into it).
const ANIM={l:0,r:0,hip:0,fl:0,fr:0,w:0,yr:0,pyaw:null};
// states whose feet are planted on the terrain
const FOOT_IK_OFF={dodge:1,down:1,dead:1,td:1,getup:1,jump:1,jumpatk:1};
// solve the leg (sagittal plane) so the foot rises by `h` while keeping its forward offset. th/kn are the thigh and knee
// angles of the key pose, pel the pelvis pitch. Returns [th,kn]. Same angle convention as applyPose (e = L1·cos + L2·cos).
function legLift(th,kn,pel,h){const L1=SK.L1,L2=SK.L2,a=pel+th,b=a+kn,u=L1*Math.sin(a)+L2*Math.sin(b),e=L1*Math.cos(a)+L2*Math.cos(b)-h;
 const d=cl(Math.hypot(u,e),.25*(L1+L2),L1+L2-1e-4),k=Math.acos(cl((d*d-L1*L1-L2*L2)/(2*L1*L2),-1,1)),a2=Math.atan2(u,e)-Math.atan2(L2*Math.sin(k),L1+L2*Math.cos(k));
 return[a2-pel,k]}
// terrain height under each foot, relative to the hero's root, from last frame's bone positions
function footHeights(){if(!PM)return null;const H=HB,l=mpt(PM,SK.GP[H.leftFoot]),r=mpt(PM,SK.GP[H.rightFoot]),c=mpt(PM,[0,0,0]),f=mpt(PM,[0,0,.2]),fx=f[0]-c[0],fz=f[2]-c[2];
 const sl=(hAt(P.x+fx,P.z+fz)-hAt(P.x-fx,P.z-fz))/.4;// rise per metre along the facing direction
 return{l:cl(hAt(l[0],l[2])-P.y,-.32,.32),r:cl(hAt(r[0],r[2])-P.y,-.32,.32),slope:Math.atan(sl)}}
// returns the pose actually drawn this frame
function animLayers(ps,dt){const q=Object.assign({},ps);dt=dt||0;if(ANIM.off)return q;
 // ---- turn banking: lean into turns while running (centripetal), from the smoothed yaw rate
 if(ANIM.pyaw===null)ANIM.pyaw=P.yaw;const yr=dt>0?angd(P.yaw,ANIM.pyaw)/dt:0;ANIM.pyaw=P.yaw;ANIM.yr=lp(ANIM.yr,cl(yr,-8,8),Math.min(1,dt*8));
 const mv=P.st==='move'&&!P.crouch?cl(P.spd/5,0,1):0;q.spZ=(q.spZ||0)+cl(ANIM.yr*.045*mv,-.22,.22);
 // ---- foot IK: plant both feet on uneven ground; the hips drop by the lower foot, the uphill knee bends
 const on=!P.air&&!FOOT_IK_OFF[P.st]&&P.rag.ang<.05&&P.y<=hAt(P.x,P.z)+.03;
 ANIM.w=lp(ANIM.w,on?1:0,Math.min(1,dt*10));const fh=on?footHeights():null;
 const tl=fh?fh.l:0,tr=fh?fh.r:0,k=Math.min(1,dt*14);ANIM.l=lp(ANIM.l,tl,k);ANIM.r=lp(ANIM.r,tr,k);ANIM.fl=lp(ANIM.fl,fh?fh.slope:0,k);
 if(ANIM.w>.01){const lo=Math.min(ANIM.l,ANIM.r),w=ANIM.w,pel=q.pel||0;
  // the root formula in applyPose grounds the most extended leg at y=0; lifting each leg by (h - lowest) and dropping the
  // hips by the lowest foot puts both soles on the terrain
  const[lt,lk]=legLift(q.LthX,q.Lkn,pel,(ANIM.l-lo)*w),[rt,rk]=legLift(q.RthX,q.Rkn,pel,(ANIM.r-lo)*w);
  q.LthX=lt;q.Lkn=lk;q.RthX=rt;q.Rkn=rk;q.hipY=(q.hipY||0)+lo*w;
  // soles follow the slope (toes up when the ground rises ahead)
  q.ftX=-ANIM.fl*w*.8}
 return q}
