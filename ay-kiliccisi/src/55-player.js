// ===================== player: Elden Ring style combat, stamina, guard, ragdoll falls, silent takedowns =====================
const P={x:SPAWN[0],z:SPAWN[2],y:0,yaw:PI,vx:0,vz:0,vy:0,air:false,st:'move',t:0,hp:100,sta:100,staT:0,guard:100,guardT:0,combo:0,queued:false,inv:0,
 sprintHeld:false,exhausted:false,crouch:false,sprinting:false,ps:Object.assign({},POSE0),ph:0,lift:0,spin:0,spinDir:1,roll:0,ddx:0,ddz:1,dodgeKind:'back',
 jig:0,struggle:0,pinBy:null,noise:0,hitDone:false,flash:0,cp:[SPAWN[0],SPAWN[2]],spd:0,charge:0,alive:true,blockAt:-9,blockHeld:false,
 rag:{ang:0,av:0,fx:0,fz:-1,bounce:0,lag:0,lagv:0},td:null,hurtDir:[0,0],tiltDir:-1};
const IN={mx:0,mz:0,kx:0,kz:0,wx:0,wz:0,atkHeld:false,atkAt:-9,atkUp:false,blockHeld:false};
// buffered presses (game-time), consumed once when the action becomes legal (input-systems: 0.1-0.2 s window)
const BUF={atk:-9,dodge:-9,jump:-9,inter:-9};const press=(k)=>{BUF[k]=GT.clock};const take=(k,w=.18)=>{if(GT.clock-BUF[k]<=w){BUF[k]=-9;return true}return false};
const COST={light:[12,13,15],heavy:24,heavyMax:14,run:18,jumpAtk:16,dodge:18,jump:10,sprint:14};
const PARRY_WIN=.24;
// --------------------------------------------------------------- enemies the player can hit
function foes(){const out=[];for(const w of wolves)if(!w.dead&&!w.tame)out.push(w);for(const g of GOBS)if(!g.dead)out.push(g);for(const c of CROCS)if(!c.dead)out.push(c);if(DRAGON&&!DRAGON.dead)out.push(DRAGON);return out}
const isWolf=w=>wolves.includes(w);
function foeHostile(f){return isWolf(f)?hostileSt(f):f.hostile()}
function foeHurt(f,dmg,dx,dz,kind){return isWolf(f)?wolfHurt(f,dmg,dx,dz,P):f.hurt(dmg,dx,dz,kind)}
// distance from the player to a foe's body (big creatures expose several hit spheres)
function foeDist(f){if(f.hitPts){let b=1e9;for(const h of f.hitPts())b=Math.min(b,Math.hypot(h[0]-P.x,h[2]-P.z)-h[3]);return Math.max(0,b)}return Math.max(0,Math.hypot(f.x-P.x,f.z-P.z)-(f.rad||.4*(f.sc||1)))}
function nearestFoe(range,half){let b=null,bd=range;for(const f of foes()){const d=foeDist(f),a=Math.abs(angd(Math.atan2(f.x-P.x,f.z-P.z),P.yaw));if(d<bd&&(half>=PI||a<half)){bd=d;b=f}}return b}
// --------------------------------------------------------------- hits the player receives (one place for every enemy)
// o:{dmg,guard,src,dir:[dx,dz] push direction,knock:'flinch'|'down'|'none',pin,unblockable,parryable,name}
function hitPlayer(o){if(!P.alive||P.st==='dead')return'none';const lvm=o.src&&o.src.lv?lvDmg(o.src.lv):1;o=Object.assign({},o,{dmg:o.dmg*lvm*100/(100+armorDef()),guard:(o.guard!==undefined?o.guard:o.dmg*1.8)*lvm*(1-gear('guard')/200)});
 if(P.inv>0){return'iframe'}
 const src=o.src,front=src?Math.abs(angd(Math.atan2(src.x-P.x,src.z-P.z),P.yaw))<1.95:true;
 if((P.st==='block'||P.st==='parry')&&front&&!o.unblockable){
  const parryOK=o.parryable!==false&&(o.parryFrom!==undefined?P.blockAt>=o.parryFrom-.08:GT.clock-P.blockAt<=PARRY_WIN);
  if(parryOK){P.st='parry';P.t=0;GT.stop=Math.max(GT.stop,.12);CAM.shake=Math.max(CAM.shake,.5);sfx.parry();
   const sp=swordTip();spawnSparks(sp[0],sp[1],sp[2],18,[1,.95,.6],6);note('[Sistem] Tam zamanlı savuşturma! Düşman sarsıldı.','gold');SYS.parries=(SYS.parries||0)+1;if(src&&src.onParried)src.onParried();else if(src&&isWolf(src))wolfParried(src);return'parry'}
  const gd=o.guard!==undefined?o.guard:o.dmg*1.8;P.guard-=gd;P.guardT=1.2;sfx.block();const sp=swordTip();spawnSparks(sp[0],sp[1],sp[2],8,[1,.9,.6],4);CAM.shake=Math.max(CAM.shake,.25);
  const pd=o.dir||[0,0];P.vx=pd[0]*3;P.vz=pd[1]*3;floatText(P.x,P.y+1.7,P.z,'BLOK','');
  if(P.guard<=0){P.guard=0;P.st='gbreak';P.t=0;sfx.thud();note('[Sistem] Savunma kırıldı! Kısa süre savunmasızsın.','red');return'guardbreak'}return'block'}
 // a hit lands
 if(P.td)cancelTakedown();
 gainRage(6);if(navigator.vibrate)try{navigator.vibrate(o.knock==='down'?60:25)}catch(e){}
 P.hp-=o.dmg;P.flash=1;P.jig=1;CAM.shake=Math.max(CAM.shake,o.knock==='down'?.7:.4);GT.stop=Math.max(GT.stop,.06);floatText(P.x,P.y+1.6,P.z,'-'+Math.round(o.dmg),'red');sfx.hurt();
 if(P.hp<=0){die();return'hit'}
 const d=o.dir||[-Math.sin(P.yaw),-Math.cos(P.yaw)];
 if(o.knock==='down'&&!(P.berserk>0&&(o.power||1)<1.4)){knockDown(d,o.power||1)}else if(o.knock!=='none'&&!(P.berserk>0)&&P.st!=='drink'||o.knock==='flinch'&&P.st==='drink'){P.st='hurt';P.t=0;P.hurtDir=d;P.vx=d[0]*3.5;P.vz=d[1]*3.5;P.air=false}
 return'hit'}
