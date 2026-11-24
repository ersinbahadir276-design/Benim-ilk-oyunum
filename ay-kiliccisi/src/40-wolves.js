// ===================== wolves: model, perception, behaviour =====================
const WG={},wolves=[],wslots=[],WSLOTS=9,W_UP=.32,W_LO=.3;
const WHIP=[[.14,-.12,.36,-1],[-.14,-.12,.36,-1],[.14,-.1,-.46,1],[-.14,-.1,-.46,1]];   // x,y,z,knee direction
function buildWolfGeo(){const fur=hex(0x7d8088),bel=hex(0xc2beb4),dk=hex(0x45474d),m3=(a,b,t)=>[lp(a[0],b[0],t),lp(a[1],b[1],t),lp(a[2],b[2],t)];
 const fc=(v,a)=>{const t=(1-Math.sin(a))/2;return m3(m3(bel,fur,sst(.15,.55,t)),dk,sst(.82,1,t)*.7)};
 const body=bake(loft([{y:-.68,rx:.08,rz:.09},{y:-.6,rx:.17,rz:.19},{y:-.35,rx:.2,rz:.23},{y:0,rx:.19,rz:.21},{y:.3,rx:.22,rz:.27},{y:.48,rx:.2,rz:.24},{y:.62,rx:.11,rz:.14}],12,3,{col:fc}),mtrs([0,0,0],[PI/2,0,0]));
 const neck=tint(tube([[0,.04,.46],[0,.18,.62],[0,.3,.76]],{r:t=>lp(.17,.115,t),seg:10,n:6}),fur);
 WG.body=geo(merge([body,neck]));
 const hd=[];hd.push(tint(sphere(12,9,d=>[d[0]*.118,d[1]*.11+.02,d[2]*.145+.06],{c:[0,.02,.06]}),fur));
 hd.push(tint(tube([[0,-.005,.13],[0,-.02,.25],[0,-.03,.35]],{r:t=>lp(.08,.048,t),seg:9,n:6}),m3(fur,bel,.35)));
 hd.push(tint(sphere(8,6,d=>[d[0]*.03,d[1]*.024-.018,d[2]*.03+.365],{c:[0,-.018,.365]}),[.08,.08,.1]));
 for(const s of[-1,1]){hd.push(tint(tube([[s*.065,.09,.0],[s*.085,.17,-.01],[s*.095,.24,-.02]],{r:t=>.05*Math.pow(1-t,.6),flat:.45,seg:7,n:6,wide:[1,0,0]}),m3(fur,dk,.4)));
  hd.push(tint(sphere(8,6,d=>[s*.068+d[0]*.02,.05+d[1]*.02,.155+d[2]*.014],{c:[s*.068,.05,.155]}),[1.5,1.1,.2]))}
 WG.head=geo(merge(hd));
 WG.jaw=geo(merge([tint(tube([[0,0,-.02],[0,-.008,.12],[0,-.012,.23]],{r:t=>lp(.055,.034,t),flat:.5,seg:8,n:6,wide:[1,0,0]}),m3(fur,bel,.5)),
  tint(tube([[0,.012,.05],[0,.012,.2]],{r:()=>.03,flat:.25,seg:6,n:3,wide:[1,0,0]}),[.95,.93,.9])]));
 WG.tail=geo(tint(tube([[0,0,0],[0,-.03,-.24],[0,-.12,-.5]],{r:t=>.03+.06*Math.sin(PI*(.15+.8*t)),seg:8,n:8}),m3(fur,dk,.25)));
 WG.up=geo(tint(tube([[0,.04,0],[0,-.16,0],[0,-W_UP,0]],{r:t=>lp(.085,.05,t),seg:8,n:5}),fur));
 WG.lo=geo(merge([tint(tube([[0,.02,0],[0,-W_LO+.03,0]],{r:t=>lp(.048,.036,t),seg:7,n:4}),m3(fur,bel,.3)),tint(sphere(8,6,d=>[d[0]*.05,-W_LO+.01+d[1]*.035,.03+d[2]*.07],{c:[0,-W_LO+.01,.03]}),dk)]));
 const sh=G();sh.P.push(0,0,0);sh.N.push(0,1,0);sh.C.push(1,1,1);sh.U.push(0,0);sh.W.push(0);for(let k=0;k<=16;k++){const a=k/16*2*PI;sh.P.push(Math.cos(a),0,Math.sin(a));sh.N.push(0,1,0);sh.C.push(1,1,1);sh.U.push(0,0);sh.W.push(0);if(k)sh.I.push(0,k+1,k)}
 WG.shadow=geo(sh);
 // sculpted wolf (tools/sculpt/models/wolf.mjs): one skinned mesh; the part matrices below become its 12 bones
 WG.skin=MODEL.wolf?sculptGeo('wolf'):null;
 if(WG.skin){const H=[0,.3,.76],J=[0,.245,.86];WG.bind=[[0,0,0],H,J,[0,.1,-.62],...WHIP.map(h=>[h[0],h[1],h[2]]),...WHIP.map(h=>[h[0],h[1]-W_UP,h[2]])];
  const mk=()=>({M:MID,vis:true,col:[1,1,1],flash:0});
  for(let i=0;i<WSLOTS;i++){const s={body:mk(),head:mk(),jaw:mk(),tail:mk(),legs:[[mk(),mk()],[mk(),mk()],[mk(),mk()],[mk(),mk()]],sh:obj(WG.shadow,{unlit:1,blend:1,col:[0,0,.03],noOff:0,shade:0}),w:null,
   sk:obj(WG.skin,{bones:new Float32Array(MAXB*12),out:.006,outCol:[.08,.08,.11],shade:.9,pbr:1,pos:[0,0,0],cull:150})};s.sh.alpha=.32;wslots.push(s)}return}
 for(let i=0;i<WSLOTS;i++){const o={out:.012,outCol:[.1,.1,.14],shade:.9},s={body:obj(WG.body,o),head:obj(WG.head,o),jaw:obj(WG.jaw,o),tail:obj(WG.tail,o),legs:[],sh:obj(WG.shadow,{unlit:1,blend:1,col:[0,0,.03],noOff:0,shade:0}),w:null};
  for(let l=0;l<4;l++)s.legs.push([obj(WG.up,o),obj(WG.lo,o)]);s.sh.alpha=.32;wslots.push(s)}}
