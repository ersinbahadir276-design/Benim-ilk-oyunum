// ===================== dungeons: separate underground maps — floors, traps, puzzles, secret rooms, lore, bosses =====================
// Each dungeon is its own map (placed outside the overworld at DOX, hidden with the world when DUN.on). A floor is a
// grid of 3 m cells generated from a fixed seed: rooms joined by corridors, a sealed door before the stairs (opened by
// that floor's puzzle), traps in corridors, a secret room behind a cracked wall, chests, urns and lore tablets.
// The last floor ends in a boss arena; the boss is gone for good once beaten. Tablets from all three dungeons
// together tell one story («Kara Taç'ın Sırrı»).
const DC=3,DWH=4.2,DOX=2600,DOZ=0,DY=-30;
const DUNS={
 crypt:{id:'crypt',n:'Unutulmuş Mezar',x:-296,z:146,lv:4,floors:2,theme:'crypt',seed:101,boss:'boneking',puzzles:['rune','brazier'],
  mobs:[['skel','skel','skelA'],['skel','skelS'],['rat','rat','rat','rat'],['ghoul','ghoul'],['skel','skel','ghoul']],deep:[['skelS','skmage','skel'],['knight'],['ghoul','ghoul','ghoul'],['skelA','skelA','skelS']]},
 cave:{id:'cave',n:'Örümcek İni',x:-782,z:612,lv:10,floors:3,theme:'cave',seed:202,boss:'brood',puzzles:['brazier','plates','rune'],
  mobs:[['spider','spider'],['spiderling','spiderling','spiderling','spiderling','spiderling'],['rat','rat','rat','rat'],['ghoul','spider'],['spider','spiderling','spiderling']],deep:[['spider','spider','spider'],['golem'],['ghoul','ghoul','spider'],['skmage','spider']]},
 temple:{id:'temple',n:'Mühürlü Tapınak',x:44,z:-608,lv:15,floors:3,theme:'temple',seed:303,boss:'keeper',puzzles:['plates','rune','brazier'],
  mobs:[['golem'],['knight','skelS'],['skmage','skel','skelA'],['ghoul','ghoul','ghoul'],['knight']],deep:[['knight','knight'],['golem','skmage'],['skelS','skelS','skmage'],['golem']]},
 swamp:{id:'swamp',n:'Bataklık Tapınağı',x:560,z:560,lv:12,floors:3,theme:'swamp',seed:505,boss:'serpent',puzzles:['brazier','rune','plates'],
  mobs:[['ghoul','ghoul','rat'],['spider','spiderling','spiderling'],['skmage','skel'],['rat','rat','rat','ghoul'],['ghoul','skelA']],deep:[['ghoul','ghoul','ghoul'],['skmage','spider'],['knight','ghoul'],['spider','spider','skmage']]},
 citadel:{id:'citadel',n:'Kül Kale',x:-1880,z:-1880,lv:22,floors:5,theme:'citadel',seed:606,boss:'azgal',puzzles:['rune','plates','brazier'],
  mobs:[['knight','knight'],['golem','skmage'],['skelS','skelS','skelA','skmage'],['knight','ghoul','ghoul'],['golem','knight']],deep:[['knight','knight','skmage'],['golem','golem'],['knight','knight','knight'],['skmage','skmage','golem']]},
 // v26: the SHADOW TOWER in the snowy range — five floors, the layout changes every day (random floors), a mix of every horror below
 tower:{id:'tower',n:'Gölge Kulesi',x:-780,z:-985,lv:19,floors:5,theme:'tower',seed:404,daily:1,boss:'keeper',puzzles:['rune','plates','brazier'],
  mobs:[['knight','skmage'],['golem','skelA'],['ghoul','ghoul','spider'],['skelS','skelS','skelA'],['spider','spider','skmage']],deep:[['knight','knight','skmage'],['golem','golem'],['ghoul','ghoul','ghoul','ghoul'],['knight','golem']]}};
const THEME={crypt:{fl:[.3,.29,.28],wa:[.34,.32,.3],moss:[.2,.27,.16],fog:[.012,.012,.02],sun:[.33,.33,.42]},
 cave:{fl:[.22,.19,.16],wa:[.28,.24,.2],moss:[.25,.22,.3],fog:[.016,.012,.014],sun:[.33,.3,.34]},
 temple:{fl:[.36,.35,.4],wa:[.4,.39,.45],moss:[.5,.42,.2],fog:[.01,.014,.024],sun:[.34,.36,.46]},
 swamp:{fl:[.2,.24,.17],wa:[.24,.3,.2],moss:[.3,.45,.2],fog:[.012,.02,.012],sun:[.28,.36,.28]},
 citadel:{fl:[.24,.18,.17],wa:[.3,.2,.18],moss:[.5,.2,.1],fog:[.03,.01,.008],sun:[.42,.26,.22]},
 tower:{fl:[.26,.25,.3],wa:[.3,.28,.36],moss:[.35,.2,.45],fog:[.014,.01,.022],sun:[.3,.28,.4]}};
const GLYPH=[['☾','Ay'],['◉','Göz'],['♛','Taç'],['✦','Yıldız']];
const LORE={
 crypt0:['Mezar Bekçisinin Notu','«Kral Aldric\'in emri: ölüleri yedi kat toprağın altına gömün. Hiçbiri taç takmış olarak gömülmesin. Hiçbiri.»'],
 crypt1:['Yırtık Günlük','«Kemiklerin arasında bir taç buldum. Takan kral değildi; taç onu seçmişti. O gece ölü kalktı, kılıcını aldı ve bana adımla seslendi.»'],
 crypt2:['Kemik Mühür','«Üç mühür vardır: Kemik, Ağ ve Rün. Üçü de kırılırsa Kara Taç uyanır ve kendine yeni bir baş arar.»'],
 cryptS:['Duvara Kazınmış','«Bekçiler mührü korumak için ölmedi. Mührün içine gömüldüler. Sesleri duyuyorsan geç kaldın.»'],
 cave0:['Ağa Takılmış Mektup','«Örümcekler buraya kendiliğinden gelmedi. Biri onları besliyor. Ağların içinde krallık askerlerinin zırhları var — mühürleri bunlar mı koruyacaktı?»'],
 cave1:['Ebenin Defteri','«Soluk yüzlü bir avcı bana bir yumurta verdi, \"Kızına iyi bak\" dedi. Benim kızım yoktu. Ertesi sabah aynada kendimi tanımadım.»'],
 cave2:['Ağ Mühür','«Ana ölürse Ağ Mühür kırılır. Soluk Avcı bunu biliyor; bekliyor. Bizi kullanıp kendi elini kirletmiyor.»'],
 caveS:['Kraliçe\'nin Askeri','«Kraliçe\'nin askerleri de mühürleri arıyor — ama kırmak için değil, korumak için. Bir iblis neden mühür korur?»'],
 temple0:['Tapınak Kapısı','«Bu tapınak Kara Taç\'ı hapsetmek için yapıldı. Taç, takan herkesi yavaş yavaş bir iblise çevirir.»'],
 temple1:['Silinmiş İsim','«Yüzyıllar önce bir rahibe tacı bilerek taktı; iblisleri kuzeye sürmek için. Adı her taştan kazındı. Krallık ona sonradan \"Şeytan Kraliçe\" dedi.»'],
 temple2:['Rün Mühür','«Taç onu yiyor. Mühürler kırılırsa taç tamamen uyanır, Kraliçe artık kendisi olmaz. Mühürleri kıran Soluk Avcı, tacın ilk sahibi.»'],
 templeS:['Son Satır','«Kraliçe\'nin kızı mühürleri yeniden bağlayabilir. Zincirlerinin sebebi bu. Onu zincirleyen, kendi annesi değildi.»']};
const DLIGHT=new Float32Array(16),DLIGHTC=new Float32Array(12);
// ---------------------------------------------------------------- grid queries (used by hAt / collide / los / inBuilding)
const dSolid=c=>c===0||c===2||c===4;
function dCell(x,z){return[Math.floor((x-DUN.ox)/DC),Math.floor((z-DUN.oz)/DC)]}
function dAt(i,j){return i<0||j<0||i>=DUN.W||j>=DUN.H?0:DUN.g[j*DUN.W+i]}
const dCX=i=>DUN.ox+(i+.5)*DC,dCZ=j=>DUN.oz+(j+.5)*DC;
function dunH(x,z){return DUN.y}
function dunSolidAt(x,z,m){const[i,j]=dCell(x,z);if(dSolid(dAt(i,j)))return true;if(m){for(const[a,b]of[[m,0],[-m,0],[0,m],[0,-m]]){const c=dCell(x+a,z+b);if(dSolid(dAt(c[0],c[1])))return true}}return false}
function dunCollide(x,z,rad){const[ci,cj]=dCell(x,z);
 for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const i=ci+a,j=cj+b;if(!dSolid(dAt(i,j)))continue;const x0=DUN.ox+i*DC,z0=DUN.oz+j*DC,x1=x0+DC,z1=z0+DC,nx=cl(x,x0,x1),nz=cl(z,z0,z1),dx=x-nx,dz=z-nz,d2=dx*dx+dz*dz;
  if(d2<rad*rad){if(d2>1e-8){const d=Math.sqrt(d2);x=nx+dx/d*rad;z=nz+dz/d*rad}else{const l=x-x0,r=x1-x,u=z-z0,dn=z1-z,m=Math.min(l,r,u,dn);if(m===l)x=x0-rad;else if(m===r)x=x1+rad;else if(m===u)z=z0-rad;else z=z1+rad}}}
 for(const c of DUN.circ){const dx=x-c.x,dz=z-c.z,rr2=c.r+rad,d2=dx*dx+dz*dz;if(d2<rr2*rr2&&d2>1e-8){const d=Math.sqrt(d2);x=c.x+dx/d*rr2;z=c.z+dz/d*rr2}}
 return[x,z]}
