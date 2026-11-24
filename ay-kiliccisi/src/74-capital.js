// ===================== BAŞKENT ALTINSUR (v27): the great royal city in the south =====================
// A walled city 560 m across: an outer curtain wall with four gatehouses, avenues to a walled inner court and the
// royal CASTLE (keep + four towers + banners), districts of two-storey stone-and-timber houses, a market square,
// and the shops: KILIÇÇI (weapons), DEMİRCİ (upgrade your weapon), SİMYACI (potions, more flasks), BÜYÜ KİTAPÇISI
// (spellbooks), and the BÜYÜ AKADEMİSİ tower (spell training). Citizens and guards walk its streets.
const CAP={x:0,z:1700,R:280,shops:[],folk:[],built:0};
ALTARS.push({n:'Altınsur Sunağı',x:18,z:1700-230});
const SHOPDEF=[
 {k:'weapons',n:'KILIÇÇI · Usta Kerem',dx:-22,dz:-150,col:[.75,.5,.4],npc:'merchant'},
 {k:'smith',n:'DEMİRCİ · Ocak Baba',dx:22,dz:-150,col:[.45,.42,.4],npc:'villager'},
 {k:'alch',n:'SİMYACI · Nilüfer',dx:-22,dz:-115,col:[.5,.7,.5],npc:'merchant'},
 {k:'books',n:'BÜYÜ KİTAPÇISI · Yaşlı Sefer',dx:22,dz:-115,col:[.55,.45,.75],npc:'merchant'},
 {k:'academy',n:'BÜYÜ AKADEMİSİ · Başmüderris Ela',dx:120,dz:-40,col:[.6,.55,.95],npc:'merchant'}];
function capHouse(g,x,z,w,d,yaw,R){const y=hAt(x,z)-.3,two=R()<.55,h=two?6.4:3.6,c=Math.cos(yaw),s=Math.sin(yaw),ax=Math.abs(c)*w/2+Math.abs(s)*d/2,az=Math.abs(s)*w/2+Math.abs(c)*d/2;
 const stone=[.58+R()*.08,.55+R()*.06,.5+R()*.05],plaster=[.82,.78,.68],timber=[.32,.2,.12],roof=R()<.5?[.55,.22,.16]:[.3,.3,.36];
 box(g,x-ax,y,z-az,x+ax,y+3.2,z+az,stone);if(two){box(g,x-ax-.2,y+3.2,z-az-.2,x+ax+.2,y+6.4,z+az+.2,plaster);for(const f of[-1,1]){box(g,x-ax-.25,y+3.2,z+f*(az+.2)-.08,x+ax+.25,y+3.45,z+f*(az+.2)+.08,timber);box(g,x+f*(ax+.2)-.08,y+3.2,z-az-.25,x+f*(ax+.2)+.08,y+6.4,z+az+.25,timber)}}
 for(let k=0;k<4;k++){const f=1-k*.25;box(g,x-ax*f-.35,y+h+k*.55,z-az*f-.35,x+ax*f+.35,y+h+k*.55+.55,z+az*f+.35,roof)}box(g,x+ax*.4-.3,y+h,z-.3,x+ax*.4+.3,y+h+3,z+.3,[.4,.36,.33]);/* chimney */
 addBox(x-ax,z-az,x+ax,z+az,h)}
