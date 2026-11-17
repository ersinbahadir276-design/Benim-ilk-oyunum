// ===================== KAFA KAFAYA (standoff, Ghost of Tsushima style) =====================
// Walk openly up to a goblin group that is not fighting yet and press ETKİLEŞ: the hero plants his feet, the leader
// steps forward, waits (sometimes FEINTS with a shout and a twitch) and then charges. Tap SALDIR (□) the moment it
// charges = one-cut kill; the next goblin charges at once, up to 3 in a row. Too early (on the feint) or too late
// = you take a heavy unblockable hit and the fight begins.
const SO={on:0};let soEl=null;
function standoffTarget(){if(DUN.on||SO.on||P.st!=='move'||P.crouch||!P.alive)return null;
 for(const f of foes())if(foeHostile(f)&&Math.hypot(f.x-P.x,f.z-P.z)<30)return null;
 let lead=null,bd=15;for(const g of GOBS){if(g.dead||g.big||g.held||g.hostile()||g.so)continue;const d=Math.hypot(g.x-P.x,g.z-P.z);if(d<bd&&d>3.5){bd=d;lead=g}}
 if(!lead)return null;const grp=GOBS.filter(g=>!g.dead&&!g.big&&!g.held&&g.group===lead.group&&!g.hostile()&&Math.hypot(g.x-P.x,g.z-P.z)<24);return{lead,grp}}
function soUI(txt,cls){if(!soEl){soEl=document.createElement('div');soEl.style.cssText='position:fixed;left:0;right:0;bottom:22%;text-align:center;pointer-events:none;z-index:30;font-family:Georgia,serif;font-size:20px;letter-spacing:3px;text-shadow:0 0 10px #000,0 2px 3px #000;transition:color .15s';document.body.appendChild(soEl)}
 soEl.style.display=txt?'block':'none';soEl.textContent=txt||'';soEl.style.color=cls==='red'?'#ff5a4a':cls==='gold'?'#ffd76a':'#eadfc8'}
function startStandoff(T){T=T||standoffTarget();if(!T)return false;Object.assign(SO,{on:1,grp:T.grp,n:0,lead:null,phase:'',t:0,press:-9});
 for(const g of T.grp){g.so=1;g.aware=1;g.spd=0;g.st='alert';g.t=0;g.yaw=Math.atan2(P.x-g.x,P.z-g.z)}sfx.horn();note('[Sistem] KAFA KAFAYA! Düşman saldırdığı anda □ — erken davranma.','gold');P.vx=P.vz=0;soNext(T.lead);return true}
function soNext(g){const pick=g||SO.grp.filter(o=>!o.dead).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0];if(!pick){soEnd(true);return}
 SO.lead=pick;SO.phase='walk';SO.t=0;SO.wait=SO.n?rr(.4,1.2):rr(1.4,3.6);SO.feint=SO.n===0&&Math.random()<.45?rr(.4,SO.wait-.3):-1;SO.feinted=0;soUI(SO.n?'BİR SONRAKİ…':'KAFA KAFAYA','')}
function soEnd(won){if(!SO.on)return;SO.on=0;soUI('');for(const g of SO.grp){g.so=0;if(!g.dead){g.st='chase';g.t=0;g.aware=1;g.cd=won?.8:.3;g.ls=[P.x,P.z]}}
 if(won&&SO.n>0){note('[Sistem] Kafa kafaya ×'+SO.n+'!','gold');addXP(20*SO.n,P);gainRage(15*SO.n);SYS.standoffs=(SYS.standoffs||0)+SO.n}alertGroup(SO.grp[0],P,30,GOBS)}
function soFail(why){const g=SO.lead;soUI(why,'red');if(g&&!g.dead){g.yaw=Math.atan2(P.x-g.x,P.z-g.z);hitPlayer({src:g,dmg:22,guard:99,dir:[Math.sin(g.yaw),Math.cos(g.yaw)],knock:'down',unblockable:true,parryable:false,power:1.2})}
 sfx.hurt();setTimeout(()=>soUI(''),900);const keep=SO.on;soEnd(false);if(keep)note('[!] '+why+' — kavga başladı!','red')}
function updateStandoff(dt){if(!SO.on)return;const g=SO.lead;if(!P.alive||(P.st!=='move'&&P.st!=='assn')){soEnd(false);return}if(!g||g.dead){if(P.st==='move')soNext();return}
 SO.t+=dt;const d=Math.hypot(g.x-P.x,g.z-P.z),want=Math.atan2(g.x-P.x,g.z-P.z);CAM.yaw+=angd(want,CAM.yaw)*Math.min(1,dt*4);CAM.pitch=lp(CAM.pitch,.14,Math.min(1,dt*3));
 for(const o of SO.grp)if(!o.dead&&o!==g){o.yaw+=angd(Math.atan2(P.x-o.x,P.z-o.z),o.yaw)*Math.min(1,dt*6);o.spd=0;o.y=hAt(o.x,o.z)}
 const pressed=SO.press>GT.clock-.05;if(pressed)SO.press=-9;
 if(SO.phase==='walk'){g.st='alert';if(d>6){agentMove(g,P.x,P.z,1.6,dt,g.rad,6)}else{g.spd=lp(g.spd,0,.3);agentFace(g,P.x,P.z,dt,8);SO.phase='tense';SO.t=0}if(pressed&&P.st==='move'){soFail('Erken davrandın');return}}
 else if(SO.phase==='tense'){g.spd=0;if(Math.abs(g.kx)+Math.abs(g.kz)>.05){g.x+=g.kx*dt;g.z+=g.kz*dt;const k=Math.exp(-dt*7);g.kx*=k;g.kz*=k}agentFace(g,P.x,P.z,dt,8);
  if(SO.feint>0&&!SO.feinted&&SO.t>SO.feint){SO.feinted=1;SO.ft=GT.clock;sfx.gobShout();g.kx=Math.sin(g.yaw)*2.5;g.kz=Math.cos(g.yaw)*2.5;floatText(g.x,g.y+1.9,g.z,'!','');soUI('…','')}
  if(SO.feinted&&GT.clock-SO.ft>.5)soUI('KAFA KAFAYA','');
  if(pressed&&P.st==='move'){soFail(SO.feinted&&GT.clock-SO.ft<.6?'Aldatmacaya kandın':'Erken davrandın');return}
  if(SO.t>SO.wait){SO.phase='charge';SO.t=0;g.st='windup';sfx.gobShout();soUI('ŞİMDİ!','gold')}}
 else if(SO.phase==='charge'){g.yaw=want+PI;const sp=10;const p=collide(g.x-Math.sin(want)*sp*dt,g.z-Math.cos(want)*sp*dt,g.rad);g.x=p[0];g.z=p[1];g.spd=sp;g.ph+=sp*dt*4.2;g.y=hAt(g.x,g.z);g.yaw=Math.atan2(P.x-g.x,P.z-g.z);
  if(pressed&&P.st==='move'){if(d<3.6){SO.n++;g.so=0;g.aware=0;g.st='alert';startAssassin(g);GT.slow=.35;soUI('KAFA KAFAYA ×'+SO.n,'gold');SO.phase='kill';SO.t=0}else{soFail('Erken davrandın');return}}
  else if(d<1.3||SO.t>1.1){soFail('Geç kaldın');return}}
 else if(SO.phase==='kill'){if(P.st==='move'&&SO.t>.35){if(SO.n>=3||!SO.grp.some(o=>!o.dead&&o.so))soEnd(true);else soNext()}}}
