// ===================== BAŞKENT ALTINSUR (v27): the great royal city in the south =====================
// A walled city 560 m across: an outer curtain wall with four gatehouses, avenues to a walled inner court and the
// royal CASTLE (keep + four towers + banners), districts of two-storey stone-and-timber houses, a market square,
// and the shops: KILIÇÇI (weapons), DEMİRCİ (upgrade your weapon), SİMYACI (potions, more flasks), BÜYÜ KİTAPÇISI
// (spellbooks), and the BÜYÜ AKADEMİSİ tower (spell training). Citizens and guards walk its streets.
const CAP={x:0,z:1700,R:420,shops:[],folk:[],built:0};
ALTARS.push({n:'Altınsur Sunağı',x:20,z:1700-300-40});
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
// geometry is split into objects of < 55k vertices (WebGL1 16-bit indices)
const CAPG={g:null,list:[]};function cg(){if(!CAPG.g||CAPG.g.P.length/3>52000){if(CAPG.g&&CAPG.g.P.length)CAPG.list.push(CAPG.g);CAPG.g=G()}return CAPG.g}
function cgFlush(){if(CAPG.g&&CAPG.g.P.length)CAPG.list.push(CAPG.g);for(const g of CAPG.list){let sx=0,sz=0;const n=g.P.length/3;for(let k=0;k<n;k+=40){sx+=g.P[k*3];sz+=g.P[k*3+2]}const m=Math.ceil(n/40);obj(geo(g),{shade:.95,pos:[sx/m,0,sz/m],cull:1600,out:.01,outCol:[.06,.05,.05]})}CAPG.list=[];CAPG.g=null}
const LAMPS=[];
function capLamp(x,z){const g=cg(),y=hAt(x,z)-.2;box(g,x-.1,y,z-.1,x+.1,y+4,z+.1,[.18,.16,.15]);box(g,x-.35,y+3.9,z-.35,x+.35,y+4.05,z+.35,[.2,.18,.16]);LAMPS.push([x,y+3.6,z])}
function capMansion(x,z,yaw,R){const g=cg(),y=hAt(x,z)-.3,c=Math.cos(yaw),s=Math.sin(yaw),w=8+R()*3,d=7+R()*2,ax=Math.abs(c)*w+Math.abs(s)*d,az=Math.abs(s)*w+Math.abs(c)*d;
 box(g,x-ax,y,z-az,x+ax,y+4,z+az,[.78,.74,.66]);box(g,x-ax*.9,y+4,z-az*.9,x+ax*.9,y+8,z+az*.9,[.84,.8,.72]);box(g,x-ax*.8,y+8,z-az*.8,x+ax*.8,y+10.5,z+az*.8,[.82,.78,.7]);
 for(let k=0;k<4;k++){const f=1-k*.22;box(g,x-ax*.85*f-.4,y+10.5+k*.6,z-az*.85*f-.4,x+ax*.85*f+.4,y+11.1+k*.6,z+az*.85*f+.4,[.28,.3,.42])}
 for(const[ox,oz]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const hx=x+ox*(ax+3),hz=z+oz*(az+3);box(g,hx-1.2,y,hz-1.2,hx+1.2,y+1.3,hz+1.2,[.2,.42,.18])}/* garden hedges */addBox(x-ax,z-az,x+ax,z+az,10)}