function swordTip(){return mpt(PM,SK.GP[HB.rightHand].map((v,i)=>v+r3v(SK.GR[HB.rightHand],vsub(SK.midRest,PLD.bones[HB.rightHand].r))[i]))}
// ragdoll-style fall: the body tips over in the push direction like an inverted pendulum, bounces once, limbs lag behind
function knockDown(dir,power){const l=Math.hypot(dir[0],dir[1])||1,fx=dir[0]/l,fz=dir[1]/l;// world fall direction -> model space
 const c=Math.cos(P.yaw),s=Math.sin(P.yaw);P.rag={ang:Math.max(P.rag.ang||0,.05),av:2.2+power*1.6,fx:fx*c-fz*s,fz:fx*s+fz*c,bounce:0,lag:0,lagv:-3*power};
 P.st='down';P.t=0;P.vx=fx*2.6*power;P.vz=fz*2.6*power;P.vy=0;P.air=false;P.sprintHeld=false;P.crouch=false;P.charge=0;P.struggle=0;P.jig=1;sfx.thud()}
function die(){P.hp=0;P.st='dead';P.t=0;P.alive=false;P.berserk=0;P.lock=null;dropBag();SYS.deaths=(SYS.deaths||0)+1;if(P.pinBy){P.pinBy=null}if(P.td)cancelTakedown();if(P.rag.ang<.3)knockDown([-Math.sin(P.yaw),-Math.cos(P.yaw)],.8);P.st='dead';note('[Sistem] Öldün. Ruhun geri çağrılıyor…','red')}
function respawn(){const al=SYS.altarAt!==undefined&&SYS.altarAt>=0?ALTARS[SYS.altarAt]:null,c=al?[al.x+1.6,al.z+1.6]:SYS.gate?[0,60]:[SPAWN[0],SPAWN[2]];SYS.flasks=SYS.flaskMax;P.x=c[0];P.z=c[1];P.hp=maxHP();P.sta=100;P.guard=100;P.st='move';P.t=0;P.rag.ang=0;P.rag.av=0;P.inv=2;P.pinBy=null;P.alive=true;P.air=false;P.vy=0;P.lift=0;CAM.tx=P.x;CAM.tz=P.z;
 for(const w of wolves)if(!w.tame&&!w.dead){w.aware=0;if(hostileSt(w)){w.st='return';w.t=0}}for(const g of GOBS)g.calmDown&&g.calmDown();for(const c of CROCS)c.calmDown&&c.calmDown();if(DRAGON)DRAGON.calmDown();
 note('[Sistem] Yeniden doğdun.')}
// --------------------------------------------------------------- starting actions
function canAct(cost){if(P.sta<=0){note('Dayanıklılık yetersiz');return false}return true}
function spend(c){P.sta=Math.max(0,P.sta-c);P.staT=.85}
function aimAssist(range=4.2){const f=P.lock&&!P.lock.dead&&foeDist(P.lock)<range+3?P.lock:nearestFoe(range,1.7);if(f)P.yaw=Math.atan2(f.x-P.x,f.z-P.z);else if(Math.hypot(IN.wx,IN.wz)>.3)P.yaw=Math.atan2(IN.wx,IN.wz)}
function startLight(i){if(!canAct())return;spend(COST.light[i]);P.st='attack';P.t=0;P.combo=i;P.hitDone=false;P.queued=false;P.crouch=false;aimAssist();sfx.swing()}
function startCharge(){if(!canAct())return;P.st='charge';P.t=0;P.charge=0;P.crouch=false;aimAssist();sfx.charge()}
function startHeavy(){spend(COST.heavy+COST.heavyMax*P.charge);P.st='heavy';P.t=0;P.hitDone=false;aimAssist(4.6);sfx.swing()}
function startRunAtk(){if(!canAct())return;spend(COST.run);P.st='runatk';P.t=0;P.hitDone=false;aimAssist(6);sfx.swing()}
function startJump(){if(!canAct())return;spend(COST.jump);P.vy=6.6;P.air=true;P.st='jump';P.t=0;P.crouch=false;P.jumpAt=GT.clock;sfx.jump()}
function startJumpAtk(){if(!canAct())return;spend(COST.jumpAtk);P.st='jumpatk';P.t=0;P.hitDone=false;P.vy=Math.min(P.vy,1.5);aimAssist(5);sfx.swing()}
// dodge: direction from the stick relative to where the hero faces -> forward roll, back-step, or a side roll
function startDodge(){if(!canAct())return;spend(COST.dodge);P.st='dodge';P.t=0;P.inv=iframes();P.crouch=false;P.charge=0;const l=Math.hypot(IN.wx,IN.wz);
 if(l>.3){const a=angd(Math.atan2(IN.wx,IN.wz),P.yaw);if(Math.abs(a)<.8){P.dodgeKind='fwd';P.yaw=Math.atan2(IN.wx,IN.wz)}else if(Math.abs(a)>2.35)P.dodgeKind='back';else P.dodgeKind=a>0?'left':'right';P.ddx=IN.wx/l;P.ddz=IN.wz/l}
 else{P.dodgeKind='back';P.ddx=-Math.sin(P.yaw);P.ddz=-Math.cos(P.yaw)}
 P.dodgeT={fwd:.56,back:.4,left:.5,right:.5}[P.dodgeKind];P.dodgeSp={fwd:8.4,back:7.2,left:8,right:8}[P.dodgeKind];sfx.dodge()}
function startBlock(){if(P.guard<25){note('Savunma toparlanıyor…');return false}P.st='block';P.t=0;P.blockAt=GT.clock;P.crouch=false;return true}
// --------------------------------------------------------------- damage dealing
const ATK={light0:{r:2.75,arc:1.2,m:1,t:'hit'},light1:{r:2.75,arc:1.2,m:1.05,t:'hit'},light2:{r:2.9,arc:1.1,m:1.6,t:'big'},heavy:{r:3.2,arc:1.05,m:2.1,t:'big'},
 runatk:{r:3.0,arc:.95,m:1.5,t:'hit'},jumpatk:{r:2.7,arc:PI,m:1.8,t:'big'},stab:{r:1.4,arc:PI,m:99,t:'big'}};
