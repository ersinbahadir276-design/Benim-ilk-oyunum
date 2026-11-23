// ===================== GÖL LİMANI (v25 world): a harbour town on the east shore of the Silver Lake =====================
// Houses you cannot walk through, a HAN (inn: rest = full health, flasks, morning, save), a PAZAR (market: a trader
// whose stock changes every day), a pier with boats and a fisherman, an altar for fast travel. Townsfolk live a day:
// at dusk they walk home and go inside, at dawn they come out again.
const TOWN={x:-528,z:262,houses:[],folk:[],inn:null,shop:null,day:-1,stock:[]};
ALTARS.push({n:'Göl Limanı Sunağı',x:-516,z:236});
function townHouse(g,x,z,w,d,h,yaw,wall,roof){const y=hAt(x,z)-.3,c=Math.cos(yaw),s=Math.sin(yaw),W=w/2,D=d/2;
 const ax=Math.abs(c)*W+Math.abs(s)*D,az=Math.abs(s)*W+Math.abs(c)*D;box(g,x-ax,y,z-az,x+ax,y+h,z+az,wall);
 for(let k=0;k<4;k++){const f=1-k*.24;box(g,x-ax*f-.25,y+h+k*.45,z-az*f-.25,x+ax*f+.25,y+h+k*.45+.45,z+az*f+.25,roof)}
 const dx=x+s*(D+.02),dz=z+c*(D+.02);box(g,dx-.55,y,dz-.06,dx+.55,y+2.1,dz+.06,[.28,.18,.1]);
 addBox(x-ax,z-az,x+ax,z+az,h);return{x,z,door:[x+s*(D+1.2),z+c*(D+1.2)]}}
function buildTown(){const g=G(),T=TOWN,cx=T.x,cz=T.z;const walls=[[.62,.55,.45],[.55,.5,.44],[.66,.6,.5]],roofs=[[.45,.2,.14],[.3,.25,.22],[.5,.3,.16]];
 const spots=[[-14,-16,0],[0,-18,0],[14,-16,0],[22,-2,PI/2],[22,14,PI/2],[-16,16,PI],[0,20,PI],[14,20,PI]];
 spots.forEach(([dx,dz,yaw],i)=>T.houses.push(townHouse(g,cx+dx,cz+dz,7,6,3.4,yaw,walls[i%3],roofs[i%3])));
 // the inn: bigger, two storeys, a hanging sign
 T.inn=townHouse(g,cx-22,cz+1,10,8,5.6,-PI/2,[.5,.4,.3],[.35,.15,.1]);const iy=hAt(cx-16,cz+1);box(g,cx-16.6,iy+2.6,cz-1.4,cx-16.4,iy+3.6,cz+.2,[.25,.16,.1]);box(g,cx-16.7,iy+2.7,cz-1.2,cx-16.3,iy+3.4,cz,[.75,.55,.2]);
 // market stalls round the square, coloured awnings
 const aw=[[.7,.15,.12],[.2,.4,.65],[.75,.6,.15]];for(let k=0;k<3;k++){const sx=cx-5+k*5,sz=cz+2,y=hAt(sx,sz);box(g,sx-1.6,y,sz-.9,sx+1.6,y+1,sz+.9,[.45,.32,.18]);for(const [ox,oz] of [[-1.5,-.8],[1.5,-.8],[-1.5,.8],[1.5,.8]])box(g,sx+ox-.06,y,sz+oz-.06,sx+ox+.06,y+2.4,sz+oz+.06,[.3,.2,.12]);box(g,sx-1.8,y+2.4,sz-1.1,sx+1.8,y+2.55,sz+1.1,aw[k]);addBox(sx-1.6,sz-.9,sx+1.6,sz+.9,1)}
 T.shop={x:cx,z:cz+3.6};
 // well in the square
 {const y=hAt(cx,cz-4);box(g,cx-1,y,cz-5,cx+1,y+.9,cz-3,[.5,.5,.5]);box(g,cx-1.1,y+2.2,cz-5.1,cx+1.1,y+2.4,cz-2.9,[.35,.2,.12]);addBox(cx-1,cz-5,cx+1,cz-3,1)}
 // the pier: planks out over the water, posts, two boats
 const px0=cx-34,pz=cz-8,wy=WATER_L+.55;for(let k=0;k<14;k++){const x=px0-k*1.6;box(g,x-.8,wy,pz-1.3,x+.8,wy+.15,pz+1.3,k%2?[.48,.34,.2]:[.42,.3,.18]);if(k%3===0){box(g,x-.12,wy-2,pz-1.4,x+.12,wy+.9,pz-1.1,[.3,.2,.12]);box(g,x-.12,wy-2,pz+1.1,x+.12,wy+.9,pz+1.4,[.3,.2,.12])}}
 for(const [bx,bz] of [[px0-9,pz+4],[px0-16,pz-4.2]]){box(g,bx-2.2,wy-.35,bz-.8,bx+2.2,wy+.25,bz+.8,[.4,.26,.14]);box(g,bx-2.4,wy+.1,bz-.9,bx+2.4,wy+.35,bz-.75,[.3,.2,.1]);box(g,bx-2.4,wy+.1,bz+.75,bx+2.4,wy+.35,bz+.9,[.3,.2,.1]);box(g,bx-.05,wy,bz-.05,bx+.05,wy+3,bz+.05,[.35,.25,.15])}
 T.pier={x0:px0+1,x1:px0-14*1.6,z:pz,y:wy+.15};
 obj(geo(g),{shade:.92,pos:[cx,0,cz],cull:700,out:.008,outCol:[.08,.06,.05]});
 // townsfolk
 if(!NPCM.villager)NPCM.villager=humanGeo('villager');if(!NPCM.merchant)NPCM.merchant=humanGeo('merchant');
 T.houses.slice(0,6).forEach((h,i)=>{const n=mkNpc('villager',h.door[0],h.door[1],{yaw:rnd()*6,post:[cx+rr(-8,8),cz+rr(-8,8),0]});n.R=rigObj(NPCM.villager,{out:.012,cull:130,outCol:[.12,.1,.1]});n.home=h.door;n.town=1;n.name='Liman halkından';T.folk.push(n)});
 const m=mkNpc('merchant',T.shop.x,T.shop.z,{yaw:PI,post:[T.shop.x,T.shop.z,PI]});m.R=rigObj(NPCM.merchant,{out:.012,cull:130,outCol:[.12,.1,.1]});m.R.ob.col=[1.1,1,.8];m.name='Pazarcı Rüstem';m.role='trader';m.town=1;T.trader=m;
 const f=mkNpc('villager',px0+2,pz,{yaw:-PI/2,post:[px0+2,pz,-PI/2]});f.R=rigObj(NPCM.villager,{out:.012,cull:130,outCol:[.12,.1,.1]});f.name='Balıkçı Halil';f.role='fisher';f.town=1;T.fisher=f}
