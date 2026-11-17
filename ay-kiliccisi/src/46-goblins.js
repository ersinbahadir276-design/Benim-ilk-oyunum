// ===================== goblins: small ones in fast weak groups, one big club-wielder per camp =====================
const GOBS=[];let GOBM=null,BIGM=null;
const GOB_HOSTILE={guard:1,hop:1,aim:1,horn:1,chase:1,circle:1,windup:1,strike:1,recover:1,stagger:1,hurt:1,escape:1};
function mkGob(x,z,big,group,camp){const g={big,x,z,y:hAt(x,z),yaw:rnd()*6.28,hyaw:0,hx:x,hz:z,st:'idle',t:rr(0,3),hp:big?260:38,max:big?260:38,spd:0,aware:0,ls:[x,z],unseen:9,group,camp,
  rad:big?.8:.33,sc:big?1.25:1,ph:rnd()*6,cd:rr(.5,1.5),eye:big?2.3:1.0,flash:0,kx:0,kz:0,held:null,dead:0,R:null,q:{},slot:rnd()*6.28,hitDone:false,deadT:0,swims:false};
 g.hostile=()=>!!GOB_HOSTILE[g.st];
 g.open=()=>g.st==='stagger'||(g.big&&g.st==='recover');
 g.hurt=(dmg,dx,dz,kind)=>gobHurt(g,dmg,dx,dz,kind);
 g.onParried=()=>{g.st='stagger';g.t=0;g.flash=1;g.kx=-Math.sin(g.yaw)*(g.big?2:5);g.kz=-Math.cos(g.yaw)*(g.big?2:5)};
 g.grab=(kind)=>{g.held=kind;g.st=kind;g.t=0;g.spd=0};
 g.escape=()=>{const from=g.held;g.held=null;g.st='escape';g.t=0;g.from=from;g.aware=1;g.ls=[P.x,P.z]};
 g.calmDown=()=>{if(g.dead)return;g.aware=0;if(g.hostile()&&g.st!=='escape'){g.st='return';g.t=0}};
 g.onKilled=(byPet)=>{GOBDEAD.push({x:g.x,z:g.z,t:GT.clock});SYS.gkills=(SYS.gkills||0)+1;SYS.gold=(SYS.gold||0)+(g.big?20:4);addXP(g.big?120:25,P);note('[Sistem] '+(g.big?'Büyük goblin':'Goblin')+' öldürüldü · +'+(g.big?120:25)+' XP · +'+(g.big?20:4)+' altın');save(P)};
 g.onAlerted=()=>{if(!g.hostile()&&!g.held&&!g.dead){g.st='alert';g.t=0}};
 GOBS.push(g);return g}
function spawnGoblins(){GOBM=humanGeo('goblin');BIGM=humanGeo('bigGoblin');
 CAMPSITES.forEach((c,i)=>{const grp='camp'+i;for(let k=0;k<4;k++){const a=k/4*2*PI+.4,p=collide(c.x+Math.cos(a)*5,c.z+Math.sin(a)*5,.4);const g=mkGob(p[0],p[1],false,grp,c);g.yaw=Math.atan2(c.x-g.x,c.z-g.z)+PI}
  const bp=collide(c.x+Math.cos(c.gate)*14,c.z+Math.sin(c.gate)*14,.9),b=mkGob(bp[0],bp[1],true,grp,c);b.yaw=c.gate;
  // a small patrol group outside the palisade
  for(let k=0;k<3;k++){const a=c.gate+(k-1)*.25,p=collide(c.x+Math.cos(a)*40,c.z+Math.sin(a)*40,.4);const g=mkGob(p[0],p[1],false,grp+'p',c);g.patrol=[[c.x+Math.cos(c.gate)*40,c.z+Math.sin(c.gate)*40],[c.x+Math.cos(c.gate+1.2)*45,c.z+Math.sin(c.gate+1.2)*45],[c.x+Math.cos(c.gate-1.2)*45,c.z+Math.sin(c.gate-1.2)*45]];g.pi=k%3}});
 for(const g of GOBS){g.R=rigObj(g.big?BIGM:GOBM,{out:.014,cull:150});rigHide(g.R)}}
