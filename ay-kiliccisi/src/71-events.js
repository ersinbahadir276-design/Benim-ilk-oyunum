// ===================== LIVING WORLD EVENTS (v25 §14) =====================
// Something happens in the world every couple of minutes, near the hero, without the story asking for it — stories a
// player can tell: a goblin RAID on a village, a hunting WOLF PACK on your trail, a wandering MERCHANT on the road, a
// notorious ELITE roaming, the white wolf AK KURT at night (rare hunt), and the ARENA stone outside the kingdom with
// three waves. Each event has a reward and ends on its own (cleared, or the hero walks away).
const EVT={t:75,cur:null,arena:null,pool:{g:[],w:[]}};
const ARENA={x:40,z:338};
function evSpot(minR,maxR){for(let i=0;i<20;i++){const a=rnd()*6.28,r=rr(minR,maxR),x=P.x+Math.sin(a)*r,z=P.z+Math.cos(a)*r;if(Math.hypot(x,z)<175||inCapital(x,z,40)||Math.hypot(x-GVIL[0],z-GVIL[1])<140||depthAt(x,z)>.2||inBuilding(x,z,1))continue;const p=collide(x,z,.6);return p}return null}
// pooled spawns: event enemies are re-used, never pile up in the world lists
function evGob(x,z,o={}){let g=EVT.pool.g.find(q=>q.free&&q.dead&&!!q.big===!!o.big&&(q.humanK||null)===(o.humanK||null));if(!g){g=mkGob(x,z,!!o.big,'evt',CAMPSITES[0]);g.R=rigObj(o.big?BIGM:GOBM,{out:.014,cull:150})}
 Object.assign(g,{free:0,dead:0,deadT:0,x,z,hx:x,hz:z,st:'chase',t:0,aware:1,unseen:0,ls:[P.x,P.z],cd:1,held:null,clash:0,ally:0,shieldT:0,archer:!!o.archer,elite:!!o.elite,title:o.title||'',group:'evt',feigned:0,pos:0,kx:0,kz:0});
 g.sc=o.sc||(o.big?1.25:1);scaleFoe(g,o.lv||regionLevel(x,z)+1,o.hp||(o.big?HPK.big:HPK.gob));if(g.R&&g.R.ob)g.R.ob.col=o.col||[1,1,1];if(!EVT.pool.g.includes(g))EVT.pool.g.push(g);return g}
function evWolf(x,z,o={}){let w=EVT.pool.w.find(q=>q.free&&q.dead);if(!w){w=mkWolf(x,z,{alpha:!!o.alpha});EVT.pool.w.push(w)}
 Object.assign(w,{free:0,dead:0,x,z,hx:x,hz:z,st:'stalk',t:0,aware:1,unseen:0,ls:[P.x,P.z],cd:1,calm:0,clash:0,tame:false,pack:null,roll:0,crouch:0,alpha:!!o.alpha,white:!!o.white,title:o.title||'',elite:!!o.elite,bold:.85});
 w.sc=o.sc||(o.alpha?1.25:1);scaleFoe(w,o.lv||regionLevel(x,z)+1,o.hp||(o.alpha?HPK.alpha:HPK.wolf));return w}
