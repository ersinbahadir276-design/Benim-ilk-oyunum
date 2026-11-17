// ===================== dungeon monsters: 10 kinds + 3 bosses, each with its own readable moves =====================
// Every attack has a tell (a pose, a ground marker or the red 危 mark for attacks you cannot block — dodge them).
// Skeletons fall apart and pull themselves back together unless finished with a heavy blow; shield skeletons block
// from the front; mages keep their distance, blink away and raise the dead; ghouls play dead and pounce; knights are
// slow, heavy and punish button mashing; golems shrug off light hits but expose their rune core after a slam;
// spiders leap and spit webs that slow you; rats come in packs and carry plague (poison).
const MONS=[],DPROJ=[],DPROJP=[],DRINGS=[],MM={},MPOOL={};
const MT={
 skel:{n:'İskelet Asker',m:'skeleton',hp:72,spd:3.3,rad:.36,sc:1,pk:'skel',xp:30,moves:['slash','combo'],rise:.45},
 skelS:{n:'Kalkanlı İskelet',m:'skeleton',hp:90,spd:2.8,rad:.4,sc:1.05,pk:'shield',xp:40,moves:['slash','bash'],shield:1,rise:.3},
 skelA:{n:'İskelet Okçu',m:'skeleton',hp:55,spd:3,rad:.35,sc:.98,pk:'skel',xp:32,archer:1,moves:['slash'],rise:.3},
 skmage:{n:'Kemik Büyücü',m:'skmage',hp:62,spd:2.7,rad:.36,sc:1,pk:'mage',xp:55,caster:1,moves:['bolt','summon']},
 ghoul:{n:'Hortlak',m:'ghoul',hp:64,spd:5.6,rad:.38,sc:1,pk:'ghoul',xp:38,moves:['claw','lunge'],feral:1,bleed:1},
 knight:{n:'Lanetli Şövalye',m:'knight',hp:300,spd:2.4,rad:.5,sc:1.12,pk:'knight',xp:150,elite:1,moves:['heavy3','thrust','slash'],armor:1},
 golem:{n:'Taş Golem',m:'golem',hp:480,spd:1.7,rad:.95,sc:1.3,pk:'golem',xp:180,elite:1,big:1,moves:['slam','sweep','rock'],stone:1},
 spider:{n:'Mağara Örümceği',m:'spider',quad:1,hp:80,spd:5.2,rad:.6,sc:1.05,pk:'spider',xp:40,moves:['bite','leap','web']},
 spiderling:{n:'Yavru Örümcek',m:'spider',quad:1,hp:20,spd:6,rad:.28,sc:.42,pk:'tiny',xp:8,moves:['bite'],feral:1},
 rat:{n:'Veba Sıçanı',m:'rat',quad:1,hp:32,spd:5.8,rad:.34,sc:.68,pk:'tiny',xp:12,moves:['bite'],poison:1,feral:1},
 boneking:{n:'KEMİK KRAL',sub:'Mezarın tacı onu seçti',m:'skeleton',hp:1100,spd:3.0,rad:.75,sc:1.75,pk:'bossSk',boss:1,big:1,xp:600,moves:['slash','combo','summon','storm'],tint:[1.2,.95,.55],uniq:'boneking',armor:1},
 brood:{n:'ÖRÜMCEK ANA',sub:'Ağ Mührünün bekçisi',m:'spider',quad:1,hp:1400,spd:4.2,rad:1.35,sc:2.4,pk:'bossSp',boss:1,big:1,xp:900,moves:['bite','leap','web','eggs'],tint:[.8,.7,1.05],uniq:'brood',armor:1},
 keeper:{n:'MÜHÜR BEKÇİSİ',sub:'Rün Mührü uyanıyor',m:'golem',hp:2000,spd:1.9,rad:1.25,sc:1.8,pk:'bossGo',boss:1,big:1,xp:1300,moves:['slam','sweep','rock','runes'],tint:[.8,.92,1.25],uniq:'keeper',stone:1,armor:1}};
Object.assign(POSMAX,{skel:60,shield:95,mage:45,ghoul:50,knight:170,golem:260,spider:65,tiny:20,bossSk:430,bossSp:480,bossGo:620});
// move book: r = range that triggers it (scaled by size), w = wind-up, a = active, rc = recovery, cd = own cooldown
const MV={
 slash:{r:2.2,w:.55,a:.22,rc:.5,dmg:10,gd:22,kn:'flinch',arc:1.1},
 combo:{r:2.3,w:.6,a:.2,rc:.6,dmg:9,gd:20,kn:'flinch',arc:1.1,n:2},
 heavy3:{r:2.8,w:.85,a:.24,rc:.9,dmg:16,gd:40,kn:'flinch',arc:1.2,n:3,last:'down'},
 thrust:{r:5,min:2.5,w:1.0,a:.35,rc:1.1,dmg:24,gd:99,kn:'down',arc:.5,peril:1,lunge:11,cd:6},
 bash:{r:1.9,w:.45,a:.18,rc:.5,dmg:7,gd:48,kn:'flinch',arc:1.2},
 claw:{r:1.9,w:.3,a:.15,rc:.35,dmg:7,gd:16,kn:'flinch',arc:1.2},
 lunge:{r:6.5,min:2.8,w:.5,a:.42,rc:.7,dmg:11,gd:28,kn:'down',leap:1,cd:4},
 bite:{r:1.5,w:.32,a:.15,rc:.4,dmg:6,gd:14,kn:'flinch',arc:1.3},
 leap:{r:7.5,min:3,w:.55,a:.45,rc:.8,dmg:12,gd:30,kn:'down',leap:1,cd:5},
 web:{r:13,min:4,w:.6,a:.1,rc:.5,proj:'web',cd:6},
 bolt:{r:16,min:3,w:.9,a:.1,rc:.6,proj:'bolt',cd:2.4},
 summon:{r:22,w:1.3,a:.1,rc:.8,cd:20,summon:1},
 slam:{r:3.0,w:1.15,a:.2,rc:1.5,dmg:22,gd:50,kn:'down',ring:3.4,open:1},
 sweep:{r:3.3,w:.95,a:.3,rc:.9,dmg:18,gd:44,kn:'down',arc:1.7},
 rock:{r:18,min:6,w:1.0,a:.1,rc:.8,proj:'rock',cd:5},
 storm:{r:20,w:1.1,a:.1,rc:1.0,cd:11,storm:1,p2:1},
 eggs:{r:20,w:1.0,a:.1,rc:.8,cd:16,eggs:1,p2:1},
 runes:{r:20,w:1.2,a:.1,rc:1.0,cd:9,runes:1,p2:1}};
