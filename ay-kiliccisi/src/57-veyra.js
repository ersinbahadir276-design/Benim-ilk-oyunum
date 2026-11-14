// ===================== Veyra: the horned demon princess (our design on the kawaiope proportions) + companion AI =====================
// One rigged draw call: rigid parts per bone, a canvas-painted anime face, crimson hair, curled horns, ember sword.
// AI (utility-style): every 0.25 s she scores options — protect Kael, interrupt a wind-up, burst a crowd, bolt a
// distant foe, slash, dodge — and commits to the best one with its own visible tell.
let VEYRA=null,VEYM=null;
function veyraTex(){const c=cnv(256,256),g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,256,256);
 for(const s of[-1,1]){const x=128+s*15,y=127;g.fillStyle='#fff7f2';g.beginPath();g.ellipse(x,y,9,8.5,0,0,7);g.fill();
  const gr=g.createRadialGradient(x,y+1,1,x,y,8);gr.addColorStop(0,'#ffd36a');gr.addColorStop(.45,'#e0402a');gr.addColorStop(1,'#5a0c12');g.fillStyle=gr;g.beginPath();g.ellipse(x,y+1,6.2,7.4,0,0,7);g.fill();
  g.fillStyle='#250408';g.beginPath();g.ellipse(x,y+1.5,2.2,4.2,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x-2.4,y-2.5,1.8,0,7);g.fill();
  g.strokeStyle='#1a0c10';g.lineWidth=2.6;g.beginPath();g.ellipse(x,y+1,9.6,9,0,PI*1.08,PI*1.92);g.stroke();g.lineWidth=1.6;g.beginPath();g.moveTo(x+s*8,y-5);g.lineTo(x+s*12,y-7.5);g.stroke();
  g.strokeStyle='#7a1620';g.lineWidth=2;g.beginPath();g.moveTo(x-7,y-13);g.quadraticCurveTo(x,y-16+s*.5,x+7,y-13.5);g.stroke()}
 g.strokeStyle='#8a3a40';g.lineWidth=1.4;g.beginPath();g.moveTo(122,152);g.quadraticCurveTo(128,155,134,152);g.stroke();g.fillStyle='rgba(230,90,100,.35)';for(const s of[-1,1]){g.beginPath();g.ellipse(128+s*24,140,6,3,0,0,7);g.fill()}return texture(c)}