function townTick(dt){const T=TOWN;if(!T.trader||DUN.on)return;const night=GT.tod>.8||GT.tod<.2;
 for(const n of T.folk){if(night){n.post=[n.home[0],n.home[1],0];if(Math.hypot(n.x-n.home[0],n.z-n.home[1])<1.6)n.inside=1}else{if(n.inside){n.inside=0;n.post=[T.x+rr(-9,9),T.z+rr(-9,9),0]}}}
 const day=Math.floor((GT.clock||0)/600);if(T.day!==day||!T.stock.length&&T.day<0){T.day=day;T.stock=[0,1,2,3].map(i=>randomDrop(Math.max(1,SYS.lv),i===3?2:1))}
 if(!T.seen&&Math.hypot(P.x-T.x,P.z-T.z)<45){T.seen=1;note('[Bölge] GÖL LİMANI — balıkçı kasabası. Han (dinlen), pazar (alışveriş), iskele.','gold')}}
function townPrompt(){const T=TOWN;if(!T.inn)return null;if(Math.hypot(P.x-T.inn.door[0],P.z-T.inn.door[1])<2.4)return'ETKİLEŞ: HAN — 15 altına dinlen (can, iksir, sabah, kayıt)';
 if(T.trader&&Math.hypot(P.x-T.trader.x,P.z-T.trader.z)<2.6){const it=T.stock[0];return it?'ETKİLEŞ: PAZAR — '+it.n+' ('+townPrice(it)+' altın)':'ETKİLEŞ: Pazar (bugün mal kalmadı)'}
 if(T.fisher&&Math.hypot(P.x-T.fisher.x,P.z-T.fisher.z)<2.4)return'ETKİLEŞ: Balıkçı ile konuş';return null}
const townPrice=it=>Math.round(30+(it.lv||SYS.lv)*10*(1+(it.r||0)*.8));
function townInteract(){const T=TOWN;if(!T.inn)return false;
 if(Math.hypot(P.x-T.inn.door[0],P.z-T.inn.door[1])<2.4){if(SYS.gold<15){note('Hancı: "Bir gece 15 altın, yolcu."');return true}SYS.gold-=15;P.hp=maxHP();P.sta=100;P.guard=100;SYS.flasks=SYS.flaskMax;GT.tod=.28;sfx.rest&&sfx.rest();note('[Han] Sıcak bir yatak, sıcak bir çorba. Sabah oldu — canın ve iksirlerin doldu.','gold');save(P);return true}
 if(T.trader&&Math.hypot(P.x-T.trader.x,P.z-T.trader.z)<2.6){const it=T.stock[0];if(!it){note('Rüstem: "Yarın gel, kervan yeni mal getirir."');return true}const pr=townPrice(it);if(SYS.gold<pr){note('Rüstem: "'+it.n+' — '+pr+' altın. Biraz daha biriktir."');return true}SYS.gold-=pr;giveItem(T.stock.shift());sfx.chest();note('[Pazar] '+it.n+' alındı (−'+pr+' altın).','gold');save(P);return true}
 if(T.fisher&&Math.hypot(P.x-T.fisher.x,P.z-T.fisher.z)<2.4){note(['Halil: "Gölün kuzeyinde, gece beyaz bir kurt dolaşıyor derler."','Halil: "Ejderha uyandığından beri balık da az."','Halil: "Kasabanın doğusundaki taş çemberde savaşçılar sınanır."'][Math.floor(rnd()*3)]);return true}
 return false}