const MON_HOSTILE={chase:1,circle:1,windup:1,strike:1,recover:1,stagger:1,hurt:1,aim:1,leap:1,open:1,hop:1,rise:1,escape:1};
const QB=(()=>{const H=[0,.3,.76],J=[0,.245,.86];return[[0,0,0],H,J,[0,.1,-.62],...WHIP.map(h=>[h[0],h[1],h[2]]),...WHIP.map(h=>[h[0],h[1]-W_UP,h[2]])]})();
const MKIND={skeleton:'villager',skmage:'villager',ghoul:'villager',knight:'guard',golem:'bigGoblin'};
function monModel(name){if(MM[name])return MM[name];let M;if(name==='spider'||name==='rat')M={quad:1,geo:sculptGeo(name)};else{const K=humanGeoK(MKIND[name]),def=humanDef(K);M={def,geo:sculptGeo(name),K,binv:bindInv(def,HBIND)}}MM[name]=M;return M}
let shieldGeo=null;
function monRender(m){const name=m.T.m,M=monModel(name),pool=MPOOL[name]||(MPOOL[name]=[]);let R=pool.find(r=>!r.used);
 if(!R){if(M.quad){R={quad:1,sk:obj(M.geo,{bones:new Float32Array(MAXB*12),out:.006,outCol:[.05,.04,.05],shade:.9,pbr:1,pos:[0,0,0],cull:70}),sh:obj(WG.shadow,{unlit:1,blend:1,col:[0,0,.03],noOff:0,shade:0,pos:[0,0,0],cull:70})};R.sh.alpha=.32;R.sk.dun=R.sh.dun=1}
  else{R=rigObj(M,{out:.01,cull:70,outCol:[.04,.04,.05]});R.ob.dun=R.sh.dun=1}pool.push(R)}
 R.used=1;const o=R.quad?R.sk:R.ob;o.col=m.T.tint||[1,1,1];
 if(m.T.shield&&!R.shield){if(!shieldGeo){const face=sphere(14,8,d=>[d[0]*.32,d[1]*.32,d[2]*.045],{c:[0,0,0]});tint(face,[.36,.27,.17]);const rim=tube([[0,0,-.04],[0,0,.04]],{r:()=>.325,seg:14,n:2});tint(rim,[.42,.42,.45]);const boss=sphere(8,6,d=>[d[0]*.08,d[1]*.08,.04+Math.abs(d[2])*.06],{c:[0,0,.04]});tint(boss,[.55,.55,.58]);shieldGeo=geo(merge([face,rim,boss]))}
  R.shield=obj(shieldGeo,{shade:.9,pos:[0,0,0],cull:70,out:.006,outCol:[.05,.04,.03]});R.shield.dun=1}
 if(m.T.archer&&!R.bow){arrowGeom();R.bow=obj(bowGeo,{shade:.9,pos:[0,0,0],cull:70,out:.004,outCol:[.05,.04,.03]});R.bow.dun=1}
 if(R.shield)R.shield.vis=!!m.T.shield;if(R.bow)R.bow.vis=!!m.T.archer;return R}
function monFree(m){const R=m.R;if(!R)return;R.used=0;if(R.quad){R.sk.vis=false;R.sh.vis=false}else rigHide(R);if(R.shield)R.shield.vis=false;if(R.bow)R.bow.vis=false;m.R=null}
// ---------------------------------------------------------------- spawning
function spawnMon(type,x,z,o={}){const T=MT[type],m={T,type,x,z,y:DUN.y,yaw:o.yaw!==undefined?o.yaw:Math.random()*6.28,hyaw:0,hx:x,hz:z,st:o.sleep?'sleep':'idle',t:Math.random()*2,spd:0,ph:Math.random()*6,
  aware:o.aware||0,ls:[x,z],unseen:9,group:o.grp||'g'+Math.random(),rad:T.rad*(o.sc||1),sc:T.sc*(o.sc||1),cd:.6+Math.random(),mcd:{},flash:0,kx:0,kz:0,air:0,dead:0,deadT:0,eye:1.3,boss:!!T.boss,big:!!T.big,elite:!!T.elite,title:T.boss?T.n+' · '+(T.sub||''):'',phase:1,pk:T.pk,archer:!!T.archer};
 scaleFoe(m,DUN.lv+(T.elite?1:0),T.hp);m.hostile=()=>!!MON_HOSTILE[m.st];m.open=()=>m.st==='stagger'||m.st==='open'||m.crumble;
 m.hurt=(dmg,dx,dz,kind)=>monHurt(m,dmg,dx,dz,kind);m.onParried=()=>{if(m.T.big&&!m.boss){addPosture(m,40);return}m.st='stagger';m.t=0;m.flash=1;m.kx=-Math.sin(m.yaw)*(m.big?1.5:4);m.kz=-Math.cos(m.yaw)*(m.big?1.5:4);m.peril=0};
 m.grab=k=>{m.held=k;m.st=k;m.t=0;m.spd=0};m.escape=()=>{m.held=null;m.st='chase';m.t=0;m.aware=1};m.calmDown=()=>{};m.onAlerted=()=>{if(!m.hostile()&&m.st!=='sleep'){m.st='alert';m.t=0}};
 m.onKilled=byPet=>monKilled(m);if(o.aware){m.aware=1;m.st=o.rise?'rise':'chase';m.t=0;m.ls=[P.x,P.z]}if(o.rise)m.rose=1;m.R=monRender(m);MONS.push(m);return m}
function spawnDunMonsters(D,F){for(const s of F.spawns){const x=dCX(s.i)+(Math.random()-.5)*1.6,z=dCZ(s.j)+(Math.random()-.5)*1.6;spawnMon(s.t,x,z,{grp:s.grp,sleep:s.sleep&&s.t!=='rat'&&s.t!=='spiderling'&&s.t!=='golem'})}
 DUN.boss=null;DUN.bossOn=0;if(F.last){SYS.dun=SYS.dun||{};SYS.dun.boss=SYS.dun.boss||{};const A=DUN.arena;
  if(!SYS.dun.boss[D.id]){const b=spawnMon(D.boss,A.x,A.z,{grp:'boss'});b.yaw=Math.atan2(dCX(F.start.cx)-A.x,dCZ(F.start.cy)-A.z);DUN.boss=b;BOSSES.includes(b)||BOSSES.push(b)}
  else{if(DUN.door){DUN.door.open=1;DUN.door.t=1;DUN.g[DUN.door.j*DUN.W+DUN.door.i]=3}DUN.puzzle.solved=1;addExitPortal()}}}
