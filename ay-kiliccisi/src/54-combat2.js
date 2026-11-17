// ===================== combat depth: posture + execution, rage (berserk), skills, lock-on =====================
// Posture: every hit pushes a foe's balance; heavy attacks and parries push most. A broken foe staggers and can be
// EXECUTED (big damage, slow-motion). Rage fills while fighting; when full, ÖFKE turns the armour red: more damage,
// no flinching, life steal. Skills are new moves, not just numbers, and unlock through the story and levels.
const POSMAX={wolf:70,gob:55,big:190,croc:130,dragon:650,alpha:240,chief:340};
function posKind(f){if(f.pk)return f.pk;return isWolf(f)?(f.boss?'alpha':'wolf'):f===DRAGON?'dragon':GOBS.includes(f)?(f.boss?'chief':f.big?'big':'gob'):'croc'}
function addPosture(f,amt){if(f.dead)return;const k=posKind(f),max=POSMAX[k]*(f.lv?1+.05*(f.lv-1):1);f.pos=(f.pos||0)+amt*(1+gear('pos')/100)*(hasFx('posture')?1.35:1)*(P.berserk>0?1.5:1);f.posT=2.2;
 if(f.pos>=max){f.pos=0;breakFoe(f)}}
function posFrac(f){const k=posKind(f),max=POSMAX[k]*(f.lv?1+.05*(f.lv-1):1);return cl((f.pos||0)/max,0,1)}
function breakFoe(f){f.broken=GT.clock+2.6;sfx.break();CAM.shake=Math.max(CAM.shake,.4);const p=[f.x,(f.y||0)+1.2,f.z];spawnSparks(p[0],p[1],p[2],14,[1,.9,.5],4);floatText(p[0],p[1]+.5,p[2],'DENGE KIRILDI','crit');
 if(isWolf(f)){f.st='recover';f.t=-1.7;f.air=0;f.pitch=0}else if(f===DRAGON){if(f.st==='hover'||f.st==='breath'){f.st='land';f.t=0;dPlay(f,'down',.3,1)}else{f.st='stagger';f.t=0;dPlay(f,'taitou',.25)}}
 else{f.st='stagger';f.t=0;f.held=null}}
function updatePosture(dt){for(const f of foes()){if(f.posT>0)f.posT-=dt;else if(f.pos>0)f.pos=Math.max(0,f.pos-dt*(POSMAX[posKind(f)]*.12))}}
const isBroken=f=>f.broken&&GT.clock<f.broken&&!f.dead;
function execTarget(){let best=null,bd=3.4;for(const f of foes()){if(!isBroken(f))continue;const d=foeDist(f),a=Math.abs(angd(Math.atan2(f.x-P.x,f.z-P.z),P.yaw));if(d<bd&&a<1.4){bd=d;best=f}}return best}
function startExec(f){P.st='exec';P.t=0;P.execT=f;P.yaw=Math.atan2(f.x-P.x,f.z-P.z);P.hitDone=false;GT.slow=.35;sfx.charge();note('[Sistem] İNFAZ!','gold')}
function execHit(){const f=P.execT;if(!f||f.dead)return;const dmg=Math.round(weaponDmg()*4.2*dmgMul()*(1+gear('exe')/100));const k=Math.hypot(f.x-P.x,f.z-P.z)||1,dead=foeHurt(f,dmg,(f.x-P.x)/k,(f.z-P.z)/k,'exec');
 const hp=f.hitPts?f.hitPts()[0]:[f.x,(f.y||0)+1,f.z];spawnSparks(hp[0],hp[1],hp[2],30,[.9,.15,.12],5);floatText(hp[0],hp[1]+.6,hp[2],'İNFAZ '+dmg,'crit');GT.stop=.16;CAM.shake=.9;sfx.stab();
 f.broken=0;f.pos=0;gainRage(10);if(hasFx('oath'))P.hp=Math.min(maxHP(),P.hp+maxHP()*.2);if(hasFx('posture'))P.sta=100;SYS.execs=(SYS.execs||0)+1;if(dead)onFoeKilled(f,false)}