function veyraModel(){const L=veyraProportions(),hw=L.legX,torso=L.neckY-(L.hipY+.06),def=[{p:-1,o:[0,0,0]},{p:0,o:[0,.06,0]},{p:1,o:[0,torso,0]},
  {p:1,o:[L.shX,L.shY-(L.hipY+.06),0]},{p:3,o:[0,-L.ua,0]},{p:4,o:[0,-L.la,0]},{p:1,o:[-L.shX,L.shY-(L.hipY+.06),0]},{p:6,o:[0,-L.ua,0]},{p:7,o:[0,-L.la,0]},
  {p:0,o:[hw,-.04,0]},{p:9,o:[0,-L.thigh,0]},{p:10,o:[0,-L.shin,0]},{p:0,o:[-hw,-.04,0]},{p:12,o:[0,-L.thigh,0]},{p:13,o:[0,-L.shin,0]},
  {p:2,o:[0,.1,-.09]},{p:0,o:[0,-.02,.1]},{p:0,o:[0,-.02,-.1]},{p:0,o:[0,-.05,-.12]},{p:15,o:[0,-.32,-.04]}];
 const skin=[.98,.86,.8],dark=[.1,.08,.11],red=[.62,.08,.1],ember=[1.4,.5,.12],horn=[.12,.08,.1],P2=[],U=(g)=>{for(let i=0;i<g.U.length;i+=2){g.U[i]=.01;g.U[i+1]=.01}return g};
 const add=(g,b,keepUV)=>{if(!keepUV)U(g);P2.push([g,b])};
 const T=torso,hr=.1,sh=L.shX;
 // hips + layered skirt (front/back flaps on their own bones)
 add(tint(loft([{y:-.09,rx:.12,rz:.09},{y:0,rx:.14,rz:.1},{y:.08,rx:.13,rz:.095}],14,2),dark),0);
 add(tint(loft([{y:.04,rx:.142,rz:.103},{y:.0,rx:.145,rz:.105}],16,1),[.4,.3,.12]),0);
 add(tint(sphere(8,6,d=>[d[0]*.025,.02+d[1]*.025,.108+d[2]*.012],{c:[0,.02,.108]}),[1.4,.2,.15]),0);
 add(tint(loft([{y:.0,rx:.12,rz:.02},{y:-.36,rx:.16,rz:.03}],10,2,{fn:a=>Math.sin(a)>0?1:.01}),[.2,.05,.07]),16);
 add(tint(loft([{y:.0,rx:.13,rz:.02},{y:-.42,rx:.19,rz:.04}],10,2,{fn:a=>Math.sin(a)<0?1:.01}),[.16,.04,.06]),17);
 add(tint(loft([{y:.02,rx:.15,rz:.11},{y:-.17,rx:.2,rz:.16}],18,2,{fn:a=>1+.06*Math.sin(a*9)}),[.14,.06,.08]),0);
 // torso: corset armour with red trim, collar, one pauldron
 add(tint(loft([{y:0,rx:.11,rz:.08},{y:T*.35,rx:.1,rz:.075},{y:T*.62,rx:.125,rz:.095,cz:.01},{y:T*.85,rx:.13,rz:.09},{y:T*1.0,rx:.06,rz:.055}],14,2,{fn:(a,y)=>y>T*.5&&y<T*.8?1+.12*Math.max(0,Math.sin(a))*Math.sin(PI*(y/T-.5)/.3):1}),skin),1);
 add(tint(loft([{y:0,rx:.115,rz:.085},{y:T*.4,rx:.106,rz:.08},{y:T*.62,rx:.13,rz:.1,cz:.01}],14,2,{fn:(a,y)=>y>T*.5?1+.12*Math.max(0,Math.sin(a))*Math.sin(PI*(y/T-.5)/.3):1}),dark),1);
 add(tint(tube([[-.12,T*.62,.03],[0,T*.6,.115],[.12,T*.62,.03]],{r:()=>.008,seg:4,n:6}),red),1);
 add(tint(loft([{y:T*.92,rx:.075,rz:.065},{y:T*1.05,rx:.06,rz:.055}],12,1),dark),1);
 {const c=[sh+.02,T*.9,0];add(tint(sphere(10,6,d=>[c[0]+d[0]*.08,c[1]+d[1]*.055,c[2]+d[2]*.075],{c,th:()=>PI*.55}),dark),3);add(tint(tube([[sh+.04,T*.93,-.02],[sh+.09,T*1.02,-.06]],{r:t=>lp(.018,.002,t),seg:4,n:3}),red),3)}
 // head with the painted face, ears, horns and crimson hair
 add(tint(tube([[0,-.07,0],[0,.04,0]],{r:()=>.038,seg:8,n:2}),skin),2);
 const head=sphere(18,14,d=>[d[0]*hr*.92,hr*.95+d[1]*hr*1.04,d[2]*hr*.98+.005],{c:[0,hr*.95,0]});tint(head,skin);add(head,2,true);
 for(const s of[-1,1]){add(tint(tube([[s*hr*.82,hr*.98,-.01],[s*hr*1.25,hr*1.15,-.04]],{r:t=>lp(.022,.002,t),flat:.4,seg:5,n:3,wide:[0,0,1]}),skin),2);
  add(tint(tube([[s*hr*.55,hr*1.65,.0],[s*hr*.95,hr*2.05,-.04],[s*hr*1.45,hr*2.2,-.14],[s*hr*1.7,hr*1.95,-.26],[s*hr*1.55,hr*1.65,-.3]],{r:t=>lp(.026,.003,t),seg:7,n:14,col:t=>mix3(horn,[.55,.06,.06],t*t)}),[1,1,1]),2)}
 const hairCol=(t)=>mix3([.55,.05,.07],[.95,.32,.12],t*t);
 for(let i=0;i<9;i++){const x=(i/8-.5)*hr*1.7,len=.06+.05*Math.abs(Math.sin(i*1.7));add(tube([[x*.6,hr*1.9,hr*.4],[x,hr*1.55,hr*.95],[x*1.05,hr*1.55-len,hr*1.0]],{r:t=>.018*(1-t*.8),flat:.4,seg:5,n:5,wide:[1,0,0],col:hairCol}),2)}
 add(tint(sphere(16,10,d=>[d[0]*hr*1.04,hr*1.0+d[1]*hr*1.12,d[2]*hr*1.06-.008],{c:[0,hr,0],th:u=>PI*(.52+.1*Math.cos(2*PI*(u-.5)))}),[.6,.06,.08]),2);
 for(const s of[-1,1])add(tube([[s*hr*.9,hr*1.3,.02],[s*hr*1.0,hr*.6,.03],[s*hr*.95,-hr*.4,.02]],{r:t=>.025*(1-t*.6),flat:.4,seg:5,n:6,wide:[0,0,1],col:hairCol}),2);
 for(let i=0;i<7;i++){const x=(i/6-.5)*.16;add(tube([[x,.02,-.02],[x*1.2,-.15,-.04],[x*1.1,-.33,-.03]],{r:t=>.03*(1-t*.5),flat:.35,seg:5,n:6,wide:[1,0,0],col:t=>hairCol(.5*t)}),15);
  add(tube([[x*1.1,0,0],[x*1.2,-.2,-.01],[x*.9,-.42,0]],{r:t=>.028*(1-t*.9),flat:.35,seg:5,n:6,wide:[1,0,0],col:t=>hairCol(.5+.5*t)}),19)}
 // arms: bare upper arm, long black gloves with red cuffs
 for(const[s,u,f,h]of[[1,3,4,5],[-1,6,7,8]]){add(tint(tube([[0,.01,0],[0,-L.ua,0]],{r:t=>lp(.036,.03,t),seg:8,n:3}),skin),u);
  add(tint(tube([[0,.02,0],[0,-L.la,0]],{r:t=>lp(.032,.026,t),seg:8,n:3}),dark),f);add(tint(loft([{y:-.02,rx:.04},{y:.03,rx:.036}],10,1),red),f);
  add(tint(sphere(8,6,d=>[d[0]*.026,-.045+d[1]*.04,.008+d[2]*.02],{c:[0,-.045,0]}),dark),h)}
 // legs: skin thigh, thigh-high boots with knee guards
 for(const[s,t,k,ft]of[[1,9,10,11],[-1,12,13,14]]){add(tint(tube([[0,0,0],[0,-L.thigh*.55,0]],{r:t2=>lp(.062,.05,t2),seg:9,n:3}),skin),t);add(tint(tube([[0,-L.thigh*.5,0],[0,-L.thigh,0]],{r:t2=>lp(.052,.044,t2),seg:9,n:3}),dark),t);
  add(tint(tube([[0,.02,0],[0,-L.shin,0]],{r:t2=>lp(.045,.032,t2),seg:9,n:4}),dark),k);add(tint(sphere(8,6,d=>[d[0]*.045,d[1]*.045,.03+d[2]*.035],{c:[0,0,.03]}),red),k);
  add(tint(sphere(8,6,d=>[d[0]*.036,-.02+d[1]*.03,.06+d[2]*.09],{c:[0,-.02,.06]}),dark),ft)}
 // demon tail with a spade tip
 add(tint(tube([[0,0,0],[0,-.15,-.12],[0,-.25,-.32],[0,-.18,-.52]],{r:t=>lp(.02,.008,t),seg:6,n:10}),dark),18);add(tint(sphere(8,4,d=>[d[0]*.05,-.17+d[1]*.012,-.56+d[2]*.05],{c:[0,-.17,-.56]}),red),18);
 // ember sword "Kızıl Kor" in the right hand (blade glows)
 add(tint(tube([[0,-.05,-.08],[0,-.05,.06]],{r:()=>.014,seg:6,n:2}),dark),8);add(tint(tube([[-.07,-.05,.07],[.07,-.05,.07]],{r:()=>.012,seg:5,n:2}),[.7,.5,.2]),8);
 add(tint(tube([[0,-.05,.08],[0,-.05,.5],[0,-.05,.86]],{r:t=>.026*(1-t*t*.85),flat:.22,seg:6,n:8,wide:[1,0,0]}),ember),8);
 const g=rigMerge(P2);return{def,geo:geo(g)}}