function addExitPortal(){const A=DUN.arena;if(!A||DUN.it.some(i=>i.k==='exit'))return;const o=dObj(dGeo.shaft,{unlit:1,blend:1,noOff:1,shade:0,col:[.5,.9,1.3],pos:[A.x,0,A.z]});o.alpha=.32;o.M=mtrs([A.x,DUN.y,A.z],[0,0,0]);DUN.it.push({k:'exit',x:A.x,z:A.z,r:2.6})}
function bossIntro(b){b.aware=1;b.st='chase';b.t=0;dunTitle(b.T.n,b.T.sub||'');sfx.roar(1);CAM.shake=Math.max(CAM.shake,.8);note('[!] '+b.T.n+' uyandı. Kapı arkandan kapandı.','red')}
// ---------------------------------------------------------------- damage
function monHurt(m,dmg,dx,dz,kind){if(m.dead)return false;const light=kind&&kind.startsWith&&kind.startsWith('light'),heavyK=kind==='heavy'||kind==='jumpatk'||kind==='exec'||kind==='assn'||kind==='skill';
 if(m.crumble){m.crumble=0;m.hp=0;m.dead=1;m.st='dead';m.t=0;spawnSparks(m.x,m.y+.4,m.z,22,[.85,.82,.7],5);note('Kemikler toz oldu.');return true}
 // shield: light hits and arrows from the front are blocked (a little gets through and it costs the skeleton balance)
 if(m.T.shield&&(light||kind==='arrow')&&m.st!=='stagger'&&m.st!=='hurt'&&Math.abs(angd(Math.atan2(P.x-m.x,P.z-m.z),m.yaw))<1.1){m.blockedAt=GT.clock;if(kind==='arrow'){spawnSparks(m.x+Math.sin(m.yaw)*.5,m.y+1.1,m.z+Math.cos(m.yaw)*.5,8,[1,.9,.6],3);sfx.block()}if(m.st!=='windup'&&m.st!=='strike'&&Math.random()<.45){m.st='windup';m.mv='bash';m.t=.1;m.cn=0;m.hitN=0}return false}
 // stone skin: light hits barely scratch a golem unless its rune core is open
 if(m.T.stone){if(m.st==='open')dmg=Math.round(dmg*1.6);else if(light||kind==='arrow'){dmg=Math.round(dmg*.4);if(Math.random()<.2)floatText(m.x,m.y+2.6*m.sc,m.z,'TAŞ DERİ','')}}
 m.hp-=dmg;m.flash=1;m.aware=1;m.ls=[P.x,P.z];if(m.st==='sleep'||m.st==='idle'||m.st==='alert'){m.st=m.st==='sleep'?'rise':'chase';m.t=0}alertGroup(m,P,18,MONS);
 if(m.boss&&m.phase===1&&m.hp<m.max*.5){m.phase=2;m.cd=.4;CAM.shake=.8;sfx.roar(1);floatText(m.x,m.y+3*m.sc,m.z,'İKİNCİ AŞAMA','crit');note('[!] '+m.T.n+' öfkelendi!','red')}
 if(m.hp<=0){m.hp=0;if(m.T.rise&&!m.rose&&!heavyK&&kind!=='trap'&&Math.random()<m.T.rise){m.rose=1;m.crumble=1;m.hp=1;m.st='crumbled';m.t=0;m.peril=0;note('İskelet dağıldı… kemikler birleşiyor! Ağır vuruşla parçala.','yel');return false}
  m.dead=1;m.st='dead';m.t=0;m.held=null;m.peril=0;return true}
 const kb=m.big?.6:m.T.armor?1.6:4.5;m.kx=dx*kb;m.kz=dz*kb;
 // flinch rules: big and armoured foes keep attacking through light hits; small ones flinch once, then fight back
 if(m.st==='stagger'||m.st==='open'||m.st==='choked'||m.st==='pinned')return false;
 if(m.big||m.T.armor){if(heavyK&&!m.boss&&m.st!=='strike'){m.st='hurt';m.t=0}return false}
 m.hitN=GT.clock-(m.hitAt||-9)<2.2?(m.hitN||0)+1:1;m.hitAt=GT.clock;
 if((m.st==='windup'||m.st==='strike')&&light){m.kx*=.2;m.kz*=.2}else if(m.hitN>=2){m.hitN=0;m.st='hop';m.t=0;m.kx=dx*8;m.kz=dz*8}else{m.st='hurt';m.t=0}
 return false}
function monKilled(m){const T=m.T,xp=Math.round(T.xp*(1+.08*(DUN.lv-1)));addXP(xp,P);SYS.mkills=SYS.mkills||{};SYS.mkills[m.type]=(SYS.mkills[m.type]||0)+1;
 if(!T.boss){note('[Sistem] '+T.n+' · +'+xp+' XP');return}
 SYS.dun=SYS.dun||{};SYS.dun.boss=SYS.dun.boss||{};SYS.dun.boss[DUN.id]=1;GT.slow=.6;CAM.shake=1;sfx.roar(.7);dunTitle('ZAFER',T.n+' düştü');
 dropLoot(m.x+1.5,m.z,[makeItem(null,DUN.lv,5,T.uniq),randomDrop(DUN.lv,4)],Math.round(T.hp*.12));note('[Sistem] '+T.n+' yenildi! +'+xp+' XP · Mitik ganimet!','gold');
 for(const o of MONS)if(!o.dead&&o!==m){o.hp=0;o.dead=1;o.st='dead';o.t=0}openDunDoor();addExitPortal();if(DUN.arena)DUN.arena.ring.alpha=0;save(P)}
// ---------------------------------------------------------------- AI
const monTokens=()=>MONS.filter(o=>!o.dead&&!o.big&&(o.st==='windup'||o.st==='strike')).length;
function pickMove(m,d){const S=m.sc/(m.T.sc||1)*Math.max(1,m.sc*.75);let best=null;for(const k of m.T.moves){const v=MV[k];if(v.p2&&m.phase<2)continue;if((m.mcd[k]||0)>GT.clock)continue;
  const R=v.r*(v.proj||v.summon||v.storm||v.eggs||v.runes?1:S);if(d>R||(v.min&&d<v.min))continue;if(v.summon&&MONS.filter(o=>!o.dead&&o.summoned).length>=3)continue;if(!best||(v.cd&&Math.random()<.6))best=k}return best}
