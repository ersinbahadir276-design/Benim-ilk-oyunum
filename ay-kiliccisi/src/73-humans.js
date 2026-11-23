// ===================== HUMANS, NIGHT, CLASHES, MERCENARIES (v26) =====================
// HAYDUT (bandits): men with swords — some carry a SHIELD that turns every light blow from the front; a heavy blow,
// a kick or a throw opens the guard for 4 s. GEZGİN ŞÖVALYE: a knight in black challenges you to a duel.
// GECE: at night the dead walk outside the walls — slow HORTLAK that dive at your legs. YARATIK ÇATIŞMASI: a wolf pack
// and a goblin band tearing at each other; walk up and both turn on you. PARALI ASKER: hire a sword at the guild hall.
// Bandits and the dead use the goblin brain (all its tricks) on human bodies; the shield and the night are their own.
const HUM={geo:{},shieldGeo:null,night:[],ally:null};
function humGeo(k){if(!HUM.geo[k])HUM.geo[k]=humanGeo(k==='dead'?'villager':'guard');return HUM.geo[k]}
function mkHuman(x,z,o){const geoK=o.dead?'dead':'guard',g=evGob(x,z,{lv:o.lv,hp:o.hp||200,title:o.title||'',elite:o.elite,sc:o.sc||1,humanK:geoK});
 if(g.humanK!==geoK){if(g.R)rigHide(g.R);g.R=rigObj(humGeo(geoK),{out:.012,cull:150,outCol:[.08,.06,.06]});g.humanK=geoK}g.rigM=humGeo(geoK);g.human=1;
 g.R.ob.col=o.col||[1,1,1];g.shield=!!o.shield;g.shieldT=0;g.spdMul=o.spd||1;g.undead=!!o.dead;g.title=o.title||'';return g}
// ---------- the shield
function shieldBlock(g,kind){if(GT.clock<(g.shieldT||0))return false;const front=Math.abs(angd(Math.atan2(P.x-g.x,P.z-g.z),g.yaw))<1.2;
 if(!front||/^(stagger|sprawl|latched|escape|playdead)$/.test(g.st))return false;
 if(kind==='heavy'||kind==='kick'||kind==='throw'||kind==='jumpatk'||kind==='runatk'){g.shieldT=GT.clock+4;g.st='stagger';g.t=0;floatText(g.x,(g.y||0)+2,g.z,'KALKAN AÇILDI','crit');sfx.break();return false}
 g.blockedAt=GT.clock;g.kx*=.2;g.kz*=.2;sfx.clang();const p=[g.x+Math.sin(g.yaw)*.5,(g.y||0)+1.2,g.z+Math.cos(g.yaw)*.5];spawnSparks(p[0],p[1],p[2],8,[1,.9,.6],3);floatText(p[0],p[1]+.5,p[2],'KALKAN','');return true}
function drawShields(){if(!HUM.shieldGeo){const s=G();box(s,-.36,-.48,-.05,.36,.48,.05,[.35,.22,.12]);box(s,-.3,-.42,.05,.3,.42,.08,[.5,.5,.55]);box(s,-.06,-.06,.08,.06,.06,.12,[.75,.6,.25]);HUM.shieldGeo=geo(s)}
 for(const g of GOBS){if(!g.shield){if(g.shOb)g.shOb.vis=false;continue}if(!g.shOb)g.shOb=obj(HUM.shieldGeo,{shade:.95,pos:[0,0,0],cull:120,out:.006,outCol:[.05,.04,.03]});
  const d=Math.hypot(g.x-P.x,g.z-P.z);if(g.dead||d>120||!g.R||!g.R.ob.vis||!g.R.def.WR){g.shOb.vis=false;continue}const R=g.R.def.WR[5],p=boneW(g.R.def,5,[0,-.05*g.sc,.12*g.sc],1),M=new Float32Array(16);
  M[0]=R[0];M[1]=R[3];M[2]=R[6];M[4]=R[1];M[5]=R[4];M[6]=R[7];M[8]=R[2];M[9]=R[5];M[10]=R[8];for(let i=0;i<11;i++)if(i%4<3)M[i]*=g.sc;M[12]=p[0];M[13]=p[1];M[14]=p[2];M[15]=1;g.shOb.M=M;g.shOb.pos=[g.x,0,g.z];g.shOb.vis=true}}