function mkWolf(x,z,o={}){const w={x,z,y:hAt(x,z),yaw:o.yaw===undefined?rnd()*6.28:o.yaw,hx:x,hz:z,st:'idle',t:rr(0,3),hp:60,max:60,sc:o.sc||rr(.94,1.08),ph:rnd()*6,spd:0,tx:x,tz:z,aware:0,ls:[x,z],unseen:0,cd:rr(.3,1.5),
  pitch:0,roll:0,air:0,crouch:0,jaw:0,hyaw:0,hpit:0,flash:0,kx:0,kz:0,tame:false,trust:0,calm:0,dead:0,strafe:rnd()<.5?1:-1,alpha:!!o.alpha,bites:0,bt:0,part:null,sx:0,sz:0,ax:0,az:0,dodged:false,gone:0,tail:0};
 if(w.alpha){w.sc=1.22;w.hp=w.max=95}wolves.push(w);return w}
function spawnWolves(){mkWolf(SPAWN[0]-9,SPAWN[2]-30,{yaw:PI});                                         // a lone wolf with its back to the spawn
 mkWolf(4,250);mkWolf(13,244);                                                                             // a pair on the way to the kingdom
 for(let p=0;p<12;p++){let cx,cz,r,ok;do{cx=rr(-640,640);cz=rr(-640,640);r=Math.hypot(cx,cz);ok=r>225&&r<655&&Math.hypot(cx-SPAWN[0],cz-SPAWN[2])>75}while(!ok);
  const n=2+Math.floor(rnd()*3);for(let i=0;i<n;i++){const[x,z]=collide(cx+rr(-9,9),cz+rr(-9,9),.6);if(depthAt(x,z)>0||waterAt(x,z)>-50&&hAt(x,z)<waterAt(x,z)+.6)continue;mkWolf(x,z,{alpha:i===0&&p%4===0})}}
 const R=mkRng(4242);for(const[cx,cz,n]of[[-700,-300,4],[-1100,200,3],[-900,700,4],[-300,1100,3],[300,-500,3],[-250,-860,3],[1000,-700,3],[1150,-150,3],[450,1150,3],[-1200,-900,3]]){const k=n;for(let i=0;i<k;i++){const[x,z]=collide(cx+(R()-.5)*18,cz+(R()-.5)*18,.6);if(depthAt(x,z)>0)continue;mkWolf(x,z,{alpha:i===0&&R()<.4})}}}
