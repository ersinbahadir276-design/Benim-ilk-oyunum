// ===================== goblins: small ones in fast weak groups, one big club-wielder per camp =====================
const GOBS=[];let GOBM=null,BIGM=null,SKM=null;
const GOB_HOSTILE={rise:1,aim:1,horn:1,chase:1,circle:1,windup:1,strike:1,recover:1,stagger:1,hurt:1,escape:1};
function mkGob(x,z,big,group,camp){const g={big,x,z,y:hAt(x,z),yaw:rnd()*6.28,hyaw:0,hx:x,hz:z,st:'idle',t:rr(0,3),hp:big?260:38,max:big?260:38,spd:0,aware:0,ls:[x,z],unseen:9,group,camp,
  rad:big?.8:.33,sc:big?1.25:1,ph:rnd()*6,cd:rr(.5,1.5),eye:big?2.3:1.0,flash:0,kx:0,kz:0,held:null,dead:0,R:null,q:{},slot:rnd()*6.28,hitDone:false,deadT:0,swims:false};
 g.hostile=()=>!!GOB_HOSTILE[g.st];
 g.open=()=>g.st==='stagger'||(g.big&&g.st==='recover');
 g.hurt=(dmg,dx,dz,kind)=>gobHurt(g,dmg,dx,dz,kind);
 g.onParried=()=>{g.st='stagger';g.t=0;g.flash=1;g.kx=-Math.sin(g.yaw)*(g.big?2:5);g.kz=-Math.cos(g.yaw)*(g.big?2:5)};
 g.grab=(kind)=>{g.held=kind;g.st=kind;g.t=0;g.spd=0};
 g.escape=()=>{const from=g.held;g.held=null;g.st='escape';g.t=0;g.from=from;g.aware=1;g.ls=[P.x,P.z]};
 g.calmDown=()=>{if(g.dead)return;g.aware=0;if(g.hostile()&&g.st!=='escape'){g.st='return';g.t=0}};
 g.onKilled=(byPet)=>{if(g.skel)return skelKilled(g);SYS.gkills=(SYS.gkills||0)+1;SYS.gold=(SYS.gold||0)+(g.big?20:4);addXP(g.big?120:25,P);note('[Sistem] '+(g.big?'Büyük goblin':'Goblin')+' öldürüldü · +'+(g.big?120:25)+' XP · +'+(g.big?20:4)+' altın');save(P)};
 g.onAlerted=()=>{if(!g.hostile()&&!g.held&&!g.dead){g.st='alert';g.t=0}};
 GOBS.push(g);return g}
function spawnGoblins(){GOBM=humanGeo('goblin');BIGM=humanGeo('bigGoblin');SKM=humanGeo('skeleton');
 CAMPSITES.forEach((c,i)=>{const grp='camp'+i;for(let k=0;k<4;k++){const a=k/4*2*PI+.4,p=collide(c.x+Math.cos(a)*5,c.z+Math.sin(a)*5,.4);const g=mkGob(p[0],p[1],false,grp,c);g.yaw=Math.atan2(c.x-g.x,c.z-g.z)+PI}
  const bp=collide(c.x+Math.cos(c.gate)*14,c.z+Math.sin(c.gate)*14,.9),b=mkGob(bp[0],bp[1],true,grp,c);b.yaw=c.gate;
  // a small patrol group outside the palisade
  for(let k=0;k<3;k++){const a=c.gate+(k-1)*.25,p=collide(c.x+Math.cos(a)*40,c.z+Math.sin(a)*40,.4);const g=mkGob(p[0],p[1],false,grp+'p',c);g.patrol=[[c.x+Math.cos(c.gate)*40,c.z+Math.sin(c.gate)*40],[c.x+Math.cos(c.gate+1.2)*45,c.z+Math.sin(c.gate+1.2)*45],[c.x+Math.cos(c.gate-1.2)*45,c.z+Math.sin(c.gate-1.2)*45]];g.pi=k%3}});
 spawnSkeletons();
 for(const g of GOBS){g.R=rigObj(g.skel?SKM:g.big?BIGM:GOBM,{out:.014,cull:150});rigHide(g.R)}}