function doHit(kind){const A=ATK[kind];spawnArc(kind==='heavy'||kind==='jumpatk'?2:kind==='light1'?1:kind==='light2'?2:0);P.noise=14;let any=false;const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);
 for(const f of foes()){const d=foeDist(f),dx=f.x-P.x,dz=f.z-P.z,dc=Math.hypot(dx,dz);if(d>A.r)continue;if(dc>.8&&!f.hitPts&&Math.abs(angd(Math.atan2(dx,dz),P.yaw))>A.arc)continue;
  if(f.hitPts&&Math.abs(angd(Math.atan2(dx,dz),P.yaw))>A.arc+.5&&d>1)continue;if(f.alt&&f.alt()>2.2&&kind!=='jumpatk')continue;
  const sneak=!foeHostile(f)&&(f.aware||0)<.5&&f.st!=='mounted',weak=isWolf(f)?f.st==='recover':(f.open&&f.open()),air=f.st==='pounce';
  const crit=Math.random()*100<5+gear('crit');let dmg=weaponDmg()*(.9+rnd()*.2)*dmgMul()*A.m*(kind==='heavy'?1+P.charge*.6:1)*(sneak?2:1)*(weak?1.5:1)*(air?1.4:1)*(crit?1.6:1)*(P.berserk>0?1.4:1)*(P.roarBuff>0?1.2:1);dmg=Math.round(dmg);
  const k=dc||1,dead=foeHurt(f,dmg,dc>.3?dx/k:fx,dc>.3?dz/k:fz,kind);any=true;if(!dead)addPosture(f,{light0:11,light1:12,light2:20,heavy:30+P.charge*25,runatk:18,jumpatk:30}[kind]||12);gainRage(4);
  const lch=gear('leech')+(P.berserk>0?8:0);if(lch>0)P.hp=Math.min(maxHP(),P.hp+dmg*lch/100);if(kind==='heavy'&&hasFx('bleed')){f.bleedT=5;f.bleedD=dmg*.08}if(hasFx('ember')&&Math.random()<.3){f.bleedT=Math.max(f.bleedT||0,2);f.bleedD=Math.max(f.bleedD||0,dmg*.06)}const hp=f.hitPts?f.hitPts()[0]:[f.x,f.y+.7*(f.sc||1)+(f.air||0),f.z];
  spawnSparks(hp[0],hp[1],hp[2],dead?22:A.t==='big'?14:7,[1,.95,.7]);floatText(hp[0],hp[1]+.4,hp[2],(sneak?'GİZLİ ':air?'KARŞI ':weak?'AÇIK ':crit?'KRİTİK ':'')+dmg,sneak||air||weak||crit||A.t==='big'?'crit':'');
  if(dead)onFoeKilled(f,false)}
 if(any){const big=A.t==='big';GT.stop=Math.max(GT.stop,big?.12:.06);CAM.shake=Math.max(CAM.shake,big?.65:.4);sfx.hit()}
 if(kind==='jumpatk'||kind==='heavy'){const tp=swordTip();spawnSparks(tp[0],hAt(tp[0],tp[2])+.1,tp[2],6,[.8,.75,.6],3);if(hasFx('fire'))for(let i=0;i<4;i++)BURNS.push({x:P.x+Math.sin(P.yaw)*(1.2+i*.9),z:P.z+Math.cos(P.yaw)*(1.2+i*.9),t:0,life:4,mine:1})}
 return any}
function onFoeKilled(f,byPet){if(isWolf(f))GS.onKill(f,byPet);else if(f.onKilled)f.onKilled(byPet);
 const tier=f===DRAGON?3:f.boss?2:f.elite||(GOBS.includes(f)&&f.big)?1:0;lootFor(f,tier,isWolf(f)?2:GOBS.includes(f)?(f.big?14:4):f===DRAGON?200:6);if(isWolf(f)&&Math.random()<.35)SYS.pelts=(SYS.pelts||0)+1;if(P.lock===f)P.lock=null;questEvent('kill',f)}
// --------------------------------------------------------------- silent takedowns
// ETKİLEŞ behind an unaware small goblin -> choke hold + sword; ZIPLA twice behind an unaware wolf -> leap + neck lock;
// ZIPLA twice behind an unaware small goblin -> leap + reverse-grip downward stab. A wolf pounce cancels all of them.
function tdTarget(range){let best=null,bd=range;for(const w of wolves){if(w.dead||w.tame||hostileSt(w)||w.aware>=.5||w.st==='pin')continue;const d=Math.hypot(w.x-P.x,w.z-P.z);if(d<bd&&behind(w,P)){bd=d;best=w}}
 for(const g of GOBS){if(g.dead||g.hostile()||g.aware>=.5||g.held)continue;const d=Math.hypot(g.x-P.x,g.z-P.z);if(d<bd&&behind(g,P)){bd=d;best=g}}return best}
function startChoke(g){P.td={kind:'choke',v:g,t:0};P.st='td';P.t=0;P.crouch=false;g.grab('choke');sfx.grab();note('[Sistem] Boyun kilidi!','gold')}
function startLeap(v){const back=v.yaw+PI,gx=v.x+Math.sin(back)*(isWolf(v)?.2:.25),gz=v.z+Math.cos(back)*(isWolf(v)?.2:.25);P.td={kind:'leap',v,t:0,sx:P.x,sz:P.z,sy:P.y,gx,gz};P.st='td';P.t=0;P.air=true;
 if(isWolf(v)){v.st='mounted';v.t=0;v.spd=0}else v.grab('pinned');sfx.jump();note(isWolf(v)?'[Sistem] Kurdun sırtına atladın!':'[Sistem] Goblinin üstüne atladın!','gold')}
function cancelTakedown(){const td=P.td;if(!td)return;const v=td.v;P.td=null;P.ps.choke=0;
 if(isWolf(v)){if(!v.dead){v.st='recover';v.t=0;v.aware=1;v.cd=1.2}}else if(!v.dead)v.escape();note('[Sistem] Alt etme bölündü!','red')}