function buildCapital(){if(CAP.built)return;CAP.built=1;const R=mkRng(4242),cx=CAP.x,cz=CAP.z,wall=[.64,.62,.57],dk=[.45,.43,.4],blue=[.25,.28,.45],gold=[.85,.68,.28];
 // ===== the great curtain wall: 96 segments, a tower every 8, four gatehouses
 const N=96,gates=[0,24,48,72];for(let k=0;k<N;k++){if(gates.some(q=>k===q||k===(q+N-1)%N))continue;const am=(k+.5)/N*2*PI,g=cg(),x=cx+Math.sin(am)*CAP.R,z=cz+Math.cos(am)*CAP.R,y=hAt(x,z)-1,L=CAP.R*2*PI/N/2+.6,c=Math.cos(am),si=Math.sin(am),ex=Math.abs(c)*L+Math.abs(si)*1.8,ez=Math.abs(si)*L+Math.abs(c)*1.8;
  box(g,x-ex,y,z-ez,x+ex,y+14,z+ez,wall);for(let m=-2;m<=2;m++){const mx=x+c*m*L/2.6,mz=z-si*m*L/2.6;box(g,mx-.7,y+14,mz-.7,mx+.7,y+15.5,mz+.7,dk)}addBox(x-ex,z-ez,x+ex,z+ez,14);
  if(k%8===4){box(g,x-4.2,y,z-4.2,x+4.2,y+20,z+4.2,dk);box(g,x-4.8,y+20,z-4.8,x+4.8,y+21.2,z+4.8,wall);for(let q=0;q<4;q++){const f=1-q*.25;box(g,x-4.4*f,y+21.2+q*1.8,z-4.4*f,x+4.4*f,y+23+q*1.8,z+4.4*f,blue)}addBox(x-4.2,z-4.2,x+4.2,z+4.2,20)}}
 for(const q of gates){const a=q/N*2*PI,g=cg(),x=cx+Math.sin(a)*CAP.R,z=cz+Math.cos(a)*CAP.R,y=hAt(x,z)-1,c=Math.cos(a),si=Math.sin(a);for(const f of[-1,1]){const tx=x+c*f*10,tz=z-si*f*10;box(g,tx-5,y,tz-5,tx+5,y+24,tz+5,dk);box(g,tx-5.6,y+24,tz-5.6,tx+5.6,y+25.4,tz+5.6,wall);for(let w=0;w<4;w++){const ff=1-w*.24;box(g,tx-5.2*ff,y+25.4+w*2,tz-5.2*ff,tx+5.2*ff,y+27.4+w*2,tz+5.2*ff,blue)}addBox(tx-5,tz-5,tx+5,tz+5,24)}
  const ex=Math.abs(c)*15+Math.abs(si)*3,ez=Math.abs(si)*15+Math.abs(c)*3;box(g,x-ex,y+12,z-ez,x+ex,y+19,z+ez,wall);box(g,x-ex*.45,y+14,z-ez*.45,x+ex*.45,y+17.5,z+ez*.45,[.7,.15,.12]);box(g,x-ex*.15,y+15,z-ez*.15,x+ex*.15,y+16.5,z+ez*.15,gold)}
 // ===== the royal palace: inner wall, courtyard, gardens, a great hall with a golden dome, two great towers
 for(let k=0;k<48;k++){const am=(k+.5)/48*2*PI;if(Math.abs(angd(am,PI))<.09)continue;const g=cg(),x=cx+Math.sin(am)*110,z=cz+Math.cos(am)*110,y=hAt(x,z)-1,L=110*2*PI/48/2+.5,c=Math.cos(am),si=Math.sin(am),ex=Math.abs(c)*L+Math.abs(si)*1.4,ez=Math.abs(si)*L+Math.abs(c)*1.4;box(g,x-ex,y,z-ez,x+ex,y+9,z+ez,[.72,.7,.66]);box(g,x-ex,y+9,z-ez,x+ex,y+9.6,z+ez,gold);addBox(x-ex,z-ez,x+ex,z+ez,9)}
 {const g=cg(),y=hAt(cx,cz)-.5,hz=cz+20;
  box(g,cx-32,y,hz-18,cx+32,y+20,hz+18,[.82,.8,.74]);for(let k=0;k<6;k++){const f=1-k*.15;box(g,cx-33*f,y+20+k*1.6,hz-19*f,cx+33*f,y+21.6+k*1.6,hz+19*f,blue)}
  for(let k=0;k<12;k++){const f=1-k*.075;box(g,cx-11*f,y+29+k*1.4,hz-11*f,cx+11*f,y+30.4+k*1.4,hz+11*f,k%3===2?gold:[.95,.85,.45])}box(g,cx-.3,y+46,hz-.3,cx+.3,y+52,hz+.3,gold);
  for(const s of[-1,1]){box(g,cx+s*48-12,y,hz-14,cx+s*48+12,y+14,hz+14,[.8,.78,.72]);for(let k=0;k<4;k++){const f=1-k*.22;box(g,cx+s*48-13*f,y+14+k*1.4,hz-15*f,cx+s*48+13*f,y+15.4+k*1.4,hz+15*f,blue)}addBox(cx+s*48-12,hz-14,cx+s*48+12,hz+14,14)}
  for(const s of[-1,1]){const tx=cx+s*30,tz=hz-20;box(g,tx-6,y,tz-6,tx+6,y+50,tz+6,[.78,.76,.7]);box(g,tx-6.8,y+50,tz-6.8,tx+6.8,y+51.6,tz+6.8,gold);for(let q=0;q<7;q++){const f=1-q*.14;box(g,tx-6.2*f,y+51.6+q*2.4,tz-6.2*f,tx+6.2*f,y+54+q*2.4,tz+6.2*f,blue)}box(g,tx-.15,y+68,tz-.15,tx+.15,y+75,tz+.15,[.3,.25,.2]);box(g,tx+.15,y+72,tz-.08,tx+4,y+74.6,tz+.08,[.75,.12,.12]);addBox(tx-6,tz-6,tx+6,tz+6,50)}
  box(g,cx-6,y,hz-18.1,cx+6,y+10,hz-17.9,[.25,.16,.1]);box(g,cx-8,y+11,hz-18.4,cx+8,y+17,hz-18.1,[.75,.12,.12]);box(g,cx-3,y+12.5,hz-18.5,cx+3,y+15.5,hz-18.4,gold);for(let k=0;k<6;k++)box(g,cx-14+k*.0,y+k*.35-.3,hz-19-k*1.4,cx+14,y+k*.35+.05,hz-17.6-k*1.4,[.75,.73,.7]);/* the grand stair */
  addBox(cx-32,hz-18,cx+32,hz+18,20);
  // the front court: fountains, hedges, statues
  for(const s of[-1,1]){const fx=cx+s*30,fz=cz-50;box(g,fx-5,y,fz-5,fx+5,y+.9,fz+5,[.65,.65,.68]);box(g,fx-4.4,y+.7,fz-4.4,fx+4.4,y+.85,fz+4.4,[.35,.55,.8]);box(g,fx-.8,y+.9,fz-.8,fx+.8,y+4,fz+.8,[.75,.75,.78]);addBox(fx-5,fz-5,fx+5,fz+5,1);
   for(let k=0;k<6;k++){const hx=cx+s*(14+k*.0),hz2=cz-80+k*12;box(g,hx-1,y,hz2-4,hx+1,y+1.4,hz2+4,[.18,.4,.16])}const sx=cx+s*12,sz=cz-28;box(g,sx-1.2,y,sz-1.2,sx+1.2,y+2,sz+1.2,[.6,.6,.62]);box(g,sx-.5,y+2,sz-.5,sx+.5,y+5.2,sz+.5,[.72,.72,.75])}}
 // ===== the cathedral (west) and the barracks with a training yard (east)
 {const g=cg(),x=cx-200,z=cz+60,y=hAt(x,z)-.4;box(g,x-12,y,z-32,x+12,y+20,z+32,[.7,.68,.64]);for(let k=0;k<7;k++){const f=1-k*.14;box(g,x-13*f,y+20+k*1.5,z-33,x+13*f,y+21.5+k*1.5,z+33,[.32,.3,.36])}
  box(g,x-7,y,z-44,x+7,y+36,z-30,[.72,.7,.66]);for(let k=0;k<10;k++){const f=1-k*.1;box(g,x-7.5*f,y+36+k*2.4,z-37-7.5*f,x+7.5*f,y+38.4+k*2.4,z-37+7.5*f,[.3,.28,.34])}box(g,x-.25,y+60,z-37.25,x+.25,y+66,z-36.75,gold);box(g,x-1.8,y+63,z-37.1,x+1.8,y+63.5,z-36.9,gold);
  for(let k=-2;k<=2;k++)box(g,x-12.1,y+8,z+k*11-1.5,x-11.9,y+15,z+k*11+1.5,[.55,.3,.75]);addBox(x-12,z-32,x+12,z+32,20);addBox(x-7,z-44,x+7,z-30,36);CAP.cathedral=[x,z-46]}
 {const g=cg(),x=cx+210,z=cz+120,y=hAt(x,z)-.4;for(const o of[-16,16]){box(g,x-24,y,z+o-5,x+24,y+6,z+o+5,[.55,.5,.44]);for(let k=0;k<3;k++){const f=1-k*.25;box(g,x-24.5*f,y+6+k*.7,z+o-5.5*f,x+24.5*f,y+6.7+k*.7,z+o+5.5*f,[.4,.18,.14])}addBox(x-24,z+o-5,x+24,z+o+5,6)}
  for(let k=0;k<6;k++){const dx=x-15+k*6;box(g,dx-.15,y,z-.15,dx+.15,y+1.7,z+.15,[.4,.3,.2]);box(g,dx-.45,y+1.1,z-.12,dx+.45,y+1.3,z+.12,[.4,.3,.2]);box(g,dx-.25,y+1.5,z-.25,dx+.25,y+2.1,z+.25,[.75,.65,.4])}CAP.barracks=[x,z]}
 // ===== districts: noble mansions round the palace, the market square on the royal road, dense row houses to the walls
 let hn=0,mn=0;for(let ring=0;ring<2;ring++){const r=140+ring*42,n=Math.floor(2*PI*r/34);for(let k=0;k<n;k++){const a=(k+.5*ring)/n*2*PI,x=cx+Math.sin(a)*r,z=cz+Math.cos(a)*r;if([0,PI/2,PI,PI*1.5,2*PI].some(q=>Math.abs(angd(a,q))*r<16))continue;if(Math.hypot(x-(cx-200),z-(cz+60))<45||Math.hypot(x-(cx+210),z-(cz+120))<45)continue;capMansion(x,z,a,R);mn++}}
 const MK=[cx,cz-300];
 for(let ring=0;ring<8;ring++){const rr2=232+ring*23,n=Math.floor(2*PI*rr2/13);for(let k=0;k<n;k++){const a=(k+.5*(ring%2))/n*2*PI,x=cx+Math.sin(a)*rr2,z=cz+Math.cos(a)*rr2;
  if([0,PI/2,PI,PI*1.5,2*PI].some(q=>Math.abs(angd(a,q))*rr2<12))continue;if(Math.hypot(x-MK[0],z-MK[1])<55)continue;if(Math.hypot(x-(cx+260),z-(cz-60))<32)continue;if(Math.hypot(x-(cx-200),z-(cz+60))<50||Math.hypot(x-(cx+210),z-(cz+120))<48)continue;if(R()<.08)continue;
  capHouse(cg(),x,z,6+R()*3,5.5+R()*2,a,R);hn++}}CAP.houses=hn;CAP.mansions=mn;
 // the market square: a great fountain and 16 stalls
 {const g=cg(),[mx,mz]=MK,y=hAt(mx,mz)-.2;box(g,mx-6,y,mz-6,mx+6,y+1,mz+6,[.62,.62,.65]);box(g,mx-5.4,y+.8,mz-5.4,mx+5.4,y+.95,mz+5.4,[.35,.55,.8]);box(g,mx-1.3,y+1,mz-1.3,mx+1.3,y+4.2,mz+1.3,[.72,.72,.75]);box(g,mx-2.4,y+4.2,mz-2.4,mx+2.4,y+4.6,mz+2.4,[.7,.7,.72]);addBox(mx-6,mz-6,mx+6,mz+6,1);
  const aw=[[.7,.15,.12],[.2,.4,.65],[.75,.6,.15],[.3,.55,.25]];for(let k=0;k<16;k++){const a=k/16*2*PI,sx=mx+Math.sin(a)*30,sz=mz+Math.cos(a)*30;if(Math.abs(angd(a,0))<.3||Math.abs(angd(a,PI))<.3)continue;const yy=hAt(sx,sz);box(g,sx-1.6,yy,sz-1,sx+1.6,yy+1,sz+1,[.45,.32,.18]);for(const[ox,oz]of[[-1.5,-.9],[1.5,-.9],[-1.5,.9],[1.5,.9]])box(g,sx+ox-.06,yy,sz+oz-.06,sx+ox+.06,yy+2.4,sz+oz+.06,[.3,.2,.12]);box(g,sx-1.8,yy+2.4,sz-1.2,sx+1.8,yy+2.55,sz+1.2,aw[k%4]);addBox(sx-1.6,sz-1,sx+1.6,sz+1,1);CAP.stalls=(CAP.stalls||[]).concat([[sx,sz,a]])}}
 // street lamps along the four avenues and round the palace
 for(let q=0;q<4;q++){const a=q*PI/2;for(let r=125;r<CAP.R-12;r+=22)for(const f of[-1,1])capLamp(cx+Math.sin(a)*r+Math.cos(a)*f*8,cz+Math.cos(a)*r-Math.sin(a)*f*8)}
 // ===== the shops on the market square, the academy tower in the east
 if(!NPCM.merchant)NPCM.merchant=humanGeo('merchant');if(!NPCM.villager)NPCM.villager=humanGeo('villager');if(!NPCM.guard)NPCM.guard=humanGeo('guard');
 const SPOT={weapons:[MK[0]-48,MK[1]-14],smith:[MK[0]+48,MK[1]-14],alch:[MK[0]-48,MK[1]+18],books:[MK[0]+48,MK[1]+18],academy:[cx+260,cz-60]};
 for(const S of SHOPDEF){const[x,z]=SPOT[S.k],y=hAt(x,z)-.3,g=cg();if(S.k==='academy'){for(let k=0;k<8;k++){const a=k/8*2*PI,r=11;box(g,x+Math.cos(a)*r-3.5,y,z+Math.sin(a)*r-3.5,x+Math.cos(a)*r+3.5,y+26,z+Math.sin(a)*r+3.5,[.5,.48,.62])}box(g,x-11,y,z-11,x+11,y+30,z+11,[.55,.52,.68]);
   for(let q=0;q<9;q++){const f=1-q*.1;box(g,x-12*f,y+30+q*2.6,z-12*f,x+12*f,y+32.6+q*2.6,z+12*f,[.35,.3,.7])}box(g,x-.5,y+53,z-.5,x+.5,y+60,z+.5,[.9,.8,.4]);addBox(x-14,z-14,x+14,z+14,30);S.door=[x-15.5,z]}
  else{const sgn=x<MK[0]?1:-1;box(g,x-7,y,z-6,x+7,y+6,z+6,[.68,.64,.56]);for(let k=0;k<3;k++){const f=1-k*.25;box(g,x-7.4*f,y+6+k*.7,z-6.4*f,x+7.4*f,y+6.7+k*.7,z+6.4*f,[.45,.2,.15])}const sx=x+sgn*7.1;box(g,sx-.08,y+3.2,z-1.4,sx+.08,y+4.6,z+1.4,S.col);addBox(x-7,z-6,x+7,z+6,6);S.door=[x+sgn*8.8,z]}
  const n=mkNpc(S.npc,S.door[0],S.door[1],{yaw:0,post:[S.door[0],S.door[1],0]});n.R=rigObj(NPCM[S.npc],{out:.012,cull:130,outCol:[.12,.1,.1]});n.R.ob.col=S.col.map(v=>.7+v*.6);n.name=S.n;n.role='shop';n.shop=S.k;CAP.shops.push(n)}
 cgFlush();
 // glowing lamp heads (one unlit object)
 {const g=G();for(const[x,y,z]of LAMPS)box(g,x-.22,y,z-.22,x+.22,y+.4,z+.22,[1,.85,.45]);obj(geo(g),{unlit:1,shade:0,pos:[cx,0,cz],cull:1600,col:[1.3,1.1,.7]})}
 // ===== people: citizens on every street, merchants at the stalls, guards on the gates, the avenues and the palace
 for(const st of CAP.stalls||[]){const x=st[0]-Math.sin(st[2])*2,z=st[1]-Math.cos(st[2])*2,n=mkNpc('merchant',x,z,{yaw:st[2]+PI,post:[x,z,st[2]+PI]});n.R=rigObj(NPCM.merchant,{out:.012,cull:130,outCol:[.12,.1,.1]});n.capital=1;CAP.folk.push(n)}
 for(let i=0;i<48;i++){const a=R()*2*PI,r=120+R()*280,x=cx+Math.sin(a)*r,z=cz+Math.cos(a)*r,p=collide(x,z,.5),n=mkNpc('villager',p[0],p[1],{yaw:R()*6,post:[p[0],p[1],0]});n.R=rigObj(NPCM.villager,{out:.012,cull:130,outCol:[.12,.1,.1]});n.capital=1;CAP.folk.push(n)}
 const gpos=[];for(const q of[0,1,2,3]){const a=q*PI/2;for(const f of[-1,1])gpos.push([cx+Math.sin(a)*(CAP.R-8)+Math.cos(a)*f*5,cz+Math.cos(a)*(CAP.R-8)-Math.sin(a)*f*5,a])}for(const f of[-1,1])gpos.push([cx+f*6,cz-112,PI],[cx+f*8,cz-4,PI]);for(let k=0;k<6;k++)gpos.push([CAP.barracks[0]-15+k*6,CAP.barracks[1]+4,0]);
 for(const[x,z,a]of gpos){const n=mkNpc('guard',x,z,{yaw:a,post:[x,z,a]});n.R=rigObj(NPCM.guard,{out:.012,cull:130,outCol:[.12,.1,.1]});n.capital=1;CAP.folk.push(n)}}
