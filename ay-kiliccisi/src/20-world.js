// ===================== world: big map, regions, terrain heightmap, streamed forest, village, castle, collision =====================
// Map: 2800 m x 2800 m. The kingdom (castle + village) stays in the middle; regions around it:
// north: mountains with the dragon lair on a plateau; west: dense forest, a lake fed by a river;
// south-east: swamp (crocodiles); goblin camps and ruins scattered between them.
var DUN={on:0,y:0};// dungeon mode (64-dungeon.js): height, collision, sight and zone come from the dungeon grid
const WS=1400,HS=7,HN=WS*2/HS+1,HGT=new Float32Array(HN*HN),GDN=new Uint8Array(HN*HN),GTN=new Uint8Array(HN*HN);
const SPAWN=[14,0,318],LAKE=[-760,260,150],SWAMP=[760,720,330],MOUNT=[0,-1050],LAIR=[0,-1050],LAIR_Y=62,WATER_L=-2.6,WATER_S=-1.35;
const RIVER=[[-180,-690],[-300,-520],[-470,-330],[-560,-120],[-660,80],[-735,190]];
const CAMPS=[[820,-180],[-520,-790],[300,870],[-1130,-470]],RUINS=[[-1010,-120],[560,-620],[1090,320]];
const HILL=(x,z)=>Math.sin(x*.013)*4+Math.cos(z*.016)*4+Math.sin((x+z)*.031)*2+Math.sin(x*.047+1.3)*Math.cos(z*.041)*1.5;
function segD(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=cl(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)}
function riverD(x,z){let d=1e9;for(let i=0;i<RIVER.length-1;i++)d=Math.min(d,segD(x,z,RIVER[i],RIVER[i+1]));return d}
const campH=CAMPS.map(c=>HILL(c[0],c[1])*.6);
function hRaw(x,z){const r=Math.hypot(x,z);let h=HILL(x,z)*sst(130,320,r);
 const dm=Math.hypot(x-MOUNT[0],z-MOUNT[1]);if(dm<420){const ridge=Math.abs(Math.sin(x*.021+Math.sin(z*.017)*1.6))*Math.cos(z*.019+.4);h+=72*sst(420,95,dm)+ridge*9*sst(420,160,dm)*sst(60,140,dm);if(dm<120)h=lp(h,LAIR_Y,sst(120,62,dm))}
 const dl=Math.hypot(x-LAKE[0],z-LAKE[1]);if(dl<LAKE[2]+70)h=lp(h,-6.4+Math.sin(x*.04)*.8,sst(LAKE[2]+60,LAKE[2]-25,dl));
 if(dl>=LAKE[2]+42&&dl<LAKE[2]+170)h=Math.max(h,lp(WATER_L+1.4,-40,sst(LAKE[2]+90,LAKE[2]+170,dl)));
 const dr=riverD(x,z);if(dr<40)h=Math.min(h,lp(-5,h,sst(6,30,dr)));if(dr>=22&&dr<110&&dl>LAKE[2]+40)h=Math.max(h,lp(WATER_L+1.2,-40,sst(60,110,dr)));
 const ds=Math.hypot(x-SWAMP[0],z-SWAMP[1]);if(ds<SWAMP[2]+60)h=lp(h,-1.15+1.15*Math.sin(x*.05+Math.sin(z*.04)*2)*Math.cos(z*.06)+.45*Math.sin(x*.17)*Math.cos(z*.13),sst(SWAMP[2]+50,SWAMP[2]-80,ds));
 if(ds>=SWAMP[2]+22&&ds<SWAMP[2]+150)h=Math.max(h,lp(WATER_S+1.0,-40,sst(SWAMP[2]+80,SWAMP[2]+150,ds)));
 CAMPS.forEach((c,i)=>{const d=Math.hypot(x-c[0],z-c[1]);if(d<60)h=lp(h,campH[i],sst(58,30,d))});
 h+=Math.max(0,Math.max(Math.abs(x),Math.abs(z))-(WS-70))*.55;return h}
function zoneAt(x,z){if(DUN.on)return'dungeon';const r=Math.hypot(x,z);if(r<135)return'kingdom';const dm=Math.hypot(x-MOUNT[0],z-MOUNT[1]);if(dm<120)return'lair';
 if(Math.hypot(x-LAKE[0],z-LAKE[1])<LAKE[2]+25)return'lake';if(riverD(x,z)<16)return'river';if(Math.hypot(x-SWAMP[0],z-SWAMP[1])<SWAMP[2])return'swamp';
 for(const c of CAMPS)if(Math.hypot(x-c[0],z-c[1])<48)return'camp';for(const c of RUINS)if(Math.hypot(x-c[0],z-c[1])<65)return'ruins';
 if(dm<420)return'mountain';if(x<-430)return'dense';return'forest'}
const ZNAME={kingdom:'Krallık',lair:'Ejderha Yuvası',lake:'Gümüş Göl',river:'Nehir',swamp:'Sisli Bataklık',camp:'Goblin Kampı',ruins:'Eski Harabeler',mountain:'Kayalık Dağlar',dense:'Kara Orman',forest:'Orman',dungeon:'Zindan'};
// sampled heightmap: hAt interpolates the SAME triangles the terrain mesh and the grass shader use
function buildHeights(){for(let j=0;j<HN;j++)for(let i=0;i<HN;i++)HGT[j*HN+i]=hRaw(-WS+i*HS,-WS+j*HS)}
function hAt(x,z){if(DUN.on)return dunH(x,z);let gx=(x+WS)/HS,gz=(z+WS)/HS;gx=cl(gx,0,HN-1.001);gz=cl(gz,0,HN-1.001);const i=Math.floor(gx),j=Math.floor(gz),fx=gx-i,fz=gz-j,o=j*HN+i,a=HGT[o],b=HGT[o+1],c=HGT[o+HN],d=HGT[o+HN+1];
 return fx+fz<1?a+(b-a)*fx+(c-a)*fz:d+(c-d)*(1-fx)+(b-d)*(1-fz)}