function updateTakedown(dt){const td=P.td,v=td.v;td.t+=dt;
 if(v.dead&&td.kind!=='stab'&&td.kind!=='wolf'){P.td=null;P.st='move';return}
 if(td.kind==='choke'){const back=v.yaw+PI;P.x=lp(P.x,v.x+Math.sin(back)*.5,Math.min(1,dt*12));P.z=lp(P.z,v.z+Math.cos(back)*.5,Math.min(1,dt*12));P.yaw+=angd(v.yaw,P.yaw)*Math.min(1,dt*12);
  if(td.t>1.55&&!td.stabbed){td.stabbed=true;sfx.hit();const dead=v.hurt(999,Math.sin(P.yaw),Math.cos(P.yaw),'stab');spawnSparks(v.x,v.y+.8,v.z,16,[.8,.15,.15],3);GT.stop=.1;CAM.shake=.5;SYS.takedowns=(SYS.takedowns||0)+1;if(dead)onFoeKilled(v,false)}
  if(td.t>2.25){P.td=null;P.st='move';P.t=0}return}
 if(td.kind==='leap'){const u=Math.min(1,td.t/.42);P.x=lp(td.sx,td.gx,u);P.z=lp(td.sz,td.gz,u);P.y=lp(td.sy,hAt(P.x,P.z),u)+Math.sin(PI*u)*1.3;P.yaw+=angd(v.yaw,P.yaw)*Math.min(1,dt*14);
  if(u>=1){P.air=false;CAM.shake=.4;sfx.thud();td.kind=isWolf(v)?'wolf':'stab';td.t=0;if(!isWolf(v))v.grab('pinned')}return}
 if(td.kind==='wolf'){P.x=lp(P.x,v.x-Math.sin(v.yaw)*.15,Math.min(1,dt*10));P.z=lp(P.z,v.z-Math.cos(v.yaw)*.15,Math.min(1,dt*10));P.yaw+=angd(v.yaw,P.yaw)*Math.min(1,dt*10);v.st='mounted';v.t=td.t;
  if(td.t>2.1&&!td.done){td.done=true;sfx.hit();CAM.shake=.5;GT.stop=.1;const dead=wolfHurt(v,999,Math.sin(P.yaw),Math.cos(P.yaw),P);SYS.takedowns=(SYS.takedowns||0)+1;if(dead)GS.onKill(v,false)}
  if(td.t>2.6){P.td=null;P.st='move';P.t=0}return}
 if(td.kind==='stab'){// kneel on the goblin's back: raise the sword point-down with both hands, drive it in, pull out, stand up
  P.x=lp(P.x,v.x-Math.sin(v.yaw)*.1,Math.min(1,dt*10));P.z=lp(P.z,v.z-Math.cos(v.yaw)*.1,Math.min(1,dt*10));P.yaw+=angd(v.yaw,P.yaw)*Math.min(1,dt*10);
  if(td.t>.62&&!td.done){td.done=true;sfx.stab();CAM.shake=.55;GT.stop=.12;const dead=v.hurt(999,0,0,'stab');spawnSparks(v.x,v.y+.25,v.z,18,[.8,.15,.15],3);SYS.takedowns=(SYS.takedowns||0)+1;if(dead)onFoeKilled(v,false)}
  if(td.t>1.75){P.td=null;P.st='move';P.t=0}}}
