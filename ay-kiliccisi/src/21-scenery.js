// ===================== scenery: distant snowy mountains, scattered rocks and bushes, the waterfall, farms and a windmill =====================
// Everything is real 3D geometry. The far mountain ring is a backdrop that travels with the camera (it is so far away
// that it never gets closer); rocks, bushes, fields, fences and the mill are walk-around world objects.
const FIELDS=[[150,14,236,64,0],[150,-64,236,-14,1],[-236,14,-150,64,1],[-236,-64,-150,-14,0],[16,150,66,226,1],[-66,150,-16,226,0]];
const inField=(x,z,m=4)=>FIELDS.some(f=>x>f[0]-m&&x<f[2]+m&&z>f[1]-m&&z<f[3]+m);
const MILL=[262,96];let MTN=null,MILLOB=null,FALLS=null;
// runs before tree collision is registered: clear the farmland, sow bushes
function sceneryPre(){const R=mkRng(90210);
 for(let i=TREES.length-1;i>=0;i--){const t=TREES[i];if(inField(t.x,t.z,6)||Math.hypot(t.x-MILL[0],t.z-MILL[1])<24){TREES.splice(i,1);const a=TCH.get(tchKey(t.x,t.z));if(a){const j=a.indexOf(t);if(j>=0)a.splice(j,1)}}}
 for(let i=0;i<15000;i++){const x=(R()-.5)*2*(WS-30),z=(R()-.5)*2*(WS-30),zn=zoneAt(x,z);if(clearing(x,z)||zn==='kingdom'||zn==='lake'||zn==='river'||zn==='camp'||zn==='lair'||zn==='swamp')continue;if(depthAt(x,z)>0||inField(x,z,3))continue;if(Math.abs(x)<5||Math.abs(z)<5)continue;
  const dry=zn==='mountain'||zn==='ruins',g=dry?[.3,.34,.2]:zn==='dense'?[.1,.26,.13]:[.2,.42,.16],f=.85+R()*.3;addSpec({x,z,s:.7+R()*.8,k:6,lv:[g[0]*f,g[1]*f,g[2]*f],rot:[R(),R(),R()],berry:R()<.12})}}