function veyraInit(){VEYM=veyraModel();const tex=veyraTex();VEYRA={x:SWAMP[0]-60,z:SWAMP[1]-40,y:0,yaw:0,hyaw:0,on:false,st:'chained',t:0,hp:100,max:100,spd:0,ph:0,q:{},R:null,down:false,cd:{},act:null,actT:0,think:0,lastSay:-99,hidden:false,
  rad:.32,lv:1,trust:SYS.trust||0};VEYRA.R=rigObj(VEYM,{out:.01,outCol:[.12,.02,.04],cull:160});VEYRA.R.ob.tex=tex;rigHide(VEYRA.R);
 if(SYS.veyraFate==='freed'){VEYRA.on=true;VEYRA.st='follow';VEYRA.x=P.x-2;VEYRA.z=P.z-2}}
const VLINES={kill:['Bir tane daha.','Yavaş kalıyorsun, Kara Zırh.','Bu kadar mı?'],low:['Geri çekil! Seni ben korurum.','Kanın akıyor, dikkat et!'],boss:['Bu güçlü. Hazırlığını izle!','Saldırmadan önce kıpırdıyor, gördün mü?'],
 night:['Gece yaratıkları uyanıyor...','Babamın gölgeleri geceyi sever.'],idle:['Babam... bu dünyayı yakacak. Üç yıl içinde.','Mühür hâlâ göğsümde yanıyor.','Neden beni kurtardın?','Zırhın sana fısıldıyor, duyuyorum.'],
 parry:['İyi savuşturma!','Kılıcın konuşuyor.'],revive:['Kalk! Daha bitmedi.'],down:['Ah— beni bırakma...']};
