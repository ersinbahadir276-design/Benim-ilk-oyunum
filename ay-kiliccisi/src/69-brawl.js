// ===================== BRAWL (v21): how wolves and goblins really fight =====================
// A wolf pack does not trade blows: it goes for the back of the legs, clamps onto the sword arm and baits a swing so a
// packmate can bite the opening. A goblin fights dirty: dirt in the eyes, a dive at the legs to drag you down, and it
// plays dead after a "killing" blow, then gets up behind you.
// HERO GRABS: one shared state ('grabbed') for every hold — mash any button to break free before the time runs out.
const GRAB={by:null};
function grabHero(by,o){if(!P.alive||P.st==='dead'||P.st==='grabbed'||P.st==='ride')return false;if(P.td)cancelTakedown();if(P.pinBy)return false;
 P.st='grabbed';P.t=0;P.struggle=0;P.vx=P.vz=0;P.charge=0;P.sprintHeld=false;P.crouch=false;
 Object.assign(GRAB,{by,kind:o.kind,need:o.need||1,lim:o.lim||3,tickT:o.tickT||.7,tt:o.tickT||.7,onFree:o.onFree,onFail:o.onFail,onTick:o.onTick,pos:o.pos||null,label:o.label||'KURTUL! Düğmelere art arda bas'});
 CAM.shake=Math.max(CAM.shake,.5);sfx.grab();if(o.msg)note('[!] '+o.msg,'red');return true}
function updateGrabbed(dt){const g=GRAB,by=g.by;
 if(!by||by.dead||(by.grabLost&&by.grabLost())){releaseHero(false,false);return}
 if(IN.mash>0){P.struggle+=(.1+(SYS.agi-5)*.01)*Math.min(IN.mash,2)/g.need;P.jig=.8;CAM.shake=Math.max(CAM.shake,.12);sfx.struggle()}
 BUF.atk=BUF.dodge=BUF.jump=BUF.hvy=-9;
 if(g.pos){const p=g.pos();P.x=p[0];P.y=p[1];P.z=p[2];P.held=1;P.air=false}
 g.tt-=dt;if(g.tt<=0){g.tt=g.tickT;if(g.onTick)g.onTick(by)}
 if(P.struggle>=1){releaseHero(true,false);return}
 if(P.t>g.lim)releaseHero(false,true)}
function releaseHero(free,timeout){const g=GRAB,by=g.by;if(!by&&P.st!=='grabbed')return;g.by=null;P.held=0;if(P.st==='grabbed'){P.st='move';P.t=0;if(g.pos){P.air=true;P.vy=0}}
 if(!by)return;if(free){P.inv=Math.max(P.inv,.35);if(g.onFree)g.onFree(by)}else if(timeout&&g.onFail)g.onFail(by)}
// a hold that hurts a little on every tick, whatever the guard (it is teeth or claws already in you)
function holdHurt(src,dmg){if(!P.alive)return;const inv=P.inv;P.inv=0;hitPlayer({src,dmg,knock:'none',unblockable:true,parryable:false});P.inv=inv}
function grabPose(q){const t=P.t,k=GRAB.kind;
 if(k==='arm'){q.RaX=-1.3+Math.sin(t*22)*.35;q.RaZ=-.9;q.Rel=.2;q.LaX=-1.1;q.LaZ=.4;q.Lel=1.2;q.spX=.25;q.chY=-.35+Math.sin(t*18)*.12;q.hdX=-.2;q.LthX=-.45;q.Lkn=.6;q.RthX=.15;q.Rkn=.3}
 else if(k==='leg'){q.spX=.55;q.chX=.2;q.hdX=.4;q.RaX=-.4+Math.sin(t*16)*.6;q.Rel=.4;q.LaX=-.3;q.LaZ=.7;q.Lel=.6;q.LthX=-.1;q.Lkn=.3;q.RthX=-.6+Math.max(0,Math.sin(t*12))*.7;q.Rkn=.9}
 else{q.spX=-.15;q.hdX=.35;q.LaX=-2.6+Math.sin(t*9)*.3;q.RaX=-2.4+Math.sin(t*11)*.4;q.Lel=.7;q.Rel=.5;q.LthX=.25+Math.sin(t*7)*.3;q.RthX=-.2-Math.sin(t*7)*.3;q.Lkn=.6;q.Rkn=.4}}
// ---------- status on the hero: limping (hamstrung), blinded (dirt in the eyes)
function brawlTick(dt){if(P.slowT>0)P.slowT-=dt;if(P.blindT>0){P.blindT-=dt;if(P.blindT>.3)P.lock=null}
 const b=$('blind');if(b){const v=cl((P.blindT||0)/.6,0,1);b.style.opacity=v.toFixed(2);b.style.display=v>0?'block':'none'}}