function gobHurt(g,dmg,dx,dz,kind){if(g.dead)return false;g.hp-=dmg;g.flash=1;g.aware=1;g.ls=[P.x,P.z];
 if(g.hp<=0&&g.skel&&skelCollapse(g,kind))return false;
 if(g.hp<=0){g.hp=0;g.dead=1;g.st='dead';g.t=0;g.held=null;return true}
 const kb=g.big?1.2:5;g.kx=dx*kb;g.kz=dz*kb;{const l=Math.hypot(dx,dz);if(l>1e-3){const fx=Math.sin(g.yaw),fz=Math.cos(g.yaw);g.hf=(dx*fx+dz*fz)/l;g.hs=(dx*fz-dz*fx)/l}else{g.hf=-1;g.hs=0}}
 if(g.st!=='escape'&&g.st!=='choked'&&g.st!=='pinned'){if(!g.big||kind==='heavy'||kind==='jumpatk'){if(g.st!=='stagger'){g.st='hurt';g.t=0}}else if(!g.hostile()){g.st='chase';g.t=0}}
 alertGroup(g,P,22,GOBS);return false}
const gobTokens=()=>GOBS.filter(g=>!g.dead&&!g.big&&(g.st==='windup'||g.st==='strike')).length;
function updateGob(g,dt){g.t+=dt;g.flash=Math.max(0,g.flash-dt*6);g.cd-=dt;const d=Math.hypot(P.x-g.x,P.z-g.z);
 if(Math.abs(g.kx)+Math.abs(g.kz)>.05&&!g.held){const p=collide(g.x+g.kx*dt,g.z+g.kz*dt,g.rad);g.x=p[0];g.z=p[1];const k=Math.exp(-dt*7);g.kx*=k;g.kz*=k}
 if(g.skel&&skelTick(g,dt,d))return;
 if(g.dead){g.deadT+=dt;if(g.deadT>140&&d>100){Object.assign(g,{dead:0,hp:g.max,x:g.hx,z:g.hz,st:'idle',aware:0,deadT:0,held:null})}g.y=hAt(g.x,g.z);return}
 if(g.st==='choked'||g.st==='pinned'){g.spd=0;g.y=hAt(g.x,g.z);return}
 if(g.st==='escape'){// the get-up (or stumble free) always plays to the end, nothing interrupts it
  const T=g.from==='pinned'?1.4:1.0;if(g.t>T){g.st='chase';g.t=0;g.aware=1;alertGroup(g,P,22,GOBS)}g.y=hAt(g.x,g.z);return}
 // perception
 const range=g.big?24:20,sees=senseTick(g,P,dt,range),hostile=g.hostile();
 if(!hostile){const spotted=fillAware(g,P,sees,dt,range);if(spotted){if(g.skel)skelRattle(g,5);else sfx.gobShout();note(g.skel?'[!] '+skelName(g)+' seni gördü!':g.big?'[!] Büyük goblin seni gördü!':'[!] Goblin seni gördü! Kampı uyarıyor.','red');alertGroup(g,P,24,GOBS)}
  if(P.noise>0&&d<P.noise*1.2&&g.st!=='alert'){g.st='alert';g.t=0;g.ls=[P.x,P.z]}if(g.aware>=1){g.st='chase';g.t=0;alertGroup(g,P,24,GOBS)}}
 else if(sees||d<4&&P.alive){g.ls=[P.x,P.z];g.unseen=0}else g.unseen=(g.unseen||0)+dt;// in a fight, someone 4 m away is heard and felt even outside the view cone
 g.hyaw=lp(g.hyaw,0,Math.min(1,dt*4));
 switch(g.st){
 case'idle':g.spd=lp(g.spd,0,.2);g.hyaw=Math.sin(g.t*.6+g.ph)*.6;if(g.aware>.25){g.st='alert';g.t=0}else if(g.patrol&&g.t>3){g.st='patrol';g.t=0}else if(g.t>rr(5,9)&&!g.big){g.st='wander';g.t=0;const a=rnd()*6.28;g.tx=g.hx+Math.cos(a)*rr(2,7);g.tz=g.hz+Math.sin(a)*rr(2,7)}break;
 case'wander':if(agentMove(g,g.tx,g.tz,1.3,dt,g.rad,4)<.8||g.t>9){g.st='idle';g.t=0}break;
 case'patrol':{const w=g.patrol[g.pi];if(agentMove(g,w[0],w[1],1.6,dt,g.rad,4)<1.5){g.pi=(g.pi+1)%g.patrol.length;g.st='idle';g.t=0}break}
 case'alert':g.spd=lp(g.spd,0,.3);agentFace(g,g.ls[0],g.ls[1],dt,5);if(g.aware>=1){g.st='chase';g.t=0}else if(g.t>3.5&&g.aware<.3){g.st='idle';g.t=0}break;
 case'return':if(agentMove(g,g.hx,g.hz,g.big?2:3,dt,g.rad,4)<1.5||g.t>30){g.st='idle';g.t=0;g.aware=0}break;
 case'chase':{if(!P.alive||Math.hypot(g.x-g.hx,g.z-g.hz)>90||g.unseen>8){g.st='return';g.t=0;g.aware=0;break}
  if(archerChase(g,d,dt))break;
  const tx=g.unseen<1?P.x:g.ls[0],tz=g.unseen<1?P.z:g.ls[1];
  if(g.big){if(d<(g.chief?4.0:3.2)&&g.cd<=0&&P.st!=='down'){const r=Math.random();g.move=g.chief?(g.phase===2&&r<.3?'stomp':r<.6?'sweep':'smash'):'smash';if(g.move==='stomp')dangerRing(g.x,g.z,5.6,1.14);g.st='windup';g.t=0;g.hitDone=false;sfx.roar(.6);break}agentMove(g,tx,tz,g.chief&&g.phase===2?3.2:2.4,dt,g.rad,3);break}
  if(d<4.2&&g.unseen<1){if(gobTokens()<2&&g.cd<=0&&P.st!=='down'&&P.st!=='getup'){g.st='windup';g.t=0;g.hitDone=false;sfx.gobShout();break}g.st='circle';g.t=0;g.dur=rr(.6,1.4);break}
  agentMove(g,tx,tz,5.4,dt,g.rad,8);break}
 case'aim':archerAim(g,d,dt);break;
 case'circle':{const a=Math.atan2(g.x-P.x,g.z-P.z)+.8*dt*(g.side||1),gx=P.x+Math.sin(a)*3.4,gz=P.z+Math.cos(a)*3.4;agentMove(g,gx,gz,3,dt,g.rad,6);agentFace(g,P.x,P.z,dt,9);
  if(g.t>g.dur){g.st='chase';g.t=0}break}
 case'windup':{g.spd=lp(g.spd,0,.4);const T=g.big?{smash:1.35,sweep:1.05,stomp:.95}[g.move||'smash']:g.skel?.75:.5;if(g.t<T*.7)agentFace(g,P.x,P.z,dt,g.big?2.2:9);if(g.t>=T){g.st='strike';g.t=0;sfx.swing()}break}
 case'strike':{const T=g.big?(g.move==='sweep'?.42:.38):.2,u=g.t/T;
  if(!g.big){g.x+=Math.sin(g.yaw)*3*dt;g.z+=Math.cos(g.yaw)*3*dt;if(!g.hitDone&&u>.5){g.hitDone=true;const fa=Math.abs(angd(Math.atan2(P.x-g.x,P.z-g.z),g.yaw));if(d<(g.skel?1.9:1.6)&&fa<1.1)hitPlayer({src:g,dmg:g.skel?12:7,guard:g.skel?26:18,dir:[Math.sin(g.yaw),Math.cos(g.yaw)],knock:'flinch'})}}
  else if(g.move==='stomp'){if(!g.hitDone&&u>=.5){g.hitDone=true;CAM.shake=Math.max(CAM.shake,.7);sfx.thud();spawnSparks(g.x,g.y+.2,g.z,24,[.6,.5,.4],7);if(d<5.6&&!P.air)hitPlayer({src:g,dmg:20,guard:40,dir:[P.x-g.x,P.z-g.z],knock:'down',power:1.2,parryable:false})}}
  else if(!g.hitDone){// the club must really touch the hero: segment (club) vs capsule (body) test every frame of the swing
   const seg=clubSeg(g),hit=segCapsule(seg[0],seg[1],[P.x,P.y+.2,P.z],[P.x,P.y+1.55,P.z],.42);if(hit){g.hitDone=true;hitPlayer({src:g,dmg:30,guard:62,dir:[Math.sin(g.yaw),Math.cos(g.yaw)],knock:'down',power:1.5})}}
  if(u>=1){if(g.big){CAM.shake=Math.max(CAM.shake,d<9?.35:.1);sfx.thud();const tip=clubSeg(g)[1];spawnSparks(tip[0],hAt(tip[0],tip[2])+.1,tip[2],10,[.6,.5,.4],3)}g.st='recover';g.t=0;g.cd=g.big?rr(1.6,2.4):rr(.9,1.6)}break}
 case'recover':g.spd=0;if(g.t>(g.big?1.25:.5)){g.st='chase';g.t=0}break;
 case'stagger':g.spd=0;if(g.t>(g.big?2.1:1.5)){g.st='chase';g.t=0}break;
 case'hurt':g.spd=0;if(g.t>.3){g.st='chase';g.t=0}break}
 // keep goblins apart
 for(const o of GOBS){if(o===g||o.dead)continue;const ex=g.x-o.x,ez=g.z-o.z,q=ex*ex+ez*ez,m=g.rad+o.rad;if(q<m*m&&q>1e-6){const k=Math.sqrt(q);g.x+=ex/k*(m-k)*.5;g.z+=ez/k*(m-k)*.5}}
 g.y=hAt(g.x,g.z);if(g.spd>.2)g.ph+=g.spd*dt*(g.big?2.2:4.2)}