function vSay(kind,force){const V=VEYRA;if(!V||!V.on)return;if(!force&&GT.clock-V.lastSay<22)return;V.lastSay=GT.clock;const L=VLINES[kind];note('Veyra: "'+L[Math.floor(Math.random()*L.length)]+'"','gold')}
function vTarget(){let best=null,bs=-1e9;for(const f of foes()){if(!foeHostile(f)&&f!==P.lock)continue;const d=Math.hypot(f.x-VEYRA.x,f.z-VEYRA.z),dp=Math.hypot(f.x-P.x,f.z-P.z);if(d>20)continue;
  const threat=(f.st==='windup'||f.st==='open'||f.st==='pin'?3:0)+(f.boss||f===DRAGON?2:0),s=threat*4-d*.6-dp*.4+(f===P.lock?6:0);if(s>bs){bs=s;best=f}}return best}
function vDamage(f,m,kind){const dmg=Math.round((14+SYS.lv*2.4)*m*(.9+Math.random()*.2)),k=Math.hypot(f.x-VEYRA.x,f.z-VEYRA.z)||1,dead=foeHurt(f,dmg,(f.x-VEYRA.x)/k,(f.z-VEYRA.z)/k,kind);addPosture(f,kind==='burst'?25:10);
 const hp=f.hitPts?f.hitPts()[0]:[f.x,(f.y||0)+.9,f.z];spawnSparks(hp[0],hp[1],hp[2],8,[1,.5,.15],4);floatText(hp[0],hp[1]+.4,hp[2],''+dmg,'');if(dead){onFoeKilled(f,true);vSay('kill');SYS.trust=(SYS.trust||0)+1}}