function brawlInit(){if($('blind'))return;const b=document.createElement('div');b.id='blind';b.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:6;display:none;opacity:0;background:radial-gradient(ellipse at 50% 55%,rgba(60,42,24,.25) 8%,rgba(46,32,18,.93) 38%,rgba(20,14,8,.99) 70%)';document.body.appendChild(b);
 const st=document.createElement('style');st.textContent='#bban{position:fixed;left:0;right:0;top:30%;text-align:center;pointer-events:none;z-index:7;display:none;font-family:serif;letter-spacing:.18em;text-shadow:0 0 18px #f20,0 0 4px #000}#bban b{display:block;font-size:min(9vw,54px);color:#ffd9b0}#bban i{display:block;font-style:normal;font-size:min(4vw,20px);color:#ff8a5a;margin-top:6px}#bban.on{display:block;animation:bban 3.4s ease-out forwards}@keyframes bban{0%{opacity:0;transform:scale(1.6)}12%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(.96)}}';document.head.appendChild(st);
 const bb=document.createElement('div');bb.id='bban';bb.innerHTML='<b></b><i></i>';document.body.appendChild(bb)}
function bossBanner(t,s){const b=$('bban');if(!b)return;b.firstChild.textContent=t;b.lastChild.textContent=s||'';b.className='';void b.offsetWidth;b.className='on'}
const heroBusy=()=>/^(attack|heavy|runatk|charge|block|parry|drink)$/.test(P.st);
const heroOpen=()=>P.alive&&!/^(grabbed|ride|down|getup|dead|td|exec)$/.test(P.st);
// ===================== WOLF TRICKS =====================
// 1) HAMSTRING — from behind (or while you are busy with someone else) a low dash at the back of the legs: you limp 4.5 s.
// 2) ARM LATCH — when you stand blocking or are stuck after a swing, a wolf leaps and clamps on the sword arm: no attacks,
//    it shakes and pulls, the pack moves in; mash to throw it off (it lands open), fail and you are dragged down.
// 3) BAIT — a wolf fakes a full rush and stops short; swing at it and a packmate bites the opening from the side.
function wolfTryTrick(w,d,dt){if(w.tame||!heroOpen())return false;const now=GT.clock;
 const rel=Math.abs(angd(Math.atan2(w.x-P.x,w.z-P.z),P.yaw)),busy=heroBusy();
 if(d>2.2&&d<6.5&&(w.hsCd||0)<now&&(rel>2.0||busy&&P.lock!==w)&&Math.random()<dt*1.4&&attackOK(w)){w.st='hamstring';w.t=0;w.hsCd=now+rr(7,10);w.resolved=false;sfx.snarl();return true}
 if(d>1.6&&d<4.2&&(w.alCd||0)<now&&rel<1.3&&(P.st==='block'||/^(attack|heavy)$/.test(P.st)&&P.t>.3)&&Math.random()<dt*1.2&&attackOK(w)){w.st='armleap';w.t=0;w.alCd=now+rr(9,13);w.resolved=false;sfx.growl();return true}
 if(d>4&&d<8.5&&(w.fCd||0)<now&&wolves.some(o=>o!==w&&!o.dead&&!o.tame&&hostileSt(o)&&Math.hypot(o.x-P.x,o.z-P.z)<11)&&Math.random()<dt*.45){w.st='feint';w.t=0;w.fCd=now+rr(7,11);w.baited=0;sfx.snarl();return true}
 return false}