function gobFK(g,time){const tilt=gobRootTilt(g),K=g.skel?SKM.K:g.big?BIGM.K:GOBM.K,hipH=(K.th+K.sh2+.06)*g.sc,extra=tilt?rX(tilt):R3I,y=g.y+lp(hipH,g.big?.4:.15,Math.abs(Math.sin(tilt)));g.root=[g.x,y,g.z,extra];rigFK(g.R.def,gobPose(g,time),[g.x,y,g.z],g.yaw,g.sc,g.R.ob.bones,extra)}
function clubSeg(g){gobFK(g,GT.time);const d=g.R.def;return[boneW(d,8,[0,-.08,.3],g.sc),boneW(d,8,[0,-.08,1.75],g.sc)]}
// closest distance between segment AB (club) and segment CD (body axis) < r
function segCapsule(A,B,C,D,r){let best=1e9;for(let i=0;i<=8;i++){const t=i/8,p=[lp(A[0],B[0],t),lp(A[1],B[1],t),lp(A[2],B[2],t)],cd=vsub(D,C),u=cl(vdot(vsub(p,C),cd)/vdot(cd,cd),0,1),q=vadd(C,vmul(cd,u));best=Math.min(best,Math.hypot(...vsub(p,q)))}return best<r+.18}
// ---------- poses
// directional recoil (see hitReact in 55-player.js): g.hf>0 = pushed forward (hit from behind), g.hs = pushed to its right
function gobHurtPose(g,q){const k=sst(0,.06,g.t)*(1-sst(.1,.3,g.t)),f=g.hf,sd=g.hs,back=Math.max(0,-f),fwd=Math.max(0,f),st=sst(.03,.15,g.t)*(1-sst(.2,.3,g.t));
 q.spP=(-.5*back+.55*fwd)*k;q.hdP=(-.55*back+.45*fwd)*k;q.hipP=(-.12*back+.12*fwd)*k;q.spR=GREACT.side*sd*.4*k;q.hdR=GREACT.side*sd*.3*k;q.spY=.25*sd*k;
 q.RsX=-1.1*k-.2;q.LsX=-1.0*k-.2;q.RsZ=.35+.3*k;q.LsZ=.35+.3*k;
 const lead=sd>.3?'R':sd<-.3?'L':'R';q[lead+'hX']=(.5*back-.5*fwd)*st;q.LkX=.2+.3*st;q.RkX=.2+.3*st}