function wolfParried(w){w.st='recover';w.t=-.65;w.air=0;w.pitch=0;w.kx=-Math.sin(w.yaw)*7;w.kz=-Math.cos(w.yaw)*7;w.flash=1;w.cd=2.2;w.resolved=true}
const W_HOSTILE={howl:1,chase:1,windup:1,pounce:1,pin:1,circle:1,recover:1,hurt:1,evade:1,stalk:1,bitewind:1,rush:1,bite:1,retreat:1,hamstring:1,armleap:1,armlatch:1,feint:1,flee:1};const hostileSt=w=>!!W_HOSTILE[w.st];
const tokenBusy=()=>wolves.some(w=>!w.tame&&!w.dead&&(w.st==='windup'||w.st==='pounce'||w.st==='pin'||w.st==='bitewind'||w.st==='rush'||w.st==='bite'));
// can this wolf see the player right now? only a cone in front, blocked by trees
function wolfSees(w,P){if(!P.alive||w.calm>0)return false;const dx=P.x-w.x,dz=P.z-w.z,d=Math.hypot(dx,dz),R=(P.crouch?13:27)*(w.alpha?1.15:1);
 if(d>R)return false;if(Math.abs(angd(Math.atan2(dx,dz),w.yaw+w.hyaw))>SENSE.fov)return false;return los(w.x,w.z,P.x,P.z,1.0)}
function wolfMove(w,tx,tz,speed,dt,turn=7){const dx=tx-w.x,dz=tz-w.z,d=Math.hypot(dx,dz);if(d<.05){w.spd=lp(w.spd,0,.2);return d}
 const ty=Math.atan2(dx,dz);w.yaw+=angd(ty,w.yaw)*Math.min(1,dt*turn);const f=Math.max(.25,Math.cos(angd(ty,w.yaw))),s=speed*f;
 const p=collide(w.x+Math.sin(w.yaw)*s*dt,w.z+Math.cos(w.yaw)*s*dt,.42*w.sc);w.x=p[0];w.z=p[1];w.spd=lp(w.spd,s,.25);w.ph+=s*dt*(speed>4?2.3:4.4);return d}
function wolfFace(w,tx,tz,dt,rate=8){w.yaw+=angd(Math.atan2(tx-w.x,tz-w.z),w.yaw)*Math.min(1,dt*rate)}
function wolfHurt(w,dmg,dirx,dirz,P){if(w.dead)return false;w.hp-=dmg;w.flash=1;w.kx=dirx*5.5;w.kz=dirz*5.5;w.aware=1;w.calm=0;
 if(w.hp<=0){w.dead=.001;w.st='dead';w.t=0;w.air=0;w.pitch=0;if(P.pinBy===w)P.pinBy=null;return true}
 if(w.st==='pin'){P.pinBy=null}
 // no stun-lock: a wolf already committed to an attack shrugs the hit off; the second hit in a row makes it leap away and counter
 if(!w.tame){w.combo=GT.clock-(w.lastHit||-9)<2.5?(w.combo||0)+1:1;w.lastHit=GT.clock;
  if((w.st==='windup'||w.st==='pounce')&&w.combo<4){w.kx*=.2;w.kz*=.2}
  else if(w.combo>=2&&w.st!=='pin'){w.st='evade';w.t=0;w.air=0;w.pitch=0;w.kx=dirx*9;w.kz=dirz*9;w.combo=0}
  else{w.st='hurt';w.t=0;w.air=0;w.pitch=0}}
 for(const o of wolves)if(o!==w&&!o.dead&&!o.tame&&o.calm<=0&&Math.hypot(o.x-w.x,o.z-w.z)<16&&!hostileSt(o)){o.st='alert';o.t=0;o.ls=[P.x,P.z];o.aware=Math.max(o.aware,.6)}
 return false}