// --------------------------------------------------------------- per-frame update
function updatePlayer(dt){P.inv=Math.max(0,P.inv-dt);P.flash=Math.max(0,P.flash-dt*3);P.noise=0;P.t+=dt;P.jig=Math.max(0,P.jig-dt*2.2);
 const cy=CAM.yaw,fx=Math.sin(cy),fz=Math.cos(cy);let ix=IN.mx+IN.kx,iz=IN.mz+IN.kz,il=Math.hypot(ix,iz);if(il>1){ix/=il;iz/=il;il=1}
 const wx=fx*iz-fz*ix,wz=fz*iz+fx*ix;IN.wx=wx;IN.wz=wz;const ox=P.x,oz=P.z;P.sprinting=false;
 const ground=()=>hAt(P.x,P.z);
 // attack button: tap = light, hold = charge heavy (only when standing on the ground)
 const atkTap=IN.atkUp&&!IN.atkUsed&&GT.clock-IN.atkAt<.24,atkHold=IN.atkHeld&&!IN.atkUsed&&GT.clock-IN.atkAt>=.24,atkEdge=IN.atkEdge;IN.atkUp=false;IN.atkEdge=false;
 if(atkTap)press('atk');
 const moveFree=(sp,turn=12)=>{if(il>.05){P.yaw+=angd(Math.atan2(wx,wz),P.yaw)*Math.min(1,dt*turn);P.vx=lp(P.vx,wx/il*sp,Math.min(1,dt*12));P.vz=lp(P.vz,wz/il*sp,Math.min(1,dt*12))}else{P.vx=lp(P.vx,0,Math.min(1,dt*14));P.vz=lp(P.vz,0,Math.min(1,dt*14))}};
 const slide=(k)=>{P.vx*=Math.exp(-dt*k);P.vz*=Math.exp(-dt*k)};
 let move=true;
 switch(P.st){
 case'move':{// sprint: holding KOŞ drains stamina; at zero it stops by itself and the hero walks until stamina is back to 30
  if(P.exhausted&&P.sta>=30)P.exhausted=false;
  P.sprinting=P.sprintHeld&&!P.exhausted&&!P.crouch&&il>.3;
  if(P.sprinting){P.sta-=COST.sprint*dt;P.staT=.6;if(P.sta<=0){P.sta=0;P.exhausted=true;P.sprinting=false;note('Dayanıklılık bitti: yürüyorsun')}}
  const sp=(P.crouch?1.9:P.sprinting?6.6:3.7)*spdMul()*il;moveFree(sp);
  if(IN.blockHeld&&startBlock())break;
  if(take('dodge'))startDodge();else if(take('jump'))startJump();
  else if((atkEdge||BUF.atk>GT.clock-.2)&&execTarget()){IN.atkUsed=true;BUF.atk=-9;startExec(execTarget())}
  else if(P.sprinting&&P.spd>4&&(atkEdge||take('atk'))){IN.atkUsed=true;startRunAtk()}else if(atkHold){IN.atkUsed=true;startCharge()}else if(take('atk'))startLight(0);
  else if(take('inter'))interact();break}
 case'exec':{slide(10);if(!P.hitDone&&P.t>.45){P.hitDone=true;execHit()}if(P.t>1.05){P.st='move';P.t=0}break}
 case'shoot':updateShoot(dt);break;
 case'drink':{const sp=1.2*il;moveFree(sp,6);const heal=maxHP()*.45;if(P.t<.9)P.hp=Math.min(maxHP(),P.hp+heal*dt/.9);if(P.t>1.05){P.st='move';P.t=0}break}
 case'skill':updateSkill(dt);break;
 case'attack':{const T=.46,u=P.t/T;slide(10);if(u>.22&&u<.6){P.vx=Math.sin(P.yaw)*3.4;P.vz=Math.cos(P.yaw)*3.4}
  if(!P.hitDone&&u>=.36){P.hitDone=true;doHit('light'+P.combo)}if(u>.25&&take('atk',.3))P.queued=true;
  if(u>.4&&take('dodge')){startDodge();break}if(u>.5&&IN.blockHeld&&startBlock())break;if(u>.5&&execTarget()&&P.queued){P.queued=false;startExec(execTarget());break}
  if(u>=1){if(P.queued&&P.combo<2)startLight(P.combo+1);else{P.st='move';P.t=0}}break}
 case'charge':{slide(12);P.charge=Math.min(1,P.t/.9);if(il>.2)P.yaw+=angd(Math.atan2(wx,wz),P.yaw)*Math.min(1,dt*4);if(P.t>.9&&!P.chargedFx){P.chargedFx=1;sfx.charged();const tp=swordTip();spawnSparks(tp[0],tp[1],tp[2],10,[.6,.8,1],2)}
  if(!IN.atkHeld||P.t>1.3){P.chargedFx=0;startHeavy()}else if(take('dodge')){P.chargedFx=0;startDodge()}break}
 case'heavy':{const T=.7,u=P.t/T;slide(10);if(u>.3&&u<.55){P.vx=Math.sin(P.yaw)*2.6;P.vz=Math.cos(P.yaw)*2.6}if(!P.hitDone&&u>=.5){P.hitDone=true;doHit('heavy')}if(u>=1){P.st='move';P.t=0;P.charge=0}break}
 case'runatk':{const T=.6,u=P.t/T,sp=lp(7.5,0,sst(.2,.75,u));P.vx=Math.sin(P.yaw)*sp;P.vz=Math.cos(P.yaw)*sp;if(!P.hitDone&&u>=.38){P.hitDone=true;doHit('runatk')}if(u>=1){P.st='move';P.t=0}break}
 case'jump':{moveFree((P.sprinting?5:3.4)*il,4);if(atkEdge||take('atk')){IN.atkUsed=true;startJumpAtk()}
  else if(P.t<.55&&take('jump',.05)){const v=tdTarget(4.8);if(v&&!isWolf(v)&&v.big)note('Büyük goblin tutulamaz');else if(v)startLeap(v);else if(tdTarget(9))note('Çok uzak: hedefin arkasına daha çok yaklaş')}
  break}
 case'jumpatk':{slide(2);P.vy-=8*dt;if(!P.air&&!P.hitDone){P.hitDone=true;doHit('jumpatk');P.t=0;P.st='land';P.landT=.38}break}
 case'land':{slide(14);if(P.t>(P.landT||.15)){P.st='move';P.t=0}break}
 case'dodge':{const u=Math.min(1,P.t/P.dodgeT),sp=P.dodgeSp*(1-u*.7);P.vx=P.ddx*sp;P.vz=P.ddz*sp;const e=u*u*(3-2*u);
  P.spin=P.dodgeKind==='fwd'?2*PI*e:0;P.roll=P.dodgeKind==='left'?2*PI*e:P.dodgeKind==='right'?-2*PI*e:0;if(u>=1){P.st='move';P.t=0;P.spin=0;P.roll=0}break}
 case'block':{const sp=1.5*il;moveFree(sp,6);if(il>.05&&!nearestFoe(8,PI))P.yaw+=angd(Math.atan2(wx,wz),P.yaw)*Math.min(1,dt*6);else{const f=nearestFoe(10,PI);if(f)P.yaw+=angd(Math.atan2(f.x-P.x,f.z-P.z),P.yaw)*Math.min(1,dt*8)}
  if(!IN.blockHeld){P.st='move';P.t=0}else if(take('atk')){P.st='move';startLight(0)}else if(take('dodge'))startDodge();break}
 case'parry':slide(10);if(P.t>.32){P.st=IN.blockHeld?'block':'move';P.t=0}break;
 case'gbreak':slide(6);if(P.t>1.4){P.st='move';P.t=0}break;
 case'hurt':slide(8);if(P.t>.38){P.st='move';P.t=0}break;
 case'td':move=false;updateTakedown(dt);if(!P.td&&P.st==='td'){P.st='move';P.t=0}break;
 case'down':{const R=P.rag;slide(5);// inverted pendulum about the feet, one damped bounce on the ground
  if(R.ang<1.45){R.av+=Math.sin(Math.max(R.ang,.05))*9.5*dt;R.ang+=R.av*dt;if(R.ang>=1.45){R.ang=1.45;R.av=-R.av*.22;R.bounce++;CAM.shake=Math.max(CAM.shake,.35);sfx.thud();R.lagv+=6}}
  else{R.av-=9*dt;R.ang=Math.min(1.45,R.ang+R.av*dt);if(R.ang>=1.45)R.av=0}
  R.lagv+=(-R.lag*40-R.lagv*7)*dt;R.lag+=R.lagv*dt;
  if(P.pinBy){if(IN.mash>0){P.struggle+=(.12+(SYS.agi-5)*.01)*Math.min(IN.mash,2);P.jig=.8;CAM.shake=Math.max(CAM.shake,.12);sfx.struggle()}BUF.atk=BUF.dodge=BUF.jump=-9;
   if(P.struggle>=1){const w=P.pinBy;P.pinBy=null;w.st='recover';w.t=0;w.pitch=0;w.cd=rr(1.6,2.4);w.kx=-Math.sin(w.yaw)*7;w.kz=-Math.cos(w.yaw)*7;w.flash=1;sfx.hit();note('[Sistem] Kurdu üstünden attın!');P.t=0}}
  else if(P.t>.9&&R.ang>=1.4){P.st='getup';P.t=0}break}
 case'getup':{slide(10);const R=P.rag;R.ang=Math.max(0,1.45*(1-sst(.15,.95,P.t/1.0)));R.av=0;if(P.t>1.0){P.st='move';P.t=0;R.ang=0;P.inv=Math.max(P.inv,1.0);const p=collide(P.x,P.z,.34);P.x=p[0];P.z=p[1]}break}
 case'dead':{const R=P.rag;slide(5);if(R.ang<1.45){R.av+=Math.sin(Math.max(R.ang,.05))*9.5*dt;R.ang=Math.min(1.45,R.ang+R.av*dt)}if(P.t>3.6)respawn();break}}
 IN.mash=0;
 // integrate: horizontal velocity with collision and deep-water stop; vertical with gravity
 if(move){let nx=P.x+P.vx*dt,nz=P.z+P.vz*dt;if(depthAt(nx,nz)>1.25){nx=P.x;nz=P.z;P.vx=P.vz=0}const p=collide(nx,nz,.34);P.x=p[0];P.z=p[1]}
 if(P.air&&P.st!=='td'){P.vy-=19*dt;P.y+=P.vy*dt;const g=Math.max(ground(),waterAt(P.x,P.z)-1.25);if(P.y<=g&&P.vy<=0){P.y=g;P.vy=0;P.air=false;if(P.st==='jump'){P.st='land';P.t=0;P.landT=.14;sfx.land()}}}
 else if(P.st!=='td'){const g=Math.max(ground(),waterAt(P.x,P.z)-1.25);P.y=g}
 // stamina regenerates after a short pause (slower while blocking); guard regenerates when not hit for a while
 if(P.staT>0)P.staT-=dt;else P.sta=Math.min(100,P.sta+(P.st==='block'?12:30)*dt*(1+gear('sta')/100)*(P.berserk>0?1.5:1)*(P.exhaustT>0?.5:1));
 if(P.guardT>0)P.guardT-=dt;else P.guard=Math.min(100,P.guard+(P.st==='gbreak'?0:P.guard<25?9:16)*dt);
 if(P.st==='move'||P.st==='getup')P.hp=Math.min(maxHP(),P.hp+.45*dt);
 const mv=Math.hypot(P.x-ox,P.z-oz);P.spd=dt>0?mv/dt:0;if(P.st==='move'){SYS.walked+=mv;P.ph+=mv*(P.sprinting?2.5:P.crouch?5.2:4.3)}
 if(P.sprinting)P.noise=Math.max(P.noise,9);
 if(!SYS.gate&&Math.hypot(P.x,P.z)<46){SYS.gate=1;P.cp=[0,60]}if(!SYS.knight&&Math.hypot(P.x-10,P.z-50)<5.5)SYS.knight=1}