function updateMon(m,dt){m.t+=dt;m.flash=Math.max(0,m.flash-dt*6);m.cd-=dt;const d=Math.hypot(P.x-m.x,P.z-m.z),T=m.T;
 if(Math.abs(m.kx)+Math.abs(m.kz)>.05&&!m.held){const p=dunCollide(m.x+m.kx*dt,m.z+m.kz*dt,m.rad);m.x=p[0];m.z=p[1];const k=Math.exp(-dt*7);m.kx*=k;m.kz*=k}
 if(m.dead){m.deadT+=dt;m.air=Math.max(0,m.air-dt*4);m.y=DUN.y;return}
 if(m.st==='choked'||m.st==='pinned'){m.spd=0;return}
 if(m.st==='crumbled'){m.spd=0;if(m.t>4.2){m.crumble=0;m.hp=Math.round(m.max*.5);m.st='rise';m.t=0;sfx.snap()}return}
 if(m.st==='rise'){m.spd=0;if(m.t>1.1){m.st='chase';m.t=0;m.aware=1}return}
 if(m.st==='sleep'){if((d<3.2&&!(P.crouch&&P.spd<2.6))||(P.noise>0&&d<P.noise*.8)||m.aware>=1){m.st='rise';m.t=0;m.aware=1;alertGroup(m,P,14,MONS);if(T.m==='ghoul'){sfx.snarl();note('[!] Ölü taklidi yapan bir hortlak!','red')}}return}
 const hostile=m.hostile(),range=T.feral?16:T.boss?40:19,sees=senseTick(m,P,dt,range);
 if(!hostile){if(fillAware(m,P,sees,dt,range*(T.feral?1.4:1))){sfx.growl();alertGroup(m,P,18,MONS)}if(P.noise>0&&d<P.noise&&m.st!=='alert'){m.st='alert';m.t=0;m.ls=[P.x,P.z]}if(m.aware>=1&&!(m.boss&&!DUN.bossOn)){m.st='chase';m.t=0}}
 else if(sees||d<4){m.ls=[P.x,P.z];m.unseen=0}else m.unseen=(m.unseen||0)+dt;
 m.hyaw=lp(m.hyaw,0,Math.min(1,dt*4));const S=Math.max(1,m.sc*.75);
 switch(m.st){
 case'idle':m.spd=lp(m.spd,0,.2);m.hyaw=Math.sin(m.t*.6+m.ph)*.6;if(m.aware>.25){m.st='alert';m.t=0}else if(m.t>4+Math.random()*4&&!m.boss){m.st='wander';m.t=0;const a=Math.random()*6.28,p=dunCollide(m.hx+Math.cos(a)*3,m.hz+Math.sin(a)*3,m.rad);m.tx=p[0];m.tz=p[1]}break;
 case'wander':if(agentMove(m,m.tx,m.tz,1.2,dt,m.rad,4)<.7||m.t>7){m.st='idle';m.t=0}break;
 case'alert':m.spd=lp(m.spd,0,.3);agentFace(m,m.ls[0],m.ls[1],dt,5);if(m.aware>=1){m.st='chase';m.t=0}else if(m.t>4&&m.aware<.3){m.st='idle';m.t=0}break;
 case'chase':{if(!P.alive){m.st='idle';m.t=0;m.aware=0;break}if(m.unseen>12&&!m.boss){m.st='alert';m.t=0;m.aware=.5;break}
  // ranged kinds keep their distance
  if(T.archer||T.caster){if(d<4.5&&T.caster&&(m.mcd.blink||0)<GT.clock){monBlink(m);break}if(d<4&&!T.caster){const ax=m.x+(m.x-P.x)/d*3,az=m.z+(m.z-P.z)/d*3;agentMove(m,ax,az,3.6,dt,m.rad,6);agentFace(m,P.x,P.z,dt,8);if(d<2&&m.cd<=0)startMove(m,'slash');break}
   const vis=dunLos(m.x,m.z,P.x,P.z);if(vis&&d<16&&m.cd<=0){if(T.archer){m.st='aim';m.t=0;sfx.gobShout();break}const mv=pickMove(m,d);if(mv){startMove(m,mv);break}}
   if(!vis||d>12){const tg=dunSteer(m);agentMove(m,tg[0],tg[1],T.spd,dt,m.rad,7)}else{const a=Math.atan2(m.x-P.x,m.z-P.z)+.5*dt*(m.side||1),r=cl(d,7,11);agentMove(m,P.x+Math.sin(a)*r,P.z+Math.cos(a)*r,T.spd*.7,dt,m.rad,6);agentFace(m,P.x,P.z,dt,8)}break}
  const vis=m.unseen<1&&dunLos(m.x,m.z,P.x,P.z);if(vis&&m.cd<=0&&P.st!=='down'&&P.st!=='getup'&&(m.big||monTokens()<2)){const mv=pickMove(m,d);if(mv){startMove(m,mv);break}}
  if(vis&&d<2.6*S&&!m.big){m.st='circle';m.t=0;m.dur=.5+Math.random()*.9;break}
  const tg=dunSteer(m);agentMove(m,tg[0],tg[1],T.spd*(m.phase>1?1.2:1),dt,m.rad,m.big?3:8);break}
 case'circle':{const a=Math.atan2(m.x-P.x,m.z-P.z)+.8*dt*(m.side||1),gx=P.x+Math.sin(a)*2.9,gz=P.z+Math.cos(a)*2.9;agentMove(m,gx,gz,T.spd*.55,dt,m.rad,6);agentFace(m,P.x,P.z,dt,9);if(m.t>m.dur){m.st='chase';m.t=0}break}
 case'aim':monAim(m,d,dt);break;
 case'windup':{m.spd=lp(m.spd,0,.4);const v=MV[m.mv],W=v.w*(m.cn>0?.4:1)*(m.phase>1?.85:1);if(m.t<W*.8)agentFace(m,P.x,P.z,dt,m.big?2.4:10);if(!m.big&&v.dmg&&!v.leap&&!v.lunge&&!v.ring&&d>v.r*.65*S)agentMove(m,P.x,P.z,T.spd*.75,dt,m.rad,10);
  if(v.ring)tele('circle',m.x+Math.sin(m.yaw)*.8*m.sc,m.z+Math.cos(m.yaw)*.8*m.sc,v.ring*S,0,0,sst(0,.4,m.t));else if(v.leap||v.lunge)tele('strip',m.x,m.z,.9*S,Math.min(d+.5,v.lunge?6:7.5),m.yaw,1);else if(v.arc&&v.arc>1.5)tele('circle',m.x+Math.sin(m.yaw)*1.2*S,m.z+Math.cos(m.yaw)*1.2*S,v.r*S,0,0,sst(0,.4,m.t));
  if(m.t>=W){m.st='strike';m.t=0;m.hitDone=false;sfx.swing();if(v.leap){m.lx=m.x;m.lz=m.z;const L=Math.min(d,v.r*S)+.3;m.lgx=m.x+Math.sin(m.yaw)*L;m.lgz=m.z+Math.cos(m.yaw)*L}monAct(m,v,d)}break}
 case'strike':{const v=MV[m.mv],A=v.a;
  if(v.leap){const u=Math.min(1,m.t/A),p=dunCollide(lp(m.lx,m.lgx,u),lp(m.lz,m.lgz,u),m.rad);m.x=p[0];m.z=p[1];m.air=Math.sin(PI*u)*1.1*S;if(!m.hitDone&&Math.hypot(P.x-m.x,P.z-m.z)<1.1*S+.3&&Math.abs(m.air)<1.2){m.hitDone=true;monHit(m,v)}}
  else if(v.lunge){const sp=v.lunge*(1-m.t/A);const p=dunCollide(m.x+Math.sin(m.yaw)*sp*dt,m.z+Math.cos(m.yaw)*sp*dt,m.rad);m.x=p[0];m.z=p[1];if(!m.hitDone&&d<1.6*S+.3&&Math.abs(angd(Math.atan2(P.x-m.x,P.z-m.z),m.yaw))<.8){m.hitDone=true;monHit(m,v)}}
  else if(v.dmg&&!m.hitDone&&!v.ring&&m.t>A*.25){if(!m.big&&d>1.1){const p=dunCollide(m.x+Math.sin(m.yaw)*3*dt,m.z+Math.cos(m.yaw)*3*dt,m.rad);m.x=p[0];m.z=p[1]}const fa=Math.abs(angd(Math.atan2(P.x-m.x,P.z-m.z),m.yaw));if(d<(v.r+.3)*S&&(fa<(v.arc||1.1)||d<.9)){m.hitDone=true;monHit(m,v)}}
  else if(v.dmg&&v.ring&&!m.hitDone&&m.t>A*.5){m.hitDone=true;if(v.ring){CAM.shake=Math.max(CAM.shake,d<9?.6:.15);sfx.thud();const cx=m.x+Math.sin(m.yaw)*.8*m.sc,cz=m.z+Math.cos(m.yaw)*.8*m.sc;spawnSparks(cx,DUN.y+.2,cz,22,[.6,.55,.5],6);if(Math.hypot(P.x-cx,P.z-cz)<v.ring*S&&!P.air)monHit(m,v);if(m.boss&&m.phase>1)DRINGS.push({x:cx,z:cz,r:1,spd:7,max:14,hit:0,m})}
   else{if(!m.big)m.x+=Math.sin(m.yaw)*.4,m.z+=Math.cos(m.yaw)*.4;const fa=Math.abs(angd(Math.atan2(P.x-m.x,P.z-m.z),m.yaw));if(d<(v.r+.4)*S&&fa<(v.arc||1.1))monHit(m,v)}}
  if(m.t>=A){m.air=0;if(m.cn>0){m.cn--;m.st='windup';m.t=0;m.peril=0;break}m.st=v.open?'open':'recover';m.t=0;m.cd=(m.big?1.6:.9)+Math.random()*(m.phase>1?.4:1);m.peril=0}break}
 case'recover':m.spd=0;if(m.t>MV[m.mv||'slash'].rc*(m.phase>1?.7:1)){m.st='chase';m.t=0}break;
 case'open':m.spd=0;if(m.t>(m.boss?1.6:2.0)){m.st='chase';m.t=0}break;
 case'stagger':m.spd=0;if(m.t>(m.big?1.8:1.4)){m.st='chase';m.t=0}break;
 case'hop':m.spd=0;agentFace(m,P.x,P.z,dt,10);if(m.t>.4){m.st='chase';m.t=0;m.cd=0;const mv=pickMove(m,d);if(mv)startMove(m,mv)}break;
 case'hurt':m.spd=0;if(m.t>.32){m.st='chase';m.t=0}break}
 for(const o of MONS){if(o===m||o.dead)continue;const ex=m.x-o.x,ez=m.z-o.z,q=ex*ex+ez*ez,mm=m.rad+o.rad;if(q<mm*mm&&q>1e-6){const k=Math.sqrt(q);m.x+=ex/k*(mm-k)*.5;m.z+=ez/k*(mm-k)*.5}}
 {const ex=m.x-P.x,ez=m.z-P.z,q=Math.hypot(ex,ez),mm=m.rad+.42;if(q<mm&&!m.air&&P.alive&&!P.air){const k=q>1e-4?q:1,ux=q>1e-4?ex/k:Math.sin(m.yaw+PI),uz=q>1e-4?ez/k:Math.cos(m.yaw+PI),p=dunCollide(P.x+ux*mm,P.z+uz*mm,m.rad);m.x=p[0];m.z=p[1]}}// bodies don't overlap the hero
 m.y=DUN.y+(m.air||0);if(m.spd>.2)m.ph+=m.spd*dt*(T.quad?5.5/Math.max(.5,m.sc):m.big?2.2:4.2)}