function gobHurt(g,dmg,dx,dz,kind){if(g.dead)return false;const light0=kind&&kind.startsWith&&kind.startsWith('light');
 if(g.st==='guard'&&!g.big&&Math.abs(angd(Math.atan2(P.x-g.x,P.z-g.z),g.yaw))<1.2){if(light0||kind==='arrow'){g.blockedAt=GT.clock;g.t=Math.min(g.t,.5);g.kx=dx*2;g.kz=dz*2;if(Math.random()<.35){g.t=99;gobStartSwing(g)}return false}
  if(kind==='heavy'||kind==='runatk'||kind==='jumpatk'){g.st='stagger';g.t=0;floatText(g.x,(g.y||0)+1.9,g.z,'SAVUNMA KIRILDI','crit');sfx.break()}}g.hp-=dmg;g.flash=1;g.aware=1;g.ls=[P.x,P.z];
 if(g.hp<=0){g.hp=0;g.dead=1;g.st='dead';g.t=0;g.held=null;return true}
 const kb=g.big?1.2:5;g.kx=dx*kb;g.kz=dz*kb;
 if(g.st!=='escape'&&g.st!=='choked'&&g.st!=='pinned'){g.hitN=GT.clock-(g.hitAt||-9)<2.2?(g.hitN||0)+1:1;g.hitAt=GT.clock;const light=kind&&kind.startsWith&&kind.startsWith('light');
  if(!g.big&&(g.st==='windup'||g.st==='strike')&&light){g.kx*=.15;g.kz*=.15}                                  // committed attack: armoured against light hits
  else if(!g.big&&g.hitN>=2&&g.st!=='stagger'){g.hitN=0;g.st='hop';g.t=0;g.kx=dx*9;g.kz=dz*9}                   // second hit in a row: hop back, then lunge
  else if(!g.big||kind==='heavy'||kind==='jumpatk'){if(g.st!=='stagger'){g.st='hurt';g.t=0}}else if(!g.hostile()){g.st='chase';g.t=0}}
 alertGroup(g,P,22,GOBS);if(!g.helped&&!g.big&&!g.so&&g.hp<g.max*.5)gobCallHelp(g);return false}