function wolfTrick(w,d,dt,GS){switch(w.st){
 case'hamstring':{const T0=.4;w.jaw=lp(w.jaw,.7,.2);w.tail=-.6;
  if(w.t<T0){w.spd=lp(w.spd,0,.4);w.crouch=lp(w.crouch,1,.3);wolfFace(w,P.x-Math.sin(P.yaw)*.6,P.z-Math.cos(P.yaw)*.6,dt,10);break}
  const tx=P.x-Math.sin(P.yaw)*.5,tz=P.z-Math.cos(P.yaw)*.5;if(!w.resolved)wolfFace(w,tx,tz,dt,7);w.crouch=lp(w.crouch,.7,.3);w.pitch=lp(w.pitch,.22,.3);
  const sp=w.resolved?6:11.5,p=collide(w.x+Math.sin(w.yaw)*sp*dt,w.z+Math.cos(w.yaw)*sp*dt,.42);w.x=p[0];w.z=p[1];w.spd=sp;
  const hd=Math.hypot(P.x-w.x,P.z-w.z);
  if(!w.resolved&&hd<1.15&&!P.air){w.resolved=true;w.jaw=1;const r=hitPlayer({src:w,dmg:7,guard:26,dir:[Math.sin(w.yaw),Math.cos(w.yaw)],knock:'flinch',name:'kurt'});
   if(r==='hit'){P.slowT=4.5;floatText(P.x,P.y+1.3,P.z,'TOPALLIYORSUN','red');note('[!] Kurt bacağının arkasını ısırdı — bir süre topallarsın.','red');sfx.bite()}else if(r==='parry'){wolfParried(w);break}else if(r==='block'){w.st='recover';w.t=0;w.pitch=0;w.kx=-Math.sin(w.yaw)*6;w.kz=-Math.cos(w.yaw)*6;break}}
  if(w.t>T0+.6||w.resolved&&w.t>T0+.25&&hd>1.8){w.st='recover';w.t=.2;w.pitch=0;w.cd=rr(1,1.8)}break}
 case'armleap':{const T0=.34;
  if(w.t<T0){w.spd=0;w.crouch=lp(w.crouch,.85,.4);wolfFace(w,P.x,P.z,dt,12);w.jaw=.5;w.sx=w.x;w.sz=w.z;const rx=Math.cos(P.yaw)*-.45,rz=-Math.sin(P.yaw)*-.45;w.ax=P.x+rx;w.az=P.z+rz;break}
  const u=Math.min(1,(w.t-T0)/.3);w.x=lp(w.sx,w.ax,u);w.z=lp(w.sz,w.az,u);w.air=4*.95*u*(1-u);w.pitch=lp(-.6,.2,u);w.crouch=lp(w.crouch,0,.3);w.jaw=1;
  if(!w.resolved&&u>.45&&Math.hypot(P.x-w.x,P.z-w.z)<1.3){w.resolved=true;const r=hitPlayer({src:w,dmg:5,guard:34,dir:[Math.sin(w.yaw),Math.cos(w.yaw)],knock:'none',name:'kurt'});
   if(r==='parry'){wolfParried(w);break}if(r==='block'||r==='guardbreak'){if(r==='block'){w.st='recover';w.t=0;w.air=0;w.pitch=0;w.kx=-Math.sin(w.yaw)*6;w.kz=-Math.cos(w.yaw)*6;break}}
   if((r==='hit'||r==='guardbreak')&&P.alive){w.grabLost=()=>w.st!=='armlatch';
    if(grabHero(w,{kind:'arm',lim:3.2,tickT:.75,msg:'Kurt kılıç koluna kenetlendi! Art arda bas, silkele!',label:'SİLKELE! Düğmelere art arda bas',
     onTick:o=>{holdHurt(o,3);P.yaw+=rr(-.35,.35);o.jaw=1;sfx.bite()},
     onFree:o=>{o.st='recover';o.t=-.7;o.air=0;o.pitch=0;o.kx=Math.cos(P.yaw)*-6;o.kz=-Math.sin(P.yaw)*-6;o.flash=1;addPosture(o,30);floatText(o.x,o.y+1,o.z,'SİLKELEDİN','gold');sfx.hit()},
     onFail:o=>{o.st='recover';o.t=0;o.air=0;knockDown([Math.cos(P.yaw),-Math.sin(P.yaw)],1);note('[!] Kurt seni yere çekti!','red')}})){w.st='armlatch';w.t=0;break}}}
  if(u>=1){w.air=0;w.pitch=0;w.st='recover';w.t=0;w.cd=rr(1.2,2)}break}
 case'armlatch':{if(P.st!=='grabbed'||GRAB.by!==w){w.st='recover';w.t=0;w.air=0;w.pitch=0;break}
  const hx=P.x+Math.cos(P.yaw)*-.62+Math.sin(P.yaw)*.35,hz=P.z-Math.sin(P.yaw)*-.62+Math.cos(P.yaw)*.35;w.x=lp(w.x,hx+Math.cos(P.yaw)*-.5,.4);w.z=lp(w.z,hz-Math.sin(P.yaw)*-.5,.4);
  wolfFace(w,hx,hz,dt,14);w.air=.55;w.pitch=-.55;w.crouch=.2;w.spd=0;w.jaw=lp(w.jaw,.75,.3);w.hyaw=Math.sin(w.t*24)*.55;w.tail=Math.sin(w.t*20)*.7;return 'held'}
 case'feint':{w.tail=-.4;
  if(w.t<.5){wolfFace(w,P.x,P.z,dt,10);w.crouch=lp(w.crouch,.45,.3);w.jaw=lp(w.jaw,.8,.3);if(d>2.7){const p=collide(w.x+Math.sin(w.yaw)*9.5*dt,w.z+Math.cos(w.yaw)*9.5*dt,.42);w.x=p[0];w.z=p[1];w.spd=9.5}else w.spd=lp(w.spd,0,.5)}
  else{if(!w.hop){w.hop=1;w.jaw=1;sfx.snap();w.kx=-Math.sin(w.yaw)*6.5;w.kz=-Math.cos(w.yaw)*6.5}w.spd=0;w.jaw=lp(w.jaw,.25,.2);w.crouch=lp(w.crouch,.3,.2);wolfFace(w,P.x,P.z,dt,8)}
  if(!w.baited&&w.t>.15&&/^(attack|heavy)$/.test(P.st)&&P.t<.2){w.baited=1;let o=null,od=11;for(const v of wolves){if(v===w||v.dead||v.tame||!hostileSt(v)||/^(bitewind|rush|bite|pin|armlatch|hamstring)$/.test(v.st))continue;const q=Math.hypot(v.x-P.x,v.z-P.z);if(q<od){od=q;o=v}}
   if(o){o.st='bitewind';o.t=0;o.bwT=.18;o.resolved=false;DIR.last=-9;floatText(w.x,w.y+1.1,w.z,'YEM!','yel');note('[!] Sahte atılmaydı — öbür kurt açığından geliyor!','red')}}
  if(w.t>1.15){w.st='circle';w.t=0;w.hop=0;w.cd=Math.max(w.cd||0,.6)}break}}
 return false}