function updateWolf(w,P,dt,GS){if(w.clash&&!w.dead&&clashTick(w,dt))return;
 w.flash=Math.max(0,w.flash-dt*6);w.calm=Math.max(0,w.calm-dt);w.cd-=dt;w.t+=dt;
 if(Math.abs(w.kx)+Math.abs(w.kz)>.05&&w.st!=='pin'){const p=collide(w.x+w.kx*dt,w.z+w.kz*dt,.42);w.x=p[0];w.z=p[1];const k=Math.exp(-dt*7);w.kx*=k;w.kz*=k}
 const dx=P.x-w.x,dz=P.z-w.z,d=Math.hypot(dx,dz);
 if(w.st==='dead'){w.dead+=dt;w.roll=lp(w.roll,1.45,Math.min(1,dt*7));w.crouch=lp(w.crouch,.75,Math.min(1,dt*5));w.spd=0;w.jaw=.3;
  if(w.dead>150&&d>90&&!w.free){w.dead=0;w.st='idle';w.hp=w.max;w.x=w.hx;w.z=w.hz;w.roll=0;w.crouch=0;w.aware=0;w.tame=false;w.trust=0}w.y=hAt(w.x,w.z);return}
 w.roll=lp(w.roll,0,.2);
 if(w.st==='mounted'){w.spd=0;w.air=0;w.pitch=lp(w.pitch,.15,.2);w.crouch=lp(w.crouch,.85,.2);w.jaw=.7;w.hyaw=Math.sin(w.t*17)*.45*Math.max(0,1-w.t/2.2);w.tail=Math.sin(w.t*20)*.6;w.y=hAt(w.x,w.z);return}
 // ---------------- tamed companions
 if(w.tame){let foe=null,fd=15;for(const o of wolves)if(!o.tame&&!o.dead&&hostileSt(o)){const q=Math.hypot(o.x-w.x,o.z-w.z);if(q<fd){fd=q;foe=o}}
  w.crouch=lp(w.crouch,0,.2);w.jaw=lp(w.jaw,0,.2);
  if(foe){if(fd>1.5)wolfMove(w,foe.x,foe.z,6.4,dt);else{wolfFace(w,foe.x,foe.z,dt);w.spd=lp(w.spd,0,.3);if(w.cd<=0){w.cd=.95;w.jaw=.8;const k=Math.hypot(foe.x-w.x,foe.z-w.z)||1;if(wolfHurt(foe,9,(foe.x-w.x)/k,(foe.z-w.z)/k,P))GS.onKill(foe,true)}}}
  else{const i=wolves.filter(o=>o.tame).indexOf(w),a=P.yaw+PI+(i-1)*.7,gx=P.x+Math.sin(a)*2.6,gz=P.z+Math.cos(a)*2.6,q=Math.hypot(gx-w.x,gz-w.z);
   if(q>1.2)wolfMove(w,gx,gz,q>9?7:q>3?4.5:2,dt);else{w.spd=lp(w.spd,0,.2);wolfFace(w,P.x+Math.sin(P.yaw)*4,P.z+Math.cos(P.yaw)*4,dt,3)}
   if(d>60){const p=collide(P.x+rr(-3,3),P.z+rr(-3,3),.5);w.x=p[0];w.z=p[1]}}
  w.tail=Math.sin(w.t*9)*.5;w.y=hAt(w.x,w.z);return}
 // ---------------- perception
 w.seeT=(w.seeT||rnd()*.12)-dt;if(w.seeT<=0){w.seeT=.12;w.sees=wolfSees(w,P)}const sees=w.sees,safe=Math.hypot(P.x,P.z)<150,was=w.aware;
 if(sees||hostileSt(w)&&d<12&&P.alive){w.ls=[P.x,P.z];w.unseen=0;if(!hostileSt(w))w.aware=Math.min(1,w.aware+dt*(P.crouch?.5:1)/(.22+d/32))}else{w.unseen+=dt;if(!hostileSt(w)&&!wolfSmell(w,d,dt))w.aware=Math.max(0,w.aware-dt*.35)}
 if(!hostileSt(w)&&w.hp<w.max&&w.st!=='flee')w.hp=Math.min(w.max,w.hp+w.max*.01*dt);// wounds close slowly away from a fight
 if(sees&&was<.5&&w.aware>=.5&&!hostileSt(w)){GS.onSpotted(w);for(const o of wolves)if(o!==w&&!o.dead&&!o.tame&&o.calm<=0&&!hostileSt(o)&&o.st!=='mounted'&&Math.hypot(o.x-w.x,o.z-w.z)<18){o.st='alert';o.t=0;o.ls=[P.x,P.z];o.aware=Math.max(o.aware,.55)}}
 if(!hostileSt(w)&&w.calm<=0&&!sees&&((P.noise>0&&d<P.noise)||(P.sprinting&&d<9))&&w.st!=='alert'&&w.st!=='search'){w.st='alert';w.t=0;w.ls=[P.x,P.z]}
 w.tail=lp(w.tail,0,.1);
 switch(w.st){
 case'rest':case'roam':case'follow':w.jaw=lp(w.jaw,0,.2);if(w.aware>.3){w.st='alert';w.t=0;w.crouch=0}else if(!wolfCalm(w,dt)){w.st='idle';w.t=0}break;
 case'idle':w.spd=lp(w.spd,0,.2);w.crouch=lp(w.crouch,w.calm>0?.5:0,.1);w.hyaw=Math.sin(w.t*.7+w.ph)*.5;w.jaw=lp(w.jaw,0,.2);
  if(w.aware>.3){w.st='alert';w.t=0}else if(wolfCalm(w,dt)){}else if(w.t>rr(3,7)&&w.calm<=0){w.st='wander';w.t=0;const a=rnd()*6.28,r=rr(4,16);w.tx=w.hx+Math.cos(a)*r;w.tz=w.hz+Math.sin(a)*r}break;
 case'wander':w.hyaw=lp(w.hyaw,0,.1);if(w.aware>.3){w.st='alert';w.t=0}else if(wolfMove(w,w.tx,w.tz,1.5,dt,3)<1||w.t>12){w.st='idle';w.t=0}break;
 case'alert':w.spd=lp(w.spd,0,.3);w.hyaw=lp(w.hyaw,0,.2);wolfFace(w,w.ls[0],w.ls[1],dt,4);w.crouch=lp(w.crouch,.15,.2);
  if(w.aware>=1&&!safe){const m=wolfMood(w);if(!w.boss&&(m.aggr<m.fear+.15||(!w.alpha&&Math.random()<.22))&&w.st!=='watch'){w.st='watch';w.t=0;w.cover=wolfCover(w);w.watchT=rr(4,9);break}// sometimes it only watches
   w.st='stalk';w.t=0;GS.onAggro(w);for(const o of wolves)if(o!==w&&!o.dead&&!o.tame&&o.calm<=0&&!hostileSt(o)&&Math.hypot(o.x-w.x,o.z-w.z)<17){o.st='alert';o.t=0;o.ls=[P.x,P.z];o.aware=Math.max(o.aware,.55)}}
  else if(w.t>2.2&&w.aware<.3){w.st=w.unseen>1.5&&Math.hypot(w.ls[0]-w.x,w.ls[1]-w.z)>3?'search':'idle';w.t=0}break;
 case'chase':case'stalk':case'circle':if(safe||P.st==='dead'){w.st='return';w.t=0;w.aware=0;break}w.hyaw=lp(w.hyaw,0,.2);w.jaw=lp(w.jaw,.25,.1);if(wolfTryTrick(w,d,dt))break;wolfEngage(w,d,dt,GS);break;
 case'hamstring':case'armleap':case'armlatch':case'feint':if(P.st==='dead'){w.st='return';w.t=0;w.air=0;break}wolfTrick(w,d,dt,GS);break;
 case'bitewind':case'rush':case'bite':if(safe||P.st==='dead'){w.st='return';w.t=0;w.aware=0;break}wolfBite(w,d,dt,GS);break;
 case'retreat':case'watch':case'flee':if(w.st==='watch'&&d<6&&w.aware>=1){w.st='circle';w.t=0;break}wolfAway(w,d,dt);break;
 case'windup':w.spd=lp(w.spd,0,.4);w.crouch=lp(w.crouch,1,Math.min(1,dt*9));w.jaw=lp(w.jaw,.5,.2);w.tail=-.5;
  if(w.t<.62){wolfFace(w,P.x,P.z,dt,10);const lead=(.8-w.t)+.3;w.ax=P.x+P.vx*lead;w.az=P.z+P.vz*lead}
  if(w.t>=.8){let jx=w.ax-w.x,jz=w.az-w.z,jl=Math.hypot(jx,jz)||1;const L=cl(jl+.4,2.5,8);w.sx=w.x;w.sz=w.z;w.ax=w.x+jx/jl*L;w.az=w.z+jz/jl*L;w.yaw=Math.atan2(jx,jz);w.st='pounce';w.t=0;GS.onPounce(w)}break;
 case'pounce':{const u=Math.min(1,w.t/.5);w.x=lp(w.sx,w.ax,u);w.z=lp(w.sz,w.az,u);w.air=4*1.15*u*(1-u);w.pitch=lp(-.55,.5,u);w.crouch=lp(w.crouch,0,.3);w.jaw=.9;w.spd=0;
  const hx=w.x+Math.sin(w.yaw)*.55,hz=w.z+Math.cos(w.yaw)*.55,hd=Math.hypot(P.x-hx,P.z-hz);
  if(P.st==='dodge'&&!w.dodged&&!w.resolved){w.dodged=true;w.resolved=true;GS.onDodged(w)}// a dodge started during the leap always makes it miss
  if(u>.18&&u<.85&&hd<1.15&&!w.resolved&&!w.dodged&&P.st!=='down'&&P.st!=='getup'&&P.st!=='dead'){const h=w.air,r=hitPlayer({src:w,dmg:4+(w.alpha?2:0),guard:30,dir:[Math.sin(w.yaw),Math.cos(w.yaw)],knock:'down',power:1,pin:true,name:'kurt'});
   if(r==='iframe'){if(!w.dodged){w.dodged=true;w.resolved=true;GS.onDodged(w)}}else{w.resolved=true;if(r==='hit'&&P.alive){GS.onPin(w,h);break}if(r==='block'||r==='guardbreak'){w.st='recover';w.t=0;w.air=0;w.pitch=0;w.kx=-Math.sin(w.yaw)*6;w.kz=-Math.cos(w.yaw)*6;w.cd=rr(1.4,2);break}if(r==='parry')break}}
  if(u>=1){const p=collide(w.x,w.z,.42);w.x=p[0];w.z=p[1];w.air=0;w.pitch=0;w.st='recover';w.t=0;w.cd=rr(1.4,2.4);w.kx=Math.sin(w.yaw)*4;w.kz=Math.cos(w.yaw)*4;if(!w.dodged&&hd>1.05){w.dodged=true;GS.onMiss(w)}}break}
 case'pin':w.spd=0;w.air=0;w.crouch=lp(w.crouch,.45,.2);w.pitch=lp(w.pitch,.35,.2);w.bt-=dt;w.jaw=lp(w.jaw,.15,.3);
  if(P.pinBy!==w||P.st!=='down'){if(P.pinBy===w)P.pinBy=null;w.st='recover';w.t=0;w.pitch=0;w.cd=rr(1.5,2.5);break}
  if(w.bt<=0){w.bt=.62;w.bites++;w.jaw=1;GS.onBite(w);if(w.bites>=4){P.pinBy=null;w.st='recover';w.t=.3;w.pitch=0;w.cd=rr(2,3);w.kx=-Math.sin(w.yaw)*5;w.kz=-Math.cos(w.yaw)*5}}break;
 case'recover':w.spd=lp(w.spd,0,.2);w.crouch=lp(w.crouch,.35,.2);w.pitch=lp(w.pitch,0,.3);w.jaw=lp(w.jaw,.3,.2);w.hyaw=Math.sin(w.t*14)*.25*(1-w.t);if(w.t>1.05){w.st='circle';w.t=0;w.hyaw=0}break;
 case'evade':{w.spd=0;w.air=Math.max(0,Math.sin(Math.min(1,w.t/.4)*PI)*.45);w.crouch=lp(w.crouch,.3,.3);wolfFace(w,P.x,P.z,dt,10);
  if(w.t>.5){w.air=0;w.st='bitewind';w.t=.18;w.resolved=false}break}// second hit in a row: leap away, then a quick counter-bite
 case'hurt':w.spd=0;w.crouch=lp(w.crouch,.4,.4);w.jaw=.6;if(w.t>.24){w.st='chase';w.t=0;w.unseen=0;w.ls=[P.x,P.z];if(w.cd<.5)w.cd=.5}break;
 case'search':w.crouch=lp(w.crouch,.1,.1);if(w.aware>=1){w.st='chase';w.t=0}else if(wolfMove(w,w.ls[0],w.ls[1],3.2,dt,4)<1.5){w.spd=lp(w.spd,0,.3);w.hyaw=Math.sin(w.t*1.8)*.9;if(w.t>6){w.st='return';w.t=0;w.aware=0}}else if(w.t>14){w.st='return';w.t=0}break;
 case'return':w.hyaw=lp(w.hyaw,0,.1);w.crouch=lp(w.crouch,0,.1);w.jaw=lp(w.jaw,0,.1);if(w.aware>.3&&!safe){w.st='alert';w.t=0}else if(wolfMove(w,w.hx,w.hz,2.6,dt,3)<2||w.t>40){w.st='idle';w.t=0}break}
 // keep wolves out of the kingdom and apart from each other
 {const rc=Math.hypot(w.x,w.z-1700);if(rc<300&&w.st!=='pin'){w.x*=1;w.z=1700+(w.z-1700)*300/rc;w.x=w.x*300/rc}}/* and out of the capital */const r=Math.hypot(w.x,w.z);if(r<165&&w.st!=='pin'&&w.st!=='armlatch'){w.x*=165/r;w.z*=165/r}
 for(const o of wolves){if(o===w||o.dead||o.st==='pin'||w.st==='pin'||w.st==='pounce')continue;const ex=w.x-o.x,ez=w.z-o.z,q=ex*ex+ez*ez;if(q<.8&&q>1e-6){const k=Math.sqrt(q);w.x+=ex/k*(.9-k)*.5;w.z+=ez/k*(.9-k)*.5}}
 w.y=hAt(w.x,w.z)}