function dunLos(ax,az,bx,bz){const L=Math.hypot(bx-ax,bz-az),n=Math.ceil(L/.5);for(let s=1;s<n;s++){const t=s/n,c=dCell(ax+(bx-ax)*t,az+(bz-az)*t);if(dSolid(dAt(c[0],c[1])))return false}return true}
// ---------------------------------------------------------------- floor generator
function genFloor(D,fl){const R=mkRng(D.seed*977+fl*131+7),ri=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)],last=fl===D.floors-1;
 const W=34,H=34,g=new Uint8Array(W*H),I=(i,j)=>j*W+i,rooms=[];
 const fits=(x,y,w,h)=>{if(x<2||y<2||x+w>W-2||y+h>H-2)return false;for(const r of rooms)if(x<r.x+r.w+2&&x+w+2>r.x&&y<r.y+r.h+2&&y+h+2>r.y)return false;return true};
 if(last){const w=11,h=11,x=R()<.5?2:W-w-2,y=ri(2,H-h-2);rooms.push({x,y,w,h,boss:1})}
 for(let k=0;k<600&&rooms.length<(last?10:11);k++){const w=ri(4,7),h=ri(4,7),x=ri(2,W-w-2),y=ri(2,H-h-2);if(fits(x,y,w,h))rooms.push({x,y,w,h})}
 for(const r of rooms){r.cx=Math.floor(r.x+r.w/2);r.cy=Math.floor(r.y+r.h/2);for(let j=r.y;j<r.y+r.h;j++)for(let i=r.x;i<r.x+r.w;i++)g[I(i,j)]=1}
 const inR=(r,i,j)=>i>=r.x&&i<r.x+r.w&&j>=r.y&&j<r.y+r.h;
 // end room: the boss arena, or the room farthest from the start
 let start,end;if(last){end=rooms[0];start=rooms.slice(1).sort((a,b)=>Math.hypot(b.cx-end.cx,b.cy-end.cy)-Math.hypot(a.cx-end.cx,a.cy-end.cy))[0]}
 else{start=rooms[0];end=rooms.slice(1).sort((a,b)=>Math.hypot(b.cx-start.cx,b.cy-start.cy)-Math.hypot(a.cx-start.cx,a.cy-start.cy))[0]}
 const forbid=(i,j)=>i>=end.x-1&&i<=end.x+end.w&&j>=end.y-1&&j<=end.y+end.h;
 const carve=(a,b,avoid)=>{const prev=new Int32Array(W*H).fill(-1),q=[I(a.cx,a.cy)];prev[q[0]]=q[0];let goal=I(b.cx,b.cy),found=false;
  const dirs=R()<.5?[[1,0],[-1,0],[0,1],[0,-1]]:[[0,1],[0,-1],[1,0],[-1,0]];
  for(let h=0;h<q.length;h++){const c=q[h];if(c===goal){found=true;break}const ci=c%W,cj=(c-ci)/W;
   for(const[dx,dy]of dirs){const i=ci+dx,j=cj+dy;if(i<1||j<1||i>W-2||j>H-2)continue;const k=I(i,j);if(prev[k]>=0)continue;if(avoid&&forbid(i,j)&&!inR(b,i,j)&&!inR(a,i,j))continue;prev[k]=c;q.push(k)}}
  if(!found)return null;const path=[];for(let c=goal;c!==prev[c];c=prev[c])path.push(c);for(const c of path)if(!g[c])g[c]=1;return path.reverse()};
 const others=rooms.filter(r=>r!==end),conn=[start];
 while(conn.length<others.length){let best=null,bd=1e9,from=null;for(const r of others){if(conn.includes(r))continue;for(const c of conn){const d=Math.hypot(r.cx-c.cx,r.cy-c.cy);if(d<bd){bd=d;best=r;from=c}}}carve(from,best,true);conn.push(best)}
 for(let k=0;k<2&&others.length>3;k++){const a=pick(others),b=pick(others);if(a!==b)carve(a,b,true)}
 let near=null,nd=1e9;for(const c of others){const d=Math.hypot(end.cx-c.cx,end.cy-c.cy);if(d<nd){nd=d;near=c}}
 const ep=carve(near,end,false);let door=null;if(ep){for(let k=ep.length-1;k>=0;k--){const c=ep[k],ci=c%W,cj=(c-ci)/W;if(!inR(end,ci,cj)){door=[ci,cj];break}}}
 if(door)g[I(door[0],door[1])]=2;
 // reachable with the door closed
 const reach=new Uint8Array(W*H),q=[I(start.cx,start.cy)];reach[q[0]]=1;for(let h=0;h<q.length;h++){const c=q[h],ci=c%W,cj=(c-ci)/W;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=I(ci+dx,cj+dy);if(!reach[k]&&g[k]===1){reach[k]=1;q.push(k)}}}
 const live=others.filter(r=>r!==start&&reach[I(r.cx,r.cy)]);
 const corridor=[];for(let j=1;j<H-1;j++)for(let i=1;i<W-1;i++)if(g[I(i,j)]===1&&reach[I(i,j)]&&!rooms.some(r=>inR(r,i,j)))corridor.push([i,j]);
 // secret room behind a cracked wall
 let secret=null;for(let k=0;k<120&&!secret;k++){const r=pick(live.length?live:others);const side=ri(0,3),dx=[1,-1,0,0][side],dy=[0,0,1,-1][side];
  const wi=dx>0?r.x+r.w:dx<0?r.x-1:ri(r.x+1,r.x+r.w-2),wj=dy>0?r.y+r.h:dy<0?r.y-1:ri(r.y+1,r.y+r.h-2);const ci=wi+dx*2,cj=wj+dy*2;
  let ok=ci>2&&cj>2&&ci<W-3&&cj<H-3;for(let a=-2;a<=2&&ok;a++)for(let b=-2;b<=2&&ok;b++){const i=ci+a,j=cj+b;if(Math.abs(i-wi)+Math.abs(j-wj)===0)continue;if(i<1||j<1||i>W-2||j>H-2||g[I(i,j)])ok=false}
  if(ok&&g[I(wi,wj)]===0){for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)g[I(ci+a,cj+b)]=1;g[I(wi,wj)]=4;secret={wi,wj,ci,cj,dx,dy}}}
 const roomCells=(r,margin)=>{const out=[];for(let j=r.y+margin;j<r.y+r.h-margin;j++)for(let i=r.x+margin;i<r.x+r.w-margin;i++)out.push([i,j]);return out};
 const used=new Set([I(start.cx,start.cy),I(end.cx,end.cy)]);const take=(r,m=1)=>{const c=roomCells(r,m).filter(c=>!used.has(I(c[0],c[1])));if(!c.length)return null;const p=pick(c);used.add(I(p[0],p[1]));return p};
 // floor puzzle
 const pz=D.puzzles[fl%D.puzzles.length],puzzle={kind:pz,items:[]},pool=live.slice();const pr=()=>pool.length?pool.splice(Math.floor(R()*pool.length),1)[0]:pick(live.length?live:[start]);
 if(pz==='rune'){const r=pr(),n=fl>0?4:3,order=GLYPH.slice(0,n).map((_,i)=>i).sort(()=>R()-.5);puzzle.order=order;for(let k=0;k<n;k++){const c=take(r)||take(start);puzzle.items.push({k:'rune',i:c[0],j:c[1],gl:k})}const hr=pr(),c=take(hr)||take(start);puzzle.hint={i:c[0],j:c[1]}}
 else if(pz==='brazier'){for(let k=0;k<4;k++){const r=pr(),c=take(r)||take(start);puzzle.items.push({k:'brazier',i:c[0],j:c[1]})}}
 else{for(let k=0;k<3;k++){const r=pr(),c=take(r)||take(start);puzzle.items.push({k:'plate',i:c[0],j:c[1]})}}
 // chests, urns, lore, traps
 const chests=[];const dead=live.filter(r=>r!==start).sort(()=>R()-.5);for(let k=0;k<Math.min(2,dead.length);k++){const c=take(dead[k]);if(c)chests.push({i:c[0],j:c[1],tier:2+fl})}
 const urns=[];for(const r of live)for(let k=0;k<ri(0,3);k++){const c=take(r,0);if(c)urns.push({i:c[0],j:c[1]})}
 const loreR=pick(live.length?live:[start]),lc=take(loreR)||take(start);const lore={i:lc[0],j:lc[1],id:D.id+fl};
 const traps=[];for(const c of corridor){const k=I(c[0],c[1]);if(door&&Math.abs(c[0]-door[0])+Math.abs(c[1]-door[1])<2)continue;if(R()<.14)traps.push({k:'spike',i:c[0],j:c[1],ph:R()*3})}
 for(let k=0;k<2&&corridor.length;k++){const c=pick(corridor);if(!traps.some(t=>t.i===c[0]&&t.j===c[1]))traps.push({k:'plateArrow',i:c[0],j:c[1]})}
 if(D.theme!=='cave')for(const r of live.slice(0,2)){for(let k=0;k<2;k++){const c=take(r,1);if(c)traps.push({k:'vent',i:c[0],j:c[1],ph:R()*3})}}
 // monsters: one group per live room, a few rats in corridors; deeper floors use the deeper pool
 const spawns=[];for(const r of live){const grp=pick(fl>0&&R()<.6?D.deep:D.mobs);const sleep=R()<.35;for(const t of grp){const c=take(r,0)||[r.cx,r.cy];spawns.push({t,i:c[0],j:c[1],grp:'r'+rooms.indexOf(r),sleep})}}
 if(corridor.length)for(let k=0;k<2;k++){const c=pick(corridor);spawns.push({t:D.theme==='cave'?'spiderling':'rat',i:c[0],j:c[1],grp:'c'+k})}
 const torches=[];for(const r of rooms){const nT=r.boss?8:ri(2,3);for(let k=0;k<nT;k++){const side=k%4,dx=[1,-1,0,0][side],dy=[0,0,1,-1][side],i=dx>0?r.x+r.w-1:dx<0?r.x:ri(r.x,r.x+r.w-1),j=dy>0?r.y+r.h-1:dy<0?r.y:ri(r.y,r.y+r.h-1);if(dSolidG(g,W,H,i+dx,j+dy))torches.push({i,j,dx,dy})}}
 return{W,H,g,rooms,start,end,door,secret,puzzle,chests,urns,lore,traps,spawns,torches,last,R}}
