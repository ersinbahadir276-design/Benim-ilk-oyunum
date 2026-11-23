// ===================== exploration: region levels, blood altars, chests, secrets, the lost-gold bag =====================
// Every region has a level; enemies there scale with it. Altars are checkpoints (rest = heal, refill flasks,
// enemies come back) and fast-travel points. Dying drops your gold at the spot; reach it to get it back.
function regionLevel(x,z){if(DUN.on)return DUN.lv;const zn=zoneAt(x,z),r=Math.hypot(x,z);
 if(zn==='kingdom')return 1;if(zn==='lair')return 18;if(zn==='snow')return 16;if(zn==='mountain')return 14;if(zn==='ruins')return 11;if(zn==='swamp'||zn==='lake'||zn==='river')return 9;
 if(zn==='camp'){let b=0,bd=1e9;CAMPS.forEach((c,i)=>{const d=Math.hypot(x-c[0],z-c[1]);if(d<bd){bd=d;b=i}});return[5,9,7,12][b]}
 if(zn==='dense')return Math.round(lp(8,12,sst(450,1300,r)));return Math.max(1,Math.round(lp(1,7,sst(150,1250,r))))}
const lvMul=lv=>1+.2*(lv-1),lvDmg=lv=>1+.11*(lv-1);
function scaleFoe(f,lv,baseHp){f.lv=lv;f.max=Math.round(baseHp*lvMul(lv));f.hp=f.max}
// ---------- altars
const ALTARS=[{n:'Uyanış Sunağı',x:22,z:300},{n:'Kale Kapısı Sunağı',x:8,z:58},{n:'Orman Sunağı',x:-320,z:180},{n:'Kara Orman Sunağı',x:-820,z:520},{n:'Kamp Gözcüsü Sunağı',x:660,z:-120},
 {n:'Bataklık Kıyısı Sunağı',x:470,z:520},{n:'Harabe Sunağı',x:-930,z:-60},{n:'Dağ Eteği Sunağı',x:40,z:-640},{n:'Ejder Yuvası Sunağı',x:60,z:-930}];
let altarGeo=null;
function buildAltars(){const g=G(),stone=[.32,.3,.32];box(g,-.7,0,-.7,.7,.35,.7,stone,[.38,.36,.38]);box(g,-.35,.35,-.35,.35,1.1,.35,stone);box(g,-.5,1.1,-.5,.5,1.25,.5,[.28,.26,.28]);
 for(let k=0;k<4;k++){const a=k*PI/2+PI/4;box(g,Math.cos(a)*.95-.08,0,Math.sin(a)*.95-.08,Math.cos(a)*.95+.08,.9,Math.sin(a)*.95+.08,[.22,.2,.22])}altarGeo=geo(g);
 for(const a of ALTARS){const p=collide(a.x,a.z,1.2);a.x=p[0];a.z=p[1];a.y=hAt(a.x,a.z);a.ob=obj(altarGeo,{shade:.8,pos:[a.x,a.y,a.z],cull:300,out:.02,outCol:[.08,.06,.08]});a.ob.M=mtrs([a.x,a.y,a.z],[0,0,0]);
  a.fl=obj(FIREGEO(),{unlit:1,col:[.5,.1,.12],shade:0,pos:[a.x,a.y,a.z],cull:300});addTree(a.x,a.z,.75,1.2)}}
function updateAltars(t){for(const[i,a]of ALTARS.entries()){const lit=SYS.altars&&SYS.altars[i];const k=lit?1+.15*Math.sin(t*9+i):.45;a.fl.M=mtrs([a.x,a.y+1.25,a.z],[0,t*.5,0]);for(const j of[0,5,10])a.fl.M[j]*=k*(lit?.9:.5);a.fl.col=lit?[1,.25,.2]:[.35,.1,.12]}}
function nearAltar(r=2.6){for(const[i,a]of ALTARS.entries())if(Math.hypot(P.x-a.x,P.z-a.z)<r)return i;return-1}
// resting: heal, refill, enemies return, checkpoint, save; also opens fast travel when two or more altars are lit
function restAt(i){SYS.altars=SYS.altars||{};const first=!SYS.altars[i];SYS.altars[i]=1;SYS.altarAt=i;P.hp=maxHP();P.sta=100;P.guard=100;SYS.flasks=SYS.flaskMax;
 for(const w of wolves)if(!w.tame&&w.dead&&!w.boss){w.dead=0;w.st='idle';w.hp=w.max;w.x=w.hx;w.z=w.hz;w.roll=0;w.crouch=0;w.aware=0}else if(!w.tame&&hostileSt(w)){w.st='return';w.t=0;w.aware=0}
 for(const g of GOBS)if(g.dead&&!g.boss){Object.assign(g,{dead:0,hp:g.max,x:g.hx,z:g.hz,st:'idle',aware:0,deadT:0,held:null})}else g.calmDown();
 for(const c of CROCS)if(c.dead)Object.assign(c,{dead:0,hp:c.max,x:c.hx,z:c.hz,st:'idle',aware:0,deadT:0});else c.calmDown();
 if(SYS.guild)fillBoard();sfx.rest();note(first?'[Sistem] Sunak yakıldı: '+ALTARS[i].n+' — kontrol noktası':'[Sistem] Dinlendin. Can ve iksirler doldu, düşmanlar geri döndü.','gold');if(first)addXP(25,P);save(P);openTravel(i)}