function evFree(list){for(const f of list){f.dead=f.dead||1;f.free=1;f.x=f.hx=9000+rnd()*50;f.z=f.hz=9000;if(isWolf(f)){f.st='dead';f.dead=300}else{f.st='dead';f.deadT=0}}}
const EVDEF={
 hunt:{n:'AV SÜRÜSÜ',w:3,ok:()=>true,start(E){const p=evSpot(38,52);if(!p)return false;E.ents=[evWolf(p[0],p[1],{alpha:true,title:'AV SÜRÜSÜ LİDERİ'})];for(let i=0;i<3;i++)E.ents.push(evWolf(p[0]+rr(-3,3),p[1]+rr(-3,3)));E.x=p[0];E.z=p[1];sfx.howl();note('[Olay] Uzaktan uluma… Bir kurt sürüsü kokunu aldı ve seni avlıyor.','red');return true},reward:6},
 raid:{n:'KÖY BASKINI',w:2,ok:()=>NPCS.some(n=>n.role!=='guild'&&!n.lost&&Math.hypot(n.x,n.z)>60&&Math.hypot(n.x-P.x,n.z-P.z)<260),start(E){const vs=NPCS.filter(n=>n.role!=='guild'&&!n.lost&&Math.hypot(n.x,n.z)>60&&Math.hypot(n.x-P.x,n.z-P.z)<260);if(!vs.length)return false;const v=vs[Math.floor(rnd()*vs.length)],a=rnd()*6.28,x=v.x+Math.sin(a)*12,z=v.z+Math.cos(a)*12;
  E.ents=[];for(let i=0;i<4;i++){const p=collide(x+rr(-3,3),z+rr(-3,3),.5);const g=mkHuman(p[0],p[1],{lv:regionLevel(x,z)+1,shield:i===0,col:[.8,.65,.6]});g.ls=[v.x,v.z];E.ents.push(g)}E.x=v.x;E.z=v.z;sfx.horn&&sfx.horn();note('[Olay] KÖY BASKINI! Haydutlar bir köye saldırıyor — '+compassWords(v.x,v.z)+'.','red');return true},reward:8},
 elite:{n:'AZILI DÜŞMAN',w:2,ok:()=>true,start(E){const p=evSpot(30,45);if(!p)return false;const lv=regionLevel(p[0],p[1])+3;E.ents=[rnd()<.5?mkHuman(p[0],p[1],{elite:true,lv,hp:420,sc:1.15,shield:true,title:'AZILI · '+['Kanlı Pençe','Kara Diş','Sessiz Bıçak','Kemik Kıran'][Math.floor(rnd()*4)],col:[1.2,.7,.65]}):evWolf(p[0],p[1],{alpha:true,elite:true,lv,hp:520,sc:1.45,title:'AZILI · Gri Hayalet'})];
  const f=E.ents[0];f.pk='elite';E.x=p[0];E.z=p[1];note('[Olay] Azılı bir düşman bölgede dolaşıyor: '+f.title.replace('AZILI · ','')+' — '+compassWords(p[0],p[1])+'.','gold');return true},reward:10,tier:2},
 rare:{n:'AK KURT',w:1,ok:()=>GT.tod>.75||GT.tod<.2,start(E){const p=evSpot(40,60);if(!p)return false;const w=evWolf(p[0],p[1],{alpha:true,white:true,elite:true,lv:regionLevel(p[0],p[1])+4,hp:600,sc:1.35,title:'AK KURT'});w.st='roam';w.aware=0;E.ents=[w];E.x=p[0];E.z=p[1];note('[Olay] Ay ışığında beyaz bir gölge… AK KURT görüldü. Nadir bir av.','gold');return true},reward:14,tier:3},
 merchant:{n:'GEZGİN TÜCCAR',w:2,ok:()=>true,start(E){const p=evSpot(14,22);if(!p)return false;if(!NPCM.merchant)NPCM.merchant=humanGeo('merchant');const n=mkNpc('merchant',p[0],p[1],{yaw:Math.atan2(P.x-p[0],P.z-p[1]),post:[p[0],p[1],0]});n.R=rigObj(NPCM.merchant,{out:.012,cull:130,outCol:[.12,.1,.1]});n.R.ob.col=[1.2,1.0,.75];n.name='Gezgin Tüccar';n.role='trader';E.npc=n;E.ents=[];E.x=p[0];E.z=p[1];E.stock=[0,1,2].map(()=>randomDrop(SYS.lv,Math.random()<.3?2:1));note('[Olay] Yol kenarında bir gezgin tüccar tezgâh açtı (R1 ile konuş).','gold');return true},life:150}};
function evPick(){const keys=Object.keys(EVDEF).filter(k=>EVDEF[k].ok());let tot=0;for(const k of keys)tot+=EVDEF[k].w;let r=rnd()*tot;for(const k of keys){r-=EVDEF[k].w;if(r<=0)return k}return keys[0]}
function eventsTick(dt){if(DUN.on||!P.alive)return;arenaTick(dt);const E=EVT.cur;
 if(!E){if(window.__noAutoQ)return;/* automated tests switch the random events off */EVT.t-=dt;if(EVT.t<=0){EVT.t=rr(100,160);if(Math.hypot(P.x,P.z)<175||ARENA.on)return;const k=evPick(),e={k,t:0};if(EVDEF[k].start(e)){EVT.cur=e;SYS.events=(SYS.events||0)+1}}return}
 E.t+=dt;const D=EVDEF[E.k],far=Math.hypot(P.x-E.x,P.z-E.z)>170;
 if(E.k==='merchant'){if(E.t>D.life||far){evEnd(false);return}return}
 const left=E.ents.filter(f=>!f.dead).length;if(!left){evEnd(true);return}if(far&&E.t>20)evEnd(false)}
function evEnd(won){const E=EVT.cur;if(!E)return;EVT.cur=null;const D=EVDEF[E.k];
 if(won&&D.reward){const lv=regionLevel(E.x,E.z),g=D.reward*lv+20;SYS.gold+=g;const items=[randomDrop(lv,D.tier||1)];giveItem(items[0]);addXP(30*D.reward,P);note('[Olay] '+D.n+' sona erdi. Ödül: '+g+' altın + '+(items[0].name||items[0].n),'gold');save(P)}
 else if(E.k==='merchant')note('[Olay] Gezgin tüccar yoluna devam etti.','');else note('[Olay] '+D.n+' — iz kaybetti.','');
 if(E.npc){const i=NPCS.indexOf(E.npc);if(i>=0){if(E.npc.R)rigHide&&rigHide(E.npc.R);E.npc.R&&(E.npc.R.ob.vis=false);NPCS.splice(i,1)}}
 setTimeout(()=>evFree(E.ents),won?8000:0)}