// ===================== GOBLIN TRICKS =====================
// 1) DIRT — it scoops a fistful of dirt (crouch, hand to the ground) and throws it at your face: blind ~2.8 s unless you
//    dash; a raised guard only shields part of it. The others rush in while you cannot see.
// 2) TACKLE — a low dive at the legs (block does not stop it — dash or jump). Caught: it hangs on your legs, you cannot
//    move or swing, mash to kick it off before you are dragged down. Missed: it sprawls face-down, wide open.
// 3) PLAYING DEAD — a "killing" blow sometimes leaves it alive: it lies still until you look away or walk off, then gets
//    up and lunges at your back (危). Strike the "corpse" and it is over for real.
function gobFeign(g,kind){if(g.undead||g.human||/^(stab|assn|exec|choke|so|bleed|fall|slam|clash)/.test(kind||'')||g.held||/^(choked|pinned|escape|latched)$/.test(g.st)||g.big||g.boss||g.feigned||g.lookout||g.elite||g.archer||g.so||Math.random()>=.28)return false;g.feigned=1;g.hp=1;g.st='playdead';g.t=0;g.held=null;g.kx*=.5;g.kz*=.5;g.aware=0;if(P.lock===g)P.lock=null;return true}
function gobTricks(g,d,dt){switch(g.st){
 case'dirt':{g.spd=lp(g.spd,0,.4);const T=.7;if(g.t<T)agentFace(g,P.x,P.z,dt,10);
  if(g.t>=T&&!g.thrown){g.thrown=1;sfx.swing();const fx=Math.sin(g.yaw),fz=Math.cos(g.yaw);for(let i=0;i<4;i++)spawnSparks(g.x+fx*(1+i*.9),g.y+1.1+i*.05,g.z+fz*(1+i*.9),7,[.42,.32,.2],2.5);
   const rel=Math.abs(angd(Math.atan2(P.x-g.x,P.z-g.z),g.yaw));if(d<5.6&&rel<.6&&P.alive&&heroOpen()){
    if(P.inv>0){floatText(P.x,P.y+1.6,P.z,'KAÇINDIN','gold')}
    else{const guard=P.st==='block'&&Math.abs(angd(Math.atan2(g.x-P.x,g.z-P.z),P.yaw))<1.2,T2=guard?1.0:2.8;P.blindT=Math.max(P.blindT||0,T2);P.lock=null;
     if(!guard&&!/^(grabbed|ride)$/.test(P.st)){P.st='hurt';P.t=0;P.hurtDir=[fx,fz]}floatText(P.x,P.y+1.6,P.z,guard?'GÖZÜNÜ KORUDUN':'GÖZÜN KÖR!','red');note(guard?'[!] Toprak kalkanına çarptı — kısa bir an göremiyorsun.':'[!] Goblin gözüne toprak attı! Birkaç saniye göremiyorsun — geri çekil!','red');
     DIR.last=-9;for(const o of GOBS)if(o!==g&&!o.dead&&o.hostile()&&Math.hypot(o.x-P.x,o.z-P.z)<12){o.cd=Math.min(o.cd,.1)}}}}
  if(g.t>T+.5){g.st='chase';g.t=0;g.thrown=0;g.cd=rr(.4,.9)}return true}
 case'tackle':{const T=.5;
  if(g.t<T){g.spd=lp(g.spd,0,.4);agentFace(g,P.x,P.z,dt,12);g.dx=Math.sin(g.yaw);g.dz=Math.cos(g.yaw);return true}
  const u=g.t-T;if(u<.42){const p=collide(g.x+g.dx*10*dt,g.z+g.dz*10*dt,g.rad);g.x=p[0];g.z=p[1];g.spd=0;
   if(!g.hitDone&&Math.hypot(P.x-g.x,P.z-g.z)<1.05&&heroOpen()){g.hitDone=true;
    if(P.air||P.inv>0){floatText(P.x,P.y+1.6,P.z,P.air?'ÜSTÜNDEN ATLADIN':'KAÇINDIN','gold');if(P.inv>0)perfectDodge({src:g})}
    else{holdHurt(g,4);g.grabLost=()=>g.st!=='latched';
     if(grabHero(g,{kind:'leg',lim:2.4,tickT:.8,msg:'Goblin bacaklarına sarıldı! Art arda bas, tekmele!',label:'TEKMELE! Düğmelere art arda bas',
      onTick:o=>{holdHurt(o,2)},
      onFree:o=>{o.st='stagger';o.t=0;o.kx=Math.sin(P.yaw)*7;o.kz=Math.cos(P.yaw)*7;o.flash=1;addPosture(o,30);floatText(o.x,o.y+1,o.z,'TEKMELEDİN','gold');sfx.hit()},
      onFail:o=>{o.st='escape';o.from='pinned';o.t=.6;knockDown([Math.sin(o.yaw),Math.cos(o.yaw)],1.1);note('[!] Goblin seni yere devirdi!','red')}})){g.st='latched';g.t=0;return true}}}
   return true}
  g.st='sprawl';g.t=0;g.hitDone=false;floatText(g.x,g.y+.8,g.z,'AÇIK!','gold');sfx.thud();return true}
 case'latched':{if(P.st!=='grabbed'||GRAB.by!==g){g.st='escape';g.from='pinned';g.t=.5;return true}
  g.x=lp(g.x,P.x+Math.sin(P.yaw)*.62,.4);g.z=lp(g.z,P.z+Math.cos(P.yaw)*.62,.4);g.yaw=Math.atan2(P.x-g.x,P.z-g.z);g.spd=0;g.kx=g.kz=0;return true}
 case'sprawl':g.spd=0;g.kx*=.9;g.kz*=.9;if(g.t>1.5){g.st='escape';g.from='pinned';g.t=0}return true;
 case'playdead':{g.spd=0;g.kx*=.85;g.kz*=.85;const back=Math.abs(angd(Math.atan2(g.x-P.x,g.z-P.z),P.yaw))>1.9;
  if(P.alive&&g.t>2.2&&((back&&d>2&&d<9)||g.t>9)&&d<16){g.st='rise';g.t=0;sfx.gobShout()}return true}
 case'gkick':{g.spd=lp(g.spd,0,.4);agentFace(g,P.x,P.z,dt,10);if(g.t>=.45&&!g.hitDone){g.hitDone=true;sfx.swing();if(d<2.1&&heroOpen()&&Math.abs(angd(Math.atan2(P.x-g.x,P.z-g.z),g.yaw))<.9){if(P.inv>0)perfectDodge({src:g});else if(P.st==='block'){P.guard=0;P.st='gbreak';P.t=0;sfx.thud();CAM.shake=Math.max(CAM.shake,.4);floatText(P.x,P.y+1.8,P.z,'SİPERİN KIRILDI','red');note('[!] Goblin siperine tekme attı — blokta beklemek her zaman güvenli değil.','red')}else hitPlayer({src:g,dmg:6,guard:30,dir:[Math.sin(g.yaw),Math.cos(g.yaw)],knock:'flinch',parryable:false})}}
  if(g.t>.9){g.st='chase';g.t=0;g.hitDone=false;g.cd=rr(.5,1)}return true}
 case'unarmed':{const ax=g.x-P.x,az=g.z-P.z,k=Math.hypot(ax,az)||1;if(g.t<2.2){agentMove(g,g.x+ax/k*4,g.z+az/k*4,4.6,dt,g.rad,6)}else{g.spd=lp(g.spd,0,.4)}if(g.t>3.4){g.st='chase';g.t=0;g.cd=.6;floatText(g.x,g.y+1.8,g.z,'TAŞ KAPTI','');g.rock=1}return true}
 case'bgrab':{const T=.75;if(g.t<T){g.spd=lp(g.spd,0,.4);agentFace(g,P.x,P.z,dt,3);return true}
  if(g.t<T+.3){const p=collide(g.x+Math.sin(g.yaw)*6*dt,g.z+Math.cos(g.yaw)*6*dt,g.rad);g.x=p[0];g.z=p[1];if(!g.hitDone&&Math.hypot(P.x-g.x,P.z-g.z)<2.4&&heroOpen()){g.hitDone=true;if(P.inv>0){perfectDodge({src:g})}else{g.grabLost=()=>g.st!=='bhold';
   if(grabHero(g,{kind:'big',lim:2.0,need:1.4,tickT:.7,pos:()=>[g.x+Math.sin(g.yaw)*1.1*g.sc,g.y+1.3*g.sc,g.z+Math.cos(g.yaw)*1.1*g.sc],msg:'Büyük goblin seni kaldırdı! Art arda bas — fırlatmadan kurtul!',label:'KURTUL! Düğmelere art arda bas',
    onTick:o=>holdHurt(o,3),onFree:o=>{o.st='stagger';o.t=0;addPosture(o,50);floatText(o.x,o.y+2.4,o.z,'KURTULDUN','gold')},
    onFail:o=>{o.st='recover';o.t=0;P.y=hAt(P.x,P.z);const a=o.yaw;P.x+=Math.sin(a)*1.5;P.z+=Math.cos(a)*1.5;knockDown([Math.sin(a),Math.cos(a)],2.4);holdHurt(o,24);CAM.shake=Math.max(CAM.shake,.8);note('[!] Büyük goblin seni fırlattı!','red')}})){g.st='bhold';g.t=0;return true}}}return true}
  g.st='recover';g.t=0;g.hitDone=false;return true}
 case'bhold':{if(P.st!=='grabbed'||GRAB.by!==g){g.st='recover';g.t=0}g.spd=0;return true}
 case'rise':{const u=g.t/.75;agentFace(g,P.x,P.z,dt,6);if(u>=1){g.st='windup';g.t=0;g.hitDone=false;g.peril=1;g.cn=0;g.delay=0;g.aware=1;g.ls=[P.x,P.z];floatText(g.x,g.y+2,g.z,'危','crit');note('[!] Ölü taklidi yapıyordu — arkandan geliyor!','red')}return true}}
 if(g.big&&!g.boss&&g.st==='chase'&&g.hostile()&&d<3.4&&(g.bgCd||0)<GT.clock&&heroOpen()&&Math.random()<dt*.5&&attackOK(g)){g.st='bgrab';g.t=0;g.hitDone=false;g.bgCd=GT.clock+rr(9,13);sfx.roar(.5);return true}
 if(!g.big&&!g.archer&&g.st==='chase'&&P.st==='block'&&d<2.4&&(g.gkCd||0)<GT.clock&&g.hostile()&&Math.random()<dt*1.3&&attackOK(g)){g.st='gkick';g.t=0;g.hitDone=false;g.gkCd=GT.clock+rr(5,8);sfx.gobShout();return true}
 // starting a trick: only a small goblin in a real fight, never two of the same at once
 if(g.st!=='chase'||g.big||g.archer||g.boss||!g.hostile()||(g.unseen||0)>1||!heroOpen()||g.hp<g.max*.4)return false;/* a badly hurt goblin thinks of running, not of tricks */const now=GT.clock;
 if(d>2.2&&d<5.4&&(g.dirtCd||0)<now&&!(P.blindT>0)&&!GOBS.some(o=>o.st==='dirt')&&Math.random()<dt*.32&&attackOK(g)){g.st='dirt';g.t=0;g.thrown=0;g.dirtCd=now+rr(9,14);return true}
 if(d>2.6&&d<6.2&&(g.tkCd||0)<now&&!GOBS.some(o=>o.st==='tackle'||o.st==='latched')&&Math.random()<dt*(P.st==='block'?.6:.28)&&attackOK(g)){g.st='tackle';g.t=0;g.hitDone=false;g.tkCd=now+rr(10,15);sfx.gobShout();return true}
 return false}
