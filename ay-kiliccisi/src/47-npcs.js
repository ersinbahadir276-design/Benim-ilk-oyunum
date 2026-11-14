// ===================== village NPCs: villagers, merchants, guards =====================
// They live in the village, walk between houses, the well and the market; guards stand at the gates or patrol.
// They also only see what is in front of them; if one notices Selene sneaking, the people around turn to look.
const NPCS=[];const NPCM={};
const NPC_LINES={villager:['Ormanda kurt ulumaları artıyor, dikkatli ol.','Göl kıyısında bir nehir dağlardan iner.','Bataklığa gitme, timsahlar suyun içinde bekler.','Kuzeydeki dağlarda bir ejderhanın kanat sesleri duyuluyor.'],
 merchant:['Hoş geldin yolcu! Altınla taze et satarım.','Goblin kamplarından altın düşer, bana getir.'],guard:['Krallığın kapısı açıktır, ama silahını kınında tut.','Doğudaki goblin kampı her gece daha cesur.','Büyük goblinin sopası bir öküzü yere serer. Kaçmayı bil.']};
function mkNpc(kind,x,z,o={}){const n={kind,x,z,y:hAt(x,z),yaw:o.yaw===undefined?rnd()*6.28:o.yaw,hyaw:0,st:'idle',t:rr(0,4),spd:0,aware:0,ph:rnd()*6,group:'village',eye:1.55,rad:.33,sc:kind==='guard'?1.12:rr(1.04,1.12),
  home:[x,z],post:o.post||null,patrol:o.patrol||null,pi:0,said:0,look:0,R:null,dead:0};NPCS.push(n);return n}
function spawnNpcs(){for(const k of['villager','villager2','merchant','guard'])NPCM[k]=humanGeo(k);
 const R=mkRng(99);for(let i=0;i<12;i++){const h=HOUSES[Math.floor(R()*HOUSES.length)];if(!h)break;mkNpc(i%2?'villager':'villager2',h.dx+(R()-.5)*2,h.dz+(R()-.5)*2)}
 for(const s of STALLS){const out=Math.atan2(-s[0],-s[1]);mkNpc('merchant',s[0]-Math.sin(out)*1.6,s[1]-Math.cos(out)*1.6,{yaw:out+PI,post:[s[0]-Math.sin(out)*1.6,s[1]-Math.cos(out)*1.6,out+PI]})}
 for(const[dx,dz]of[[0,1],[0,-1],[1,0],[-1,0]])for(const sd of[-1,1]){const x=dx*40+dz*sd*5,z=dz*40+dx*sd*5,yaw=Math.atan2(dx,dz);mkNpc('guard',x,z,{yaw,post:[x,z,yaw]})}
 mkNpc('guard',0,60,{patrol:[[0,60],[60,0],[0,-60],[-60,0]]});mkNpc('guard',0,-60,{patrol:[[0,-60],[-60,0],[0,60],[60,0]]});
 for(const n of NPCS){n.R=rigObj(NPCM[n.kind],{out:.012,cull:130,outCol:[.12,.1,.1]});rigHide(n.R)}}