// ---------- rage
function gainRage(n){if(P.berserk>0)return;P.rage=Math.min(100,(P.rage||0)+n*(1+gear('rage')/100)*(hasFx('rage2')?2:1)*(SYS.veyraFate==='killed'?1.3:1));P.rageT=6}
const WHISPER=['"Daha fazla, Kael."','"Kokularını alıyorum."','"Hiçbiri kaçmasın."','"Kılıç aç."','"Bu sefer sonuna kadar."'];
function startRage(){if((P.rage||0)<100||P.berserk>0||!P.alive)return;P.berserk=12;P.rage=0;sfx.roar(.8);CAM.shake=.6;GT.stop=.12;note('[Öfke] '+WHISPER[Math.floor(Math.random()*WHISPER.length)],'red');SYS.rages=(SYS.rages||0)+1}
function updateRage(dt){if(P.berserk>0){P.berserk-=dt;if(P.berserk<=0){P.exhaustT=3;note('Öfke söndü. Nefesin daraldı.')}}else{if(P.rageT>0)P.rageT-=dt;else P.rage=Math.max(0,(P.rage||0)-dt*3)}if(P.exhaustT>0)P.exhaustT-=dt;if(P.roarBuff>0)P.roarBuff-=dt}
// ---------- skills
const SKILLS={spin:{n:'Dönen Kesik',d:'Etrafındaki herkesi iki tur keser.',cost:28,cd:4,how:'Kül Yele\'yi yen ya da Sv.3'},roar:{n:'Savaş Kükremesi',d:'Yakındakilerin dengesini sarsar, küçükleri kaçırır, 8 sn hasar +%20.',cost:15,cd:25,how:'Kırık Diş\'i yen'},
 dash:{n:'Gölge Adımı',d:'7 m ileri atılıp yoldakileri keser, sırasında dokunulmazsın.',cost:22,cd:6,how:'Sv.6'},slam:{n:'Yer Yaran',d:'Sıçrayıp yere vurur: 4 m çevreyi devirir.',cost:30,cd:14,how:'Sv.10 ya da Veyra\'nın güveni'}};
function unlockSkill(k,why){SYS.skills=SYS.skills||{};if(SYS.skills[k])return;SYS.skills[k]=1;if(!SYS.skill)SYS.skill=k;note('[Sistem] Yeni yetenek: «'+SKILLS[k].n+'» — '+SKILLS[k].d,'gold');sfx.level();save(P)}
function checkSkillUnlocks(){if(SYS.lv>=3)unlockSkill('spin');if(SYS.lv>=6)unlockSkill('dash');if(SYS.lv>=10)unlockSkill('slam')}
function useSkill(){const k=SYS.skill;if(!k||!(SYS.skills||{})[k]){note('Henüz yetenek yok (Sv.3\'te açılır)');return}if(P.st!=='move'&&P.st!=='attack')return;P.cd=P.cd||{};if((P.cd[k]||0)>GT.clock){note(SKILLS[k].n+' hazır değil');return}
 if(P.sta<SKILLS[k].cost*.5){note('Dayanıklılık yetersiz');return}spend(SKILLS[k].cost);P.cd[k]=GT.clock+SKILLS[k].cd;P.st='skill';P.skill=k;P.t=0;P.hits=0;P.crouch=false;if(k==='dash'){P.inv=.45;aimAssist(9)}if(k==='slam'){P.vy=7.5;P.air=true}sfx.swing()}
function skillHitAll(r,m,posAdd,knock){let any=false;for(const f of foes()){const d=foeDist(f);if(d>r)continue;if(f.alt&&f.alt()>2.2)continue;const dx=f.x-P.x,dz=f.z-P.z,k=Math.hypot(dx,dz)||1;
  const dmg=Math.round(weaponDmg()*dmgMul()*m*(.9+Math.random()*.2)),dead=foeHurt(f,dmg,dx/k,dz/k,'skill');addPosture(f,posAdd);any=true;const hp=f.hitPts?f.hitPts()[0]:[f.x,(f.y||0)+.8,f.z];spawnSparks(hp[0],hp[1],hp[2],8,[1,.9,.7]);floatText(hp[0],hp[1]+.4,hp[2],''+dmg,'crit');
  if(knock&&!dead&&!f.boss&&f!==DRAGON){f.kx=dx/k*7;f.kz=dz/k*7}if(dead)onFoeKilled(f,false)}if(any){sfx.hit();GT.stop=Math.max(GT.stop,.07);CAM.shake=Math.max(CAM.shake,.5);gainRage(5)}return any}