function gobTrickTilt(g){switch(g.st){case'tackle':return 1.3*sst(.5,.62,g.t);case'latched':return 1.42;case'sprawl':return 1.45;case'playdead':return -1.45*sst(0,.45,g.t);case'rise':return -1.45*(1-sst(0,1,g.t/.75))}return null}
function gobTrickPose(g,q){const t=g.t;switch(g.st){
 case'dirt':{const k=sst(0,.45,t),u=sst(.7,.85,t);q.spP=lp(.9*k,.15,u);q.LhX=-1.0*k*(1-u*.6);q.LkX=1.6*k*(1-u*.6);q.RhX=-.5*k;q.RkX=1.1*k*(1-u*.5);q.RsX=lp(lp(-.4,.35,k),-2.7,u);q.RsZ=.25;q.ReX=lp(-.2,-.1,u);q.LsX=-.6;q.LsZ=.5;q.hdP=-.4;q.jaw=.5;break}
 case'tackle':{if(t<.5){const k=sst(0,.4,t);q.spP=.8*k;q.LhX=-.9*k;q.LkX=1.5*k;q.RhX=-.6*k;q.RkX=1.3*k;q.RsX=-1.3*k;q.LsX=-1.3*k;q.RsZ=.3;q.LsZ=.3;q.hdP=-.6}else{q.spP=0;q.RsX=-2.9;q.LsX=-2.9;q.RsZ=.15;q.LsZ=.15;q.LhX=.35;q.RhX=.2;q.LkX=.2;q.RkX=.3;q.hdP=-.9;q.jaw=.8}break}
 case'latched':{const s=Math.sin(t*16);q.RsX=-2.6;q.LsX=-2.6;q.RsZ=-.35;q.LsZ=-.35;q.ReX=-1.1;q.LeX=-1.1;q.hdP=-.8;q.LhX=.3+s*.4;q.RhX=.3-s*.4;q.LkX=.6;q.RkX=.6;q.jaw=.7;break}
 case'sprawl':q.RsX=-2.4;q.LsX=-2.0;q.RsZ=.6;q.LsZ=.8;q.hdP=-.5;q.LhX=.15;q.RhX=-.2;q.LkX=.4;break;
 case'playdead':q.LsZ=1.1;q.RsZ=.9;q.LsX=-.3;q.RsX=.2;q.hdP=.3;q.hdY=.6;q.LhX=-.2;q.LkX=.5;q.RkX=.1;q.jaw=.6;break;
 case'gkick':{const k=sst(0,.4,t)*(1-sst(.55,.85,t)),f=sst(.4,.5,t);q.RhX=lp(.6*k,-1.6,f)*(1-sst(.6,.9,t));q.RkX=lp(1.2*k,.2,f);q.spP=lp(.1,-.25,f);q.RsX=-.5;q.LsX=-.5;q.LsZ=.6;q.RsZ=.5;break}
 case'bgrab':{const k=sst(0,.6,t);q.RsX=-1.5*k;q.LsX=-1.5*k;q.RsZ=.2;q.LsZ=.2;q.ReX=-.3;q.LeX=-.3;q.spP=.35*k;q.LhX=-.4;q.LkX=.6;q.jaw=.6;break}
 case'bhold':q.RsX=-1.7;q.LsX=-1.7;q.RsZ=.05;q.LsZ=.05;q.ReX=-.9;q.LeX=-.9;q.spP=-.15;q.jaw=.8;break;
 case'unarmed':q.RsX=-.2;q.LsX=-.2;break;
 case'rise':{const u=sst(0,1,t/.75);q.spP=.8*(1-u);q.LhX=-1.3*(1-u);q.LkX=1.8*(1-u);q.RhX=-1.0*(1-u);q.RkX=1.5*(1-u);q.RsX=-.6;q.hdP=-.3;break}}}