// ---------- new events: bandit ambush, the wandering knight, the creature clash
Object.assign(EVDEF,{
 bandits:{n:'HAYDUT PUSUSU',w:2,ok:()=>true,start(E){const p=evSpot(26,40);if(!p)return false;const lv=regionLevel(p[0],p[1])+1;E.ents=[mkHuman(p[0],p[1],{lv,shield:true,title:'HAYDUT KALKANCI',col:[.85,.7,.65]}),mkHuman(p[0]+2,p[1]+1,{lv,col:[.8,.65,.6]}),mkHuman(p[0]-2,p[1]+1,{lv,col:[.8,.65,.6]})];E.x=p[0];E.z=p[1];sfx.gobShout();note('[Olay] HAYDUT PUSUSU! Yolun kenarından silahlı adamlar çıkıyor — kalkanlıya ağır vuruş ya da tekme.','red');return true},reward:9},
 knight:{n:'GEZGİN ŞÖVALYE',w:1,ok:()=>SYS.lv>=3,start(E){const p=evSpot(18,26);if(!p)return false;const lv=Math.max(SYS.lv+2,regionLevel(p[0],p[1])+2);const k=mkHuman(p[0],p[1],{lv,hp:520,shield:true,elite:true,sc:1.12,title:'GEZGİN ŞÖVALYE · Kara Varis',col:[.45,.45,.55]});k.pk='elite';k.st='alert';k.aware=.6;E.ents=[k];E.x=p[0];E.z=p[1];note('[Olay] Kara zırhlı bir şövalye yolunu kesti: "Kılıcın konuşsun, yolcu." — teke tek düello.','gold');bossBanner('DÜELLO','Gezgin Şövalye');return true},reward:16,tier:2},
 clash:{n:'YARATIK ÇATIŞMASI',w:2,ok:()=>true,start(E){const p=evSpot(34,48);if(!p)return false;const lv=regionLevel(p[0],p[1]);E.ents=[];for(let i=0;i<3;i++){const w=evWolf(p[0]+rr(-4,4),p[1]-5+rr(-2,2),{lv});w.clash=1;E.ents.push(w)}for(let i=0;i<3;i++){const g=evGob(p[0]+rr(-4,4),p[1]+5+rr(-2,2),{lv});g.clash=1;E.ents.push(g)}E.x=p[0];E.z=p[1];sfx.howl();note('[Olay] Uzakta hırlamalar ve bağırışlar — kurtlar bir goblin çetesiyle boğuşuyor. Kazananı bekle ya da araya gir.','gold');return true},reward:7}});
// creature clash: until the hero is close, wolves and goblins of the clash fight each other with their own animations
function clashTick(f,dt){const d=Math.hypot(P.x-f.x,P.z-f.z);if(d<13||f.aware>=1&&f.hp<f.max&&f.lastHitBy==='hero'){f.clash=0;f.aware=1;f.ls=[P.x,P.z];if(isWolf(f)){f.st='circle';f.t=0}else{f.st='chase';f.t=0}return false}
 f.t+=dt;f.cdC=(f.cdC||rr(.5,1.5))-dt;const wolfSide=isWolf(f);let tg=null,td=1e9;const E=EVT.cur;if(!E)return false;for(const o of E.ents){if(o.dead||o===f||isWolf(o)===wolfSide)continue;const q=Math.hypot(o.x-f.x,o.z-f.z);if(q<td){td=q;tg=o}}
 if(!tg){f.clash=0;return false}const reach=wolfSide?1.4:1.6;
 if(wolfSide){if(f.st!=='bite'||f.t>.35){if(td>reach){wolfMove(f,tg.x,tg.z,7.5,dt,8);f.st='chase'}else{f.spd=0;wolfFace(f,tg.x,tg.z,dt,10)}}f.crouch=lp(f.crouch||0,.3,.1);f.jaw=lp(f.jaw||0,f.st==='bite'?1:.3,.3)}
 else{if(f.st!=='strike'&&f.st!=='windup'){if(td>reach){agentMove(f,tg.x,tg.z,4.8,dt,f.rad,8);f.st='chase'}else{f.spd=lp(f.spd,0,.3);agentFace(f,tg.x,tg.z,dt,10)}}else if(f.t>(f.st==='windup'?.45:.25)){f.st=f.st==='windup'?'strike':'chase';f.t=0}}
 if(td<=reach&&f.cdC<=0){f.cdC=rr(.9,1.6);if(wolfSide){f.st='bite';f.t=0;sfx.bite()}else{f.st='windup';f.t=0;f.hitDone=false}const dm=Math.round((wolfSide?8:9)*lvDmg(f.lv||1));const k=td||1,dead=foeHurt(tg,dm,(tg.x-f.x)/k,(tg.z-f.z)/k,'clash');if(dead){tg.dead=tg.dead||1;if(isWolf(tg))tg.st='dead'}}
 if(!wolfSide){if(f.spd>.2)f.ph+=f.spd*dt*4.2}else f.ph+=(f.spd||0)*dt*2.2;f.y=hAt(f.x,f.z);return true}