const GREACT={side:-1};
function gobPose(g,time){const q={};const A=cl(g.spd/(g.big?2.4:5),0,1),run=g.big?0:cl((g.spd-2)/3,0,1);
 if(g.st!=='dead'&&g.st!=='choked'&&g.st!=='pinned'&&g.st!=='escape'){gaitPose(q,g.ph,A,run);q.spP=(q.spP||0)+(g.big?.25:.32);q.hdP=-.2;q.hdY=g.hyaw;q.LsZ=.25;q.RsZ=.25;q.ReX=(q.ReX||0)-.6;q.LeX=(q.LeX||0)-.4}
 const u=g.big?g.t/1.35:g.t/.5;
 switch(g.st){
 case'idle':q.spP+=Math.sin(time*1.4+g.ph)*.04;break;
 case'alert':q.hdP=-.05;q.spP=.15;q.RsX=-.7;q.ReX=-1.2;break;
 case'windup':if(g.big&&g.move==='sweep'){const k=sst(0,.8,u);q.RsX=lp(-.3,-1.45,k);q.RsY=lp(0,1.5,k);q.RsZ=.5;q.ReX=-.5;q.LsX=-1.2*k;q.LsY=1.2*k;q.spY=1.0*k;q.spP=.2;q.LhX=-.5;q.LkX=.6;q.RhX=.3;q.RkX=.3}
  else if(g.big&&g.move==='stomp'){const k=sst(0,.85,g.t/.95);q.RhX=-1.6*k;q.RkX=1.4*k;q.LkX=.4*k;q.spP=-.25*k;q.RsX=-1.6*k;q.LsX=-1.6*k;q.RsZ=.6;q.LsZ=.6;q.jaw=.8}
  else if(g.big){const k=sst(0,.8,u);q.RsX=lp(0,-3.0,k);q.RsZ=.35;q.ReX=lp(-.6,-1.4,k);q.LsX=lp(0,-2.6,k);q.LsZ=.5;q.LeX=-1.2;q.spP=lp(.25,-.35,k);q.hdP=-.4;q.jaw=.5;q.LhX=-.4;q.LkX=.5;q.RhX=.2;q.RkX=.3}
  else{const k=sst(0,1,u);q.RsX=lp(-.4,-2.4,k);q.RsZ=.6;q.ReX=-1.4;q.spP=.45;q.spY=-.5*k;q.LhX=-.5;q.LkX=.8;q.RhX=.3;q.RkX=.4;q.hdP=-.3}break;
 case'strike':{const k=sst(0,1,g.t/(g.big?.38:.2));if(g.big&&g.move==='sweep'){q.RsX=-1.45;q.RsY=lp(1.5,-1.7,k);q.RsZ=.5;q.ReX=-.2;q.LsX=-1.2;q.LsY=lp(1.2,-1.4,k);q.spY=lp(1,-1,k);q.spP=.25;q.LhX=-.6;q.LkX=.7;q.RhX=.3;q.RkX=.3}
  else if(g.big&&g.move==='stomp'){q.RhX=lp(-1.6,-.2,k);q.RkX=lp(1.4,.2,k);q.spP=.3;q.RsX=-.8;q.LsX=-.8;q.jaw=.8}
  else if(g.big){q.RsX=lp(-3.0,.4,k);q.RsZ=.25;q.ReX=lp(-1.4,-.2,k);q.LsX=lp(-2.6,.2,k);q.LsZ=.4;q.LeX=-.3;q.spP=lp(-.35,.75,k);q.hipP=.2*k;q.LhX=-.7;q.LkX=.9;q.RhX=.3;q.RkX=.4;q.jaw=.7}
  else{q.RsX=lp(-2.4,.8,k);q.RsY=lp(0,.6,k);q.RsZ=.3;q.ReX=-.2;q.spP=.55;q.spY=lp(-.5,.5,k);q.LhX=-.7;q.LkX=.9;q.RhX=.4;q.RkX=.3}break}
 case'recover':if(g.big){q.RsX=.5;q.RsZ=.25;q.ReX=-.2;q.LsX=.3;q.spP=.75;q.hipP=.25;q.hdP=.3;q.LhX=-.7;q.LkX=.9}else{q.spP=.4}break;
 case'horn':{q.LsX=-2.2;q.LeX=-1.6;q.LsZ=.2;q.hdP=-.4;q.spP=-.2;q.RsX=-.3;break}
 case'hurt':if(HREACT.on&&g.hf!==undefined){gobHurtPose(g,q);break}
 case'stagger':{const k=Math.sin(g.t*14)*.3;q.spP=-.4+k*.3;q.hdP=-.5;q.RsX=-1.6;q.LsX=-1.4;q.LsZ=.6;q.RsZ=.6;q.hipP=-.15;q.LhX=.3;q.RkX=.5;break}
 case'choked':{const k=Math.sin(g.t*17);q.hdP=-.6;q.spP=-.35;q.RsX=-1.8+k*.5;q.LsX=-1.6-k*.5;q.LsZ=.7;q.RsZ=.7;q.LeX=-1.5;q.ReX=-1.5;q.LhX=.25+k*.3;q.RhX=-.2-k*.3;q.LkX=.4;q.RkX=.5;q.jaw=.8;break}
 case'pinned':q.LsX=-2.6;q.RsX=-2.6+Math.sin(g.t*20)*.3*Math.max(0,1-g.t);q.LsZ=.4;q.RsZ=.4;q.hdP=-.6;q.jaw=.6;break;
 case'escape':{const T=g.from==='pinned'?1.4:1.0,u2=g.t/T;if(g.from==='pinned'){q.LsX=lp(-2.6,0,u2);q.RsX=lp(-2.6,0,u2);q.LhX=lp(0,-1.4,sst(0,.5,u2))*(1-sst(.6,1,u2));q.LkX=lp(0,2.2,sst(0,.5,u2))*(1-sst(.6,1,u2));q.RhX=q.LhX*.7;q.RkX=q.LkX*.7;q.spP=lp(0,.8,sst(0,.5,u2))*(1-sst(.7,1,u2))}
  else{q.spP=.5*(1-u2);q.hdP=-.4;q.LhX=-.4;q.RkX=.5}break}
 case'rise':case'reform':{const k=sst(0,1,g.t/(g.st==='rise'?SKEL_RISE:SKEL_REFORM));q.RsX=lp(-2.7,-.3,k);q.LsX=lp(-2.9,-.2,k);q.RsZ=.35;q.LsZ=.35;q.ReX=-.5;q.LeX=-.6;q.spP=lp(.6,.2,k)+Math.sin(g.t*11)*.06*(1-k);q.hdP=lp(.7,-.1,k);q.jaw=.5*(1-k)+.2*Math.abs(Math.sin(g.t*7));q.LhX=lp(-.9,0,k);q.LkX=lp(1.3,0,k);q.RhX=lp(-.5,0,k);q.RkX=lp(.9,0,k);break}
 case'dead':break}
 if(g.skel&&g.st!=='dead')q.jaw=(q.jaw||0)+.12+.08*Math.sin(time*3+g.ph);
 archerPose(g,q);return humanPose(q)}