// ---------- tuning: fights last longer (the user: "they die too easily")
const HPK={wolf:180,alpha:300,gob:150,big:650,denWolf:180,ashmane:900,chief:1200};
// ground tells for the tricks (the feint has none on purpose: a real rush shows its '!' and strip, a fake one does not)
function brawlTele(){return;for(const w of wolves){if(w.dead||w.tame)continue;if(w.st==='hamstring'&&w.t<.5)tele('strip',w.x,w.z,.7,Math.min(7,Math.hypot(P.x-w.x,P.z-w.z)+1),w.yaw,sst(0,.25,w.t));if(w.st==='armleap'&&w.t<.34)tele('strip',w.x,w.z,.8,Math.min(5,Math.hypot(P.x-w.x,P.z-w.z)+.5),w.yaw,sst(0,.2,w.t))}
 for(const g of GOBS){if(g.dead)continue;if(g.st==='tackle'&&g.t<.6)tele('strip',g.x,g.z,.9,4.6,g.yaw,sst(0,.3,g.t));if(g.st==='dirt'&&g.t<.75)tele('strip',g.x,g.z,2.4,5.4,g.yaw,sst(.1,.5,g.t)*.6)}}
// ===================== HERO: three new answers (v22) =====================
// 1) TEKME (Sekiro / Crimson Desert): hold BLOK and press □ with a foe in front = a front kick. It breaks a goblin's
//    raised guard, pushes and staggers small foes, and builds balance damage — the answer to a turtling enemy.
// 2) SİPER KARŞILIĞI (Elden Ring guard counter): within 0.7 s after BLOCKING a hit, △ = a fast heavy counter
//    (×1.5 damage, +30 balance) — blocking is no longer only waiting.
// 3) YAKALA-FIRLAT (Crimson Desert grapple): ETKİLEŞ next to an open small foe (staggered, sprawled, recovering,
//    balance broken, or from behind) = grab and hurl it; the body knocks down whoever it hits.
function kickTarget(){let b=null,bd=2.5;for(const f of foes()){if(f===DRAGON||f.big||f.boss)continue;const d=foeDist(f),a=Math.abs(angd(Math.atan2(f.x-P.x,f.z-P.z),P.yaw));if(d<bd&&a<1.0){bd=d;b=f}}return b}
function startKick(){if(!canAct())return false;spend(16);P.st='kick';P.t=0;P.kickDone=false;const f=kickTarget();if(f)P.yaw=Math.atan2(f.x-P.x,f.z-P.z);sfx.swing();return true}
function updateKick(dt){P.vx*=Math.exp(-dt*10);P.vz*=Math.exp(-dt*10);
 if(!P.kickDone&&P.t>.17){P.kickDone=true;const f=kickTarget();if(f){const k=foeDist(f)||1,dx=(f.x-P.x)/k,dz=(f.z-P.z)/k,p=f.hitPts?f.hitPts()[0]:[f.x,(f.y||0)+.8,f.z];sfx.thud();spawnSparks(p[0],p[1],p[2],8,[.8,.75,.6],3);CAM.shake=Math.max(CAM.shake,.3);GT.stop=Math.max(GT.stop,.05);
  const guarded=GOBS.includes(f)&&f.st==='guard';const dead=foeHurt(f,4,dx,dz,'kick');if(dead){onFoeKilled(f,false);return}addPosture(f,guarded?45:28);
  if(isWolf(f)){f.st='recover';f.t=-.35;f.air=0;f.pitch=0;f.kx=dx*8;f.kz=dz*8}else{f.st='stagger';f.t=guarded?0:.6;f.kx=dx*8;f.kz=dz*8}
  floatText(p[0],p[1]+.6,p[2],guarded?'SİPER KIRILDI':'TEKME','crit')}}
 if(P.t>.48){P.st=IN.blockHeld?'block':'move';P.t=0}}