// ---------- the dead walk at night (outside the walls): slow, they dive at your legs, gone at dawn
function nightTick(dt){if(DUN.on)return;const night=GT.tod>.8||GT.tod<.18,out=Math.hypot(P.x,P.z)>190;HUM.nt=(HUM.nt||0)-dt;
 HUM.night=HUM.night.filter(g=>!g.dead&&!g.free);
 if(!night||!out){if(HUM.night.length&&(!night||Math.hypot(P.x,P.z)<150)){for(const g of HUM.night){g.st='escape';g.from='pinned';g.t=0}const L=HUM.night;HUM.night=[];setTimeout(()=>evFree(L),1500);if(!night)note('[Gece] Şafak söküyor — ölüler toprağa geri çekiliyor.','')}return}
 if(HUM.nt<=0&&HUM.night.length<4&&!window.__noAutoQ){HUM.nt=rr(14,24);const p=evSpot(24,38);if(!p)return;const g=mkHuman(p[0],p[1],{dead:true,lv:regionLevel(p[0],p[1])+1,hp:170,spd:.55,title:'HORTLAK',col:[.55,.62,.5]});g.st='escape';g.from='pinned';g.t=0;g.aware=1;g.tkCd=0;g.feigned=1;HUM.night.push(g);
  if(!HUM.warned){HUM.warned=1;note('[Gece] Topraktan eller uzanıyor… geceleri ölüler surların dışında yürür.','red')}}}
// ---------- the guild hall and the mercenary
function buildGuildHall(){const g=G(),x=GUILD.x,z=GUILD.z+9,y=hAt(x,z)-.3,w=[.55,.45,.35],rf=[.3,.16,.12];box(g,x-7,y,z-4,x+7,y+5.2,z+4,w);for(let k=0;k<4;k++){const f=1-k*.22;box(g,x-7.4*f,y+5.2+k*.6,z-4.4*f,x+7.4*f,y+5.8+k*.6,z+4.4*f,rf)}
 box(g,x-1.2,y,z-4.05,x+1.2,y+2.8,z-3.95,[.25,.16,.1]);box(g,x-2.6,y+3.2,z-4.25,x+2.6,y+4.2,z-4.1,[.6,.15,.12]);box(g,x-2.4,y+3.35,z-4.3,x+2.4,y+4.05,z-4.25,[.85,.7,.3]);
 for(const s of[-1,1])box(g,x+s*5.2-.2,y,z-4.2,x+s*5.2+.2,y+5.2,z-3.8,[.3,.2,.12]);addBox(x-7,z-4,x+7,z+4,5);obj(geo(g),{shade:.95,pos:[x,0,z],cull:500,out:.01,outCol:[.06,.05,.04]})}
const MERCAT=()=>[GUILD.x,GUILD.z+3.4];/* the mercenary waits at the guild hall door, not at the clerk */
function mercPrompt(){const m=MERCAT();if(Math.hypot(P.x-m[0],P.z-m[1])<2.4&&!(HUM.ally&&!HUM.ally.dead))return'ETKİLEŞ: PARALI ASKER KİRALA (120 altın, 5 dk)';return null}
function hireMerc(){const mp=MERCAT();if(Math.hypot(P.x-mp[0],P.z-mp[1])>2.4||HUM.ally&&!HUM.ally.dead)return false;if(SYS.gold<120){note('Selin: "Paralı asker 120 altın ister, savaşçı."');return true}SYS.gold-=120;
 const p=collide(P.x+2,P.z+2,.5),g=mkHuman(p[0],p[1],{lv:SYS.lv+1,hp:400,shield:true,title:'PARALI ASKER · Demir Orhan',col:[.75,.85,1.15]});g.ally=1;g.st='chase';g.until=GT.clock+300;HUM.ally=g;note('[Lonca] Demir Orhan 5 dakikalığına seninle. Düşmanlarına saldırır.','gold');save(P);return true}