function dSolidG(g,W,H,i,j){return i<0||j<0||i>=W||j>=H||dSolid(g[j*W+i])}
// ---------------------------------------------------------------- geometry
function dBuilder(){const B={g:G(),list:[],add(){if(B.g.P.length/3>58000)B.flush()},flush(o={}){if(B.g.I.length){const ob=obj(geo(B.g),Object.assign({shade:1,pos:[DUN.ox+DUN.W*DC/2,0,DUN.oz+DUN.H*DC/2]},o));ob.dun=1;B.list.push(ob)}B.g=G()}};return B}
function dQuad(B,o,u,v,nu,nv,cf){B.add();const g=B.g,b0=g.P.length/3,n=vnorm(vcross(u,v));
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const p=[o[0]+u[0]*i/nu+v[0]*j/nv,o[1]+u[1]*i/nu+v[1]*j/nv,o[2]+u[2]*i/nu+v[2]*j/nv];g.P.push(p[0],p[1],p[2]);g.N.push(n[0],n[1],n[2]);const c=cf(p,n);g.C.push(c[0],c[1],c[2]);g.U.push(0,0);g.W.push(0)}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=b0+j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;g.I.push(a,b,c,b,d,c)}}
const dHash=(a,b,c=0)=>{let h=Math.imul(a*73856093^b*19349663^c*83492791,0x5bd1e995);h^=h>>>13;return((h>>>0)%1000)/1000};
function dWallCol(p,n,T){const along=Math.abs(n[0])>.5?p[2]:p[0],row=Math.floor((p[1]-DUN.y)/.62),bx=Math.floor((along+(row%2)*.55)/1.1),h=dHash(bx,row,Math.floor(along/40)),ao=.55+.45*sst(0,1.6,p[1]-DUN.y),top=1-sst(DWH-.8,DWH,p[1]-DUN.y)*.5;
 const mo=dHash(bx+7,row+3)<.18&&p[1]-DUN.y<1.6?1:0,c=mix3(T.wa,T.moss,mo*.6);const f=(.78+h*.34)*ao*top;return[c[0]*f,c[1]*f,c[2]*f]}
function dFloorCol(p,T){const tx=Math.floor((p[0]-DUN.ox)/1.5),tz=Math.floor((p[2]-DUN.oz)/1.5),h=dHash(tx,tz,5),f=.75+h*.35;return[T.fl[0]*f,T.fl[1]*f,T.fl[2]*f]}
function buildFloorGeo(F,T){const B=dBuilder(),y=DUN.y;
 for(let j=0;j<F.H;j++)for(let i=0;i<F.W;i++){const c=F.g[j*F.W+i];if(c===0)continue;const x0=DUN.ox+i*DC,z0=DUN.oz+j*DC;
  if(!(F.downCell&&F.downCell[0]===i&&F.downCell[1]===j))dQuad(B,[x0,y,z0],[0,0,DC],[DC,0,0],3,3,p=>{const k=F.trapCells&&F.trapCells.has(j*F.W+i);const c2=dFloorCol(p,T);return k?[c2[0]*.55,c2[1]*.55,c2[2]*.6]:c2});
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+dx,nj=j+dy,nc=dSolidG(F.g,F.W,F.H,ni,nj)&&!(ni>=0&&nj>=0&&ni<F.W&&nj<F.H&&(F.g[nj*F.W+ni]===2||F.g[nj*F.W+ni]===4));if(!nc)continue;
   // the wall face of the solid neighbour, facing into this cell
   const n=[-dx,0,-dy],u=[n[2]*DC,0,-n[0]*DC],cx=x0+DC/2+dx*DC/2,cz=z0+DC/2+dy*DC/2,o=[cx-u[0]/2,y,cz-u[2]/2];dQuad(B,o,u,[0,DWH,0],3,5,(p,nn)=>dWallCol(p,nn,T))}}
 // dark wall tops so the walls read as solid rock from above
 for(let j=0;j<F.H;j++)for(let i=0;i<F.W;i++){if(!dSolid(F.g[j*F.W+i])||F.g[j*F.W+i]!==0)continue;let edge=false;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]])if(!dSolidG(F.g,F.W,F.H,i+dx,j+dy))edge=true;if(!edge)continue;
  const x0=DUN.ox+i*DC,z0=DUN.oz+j*DC;dQuad(B,[x0,y+DWH,z0],[0,0,DC],[DC,0,0],1,1,()=>[T.wa[0]*.18,T.wa[1]*.18,T.wa[2]*.18])}
 B.flush();return B.list}
// small decor helpers (into one merged mesh)
function dCyl(B,x,y,z,r0,r1,h,seg,col){B.add();const g=B.g,o=g.P.length/3;for(let j=0;j<2;j++)for(let k=0;k<=seg;k++){const a=k/seg*2*PI,c=Math.cos(a),s=Math.sin(a),r=j?r1:r0;g.P.push(x+c*r,y+j*h,z+s*r);g.N.push(c,0,s);const f=j?.85:.7;g.C.push(col[0]*f,col[1]*f,col[2]*f);g.U.push(0,0);g.W.push(0)}
 for(let k=0;k<seg;k++){const a=o+k,b=a+1,c=o+seg+1+k,d=c+1;g.I.push(a,c,b,b,c,d)}const t=g.P.length/3;g.P.push(x,y+h,z);g.N.push(0,1,0);g.C.push(col[0],col[1],col[2]);g.U.push(0,0);g.W.push(0);for(let k=0;k<seg;k++)g.I.push(t,o+seg+1+k+1,o+seg+1+k)}
function dBox(B,x0,y0,z0,x1,y1,z1,col,top){B.add();box(B.g,x0,y0,z0,x1,y1,z1,col,top)}
function dCone(B,x,y,z,r,h,seg,col){B.add();const g=B.g,o=g.P.length/3;g.P.push(x,y+h,z);g.N.push(0,1,0);g.C.push(col[0]*1.1,col[1]*1.1,col[2]*1.1);g.U.push(0,0);g.W.push(0);
 for(let k=0;k<=seg;k++){const a=k/seg*2*PI,c=Math.cos(a),s=Math.sin(a),n=vnorm([c,r/h,s]);g.P.push(x+c*r,y,z+s*r);g.N.push(n[0],n[1],n[2]);g.C.push(col[0]*.7,col[1]*.7,col[2]*.7);g.U.push(0,0);g.W.push(0);if(k)g.I.push(o,o+k+1,o+k)}}
// ---------------------------------------------------------------- dynamic pieces (flames, doors, spikes, glows)
let dGeo=null;
function dunGeoms(){if(dGeo)return;dGeo={};
 const fl=G();fl.P.push(0,.42,0,.11,0,0,0,0,.11,-.11,0,0,0,0,-.11,0,-.08,0);for(let i=0;i<6;i++){fl.N.push(0,1,0);fl.C.push(1,1,1);fl.U.push(0,0);fl.W.push(0)}fl.I.push(0,1,2,0,2,3,0,3,4,0,4,1,5,2,1,5,3,2,5,4,3,5,1,4);dGeo.flame=geo(fl);
 const sp=G();for(let a=0;a<3;a++)for(let b=0;b<3;b++){const x=(a-1)*.9,z=(b-1)*.9,o=sp.P.length/3;sp.P.push(x,1,z,x+.12,0,z,x,0,z+.12,x-.12,0,z,x,0,z-.12);for(let i=0;i<5;i++){sp.N.push(0,1,0);sp.C.push(.62,.6,.6);sp.U.push(0,0);sp.W.push(0)}sp.I.push(o,o+1,o+2,o,o+2,o+3,o,o+3,o+4,o,o+4,o+1)}
 dGeo.spikes=geo(sp);
 const dr=G();box(dr,-DC/2,0,-.12,DC/2,.18,.12,[.2,.2,.22]);box(dr,-DC/2,DWH-.3,-.12,DC/2,DWH,.12,[.2,.2,.22]);for(let k=0;k<9;k++){const x=-DC/2+.17+k*(DC-.34)/8;box(dr,x-.05,0,-.05,x+.05,DWH,.05,[.28,.27,.3])}for(const y of[1.3,2.6])box(dr,-DC/2,y,-.08,DC/2,y+.12,.08,[.24,.23,.26]);dGeo.door=geo(dr);
 const gl=G();box(gl,-.5,-.5,-.5,.5,.5,.5,[1,1,1]);dGeo.cube=geo(gl);
 const ring=G();for(let k=0;k<=32;k++){const a=k/32*2*PI,c=Math.cos(a),s=Math.sin(a);ring.P.push(c*.8,0,s*.8,c,0,s);ring.N.push(0,1,0,0,1,0);ring.C.push(1,1,1,1,1,1);ring.U.push(0,0,0,0);ring.W.push(0,0);if(k){const o=(k-1)*2;ring.I.push(o,o+2,o+1,o+1,o+2,o+3)}}dGeo.ring=geo(ring);
 const sh=G();for(let k=0;k<=12;k++){const a=k/12*2*PI,c=Math.cos(a),s=Math.sin(a);sh.P.push(c*.9,0,s*.9,c*.5,6,s*.5);sh.N.push(c,0,s,c,0,s);sh.C.push(1,1,1,1,1,1);sh.U.push(0,0,0,0);sh.W.push(0,0);if(k){const o=(k-1)*2;sh.I.push(o,o+2,o+1,o+1,o+2,o+3)}}dGeo.shaft=geo(sh);
 const urn=tube([[0,0,0],[0,.25,0],[0,.55,0],[0,.72,0],[0,.8,0]],{r:t=>t<.05?.16:.12+.17*Math.sin(Math.min(1,t*1.25)*PI)+(t>.9?.05:0),seg:10,n:10});tint(urn,[.62,.4,.26]);const rim=tube([[0,.78,0],[0,.83,0]],{r:()=>.15,seg:10,n:2});tint(rim,[.4,.26,.17]);dGeo.urn=geo(merge([urn,rim]))}
