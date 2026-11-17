// ===================== four stances, perfect dodge, chain parry (skill over stats) =====================
// A stance changes how the sword is used: speed, combo length, reach, arc and what it is strong against.
// Using the right stance against an enemy type breaks its balance much faster; the wrong one still works.
const STANCES={
 stone:{n:'TAŞ',c:'#d8dbe6',d:'Dengeli üçlü kombo; bitirici KAYA KIRAN siper kırar. Blok daha az yorar. Küçük silahlı düşmanlara (goblinler) karşı güçlü.',T:.46,combo:3,dm:[1,1.05,1.7],pm:[1,1,2.2],pose:[0,1,2],arc:1.2,r:2.75,cost:1,hvT:.7,hvM:2.1,how:'Başlangıç',strong:f=>GOBS.includes(f)&&!f.big},
 wind:{n:'RÜZGÂR',c:'#8fe38f',d:'Saplamalar ve uzun menzil; bitirici RÜZGÂR DELİŞİ üç düşmanı deler, savurur. Atılma ucuz ve uzun. Hızlı düşmanlara (kurtlar) karşı güçlü.',T:.42,combo:3,dm:[.95,.95,1.6],pm:[1,1,1.9],pose:[1,0,2],arc:.85,r:3.5,cost:1,lunge:1,hvT:.62,hvM:1.9,how:'5 kurt avla',strong:f=>isWolf(f)},
 moon:{n:'AY',c:'#c9a0ff',d:'Yavaş, geniş, iki elle iki savuruş; bitirici AY HİLALİ yerde ilerleyen bir dalga yollar, ağır saldırı çepeçevre keser. Savuşturması dar ama çok sert. İri düşmanlara karşı güçlü.',T:.62,combo:2,dm:[1.45,2.1],pm:[1.6,2.6],pose:[1,2],arc:2.2,r:3.1,cost:1.35,hvT:.85,hvM:2.6,hvArc:PI,how:"Kül Yele'yi yen",strong:f=>!isWolf(f)&&(f.big||f.boss||f===DRAGON)},
 water:{n:'SU',c:'#7cc4ff',d:'Çok hızlı dört vuruş; bitirici SU AKINTISI kanatır ve nefes verir. Savuşturma penceresi en geniş. Zırhlı ve kalkanlı düşmanlara karşı güçlü.',T:.33,combo:4,dm:[.7,.7,.75,1.3],pm:[1.2,1.2,1.3,2.4],pose:[0,1,0,2],arc:1.1,r:2.6,cost:.72,hvT:.6,hvM:1.7,how:"Kırık Diş'i yen",strong:f=>CROCS.includes(f)||!!f.shield}};
const STANCE_ORDER=['stone','wind','moon','water'];
const curStance=()=>STANCES[SYS.stance]||STANCES.stone;
function checkStances(){SYS.stances=SYS.stances||{stone:1};const give=(k,why)=>{if(SYS.stances[k])return;SYS.stances[k]=1;note('[Sistem] Yeni duruş: «'+STANCES[k].n+'» — '+STANCES[k].d,'gold');sfx.level()};
 if((SYS.main||0)>=3||(SYS.qk||0)>=5)give('wind');if(SYS.ashmane)give('moon');if(SYS.chief)give('water');if(!SYS.stance||!SYS.stances[SYS.stance])SYS.stance='stone'}
function setStance(k){if(!SYS.stances||!SYS.stances[k]||SYS.stance===k)return false;SYS.stance=k;if(P.st==='attack'||P.st==='heavy'||GT.clock-(P.lastAtkEnd||-9)<.5)P.flowAt=GT.clock;P.stanceFx=.5;sfx.lock();floatText(P.x,P.y+2.2,P.z,STANCES[k].n+' DURUŞU','crit');stanceHud();return true}
function cycleStance(){const have=STANCE_ORDER.filter(k=>SYS.stances&&SYS.stances[k]);if(have.length<2){note('Başka duruş yok. Yeni duruşlar: 5 kurt avla, Kül Yele, Kırık Diş.');return}setStance(have[(have.indexOf(SYS.stance)+1)%have.length])}
function stanceHud(){const e=$('stance');if(!e)return;const S=curStance();e.textContent='◆ '+S.n;e.style.color=S.c;const b=$('bStance');if(b){b.innerHTML='<i>R2</i>'+S.n;b.style.borderColor=S.c;b.style.color=S.c}}
// perfect dodge: the dodge began just before the blow would have landed -> time slows, the next hit is a counter
function perfectDodge(o){if(P.st!=='dodge'||P.t>.2||(P.perfAt||-9)>GT.clock-.5)return;P.perfAt=GT.clock;P.counterT=1.6;GT.slow=.3;P.sta=Math.min(100,P.sta+25);gainRage(12);sfx.parry();floatText(P.x,P.y+2,P.z,'KUSURSUZ KAÇINMA','crit');SYS.perfDodges=(SYS.perfDodges||0)+1;
 // stepping INTO the attack (forward dodge) meets it: the attacker's balance is shattered
 const s=o.src;if(s&&P.dodgeKind==='fwd'&&s.hp!==undefined&&Math.hypot(s.x-P.x,s.z-P.z)<3.2){addPosture(s,POSMAX[posKind(s)]*.7);floatText(s.x,(s.y||0)+1.8,s.z,'KARŞILAMA','crit')}}
// chain parry: every perfect parry within 3 s of the last one hits the attacker's balance harder
function chainParry(src){P.chain=GT.clock-(P.lastParry||-9)<3?(P.chain||1)+1:1;P.lastParry=GT.clock;gainRage(6+4*P.chain);P.counterT=1.2;if(src&&src.hp!==undefined)addPosture(src,18*P.chain);if(P.chain>1)floatText(P.x,P.y+2.1,P.z,'ZİNCİR ×'+P.chain,'crit')}
// assassination: △ (heavy) from behind an enemy that has not noticed you — a silent neck cut. Small enemies die at once,
// big ones and bosses take a deep wound and lose their balance.
function startAssassin(v){P.st='assn';P.t=0;P.asV=v;P.hitDone=false;P.crouch=false;P.yaw=Math.atan2(v.x-P.x,v.z-P.z);GT.slow=.22;sfx.swing()}
function assassinHit(v){if(!v||v.dead)return;const heavy=v.big||v.boss||v===DRAGON,dmg=heavy?Math.round(weaponDmg()*5*dmgMul()):Math.ceil(v.hp)+1,k=Math.hypot(v.x-P.x,v.z-P.z)||1;
 const hy=(v.y||hAt(v.x,v.z))+(isWolf(v)?.7:v.big?2:1.15)*(v.sc||1);spawnSparks(v.x,hy,v.z,26,[.85,.1,.1],5);floatText(v.x,hy+.5,v.z,'SUİKAST '+dmg,'crit');GT.stop=.14;CAM.shake=Math.max(CAM.shake,.6);sfx.stab();
 const dead=foeHurt(v,dmg,(v.x-P.x)/k,(v.z-P.z)/k,'assn');SYS.assassins=(SYS.assassins||0)+1;gainRage(15);if(dead)onFoeKilled(v,false);else if(heavy)breakFoe(v)}