// ---------------- rendering: assign the nearest wolves to render slots and pose their parts
function mroty(m,x,y,z,rx,ry,rz){return mmul(m,mtrs([x,y,z],[rx,ry,rz]))}
function drawWolves(P,time){const near=wolves.filter(w=>!(w.dead>8)).map(w=>[Math.hypot(w.x-P.x,w.z-P.z),w]).filter(a=>a[0]<150).sort((a,b)=>a[0]-b[0]).slice(0,WSLOTS);
 for(let i=0;i<WSLOTS;i++){const s=wslots[i],e=near[i],vis=!!e;if(s.sk)s.sk.vis=vis;s.body.vis=s.head.vis=s.jaw.vis=s.tail.vis=s.sh.vis=vis;for(const l of s.legs)l[0].vis=l[1].vis=vis;s.w=vis?e[1]:null;if(!vis)continue;
  const w=e[1],sc=w.sc,moving=w.spd>.3,run=w.spd>4,bob=moving?Math.abs(Math.sin(w.ph))*(run?.05:.02):Math.sin(time*2+w.ph)*.006,H=(.66-w.crouch*.2+bob)*sc,sink=w.dead>4?(w.dead-4)*.25:0;
  let M=mmul(mtrs([w.x,w.y+H+w.air-sink+(w.roll*-.42*sc),w.z],[0,w.yaw,0]),mtrs([0,0,0],[w.pitch,0,0]));M=mmul(M,mtrs([0,0,0],[0,0,w.roll]));
  for(let k=0;k<12;k++)M[k]*=sc;
  const tintc=w.warg?[.62,.42,.36]:w.white?[1.9,1.9,2.0]:w.tame?[.9,1,1.12]:w.alpha?[.5,.5,.56]:[1,1,1],fl=w.flash;
  s.body.M=M;s.head.M=mroty(M,0,.3,.76,w.hpit+(w.st==='pin'?.5+Math.sin(time*30)*.12*w.jaw:w.st==='windup'?.25:0),w.hyaw+(w.st==='pin'?Math.sin(time*26)*.3*w.jaw:0),0);
  s.jaw.M=mroty(s.head.M,0,-.055,.1,w.jaw*.75,0,0);s.tail.M=mroty(M,0,.1,-.62,w.st==='chase'||w.st==='pounce'?.5:w.st==='windup'?-.3:.1+Math.sin(time*2+w.ph)*.1,w.tail+Math.sin(time*(w.tame?10:3)+w.ph)*(w.tame?.5:.12),0);
  for(const o of[s.body,s.head,s.jaw,s.tail]){o.col=tintc;o.flash=fl}
  for(let l=0;l<4;l++){const hp=WHIP[l],o=s.legs[l],diag=(l===0||l===3)?0:PI,phase=w.ph+(run?(l<2?0:2.4)+(l%2?.5:0):diag);let au,al;
   if(w.air>.05||w.dead){const fr=l<2;au=w.dead?(fr?-.5:.6):(fr?-1.1:1.0)*(w.st==='pounce'?1:.4);al=w.dead?.5:(fr?.5:-.3)}
   else{const hw=mpt(M,hp),gy=hAt(hw[0],hw[2]),stride=moving?(run?.26:.14):0,sw=Math.sin(phase)*stride,lift=moving?Math.max(0,Math.cos(phase))*(run?.16:.07):0;
    let hh=Math.max(.12,(hw[1]-gy)/sc-lift);const L=W_UP+W_LO,dd=Math.min(Math.hypot(hh,sw),L-.002),ga=Math.atan2(sw,hh),A=Math.acos(cl((W_UP*W_UP+dd*dd-W_LO*W_LO)/(2*W_UP*dd),-1,1)),K=Math.acos(cl((W_UP*W_UP+W_LO*W_LO-dd*dd)/(2*W_UP*W_LO),-1,1));
    au=-(ga+hp[3]*A)-w.pitch;al=hp[3]*(PI-K)}
   o[0].M=mroty(M,hp[0],hp[1],hp[2],au,0,0);o[1].M=mroty(o[0].M,0,-W_UP,0,al,0,0);o[0].col=o[1].col=tintc;o[0].flash=o[1].flash=fl}
  if(s.sk){const parts=[s.body,s.head,s.jaw,s.tail,s.legs[0][0],s.legs[1][0],s.legs[2][0],s.legs[3][0],s.legs[0][1],s.legs[1][1],s.legs[2][1],s.legs[3][1]],B=s.sk.bones;
   parts.forEach((p,i)=>{const M=p.M,b=WG.bind[i],q=i*12;for(let r=0;r<3;r++){B[q+r*4]=M[r];B[q+r*4+1]=M[4+r];B[q+r*4+2]=M[8+r];B[q+r*4+3]=M[12+r]-(M[r]*b[0]+M[4+r]*b[1]+M[8+r]*b[2])}});
   s.sk.vis=true;s.sk.col=tintc;s.sk.flash=fl;s.sk.pos=[w.x,w.y,w.z]}
  const ss=.62*sc*(1-Math.min(.6,w.air*.35));s.sh.M=mtrs([w.x,w.y+.06,w.z],[0,w.yaw,0]);s.sh.M[0]*=ss;s.sh.M[2]*=ss;s.sh.M[8]*=ss*1.6;s.sh.M[10]*=ss*1.6;s.sh.vis=!(w.dead>4)}}
