// ===================== region levels, status ticks, mini bosses: Kül Yele (alpha wolf) and Kırık Diş (goblin chief) =====================
// Bosses are learnable: every move has its own tell, phase two adds a new idea (a howl that calls the pack, a horn that
// calls goblins, a stomp shockwave you jump over), never just more health.
const BOSSES=[];const DEN=[-420,-225];
function scaleWorld(){for(const w of wolves)if(!w.boss)scaleFoe(w,regionLevel(w.hx,w.hz),w.alpha?95:60);for(const g of GOBS)if(!g.boss)scaleFoe(g,regionLevel(g.hx,g.hz),g.skel?SKEL_HP:g.big?260:38);
 for(const c of CROCS)scaleFoe(c,regionLevel(c.hx,c.hz),120);if(DRAGON){DRAGON.lv=18}}
function spawnBosses(){// Kül Yele: the alpha of the wolf den in the north-west forest
 const [x,z]=collide(DEN[0],DEN[1],1);const a=mkWolf(x,z,{alpha:true,yaw:0});a.boss=true;a.sc=1.75;a.title='KÜL YELE · ALFA KURT';scaleFoe(a,4,520);a.phase=1;a.howlT=0;a.ashen=true;BOSSES.push(a);
 for(let i=0;i<3;i++){const p=collide(x+Math.cos(i*2.1)*7,z+Math.sin(i*2.1)*7,.6);const w=mkWolf(p[0],p[1]);scaleFoe(w,4,60);w.den=true}
 // Kırık Diş: replaces the big goblin of the eastern camp
 const c=CAMPSITES[0],old=GOBS.find(g=>g.big&&g.camp===c);if(old){old.boss=true;old.title='KIRIK DİŞ · GOBLİN ŞEFİ';old.sc=1.5;scaleFoe(old,7,720);old.phase=1;old.rad=1.0;old.chief=true;BOSSES.push(old);old.R.ob.col=[1.1,.85,.8]}}
// status effects on foes: bleeding, the player's own fire trails, fear (fleeing after a war cry)
function foeTicks(dt){for(const f of foes()){if(f.bleedT>0){f.bleedT-=dt;f.bleedAcc=(f.bleedAcc||0)+dt;if(f.bleedAcc>.5){f.bleedAcc=0;const d=Math.max(1,Math.round(f.bleedD||2)),dead=foeHurt(f,d,0,0,'bleed');floatText(f.x,(f.y||0)+1.3,f.z,''+d,'red');if(dead)onFoeKilled(f,false)}}
  if(f.fear&&GT.clock<f.fear&&!f.dead){const dx=f.x-P.x,dz=f.z-P.z,k=Math.hypot(dx,dz)||1;f.kx=dx/k*4.5;f.kz=dz/k*4.5;f.yaw=Math.atan2(dx,dz)}}
 for(const b of BURNS)if(b.mine&&b.t<b.life){b.tick=(b.tick||0)+dt;if(b.tick>.5){b.tick=0;for(const f of foes())if(Math.hypot(f.x-b.x,f.z-b.z)<1.4&&!(f.alt&&f.alt()>2)){const dead=foeHurt(f,Math.round(weaponDmg()*.25),0,0,'fire');if(dead)onFoeKilled(f,false)}}}}
// ---------- per-frame boss brains (run before/after the normal creature AI)
function updateBosses(dt){for(const b of BOSSES){if(b.dead)continue;const d=Math.hypot(P.x-b.x,P.z-b.z);
  if(isWolf(b)){// phase 2 at half health: howl (1.4 s, head up, "!"), calls the den; every 18 s again while it lives
   if(b.phase===1&&b.hp<b.max*.5){b.phase=2;b.howlT=0;startHowl(b)}if(b.phase===2&&hostileSt(b)&&b.st!=='howl'&&(b.howlT+=dt)>18&&b.st==='circle'){b.howlT=0;startHowl(b)}
   if(b.st==='howl'){b.t+=0;b.spd=0;b.crouch=lp(b.crouch,0,.2);b.hpit=lp(b.hpit||0,-.9,.2);b.jaw=.9;if(b.t>1.4){b.st='chase';b.t=0;b.hpit=0;callPack(b)}}
   if(b.phase===2)b.cd=Math.min(b.cd,1.2)}
  else if(b.chief){if(b.phase===1&&b.hp<b.max*.5){b.phase=2;note('[!] Kırık Diş öfkelendi! Boru çalıyor.','red');b.st='horn';b.t=0}
   if(b.st==='horn'){b.spd=0;if(b.t>1.3){b.st='chase';b.t=0;sfx.horn();for(let i=0;i<3;i++){const g=GOBS.find(x=>!x.dead&&!x.big&&x.camp===b.camp&&!x.called)||null;if(g){g.called=1;g.aware=1;g.st='chase';g.t=0;g.ls=[P.x,P.z]}else{const p=collide(b.x+Math.cos(i*2)*9,b.z+Math.sin(i*2)*9,.4),n=mkGob(p[0],p[1],false,b.group,b.camp);scaleFoe(n,b.lv,38);n.R=rigObj(GOBM,{out:.014,cull:150});n.aware=1;n.st='chase';n.called=1}}}}}}}
function startHowl(w){w.st='howl';w.t=0;sfx.howl();note('[!] Kül Yele uluyor — sürü geliyor!','red');CAM.shake=Math.max(CAM.shake,.4)}
function callPack(b){let n=0;for(const w of wolves){if(n>=3)break;if(w.dead||w.tame||w===b||hostileSt(w))continue;if(Math.hypot(w.x-b.x,w.z-b.z)<60){w.st='chase';w.t=0;w.aware=1;w.calm=0;w.ls=[P.x,P.z];n++}}
 for(;n<3;n++){const a=Math.random()*6.28,p=collide(b.x+Math.cos(a)*14,b.z+Math.sin(a)*14,.6),w=mkWolf(p[0],p[1]);scaleFoe(w,b.lv,60);w.st='chase';w.aware=1;w.ls=[P.x,P.z];w.summoned=1}}