function updateVeyra(dt){const V=VEYRA;if(!V||!V.on||V.hidden)return;V.t+=dt;V.think-=dt;const dP=Math.hypot(P.x-V.x,P.z-V.z);for(const k in V.cd)V.cd[k]-=dt;
 if(dP>60){V.x=P.x-Math.sin(P.yaw)*2;V.z=P.z-Math.cos(P.yaw)*2}
 // burning ground hurts her too; down state and revive
 if(V.down){V.downT-=dt;if(V.downT<=0||(P.alive&&dP<2.2&&BUF.inter>GT.clock-.2)){V.down=false;V.hp=V.max*.45;vSay('revive',true);SYS.trust=(SYS.trust||0)+2}V.y=hAt(V.x,V.z);return}
 V.max=100+SYS.lv*12;for(const b of BURNS)if(!b.mine&&b.t<b.life&&Math.hypot(V.x-b.x,V.z-b.z)<1.2){V.hp-=dt*6}
 // enemy swings land on whoever stands in front of them: a windup that points at her hurts if she does not get out of the way
 let fight=false;for(const o of foes()){if(!foeHostile(o))continue;const dv=Math.hypot(o.x-V.x,o.z-V.z);if(dv<14)fight=true;const fr=Math.abs(angd(Math.atan2(V.x-o.x,V.z-o.z),o.yaw))<.75,reach=o.boss||o.big?3.4:isWolf(o)?2.6:2.2;
  if(o.st==='windup'&&dv<reach+.8&&fr)o._vw=1;else if(o._vw&&o.st!=='windup'){o._vw=0;if(V.act!=='dodge'&&dv<reach&&fr&&!V.down){const dmg=Math.round((o.boss||o.big?26:isWolf(o)?12:9)*lvDmg(o.lv||1));V.hp-=dmg;V.flash=1;floatText(V.x,V.y+1.8,V.z,'-'+dmg,'red');sfx.hurt()}}}
 if(!fight&&V.hp<V.max)V.hp=Math.min(V.max,V.hp+dt*4);if(V.hp<=0){V.hp=0;V.down=true;V.downT=20;V.act=null;vSay('down',true)}
 if(P.hp<maxHP()*.35)vSay('low');
 // decide (utility scoring) every 0.25 s unless an action is running
 if(!V.act&&V.think<=0){V.think=.25;const f=vTarget();let best='follow',bs=1;
  if(P.alive&&P.hp<maxHP()*.35&&(V.cd.heal||0)<=0&&dP<10){best='heal';bs=9}
  if(f){const d=Math.hypot(f.x-V.x,f.z-V.z),n=foes().filter(o=>Math.hypot(o.x-V.x,o.z-V.z)<4).length;V.tgt=f;
   const danger=foes().find(o=>(o.st==='windup'||o.st==='open')&&Math.hypot(o.x-V.x,o.z-V.z)<3.2&&Math.abs(angd(Math.atan2(V.x-o.x,V.z-o.z),o.yaw))<.6);
   const cands=[['dodge',danger&&(V.cd.dodge||0)<=0?8:0],['burst',n>=3&&(V.cd.burst||0)<=0?7:0],['bolt',d>4&&d<15&&(V.cd.bolt||0)<=0?5+(f.st==='windup'?2:0):0],['slash',d<1.9?4.5:0],['close',d>=1.9?3:0]];
   for(const[k,v]of cands)if(v>bs){bs=v;best=k}if(danger&&best==='dodge')V.danger=danger}
  V.mode=best;if(best==='heal'||best==='burst'||best==='bolt'||best==='slash'||best==='dodge'){V.act=best;V.actT=0;V.hit=false}}
 const run=(tx,tz,sp)=>{agentMove(V,tx,tz,sp,dt,V.rad,8)};
 if(V.act){V.actT+=dt;const f=V.tgt;
  if(V.act==='slash'){V.spd=lp(V.spd,0,.3);if(f)agentFace(V,f.x,f.z,dt,10);if(!V.hit&&V.actT>.28&&f&&!f.dead){V.hit=true;if(Math.hypot(f.x-V.x,f.z-V.z)<2.4)vDamage(f,1,'slash');sfx.swing()}if(V.actT>.62)V.act=null}
  else if(V.act==='bolt'){V.spd=0;if(f)agentFace(V,f.x,f.z,dt,10);if(!V.hit&&V.actT>.5&&f&&!f.dead){V.hit=true;V.cd.bolt=3.2;spawnFlame([V.x,V.y+1.3,V.z],[f.x,(f.y||0)+.8,f.z]);spawnFlame([V.x,V.y+1.3,V.z],[f.x+.3,(f.y||0)+.6,f.z-.3]);setTimeout(()=>{if(!f.dead)vDamage(f,1.3,'bolt')},350);sfx.fire()}if(V.actT>.8)V.act=null}
  else if(V.act==='burst'){V.spd=0;if(!V.hit&&V.actT>.8){V.hit=true;V.cd.burst=12;sfx.fire();CAM.shake=Math.max(CAM.shake,.3);for(let i=0;i<10;i++){const a=i/10*6.28;spawnFlame([V.x,V.y+.6,V.z],[V.x+Math.cos(a)*3.5,V.y+.3,V.z+Math.sin(a)*3.5])}for(const o of foes())if(Math.hypot(o.x-V.x,o.z-V.z)<4.2)vDamage(o,1.4,'burst')}if(V.actT>1.2)V.act=null}
  else if(V.act==='heal'){V.spd=0;agentFace(V,P.x,P.z,dt,8);if(!V.hit&&V.actT>.7){V.hit=true;V.cd.heal=40;P.hp=Math.min(maxHP(),P.hp+maxHP()*.28);for(let i=0;i<6;i++)spawnFlame([V.x,V.y+1.2,V.z],[P.x,P.y+1.2,P.z]);note('Veyra: "Koruyucu Kor!" (+%28 can)','gold');SYS.trust=(SYS.trust||0)+1}if(V.actT>1.1)V.act=null}
  else if(V.act==='dodge'){const o=V.danger,a=o?Math.atan2(V.x-o.x,V.z-o.z)+1.2:V.yaw+PI;V.x+=Math.sin(a)*9*dt;V.z+=Math.cos(a)*9*dt;const p=collide(V.x,V.z,V.rad);V.x=p[0];V.z=p[1];if(V.actT>.35){V.act=null;V.cd.dodge=1.5}}}
 else if(V.mode==='close'&&V.tgt)run(V.tgt.x,V.tgt.z,6.2);
 else{const a=P.yaw+PI+.7,gx=P.x+Math.sin(a)*2.3,gz=P.z+Math.cos(a)*2.3,q=Math.hypot(gx-V.x,gz-V.z);if(q>1)run(gx,gz,q>8?7.5:q>3?4.5:2.2);else{V.spd=lp(V.spd,0,.2);agentFace(V,P.x+Math.sin(P.yaw)*4,P.z+Math.cos(P.yaw)*4,dt,3)}
  if(Math.random()<dt*.01)vSay('idle')}
 V.y=hAt(V.x,V.z);if(V.spd>.2)V.ph+=V.spd*dt*4.6;if((SYS.trust||0)>=40)unlockSkill('slam')}