const waterAt=(x,z)=>{if(DUN.on)return -99;const dl=Math.hypot(x-LAKE[0],z-LAKE[1]);if(dl<LAKE[2]+50||riverD(x,z)<25)return WATER_L;if(Math.hypot(x-SWAMP[0],z-SWAMP[1])<SWAMP[2]+30)return WATER_S;return -99};
const depthAt=(x,z)=>Math.max(0,waterAt(x,z)-hAt(x,z));
// ---------- collision: trees/rocks (circles in a 12 m grid), buildings and walls (boxes in a 24 m grid)
const trees=[],treeGrid=new Map(),TG=12,boxes=[],boxGrid=new Map(),BG=24,HOUSES=[],STALLS=[];
const tkey=(x,z)=>(Math.floor(x/TG)+200)*1000+Math.floor(z/TG)+200,bkey=(i,j)=>(i+100)*1000+j+100;
function addTree(x,z,r,h=6){const t={x,z,r,h};trees.push(t);const k=tkey(x,z);let a=treeGrid.get(k);if(!a)treeGrid.set(k,a=[]);a.push(t);return t}
const addCircle=(c)=>addTree(c[0],c[1],c[2],8);
function addBox(x0,z0,x1,z1,h=6){const b=[x0,z0,x1,z1,h];boxes.push(b);for(let i=Math.floor(x0/BG);i<=Math.floor(x1/BG);i++)for(let j=Math.floor(z0/BG);j<=Math.floor(z1/BG);j++){const k=bkey(i,j);let a=boxGrid.get(k);if(!a)boxGrid.set(k,a=[]);a.push(b)}return b}
function nearBoxes(x,z,fn){const i=Math.floor(x/BG),j=Math.floor(z/BG);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=boxGrid.get(bkey(i+a,j+b));if(l)for(const bx of l)fn(bx)}}
// push a circle (x,z,rad) out of trees, rocks, buildings and walls; returns [x,z]
function collide(x,z,rad){if(DUN.on)return dunCollide(x,z,rad);
 const cx=Math.floor(x/TG),cz=Math.floor(z/TG);
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=treeGrid.get((cx+i+200)*1000+cz+j+200);if(!a)continue;
  for(const t of a){const dx=x-t.x,dz=z-t.z,rr2=t.r+rad,d2=dx*dx+dz*dz;if(d2<rr2*rr2&&d2>1e-8){const d=Math.sqrt(d2);x=t.x+dx/d*rr2;z=t.z+dz/d*rr2}}}
 const seen=new Set();nearBoxes(x,z,b=>{if(seen.has(b))return;seen.add(b);const nx=cl(x,b[0],b[2]),nz=cl(z,b[1],b[3]),dx=x-nx,dz=z-nz,d2=dx*dx+dz*dz;
  if(d2<rad*rad){if(d2>1e-8){const d=Math.sqrt(d2);x=nx+dx/d*rad;z=nz+dz/d*rad}
   else{const l=x-b[0],r=b[2]-x,u=z-b[1],dn=b[3]-z,m=Math.min(l,r,u,dn);if(m===l)x=b[0]-rad;else if(m===r)x=b[2]+rad;else if(m===u)z=b[1]-rad;else z=b[3]+rad}}});
 return[cl(x,-WS+12,WS-12),cl(z,-WS+12,WS-12)]}
// line of sight between two points at eye height: tree trunks + foliage, rocks, walls/buildings taller than the eye, and hills block it
function los(ax,az,bx,bz,eye=1.3){if(DUN.on)return dunLos(ax,az,bx,bz);const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);if(L<.5)return true;const n=Math.ceil(L/6),seen=new Set();
 const ya=hAt(ax,az)+eye,yb=hAt(bx,bz)+eye;
 for(let s=0;s<=n;s++){const px=ax+dx*s/n,pz=az+dz*s/n,cx=Math.floor(px/TG),cz=Math.floor(pz/TG);
  if(s>0&&s<n&&hAt(px,pz)>lp(ya,yb,s/n)+.2)return false;
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const k=(cx+i+200)*1000+cz+j+200;if(seen.has(k))continue;seen.add(k);const a=treeGrid.get(k);if(!a)continue;
   for(const t of a){const tt=((t.x-ax)*dx+(t.z-az)*dz)/(L*L);if(tt<.03||tt>.97)continue;const qx=ax+dx*tt-t.x,qz=az+dz*tt-t.z,occ=t.r+(t.h>3?.75:.25);if(qx*qx+qz*qz<occ*occ)return false}}}
 // boxes: 2D slab test against every wall/building in the cells the segment crosses
 const bs=new Set(),m=Math.ceil(L/BG)+1;for(let s=0;s<=m;s++){const px=ax+dx*s/m,pz=az+dz*s/m;nearBoxes(px,pz,b=>bs.add(b))}
 for(const b of bs){if(b[4]<eye*.85)continue;let t0=0,t1=1;for(const[o,dd,lo,hi]of[[ax,dx,b[0],b[2]],[az,dz,b[1],b[3]]]){if(Math.abs(dd)<1e-9){if(o<lo||o>hi){t0=2;break}}else{let u=(lo-o)/dd,v=(hi-o)/dd;if(u>v){const q=u;u=v;v=q}t0=Math.max(t0,u);t1=Math.min(t1,v);if(t0>t1)break}}
  if(t0<=t1&&t1>.02&&t0<.98)return false}
 return true}
function inBuilding(x,z,m){if(DUN.on)return dunSolidAt(x,z,m);let hit=false;nearBoxes(x,z,b=>{if(b[4]>2.5&&x>b[0]-m&&x<b[2]+m&&z>b[1]-m&&z<b[3]+m)hit=true});return hit}
// ---------- forest specs (geometry is built on demand around the player and dropped far away)
const TREES=[],TCH=new Map(),TCS=100,tchKey=(x,z)=>Math.floor((x+WS)/TCS)*100+Math.floor((z+WS)/TCS);
function clearing(x,z){return Math.hypot(x-TOWN.x,z-TOWN.z)<40||Math.hypot(x-ARENA.x,z-ARENA.z)<17}
function treeOK(x,z){if(clearing(x,z))return false;const zn=zoneAt(x,z);if(zn==='lake'||zn==='river'||zn==='camp'||zn==='lair'||zn==='kingdom')return false;if(depthAt(x,z)>.15)return false;
 for(const c of RUINS)if(Math.hypot(x-c[0],z-c[1])<34)return false;if(Math.hypot(x-SPAWN[0],z-SPAWN[2])<11)return false;return true}