function startMove(m,k){const v=MV[k];m.mv=k;m.st='windup';m.t=0;m.cn=(v.n||1)-1;m.hitDone=false;m.mcd[k]=GT.clock+(v.cd||0);m.peril=v.peril?1:0;
 if(v.peril){sfx.charge();floatText(m.x,m.y+2.4*m.sc,m.z,'危','crit')}else if(m.big)sfx.roar(.4);else if(m.T.quad)sfx.hiss();else sfx.gobShout()}
function monAct(m,v,d){const hy=m.y+1.3*m.sc;
 if(v.proj==='bolt'){mkProj('bolt',[m.x+Math.sin(m.yaw)*.5,hy+.2,m.z+Math.cos(m.yaw)*.5],9,12)}
 else if(v.proj==='web'){mkProj('web',[m.x+Math.sin(m.yaw)*.6*m.sc,m.y+.5*m.sc,m.z+Math.cos(m.yaw)*.6*m.sc],13,3)}
 else if(v.proj==='rock'){mkProj('rock',[m.x,m.y+2.6*m.sc,m.z],0,20)}
 else if(v.summon){for(let k=0;k<2;k++){const a=m.yaw+(k?1.3:-1.3),p=dunCollide(m.x+Math.sin(a)*2.2,m.z+Math.cos(a)*2.2,.4);const s=spawnMon('skel',p[0],p[1],{aware:1,rise:1});s.summoned=1;spawnSparks(p[0],DUN.y+.3,p[1],14,[.5,1,.9],3)}sfx.horn();note('[!] Ölüler toprağın altından kalkıyor!','red')}
 else if(v.storm){for(let k=0;k<10;k++){const a=k/10*2*PI;mkProj('bolt',[m.x+Math.sin(a),hy,m.z+Math.cos(a)],8,10,[Math.sin(a),Math.cos(a)])}sfx.roar(.6)}
 else if(v.eggs){for(let k=0;k<4;k++){const a=m.yaw+PI+(k-1.5)*.5,p=dunCollide(m.x+Math.sin(a)*2.5,m.z+Math.cos(a)*2.5,.3);const s=spawnMon('spiderling',p[0],p[1],{aware:1});s.summoned=1}note('[!] Yumurtalar çatlıyor!','red');sfx.hiss()}
 else if(v.runes){for(let k=0;k<3;k++)DRINGS.push({x:m.x,z:m.z,r:.5-k*3.5,spd:6,max:16,hit:0,m});note('Rün halkaları yayılıyor — üstünden zıpla!','yel')}}