function npcGoal(n){const R=Math.random;if(R()<.3){n.tx=-10+(R()-.5)*6;n.tz=52+(R()-.5)*6}else if(R()<.5&&STALLS.length){const s=STALLS[Math.floor(R()*STALLS.length)];n.tx=s[0]*1.12;n.tz=s[1]*1.12}else{const h=HOUSES[Math.floor(R()*HOUSES.length)];n.tx=h.dx;n.tz=h.dz}}
function updateNpc(n,dt){n.t+=dt;const d=Math.hypot(P.x-n.x,P.z-n.z);if(d>170)return;
 const sees=senseTick(n,P,dt,16),was=n.aware;fillAware(n,P,sees,dt,16);
 // noticed while sneaking: the NPC calls out and everyone close turns to look at Selene
 if(sees&&P.crouch&&was<.5&&n.aware>=.5){n.st='watch';n.t=0;sfx.hey();note('[Köy] '+(n.kind==='guard'?'Muhafız':n.kind==='merchant'?'Tüccar':'Köylü')+': "Hey! Orada kim var?"');for(const o of NPCS)if(o!==n&&Math.hypot(o.x-n.x,o.z-n.z)<20){o.st='watch';o.t=0;o.ls=[P.x,P.z]}}
 if(sees&&!P.crouch&&d<6&&!n.said){n.said=1;n.look=3}if(d>14)n.said=0;
 if(sees)n.ls=[P.x,P.z];
 switch(n.st){
 case'idle':n.spd=lp(n.spd,0,.2);if(n.post){agentFace(n,n.post[0]+Math.sin(n.post[2])*5,n.post[1]+Math.cos(n.post[2])*5,dt,2);if(Math.hypot(n.x-n.post[0],n.z-n.post[1])>.6)agentMove(n,n.post[0],n.post[1],1.4,dt,n.rad,4)}
  else if(n.patrol){if(n.t>2){n.st='walk';n.t=0;const w=n.patrol[n.pi];n.tx=w[0];n.tz=w[1];n.pi=(n.pi+1)%n.patrol.length}}
  else if(n.t>rr(4,9)&&!GT.night){n.st='walk';n.t=0;npcGoal(n)}
  break;
 case'walk':if(agentMove(n,n.tx,n.tz,n.kind==='guard'?1.6:1.25,dt,n.rad,4)<1.2||n.t>45){n.st='idle';n.t=0}break;
 case'watch':n.spd=lp(n.spd,0,.3);if(n.ls)agentFace(n,n.ls[0],n.ls[1],dt,5);if(n.t>3.5){n.st='idle';n.t=0}break}
 // head turns to look at Selene when she is in view and close
 const want=sees&&d<9?cl(angd(Math.atan2(P.x-n.x,P.z-n.z),n.yaw),-.9,.9):0;n.hyaw=lp(n.hyaw,want,Math.min(1,dt*4));
 for(const o of NPCS){if(o===n)continue;const ex=n.x-o.x,ez=n.z-o.z,q=ex*ex+ez*ez;if(q<.5&&q>1e-6){const k=Math.sqrt(q);n.x+=ex/k*(.7-k)*.5;n.z+=ez/k*(.7-k)*.5}}
 const pd=Math.hypot(P.x-n.x,P.z-n.z);if(pd<.7&&pd>1e-4){n.x+=(n.x-P.x)/pd*(.7-pd);n.z+=(n.z-P.z)/pd*(.7-pd)}
 n.y=hAt(n.x,n.z);if(n.spd>.2)n.ph+=n.spd*dt*4.4}
function npcTalk(n){const L=NPC_LINES[n.kind==='villager2'?'villager':n.kind],line=L[Math.floor(Math.random()*L.length)];n.st='watch';n.t=0;n.ls=[P.x,P.z];
 const who=n.kind==='guard'?'Muhafız':n.kind==='merchant'?'Tüccar':'Köylü';note(who+': "'+line+'"');
 if(n.kind==='merchant'){if((SYS.gold||0)>=5){SYS.gold-=5;SYS.meat++;note('[Ticaret] 5 altın → 1 çiğ et (kalan altın: '+SYS.gold+')','gold');save(P)}else note('[Ticaret] Et 5 altın. Altının: '+(SYS.gold||0))}}
function drawNpcs(time){for(const n of NPCS){const d=Math.hypot(n.x-P.x,n.z-P.z);if(d>120){rigHide(n.R);continue}
  const q={};const A=cl(n.spd/1.4,0,1);gaitPose(q,n.ph,A,0);q.hdY=n.hyaw;q.hdP=-.05;
  if(n.kind==='guard'){q.ReX=-1.5;q.RsX=-.1;q.RwX=0;if(n.st==='watch'){q.hdP=.05}}
  if(n.kind==='merchant'&&n.st!=='walk'){q.LsX=-.6+Math.sin(time*1.7+n.ph)*.25;q.LeX=-1.1;q.RsX=-.3;q.ReX=-.9}
  if(n.st==='idle'&&!n.post)q.spP=Math.sin(time*1.3+n.ph)*.03;
  if(n.st==='watch'){q.spP=-.05;q.LsX=-.2;q.LeX=-.6}
  const K=NPCM[n.kind].K,hipH=(K.th+K.sh2+.06)*n.sc;rigDraw(n.R,n.x,n.y+hipH+(q.bob||0),n.z,n.yaw,n.sc,humanPose(q),.4,null)}}