// the merchant: R1 next to him buys the next item of his stock
function eventInteract(){const E=EVT.cur;if(!E||E.k!=='merchant'||!E.npc)return false;if(Math.hypot(E.npc.x-P.x,E.npc.z-P.z)>2.6)return false;const it=E.stock[0];if(!it){note('Tüccar: "Bugünlük bu kadar, yolcu."');return true}
 const price=Math.round(40+(it.lv||SYS.lv)*12*(1+(it.r||0)));if(SYS.gold<price){note('Tüccar: "'+(it.name||it.n)+' — '+price+' altın. Kesen boş görünüyor."');return true}SYS.gold-=price;giveItem(E.stock.shift());sfx.chest();note('[Tüccar] '+(it.name||it.n)+' satın alındı (−'+price+' altın).','gold');save(P);return true}
function eventPrompt(){const E=EVT.cur;if(E&&E.k==='merchant'&&E.npc&&Math.hypot(E.npc.x-P.x,E.npc.z-P.z)<2.6){const it=E.stock[0];return it?'ETKİLEŞ: SATIN AL — '+(it.name||it.n):'ETKİLEŞ: Tüccar'}
 if(!ARENA.on&&Math.hypot(ARENA.x-P.x,ARENA.z-P.z)<4)return'ETKİLEŞ: ARENA — 3 dalgalık meydan okuma';return null}
// ---------- the arena: a ring of standing stones outside the kingdom; three waves, a reward per wave
function buildArena(){const g=G(),cx=ARENA.x,cz=ARENA.z,st=[.5,.48,.45];for(let k=0;k<10;k++){const a=k/10*2*PI,x=cx+Math.cos(a)*13,z=cz+Math.sin(a)*13,y=hAt(x,z);box(g,x-.45,y-.2,z-.45,x+.45,y+3.2+(k%3)*.5,z+.45,st)}
 const y=hAt(cx,cz);box(g,cx-.8,y-.2,cz-.5,cx+.8,y+1.4,cz+.5,[.36,.33,.3]);box(g,cx-.9,y+1.4,cz-.6,cx+.9,y+1.6,cz+.6,[.6,.25,.18]);obj(geo(g),{shade:.9,pos:[cx,0,cz],cull:400,out:.01});ARENA.built=1}
function arenaStart(){if(ARENA.on||Math.hypot(ARENA.x-P.x,ARENA.z-P.z)>4)return false;ARENA.on=1;ARENA.w=0;ARENA.t=-3;ARENA.ents=[];note('[Arena] Taşlar uyandı. Üç dalga — çemberden çıkma!','gold');bossBanner('ARENA','Üç dalga');sfx.horn&&sfx.horn();return true}
const AWAVES=[c=>[0,1,2].map(i=>mkHuman(c.x+Math.sin(i*2.1)*9,c.z+Math.cos(i*2.1)*9,{lv:SYS.lv,title:'GLADYATÖR'})),c=>[0,1,2].map(i=>evWolf(c.x+Math.sin(i*2.1+1)*10,c.z+Math.cos(i*2.1+1)*10,{lv:SYS.lv})),
 c=>[mkHuman(c.x+8,c.z-5,{lv:SYS.lv,shield:true,title:'GLADYATÖR'}),mkHuman(c.x-8,c.z-5,{lv:SYS.lv,title:'GLADYATÖR'}),mkHuman(c.x,c.z-9,{elite:true,shield:true,lv:SYS.lv+1,hp:420,sc:1.15,title:'ARENA ŞAMPİYONU',col:[1.25,.75,.7]})]];
function arenaTick(dt){if(!ARENA.on)return;ARENA.t+=dt;const d=Math.hypot(P.x-ARENA.x,P.z-ARENA.z);
 if(!P.alive||d>34){ARENA.on=0;evFree(ARENA.ents);ARENA.ents=[];note('[Arena] Çemberden çıktın — meydan okuma bitti.','red');return}
 if(ARENA.t>=0&&!ARENA.ents.length){ARENA.ents=AWAVES[ARENA.w](ARENA);note('[Arena] '+(ARENA.w+1)+'. dalga!','red');sfx.roar(.5)}
 if(ARENA.ents.length&&ARENA.ents.every(f=>f.dead)){const g=25+ARENA.w*25+SYS.lv*5;SYS.gold+=g;addXP(60+ARENA.w*40,P);note('[Arena] '+(ARENA.w+1)+'. dalga temizlendi: +'+g+' altın','gold');const old=ARENA.ents;setTimeout(()=>evFree(old),4000);ARENA.ents=[];ARENA.w++;ARENA.t=-4;
  if(ARENA.w>=3){ARENA.on=0;giveItem(randomDrop(SYS.lv,2));SYS.arena=(SYS.arena||0)+1;bossBanner('ARENA FATİHİ','Üç dalga temizlendi');note('[Arena] Zafer! Nadir bir ödül kazandın.','gold');save(P)}}}