// --------------------------------------------------------------- pose targets per state
function poseTarget(){const q=Object.assign({},POSE0),t=GT.time,s=Math.sin(P.ph),c=Math.cos(P.ph);let rate=14;
 const run=(mv,sprint)=>{const A=(sprint?.9:.5)*mv,B=(sprint?1.55:.95)*mv;q.LthX=-s*A;q.RthX=s*A;q.Lkn=.12+Math.max(0,c)*B;q.Rkn=.12+Math.max(0,-c)*B;q.LaX=s*A*.75;q.RaX=-.3-s*A*.45;q.Lel=sprint?1.15:.4;q.Rel=sprint?.9:.55;
  q.spX=sprint?.2:.05;q.pel=sprint?.1:.02;q.chY=s*.14*mv;q.spY=-s*.06*mv;q.hipY=-Math.abs(s)*(sprint?.03:.012)};
 switch(P.st){
 case'move':case'land':{const mv=cl(P.spd/3.4,0,1);
  if(P.crouch){q.pel=.36;q.spX=.32;q.hdX=-.5;q.LthX=-1.02-s*.32*mv;q.RthX=-1.02+s*.32*mv;q.Lkn=1.72+Math.max(0,c)*.3*mv;q.Rkn=1.72+Math.max(0,-c)*.3*mv;q.LaZ=1.05;q.Lel=.9;q.RaZ=1.0;q.RaX=-.5;q.Rel=.9}
  else if(mv>.08)run(mv,P.sprinting&&P.spd>4.6);
  else{q.chX=Math.sin(t*1.6)*.02;q.hdY=Math.sin(t*.5)*.12;q.LaX=.05+Math.sin(t*1.6)*.02}
  if(P.st==='land'){q.pel=.25;q.LthX=q.RthX=-.7;q.Lkn=q.Rkn=1.1;rate=25}break}
 case'attack':{rate=34;const u=P.t/.46,w=sst(0,.3,u),sl=sst(.3,.58,u);q.spX=.14;q.Lel=.85;q.LaX=.45;q.LaZ=1.0;
  if(P.combo===0){q.RaZ=.2;q.RaX=-.1;q.RaY=lp(-.75,2.15,sl);q.Rel=lp(.45,.08,sl);q.chY=lp(-.55,.65,sl);q.spY=lp(-.2,.25,sl);q.LthX=-.5;q.Lkn=.55;q.RthX=.35;q.Rkn=.25;if(u<.3)q.RaY=lp(P.ps.RaY,-.75,w)}
  else if(P.combo===1){q.RaZ=.45;q.RaX=0;q.RaY=lp(2.15,-.55,sl);q.Rel=lp(.3,.08,sl);q.chY=lp(.6,-.55,sl);q.spY=lp(.25,-.2,sl);q.RthX=-.5;q.Rkn=.55;q.LthX=.35;q.Lkn=.25}
  else{q.RaZ=-1.3;q.RaY=.25;q.RaX=lp(-.65,1.8,sl);q.Rel=lp(.6,.05,sl);q.chX=lp(-.2,.5,sl);q.spX=lp(-.05,.3,sl);q.LthX=-.6;q.Lkn=.7;q.RthX=.3;q.Rkn=.3;q.RwX=lp(-.3,.3,sl);q.two=.0}break}
 case'charge':{rate=12;const k=P.charge;q.two=1;q.RaZ=-1.25-k*.35;q.RaY=.2;q.RaX=-.85-k*.25;q.Rel=.75;q.chX=-.25*k;q.spX=-.12*k;q.LthX=-.55;q.Lkn=.7;q.RthX=.35;q.Rkn=.35;q.pel=.1;q.hipY=-.04*k;q.RwX=-.3-k*.3;break}
 case'heavy':{rate=30;const u=P.t/.7,sl=sst(.32,.55,u);q.two=1;q.RaZ=lp(-1.6,-.7,sl);q.RaY=.25;q.RaX=lp(-1.1,1.7,sl);q.Rel=lp(.75,.05,sl);q.chX=lp(-.3,.55,sl);q.spX=lp(-.15,.35,sl);q.pel=lp(.1,.25,sl);
  q.LthX=lp(-.55,-.9,sl);q.Lkn=lp(.7,1.0,sl);q.RthX=.4;q.Rkn=.4;q.hipY=-.08*sl;q.RwX=lp(-.6,.4,sl);break}
 case'runatk':{rate=30;const u=P.t/.6,sl=sst(.25,.5,u);q.RaZ=.3;q.RaX=lp(-.9,.2,sl);q.RaY=lp(-1.1,1.9,sl);q.Rel=lp(.7,.05,sl);q.chY=lp(-.7,.7,sl);q.spX=.35;q.pel=.2;q.LthX=-.9;q.Lkn=.9;q.RthX=.55;q.Rkn=.3;q.LaX=.7;q.Lel=1.1;break}
 case'jump':{rate=16;const up=P.vy>0;q.pel=.15;q.LthX=up?-.9:-.5;q.Lkn=up?1.4:.9;q.RthX=up?-.2:-.35;q.Rkn=up?.9:.6;q.LaZ=.7;q.LaX=-.5;q.RaZ=.8;q.RaX=-.5;q.Rel=.8;q.spX=.1;break}
 case'jumpatk':{rate=26;q.two=1;q.RaZ=-1.4;q.RaX=lp(-1.1,1.5,sst(0,.25,P.t));q.Rel=.2;q.RaY=.2;q.chX=.45;q.spX=.35;q.pel=.3;q.LthX=-1.2;q.Lkn=1.6;q.RthX=-.6;q.Rkn=1.4;break}
 case'dodge':{rate=30;if(P.dodgeKind==='back'){q.pel=-.15;q.spX=-.25;q.LthX=.3;q.Lkn=.6;q.RthX=-.4;q.Rkn=.9;q.LaZ=.8;q.LaX=-.3;q.RaX=-.6;q.Rel=.9}
  else{q.pel=.9;q.spX=.7;q.chX=.4;q.hdX=.5;q.LthX=q.RthX=-1.5;q.Lkn=q.Rkn=2.1;q.LaZ=.9;q.LaX=-.6;q.Lel=1.6;q.RaZ=.9;q.RaX=-.6;q.Rel=1.6}break}
 case'block':case'parry':{rate=22;q.two=1;q.RaZ=.55;q.RaX=-1.05;q.RaY=-.35;q.Rel=1.45;q.RwX=-.35;q.RwZ=.35;q.spX=.12;q.pel=.12;q.LthX=-.45;q.Lkn=.55;q.RthX=.2;q.Rkn=.35;q.hdX=-.1;
  if(P.st==='parry'){const k=1-P.t/.32;q.RaX-=.6*k;q.chX=-.2*k;q.hdX=-.3*k}break}
 case'gbreak':{rate=12;const k=Math.sin(P.t*9)*(1-P.t/1.4);q.RaZ=.2;q.RaX=-1.6;q.Rel=.3;q.LaZ=.5;q.LaX=-1.2;q.spX=-.35+k*.1;q.chX=-.2;q.hdX=-.4;q.pel=-.2;q.LthX=.3;q.Lkn=.5;q.RthX=-.3;q.Rkn=.6;break}
 case'exec':{rate=26;const u=P.t,k=sst(.2,.45,u)-sst(.7,1,u)*.6;q.two=1;q.RaZ=.4;q.RaX=lp(-1.4,-.2,k);q.RaY=-.2;q.Rel=lp(1.3,.1,k);q.RwX=lp(-.9,-.2,k);q.spX=lp(-.1,.45,k);q.pel=.25*k;q.LthX=-.9*k;q.Lkn=1.0*k;q.RthX=.5*k;q.Rkn=.3;q.hipY=-.1*k;break}
 case'shoot':{rate=18;q.LaZ=.3;q.LaX=-1.35;q.Lel=.05;q.RaZ=.55;q.RaX=-1.25;q.Rel=1.7;q.spY=-.3;break}
 case'drink':{rate=16;const k=sst(0,.25,P.t)-sst(.85,1.05,P.t);q.LaZ=lp(1.22,.3,k);q.LaX=lp(.05,-1.3,k);q.Lel=lp(.25,2.1,k);q.hdX=-.3*k;q.chX=-.1*k;break}
 case'skill':{rate=30;const k2=P.skill;if(k2==='spin'){q.two=1;q.RaZ=-.1;q.RaX=-.15;q.RaY=1.6;q.Rel=.1;q.spY=-.4;q.pel=.15;q.LthX=-.5;q.Lkn=.7;q.RthX=-.2;q.Rkn=.5}
  else if(k2==='roar'){const k=sst(0,.35,P.t)-sst(.75,1,P.t);q.chX=-.45*k;q.hdX=-.6*k;q.LaZ=lp(1.22,.5,k);q.LaX=-.4*k;q.Lel=.8;q.RaZ=lp(1.12,.6,k);q.spX=-.2*k;q.LthX=-.4*k;q.Lkn=.6*k;q.RthX=.3*k}
  else if(k2==='dash'){q.two=1;q.RaZ=.2;q.RaX=.3;q.RaY=1.9;q.Rel=.1;q.spX=.5;q.pel=.35;q.LthX=-1.1;q.Lkn=1.2;q.RthX=.6;q.Rkn=.4;q.chY=.6}
  else if(k2==='slam'){q.two=1;const air=P.air;q.RaZ=-1.4;q.RaX=air?-1.0:1.6;q.Rel=air?.7:.05;q.RaY=.2;q.chX=air?-.3:.6;q.spX=air?-.1:.4;q.pel=air?.1:.4;q.LthX=air?-1:-1.2;q.Lkn=air?1.3:1.5;q.RthX=air?-.6:.4;q.Rkn=air?1.2:.6;q.hipY=air?0:-.15}break}
 case'hurt':{rate=26;const k=1-P.t/.38;q.spX=-.35*k;q.chX=-.25*k;q.hdX=-.4*k;q.LaZ=.8;q.LaX=-.6*k;q.RaX=-.7*k;break}
 case'td':{rate=18;const td=P.td;if(!td)break;
  if(td.kind==='choke'){q.choke=td.t<1.4?1:Math.max(0,1-(td.t-1.4)*6);q.chokeH=.86;q.spX=.32;q.pel=.22;q.hipY=-.1;q.LthX=-.85;q.Lkn=1.15;q.RthX=-.3;q.Rkn=.8;q.chY=Math.sin(td.t*15)*.05;
   if(td.t>1.35){const u=sst(1.35,1.6,td.t);q.RaZ=.25;q.RaX=lp(-.4,-1.3,u);q.RaY=lp(-.6,.2,u);q.Rel=lp(1.6,.15,u)}}
  else if(td.kind==='leap'){q.pel=.3;q.LthX=-1.1;q.Lkn=1.5;q.RthX=-.8;q.Rkn=1.3;q.LaZ=.5;q.LaX=-1.2;q.RaZ=.5;q.RaX=-1.2;q.spX=.3}
  else if(td.kind==='wolf'){q.choke=1;q.chokeH=.62;q.pel=.6;q.spX=.45;q.hipY=-.32;q.LthX=-1.3;q.Lkn=2.0;q.RthX=-1.3;q.Rkn=2.0;q.LthZ=.55;q.RthZ=-.55;q.chY=Math.sin(t*14)*.08}
  else if(td.kind==='stab'){const up=td.t<.55,stand=sst(1.05,1.7,td.t);q.rev=1-stand;q.revDn=up?0:sst(.5,.64,td.t)-sst(.8,1.0,td.t)*.7;q.pel=lp(.55,0,stand);q.spX=lp(.35+(up?0:.25),0,stand);q.hipY=lp(-.42,0,stand);
   q.LthX=lp(-1.35,0,stand);q.Lkn=lp(2.1,0,stand);q.RthX=lp(-.2,0,stand);q.Rkn=lp(2.2,0,stand);q.hdX=lp(.4,0,stand)}break}
 case'down':case'dead':{rate=10;const j=P.jig,n=(a,b)=>Math.sin(t*a+b)*j,R=P.rag,lag=cl(R.lag,-1.2,1.2);// limbs trail behind the falling body
  q.LaZ=.35+n(23,1)*.3+lag*.4;q.LaX=-.4+n(19,2)*.4-lag*.6;q.Lel=.7+n(27,3)*.4;q.RaZ=.5+n(21,4)*.3+lag*.4;q.RaX=.3+n(25,5)*.4-lag*.5;q.Rel=.9+n(17,6)*.3;
  q.LthX=-.35+n(15,7)*.35+lag*.3;q.Lkn=.75+n(22,8)*.4;q.RthX=-.1+n(18,9)*.3+lag*.2;q.Rkn=.3+n(24,1.5)*.4;q.LthZ=.26;q.RthZ=-.2;q.hdX=-.3+lag*.5+n(29,2.5)*.25;q.hdY=n(13,3.5)*.5;q.spX=-.08+n(16,4.5)*.12;q.spY=n(14,5.5)*.2;break}
 case'getup':{rate=12;const u=P.t;q.pel=lp(.5,0,sst(.5,1,u));q.spX=lp(.6,.05,sst(.3,1,u));q.LthX=q.RthX=lp(-1.1,0,sst(.4,1,u));q.Lkn=lp(1.7,.1,sst(.4,1,u));q.Rkn=lp(1.2,.1,sst(.4,1,u));q.LaZ=.9;q.Lel=.8;q.LaX=lp(.6,0,u);break}}
 const p=P.ps,k=Math.min(1,GT.dt*rate);for(const n in q)p[n]=(p[n]===undefined?q[n]:p[n]+(q[n]-p[n])*k)}