function openTravel(from){const lit=ALTARS.map((a,i)=>[a,i]).filter(([a,i])=>SYS.altars&&SYS.altars[i]&&i!==from);const box=$('travel');if(!lit.length){box.style.display='none';return}
 box.innerHTML='<div class="wt">HIZLI YOLCULUK</div>'+lit.map(([a,i])=>'<button data-i="'+i+'">'+a.n+' <small>Sv.'+regionLevel(a.x,a.z)+'</small></button>').join('')+'<button data-i="-1">Kal</button>';box.style.display='flex';
 box.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{box.style.display='none';const j=+b.dataset.i;if(j>=0){const a=ALTARS[j];__travel(a.x+1.6,a.z+1.6);SYS.altarAt=j;note('[Sistem] '+a.n+' sunağına geçtin.')}}))}
function __travel(x,z){P.x=x;P.z=z;P.y=hAt(x,z);P.air=false;CAM.tx=x;CAM.tz=z;streamForest(x,z,999)}
// ---------- chests (some hidden, some guarded); contents scale with region
const CHESTS=[];let chestGeo=null,lidGeo=null;
function buildChests(){const R=mkRng(5150),body=G(),lid=G(),wood=[.36,.22,.12],iron=[.3,.3,.34];box(body,-.45,0,-.3,.45,.5,.3,wood,[.3,.18,.1]);box(body,-.47,.05,-.32,.47,.12,.32,iron);box(body,-.47,.38,-.32,.47,.45,.32,iron);box(body,-.06,.25,.3,.06,.42,.34,[.8,.65,.25]);
 box(lid,-.45,0,-.3,.45,.18,.3,wood,[.42,.27,.15]);box(lid,-.47,.04,-.32,.47,.1,.32,iron);chestGeo=geo(body);lidGeo=geo(lid);
 const spots=[];// fixed, designed spots: ruins, camps, islands, ledges, the statue secret
 for(const c of RUINS)spots.push([c[0]+8,c[1]-6,2,'Harabe sandığı'],[c[0]-20,c[1]+14,1]);for(const c of CAMPS)spots.push([c[0]-4,c[1]+9,2,'Kamp ganimeti']);
 spots.push([LAKE[0]+40,LAKE[1]-35,2,'Göl kıyısı'],[SWAMP[0]+60,SWAMP[1]-40,2,'Bataklık adası'],[SWAMP[0]-90,SWAMP[1]+80,1],[-420,-260,1,'Kurt ini'],[-1150,640,2,'Kara Orman derinliği'],[30,-860,3,'Ejder yolu'],[-160,-1060,3,'Dağ çıkıntısı'],[1180,-1150,2,'Dünyanın kıyısı'],[-1260,1220,2,'Unutulmuş köşe']);
 for(let i=0;i<22;i++){const x=(R()-.5)*2500,z=(R()-.5)*2500;if(zoneAt(x,z)==='kingdom'||depthAt(x,z)>0)continue;spots.push([x,z,R()<.2?1:0])}
 for(const[x0,z0,tier,name]of spots){const p=collide(x0,z0,.9);if(depthAt(p[0],p[1])>.1)continue;const y=hAt(p[0],p[1]),yaw=R()*6.28;
  const c={x:p[0],z:p[1],y,yaw,tier,name:name||'Sandık',open:false,lid:0};c.ob=obj(chestGeo,{shade:.85,pos:[c.x,y,c.z],cull:200,out:.02,outCol:[.08,.05,.03]});c.ob.M=mtrs([c.x,y,c.z],[0,yaw,0]);
  c.lo=obj(lidGeo,{shade:.85,pos:[c.x,y,c.z],cull:200,out:.02,outCol:[.08,.05,.03]});CHESTS.push(c);addTree(c.x,c.z,.5,.6)}}