function dObj(ge,o){const ob=obj(ge,Object.assign({shade:.9,pos:[0,0,0],cull:60},o));ob.dun=1;DUN.objs.push(ob);return ob}
// ---------------------------------------------------------------- build a floor
function buildDunFloor(D,fl){dunGeoms();const F=genFloor(D,fl),T=THEME[D.theme],R=F.R;
 Object.assign(DUN,{W:F.W,H:F.H,g:F.g,y:DY,ox:DOX-F.W*DC/2,oz:DOZ-F.H*DC/2,F,circ:[],it:[],traps:[],torches:[],lights:[],seen:new Uint8Array(F.W*F.H),flow:new Int16Array(F.W*F.H),flowC:-1,objs:[]});
 const W=F.W,cx=i=>dCX(i),cz=j=>dCZ(j),y=DUN.y,pick=a=>a[Math.floor(R()*a.length)];
 if(!F.last)F.downCell=[F.end.cx,F.end.cy];F.trapCells=new Set(F.traps.filter(t=>t.k==='spike').map(t=>t.j*W+t.i));
 for(const o of buildFloorGeo(F,T))DUN.objs.push(o);
 const B=dBuilder();const stone=T.wa,dark=[T.wa[0]*.5,T.wa[1]*.5,T.wa[2]*.5],gold=[.7,.55,.2],bone=[.78,.74,.62];
 const occ=new Set();const mark=(i,j)=>occ.add(j*W+i);
 // stairs up (start) and down (end)
 {const i=F.start.cx,j=F.start.cy,x=cx(i),z=cz(j);mark(i,j);for(let k=0;k<5;k++)dBox(B,x-1.1,y,z-1.3+k*.5,x+1.1,y+.35+k*.42,z-.8+k*.5,stone,[stone[0]*1.1,stone[1]*1.1,stone[2]*1.1]);
  DUN.circ.push({x,z,r:1.1});const shaft=dObj(dGeo.shaft,{unlit:1,blend:1,noOff:1,shade:0,col:[.75,.85,1],pos:[x,0,z]});shaft.alpha=.13;shaft.M=mtrs([x,y,z+.6],[0,0,0]);DUN.it.push({k:'up',x,z,r:2.4})}
 if(!F.last){const i=F.end.cx,j=F.end.cy,x=cx(i),z=cz(j);mark(i,j);for(let k=0;k<6;k++)dBox(B,x-1.2,y-.45-k*.45,z-1.5+k*.5,x+1.2,y-k*.45,z+1.5,dark);dBox(B,x-1.5,y-3.2,z-1.5,x+1.5,y-3,z+1.5,[0,0,0]);
  for(const s of[-1,1])dBox(B,x+s*1.5-.15,y-3,z-1.5,x+s*1.5+.15,y+.1,z+1.5,stone);DUN.circ.push({x,z,r:1.2});DUN.it.push({k:'down',x,z,r:2.6})}
 // sealed door
 if(F.door){const[i,j]=F.door,x=cx(i),z=cz(j),hor=!dSolid(dAt(i-1,j))&&!dSolid(dAt(i+1,j));const ob=dObj(dGeo.door,{pos:[x,0,z],out:.01,outCol:[.04,.04,.05]});ob.M=mtrs([x,y,z],[0,hor?PI/2:0,0]);DUN.door={i,j,ob,open:0,t:0,x,z,yaw:hor?PI/2:0};
  if(F.last)DUN.door.boss=1}
 // secret wall: a full block that looks like the wall, with a few darker cracked bricks
 if(F.secret){const s=F.secret,x=cx(s.wi),z=cz(s.wj),SB=dBuilder();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=[dx,0,dy],u=[n[2]*DC,0,-n[0]*DC],ox=x+dx*DC/2,oz=z+dy*DC/2;
   dQuad(SB,[ox-u[0]/2,y,oz-u[2]/2],u,[0,DWH,0],3,5,(p,nn)=>{const c=dWallCol(p,nn,T),k=dHash(Math.floor(p[0]*3),Math.floor(p[1]*3),Math.floor(p[2]*3))<.12?.55:1;return[c[0]*k,c[1]*k*.97,c[2]*k*.95]})}
  SB.flush({shade:1});const ob=SB.list[0];ob.pos=[x,0,z];ob.cull=60;DUN.objs.push(ob);DUN.secret={i:s.wi,j:s.wj,ob,x,z,open:SYS.dsec&&SYS.dsec[D.id+fl]?1:0,hinted:0};
  if(DUN.secret.open){F.g[s.wj*W+s.wi]=5;ob.vis=false}}
 // torches
 for(const t of F.torches){const x=cx(t.i)+t.dx*(DC/2-.15),z=cz(t.j)+t.dy*(DC/2-.15);dBox(B,x-.05,y+1.7,z-.05,x+.05,y+2.4,z+.05,[.25,.17,.1]);dBox(B,x-.09,y+2.35,z-.09,x+.09,y+2.45,z+.09,[.2,.2,.22]);
  const f=dObj(dGeo.flame,{unlit:1,shade:0,col:[1.6,.75,.25],pos:[x,0,z]});DUN.torches.push({x,y:y+2.55,z,f,ph:R()*6})}
 // puzzle items
 const P2=F.puzzle;for(const it of P2.items){const x=cx(it.i),z=cz(it.j);mark(it.i,it.j);
  if(it.k==='rune'){dCyl(B,x,y,z,.42,.36,2.2,6,dark);DUN.circ.push({x,z,r:.5});const g=dObj(dGeo.cube,{pbr:0,unlit:1,shade:0,col:[.2,.25,.35],pos:[x,0,z]});g.M=mtrs([x,y+1.55,z],[0,0,0]);g.M[0]*=.82;g.M[5]*=.5;g.M[10]*=.82;
   DUN.it.push({k:'rune',x,z,r:2,gl:it.gl,glow:g,lit:0})}
  else if(it.k==='brazier'){dCyl(B,x,y,z,.18,.12,.9,6,[.2,.2,.22]);dCyl(B,x,y+.85,z,.25,.55,.35,8,[.3,.27,.25]);DUN.circ.push({x,z,r:.55});const f=dObj(dGeo.flame,{unlit:1,shade:0,col:[1.6,.7,.2],pos:[x,0,z]});f.vis=false;DUN.it.push({k:'brazier',x,z,r:2,f,lit:0})}
  else{const g=dObj(dGeo.cube,{shade:.9,col:[.45,.42,.4],pos:[x,0,z]});g.M=mtrs([x,y+.05,z],[0,0,0]);g.M[0]*=1.6;g.M[5]*=.12;g.M[10]*=1.6;DUN.it.push({k:'plate',x,z,r:1,ob:g,on:0})}}
 if(P2.hint){const x=cx(P2.hint.i),z=cz(P2.hint.j);mark(P2.hint.i,P2.hint.j);dBox(B,x-.55,y,z-.15,x+.55,y+1.5,z+.15,dark,stone);DUN.circ.push({x,z,r:.45});DUN.it.push({k:'hint',x,z,r:2})}
 DUN.puzzle={kind:P2.kind,order:P2.order||null,step:0,timer:0,solved:0};
 // chests, urns, lore tablet
 F.chests.forEach((c,n)=>{const x=cx(c.i),z=cz(c.j),key=D.id+fl+'c'+n;mark(c.i,c.j);dChest(B,x,z,y);DUN.circ.push({x,z,r:.6});DUN.it.push({k:'chest',x,z,r:2,key,tier:c.tier})});
 for(const u of F.urns){const x=cx(u.i)+(R()-.5)*1.4,z=cz(u.j)+(R()-.5)*1.4;const o=dObj(dGeo.urn,{shade:.9,col:[.8+R()*.3,.8+R()*.2,.8],pos:[x,0,z],out:.008,outCol:[.05,.04,.03]});const us=.85+R()*.4;o.M=mtrs([x,y,z],[0,R()*3,0]);for(const k of[0,1,2,4,5,6,8,9,10])o.M[k]*=us;DUN.it.push({k:'urn',x,z,r:0,ob:o})}
 {const x=cx(F.lore.i),z=cz(F.lore.j);mark(F.lore.i,F.lore.j);dBox(B,x-.5,y,z-.12,x+.5,y+1.35,z+.12,dark,stone);const g=dObj(dGeo.cube,{unlit:1,shade:0,col:[.35,.8,1],pos:[x,0,z]});g.M=mtrs([x,y+.9,z],[0,0,0]);g.M[0]*=.6;g.M[5]*=.5;g.M[10]*=.26;DUN.circ.push({x,z,r:.45});DUN.it.push({k:'tablet',x,z,r:2,id:F.lore.id})}
 if(F.secret){const s=F.secret,x=cx(s.ci),z=cz(s.cj);dChest(B,x+.8,z,y);DUN.it.push({k:'chest',x:x+.8,z,r:2,key:D.id+fl+'s',tier:4});DUN.circ.push({x:x+.8,z,r:.6});
  dBox(B,x-1.1,y,z-.12,x-.1,y+1.35,z+.12,dark,stone);const g=dObj(dGeo.cube,{unlit:1,shade:0,col:[1,.6,.3],pos:[x,0,z]});g.M=mtrs([x-.6,y+.9,z],[0,0,0]);g.M[0]*=.6;g.M[5]*=.5;g.M[10]*=.26;DUN.it.push({k:'tablet',x:x-.6,z,r:2,id:D.id+'S'})}
 // traps
 for(const t of F.traps){const x=cx(t.i),z=cz(t.j);if(t.k==='spike'){const o=dObj(dGeo.spikes,{shade:.9,pos:[x,0,z],out:.006,outCol:[.05,.05,.05]});DUN.traps.push({k:'spike',x,z,ob:o,ph:t.ph,st:0,hitDone:0})}
  else if(t.k==='vent'){mark(t.i,t.j);dCyl(B,x,y,z,.35,.3,.08,8,[.12,.11,.1]);const f=dObj(dGeo.flame,{unlit:1,shade:0,col:[1.7,.6,.15],pos:[x,0,z]});f.vis=false;DUN.traps.push({k:'vent',x,z,f,ph:t.ph,st:0})}
  else DUN.traps.push({k:'plateArrow',x,z,i:t.i,j:t.j,used:0})}
 // theme decor in rooms (kept off the centre line so paths stay open)
 for(const r of F.rooms){const n=r.boss?10:Math.floor(r.w*r.h/7);for(let k=0;k<n;k++){const i=r.x+Math.floor(R()*r.w),j=r.y+Math.floor(R()*r.h);if(occ.has(j*W+i)||(i===r.cx&&j===r.cy))continue;
   const wall=dSolid(dAt(i-1,j))||dSolid(dAt(i+1,j))||dSolid(dAt(i,j-1))||dSolid(dAt(i,j+1));const x=cx(i)+(R()-.5)*1.2,z=cz(j)+(R()-.5)*1.2;
   if(D.theme==='crypt'){if(wall&&R()<.5){mark(i,j);const rot=R()<.5;const hx=rot?.55:1.05,hz=rot?1.05:.55;dBox(B,x-hx,y,z-hz,x+hx,y+.75,z+hz,stone);dBox(B,x-hx-.06,y+.75,z-hz-.06,x+hx+.06,y+.9,z+hz+.06,dark);DUN.circ.push({x,z,r:.85})}
    else{for(let b=0;b<4;b++){const a=R()*6.28;dBox(B,x+Math.cos(a)*.3-.04,y,z+Math.sin(a)*.3-.25,x+Math.cos(a)*.3+.04,y+.06,z+Math.sin(a)*.3+.25,bone)}dCyl(B,x+.35,y,z,.1,.09,.2,6,bone)}}
   else if(D.theme==='cave'){if(R()<.55){mark(i,j);const h=1+R()*2.2;dCone(B,x,y,z,.35+R()*.3,h,7,[T.wa[0]*1.1,T.wa[1]*1.1,T.wa[2]*1.1]);DUN.circ.push({x,z,r:.45})}
    else{for(let b=0;b<5;b++){const a=R()*6.28,rr2=.15+R()*.15;dCyl(B,x+Math.cos(a)*.4,y,z+Math.sin(a)*.4,rr2,rr2*.7,rr2*1.4,7,[.82,.8,.72])}}}
   else{if(!wall&&R()<.4){mark(i,j);dBox(B,x-.4,y,z-.4,x+.4,y+DWH,z+.4,stone);dBox(B,x-.48,y+DWH-.5,z-.48,x+.48,y+DWH-.35,z+.48,gold);dBox(B,x-.5,y,z-.5,x+.5,y+.3,z+.5,dark);DUN.circ.push({x,z,r:.62})}
    else{dBox(B,x-.3,y,z-.3,x+.3,y+.5,z+.3,stone);dBox(B,x-.2,y+.5,z-.2,x+.2,y+1.1+R()*.6,z+.2,stone)}}}}
 if(F.last){const r=F.end,x=cx(r.cx),z=cz(r.cy),g=dObj(dGeo.ring,{unlit:1,blend:1,noOff:1,shade:0,col:[.9,.25,.15],pos:[x,0,z]});g.alpha=.55;g.M=mtrs([x,y+.03,z],[0,0,0]);for(const k of[0,5,10])g.M[k]*=k===5?1:7.5;DUN.arena={x,z,r,ring:g}}
 B.flush({shade:1});for(const o of B.list)DUN.objs.push(o);
 return F}