// root tilt for lying states (face-down when pinned, on the back when dead)
function gobRootTilt(g){if(g.st==='pinned')return 1.45;if(g.st==='reform')return -1.45*(1-sst(0,.55,g.t/SKEL_REFORM));if(g.st==='escape'&&g.from==='pinned')return 1.45*(1-sst(0,.85,g.t/1.4));if(g.st==='dead')return -1.45*sst(0,.6,g.t);return 0}
function drawGobs(time){for(const g of GOBS){const d=Math.hypot(g.x-P.x,g.z-P.z);if(d>140||(g.dead&&g.deadT>20)){rigHide(g.R);if(g.bowOb)g.bowOb.vis=false;continue}
  const rot=gobPose(g,time),tilt=gobRootTilt(g),K=g.skel?SKM.K:g.big?BIGM.K:GOBM.K,hipH=(K.th+K.sh2+.06)*g.sc;
  const extra=tilt?rX(tilt):R3I;let y=g.y+lp(hipH,g.big?.4:.15,Math.abs(Math.sin(tilt)))-skelSink(g);
  if(!tilt&&d<RFIK.dist&&g.st!=='dead'&&g.st!=='rise'&&g.st!=='reform'&&!skelSink(g))y+=rigFootIK(g.R.def,rot,g.x,y,g.z,g.yaw,g.sc,g.y,extra);rigDraw(g.R,g.x,y,g.z,g.yaw,g.sc,rot,g.big?.9:.42,extra);drawGobBow(g);
  g.R.ob.flash=g.flash;g.R.ob.col=g.st==='stagger'||g.open()?[1.15,1.05,.8]:g.skel&&g.st==='rise'?[.75,1.05,1.3]:[1,1,1]}}