function monHit(m,v){const last=m.cn===0&&v.last;const r=hitPlayer({src:m,dmg:v.dmg,guard:v.gd,dir:[Math.sin(m.yaw),Math.cos(m.yaw)],knock:last?v.last:v.kn,parryable:!v.peril&&!m.big,unblockable:!!v.peril,power:m.big?1.4:1});
 if(r==='hit'){if(m.T.poison){P.poisonT=Math.max(P.poisonT||0,5);floatText(P.x,P.y+2.1,P.z,'VEBA','red')}if(m.T.bleed&&Math.random()<.5){P.poisonT=Math.max(P.poisonT||0,3)}}return r}
function monBlink(m){m.mcd.blink=GT.clock+5;for(let k=0;k<12;k++){const a=Math.random()*6.28,r=6+Math.random()*3,x=m.x+Math.sin(a)*r,z=m.z+Math.cos(a)*r;if(dunSolidAt(x,z,.5)||Math.hypot(x-P.x,z-P.z)<5)continue;
  spawnSparks(m.x,m.y+1,m.z,14,[.7,.4,1],4);m.x=x;m.z=z;spawnSparks(x,m.y+1,z,14,[.7,.4,1],4);sfx.hiss();m.st='chase';m.t=0;m.cd=.6;return}}
function monAim(m,d,dt){m.spd=lp(m.spd,0,.4);agentFace(m,P.x,P.z,dt,8);if(m.t<.55)m.aimAt=[P.x,P.z];if(m.t>.9&&!m.shot){m.shot=1;shootArrow([m.x+Math.sin(m.yaw)*.4,m.y+1.2,m.z+Math.cos(m.yaw)*.4],archerAimPoint(d,m.aimAt),20,'foe',Math.round(8*lvDmg(m.lv)),null)}
 if(m.t>1.3){m.shot=0;m.st='chase';m.t=0;m.cd=2.2+Math.random()*1.2}}
// ---------------------------------------------------------------- projectiles (bolts, webs, rocks) and rune rings
function mkProj(kind,from,speed,dmg,dir){let ob=DPROJP.find(o=>!o.busy);if(!ob){ob=obj(dGeo.cube,{unlit:1,shade:0,pos:[0,0,0],cull:80});ob.dun=1;DPROJP.push(ob)}ob.busy=1;ob.vis=true;
 const p={kind,x:from[0],y:from[1],z:from[2],dmg,life:kind==='rock'?3:4,ob,lc:kind==='bolt'?[.7,.3,1.2]:kind==='web'?[.3,.3,.3]:[.4,.35,.3]};
 if(kind==='rock'){const T=1.15,tx=P.x+P.vx*.4,tz=P.z+P.vz*.4;p.vx=(tx-p.x)/T;p.vz=(tz-p.z)/T;p.vy=(DUN.y-p.y)/T+4.9*T;p.tx=tx;p.tz=tz}
 else{const a=dir?Math.atan2(dir[0],dir[1]):Math.atan2(P.x-p.x,P.z-p.z);p.vx=Math.sin(a)*speed;p.vz=Math.cos(a)*speed;p.vy=dir?0:(P.y+1.1-p.y)/Math.max(.3,Math.hypot(P.x-p.x,P.z-p.z)/speed);p.home=kind==='bolt'&&!dir?1.6:0;p.sp=speed}
 ob.col=kind==='bolt'?[1.2,.5,1.8]:kind==='web'?[1,1,.95]:[.45,.42,.4];DPROJ.push(p);if(kind!=='rock')sfx.hiss()}
function updateDProj(dt){for(let i=DPROJ.length-1;i>=0;i--){const p=DPROJ[i];p.life-=dt;
  if(p.kind==='rock'){p.vy-=9.8*dt;tele('circle',p.tx,p.tz,1.7,0,0,1)}else if(p.home){const a=Math.atan2(P.x-p.x,P.z-p.z),c=Math.atan2(p.vx,p.vz),n=c+cl(angd(a,c),-p.home*dt,p.home*dt);p.vx=Math.sin(n)*p.sp;p.vz=Math.cos(n)*p.sp}
  p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;const s=p.kind==='rock'?.7:p.kind==='web'?.32:.26;p.ob.M=mtrs([p.x,p.y,p.z],[GT.time*7,GT.time*5,0]);for(let k=0;k<11;k++)if(k%4<3)p.ob.M[k]*=s;
  let done=p.life<=0||dunSolidAt(p.x,p.z);const near=Math.hypot(P.x-p.x,P.z-p.z)<(p.kind==='rock'?1.7:.6)&&p.y>P.y-.2&&p.y<P.y+2.2;
  if(p.kind==='rock'&&p.y<=DUN.y+.3){done=true;CAM.shake=Math.max(CAM.shake,.4);sfx.thud();spawnSparks(p.x,DUN.y+.2,p.z,18,[.55,.5,.45],5);if(Math.hypot(P.x-p.x,P.z-p.z)<1.8&&!P.air)hitPlayer({src:{x:p.x,z:p.z,lv:DUN.lv},dmg:p.dmg,guard:50,dir:[P.x-p.x+.01,P.z-p.z],knock:'down',parryable:false})}
  else if(near&&p.kind!=='rock'){const r=hitPlayer({src:{x:p.x-p.vx*.05,z:p.z-p.vz*.05,lv:DUN.lv},dmg:p.dmg,guard:p.dmg*2,dir:[p.vx/9,p.vz/9],knock:'flinch',noPush:1});
   if(r!=='iframe'){done=true;if(p.kind==='web'&&r!=='block'&&r!=='parry'){P.webT=2.6;floatText(P.x,P.y+2,P.z,'AĞ','');note('Ağa yakalandın — yavaşladın!','red')}spawnSparks(p.x,p.y,p.z,8,p.kind==='bolt'?[.8,.4,1]:[.9,.9,.9],3)}}
  if(done){p.ob.busy=0;p.ob.vis=false;DPROJ.splice(i,1)}}
 for(let i=DRINGS.length-1;i>=0;i--){const R=DRINGS[i];R.r+=R.spd*dt;if(R.r>R.max){DRINGS.splice(i,1);continue}if(R.r>.3){tele('circle',R.x,R.z,R.r,0,0,.9);const dd=Math.hypot(P.x-R.x,P.z-R.z);if(!R.hit&&Math.abs(dd-R.r)<.45&&!P.air&&P.alive){R.hit=1;hitPlayer({src:R.m,dmg:14,guard:40,dir:[P.x-R.x+.01,P.z-R.z],knock:'down',parryable:false,unblockable:true})}}}}