function updateChests(dt){for(const[i,c]of CHESTS.entries()){const open=SYS.chests&&SYS.chests[i];c.lid=lp(c.lid,open?1.9:0,Math.min(1,dt*6));const M=mtrs([c.x,c.y,c.z],[0,c.yaw,0]);c.lo.M=mmul(M,mmul(mtrs([0,.5,-.3],[-c.lid,0,0]),mtrs([0,0,.3],[0,0,0])))}}
function nearChest(r=2){for(const[i,c]of CHESTS.entries())if(!(SYS.chests&&SYS.chests[i])&&Math.hypot(P.x-c.x,P.z-c.z)<r)return i;return-1}
function openChest(i){const c=CHESTS[i];SYS.chests=SYS.chests||{};SYS.chests[i]=1;const lv=Math.max(regionLevel(c.x,c.z),1),items=[randomDrop(lv,Math.min(4,c.tier+1))];if(c.tier>=2)items.push(randomDrop(lv,c.tier));
 if(Math.random()<.35)SYS.flaskMax<6&&c.tier>=2&&(SYS.flaskMax++,note('[Sistem] İksir şişesi bulundu! En fazla iksir: '+SYS.flaskMax,'gold'));
 SYS.shards+=1+c.tier;dropLoot(c.x+Math.sin(c.yaw)*.9,c.z+Math.cos(c.yaw)*.9,items,Math.round((8+c.tier*12)*lvMul(lv)));sfx.chest();note('[Keşif] '+c.name+' açıldı.');SYS.chestsOpened=(SYS.chestsOpened||0)+1;addXP(10+c.tier*15,P);save(P)}
// ---------- the lost-gold bag
let bagOb=null;
function dropBag(){if(!(SYS.gold>0))return;SYS.bag={x:P.x,z:P.z,gold:SYS.gold};SYS.gold=0;note('[Sistem] Altın kesen ('+SYS.bag.gold+') öldüğün yerde kaldı. Geri al!','red')}
function updateBag(t){const b=SYS.bag;if(!b){if(bagOb)bagOb.vis=false;return}if(!bagOb)bagOb=obj(beamGeo||(dropLoot(0,0,[],0),beamGeo),{unlit:1,blend:1,noOff:1,col:[1,.8,.2],shade:0,pos:[0,0,0],cull:400,ds:1});
 bagOb.vis=true;bagOb.alpha=.7;bagOb.M=mtrs([b.x,hAt(b.x,b.z),b.z],[0,t,0]);bagOb.M[0]*=2;bagOb.M[10]*=2;bagOb.M[5]*=1.6;bagOb.pos=[b.x,0,b.z];
 if(P.alive&&Math.hypot(P.x-b.x,P.z-b.z)<2){SYS.gold=(SYS.gold||0)+b.gold;note('[Sistem] Altın kesesi geri alındı: +'+b.gold,'gold');SYS.bag=null;sfx.chest();save(P)}}
// ---------- secret: three seals in the ruins open the knight statue (Ustanın Mirası)
const SEALS=RUINS.map(c=>[c[0]-3,c[1]+3]);let sealObs=[];
function buildSeals(){const g=G();for(let k=0;k<5;k++){const a=k/5*2*PI;g.P.push(0,1.4,0,Math.cos(a)*.3,.6,Math.sin(a)*.3,Math.cos(a+1.26)*.3,.6,Math.sin(a+1.26)*.3);for(let q=0;q<3;q++){g.N.push(0,1,0);g.C.push(.6,.8,1);g.U.push(0,0);g.W.push(0)}g.I.push(k*3,k*3+1,k*3+2)}const sg=geo(g);
 sealObs=SEALS.map(([x,z])=>{const o=obj(sg,{unlit:1,col:[.5,.75,1],shade:0,pos:[x,0,z],cull:200,ds:1});o.M=mtrs([x,hAt(x,z),z],[0,0,0]);return o})}
function updateSeals(t){SEALS.forEach(([x,z],i)=>{const got=SYS.seals&&SYS.seals[i],o=sealObs[i];o.vis=!got&&!!(SYS.quests&&SYS.quests.legacy);o.M=mtrs([x,hAt(x,z)+.2+Math.sin(t*2+i)*.1,z],[0,t,0]);
  if(o.vis&&Math.hypot(P.x-x,P.z-z)<1.8){SYS.seals=SYS.seals||{};SYS.seals[i]=1;sfx.rare();note('[Sır] Usta Aldren\'in mührü ('+Object.keys(SYS.seals).length+'/3)','gold');save(P)}})}