function dChest(B,x,z,y){dBox(B,x-.5,y,z-.32,x+.5,y+.5,z+.32,[.36,.22,.12],[.42,.27,.15]);dBox(B,x-.52,y+.5,z-.34,x+.52,y+.68,z+.34,[.3,.18,.1]);dBox(B,x-.06,y+.3,z+.32,x+.06,y+.55,z+.37,[.7,.55,.2]);for(const s of[-1,1])dBox(B,x+s*.45-.04,y,z-.34,x+s*.45+.04,y+.7,z+.34,[.6,.48,.2])}
// ---------------------------------------------------------------- enter / leave
let DFADE=null;
function dunFade(cb){if(!DFADE){DFADE=document.createElement('div');DFADE.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .45s;z-index:40';document.body.appendChild(DFADE)}
 DFADE.style.opacity=1;setTimeout(()=>{cb();setTimeout(()=>{DFADE.style.opacity=0},120)},window.__G&&__G.fastFade?0:470)}
function dunTitle(big,small){let e=document.getElementById('dtitle');if(!e){e=document.createElement('div');e.id='dtitle';e.style.cssText='position:fixed;left:0;right:0;top:30%;text-align:center;pointer-events:none;z-index:41;font-family:Georgia,serif;color:#e8d8b0;text-shadow:0 0 12px #000,0 2px 4px #000;transition:opacity .8s;opacity:0';document.body.appendChild(e)}
 e.innerHTML='<div style="font-size:30px;letter-spacing:6px">'+big+'</div><div style="font-size:15px;opacity:.85;margin-top:6px">'+small+'</div>';e.style.opacity=1;clearTimeout(e._t);e._t=setTimeout(()=>{e.style.opacity=0},2600)}
function clearDunFloor(){for(const o of DUN.objs){unobj(o);if(o.geo&&o.geo.own)freeGeo(o.geo)}DUN.objs=[];for(const m of MONS)monFree(m);MONS.length=0;DPROJ.length=0;for(const p of DPROJP)p.vis=false;
 for(let i=LOOT.length-1;i>=0;i--)if(LOOT[i].dun){unobj(LOOT[i].ob);LOOT.splice(i,1)}}
function enterDungeon(id,fl,arriveDown){const D=DUNS[id];if(D.daily)D.seed=404+Math.floor((GT.clock||0)/600)%97;/* random floors: the tower changes every in-game day */dunFade(()=>{if(DUN.on)clearDunFloor();else{SYS.dret=[P.x,P.z];DUN.ret=[D.x,D.z]}
  DUN.on=1;DUN.id=id;DUN.fl=fl;DUN.D=D;DUN.lv=D.lv+fl*2;const F=buildDunFloor(D,fl);spawnDunMonsters(D,F);
  const at=arriveDown&&!F.last?[dCX(F.end.cx)+2.2,dCZ(F.end.cy)+.2]:[dCX(F.start.cx),dCZ(F.start.cy)+2.6];const p=dunCollide(at[0],at[1],.5);
  P.x=p[0];P.z=p[1];P.y=DUN.y;P.vx=P.vz=0;P.air=false;P.lock=null;CAM.tx=P.x;CAM.tz=P.z;CAM.ty=P.y+1.5;
  SYS.dun=SYS.dun||{};SYS.dun.deep=SYS.dun.deep||{};SYS.dun.deep[id]=Math.max(SYS.dun.deep[id]||0,fl+1);if(SYS.guild)for(const c of SYS.guild.active)if(c.k==='delve'&&cDone(c)&&!c.noted){c.noted=1;note('[Lonca] «'+c.t+'» tamam — loncaya dön.','gold')}
  dunTitle(D.n.toUpperCase(),'Kat '+(fl+1)+' / '+D.floors+' · Sv.'+DUN.lv);note('[Sistem] '+D.n+' · Kat '+(fl+1)+(fl===0?' — her katın kapısı bir bilmeceyle açılır.':''),'gold');sfx.horn();save(P)})}
function leaveDungeon(quiet){if(!DUN.on)return;const D=DUN.D;clearDunFloor();DUN.on=0;DUN.boss=null;const r=DUN.ret||SYS.dret||[SPAWN[0],SPAWN[2]];
 if(!quiet){const p=collide(r[0]+2.5,r[1]+2.5,.5);P.x=p[0];P.z=p[1];P.y=hAt(P.x,P.z);P.air=false;CAM.tx=P.x;CAM.tz=P.z;streamForest(P.x,P.z,999);note('[Sistem] '+D.n+' arkanda kaldı.')}save(P)}
// ---------------------------------------------------------------- overworld entrances
const DENT=[];
function buildDunEntrances(){dunGeoms();for(const k in DUNS){const D=DUNS[k];clearTreesAt(D.x,D.z,10);let y=1e9;for(const[a,b]of[[-3,-3.5],[3,-3.5],[-3,2.5],[3,2.5],[0,0]])y=Math.min(y,hAt(D.x+a,D.z+b));const g=G(),T=D.theme;
  const st=T==='temple'?[.62,.6,.66]:T==='cave'?[.3,.27,.24]:[.4,.39,.37],dk=[st[0]*.55,st[1]*.55,st[2]*.55],blk=[0,0,0],gold=[.75,.6,.25],bone=[.8,.76,.64];
  box(g,-3.2,-2,-4,3.2,.25,2.6,dk,st);for(let s=0;s<3;s++)box(g,-1.3,.25-s*.0,1.0+s*.5,1.3,.25+(2-s)*.12,1.5+s*.5,st);
  if(T==='crypt'){// a mausoleum: thick walls, a stepped roof, a black doorway, skulls over the door
   box(g,-2.6,.25,-3.4,-1.05,3.4,.6,st);box(g,1.05,.25,-3.4,2.6,3.4,.6,st);box(g,-1.05,2.5,-3.4,1.05,3.4,.6,st);box(g,-2.6,.25,-3.4,2.6,3.4,-2.6,st);box(g,-1.05,.25,-2.6,1.05,2.5,.3,blk);
   box(g,-2.9,3.4,-3.7,2.9,3.75,.9,dk);box(g,-2.2,3.75,-3.3,2.2,4.1,.5,st);box(g,-1.2,4.1,-2.6,1.2,4.5,-.2,dk);for(const s of[-1,0,1])box(g,s*.6-.13,2.62,.6,s*.6+.13,2.9,.78,bone);
   for(const s of[-1,1]){box(g,s*2.75-.25,.25,.6,s*2.75+.25,3.4,1.1,st);box(g,s*2.75-.32,3.4,.5,s*2.75+.32,3.6,1.2,dk)}}
  else if(T==='cave'){// a hole in a rock outcrop, webs and old bones
   const R=mkRng(77);for(let n=0;n<14;n++){const a=-.2+n/13*(PI+.4),r=2.6+R()*.8,x=Math.cos(a)*r,z=-1.2-Math.sin(a)*1.6,h=1.5+R()*2.6,w=.7+R()*.6;box(g,x-w,.0,z-w,x+w,h,z+w,[st[0]*(.8+R()*.4),st[1]*(.8+R()*.4),st[2]*(.8+R()*.4)])}
   box(g,-2.4,.25,-3.8,2.4,3.6,-2.2,st);box(g,-1.4,.25,-2.4,1.4,2.4,.4,blk);box(g,-2.2,2.4,-2.4,2.2,3.4,.5,st);for(let n=0;n<6;n++){const x=-1.8+n*.7;box(g,x-.05,.25,1.2+(n%2)*.4,x+.3,.31,1.3+(n%2)*.4,bone)}
   for(const s of[-1,1]){const w=G();w.P.push(s*1.35,2.4,.45,s*.2,2.4,.45,s*1.35,1.1,.45);w.N.push(0,0,1,0,0,1,0,0,1);w.C.push(.85,.85,.82,.85,.85,.82,.85,.85,.82);w.U.push(0,0,0,0,0,0);w.W.push(0,0,0);w.I.push(0,1,2);const m=merge([g,w]);g.P=m.P;g.N=m.N;g.C=m.C;g.U=m.U;g.W=m.W;g.I=m.I}}
  else if(T==='tower'||T==='citadel'){// a black tower: five storeys tapering up, lit slit windows, a crown of spikes
   const tw=[.2,.19,.24],tr=[.12,.11,.15],gl=[.75,.4,1.3];for(let s=0;s<6;s++){const w=3.2-s*.38,y0=.25+s*4.6;box(g,-w,y0,-w-1.2,w,y0+4.6,w-1.2,s%2?tw:tr);box(g,-w-.2,y0+4.3,-w-1.4,w+.2,y0+4.6,w-1.0,tr);box(g,-.18,y0+1.8,w-1.21,.18,y0+3,w-1.15,gl)}
   box(g,-1.0,.25,1.95,1.0,2.6,2.05,blk);for(let k=0;k<6;k++){const a=k/6*2*PI;box(g,Math.cos(a)*1.2-.12,27.8,Math.sin(a)*1.2-1.32,Math.cos(a)*1.2+.12,30,Math.sin(a)*1.2-1.08,tr)}}
  else{// a white shrine with columns, a gold band and a sealed rune door that stands open
   box(g,-2.8,.25,-3.6,2.8,.55,1.0,st);for(const s of[-1,1])for(const zz of[.6,-1.4,-3.2]){box(g,s*2.4-.28,.55,zz-.28,s*2.4+.28,3.8,zz+.28,st);box(g,s*2.4-.36,3.5,zz-.36,s*2.4+.36,3.8,zz+.36,gold)}
   box(g,-3.0,3.8,-3.8,3.0,4.25,1.2,st);box(g,-2.6,4.25,-3.4,2.6,4.6,.8,gold);box(g,-2.0,4.6,-3.0,2.0,4.95,.4,st);box(g,-1.2,.55,-3.2,1.2,3.0,-2.6,st);box(g,-.9,.55,-2.62,.9,2.6,-2.5,blk);box(g,-1.6,.55,-2.8,-1.2,3.2,-2.4,dk);box(g,1.2,.55,-2.8,1.6,3.2,-2.4,dk)}
  const ob=obj(geo(g),{shade:1,M:mtrs([D.x,y,D.z],[0,0,0]),pos:[D.x,0,D.z],cull:240,out:.012,outCol:[.04,.04,.05]});ob.ow=1;addBox(D.x-2.9,D.z-3.8,D.x+2.9,D.z+.35,4);
  const gc=T==='cave'?[1.4,.25,.15]:T==='temple'?[.4,.9,1.6]:[.5,1.4,1.0],gl=obj(dGeo.cube,{unlit:1,shade:0,col:gc,pos:[D.x,0,D.z],cull:240});gl.M=mtrs([D.x,y+(T==='temple'?4.4:T==='cave'?2.9:3.05),D.z+(T==='temple'?.82:.7)],[0,0,PI/4]);gl.M[0]*=.32;gl.M[1]*=.32;gl.M[4]*=.32;gl.M[5]*=.32;gl.M[10]*=.05;gl.ow=1;
  const fl=[];for(const s of[-1,1]){const f=obj(dGeo.flame,{unlit:1,shade:0,col:T==='temple'?[.6,1,1.8]:[1.6,.7,.25],pos:[D.x,0,D.z],cull:200});f.ow=1;fl.push([f,D.x+s*1.7,y+1.6,D.z+1.15]);const b=G();box(b,-.06,-.6,-.06,.06,0,.06,[.25,.2,.15]);const bo=obj(geo(b),{shade:.9,M:mtrs([D.x+s*1.7,y+1.6,D.z+1.15],[0,0,0]),pos:[D.x,0,D.z],cull:200});bo.ow=1}
  DENT.push({D,ob,gl,fl})}}
function updateDunEntrances(t){for(const e of DENT){if(Math.hypot(e.D.x-P.x,e.D.z-P.z)>120)continue;for(const[f,x,y,z]of e.fl){const s=1+Math.sin(t*13+x)*.12;f.M=mtrs([x,y,z],[0,t*2,0]);f.M[0]*=s;f.M[5]*=s*1.3;f.M[10]*=s}}}
function clearTreesAt(x,z,r){for(const[k,list]of TCH){for(let i=list.length-1;i>=0;i--)if(Math.hypot(list[i].x-x,list[i].z-z)<r){list.splice(i,1);const o=TREEGEO.get(k);if(o){unobj(o);freeGeo(o.geo);TREEGEO.delete(k)}}}
 for(const[k,a]of treeGrid)for(let i=a.length-1;i>=0;i--)if(Math.hypot(a[i].x-x,a[i].z-z)<r)a.splice(i,1)}
function nearDunEntrance(){for(const e of DENT)if(Math.hypot(P.x-e.D.x,P.z-(e.D.z+1.8))<3.0)return e.D;return null}
// ---------------------------------------------------------------- interaction and prompts
function dunNearIt(){let b=null,bd=1e9;for(const it of DUN.it){if(!it.r)continue;const d=Math.hypot(P.x-it.x,P.z-it.z);if(d<it.r&&d<bd){bd=d;b=it}}return b}
function dunPrompt(){if(!DUN.on){const D=nearDunEntrance();return D?'ETKİLEŞ: zindana gir — '+D.n+' (Sv.'+D.lv+')':''}
 const it=dunNearIt();if(!it)return'';const D=DUN.D;
 switch(it.k){case'up':return DUN.fl===0?'ETKİLEŞ: zindandan çık':'ETKİLEŞ: yukarı çık (Kat '+DUN.fl+')';case'down':return'ETKİLEŞ: aşağı in (Kat '+(DUN.fl+2)+')';
  case'chest':return SYS.dchest&&SYS.dchest[it.key]?'':'ETKİLEŞ: sandığı aç';case'tablet':return'ETKİLEŞ: tableti oku';case'hint':return'ETKİLEŞ: taştaki yazıyı oku';
  case'rune':return DUN.puzzle.solved?'':'ETKİLEŞ: «'+GLYPH[it.gl][0]+'» rününe dokun';case'brazier':return it.lit?'':'ETKİLEŞ: mangalı yak';case'exit':return'ETKİLEŞ: mühür kapısından çık';default:return''}}
function dunInteract(){if(!DUN.on){const D=nearDunEntrance();if(!D)return false;if(SYS.lv<D.lv-3)note('[!] Tehlikeli: '+D.n+' Sv.'+D.lv+' (sen Sv.'+SYS.lv+')','red');enterDungeon(D.id,0);return true}
 const it=dunNearIt();if(!it)return false;const D=DUN.D;
 switch(it.k){
 case'up':if(DUN.fl===0)dunFade(()=>leaveDungeon());else enterDungeon(D.id,DUN.fl-1,true);return true;
 case'down':enterDungeon(D.id,DUN.fl+1);return true;
 case'exit':dunFade(()=>leaveDungeon());return true;
 case'chest':{SYS.dchest=SYS.dchest||{};if(SYS.dchest[it.key])return false;SYS.dchest[it.key]=1;sfx.chest();const lv=DUN.lv,items=[randomDrop(lv,Math.min(4,it.tier))];if(it.tier>=3)items.push(randomDrop(lv,Math.min(4,it.tier-1)));
  if(it.tier>=4&&Math.random()<.25)items.push(randomDrop(lv,5));dropLoot(it.x,it.z,items,Math.round(15*(1+.15*(lv-1))*it.tier));SYS.flasks=Math.min(SYS.flaskMax,SYS.flasks+1);note('[Sistem] Sandık açıldı · +1 iksir','gold');spawnSparks(it.x,DUN.y+.8,it.z,16,[1,.85,.4],3);save(P);return true}
 case'tablet':readLore(it.id);return true;
 case'hint':{const o=DUN.puzzle.order;showTablet('Taştaki Yazı',o?'«Kapı, rünlere bu sırayla dokunana açılır:  '+o.map(g=>GLYPH[g][0]+' '+GLYPH[g][1]).join('  →  ')+'»':'«Kapı sabırlıdır.»');return true}
 case'rune':{const Z=DUN.puzzle;if(Z.solved)return false;it.glow.col=[.4,1.1,1.6];it.lit=1;sfx.lock();if(Z.order[Z.step]===it.gl){Z.step++;if(Z.step>=Z.order.length)solvePuzzle()}
  else{Z.step=0;for(const r of DUN.it)if(r.k==='rune'){r.lit=0;r.glow.col=[.2,.25,.35]}note('[!] Yanlış sıra! Rünler söndü… ve bir şey uyandı.','red');CAM.shake=.5;sfx.roar(.5);dunAmbush(2)}return true}
 case'brazier':{if(it.lit)return false;it.lit=1;it.f.vis=true;sfx.fire();const n=DUN.it.filter(b=>b.k==='brazier'&&b.lit).length,tot=DUN.it.filter(b=>b.k==='brazier').length;note('[Sistem] Mangal yandı ('+n+'/'+tot+')');if(n>=tot)solvePuzzle();return true}}
 return false}
function solvePuzzle(){const Z=DUN.puzzle;if(Z.solved)return;Z.solved=1;openDunDoor();addXP(40+DUN.lv*6,P);note('[Sistem] Bilmece çözüldü! Mühürlü kapı açılıyor…','gold');sfx.rare()}
function openDunDoor(){const d=DUN.door;if(!d||d.open)return;d.open=1;d.t=0;DUN.g[d.j*DUN.W+d.i]=3;CAM.shake=Math.max(CAM.shake,.35);sfx.thud();DUN.flowC=-1}
function closeDunDoor(){const d=DUN.door;if(!d)return;d.open=0;d.t=0;DUN.g[d.j*DUN.W+d.i]=2;sfx.thud();DUN.flowC=-1}
// sword swings crack secret walls and smash urns
function dunSwing(kind){if(!DUN.on)return;const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),hx=P.x+fx*1.6,hz=P.z+fz*1.6;
 const s=DUN.secret;if(s&&!s.open&&Math.hypot(hx-s.x,hz-s.z)<DC*.5+1.3){s.hits=(s.hits||0)+(kind==='heavy'||kind==='jumpatk'?2:1);spawnSparks(hx,DUN.y+1.3,hz,8,[.7,.65,.6],3);
  if(s.hits>=3){s.open=1;s.ob.vis=false;DUN.g[s.j*DUN.W+s.i]=5;DUN.flowC=-1;SYS.dsec=SYS.dsec||{};SYS.dsec[DUN.id+DUN.fl]=1;CAM.shake=.6;sfx.break();for(let k=0;k<4;k++)spawnSparks(s.x,DUN.y+.5+k*.8,s.z,10,[.6,.55,.5],5);note('[Sistem] Gizli oda bulundu!','gold');addXP(30+DUN.lv*4,P);save(P)}
  else note('Duvar çatlıyor…')}
 for(const it of DUN.it){if(it.k!=='urn'||it.broken)continue;if(Math.hypot(hx-it.x,hz-it.z)<1.3){it.broken=1;it.ob.vis=false;sfx.break();spawnSparks(it.x,DUN.y+.5,it.z,12,[.6,.42,.3],3);const r=Math.random();
   if(r<.15){SYS.flasks=Math.min(SYS.flaskMax,SYS.flasks+1);note('Küpten bir iksir çıktı!','gold')}else if(r<.75)dropLoot(it.x,it.z,[],Math.round(3+DUN.lv*1.2));else if(r<.85)dropLoot(it.x,it.z,[randomDrop(DUN.lv,1)],0);else{note('[!] Küpün içinden bir şey fırladı!','red');spawnMon(DUN.D.theme==='cave'?'spiderling':'rat',it.x,it.z,{aware:1})}}}}