function kickPose(q){const k=sst(0,.17,P.t)*(1-sst(.3,.48,P.t));q.RthX=-1.55*k;q.Rkn=lp(1.4,.15,sst(.08,.18,P.t))*k+.1;q.LthX=.15*k;q.Lkn=.25*k;q.spX=-.25*k;q.pel=.05;q.RaZ=.55;q.RaX=-1.0;q.Rel=1.3;q.LaZ=.6;q.LaX=-.5;q.Lel=.9;q.hdX=.15*k}
function startGuardCounter(){if(!(P.gcT>GT.clock)||!canAct())return false;P.gcT=0;P.charge=0;startHeavy(false);P.hvT*=.7;if(P.atk){P.atk.T*=.7;P.atk.mul=1.5;P.atk.rip=1}floatText(P.x,P.y+2,P.z,'SİPER KARŞILIĞI','gold');return true}
// ---------- grab and throw
const THROWN=[];
function throwOpen(f){if(isWolf(f))return/^(recover|hurt|evade|bitewind)$/.test(f.st)&&f.st!=='bitewind'||isBroken(f);return/^(stagger|sprawl|hurt|recover|escape)$/.test(f.st)||isBroken(f)}
function throwTarget(){if(DUN.on)return null;let b=null,bd=2.1;for(const f of foes()){if(f===DRAGON||f.big||f.boss||f.dead||CROCS.includes(f)||f.held||f.st==='armlatch'||f.st==='latched')continue;const d=foeDist(f);if(d>=bd)continue;const behind=Math.abs(angd(Math.atan2(P.x-f.x,P.z-f.z),f.yaw))>2.2;if(!(throwOpen(f)||behind&&foeHostile(f)))continue;bd=d;b=f}return b}
function startThrow(){const f=throwTarget();if(!f||P.st!=='move'&&P.st!=='block')return false;if(!canAct())return false;spend(22);P.st='throw';P.t=0;P.thr=f;P.thrY=Math.atan2(f.x-P.x,f.z-P.z);P.yaw=P.thrY;sfx.grab();
 if(isWolf(f)){f.st='recover';f.t=-2}else{f.st='sprawl';f.t=-2}f.kx=f.kz=0;return true}