function drawVeyra(time){const V=VEYRA;if(!V||!V.R)return;if(!V.on&&!V.forceShow)V.y=hAt(V.x,V.z);const vis=(V.on||V.st==='chained'&&SYS.main>=7)&&!V.hidden&&Math.hypot(V.x-P.x,V.z-P.z)<150;if(!vis&&!V.forceShow){rigHide(V.R);return}
 const q={};const A=cl(V.spd/4,0,1);gaitPose(q,V.ph,A,cl((V.spd-3)/3,0,1));q.hdY=V.hyaw||0;q.RsX=(q.RsX||0)-.35;q.ReX=(q.ReX||0)-.7;q.RwX=.2;let tilt=0,dy=0;
 if(V.st==='chained'){q.LsX=-2.6;q.RsX=-2.6;q.LsZ=.45;q.RsZ=.45;q.LeX=-.3;q.ReX=-.3;q.LhX=-1.5;q.LkX=2.3;q.RhX=-.3;q.RkX=2.4;q.hdP=.5;q.spP=.25;dy=-.48}
 else if(V.down){q.LhX=-1.4;q.LkX=2.2;q.RhX=-.2;q.RkX=2.3;q.spP=.5;q.hdP=.6;q.LsX=.5;q.RsX=.3;dy=-.46}
 else if(V.act==='slash'){const k=sst(0,.28,V.actT);q.RsX=lp(-2.5,.6,k);q.RsY=lp(.4,-.6,k);q.ReX=-.2;q.spY=lp(.5,-.5,k);q.LhX=-.5;q.LkX=.6}
 else if(V.act==='bolt'){q.LsX=-1.5;q.LeX=-.1;q.LsY=.2;q.spY=.3}else if(V.act==='burst'){const k=sst(0,.8,V.actT);q.LsX=-2.8*k;q.RsX=-2.8*k;q.LsZ=.6;q.RsZ=.6;q.spP=-.2*k;q.hdP=-.3*k}
 else if(V.act==='heal'){q.LsX=-1.4;q.LeX=-.5;q.RsX=-1.2;q.hdP=.1}
 if(V.forcePose)Object.assign(q,V.forcePose);
 const r=humanPose(q);const sw=Math.sin(time*2.2+V.ph)*.08,sv=V.spd*.06;r[15]=eul(.15+sv*.6+sw*.3,0,sw*.3);r[19]=eul(.1+sv*.4,0,sw*.4);r[16]=eul(-(q.LhX||0)*.4-(q.RhX||0)*.4+sv*.2,0,0);r[17]=eul(.1+sv*.5,0,0);r[18]=eul(.3+Math.sin(time*3)*.2,Math.sin(time*2.4)*.5,0);
 const hipH=veyraProportions().legY+.02;rigDraw(V.R,V.x,V.y+hipH+(q.bob||0)+dy,V.z,V.yaw,1,r,.38,tilt?rX(tilt):null);V.R.ob.flash=0}