function updateMons(dt){for(const m of MONS)updateMon(m,dt);
 // poison / plague and webs on the player
 if(P.poisonT>0&&P.alive){P.poisonT-=dt;P.poisAcc=(P.poisAcc||0)+dt;if(P.poisAcc>.8){P.poisAcc=0;const dm=Math.max(1,Math.round(maxHP()*.012));P.hp-=dm;floatText(P.x,P.y+1.9,P.z,'-'+dm,'red');if(P.hp<=0)die()}}
 if(P.webT>0)P.webT-=dt;
 for(let i=MONS.length-1;i>=0;i--){const m=MONS[i];if(m.dead&&m.deadT>14&&!m.T.boss){monFree(m);MONS.splice(i,1)}}}
// ---------------------------------------------------------------- poses and drawing
function monQ(m,time){const q={},T=m.T,A=cl(m.spd/(T.spd*.8),0,1),run=cl((m.spd-2)/3,0,1),k1=m.st==='windup'?sst(0,1,m.t/(MV[m.mv].w*(m.cn>0?.4:1))):0,k2=m.st==='strike'?sst(0,1,m.t/MV[m.mv].a):0;
 const lying=m.st==='dead'||m.st==='crumbled'||m.st==='sleep'||m.st==='rise';if(!lying){gaitPose(q,m.ph,A,run);q.hdY=m.hyaw;q.LsZ=.2;q.RsZ=.2}
 const mv=m.mv||'slash';
 if(T.m==='ghoul'){q.spP=(q.spP||0)+.55;q.hdP=-.45;q.LsX=(q.LsX||0)-.9;q.RsX=(q.RsX||0)-.9;q.LeX=-.5;q.ReX=-.5;q.LkX=(q.LkX||0)+.35;q.RkX=(q.RkX||0)+.35;q.LhX=(q.LhX||0)-.3;q.RhX=(q.RhX||0)-.3;q.jaw=.3+Math.sin(time*9)*.15}
 if(T.m==='skmage'&&(m.st==='windup')){q.LsX=-2.7*k1;q.RsX=-2.5*k1;q.LsZ=.4;q.RsZ=.4;q.hdP=-.3*k1}
 else if(m.st==='windup'){if(m.big){if(mv==='sweep'){q.RsX=lp(-.3,-1.45,k1);q.RsY=lp(0,1.5,k1);q.RsZ=.5;q.LsX=-1.2*k1;q.LsY=1.2*k1;q.spY=1.0*k1;q.LhX=-.5;q.LkX=.6}else{q.RsX=-3*k1;q.LsX=-2.8*k1;q.RsZ=.35;q.LsZ=.4;q.spP=lp(.2,-.35,k1);q.hdP=-.3;q.LhX=-.4;q.LkX=.5;q.jaw=.6*k1}}
  else if(T.quad){}else if(mv==='thrust'){q.RsX=-.3;q.ReX=-1.9*k1;q.RsY=.4;q.spY=-.6*k1;q.spP=.2;q.LhX=-.6;q.LkX=.7;q.RhX=.4}
  else if(mv==='bash'){q.LsX=-1.4*k1;q.LsY=-.6*k1;q.LeX=-.8;q.spY=.5*k1}
  else if(mv==='claw'||mv==='lunge'){q.LsX=-2.2*k1;q.RsX=-2.2*k1;q.spP=(q.spP||0)+.2;q.LkX=(q.LkX||0)+.5*k1;q.RkX=(q.RkX||0)+.5*k1}
  else{const side=m.cn%2;if(side){q.RsX=lp(-.4,-1.6,k1);q.RsY=lp(0,-1.4,k1);q.RsZ=.8}else{q.RsX=lp(-.4,-2.6,k1);q.RsZ=.5}q.ReX=-1.3;q.spP=.3;q.spY=-.5*k1;q.LhX=-.5;q.LkX=.7;q.RhX=.3}}
 else if(m.st==='strike'){if(m.big){if(mv==='sweep'){q.RsX=-1.45;q.RsY=lp(1.5,-1.7,k2);q.LsX=-1.2;q.LsY=lp(1.2,-1.4,k2);q.spY=lp(1,-1,k2);q.LhX=-.6;q.LkX=.7}else{q.RsX=lp(-3,.4,k2);q.LsX=lp(-2.8,.2,k2);q.spP=lp(-.35,.75,k2);q.hipP=.2*k2;q.LhX=-.7;q.LkX=.9;q.jaw=.7}}
  else if(T.quad){}else if(mv==='thrust'){q.RsX=-1.5;q.ReX=lp(-1.9,0,k2);q.spP=.5;q.LhX=-.9;q.LkX=1;q.RhX=.5}
  else if(mv==='bash'){q.LsX=-1.5;q.LsY=lp(-.6,.6,k2);q.spY=lp(.5,-.4,k2)}else if(mv==='claw'||mv==='lunge'){q.LsX=lp(-2.2,-.6,k2);q.RsX=lp(-2.2,-.4,k2);q.spP=.5}
  else{const side=m.cn%2;if(side){q.RsX=-1.6;q.RsY=lp(-1.4,1.2,k2);q.RsZ=.8}else{q.RsX=lp(-2.6,.6,k2);q.RsY=lp(0,.5,k2)}q.ReX=-.3;q.spP=.5;q.spY=lp(-.5,.5,k2);q.LhX=-.7;q.LkX=.9}}
 else if(m.st==='open'){q.spP=.9;q.hipP=.3;q.hdP=.4;q.RsX=.4;q.LsX=.4;q.LhX=-.8;q.LkX=1.1;q.RhX=-.3;q.RkX=.6}
 else if(m.st==='stagger'||m.st==='hurt'){const k=Math.sin(m.t*14)*.3;q.spP=-.4+k*.3;q.hdP=-.5;q.RsX=-1.4;q.LsX=-1.3;q.LsZ=.6;q.RsZ=.6}
 else if(m.st==='rise'){const u=sst(0,1,m.t/1.1);q.spP=lp(1.2,0,u);q.LhX=lp(-1.6,0,u);q.LkX=lp(2.2,0,u);q.RhX=lp(-1.3,0,u);q.RkX=lp(1.9,0,u);q.LsX=lp(-.8,0,u);q.RsX=lp(-.6,0,u)}
 else if(m.st==='crumbled'||m.st==='dead'||m.st==='sleep'){q.LsX=-.3;q.RsX=.4;q.LsZ=.8;q.RsZ=.6;q.LhX=-.2;q.RhX=.15;q.jaw=.5}
 if(m.st==='aim'||(T.archer&&m.hostile()))archerPose(m,q);return q}