function buildScenery(){const R=mkRng(31337),r=(a,b)=>a+(b-a)*R();
 // ---------- rocks everywhere (more along the river, in the old forest and on high ground); they block movement and sight
 const RC=new Map();for(let i=0;i<4300;i++){let x=(R()-.5)*2*(WS-40),z=(R()-.5)*2*(WS-40);const zn=zoneAt(x,z);if(clearing(x,z))continue;if(zn==='kingdom'||zn==='lake'||zn==='camp'||zn==='lair'||zn==='swamp'||zn==='mountain')continue;if(depthAt(x,z)>0||inField(x,z,5)||Math.abs(x)<6||Math.abs(z)<6)continue;
  const big=R()<.12,s=big?r(1.8,3.6):r(.35,1.2),k=Math.floor((x+WS)/400)*100+Math.floor((z+WS)/400);let g=RC.get(k);if(!g)RC.set(k,g=G());rock(g,x,hAt(x,z)-.1,z,s,R);if(s>.7)addTree(x,z,s*.8,s*1.1);
  if(big)for(let j=0;j<3;j++){const a=R()*6.28,d=s*r(.9,1.5),s2=r(.4,1);rock(g,x+Math.cos(a)*d,hAt(x+Math.cos(a)*d,z+Math.sin(a)*d)-.1,z+Math.sin(a)*d,s2,R)}}
 for(const[k,g]of RC){if(!g.P.length)continue;const cx=Math.floor(k/100)*400-WS+200,cz=(k%100)*400-WS+200;obj(geo(g),{shade:.8,pos:[cx,0,cz],cull:560})}
 // ---------- farmland: striped fields that follow the ground, fences, haystacks
 const fg=G(),H=(x,z)=>hAt(x,z)+.07,wood=[.42,.3,.18],hay=[.78,.66,.3];
 for(const[x0,z0,x1,z1,kind]of FIELDS){const alongX=(x1-x0)>(z1-z0),A=kind?[.62,.52,.2]:[.3,.46,.18],B=kind?[.5,.4,.16]:[.36,.27,.16];
  for(let x=x0;x<x1;x+=2)for(let z=z0;z<z1;z+=2){const row=Math.floor((alongX?z-z0:x-x0)/2)%2,c=row?A:B,q=(a,b)=>[a,H(a,b),b];quad(fg,q(x,z+2),q(x+2,z+2),q(x+2,z),q(x,z),c)}
  const post=(x,z)=>{const y=hAt(x,z);box(fg,x-.07,y,z-.07,x+.07,y+1.05,z+.07,wood)},rail=(xa,za,xb,zb)=>{for(const h of[.45,.85]){const ya=hAt(xa,za)+h,yb=hAt(xb,zb)+h,dx=xb-xa,dz=zb-za,l=Math.hypot(dx,dz),nx=-dz/l*.04,nz=dx/l*.04;
    quad(fg,[xa+nx,ya-.05,za+nz],[xb+nx,yb-.05,zb+nz],[xb+nx,yb+.05,zb+nz],[xa+nx,ya+.05,za+nz],wood);quad(fg,[xb-nx,yb-.05,zb-nz],[xa-nx,ya-.05,za-nz],[xa-nx,ya+.05,za-nz],[xb-nx,yb+.05,zb-nz],wood)}};
  const gate=alongX?[(x0+x1)/2,Math.abs(z0)<Math.abs(z1)?z0:z1]:[Math.abs(x0)<Math.abs(x1)?x0:x1,(z0+z1)/2];
  const side=(xa,za,xb,zb)=>{const n=Math.round(Math.hypot(xb-xa,zb-za)/4);for(let i=0;i<n;i++){const ax=lp(xa,xb,i/n),az=lp(za,zb,i/n),bx=lp(xa,xb,(i+1)/n),bz=lp(za,zb,(i+1)/n);post(ax,az);if(Math.hypot((ax+bx)/2-gate[0],(az+bz)/2-gate[1])<3)continue;rail(ax,az,bx,bz)}post(xb,zb)};
  side(x0,z0,x1,z0);side(x1,z0,x1,z1);side(x1,z1,x0,z1);side(x0,z1,x0,z0);addBox(x0-.2,z0-.2,x1+.2,z0+.2,1.1);addBox(x0-.2,z1-.2,x1+.2,z1+.2,1.1);addBox(x0-.2,z0,x0+.2,z1,1.1);addBox(x1-.2,z0,x1+.2,z1,1.1);
  for(let i=0;i<3;i++){const hx=r(x0+5,x1-5),hz=r(z0+5,z1-5),hy=hAt(hx,hz),n=9;for(let k=0;k<n;k++){const a0=k/n*6.283,a1=(k+1)/n*6.283,p=(a,rr2,y)=>[hx+Math.cos(a)*rr2,hy+y,hz+Math.sin(a)*rr2];
    quad(fg,p(a1,1.1,0),p(a0,1.1,0),p(a0,.95,1.1),p(a1,.95,1.1),hay);tri(fg,p(a0,.95,1.1),p(a1,.95,1.1),[hx,hy+1.9,hz],[hay[0]*1.1,hay[1]*1.1,hay[2]*1.1])}addTree(hx,hz,1.1,1.8)}}
 for(let i=0;i<fg.N.length;i+=3)if(fg.N[i+1]>.9){fg.N[i]=0;fg.N[i+1]=1;fg.N[i+2]=0}
 obj(geo(fg),{shade:.5,pos:[0,0,0],cull:700});
 // ---------- windmill: stone tower, timber cap, four turning sails
 {const[mx,mz]=MILL,my=hAt(mx,mz),g=G(),n=10,stone=[.62,.6,.56],roof=[.36,.2,.14];
  for(let k=0;k<n;k++){const a0=k/n*6.283,a1=(k+1)/n*6.283,p=(a,rr2,y)=>[mx+Math.cos(a)*rr2,my+y,mz+Math.sin(a)*rr2],f=.9+.1*Math.sin(k*2.3);quad(g,p(a1,3.2,0),p(a0,3.2,0),p(a0,2.2,9),p(a1,2.2,9),[stone[0]*f,stone[1]*f,stone[2]*f]);tri(g,p(a0,2.6,9),p(a1,2.6,9),[mx,my+12,mz],roof)}
  box(g,mx-.6,my,mz+3.0,mx+.6,my+2.1,mz+3.3,[.3,.2,.12]);obj(geo(g),{shade:.8,pos:[mx,0,mz],cull:700,out:.03,outCol:[.1,.08,.07]});addTree(mx,mz,3.4,10);
  const s=G(),wd=[.5,.36,.2],cl2=[.86,.8,.66];for(let k=0;k<4;k++){const a=k*PI/2,c=Math.cos(a),sn=Math.sin(a),P2=(u,v)=>[u*c-v*sn,u*sn+v*c,0];
   quad(s,P2(-.12,.4),P2(.12,.4),P2(.12,7),P2(-.12,7),wd);quad(s,P2(.12,1.6),P2(1.5,1.6),P2(1.5,6.8),P2(.12,6.8),cl2);quad(s,P2(.12,7),P2(.12,.4),P2(-.12,.4),P2(-.12,7),wd);quad(s,P2(.12,6.8),P2(1.5,6.8),P2(1.5,1.6),P2(.12,1.6),cl2)}
  MILLOB=obj(geo(s),{shade:.7,pos:[mx,0,mz],cull:700,ds:1});MILLOB.at=[mx,my+9.2,mz+2.75]}
 // ---------- the waterfall at the head of the river: a rock wall, falling water, mist
 {const a=RIVER[0],b=RIVER[1],dl=Math.hypot(a[0]-b[0],a[1]-b[1]),ux=(a[0]-b[0])/dl,uz=(a[1]-b[1])/dl,px=-uz,pz=ux,cx=a[0]+ux*10,cz=a[1]+uz*10,top=WATER_L+19,g=G();
  for(let i=0;i<60;i++){const t=(i/59-.5)*2,row=i%4,w=t*34,back=5+Math.abs(t)*12+row*4,x=cx+px*w+ux*back,z=cz+pz*w+uz*back,s=r(6,9.5)-row*.6;rock(g,x,WATER_L-3+row*5.2,z,s,R);if(row===0)addTree(x,z,s*.8,20)}
  obj(geo(g),{shade:.8,pos:[cx,0,cz],cull:700});
  const w=G(),W=5,seg=10;for(let j=0;j<seg;j++){const y0=lp(top,WATER_L,j/seg),y1=lp(top,WATER_L,(j+1)/seg),o0=3+Math.pow(j/seg,2)*4.5,o1=3+Math.pow((j+1)/seg,2)*4.5,P3=(s2,y,o)=>[cx+px*s2-ux*o+ux*9,y,cz+pz*s2-uz*o+uz*9];
   for(let k=-2;k<2;k++){const f=.84+.16*(k&1)-.05*(j%2),v0=w.P.length/3;quad(w,P3(k*W/2,y0,o0),P3((k+1)*W/2,y0,o0),P3((k+1)*W/2,y1,o1),P3(k*W/2,y1,o1),[.78*f,.9*f,1*f]);for(let q=v0;q<v0+4;q++)w.W[q]=6+((q+j)%3)*4}}
  {const F=FALLHEAD,y=F.top-.55,Pq=(al,s2)=>[F.x+F.ux*al-F.uz*s2,y,F.z+F.uz*al+F.ux*s2];for(let al=F.lip;al<160;al+=8)quad(w,Pq(al,-5.4),Pq(al,5.4),Pq(al+8,5.4),Pq(al+8,-5.4),[.42,.58,.7])}/* the upper river on the plateau feeding the falls */
  FALLS=obj(geo(w),{unlit:1,blend:1,noOff:1,shade:.5,pos:[cx,0,cz],cull:700,ds:1,col:[1,1,1]});FALLS.alpha=.82;FALLS.at=[cx-ux*-1,WATER_L,cz-uz*-1,ux,uz]}
 // ---------- far mountains: two jagged rings with snow caps
 {const g=G(),sun=vnorm([.5,.7,.45]),peak=(ang,rad,hh,br,seed)=>{const RR=mkRng(seed),n=9,cx=Math.cos(ang)*rad,cz=Math.sin(ang)*rad,rings=[[1,0],[.62,.34],[.3,.68]],V=[];
    for(const[rf,hf]of rings){const row=[];for(let k=0;k<n;k++){const a=k/n*6.283,jr=br*rf*(.75+RR()*.5);row.push([cx+Math.cos(a)*jr,hh*hf*(.85+RR()*.3)-14,cz+Math.sin(a)*jr])}V.push(row)}const apex=[cx+(RR()-.5)*br*.2,hh-14,cz+(RR()-.5)*br*.2];
    const col=(p,nr)=>{const t=(p[1]+14)/hh,snow=sst(.5,.62,t+(RR()-.5)*.1),lit=.62+.38*Math.max(0,vdot(nr,sun)),rk=[.33+.1*t,.37+.08*t,.45+.06*t];return[lp(rk[0],.94,snow)*lit,lp(rk[1],.96,snow)*lit,lp(rk[2],1,snow)*lit]};
    const T=(a,b,c)=>{const nr=vnorm(vcross(vsub(b,a),vsub(c,a))),o=g.P.length/3;if(nr[1]<0){nr[0]=-nr[0];nr[1]=-nr[1];nr[2]=-nr[2]}for(const p of[a,b,c]){g.P.push(p[0],p[1],p[2]);g.N.push(nr[0],nr[1],nr[2]);const cc=col(p,nr);g.C.push(cc[0],cc[1],cc[2]);g.U.push(0,0);g.W.push(0)}g.I.push(o,o+1,o+2)};
    for(let j=0;j<2;j++)for(let k=0;k<n;k++){const k1=(k+1)%n;T(V[j][k],V[j][k1],V[j+1][k1]);T(V[j][k],V[j+1][k1],V[j+1][k])}for(let k=0;k<n;k++)T(V[2][k],V[2][(k+1)%n],apex)};
  for(let i=0;i<22;i++)peak(i/22*6.283+.1,590,150+((i*37)%5)*26+(i%3)*18,150,1000+i);for(let i=0;i<26;i++)peak(i/26*6.283,500,70+((i*53)%7)*13,105,2000+i);
  MTN=obj(geo(g),{unlit:1,shade:.42,pos:[0,0,0],cull:0,ds:1,order:-5})}}
// per frame: mountains follow the camera, the mill turns, the waterfall throws mist
function updateScenery(time,dt,env,cam){if(MTN){MTN.M=mtrs([cam[0],-6,cam[2]],[0,0,0]);MTN.col=[env.sun[0],env.sun[1],env.sun[2]];MTN.pos=[cam[0],0,cam[2]]}
 if(MILLOB){const a=MILLOB.at;MILLOB.M=mtrs(a,[0,0,time*.5])}
 if(FALLS&&dt>0&&Math.hypot(P.x-FALLS.at[0],P.z-FALLS.at[2])<160&&Math.random()<dt*24){const a=FALLS.at;spawnSparks(a[0]+(Math.random()-.5)*6,a[1]+.4,a[2]+(Math.random()-.5)*6,2,[.85,.93,1],2.2)}}