// ---------------------------------------------------------------- lore and the mystery
function showTablet(title,text){let e=document.getElementById('dtab');if(!e){e=document.createElement('div');e.id='dtab';e.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(86vw,460px);background:linear-gradient(#2a2620,#1a1714);border:2px solid #8a7550;border-radius:8px;padding:18px 20px;color:#e9dcbc;font-family:Georgia,serif;z-index:42;box-shadow:0 0 40px #000;font-size:15px;line-height:1.55';
  e.addEventListener('pointerdown',ev=>{ev.stopPropagation();e.style.display='none';GT.paused=false});document.body.appendChild(e)}
 e.innerHTML='<div style="color:#ffd27a;font-size:17px;margin-bottom:8px;letter-spacing:1px">'+title+'</div><div>'+text+'</div><div style="opacity:.6;font-size:12px;margin-top:12px;text-align:right">kapatmak için dokun</div>';e.style.display='block';GT.paused=true;sfx.chest()}
function readLore(id){const L=LORE[id]||['Silik Tablet','«…yazı okunamayacak kadar silinmiş.»'];SYS.lore=SYS.lore||{};const fresh=!SYS.lore[id];SYS.lore[id]=1;const n=Object.keys(SYS.lore).filter(k=>LORE[k]).length,tot=Object.keys(LORE).length;
 showTablet(L[0]+' <span style="opacity:.6;font-size:12px">('+n+'/'+tot+')</span>',L[1]);if(fresh){addXP(25,P);note('[Gizem] Kara Taç\'ın Sırrı: '+n+'/'+tot+' tablet','gold');
  if(n>=tot&&!SYS.mystery){SYS.mystery=1;giveItem(makeItem(null,Math.max(SYS.lv,15),5,'crown'));note('[Gizem çözüldü] Kara Taç\'ın Sırrı — Soluk Avcı\'nın amacı artık belli. Ödül: «Kara Taç Kırığı» (Mitik)','gold');sfx.rare()}}save(P)}
function mysteryHtml(){const L=SYS.lore||{},keys=Object.keys(LORE),n=keys.filter(k=>L[k]).length;let h='<div class="wt">GİZEM — KARA TAÇ\'IN SIRRI ('+n+'/'+keys.length+')</div>';
 for(const k in DUNS){const D=DUNS[k],deep=SYS.dun&&SYS.dun.deep&&SYS.dun.deep[k]||0,boss=SYS.dun&&SYS.dun.boss&&SYS.dun.boss[k];h+='<div class="qs'+(boss?' dn':'')+'"><b>'+(boss?'✔ ':'◆ ')+D.n+'</b> — Sv.'+D.lv+' · '+D.floors+' kat'+(deep?' · en derin: Kat '+deep:' · keşfedilmedi')+'</div>'}
 for(const k of keys)if(L[k])h+='<div class="qs"><b>'+LORE[k][0]+'</b> — '+LORE[k][1]+'</div>';if(n<keys.length)h+='<div class="qs" style="opacity:.7">'+(keys.length-n)+' tablet hâlâ karanlıkta. Gizli odalara bak: bazı duvarlar çatlak.</div>';return h}
// ---------------------------------------------------------------- per-frame: traps, puzzle plates, door, lights, explored map
function dunAmbush(n){const T=DUN.D.theme==='cave'?'spiderling':'skel';for(let k=0;k<n;k++){const a=Math.random()*6.28,p=dunCollide(P.x+Math.cos(a)*4,P.z+Math.sin(a)*4,.5);if(!dunSolidAt(p[0],p[1]))spawnMon(T,p[0],p[1],{aware:1,rise:1})}}
function updateDungeon(dt){const T=GT.clock;
 // explored cells for the radar map
 const[pi,pj]=dCell(P.x,P.z);for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const i=pi+a,j=pj+b;if(i>=0&&j>=0&&i<DUN.W&&j<DUN.H)DUN.seen[j*DUN.W+i]=1}
 dunFlow(pi,pj);
 // door animation
 const d=DUN.door;if(d){d.t=Math.min(1,d.t+dt*.9);const k=d.open?sst(0,1,d.t):1-sst(0,1,d.t);d.ob.M=mtrs([d.x,DUN.y-k*(DWH-.15),d.z],[0,d.yaw,0])}
 // boss arena: entering seals the gate behind you until the boss falls
 const A=DUN.arena;if(A&&DUN.boss&&!DUN.boss.dead&&!DUN.bossOn&&Math.hypot(P.x-A.x,P.z-A.z)<DC*4.2){DUN.bossOn=1;closeDunDoor();bossIntro(DUN.boss)}
 if(A)A.ring.alpha=DUN.bossOn&&DUN.boss&&!DUN.boss.dead?.35+.2*Math.sin(GT.time*3):0;
 // plates: step on all within 12 s
 const Z=DUN.puzzle;if(Z.kind==='plates'&&!Z.solved){let on=0;for(const it of DUN.it){if(it.k!=='plate')continue;if(!it.on&&Math.hypot(P.x-it.x,P.z-it.z)<1.1&&!P.air){it.on=1;sfx.lock();if(!Z.timer){Z.timer=12;note('[Sistem] Levha indi! 12 saniye içinde diğerlerini bul.','gold')}else note('[Sistem] Levha indi.')}
   if(it.on)on++;it.ob.col=it.on?[.3,.9,1.2]:[.45,.42,.4]}
  const tot=DUN.it.filter(i=>i.k==='plate').length;if(on>=tot)solvePuzzle();else if(Z.timer>0){Z.timer-=dt;if(Z.timer<=0){Z.timer=0;for(const it of DUN.it)if(it.k==='plate')it.on=0;note('[!] Süre doldu, levhalar yükseldi.','red');sfx.thud()}}}
 // secret wall hint: a cold draft when close
 const s=DUN.secret;if(s&&!s.open&&!s.hinted&&Math.hypot(P.x-s.x,P.z-s.z)<6.5){s.hinted=1;note('Bir yerden soğuk bir rüzgâr esiyor… bu duvar çatlak mı?','yel')}
 // traps
 for(const t of DUN.traps){
  if(t.k==='spike'){const u=(T+t.ph)%3.4,st=u<2?0:u<2.65?1:2;if(st===1)tele('circle',t.x,t.z,1.4,0,0,sst(2,2.4,u));if(st===2&&t.st!==2){t.hitDone=0;sfx.snap()}t.st=st;
   const k=st===2?sst(2.65,2.75,u)*(1-sst(3.25,3.4,u)):st===1?.12:0;t.ob.M=mtrs([t.x,DUN.y-1+k,t.z],[0,0,0]);t.ob.vis=k>0;
   if(st===2&&k>.6&&!t.hitDone){if(Math.abs(P.x-t.x)<DC/2&&Math.abs(P.z-t.z)<DC/2&&!P.air&&P.alive){t.hitDone=1;hitPlayer({src:{x:t.x,z:t.z,lv:DUN.lv},dmg:12,guard:30,dir:[P.x-t.x+.01,P.z-t.z],knock:'flinch',parryable:false,noPush:1});floatText(P.x,P.y+2,P.z,'TUZAK','red')}
    for(const m of MONS)if(!m.dead&&!m.T.boss&&Math.abs(m.x-t.x)<DC/2&&Math.abs(m.z-t.z)<DC/2&&!m.hitTrap){m.hitTrap=1;const dd=m.hurt(Math.round(m.max*.35),0,0,'trap');floatText(m.x,m.y+1.5,m.z,'TUZAK','crit');if(dd)onFoeKilled(m,false)}}
   if(st!==2)for(const m of MONS)m.hitTrap=0}
  else if(t.k==='vent'){const u=(T+t.ph)%4.2,st=u<2.5?0:u<3.1?1:2;if(st===1){tele('circle',t.x,t.z,1.3,0,0,1);if(Math.random()<dt*20)spawnSparks(t.x,DUN.y+.2,t.z,1,[1,.5,.1],2)}
   t.f.vis=st===2;if(st===2){const s2=1+Math.sin(GT.time*30)*.15;t.f.M=mtrs([t.x,DUN.y,t.z],[0,GT.time*5,0]);t.f.M[0]*=2.6*s2;t.f.M[5]*=6*s2;t.f.M[10]*=2.6*s2;
    if(Math.hypot(P.x-t.x,P.z-t.z)<1.25&&P.alive&&(t.cd||0)<T){t.cd=T+.6;hitPlayer({src:{x:t.x,z:t.z,lv:DUN.lv},dmg:9,guard:25,dir:[P.x-t.x+.01,P.z-t.z],knock:'flinch',parryable:false,noPush:1});floatText(P.x,P.y+2,P.z,'ALEV','red')}}}
  else if(t.k==='plateArrow'&&!t.used&&Math.hypot(P.x-t.x,P.z-t.z)<1.2&&!P.air){if(P.crouch&&P.spd<2.6){t.used=1;note('Ayağının altında bir levha… dikkatle üstünden geçtin.','gold');addXP(10,P);continue}
   t.used=1;note('[!] Tıkk — bir levhaya bastın!','red');sfx.lock();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){if(!dSolid(dAt(t.i+dx,t.j+dy)))continue;const fx=t.x+dx*(DC/2-.1),fz=t.z+dy*(DC/2-.1);for(let k=0;k<2;k++)shootArrow([fx,DUN.y+1.1+k*.4,fz],[P.x-dx*.5,P.y+1,P.z-dy*.5],22,'foe',9,null)}}}
 // flames and lights: hero lantern + the three nearest fires
 for(const t of DUN.torches){const s2=1+Math.sin(GT.time*13+t.ph)*.12+Math.sin(GT.time*7.3+t.ph)*.08;t.f.M=mtrs([t.x,t.y,t.z],[0,GT.time*2+t.ph,0]);t.f.M[0]*=s2;t.f.M[5]*=s2*1.3;t.f.M[10]*=s2}
 for(const b of DUN.it)if(b.k==='brazier'&&b.lit){const s2=1+Math.sin(GT.time*11+b.x)*.15;b.f.M=mtrs([b.x,DUN.y+1.15,b.z],[0,GT.time*2,0]);b.f.M[0]*=2*s2;b.f.M[5]*=2.4*s2;b.f.M[10]*=2*s2}
 const L=[];for(const t of DUN.torches)L.push([Math.hypot(t.x-P.x,t.z-P.z),t.x,t.y,t.z,13,1.5,.8,.35,t.ph]);for(const b of DUN.it){if(b.k==='brazier'&&b.lit)L.push([Math.hypot(b.x-P.x,b.z-P.z),b.x,DUN.y+1.6,b.z,12,1.2,.6,.25,0]);if(b.k==='rune'&&b.lit)L.push([Math.hypot(b.x-P.x,b.z-P.z),b.x,DUN.y+1.8,b.z,7,.3,.8,1.2,0])}
 for(const p of DPROJ)L.push([Math.hypot(p.x-P.x,p.z-P.z),p.x,p.y,p.z,6,p.lc[0],p.lc[1],p.lc[2],0]);
 L.sort((a,b)=>a[0]-b[0]);DLIGHT.fill(0);DLIGHTC.fill(0);DLIGHT[0]=P.x;DLIGHT[1]=P.y+2.2;DLIGHT[2]=P.z;DLIGHT[3]=10.5;DLIGHTC[0]=.95;DLIGHTC[1]=.78;DLIGHTC[2]=.55;
 for(let k=0;k<3&&k<L.length;k++){const l=L[k],fl=1+Math.sin(GT.time*17+l[8])*.08;DLIGHT[4+k*4]=l[1];DLIGHT[5+k*4]=l[2];DLIGHT[6+k*4]=l[3];DLIGHT[7+k*4]=l[4];DLIGHTC[3+k*3]=l[5]*fl;DLIGHTC[4+k*3]=l[6]*fl;DLIGHTC[5+k*3]=l[7]*fl}
 updateMons(dt);updateDProj(dt)}