function addSpec(t){TREES.push(t);const k=tchKey(t.x,t.z);let a=TCH.get(k);if(!a)TCH.set(k,a=[]);a.push(t)}
function buildWorld(){
 buildHeights();
 // grass density + tint per heightmap sample (packed into the texture the grass shader reads)
 const hb=new Uint8Array(HN*HN*4);
 for(let j=0;j<HN;j++)for(let i=0;i<HN;i++){const x=-WS+i*HS,z=-WS+j*HS,o=j*HN+i,h=HGT[o],r=Math.hypot(x,z),road=Math.min(Math.abs(x),Math.abs(z)),zn=zoneAt(x,z);
  let d=(.1+.9*sst(125,300,r))*(r>74?1:0)*sst(2.6,5,road+Math.max(0,r-720)),t=0;
  if(zn==='swamp'){d*=.55;t=1}else if(zn==='mountain'||zn==='lair'){d*=.7*sst(40,8,h);t=.55}else if(zn==='camp'){d*=.3;t=.6}else if(zn==='ruins'){d*=.6;t=.3}else if(zn==='dense')d*=.75;
  if(depthAt(x,z)>.05)d=0;GDN[o]=Math.round(cl(d,0,1)*255);GTN[o]=Math.round(t*255);const q=Math.round(cl((h+20)/140,0,1)*65535);hb[o*4]=q>>8;hb[o*4+1]=q&255;hb[o*4+2]=GDN[o];hb[o*4+3]=GTN[o]}
 if(gprog&&gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS)>0){HTEX=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,HTEX);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,HN,HN,0,gl.RGBA,gl.UNSIGNED_BYTE,hb);
  for(const[k,v]of[[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v)}
 // ---------- terrain (8x8 chunks of 50x50 cells, colours by region)
 const NC=50,gcol=(x,z,h)=>{const r=Math.hypot(x,z),n=.5+.5*Math.sin(x*.21+Math.sin(z*.17)*2)*Math.cos(z*.19),f=sst(260,420,r),zn=zoneAt(x,z);
  let c=[lp(.30,.19,f)+n*.05,lp(.47,.34,f)+n*.07,lp(.22,.16,f)+n*.03];
  if(zn==='dense')c=[.13+n*.04,.25+n*.05,.12+n*.03];else if(zn==='swamp'||Math.hypot(x-SWAMP[0],z-SWAMP[1])<SWAMP[2]+40)c=[.24+n*.05,.27+n*.05,.15+n*.03];
  else if(zn==='camp')c=[.38+n*.05,.33+n*.05,.22];else if(zn==='ruins')c=[.33+n*.04,.38+n*.05,.24];
  const dm=Math.hypot(x-MOUNT[0],z-MOUNT[1]);if(dm<430){const rock=[.4+n*.06,.39+n*.05,.38+n*.05];c=mix3(c,rock,sst(6,22,h)*sst(430,250,dm));c=mix3(c,[.9,.92,.96],sst(44,56,h));if(dm<120)c=mix3(c,[.24,.2,.2],sst(110,60,dm))}
  const wd=waterAt(x,z)-h;if(waterAt(x,z)>-90&&wd>-1.2)c=mix3(c,[.5,.46,.33],sst(-1.2,.2,wd)*.8);return c};
 for(let cx=0;cx<8;cx++)for(let cz=0;cz<8;cz++){const g=G(),i0=cx*NC,j0=cz*NC;
  for(let j=0;j<=NC;j++)for(let i=0;i<=NC;i++){const gi=Math.min(i0+i,HN-1),gj=Math.min(j0+j,HN-1),x=-WS+gi*HS,z=-WS+gj*HS,h=HGT[gj*HN+gi],e=HS,
    n=vnorm([hAt(x-e,z)-hAt(x+e,z),2*e,hAt(x,z-e)-hAt(x,z+e)]),c=gcol(x,z,h);g.P.push(x,h,z);g.N.push(n[0],n[1],n[2]);g.U.push(0,0);g.C.push(c[0],c[1],c[2]);g.W.push(0)}
  for(let j=0;j<NC;j++)for(let i=0;i<NC;i++){const a=j*(NC+1)+i,b=a+1,c=a+NC+1,d=c+1;g.I.push(a,c,b,b,c,d)}
  obj(geo(g),{shade:.55,pos:[-WS+(i0+NC/2)*HS,0,-WS+(j0+NC/2)*HS],cull:620,ds:0})}
 // ---------- ground overlays: village dirt, courtyard stone, roads (four roads to the edge of the old forest, north road up to the mountains)
 const ov=G(),dirt=[.46,.40,.29],road=[.55,.47,.33],stone=[.52,.52,.55];
 // overlays follow the terrain closely (fine grid sampled from hAt) so feet never sink into or float over them
 const H=(x,z)=>hAt(x,z)+.045;
 for(let ri=0;ri<20;ri++){const r0=ri*6,r1=r0+6;for(let k=0;k<72;k++){const a0=k/72*2*PI,a1=(k+1)/72*2*PI,e=(r)=>r>=118?118+6*Math.sin(a0*3):r,P=(r,a)=>{const rr=Math.min(r,118+6*Math.sin(a*48/(2*PI)*1.7));return[Math.cos(a)*rr,H(Math.cos(a)*rr,Math.sin(a)*rr),Math.sin(a)*rr]};
  const f=.8+.2*Math.sin(k*2.3+ri);quad(ov,P(r0,a1),P(r1,a1),P(r1,a0),P(r0,a0),[dirt[0]*f,dirt[1]*f*1.08,dirt[2]*f])}}
 for(let gx=-36;gx<36;gx+=4)for(let gz=-36;gz<36;gz+=4){const q=(x,z)=>[x,H(x,z)+.02,z];quad(ov,q(gx,gz+4),q(gx+4,gz+4),q(gx+4,gz),q(gx,gz),stone)}
 for(const[dx,dz]of[[0,1],[0,-1],[1,0],[-1,0]]){let prev=null;const end=dz<0?690:720;for(let s=30;s<=end;s+=1){const x=dx*s,z=dz*s,w=s<120?3.2:2.4,px=dz*w,pz=dx*w;if(depthAt(x,z)>0){prev=null;continue}
   const row=[0,1,2,3,4].map(k=>{const t=k/4*2-1,xx=x+px*t,zz=z+pz*t;return[xx,H(xx,zz)+.01,zz]});
   if(prev){const f=.9+.1*Math.sin(s*.22);for(let k=0;k<4;k++)quad(ov,prev[k],prev[k+1],row[k+1],row[k],[road[0]*f,road[1]*f,road[2]*f])}prev=row}}
 for(let i=0;i<ov.N.length;i+=3){ov.N[i]=0;ov.N[i+1]=1;ov.N[i+2]=0}
 obj(geo(ov),{shade:.4,pos:[0,0,0],cull:900});
 // ---------- the original forest (same random sequence, so the village and castle keep their exact layout)
 for(let gx=-76;gx<=76;gx++)for(let gz=-76;gz<=76;gz++){const x=(gx+rnd()*.9)*9,z=(gz+rnd()*.9)*9,r=Math.hypot(x,z),p=rnd(),s=rr(.8,1.5),kind=rnd();
  if(Math.abs(x)>700-12||Math.abs(z)>700-12||p>sst(128,300,r)*.58)continue;if((Math.abs(x)<6.5||Math.abs(z)<6.5)&&r<345)continue;if(Math.hypot(x-SPAWN[0],z-SPAWN[2])<11)continue;
  const leafA=[.12,.33,.16],leafB=[.2,.42,.17],leafC=[.16,.3,.2],lc=kind<.4?leafA:kind<.7?leafC:leafB,lv=[lc[0]*rr(.85,1.15),lc[1]*rr(.85,1.15),lc[2]*rr(.85,1.15)];
  const t={x,z,s,k:kind<.7?0:1,lv,rot:kind<.7?[rnd(),rnd(),rnd()]:[rnd(),rnd()]};if(treeOK(x,z))addSpec(t)}
 // ---------- castle
 const cs=G(),st=()=>{const f=rr(.86,1.04);return[.56*f,.56*f,.6*f]},dk=[.3,.3,.34],roofB=[.22,.27,.45],HW=34,TH=1.3,WH=7.5;
 const wall=(x0,z0,x1,z1)=>{box(cs,Math.min(x0,x1),0,Math.min(z0,z1),Math.max(x0,x1),WH,Math.max(z0,z1),st(),[.47,.47,.5]);addBox(Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1),WH);
  const horiz=Math.abs(x1-x0)>Math.abs(z1-z0),L=horiz?Math.abs(x1-x0):Math.abs(z1-z0),n=Math.floor(L/2.2);
  for(let i=0;i<n;i++){const t=(i+.5)/n;if(horiz){const x=lp(Math.min(x0,x1),Math.max(x0,x1),t),zo=Math.abs(z0)>Math.abs(z1)?z0:z1,zi=zo-Math.sign(zo)*.7;box(cs,x-.6,WH,Math.min(zo,zi),x+.6,WH+.9,Math.max(zo,zi),st())}
   else{const z=lp(Math.min(z0,z1),Math.max(z0,z1),t),xo=Math.abs(x0)>Math.abs(x1)?x0:x1,xi=xo-Math.sign(xo)*.7;box(cs,Math.min(xo,xi),WH,z-.6,Math.max(xo,xi),WH+.9,z+.6,st())}}};
 const GW=3.4,GT=6.2;   // half gate width, gate tower outer edge
 for(const s of[1,-1]){wall(-HW+3,s*(HW-TH),-GT,s*(HW+TH));wall(GT,s*(HW-TH),HW-3,s*(HW+TH));wall(s*(HW-TH),-HW+3,s*(HW+TH),-GT);wall(s*(HW-TH),GT,s*(HW+TH),HW-3);
  for(const t of[-1,1]){ // gate towers + lintel, on the z sides then the x sides
   box(cs,t*GW,0,s*HW-2.4,t*GT,11,s*HW+2.4,st(),[.44,.44,.48]);addBox(Math.min(t*GW,t*GT),s*HW-2.4,Math.max(t*GW,t*GT),s*HW+2.4,11);
   box(cs,s*HW-2.4,0,t*GW,s*HW+2.4,11,t*GT,st(),[.44,.44,.48]);addBox(s*HW-2.4,Math.min(t*GW,t*GT),s*HW+2.4,Math.max(t*GW,t*GT),11);
   for(const[a,b]of[[t*4.8,s*HW],[s*HW,t*4.8]]){box(cs,a-1.5,11,b-2.6,a+1.5,11.9,b-1.6,st());box(cs,a-1.5,11,b+1.6,a+1.5,11.9,b+2.6,st())}}
  box(cs,-GW,5.2,s*HW-1.6,GW,8.6,s*HW+1.6,st(),[.44,.44,.48]);box(cs,s*HW-1.6,5.2,-GW,s*HW+1.6,8.6,GW,st(),[.44,.44,.48]);
  for(let i=-2;i<=2;i++){box(cs,i*1.2-.12,4.2,s*HW-.15,i*1.2+.12,5.2,s*HW+.15,dk);box(cs,s*HW-.15,4.2,i*1.2-.12,s*HW+.15,5.2,i*1.2+.12,dk)}}
 const cg=[];for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*HW,z=sz*HW;addCircle([x,z,4.7]);
  cg.push(tint(bake(loft([{y:0,rx:4.9},{y:1,rx:4.6},{y:12,rx:4.5},{y:12.01,rx:5.1},{y:13.2,rx:5.1}],14,1),mtrs([x,0,z],[0,0,0])),[.55,.55,.59]));
  cg.push(tint(bake(loft([{y:13.2,rx:5.5},{y:19,rx:.05}],14,1),mtrs([x,0,z],[0,0,0])),roofB))}
 // keep
 box(cs,-9,0,-7,9,12,7,st(),[.46,.46,.5]);addBox(-9,-7,9,7,18);box(cs,-6,12,-4.5,6,18,4.5,st(),[.46,.46,.5]);
 for(let i=-4;i<=4;i++){box(cs,i*2-.55,12,6.3,i*2+.55,12.9,7,st());box(cs,i*2-.55,12,-7,i*2+.55,12.9,-6.3,st())}
 box(cs,-1.5,0,7,1.5,3.6,7.12,[.25,.17,.1]);box(cs,-2.2,0,7,-1.5,4.2,7.3,st());box(cs,1.5,0,7,2.2,4.2,7.3,st());box(cs,-2.2,3.6,7,2.2,4.4,7.3,st());
 for(const x of[-5.5,5.5])for(const y of[5,9]){box(cs,x-.5,y,7,x+.5,y+1.6,7.06,[.95,.8,.4])}
 for(const sx of[-1,1])for(const sz of[-1,1]){cg.push(tint(bake(loft([{y:0,rx:1.9},{y:16,rx:1.8},{y:16.01,rx:2.2},{y:17,rx:2.2}],10,1),mtrs([sx*9,0,sz*7],[0,0,0])),[.55,.55,.59]));cg.push(tint(bake(loft([{y:17,rx:2.5},{y:21,rx:.05}],10,1),mtrs([sx*9,0,sz*7],[0,0,0])),roofB));addCircle([sx*9,sz*7,2])}
 {const r=G();quad(r,[-6.4,18,4.9],[6.4,18,4.9],[6.4,22,0],[-6.4,22,0],roofB);quad(r,[6.4,18,-4.9],[-6.4,18,-4.9],[-6.4,22,0],[6.4,22,0],roofB);tri(r,[-6.4,18,-4.9],[-6.4,18,4.9],[-6.4,22,0],[.5,.5,.54]);tri(r,[6.4,18,4.9],[6.4,18,-4.9],[6.4,22,0],[.5,.5,.54]);cg.push(r)}
 // banners on the gate towers (sway)
 const flags=G();for(const s of[1,-1])for(const t of[-1,1]){const x=t*4.8,z=s*HW;box(cs,x-.07,11.9,z-.07,x+.07,15.5,z+.07,dk);
  const o=flags.P.length/3;for(let i=0;i<=4;i++)for(let j=0;j<2;j++){flags.P.push(x+.07+i*.45,15.4-j*1.1,z);flags.N.push(0,0,1);flags.C.push(.2,.3,.75);flags.U.push(0,0);flags.W.push(i*5)}
  for(let i=0;i<4;i++){const a=o+i*2;flags.I.push(a,a+1,a+2,a+1,a+3,a+2)}}
 obj(geo(cs),{shade:.8,pos:[0,0,0],cull:520,out:.03,outCol:[.16,.16,.22]});obj(geo(merge(cg)),{shade:.8,pos:[0,0,0],cull:520,out:.03,outCol:[.16,.16,.22]});obj(geo(flags),{shade:.5,pos:[0,0,0],cull:300});
 // ---------- village
 const vg=G(),plaster=[[.86,.82,.72],[.8,.78,.74],[.88,.84,.76],[.76,.72,.66]],roofs=[[.55,.25,.2],[.45,.28,.2],[.3,.34,.5],[.5,.32,.22]],timber=[.33,.23,.15],win=[.98,.82,.42];
 const house=(x,z,w,d,door)=>{const pc=plaster[Math.floor(rnd()*4)],rc=roofs[Math.floor(rnd()*4)],h=rr(2.9,3.5),x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,rh=rr(2.1,2.8),e=.45;
  box(vg,x0,0,z0,x1,.5,z1,[.5,.5,.52]);box(vg,x0+.05,.5,z0+.05,x1-.05,h,z1-.05,pc);addBox(x0,z0,x1,z1,h+rh*.6);HOUSES.push({x,z,w,d,door,dx:door===0?x:(x<0?x1+1.2:x0-1.2),dz:door===0?(z<0?z1+1.2:z0-1.2):z});
  for(const[a,b]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])box(vg,a-.12,.5,b-.12,a+.12,h,b+.12,timber);
  if(w>=d){quad(vg,[x0-e,h,z1+e],[x1+e,h,z1+e],[x1+e,h+rh,z],[x0-e,h+rh,z],rc);quad(vg,[x1+e,h,z0-e],[x0-e,h,z0-e],[x0-e,h+rh,z],[x1+e,h+rh,z],[rc[0]*.85,rc[1]*.85,rc[2]*.85]);tri(vg,[x0,h,z0],[x0,h,z1],[x0,h+rh,z],pc);tri(vg,[x1,h,z1],[x1,h,z0],[x1,h+rh,z],pc)}
  else{quad(vg,[x1+e,h,z1+e],[x1+e,h,z0-e],[x,h+rh,z0-e],[x,h+rh,z1+e],rc);quad(vg,[x0-e,h,z0-e],[x0-e,h,z1+e],[x,h+rh,z1+e],[x,h+rh,z0-e],[rc[0]*.85,rc[1]*.85,rc[2]*.85]);tri(vg,[x0,h,z1],[x1,h,z1],[x,h+rh,z1],pc);tri(vg,[x1,h,z0],[x0,h,z0],[x,h+rh,z0],pc)}
  box(vg,x+w*.22,h+.6,z-d*.2,x+w*.22+.7,h+rh+.5,z-d*.2+.7,[.45,.4,.38]);
  // door and windows on the side facing the castle
  if(door===0){const zz=z<0?z1:z0,o=z<0?.06:-.06;box(vg,x-.55,0,Math.min(zz,zz+o),x+.55,2.1,Math.max(zz,zz+o),timber);for(const s of[-1,1])box(vg,x+s*w*.3-.4,1.3,Math.min(zz,zz+o),x+s*w*.3+.4,2.2,Math.max(zz,zz+o),win)}
  else{const xx=x<0?x1:x0,o=x<0?.06:-.06;box(vg,Math.min(xx,xx+o),0,z-.55,Math.max(xx,xx+o),2.1,z+.55,timber);for(const s of[-1,1])box(vg,Math.min(xx,xx+o),1.3,z+s*d*.3-.4,Math.max(xx,xx+o),2.2,z+s*d*.3+.4,win)}};
 for(let gx=-6;gx<=6;gx++)for(let gz=-6;gz<=6;gz++){const x=gx*19+rr(-2,2),z=gz*19+rr(-2,2),r=Math.hypot(x,z);
  if(Math.max(Math.abs(x),Math.abs(z))<49||r>108||Math.min(Math.abs(x),Math.abs(z))<9.5||rnd()<.12)continue;
  if(Math.hypot(x-10,z-52)<12||Math.hypot(x+10,z-52)<10)continue;
  const sw=rnd()<.5,w=sw?rr(5,6.6):rr(6.4,8.6),d=sw?rr(6.4,8.6):rr(5,6.6);house(x,z,w,d,Math.abs(z)>Math.abs(x)?0:1)}
 // plaza: well, market stalls, statue pedestal, lamp posts
 const pl=[];pl.push(tint(bake(loft([{y:0,rx:1.5},{y:.9,rx:1.5},{y:.9,rx:1.15},{y:.2,rx:1.15}],12,1),mtrs([-10,0,52],[0,0,0])),[.6,.6,.63]));addCircle([-10,52,1.6]);
 for(const sx of[-1,1]){box(vg,-10+sx*1.3-.1,0,51.9,-10+sx*1.3+.1,2.6,52.1,timber)}box(vg,-11.5,2.5,51.6,-8.5,2.7,52.4,roofs[0]);
 for(const[x,z,c]of[[-13,64,[.75,.25,.22]],[13,66,[.25,.4,.75]],[-15,-60,[.8,.65,.2]],[15,-62,[.3,.6,.35]]]){box(vg,x-1.6,0,z-1,x+1.6,1,z+1,timber);for(const a of[-1.5,1.5])for(const b of[-.9,.9])box(vg,x+a-.06,1,z+b-.06,x+a+.06,2.5,z+b+.06,timber);
  quad(vg,[x-1.9,2.3,z+1.3],[x+1.9,2.3,z+1.3],[x+1.9,2.8,z-1.1],[x-1.9,2.8,z-1.1],c);addBox(x-1.6,z-1,x+1.6,z+1,1.0);STALLS.push([x,z])}
 box(vg,8.2,0,48.2,11.8,.9,51.8,[.5,.5,.54],[.58,.58,.62]);addBox(8.2,48.2,11.8,51.8,.9);
 for(const[dx,dz]of[[0,1],[0,-1],[1,0],[-1,0]])for(let s=44;s<=116;s+=24)for(const sd of[-1,1]){const x=dx*s+dz*sd*4.4,z=dz*s+dx*sd*4.4;box(vg,x-.08,0,z-.08,x+.08,3,z+.08,dk);box(vg,x-.2,3,z-.2,x+.2,3.45,z+.2,[1,.85,.45]);addCircle([x,z,.25])}
 obj(geo(vg),{shade:.8,pos:[0,0,0],cull:420,out:.025,outCol:[.18,.14,.12]});obj(geo(merge(pl)),{shade:.8,pos:[0,0,0],cull:300});

 obj(geo(vg),{shade:.8,pos:[0,0,0],cull:420,out:.025,outCol:[.18,.14,.12]});obj(geo(merge(pl)),{shade:.8,pos:[0,0,0],cull:300});
 // ---------- new regions (own random stream so nothing above shifts)
 const R2=mkRng(20261114),r2=(a,b)=>a+(b-a)*R2();
 for(let gx=-155;gx<=155;gx++)for(let gz=-155;gz<=155;gz++){const x=(gx+.5+R2()*.8)*9,z=(gz+.5+R2()*.8)*9,p=R2(),s=r2(.8,1.5),kind=R2(),inner=Math.abs(x)<688&&Math.abs(z)<688;
  if(Math.abs(x)>WS-16||Math.abs(z)>WS-16)continue;const zn=zoneAt(x,z),h=hAt(x,z);let dens=0,k=0;
  if(zn==='dense'){dens=inner?.45:.92;k=kind<.75?2:1}else if(zn==='forest'){dens=inner?0:.55;k=kind<.6?0:1}else if(zn==='swamp'){dens=.1;k=3}else if(zn==='mountain'){dens=h<36?.22*sst(40,16,h):0;k=4}else if(zn==='ruins'){dens=.08;k=1}
  if(p>dens||!treeOK(x,z))continue;const lc=k===2?[.07,.2,.1]:k===4?[.1,.26,.16]:kind<.4?[.12,.33,.16]:[.2,.42,.17];addSpec({x,z,s:k===2?s*1.25:s,k,lv:[lc[0]*r2(.85,1.15),lc[1]*r2(.85,1.15),lc[2]*r2(.85,1.15)],rot:[R2(),R2(),R2()]})}
 sceneryPre();
 for(const t of TREES)if(t.k!==6)addTree(t.x,t.z,(t.k===1?.42:t.k===3?.3:.36)*t.s*(t.k===2?1.1:1),t.k===3?4:7);
 // boulders on the mountain and in the ruins (collision + line of sight)
 const rk=G();for(let i=0;i<520;i++){const a=R2()*6.283,d=r2(70,430),x=MOUNT[0]+Math.cos(a)*d,z=MOUNT[1]+Math.sin(a)*d*.9,s=r2(.8,3.2);if(!treeOK(x,z)&&zoneAt(x,z)!=='lair')continue;rock(rk,x,hAt(x,z),z,s,R2);addTree(x,z,s*.85,s*1.2)}
 for(const c of RUINS)for(let i=0;i<10;i++){const a=R2()*6.283,d=r2(20,60),x=c[0]+Math.cos(a)*d,z=c[1]+Math.sin(a)*d,s=r2(.5,1.4);rock(rk,x,hAt(x,z),z,s,R2);addTree(x,z,s*.8,s)}
 rockObjs(rk);
 buildWater();buildScenery();for(const c of CAMPS)buildCamp(c[0],c[1],R2);for(const c of RUINS)buildRuin(c[0],c[1],R2);buildLair(R2);
 makeGrass(21000,46);
}
function mkRng(seed){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function rock(g,x,y,z,s,R){const o=g.P.length/3,c=[.45+R()*.08,.44+R()*.06,.43+R()*.06],N=7;g.P.push(x,y+s*1.1,z);g.N.push(0,1,0);g.C.push(c[0]*1.1,c[1]*1.1,c[2]*1.1);g.U.push(0,0);g.W.push(0);
 for(let k=0;k<=N;k++){const a=k/N*2*PI,rr2=s*(.8+.4*Math.sin(k*2.7+x)),px=x+Math.cos(a)*rr2,pz=z+Math.sin(a)*rr2;g.P.push(px,y+s*.35,pz);const n=vnorm([Math.cos(a),.6,Math.sin(a)]);g.N.push(n[0],n[1],n[2]);g.C.push(c[0],c[1],c[2]);g.U.push(0,0);g.W.push(0);
  g.P.push(px*1.0+Math.cos(a)*s*.15,y-.3,pz+Math.sin(a)*s*.15);g.N.push(Math.cos(a),0,Math.sin(a));g.C.push(c[0]*.8,c[1]*.8,c[2]*.8);g.U.push(0,0);g.W.push(0);
  if(k){const p=o+1+(k-1)*2,q=o+1+k*2;g.I.push(o,q,p,p,q,q+1,p,q+1,p+1)}}}
function rockObjs(g){// split into ~60k-vertex objects
 const per=Math.floor(60000/(1+8*2))*(1+8*2);let i=0;const nv=g.P.length/3;while(i<nv){const sub=G(),end=Math.min(nv,i+per);for(let k=i*3;k<end*3;k++){sub.P.push(g.P[k]);sub.N.push(g.N[k]);sub.C.push(g.C[k])}for(let k=i;k<end;k++){sub.U.push(0,0);sub.W.push(0)}
  for(let k=0;k<g.I.length;k+=3){const a=g.I[k];if(a>=i&&a<end)sub.I.push(g.I[k]-i,g.I[k+1]-i,g.I[k+2]-i)}const cx=sub.P.length?sub.P[0]:0,cz=sub.P.length?sub.P[2]:0;obj(geo(sub),{shade:.8,pos:[cx,0,cz],cull:900,out:.02,outCol:[.15,.15,.18]});i=end}}
// ---------- water: lake, river ribbon, swamp pools
function buildWater(){const lake=G(),seg=56;{const o=0;lake.P.push(LAKE[0],WATER_L,LAKE[1]);for(let k=0;k<=seg;k++){const a=k/seg*2*PI,r=LAKE[2]+52;lake.P.push(LAKE[0]+Math.cos(a)*r,WATER_L,LAKE[1]+Math.sin(a)*r);if(k)lake.I.push(o,o+k+1,o+k)}}
 const rv=G();let prev=null;for(let i=0;i<RIVER.length-1;i++){const a=RIVER[i],b=RIVER[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/10);for(let s=0;s<=n;s++){if(i>0&&s===0)continue;const t=s/n,x=lp(a[0],b[0],t),z=lp(a[1],b[1],t),ux=-(b[1]-a[1])/L,uz=(b[0]-a[0])/L,w=26;
   const o=rv.P.length/3;rv.P.push(x+ux*w,WATER_L,z+uz*w,x-ux*w,WATER_L,z-uz*w);if(prev!==null)rv.I.push(prev,prev+1,o,prev+1,o+1,o);prev=o}}
 const sw=G();{sw.P.push(SWAMP[0],WATER_S,SWAMP[1]);for(let k=0;k<=seg;k++){const a=k/seg*2*PI,r=SWAMP[2]+31;sw.P.push(SWAMP[0]+Math.cos(a)*r,WATER_S,SWAMP[1]+Math.sin(a)*r);if(k)sw.I.push(0,k+1,k)}}
 for(const[g,c,al]of[[lake,[.18,.4,.6],.66],[rv,[.2,.44,.62],.66],[sw,[.1,.16,.15],.8]]){const nv=g.P.length/3;for(let i=0;i<nv;i++){g.N.push(0,1,0);g.C.push(1,1,1);g.U.push(0,0);g.W.push(0)}const o=obj(geo(g),{unlit:1,blend:1,noOff:1,col:c,shade:1,order:1,pos:[g.P[0],0,g.P[2]],cull:1400});o.alpha=al;WATERS.push(o)}
 // reeds and swamp lily pads (static, wind sway)
 const rd=G(),R=mkRng(77);for(let i=0;i<900;i++){const a=R()*6.283,d=Math.sqrt(R())*(SWAMP[2]+20),x=SWAMP[0]+Math.cos(a)*d,z=SWAMP[1]+Math.sin(a)*d,h=hAt(x,z);if(Math.abs(h-WATER_S)>.9)continue;const o=rd.P.length/3,hh=1.2+R()*1.3,c=[.36+R()*.1,.42+R()*.08,.2];
  for(let k=0;k<3;k++){const b=k*2.1+R(),bx=x+Math.cos(b)*.12,bz=z+Math.sin(b)*.12;rd.P.push(bx-.04,h,bz,bx+.04,h,bz,bx+Math.cos(b)*.15,h+hh,bz+Math.sin(b)*.15);for(let q=0;q<3;q++){rd.N.push(0,1,0);rd.C.push(c[0]*(q==2?1.2:.7),c[1]*(q==2?1.2:.7),c[2]);rd.U.push(0,0);rd.W.push(q==2?6:0)}rd.I.push(o+k*3,o+k*3+1,o+k*3+2)}}
 obj(geo(rd),{shade:.6,pos:[SWAMP[0],0,SWAMP[1]],cull:700})}
const WATERS=[];
// ---------- goblin camp: palisade ring with a gate, hide tents, campfire, totem
const CAMPFIRES=[];
function buildCamp(cx,cz,R){const g=G(),y0=hAt(cx,cz),wood=[.34,.24,.15],hide=[.55,.44,.3],hide2=[.42,.36,.26];
 const gate=R()*6.283;for(let k=0;k<44;k++){const a=k/44*2*PI;if(Math.abs(angd(a,gate))<.22)continue;const r=26,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,h=hAt(x,z),hh=2.6+R()*.8;
  box(g,x-.22,h-.3,z-.22,x+.22,h+hh,z+.22,[wood[0]*(.85+R()*.3),wood[1]*(.85+R()*.3),wood[2]]);tri(g,[x-.22,h+hh,z],[x+.22,h+hh,z],[x,h+hh+.5,z],wood);
  const a2=(k+1)/44*2*PI;if(Math.abs(angd(a2,gate))>=.22){const x2=cx+Math.cos(a2)*r,z2=cz+Math.sin(a2)*r;addBox(Math.min(x,x2)-.3,Math.min(z,z2)-.3,Math.max(x,x2)+.3,Math.max(z,z2)+.3,2.8)}}
 const tents=[];for(let i=0;i<4;i++){const a=gate+PI+(i-1.5)*.95,r=15,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,h=hAt(x,z),w=2.4,ya=a+PI/2,ca=Math.cos(ya)*w,sa=Math.sin(ya)*w,ex=Math.cos(a)*2.2,ez=Math.sin(a)*2.2,top=h+2.6,col=i%2?hide:hide2;
  quad(g,[x-ca-ex,h,z-sa-ez],[x-ca+ex,h,z-sa+ez],[x+ex,top,z+ez],[x-ex,top,z-ez],col);quad(g,[x+ca+ex,h,z+sa+ez],[x+ca-ex,h,z+sa-ez],[x-ex,top,z-ez],[x+ex,top,z+ez],[col[0]*.85,col[1]*.85,col[2]*.85]);
  tri(g,[x-ca-ex,h,z-sa-ez],[x-ex,top,z-ez],[x+ca-ex,h,z+sa-ez],[col[0]*.7,col[1]*.7,col[2]*.7]);addBox(Math.min(x-ca,x+ca)-1.6,Math.min(z-sa,z+sa)-1.6,Math.max(x-ca,x+ca)+1.6,Math.max(z-sa,z+sa)+1.6,2.6);tents.push([x,z])}
 for(let i=0;i<6;i++){const a=i/6*2*PI;box(g,cx+Math.cos(a)*.7-.12,y0,cz+Math.sin(a)*.7-.12,cx+Math.cos(a)*.7+.12,y0+.25,cz+Math.sin(a)*.7+.12,[.2,.15,.1])}
 const tx=cx+Math.cos(gate+PI)*6,tz=cz+Math.sin(gate+PI)*6,th=hAt(tx,tz);box(g,tx-.25,th,tz-.25,tx+.25,th+4,tz+.25,[.4,.3,.2]);box(g,tx-.9,th+3,tz-.1,tx+.9,th+3.3,tz+.1,[.4,.3,.2]);
 g.P.length&&0;const sk=sphere(10,8,d=>[tx+d[0]*.3,th+4.3+d[1]*.32,tz+d[2]*.3],{c:[tx,th+4.3,tz],col:()=>[.9,.88,.8]});addTree(tx,tz,.35,4);
 obj(geo(merge([g,sk])),{shade:.8,pos:[cx,0,cz],cull:420,out:.02,outCol:[.12,.1,.08]});
 const fl=obj(FIREGEO(),{unlit:1,col:[1,.6,.2],pos:[cx,0,cz],cull:300});fl.M=mtrs([cx,y0+.1,cz],[0,0,0]);CAMPFIRES.push({o:fl,x:cx,z:cz,y:y0});
 CAMPSITES.push({x:cx,z:cz,gate,tents,fire:[cx,cz]})}
const CAMPSITES=[];let _fireGeo=null;
function FIREGEO(){if(_fireGeo)return _fireGeo;const g=G();for(let k=0;k<4;k++){const a=k*PI/4,c=Math.cos(a)*.45,s=Math.sin(a)*.45;g.P.push(-c,0,-s,c,0,s,0,1.3,0);for(let q=0;q<3;q++){g.N.push(0,1,0);g.C.push(1,q==2?.9:.5,q==2?.4:.1);g.U.push(0,0);g.W.push(q==2?8:0)}g.I.push(k*3,k*3+1,k*3+2)}return _fireGeo=geo(g)}
// ---------- ruins: broken walls and pillars (they block sight and movement)
function buildRuin(cx,cz,R){const g=G(),st=()=>{const f=.8+R()*.25;return[.5*f,.49*f,.46*f]};
 for(let w=0;w<6;w++){const a=R()*6.283,d=8+R()*30,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,ya=R()*PI,L=6+R()*10,ca=Math.cos(ya),sa=Math.sin(ya),n=Math.ceil(L/1.5);
  for(let i=0;i<n;i++){const px=x+ca*(i-n/2)*1.5,pz=z+sa*(i-n/2)*1.5,h=hAt(px,pz),hh=.8+R()*3.6*(1-Math.abs(i-n/2)/n);if(R()<.15)continue;box(g,px-.8,h-.4,pz-.8,px+.8,h+hh,pz+.8,st(),[.42,.44,.36]);addBox(px-.8,pz-.8,px+.8,pz+.8,hh)}}
 for(let i=0;i<8;i++){const a=i/8*2*PI,x=cx+Math.cos(a)*22,z=cz+Math.sin(a)*22,h=hAt(x,z),hh=R()<.4?1+R()*2:5+R()*2;g.P.length;const p=bake(loft([{y:0,rx:.7},{y:.4,rx:.65},{y:hh,rx:.55},{y:hh+.01,rx:.75},{y:hh+.4,rx:.75}],10,1),mtrs([x,h-.2,z],[0,0,0]));tint(p,st());const o=g.P.length/3;
  for(const k of['P','N','U','C','W'])for(const v of p[k])g[k].push(v);for(const v of p.I)g.I.push(v+o);addTree(x,z,.8,hh)}
 obj(geo(g),{shade:.8,pos:[cx,0,cz],cull:420,out:.02,outCol:[.14,.14,.16]})}
// ---------- dragon lair on the mountain plateau: a ring of standing stones and bones
function buildLair(R){const g=G();for(let i=0;i<12;i++){const a=i/12*2*PI,x=LAIR[0]+Math.cos(a)*48,z=LAIR[1]+Math.sin(a)*48,h=hAt(x,z),hh=3+R()*4;box(g,x-.9,h-.5,z-.6,x+.9,h+hh,z+.6,[.3,.28,.3],[.36,.33,.34]);addTree(x,z,1.1,hh)}
 for(let i=0;i<14;i++){const a=R()*6.283,d=8+R()*30,x=LAIR[0]+Math.cos(a)*d,z=LAIR[1]+Math.sin(a)*d,h=hAt(x,z);const t=tube([[x,h+.1,z],[x+Math.cos(a)*1.2,h+.5,z+Math.sin(a)*1.2],[x+Math.cos(a)*2.2,h+.15,z+Math.sin(a)*2.2]],{r:()=>.09,seg:5,n:4});tint(t,[.86,.83,.74]);const o=g.P.length/3;for(const k of['P','N','U','C','W'])for(const v of t[k])g[k].push(v);for(const v of t.I)g.I.push(v+o)}
 obj(geo(g),{shade:.8,pos:[LAIR[0],0,LAIR[1]],cull:500,out:.02,outCol:[.1,.1,.12]})}
// ---------- streamed forest geometry
const TREEGEO=new Map();
function treeChunkGeo(list){const g=G(),trunkC=[.36,.25,.16];
 const cone=(x,y,z,r,h,seg,col,w,rot)=>{const o=g.P.length/3,sl=r/h;g.P.push(x,y+h,z);g.N.push(0,1,0);g.C.push(col[0]*1.15,col[1]*1.15,col[2]*1.15);g.U.push(0,0);g.W.push(w);
  for(let k=0;k<=seg;k++){const a=k/seg*2*PI+rot,c=Math.cos(a),s=Math.sin(a),n=vnorm([c,sl,s]);g.P.push(x+c*r,y,z+s*r);g.N.push(n[0],n[1],n[2]);const f=.72+.12*Math.sin(k*2.1);g.C.push(col[0]*f,col[1]*f,col[2]*f);g.U.push(0,0);g.W.push(w*.4);if(k)g.I.push(o,o+k+1,o+k)}};
 const cyl=(x,y,z,r0,r1,h,seg,col,lean=[0,0])=>{const o=g.P.length/3;for(let j=0;j<2;j++)for(let k=0;k<=seg;k++){const a=k/seg*2*PI,c=Math.cos(a),s=Math.sin(a),r=j?r1:r0;g.P.push(x+c*r+lean[0]*j,y+j*h,z+s*r+lean[1]*j);g.N.push(c,0,s);const f=j?.8:1;g.C.push(col[0]*f,col[1]*f,col[2]*f);g.U.push(0,0);g.W.push(0)}
  for(let k=0;k<seg;k++){const a=o+k,b=a+1,c=o+seg+1+k,d=c+1;g.I.push(a,c,b,b,c,d)}};
 for(const t of list){const{x,z,s,lv,rot}=t,y=hAt(x,z)-.15;
  if(t.k===0){cyl(x,y,z,.3*s,.2*s,2.6*s,6,trunkC);cone(x,y+1.9*s,z,2.3*s,3.4*s,7,lv,5,rot[0]);cone(x,y+3.9*s,z,1.75*s,3*s,7,lv,7,rot[1]);cone(x,y+5.8*s,z,1.15*s,2.7*s,7,lv,9,rot[2])}
  else if(t.k===1){cyl(x,y,z,.36*s,.26*s,3.2*s,6,trunkC);cone(x,y+2.6*s,z,2.9*s,2.6*s,8,lv,5,rot[0]);cone(x,y+3.9*s,z,2.5*s,2.9*s,8,[lv[0]*1.1,lv[1]*1.1,lv[2]*1.1],8,rot[1])}
  else if(t.k===2){cyl(x,y,z,.42*s,.26*s,4*s,6,[.22,.17,.12]);for(let i=0;i<4;i++)cone(x,y+(2+i*1.7)*s,z,(2.8-i*.5)*s,3.2*s,8,[lv[0]*(1+i*.08),lv[1]*(1+i*.08),lv[2]*(1+i*.08)],5+i*2,rot[i%3]+i)}
  else if(t.k===3){const dark=[.24,.21,.17],l=[Math.cos(rot[0]*6)*.6*s,Math.sin(rot[0]*6)*.6*s];cyl(x,y,z,.32*s,.12*s,4.4*s,5,dark,l);for(let i=0;i<3;i++){const a=rot[i%3]*6.28+i*2.1,bx=x+l[0]*.6,bz=z+l[1]*.6,by=y+(2.4+i*.7)*s;cyl(bx,by,bz,.1*s,.03*s,1.6*s,4,dark,[Math.cos(a)*1.4*s,Math.sin(a)*1.4*s])}}
  else if(t.k===6){for(let i=0;i<3;i++){const a=rot[i]*6.283,d=i?.55*s:0,bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,by=hAt(bx,bz)-.1,f=1+i*.12;cone(bx,by,bz,(.75-i*.12)*s,(1.05-i*.15)*s,6,[lv[0]*f,lv[1]*f,lv[2]*f],3,rot[i]*3)}
   if(t.berry)for(let i=0;i<4;i++){const a=rot[i%3]*9+i*1.7;cone(x+Math.cos(a)*.42*s,y+.5*s+(i%2)*.2,z+Math.sin(a)*.42*s,.07,.1,4,[.85,.12,.15],0,0)}}
  else{cyl(x,y,z,.22*s,.14*s,1.8*s,5,trunkC);cone(x,y+1.2*s,z,1.5*s,2.6*s,6,lv,5,rot[0]);cone(x,y+2.8*s,z,1.0*s,2.2*s,6,lv,7,rot[1])}}
 return g}
function streamForest(px,pz,budget){const R1=340,R2=440;let built=0;
 for(const[k,o]of TREEGEO){const cx=Math.floor(k/100)*TCS-WS+TCS/2,cz=(k%100)*TCS-WS+TCS/2;if(Math.hypot(cx-px,cz-pz)>R2){unobj(o);freeGeo(o.geo);TREEGEO.delete(k)}}
 const ci=Math.floor((px+WS)/TCS),cj=Math.floor((pz+WS)/TCS),want=[];
 for(let i=ci-4;i<=ci+4;i++)for(let j=cj-4;j<=cj+4;j++){const k=i*100+j;if(TREEGEO.has(k)||!TCH.has(k))continue;const cx=i*TCS-WS+TCS/2,cz=j*TCS-WS+TCS/2,d=Math.hypot(cx-px,cz-pz);if(d<R1)want.push([d,k,cx,cz])}
 want.sort((a,b)=>a[0]-b[0]);for(const[d,k,cx,cz]of want){if(built>=budget)break;const g=treeChunkGeo(TCH.get(k));if(g.P.length/3>65000)continue;{const o=obj(geo(g),{shade:.75,pos:[cx,0,cz],cull:310});o.ow=1;TREEGEO.set(k,o)}built++}
 return built}
// the Forgotten Knight statue (uploaded model, simplified) on the plaza pedestal
function buildKnight(TX){const bin=atob(KNB),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);const buf=u8.buffer,M=mtrs([10,.9,50],[0,-PI/2,0]);
 for(const gr of KND.groups){const g={P:new Float32Array(buf,gr.P[0],gr.P[1]),N:new Float32Array(buf,gr.N[0],gr.N[1]),U:new Float32Array(buf,gr.U[0],gr.U[1]),I:new Uint16Array(buf,gr.I[0],gr.I[1]),C:new Float32Array(gr.nv*3).fill(1),W:new Float32Array(gr.nv)};
  obj(geo(g),{M,tex:TX['k_'+gr.name],pos:[10,0,50],cull:140,shade:.9})}}