function updateThrow(dt){const f=P.thr;P.vx=P.vz=0;if(!f||f.dead){P.st='move';P.t=0;P.thr=null;return}
 const u=P.t;if(u<.55){const a=P.thrY+2*PI*sst(.18,.55,u);P.yaw=a;const r=.85;f.x=P.x+Math.sin(a)*r;f.z=P.z+Math.cos(a)*r;f.yaw=a+PI;if(isWolf(f))f.air=.5;f.t=-2}
 else if(!P.thrown){P.thrown=1;const a=P.yaw,vx=Math.sin(a)*13,vz=Math.cos(a)*13;THROWN.push({f,vx,vz,t:0,hit:new Set([f])});const dm=Math.round(f.max*.22*dmgMul());const dead=foeHurt(f,dm,Math.sin(a),Math.cos(a),'throw');floatText(f.x,(f.y||0)+1.4,f.z,'FIRLATTIN '+dm,'crit');sfx.hit();CAM.shake=Math.max(CAM.shake,.4);gainRage(10);addPosture(f,40);if(dead)onFoeKilled(f,false);else{f.st=isWolf(f)?'recover':'sprawl';f.t=-2;f.kx=f.kz=0}}
 if(u>.8){P.st='move';P.t=0;P.thr=null;P.thrown=0}}
function updateThrown(dt){for(let i=THROWN.length-1;i>=0;i--){const o=THROWN[i],f=o.f;o.t+=dt;const T=.5;
  if(!f.dead||o.t<T){const p=collide(f.x+o.vx*dt,f.z+o.vz*dt,.4);if(p[0]!==f.x+o.vx*dt||p[1]!==f.z+o.vz*dt){o.t=Math.max(o.t,T)}f.x=p[0];f.z=p[1];const h=4*1.1*Math.min(1,o.t/T)*(1-Math.min(1,o.t/T));if(!f.dead)f.t=-2;if(isWolf(f)){f.air=h;f.roll=lp(f.roll||0,1.4,.2)}else f.y=hAt(f.x,f.z)+h}
  for(const g of foes()){if(o.hit.has(g)||g.dead||g===DRAGON||g.boss)continue;if(Math.hypot(g.x-f.x,g.z-f.z)<1.5){o.hit.add(g);const k=Math.hypot(o.vx,o.vz)||1;const dead=foeHurt(g,Math.round(12*dmgMul()),o.vx/k,o.vz/k,'throw');addPosture(g,35);spawnSparks(g.x,(g.y||0)+.8,g.z,10,[.8,.7,.5],4);sfx.thud();floatText(g.x,(g.y||0)+1.6,g.z,'DEVRİLDİ','crit');
    if(dead)onFoeKilled(g,false);else if(isWolf(g)){g.st='recover';g.t=-1;g.kx=o.vx*.5;g.kz=o.vz*.5}else if(!g.big){g.st='sprawl';g.t=0;g.kx=o.vx*.4;g.kz=o.vz*.4}else{g.st='stagger';g.t=0}}}
  if(o.t>=T){THROWN.splice(i,1);sfx.thud();spawnSparks(f.x,hAt(f.x,f.z)+.2,f.z,14,[.6,.55,.45],5);if(!f.dead){if(isWolf(f)){f.air=0;f.roll=0;f.st='recover';f.t=-.8}else{f.y=hAt(f.x,f.z);f.st='sprawl';f.t=0}}}}}
function throwPose(q){const u=P.t,k=sst(0,.15,u),rel=sst(.55,.65,u);q.LaX=lp(-1.6*k,-.4,rel);q.LaZ=.4;q.Lel=lp(.6,.2,rel);q.RaX=lp(-1.4*k,-2.2,rel);q.RaZ=.5;q.Rel=.5;q.spX=lp(.25*k,-.1,rel);q.chY=lp(.6*sst(.18,.55,u),-.4,rel);q.pel=.15;q.LthX=-.5;q.Lkn=.6;q.RthX=.25;q.Rkn=.3}
// POISE: a committed heavy swing (or a well-loaded charge) is not interrupted by a light blow; heavy armour lets a
// light attack carry through small hits. Knock-downs, grabs and big blows still interrupt everything.
function heroPoise(o){if(o.knock!=='flinch')return false;if(P.st==='heavy')return true;if(P.st==='attack'&&armorDef()>=40&&o.dmg<10)return true;return false}