const gobTokens=()=>GOBS.filter(g=>!g.dead&&!g.big&&(g.st==='windup'||g.st==='strike')).length;
function updateGob(g,dt){if(g.so){g.y=hAt(g.x,g.z);return}g.t+=dt;g.flash=Math.max(0,g.flash-dt*6);g.cd-=dt;const d=Math.hypot(P.x-g.x,P.z-g.z);
 if(Math.abs(g.kx)+Math.abs(g.kz)>.05&&!g.held){const p=collide(g.x+g.kx*dt,g.z+g.kz*dt,g.rad);g.x=p[0];g.z=p[1];const k=Math.exp(-dt*7);g.kx*=k;g.kz*=k}
 if(g.dead){g.deadT+=dt;if(g.deadT>140&&d>100){Object.assign(g,{dead:0,hp:g.max,x:g.hx,z:g.hz,st:'idle',aware:0,deadT:0,held:null})}g.y=hAt(g.x,g.z);return}
 if(g.st==='choked'||g.st==='pinned'){g.spd=0;g.y=hAt(g.x,g.z);return}
 if(g.st==='escape'){// the get-up (or stumble free) always plays to the end, nothing interrupts it
  const T=g.from==='pinned'?1.4:1.0;if(g.t>T){g.st='chase';g.t=0;g.aware=1;alertGroup(g,P,22,GOBS)}g.y=hAt(g.x,g.z);return}
 // perception
 const range=g.lookout?32:g.big?24:20,sees=senseTick(g,P,dt,range),hostile=g.hostile();
 if(!hostile){const spotted=fillAware(g,P,sees,dt,range);if(spotted&&g.lookout&&!g.alarmed){g.alarmed=1;g.st='horn';g.t=0;g.aware=1;note('[!] Gözcü seni gördü — borusuna uzanıyor!','red');sfx.gobShout()}else if(spotted){sfx.gobShout();note(g.big?'[!] Büyük goblin seni gördü!':'[!] Goblin seni gördü! Kampı uyarıyor.','red');alertGroup(g,P,24,GOBS)}
  if(P.noise>0&&d<P.noise*1.2&&g.st!=='alert'){g.st='alert';g.t=0;g.ls=[P.x,P.z]}if(g.aware>=1&&g.st!=='horn'){g.st='chase';g.t=0;alertGroup(g,P,24,GOBS)}}
 else if(sees||d<7&&P.alive){g.ls=[P.x,P.z];g.unseen=0}else g.unseen=(g.unseen||0)+dt;// in a fight, someone 4 m away is heard and felt even outside the view cone
 g.hyaw=lp(g.hyaw,0,Math.min(1,dt*4));
 if(gobBrain(g,d,dt)){}else switch(g.st){
 case'idle':g.spd=lp(g.spd,0,.2);g.hyaw=Math.sin(g.t*.6+g.ph)*.6;if(g.aware>.25){g.st='alert';g.t=0}else if(g.patrol&&g.t>3){g.st='patrol';g.t=0}else if(g.t>rr(5,9)&&!g.big){g.st='wander';g.t=0;const a=rnd()*6.28;g.tx=g.hx+Math.cos(a)*rr(2,7);g.tz=g.hz+Math.sin(a)*rr(2,7)}break;
 case'wander':if(agentMove(g,g.tx,g.tz,1.3,dt,g.rad,4)<.8||g.t>9){g.st='idle';g.t=0}break;
 case'patrol':{const w=g.patrol[g.pi];if(agentMove(g,w[0],w[1],1.6,dt,g.rad,4)<1.5){g.pi=(g.pi+1)%g.patrol.length;g.st='idle';g.t=0}break}
 case'alert':g.spd=lp(g.spd,0,.3);agentFace(g,g.ls[0],g.ls[1],dt,5);if(g.aware>=1){g.st='chase';g.t=0}else if(g.t>3.5&&g.aware<.3){g.st='idle';g.t=0}break;
 case'return':if(agentMove(g,g.hx,g.hz,g.big?2:3,dt,g.rad,4)<1.5||g.t>30){g.st='idle';g.t=0;g.aware=0}break;
 case'chase':{if(!P.alive||Math.hypot(g.x-g.hx,g.z-g.hz)>90||g.unseen>((g.alarmT||0)>GT.clock?20:8)){g.st='return';g.t=0;g.aware=0;break}
  if(archerChase(g,d,dt))break;
  const tx=g.unseen<1?P.x:g.ls[0],tz=g.unseen<1?P.z:g.ls[1];
  if(g.big){if(d<(g.chief?4.0:3.2)&&g.cd<=0&&P.st!=='down'){const r=Math.random();g.move=g.chief?(g.phase===2&&r<.3?'stomp':r<.6?'sweep':'smash'):'smash';if(g.move==='stomp')dangerRing(g.x,g.z,5.6,1.14);g.st='windup';g.t=0;g.hitDone=false;sfx.roar(.6);break}agentMove(g,tx,tz,g.chief&&g.phase===2?3.2:2.4,dt,g.rad,3);break}
  if(d<3.6&&g.unseen<1){const sp0=gobSlotPoint(g,3.0);if(sp0&&Math.abs(angd(g.slotA,Math.atan2(g.x-P.x,g.z-P.z)))>.9){g.st='circle';g.t=0;g.dur=1.2;break}// not on my side yet: work round first
   if(gobTokens()<2&&g.cd<=0&&P.st!=='down'&&P.st!=='getup'){gobStartSwing(g);break}
   if(/^(attack|heavy|runatk|charge)$/.test(P.st)&&Math.random()<dt*(GOBS.some(o=>o!==g&&!o.dead&&o.hostile()&&Math.hypot(o.x-P.x,o.z-P.z)<10)?2:4.5)){g.st='guard';g.t=0;break}// the hero swings: raise the guard
   if(d<1.25){if(Math.random()<dt*1.5){g.st='guard';g.t=0;break}agentMove(g,g.x+(g.x-P.x)/d*2,g.z+(g.z-P.z)/d*2,3.2,dt,g.rad,4);agentFace(g,P.x,P.z,dt,10);break}// too close: step back, keep facing
   const alone=!GOBS.some(o=>o!==g&&!o.dead&&o.hostile()&&Math.hypot(o.x-P.x,o.z-P.z)<10);if(Math.random()<dt*(alone?1.0:.4)){g.st='guard';g.t=0;break}g.st='circle';g.t=0;g.dur=rr(.35,.8);break}
  if(d<7.5&&g.unseen<1){const sp=gobSlotPoint(g,3.0);if(sp){agentMove(g,sp[0],sp[1],5.2,dt,g.rad,8);if(d<4.5)agentFace(g,P.x,P.z,dt,6);break}}// spread round the hero
  agentMove(g,tx,tz,5.6,dt,g.rad,8);break}
 case'aim':archerAim(g,d,dt);break;
 case'guard':g.spd=lp(g.spd,0,.3);agentFace(g,P.x,P.z,dt,10);if(g.t>1.1){g.st='chase';g.t=0;g.cd=Math.min(g.cd,.2)}break;
 case'circle':{const cur=Math.atan2(g.x-P.x,g.z-P.z),want=(g.flankT||0)>GT.clock?g.flankA:g.slotA,a=want!==undefined?cur+cl(angd(want,cur),-1.3*dt,1.3*dt):cur+.9*dt*(g.side||1),gx=P.x+Math.sin(a)*2.5,gz=P.z+Math.cos(a)*2.5;agentMove(g,gx,gz,3,dt,g.rad,6);agentFace(g,P.x,P.z,dt,9);
  if(g.t>g.dur||d>3.2){g.st='chase';g.t=0}break}
 case'windup':{const T=g.big?{smash:1.35,sweep:1.05,stomp:.95}[g.move||'smash']:g.peril?.72:g.cn?.26:(g.delay?.78:.46);
  if(!g.big&&gobFeint(g))break;
  if(!g.big){if(g.t<T*.85)agentFace(g,P.x,P.z,dt,12);if(d>1.7)agentMove(g,P.x,P.z,4.3,dt,g.rad,10);else g.spd=lp(g.spd,0,.4)}else{g.spd=lp(g.spd,0,.4);if(g.t<T*.7)agentFace(g,P.x,P.z,dt,2.2)}
  if(g.t>=T){g.st='strike';g.t=0;sfx.swing();if(!g.big){const L=cl(d-1.0,0,g.peril?4:2.4);g.lv=L/.2}}break}
 case'strike':{const T=g.big?(g.move==='sweep'?.42:.38):.2,u=g.t/T;
  if(!g.big){const p=collide(g.x+Math.sin(g.yaw)*(g.lv||0)*dt,g.z+Math.cos(g.yaw)*(g.lv||0)*dt,g.rad);g.x=p[0];g.z=p[1];const dd=Math.hypot(P.x-g.x,P.z-g.z);
   const fa=Math.abs(angd(Math.atan2(P.x-g.x,P.z-g.z),g.yaw));if(!g.hitDone&&u>.3&&dd<1.7&&(fa<1.35||dd<.9)){g.hitDone=true;{const r=hitPlayer({src:g,dmg:g.peril?13:7,guard:g.peril?99:18,dir:[Math.sin(g.yaw),Math.cos(g.yaw)],knock:g.peril?'down':'flinch',unblockable:!!g.peril,parryable:!g.peril});if(r==='block'||r==='parry'||r==='guardbreak')g.cn=0}}}
  else if(g.move==='stomp'){if(!g.hitDone&&u>=.5){g.hitDone=true;CAM.shake=Math.max(CAM.shake,.7);sfx.thud();spawnSparks(g.x,g.y+.2,g.z,24,[.6,.5,.4],7);if(d<5.6&&!P.air)hitPlayer({src:g,dmg:20,guard:40,dir:[P.x-g.x,P.z-g.z],knock:'down',power:1.2,parryable:false})}}
  else if(!g.hitDone){// the club must really touch the hero: segment (club) vs capsule (body) test every frame of the swing
   const seg=clubSeg(g),hit=segCapsule(seg[0],seg[1],[P.x,P.y+.2,P.z],[P.x,P.y+1.55,P.z],.42);if(hit){g.hitDone=true;hitPlayer({src:g,dmg:30,guard:62,dir:[Math.sin(g.yaw),Math.cos(g.yaw)],knock:'down',power:1.5})}}
  if(u>=1&&!g.big&&g.cn>0&&g.st==='strike'){g.cn--;g.st='windup';g.t=0;g.hitDone=false;g.peril=0;break}
  if(u>=1){g.peril=0;if(g.big){CAM.shake=Math.max(CAM.shake,d<9?.35:.1);sfx.thud();const tip=clubSeg(g)[1];spawnSparks(tip[0],hAt(tip[0],tip[2])+.1,tip[2],10,[.6,.5,.4],3)}g.st='recover';g.t=0;g.delay=0;g.feinted=0;g.cd=g.big?rr(1.4,2.2):rr(.5,1.1)}break}
 case'recover':g.spd=0;if(g.t>(g.big?1.15:.42)){g.st='chase';g.t=0}break;
 case'stagger':g.spd=0;if(g.t>(g.big?2.1:1.5)){g.st='chase';g.t=0}break;
 case'hop':g.spd=0;agentFace(g,P.x,P.z,dt,10);if(g.t>.42){g.st='windup';g.t=.18;g.hitDone=false;sfx.gobShout()}break;
 case'hurt':g.spd=0;if(g.t>.3){g.st='chase';g.t=0}break}
 // keep goblins apart
 for(const o of GOBS){if(o===g||o.dead)continue;const ex=g.x-o.x,ez=g.z-o.z,q=ex*ex+ez*ez,m=g.rad+o.rad;if(q<m*m&&q>1e-6){const k=Math.sqrt(q);g.x+=ex/k*(m-k)*.5;g.z+=ez/k*(m-k)*.5}}
 if(P.alive&&!P.air&&!g.held){const ex=g.x-P.x,ez=g.z-P.z,q=Math.hypot(ex,ez),mm=g.rad+.42;if(q<mm){const ux=q>1e-4?ex/q:-Math.sin(g.yaw),uz=q>1e-4?ez/q:-Math.cos(g.yaw),p=collide(P.x+ux*mm,P.z+uz*mm,g.rad);g.x=p[0];g.z=p[1]}}// bodies never overlap the hero
 g.y=hAt(g.x,g.z);if(g.spd>.2)g.ph+=g.spd*dt*(g.big?2.2:4.2)}