function buildCapital(){if(CAP.built)return;CAP.built=1;const R=mkRng(4242),cx=CAP.x,cz=CAP.z,g=G(),wall=[.62,.6,.55],dk=[.45,.43,.4],y0=c=>hAt(c[0],c[1]);
 // the outer curtain wall: 64 segments with battlements, four gates (N S E W), round towers every 8 segments
 const N=64;for(let k=0;k<N;k++){const a0=k/N*2*PI,a1=(k+1)/N*2*PI,am=(a0+a1)/2;if([0,16,32,48].some(q=>Math.abs(k-q)<1||k===(q+N-1)%N))continue;
  const x=cx+Math.sin(am)*CAP.R,z=cz+Math.cos(am)*CAP.R,y=hAt(x,z)-1,L=CAP.R*2*PI/N/2+.6,c=Math.cos(am),s=Math.sin(am);const ex=Math.abs(c)*L+Math.abs(s)*1.6,ez=Math.abs(s)*L+Math.abs(c)*1.6;
  box(g,x-ex,y,z-ez,x+ex,y+11,z+ez,wall);for(let m=-2;m<=2;m++){const mx=x+c*m*L/2.6,mz=z-s*m*L/2.6;box(g,mx-.6,y+11,mz-.6,mx+.6,y+12.3,mz+.6,dk)}addBox(x-ex,z-ez,x+ex,z+ez,11);
  if(k%8===4){box(g,x-3.4,y,z-3.4,x+3.4,y+15,z+3.4,dk);box(g,x-3.9,y+15,z-3.9,x+3.9,y+16,z+3.9,wall);for(let q=0;q<3;q++){const f=1-q*.3;box(g,x-3.6*f,y+16+q*1.6,z-3.6*f,x+3.6*f,y+17.6+q*1.6,z+3.6*f,[.4,.22,.18])}addBox(x-3.4,z-3.4,x+3.4,z+3.4,15)}}
 // gatehouses
 for(let q=0;q<4;q++){const a=q*PI/2,x=cx+Math.sin(a)*CAP.R,z=cz+Math.cos(a)*CAP.R,y=hAt(x,z)-1,c=Math.cos(a),s=Math.sin(a);for(const f of[-1,1]){const tx=x+c*f*8,tz=z-s*f*8;box(g,tx-4,y,tz-4,tx+4,y+17,tz+4,dk);box(g,tx-4.5,y+17,tz-4.5,tx+4.5,y+18.2,tz+4.5,wall);addBox(tx-4,tz-4,tx+4,tz+4,17)}
  const ex=Math.abs(c)*12+Math.abs(s)*2.5,ez=Math.abs(s)*12+Math.abs(c)*2.5;box(g,x-ex,y+9,z-ez,x+ex,y+14,z+ez,wall);box(g,x-ex*.4,y+11,z-ez*.4,x+ex*.4,y+13,z+ez*.4,[.7,.15,.12])}
 // the inner court wall + the royal castle at the centre
 for(let k=0;k<32;k++){const am=(k+.5)/32*2*PI;if(k===16||k===15)continue;const x=cx+Math.sin(am)*75,z=cz+Math.cos(am)*75,y=hAt(x,z)-1,L=75*2*PI/32/2+.5,c=Math.cos(am),s=Math.sin(am),ex=Math.abs(c)*L+Math.abs(s)*1.3,ez=Math.abs(s)*L+Math.abs(c)*1.3;box(g,x-ex,y,z-ez,x+ex,y+8,z+ez,wall);addBox(x-ex,z-ez,x+ex,z+ez,8)}
 {const y=hAt(cx,cz+10)-1,kz=cz+10;box(g,cx-18,y,kz-14,cx+18,y+22,kz+14,[.66,.64,.6]);box(g,cx-19,y+22,kz-15,cx+19,y+23.5,kz+15,dk);for(let m=-8;m<=8;m+=2){box(g,cx+m*2-.7,y+23.5,kz-15.2,cx+m*2+.7,y+25,kz-14.2,dk);box(g,cx+m*2-.7,y+23.5,kz+14.2,cx+m*2+.7,y+25,kz+15.2,dk)}
  box(g,cx-8,y+23.5,kz-6,cx+8,y+34,kz+6,[.62,.6,.56]);for(let q=0;q<4;q++){const f=1-q*.24;box(g,cx-8.5*f,y+34+q*2,kz-6.5*f,cx+8.5*f,y+36+q*2,kz+6.5*f,[.3,.28,.4])}
  for(const[ox,oz]of[[-18,-14],[18,-14],[-18,14],[18,14]]){const tx=cx+ox,tz=kz+oz;box(g,tx-5,y,tz-5,tx+5,y+30,tz+5,[.6,.58,.54]);box(g,tx-5.6,y+30,tz-5.6,tx+5.6,y+31.4,tz+5.6,dk);for(let q=0;q<5;q++){const f=1-q*.2;box(g,tx-5.2*f,y+31.4+q*2.2,tz-5.2*f,tx+5.2*f,y+33.6+q*2.2,tz+5.2*f,[.3,.28,.42])}
   box(g,tx-.12,y+42,tz-.12,tx+.12,y+48,tz+.12,[.3,.25,.2]);box(g,tx+.12,y+45.4,tz-.08,tx+3,y+47.6,tz+.08,[.75,.15,.12])}
  box(g,cx-3.5,y,kz-14.1,cx+3.5,y+7,kz-13.9,[.2,.14,.1]);box(g,cx-4.5,y+8,kz-14.3,cx+4.5,y+13,kz-14.1,[.75,.15,.12]);box(g,cx-2,y+9.5,kz-14.4,cx+2,y+11.5,kz-14.3,[.9,.75,.3]);addBox(cx-18,kz-14,cx+18,kz+14,22);for(const[ox,oz]of[[-18,-14],[18,-14],[-18,14],[18,14]])addBox(cx+ox-5,kz+oz-5,cx+ox+5,kz+oz+5,30)}
 // districts: houses in rings between the inner court and the outer wall, leaving the four avenues and the market square
 let hn=0;for(let ring=0;ring<6;ring++){const rr2=100+ring*28,n=Math.floor(2*PI*rr2/17);for(let k=0;k<n;k++){const a=(k+.5*(ring%2))/n*2*PI,x=cx+Math.sin(a)*rr2,z=cz+Math.cos(a)*rr2;
  if([0,PI/2,PI,PI*1.5,2*PI].some(q=>Math.abs(angd(a,q))*rr2<11))continue;/* avenues */if(Math.hypot(x-cx,z-(cz-130))<38)continue;/* market square */if(Math.hypot(x-(cx+120),z-(cz-40))<26)continue;/* academy */if(R()<.12)continue;
  capHouse(g,x,z,7+R()*3,6+R()*2,a,R);hn++}}CAP.houses=hn;
 // the market square: a fountain, stalls
 {const mx=cx,mz=cz-130,y=hAt(mx,mz)-.2;box(g,mx-4,y,mz-4,mx+4,y+.8,mz+4,[.6,.6,.62]);box(g,mx-1,y+.8,mz-1,mx+1,y+3,mz+1,[.7,.7,.72]);box(g,mx-3.4,y+.6,mz-3.4,mx+3.4,y+.75,mz+3.4,[.35,.55,.75]);addBox(mx-4,mz-4,mx+4,mz+4,1)}
 // the shops: a building each (sign colour by trade) with the keeper in front
 if(!NPCM.merchant)NPCM.merchant=humanGeo('merchant');if(!NPCM.villager)NPCM.villager=humanGeo('villager');if(!NPCM.guard)NPCM.guard=humanGeo('guard');
 for(const S of SHOPDEF){const x=cx+S.dx,z=cz+S.dz,y=hAt(x,z)-.3;if(S.k==='academy'){for(let k=0;k<8;k++){const a=k/8*2*PI,r=9;box(g,x+Math.cos(a)*r-3,y,z+Math.sin(a)*r-3,x+Math.cos(a)*r+3,y+18,z+Math.sin(a)*r+3,[.5,.48,.62])}box(g,x-9,y,z-9,x+9,y+20,z+9,[.55,.52,.68]);
   for(let q=0;q<6;q++){const f=1-q*.15;box(g,x-10*f,y+20+q*2.5,z-10*f,x+10*f,y+22.5+q*2.5,z+10*f,[.35,.3,.7])}box(g,x-.4,y+35,z-.4,x+.4,y+40,z+.4,[.9,.8,.4]);addBox(x-11,z-11,x+11,z+11,20);S.door=[x-12,z]}
  else{box(g,x-6,y,z-5,x+6,y+5,z+5,[.66,.62,.55]);for(let k=0;k<3;k++){const f=1-k*.25;box(g,x-6.4*f,y+5+k*.6,z-5.4*f,x+6.4*f,y+5.6+k*.6,z+5.4*f,[.45,.2,.15])}const sx=x+(S.dx<0?6.1:-6.1);box(g,sx-.08,y+2.8,z-1.2,sx+.08,y+4,z+1.2,S.col);addBox(x-6,z-5,x+6,z+5,5);S.door=[x+(S.dx<0?7.6:-7.6),z]}
  const n=mkNpc(S.npc,S.door[0],S.door[1],{yaw:Math.atan2(cx-S.door[0],0)||0,post:[S.door[0],S.door[1],0]});n.R=rigObj(NPCM[S.npc],{out:.012,cull:130,outCol:[.12,.1,.1]});n.R.ob.col=S.col.map(v=>.7+v*.6);n.name=S.n;n.role='shop';n.shop=S.k;CAP.shops.push(n)}
 obj(geo(g),{shade:.95,pos:[cx,0,cz],cull:1400,out:.01,outCol:[.06,.05,.05]});
 // citizens and guards
 for(let i=0;i<22;i++){const a=R()*2*PI,r=95+R()*150,x=cx+Math.sin(a)*r,z=cz+Math.cos(a)*r,p=collide(x,z,.5),k=i<6?'guard':'villager';const n=mkNpc(k,p[0],p[1],{yaw:R()*6,post:[p[0],p[1],0]});n.R=rigObj(NPCM[k],{out:.012,cull:130,outCol:[.12,.1,.1]});n.capital=1;CAP.folk.push(n)}
 for(const q of[0,1,2,3]){const a=q*PI/2;for(const f of[-1,1]){const x=cx+Math.sin(a)*(CAP.R-6)+Math.cos(a)*f*4,z=cz+Math.cos(a)*(CAP.R-6)-Math.sin(a)*f*4,n=mkNpc('guard',x,z,{yaw:a,post:[x,z,a]});n.R=rigObj(NPCM.guard,{out:.012,cull:130,outCol:[.12,.1,.1]});CAP.folk.push(n)}}}