function monTilt(m){if(m.st==='dead'||m.st==='crumbled')return -1.45*sst(0,.5,m.st==='dead'?m.t:1);if(m.st==='sleep')return -1.45;if(m.st==='rise')return -1.45*(1-sst(0,.7,m.t/1.1));return 0}
function drawMons(time){for(const m of MONS){const R=m.R;if(!R)continue;const far=Math.hypot(m.x-P.x,m.z-P.z)>60;if(far||(m.dead&&m.deadT>13)){if(R.quad){R.sk.vis=false;R.sh.vis=false}else rigHide(R);if(R.shield)R.shield.vis=false;if(R.bow)R.bow.vis=false;continue}
  if(R.quad){drawQuad(m,R,time);continue}
  const M=monModel(m.T.m),tilt=monTilt(m),hipH=(M.K.th+M.K.sh2+.06)*m.sc,extra=tilt?rX(tilt):R3I,y=m.y+lp(hipH,.16*m.sc,Math.abs(Math.sin(tilt)))-(m.st==='crumbled'?.1:0);
  rigDraw(R,m.x,y,m.z,m.yaw,m.sc,humanPose(monQ(m,time)),m.big?.9:.45,extra);const tc=m.T.tint||[1,1,1],sk=m.dead?Math.max(.4,1-m.deadT*.05):1;R.ob.flash=m.flash;R.ob.col=m.open()?[tc[0]*1.15,tc[1]*1.05,tc[2]*.8]:[tc[0]*sk,tc[1]*sk,tc[2]*sk];
  if(m.T.stone)R.ob.em=m.st==='open'?[.6,1.6,2]:[.3,.8,1];
  const d=R.def;if(R.shield&&m.T.shield){const W=d.WR[5],p=boneW(d,5,[.04,-.1,0],m.sc),Mx=new Float32Array(16),Y=r3m(W,rY(PI/2));Mx[0]=Y[0];Mx[1]=Y[3];Mx[2]=Y[6];Mx[4]=Y[1];Mx[5]=Y[4];Mx[6]=Y[7];Mx[8]=Y[2];Mx[9]=Y[5];Mx[10]=Y[8];for(let i=0;i<11;i++)if(i%4<3)Mx[i]*=m.sc;Mx[12]=p[0];Mx[13]=p[1];Mx[14]=p[2];Mx[15]=1;R.shield.M=Mx;R.shield.pos=[m.x,0,m.z];R.shield.vis=!m.dead||m.deadT<13}
  if(R.bow&&m.T.archer){const W=d.WR[5],p=boneW(d,5,[0,-.06*m.sc,0],1),Mx=new Float32Array(16);Mx[0]=W[0];Mx[1]=W[3];Mx[2]=W[6];Mx[4]=W[1];Mx[5]=W[4];Mx[6]=W[7];Mx[8]=W[2];Mx[9]=W[5];Mx[10]=W[8];for(let i=0;i<11;i++)if(i%4<3)Mx[i]*=m.sc;Mx[12]=p[0];Mx[13]=p[1];Mx[14]=p[2];Mx[15]=1;R.bow.M=Mx;R.bow.pos=[m.x,0,m.z];R.bow.vis=!m.dead}}}
// quadrupeds (spider, rat) on the wolf's 12-bone skin: body, head, jaw, tail/abdomen, 4 upper + 4 lower legs
function drawQuad(m,R,time){const sc=m.sc,moving=m.spd>.3,spider=m.T.m==='spider',H=(spider?.66:.62)*sc,dead=m.st==='dead',bob=moving?Math.abs(Math.sin(m.ph))*.03*sc:Math.sin(time*2+m.ph)*.006;
 const crouch=m.st==='windup'?.12*sc:0,roll=dead&&spider?PI*sst(0,.5,m.t):dead?1.3*sst(0,.5,m.t):0,pitch=m.st==='strike'&&MV[m.mv].leap?-.3:m.st==='windup'?.12:0;
 let M=mmul(mtrs([m.x,m.y+H+bob-crouch-(dead?H*.55*sst(0,.5,m.t):0),m.z],[0,m.yaw,0]),mtrs([0,0,0],[pitch,0,roll]));for(let k=0;k<12;k++)M[k]*=sc;
 const jaw=m.st==='windup'||m.st==='strike'?.8:.1+Math.sin(time*6+m.ph)*.08,head=mroty(M,0,.3,.76,m.st==='windup'?.2:0,m.hyaw,0),J=mroty(head,0,-.055,.1,jaw*.6,0,0),
  tail=mroty(M,0,.1,-.62,spider?Math.sin(time*2+m.ph)*.05:.1+Math.sin(time*3+m.ph)*.15,spider?0:Math.sin(time*4+m.ph)*.35,0),parts=[M,head,J,tail],ups=[],los=[];
 for(let l=0;l<4;l++){const hp=WHIP[l],ph=m.ph+(l===0||l===3?0:PI);let au,al;
  if(dead){au=(l<2?-.9:.9)*sst(0,.5,m.t);al=1.4*sst(0,.5,m.t)}else if(m.air>.05){au=l<2?-.9:.8;al=.6}
  else{const amp=moving?(spider?.4:.6):0;au=Math.sin(ph)*amp;al=spider?0:Math.max(0,Math.cos(ph))*amp*.7+(m.st==='windup'?.3:0)}
  const U=mroty(M,hp[0],hp[1],hp[2],au,0,0);ups.push(U);los.push(mroty(U,0,-W_UP,0,al,0,0))}
 parts.push(...ups,...los);const B=R.sk.bones;parts.forEach((Mp,i)=>{const b=QB[i],q=i*12;for(let r=0;r<3;r++){B[q+r*4]=Mp[r];B[q+r*4+1]=Mp[4+r];B[q+r*4+2]=Mp[8+r];B[q+r*4+3]=Mp[12+r]-(Mp[r]*b[0]+Mp[4+r]*b[1]+Mp[8+r]*b[2])}});
 const tc=m.T.tint||[1,1,1],sk=dead?Math.max(.4,1-m.deadT*.05):1;R.sk.vis=true;R.sk.col=[tc[0]*sk,tc[1]*sk,tc[2]*sk];R.sk.flash=m.flash;R.sk.pos=[m.x,m.y,m.z];
 const ss=.62*sc;R.sh.M=mtrs([m.x,DUN.y+.06,m.z],[0,m.yaw,0]);R.sh.M[0]*=ss*(spider?1.6:1);R.sh.M[2]*=ss;R.sh.M[8]*=ss*1.6;R.sh.M[10]*=ss*1.6;R.sh.pos=[m.x,0,m.z];R.sh.vis=!dead}