function allyTick(g,dt){g.t+=dt;g.flash=Math.max(0,g.flash-dt*6);if(GT.clock>g.until||!P.alive){note('[Lonca] Demir Orhan\'ın sözleşmesi bitti — yoluna gitti.','');g.ally=0;HUM.ally=null;evFree([g]);return}
 let tg=null,td=12;for(const f of foes()){if(!foeHostile(f)||f===DRAGON)continue;const q=Math.hypot(f.x-g.x,f.z-g.z);if(q<td){td=q;tg=f}}
 if(g.st==='windup'){g.spd=lp(g.spd,0,.4);if(tg)agentFace(g,tg.x,tg.z,dt,10);if(g.t>.45){g.st='strike';g.t=0;sfx.swing();if(tg&&td<2.2){const k=td||1,dm=Math.round(14*lvDmg(g.lv||1)*dmgMul()),dead=foeHurt(tg,dm,(tg.x-g.x)/k,(tg.z-g.z)/k,'ally');addPosture(tg,14);floatText(tg.x,(tg.y||0)+1.5,tg.z,''+dm,'');if(dead)onFoeKilled(tg,true)}}}
 else if(g.st==='strike'){if(g.t>.25){g.st='chase';g.t=0;g.cd=rr(.5,1)}}
 else{g.st='chase';g.cd-=dt;if(tg){if(td>1.8)agentMove(g,tg.x,tg.z,5.2,dt,g.rad,8);else{g.spd=lp(g.spd,0,.3);agentFace(g,tg.x,tg.z,dt,10);if(g.cd<=0){g.st='windup';g.t=0}}}
  else{const a=P.yaw+PI*.75,gx=P.x+Math.sin(a)*2.4,gz=P.z+Math.cos(a)*2.4,q=Math.hypot(gx-g.x,gz-g.z);if(q>1.2)agentMove(g,gx,gz,q>8?6.5:3.5,dt,g.rad,6);else g.spd=lp(g.spd,0,.2);if(q>60){g.x=P.x+1.5;g.z=P.z+1.5}}}
 g.y=hAt(g.x,g.z);if(g.spd>.2)g.ph+=g.spd*dt*4.2}
// ---------- the environment as a weapon: kicked off a cliff, slammed into a wall
function envSlam(dt){for(const f of foes()){if(f.dead||f===DRAGON||f.big||f.boss)continue;const v=Math.hypot(f.kx||0,f.kz||0);if(v<5.5)continue;
  const ahead=[f.x+(f.kx/v)*1.2,f.z+(f.kz/v)*1.2],fall=[f.x+(f.kx/v)*2.5,f.z+(f.kz/v)*2.5],drop=hAt(f.x,f.z)-hAt(fall[0],fall[1]);
  if(drop>3.5&&!DUN.on){f.x=fall[0];f.z=fall[1];const dead=foeHurt(f,f.max,0,0,'fall');floatText(f.x,(f.y||0)+1,f.z,'UÇURUMDAN DÜŞTÜ','crit');sfx.thud();if(dead)onFoeKilled(f,false);continue}
  if(inBuilding(ahead[0],ahead[1],.2)&&!f.slamT){f.slamT=1;setTimeout(()=>{f.slamT=0},600);f.kx=f.kz=0;const dm=Math.round(f.max*.12),dead=foeHurt(f,dm,0,0,'slam');addPosture(f,40);if(!isWolf(f)&&!dead){f.st='stagger';f.t=0}floatText(f.x,(f.y||0)+1.6,f.z,'DUVARA ÇARPTI '+dm,'crit');sfx.thud();CAM.shake=Math.max(CAM.shake,.35);spawnSparks(ahead[0],(f.y||0)+1,ahead[1],10,[.7,.65,.55],4);if(dead)onFoeKilled(f,false)}}}