const CAPDIST=[['Saray',(x,z)=>Math.hypot(x-CAP.x,z-CAP.z)<110],['Pazar Meydanı',(x,z)=>Math.hypot(x-CAP.x,z-(CAP.z-300))<55],['Katedral',(x,z)=>Math.hypot(x-(CAP.x-200),z-(CAP.z+30))<50],['Kışla',(x,z)=>Math.hypot(x-(CAP.x+210),z-(CAP.z+120))<45],['Büyü Akademisi',(x,z)=>Math.hypot(x-(CAP.x+260),z-(CAP.z-60))<35],['Soylu Mahallesi',(x,z)=>Math.hypot(x-CAP.x,z-CAP.z)<215],['Halk Mahalleleri',(x,z)=>Math.hypot(x-CAP.x,z-CAP.z)<CAP.R]];
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
function capTick(dt){if(DUN.on)return;if(!SYS.capHint&&SYS.gate){SYS.capHint=1;note('Sınır Kalesi muhafızı: "Burası yalnızca bir sınır karakolu. Krallığın kalbi güneyde: ALTINSUR. Yol güneye uzanır — pusula seni götürür."','gold')}{const d=inCapital(P.x,P.z)?CAPDIST.find(q=>q[1](P.x,P.z)):null,n=d?d[0]:null;if(n!==CAP.dist){CAP.dist=n;if(n)note('[Altınsur] '+n,'')}}if(!CAP.seen&&inCapital(P.x,P.z,40)){CAP.seen=1;bossBanner('ALTINSUR','Krallığın başkenti');note('[Bölge] BAŞKENT ALTINSUR — kale, pazar, kılıççı, demirci, simyacı, büyü kitapçısı ve büyü akademisi.','gold')}}
// ---------- the end of the main story: Azgal falls in Kül Kale
function azgalFinale(){bossBanner('ŞEYTAN KRAL DÜŞTÜ','Kül Kale sessizliğe gömüldü');CAM.shake=1;sfx.roar(1);SYS.titles=SYS.titles||[];if(!SYS.titles.includes('Kral Katili'))SYS.titles.push('Kral Katili');SYS.title='Kral Katili';addXP(3000,P);SYS.pts=(SYS.pts||0)+8;
 note('[Hikâye] Azgal\'ın kül kılıcı yere düştü. Krallığa uzanan gölge çekildi — Altınsur\'un çanları seni karşılamak için çalıyor.','gold');note('[Sistem] Unvan: «Kral Katili» · +3000 XP · +8 stat puanı. Dünya açık kalıyor: olaylar, zindanlar, arena ve av seni bekliyor.','gold');save(P)}