function updateSkill(dt){const k=P.skill,t=P.t;P.vx*=Math.exp(-dt*8);P.vz*=Math.exp(-dt*8);
 if(k==='spin'){P.yaw+=dt*16;if(P.hits===0&&t>.3){P.hits=1;skillHitAll(3.3,1.2,22)}if(P.hits===1&&t>.62){P.hits=2;skillHitAll(3.3,1.2,22)}if(t>.9){P.st='move';P.t=0}}
 else if(k==='roar'){if(P.hits===0&&t>.35){P.hits=1;CAM.shake=.7;sfx.roar(1);P.roarBuff=8;for(const f of foes()){const d=foeDist(f);if(d<9){addPosture(f,POSMAX[posKind(f)]*.6);if(!f.boss&&f!==DRAGON&&(isWolf(f)||!f.big)){f.fear=GT.clock+3;if(isWolf(f)){f.st='recover';f.t=-1}else{f.st='stagger';f.t=0}}}}note('[Sistem] Savaş Kükremesi!','gold')}if(t>1){P.st='move';P.t=0}}
 else if(k==='dash'){const sp=t<.3?22:0;P.vx=Math.sin(P.yaw)*sp;P.vz=Math.cos(P.yaw)*sp;if(t>.06&&t<.32)for(const f of foes()){if(f.dashHit===P.cd.dash)continue;if(foeDist(f)<1.4){f.dashHit=P.cd.dash;const dx=f.x-P.x,dz=f.z-P.z,kk=Math.hypot(dx,dz)||1,dmg=Math.round(weaponDmg()*dmgMul()*1.3),dead=foeHurt(f,dmg,dx/kk,dz/kk,'skill');addPosture(f,25);spawnSparks(f.x,(f.y||0)+.8,f.z,10,[.6,.5,1]);floatText(f.x,(f.y||0)+1.4,f.z,''+dmg,'crit');if(dead)onFoeKilled(f,false)}}if(t>.45){P.st='move';P.t=0}}
 else if(k==='slam'){if(!P.air&&P.hits===0&&t>.2){P.hits=1;skillHitAll(4.4,2.0,45,true);spawnSparks(P.x,P.y+.2,P.z,24,[.7,.6,.5],6);CAM.shake=.9;sfx.thud();if(hasFx('fire'))for(let i=0;i<8;i++){const a=i/8*6.28;BURNS.push({x:P.x+Math.cos(a)*2.5,z:P.z+Math.sin(a)*2.5,t:0,life:4,mine:1})}}if(P.hits===1&&t>.2&&!P.air&&P.t>.9){P.st='move';P.t=0}if(t>2.5){P.st='move';P.t=0}}}
// ---------- lock-on
function toggleLock(){if(P.lock){P.lock=null;note('Hedef bırakıldı');return}let best=null,bs=1e9;for(const f of foes()){const d=Math.hypot(f.x-P.x,f.z-P.z);if(d>28)continue;const a=Math.abs(angd(Math.atan2(f.x-P.x,f.z-P.z),CAM.yaw)),s=d*(1+a*2)*(foeHostile(f)?.6:1);if(a<1.3&&s<bs){bs=s;best=f}}
 if(best){P.lock=best;sfx.lock()}else note('Yakında hedef yok')}
function updateLock(dt){const f=P.lock;if(!f)return;if(f.dead||Math.hypot(f.x-P.x,f.z-P.z)>32){P.lock=null;return}const want=Math.atan2(f.x-P.x,f.z-P.z);CAM.yaw+=angd(want,CAM.yaw)*Math.min(1,dt*5);CAM.pitch=lp(CAM.pitch,.22,Math.min(1,dt*3))}
// boss / elite bar target: the closest hostile boss within 60 m
function bossTarget(){let b=null,bd=60;for(const f of foes()){if(!(f.boss||f===DRAGON)||!foeHostile(f))continue;const d=Math.hypot(f.x-P.x,f.z-P.z);if(d<bd){bd=d;b=f}}return b}

// ---------- danger rings: an area attack shows its reach on the ground while it winds up (learnable, fair)
let ringGeo=null;const RINGS=[];
function dangerRing(x,z,r,life,col){if(!ringGeo){const g=G(),N=40;for(let k=0;k<N;k++){const a0=k/N*2*PI,a1=(k+1)/N*2*PI,o=g.P.length/3;g.P.push(Math.cos(a0)*.9,0,Math.sin(a0)*.9,Math.cos(a1)*.9,0,Math.sin(a1)*.9,Math.cos(a1),0,Math.sin(a1),Math.cos(a0),0,Math.sin(a0));for(let q=0;q<4;q++){g.N.push(0,1,0);g.C.push(1,1,1);g.U.push(0,0);g.W.push(0)}g.I.push(o,o+1,o+2,o,o+2,o+3)}ringGeo=geo(g)}
 let R=RINGS.find(q=>!q.on);if(!R){R={ob:obj(ringGeo,{unlit:1,blend:1,col:[1,.2,.1],shade:0,pos:[0,0,0],cull:200,ds:1})};RINGS.push(R)}Object.assign(R,{on:true,x,z,r,t:0,life,col:col||[1,.18,.08]});return R}
function updateRings(dt){for(const R of RINGS){if(!R.on){R.ob.vis=false;continue}R.t+=dt;if(R.t>R.life){R.on=false;R.ob.vis=false;continue}
 const k=R.t/R.life,s=R.r*(.35+.65*Math.min(1,k*1.3));R.ob.vis=true;R.ob.col=R.col;R.ob.alpha=.3+.55*k;R.ob.M=mtrs([R.x,hAt(R.x,R.z)+.08,R.z],[0,0,0]);R.ob.M[0]*=s;R.ob.M[10]*=s;R.ob.pos=[R.x,0,R.z]}}