// model matrix: yaw, scale, ragdoll tilt about the feet in the fall direction, dodge rolls; then lifted so no bone sinks into the ground
function playerMatrix(dt){const R=P.rag;let M=mtrs([P.x,P.y,P.z],[0,P.yaw,0]);for(let k=0;k<12;k++)M[k]*=PSC;
 if(R.ang>.001){const ax=vnorm([R.fz,0,-R.fx]),A=axisAng(ax,R.ang),m4=new Float32Array([A[0],A[3],A[6],0,A[1],A[4],A[7],0,A[2],A[5],A[8],0,0,0,0,1]);M=mmul(mmul(M,mtrs([0,.06,0],[0,0,0])),mmul(m4,mtrs([0,-.06,0],[0,0,0])))}
 if(P.st==='dodge'&&P.spin)M=mmul(mmul(M,mtrs([0,.42,0],[P.spin,0,0])),mtrs([0,-.42,0],[0,0,0]));
 if(P.st==='dodge'&&P.roll)M=mmul(mmul(M,mtrs([0,.42,0],[0,0,P.roll])),mtrs([0,-.42,0],[0,0,0]));
 // ground clearance: lowest body point must stay above the terrain (prevents sinking while lying, rolling, kneeling)
const lying=P.st==='down'||P.st==='dead'||P.st==='getup'||P.st==='dodge'||P.st==='td'||P.rag.ang>.05;
 let need=0;const H=HB,chk=[[H.head,.11],[H.upperChest,.1],[H.hips,.09],[H.leftHand,.03],[H.rightHand,.03],[H.leftLowerArm,.04],[H.rightLowerArm,.04],[H.leftLowerLeg,.05],[H.rightLowerLeg,.05],[H.leftFoot,.03],[H.rightFoot,.03]];
 if(lying)for(const[b,m]of chk){const w=mpt(M,SK.GP[b]);need=Math.max(need,m-(w[1]-hAt(w[0],w[2])))}
 if(P.air||P.st==='td')need=Math.max(0,need);P.lift=Math.max(need,P.lift-(dt||0)*2.5);if(P.lift<1e-4)P.lift=0;M[13]+=P.lift;return M}