// breadth-first distance from the player's cell: monsters walk down this field around corners
function dunFlow(pi,pj){const c=pj*DUN.W+pi;if(c===DUN.flowC)return;DUN.flowC=c;const W=DUN.W,F=DUN.flow;F.fill(-1);if(pi<0||pj<0||pi>=W||pj>=DUN.H)return;F[c]=0;const q=[c];
 for(let h=0;h<q.length;h++){const k=q[h],i=k%W,j=(k-i)/W;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+dx,nj=j+dy;if(ni<0||nj<0||ni>=W||nj>=DUN.H)continue;const n=nj*W+ni;if(F[n]>=0||dSolid(DUN.g[n]))continue;F[n]=F[k]+1;q.push(n)}}}
function dunSteer(m){if(dunLos(m.x,m.z,P.x,P.z))return[P.x,P.z];const[i,j]=dCell(m.x,m.z),F=DUN.flow,W=DUN.W;let b=null,bv=F[j*W+i]>=0?F[j*W+i]:1e9;
 for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+dx,nj=j+dy;if(ni<0||nj<0||ni>=W||nj>=DUN.H)continue;const v=F[nj*W+ni];if(v>=0&&v<bv){bv=v;b=[dCX(ni),dCZ(nj)]}}return b||[P.x,P.z]}
function dunEnv(env){const T=THEME[DUN.D.theme];env.fogC=T.fog;env.sun=T.sun;env.fog=[9,42];env.pl=DLIGHT;env.plc=DLIGHTC;return env}
function dunRadar(g,S,T,k){const W=DUN.W,R=radarR();g.fillStyle='rgba(150,140,120,.55)';const[pi,pj]=dCell(P.x,P.z),n=Math.ceil(R/DC)+1;
 for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++){const i=pi+a,j=pj+b;if(i<0||j<0||i>=W||j>=DUN.H||!DUN.seen[j*W+i]||dSolid(DUN.g[j*W+i]))continue;const p=T(dCX(i),dCZ(j));g.fillRect(p[0]-DC*k/2,p[1]-DC*k/2,DC*k+.5,DC*k+.5)}
 for(const it of DUN.it){if(!it.r)continue;const[i,j]=dCell(it.x,it.z);if(!DUN.seen[j*W+i])continue;const p=T(it.x,it.z);g.fillStyle=it.k==='down'||it.k==='up'||it.k==='exit'?'#9fd0ff':it.k==='chest'?'#ffd76a':it.k==='tablet'?'#7fe0ff':'#c79bff';g.fillRect(p[0]-3,p[1]-3,6,6)}}