const inCapital=(x,z,m=0)=>Math.hypot(x-CAP.x,z-CAP.z)<CAP.R+m;
// ---------- shops
const SPELLS={fire:{n:'Ateş Topu',cost:18,price:120,d:'Patlayan alev topu, yanık bırakır'},frost:{n:'Buz Mızrağı',cost:22,price:180,d:'Delip geçer, düşmanı yavaşlatır'},bolt:{n:'Şimşek Zinciri',cost:30,price:280,d:'En yakın 3 düşmana sıçrar, sarsar'},ward:{n:'Koruyucu Mühür',cost:35,price:220,d:'6 sn boyunca alınan hasar yarıya iner'}};
function shopAt(){for(const n of CAP.shops)if(Math.hypot(n.x-P.x,n.z-P.z)<2.8)return n;return null}
function capPrompt(){const s=shopAt();if(!s)return null;return{weapons:'ETKİLEŞ: KILIÇÇI — kılıç satın al',smith:'ETKİLEŞ: DEMİRCİ — silahını güçlendir',alch:'ETKİLEŞ: SİMYACI — iksir / şişe',books:'ETKİLEŞ: BÜYÜ KİTAPÇISI — büyü kitabı',academy:'ETKİLEŞ: AKADEMİ — büyü eğitimi'}[s.shop]}
function capInteract(){const s=shopAt();if(!s)return false;const G2=SYS.gold||0,say=t=>note(s.name.split('·')[1].trim()+': '+t);
 if(s.shop==='weapons'){CAP.wstock=CAP.wstock&&CAP.wstock.day===Math.floor(GT.clock/600)?CAP.wstock:{day:Math.floor(GT.clock/600),list:[0,1,2].map(i=>{let it=null;for(let t=0;t<30&&(!it||it.slot!=='weapon');t++)it=randomDrop(Math.max(1,SYS.lv+i),i===2?2:1);return it})};const it=CAP.wstock.list[0];
  if(!it){say('"Bugün dövülen her kılıç satıldı."');return true}const pr=Math.round(60+(it.lv||1)*14*(1+(it.rar||0)*.8));if(G2<pr){say('"'+(it.name||it.n)+' — '+pr+' altın."');return true}SYS.gold-=pr;giveItem(CAP.wstock.list.shift());sfx.chest();note('[Kılıççı] '+(it.name||it.n)+' alındı (−'+pr+' altın).','gold');save(P);return true}
 if(s.shop==='smith'){const it=SYS.eq&&SYS.eq.weapon?SYS.inv.find(i=>i.id===SYS.eq.weapon):null;if(!it){say('"Elinde güçlendirilecek bir silah göremiyorum."');return true}if(upgrade(it)){sfx.anvil&&sfx.anvil();note('[Demirci] '+(it.name||it.n)+' +'+it.up+' oldu.','gold');save(P)}return true}
 if(s.shop==='alch'){const need=Math.max(0,SYS.flaskMax-SYS.flasks);if(need>0){const pr=need*12;if(G2<pr){say('"Şişelerini doldurmak '+pr+' altın."');return true}SYS.gold-=pr;SYS.flasks=SYS.flaskMax;sfx.drink&&sfx.drink();note('[Simyacı] İksir şişelerin doldu (−'+pr+' altın).','gold');save(P);return true}
  const pr=150*(SYS.flaskMax-1);if(SYS.flaskMax>=8){say('"Daha fazla şişe taşıyamazsın."');return true}if(G2<pr){say('"Yeni bir iksir şişesi '+pr+' altın."');return true}SYS.gold-=pr;SYS.flaskMax++;SYS.flasks=SYS.flaskMax;note('[Simyacı] Yeni iksir şişesi! Artık '+SYS.flaskMax+' şişe.','gold');save(P);return true}
 if(s.shop==='books'){SYS.spells=SYS.spells||{};const k=Object.keys(SPELLS).find(k=>!SYS.spells[k]);if(!k){say('"Rafımdaki her kitabı okudun."');return true}const S=SPELLS[k];if(G2<S.price){say('"'+S.n+' — '+S.price+' altın. '+S.d+'."');return true}SYS.gold-=S.price;SYS.spells[k]=1;SYS.spell=k;sfx.rare&&sfx.rare();note('[Büyü] '+S.n+' öğrenildi! BÜYÜ düğmesi ile kullan (iki kez dokun = büyü değiştir).','gold');spellHud();save(P);return true}
 if(s.shop==='academy'){SYS.spells=SYS.spells||{};if(!SYS.academy){SYS.academy=1;SYS.spells.fire=SYS.spells.fire||1;SYS.spell=SYS.spell||'fire';note('[Akademi] Başmüderris Ela: "Her savaşçı bir kıvılcımla başlar." — Ateş Topu öğrenildi (ilk ders bedava).','gold');spellHud();save(P);return true}
  const k=SYS.spell;if(!k){say('"Önce bir büyü öğren."');return true}const lv=SYS.spells[k],pr=200*lv;if(lv>=5){say('"'+SPELLS[k].n+' en yüksek ustalıkta."');return true}if(G2<pr){say('"'+SPELLS[k].n+' eğitimi '+pr+' altın."');return true}SYS.gold-=pr;SYS.spells[k]=lv+1;note('[Akademi] '+SPELLS[k].n+' ustalığı '+(lv+1)+'. seviye (güç +%25).','gold');save(P);return true}
 return false}
function capTick(dt){if(DUN.on)return;if(!CAP.seen&&inCapital(P.x,P.z,40)){CAP.seen=1;bossBanner('ALTINSUR','Krallığın başkenti');note('[Bölge] BAŞKENT ALTINSUR — kale, pazar, kılıççı, demirci, simyacı, büyü kitapçısı ve büyü akademisi.','gold')}}