// small goblin swing: 40% two-hit combo, 18% a red unblockable lunge (危: dash away or sideways), always with a tell
function gobStartSwing(g){const ad=(g.adapt||0)>GT.clock;g.st='windup';g.t=0;g.hitDone=false;g.peril=Math.random()<(ad?.5:.18)?1:0;g.cn=g.peril?0:Math.random()<(ad?.75:.4)?1:0;g.delay=ad&&g.cn>0&&Math.random()<.7?1:0;// adapted: more 危, delayed second hit
 if(g.peril){sfx.charge();floatText(g.x,(g.y||0)+2,g.z,'危','crit');spawnSparks(g.x,(g.y||0)+1.3,g.z,6,[1,.15,.1],2)}else sfx.gobShout()}
function gobFK(g,time){const tilt=gobRootTilt(g),K=g.big?BIGM.K:GOBM.K,hipH=(K.th+K.sh2+.06)*g.sc,extra=tilt?rX(tilt):R3I,y=g.y+lp(hipH,g.big?.4:.15,Math.abs(Math.sin(tilt)));g.root=[g.x,y,g.z,extra];rigFK(g.R.def,gobPose(g,time),[g.x,y,g.z],g.yaw,g.sc,g.R.ob.bones,extra)}
function clubSeg(g){gobFK(g,GT.time);const d=g.R.def;return[boneW(d,8,[0,-.08,.3],g.sc),boneW(d,8,[0,-.08,1.75],g.sc)]}
// closest distance between segment AB (club) and segment CD (body axis) < r
function segCapsule(A,B,C,D,r){let best=1e9;for(let i=0;i<=8;i++){const t=i/8,p=[lp(A[0],B[0],t),lp(A[1],B[1],t),lp(A[2],B[2],t)],cd=vsub(D,C),u=cl(vdot(vsub(p,C),cd)/vdot(cd,cd),0,1),q=vadd(C,vmul(cd,u));best=Math.min(best,Math.hypot(...vsub(p,q)))}return best<r+.18}
// ---------- poses
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
 case'guard':{q.LsX=-1.5;q.LsY=.6;q.LeX=-1.4;q.RsX=-1.3;q.RsY=-.5;q.ReX=-1.2;q.spP=.35;q.hdP=-.2;q.LhX=-.5;q.LkX=.7;q.RhX=.3;q.RkX=.4;break}
 case'horn':{q.LsX=-2.2;q.LeX=-1.6;q.LsZ=.2;q.hdP=-.4;q.spP=-.2;q.RsX=-.3;break}
 case'stagger':case'hurt':{const k=Math.sin(g.t*14)*.3;q.spP=-.4+k*.3;q.hdP=-.5;q.RsX=-1.6;q.LsX=-1.4;q.LsZ=.6;q.RsZ=.6;q.hipP=-.15;q.LhX=.3;q.RkX=.5;break}
 case'choked':{const k=Math.sin(g.t*17);q.hdP=-.6;q.spP=-.35;q.RsX=-1.8+k*.5;q.LsX=-1.6-k*.5;q.LsZ=.7;q.RsZ=.7;q.LeX=-1.5;q.ReX=-1.5;q.LhX=.25+k*.3;q.RhX=-.2-k*.3;q.LkX=.4;q.RkX=.5;q.jaw=.8;break}
 case'pinned':q.LsX=-2.6;q.RsX=-2.6+Math.sin(g.t*20)*.3*Math.max(0,1-g.t);q.LsZ=.4;q.RsZ=.4;q.hdP=-.6;q.jaw=.6;break;
 case'escape':{const T=g.from==='pinned'?1.4:1.0,u2=g.t/T;if(g.from==='pinned'){q.LsX=lp(-2.6,0,u2);q.RsX=lp(-2.6,0,u2);q.LhX=lp(0,-1.4,sst(0,.5,u2))*(1-sst(.6,1,u2));q.LkX=lp(0,2.2,sst(0,.5,u2))*(1-sst(.6,1,u2));q.RhX=q.LhX*.7;q.RkX=q.LkX*.7;q.spP=lp(0,.8,sst(0,.5,u2))*(1-sst(.7,1,u2))}
  else{q.spP=.5*(1-u2);q.hdP=-.4;q.LhX=-.4;q.RkX=.5}break}
 case'dead':break}
 archerPose(g,q);return humanPose(q)}
// root tilt for lying states (face-down when pinned, on the back when dead)
function gobRootTilt(g){if(g.st==='pinned')return 1.45;if(g.st==='escape'&&g.from==='pinned')return 1.45*(1-sst(0,.85,g.t/1.4));if(g.st==='dead')return -1.45*sst(0,.6,g.t);return 0}
function drawGobs(time){for(const g of GOBS){const d=Math.hypot(g.x-P.x,g.z-P.z);if(d>140||(g.dead&&g.deadT>20)){rigHide(g.R);if(g.bowOb)g.bowOb.vis=false;continue}
  const rot=gobPose(g,time),tilt=gobRootTilt(g),K=g.big?BIGM.K:GOBM.K,hipH=(K.th+K.sh2+.06)*g.sc;
  const extra=tilt?rX(tilt):R3I,y=g.y+lp(hipH,g.big?.4:.15,Math.abs(Math.sin(tilt)));rigDraw(g.R,g.x,y,g.z,g.yaw,g.sc,rot,g.big?.9:.42,extra);drawGobBow(g);
  g.R.ob.flash=g.flash;g.R.ob.col=g.st==='stagger'||g.open()?[1.15,1.05,.8]:[1,1,1]}}
