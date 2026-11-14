// ===================== player model: skeleton, CPU skinning, fitted outfit, hair, sword =====================
const SK={},skins=[],pObjs=[],PSC=1.2;let HB;
function skInit(){const B=PLD.bones;SK.n=B.length;SK.par=B.map(b=>b.p);SK.rest=B.map(b=>b.r);SK.loc=B.map(b=>b.p<0?b.r:vsub(b.r,B[b.p].r));SK.R=B.map(()=>R3I);SK.GR=B.map(()=>R3I);SK.GP=B.map(b=>b.r.slice());
 SK.A=new Float32Array(SK.n*12);SK.root=[0,0,0];HB=PLD.hum;SK.L1=Math.hypot(...vsub(B[HB.leftLowerLeg].r,B[HB.leftUpperLeg].r));SK.L2=Math.hypot(...vsub(B[HB.leftFoot].r,B[HB.leftLowerLeg].r))}
function skUpdate(){const{n,par,loc,R,GR,GP,rest,A}=SK;
 for(let i=0;i<n;i++){const p=par[i];if(p<0){GR[i]=R[i];GP[i]=vadd(rest[i],SK.root)}else{GR[i]=r3m(GR[p],R[i]);GP[i]=vadd(GP[p],r3v(GR[p],loc[i]))}
  const g=GR[i],t=vsub(GP[i],r3v(g,rest[i])),o=i*12;A[o]=g[0];A[o+1]=g[1];A[o+2]=g[2];A[o+3]=t[0];A[o+4]=g[3];A[o+5]=g[4];A[o+6]=g[5];A[o+7]=t[1];A[o+8]=g[6];A[o+9]=g[7];A[o+10]=g[8];A[o+11]=t[2]}}
function skinAll(){const A=SK.A;for(const s of skins){const p=s.restP,q=s.restN,J=s.J,W=s.W,P=s.P,N=s.N,nv=s.nv;
 for(let v=0;v<nv;v++){const v3=v*3,v4=v*4,x=p[v3],y=p[v3+1],z=p[v3+2],nx=q[v3],ny=q[v3+1],nz=q[v3+2];let px=0,py=0,pz=0,ax=0,ay=0,az=0;
  for(let k=0;k<4;k++){const w=W[v4+k];if(w===0)continue;const o=J[v4+k]*12,a0=A[o],a1=A[o+1],a2=A[o+2],a4=A[o+4],a5=A[o+5],a6=A[o+6],a8=A[o+8],a9=A[o+9],a10=A[o+10];
   px+=w*(a0*x+a1*y+a2*z+A[o+3]);py+=w*(a4*x+a5*y+a6*z+A[o+7]);pz+=w*(a8*x+a9*y+a10*z+A[o+11]);ax+=w*(a0*nx+a1*ny+a2*nz);ay+=w*(a4*nx+a5*ny+a6*nz);az+=w*(a8*nx+a9*ny+a10*nz)}
  P[v3]=px;P[v3+1]=py;P[v3+2]=pz;N[v3]=ax;N[v3+1]=ay;N[v3+2]=az}
 updGeo(s.geo,P,N)}}
function addSkin(g,J,W,o){const nv=g.P.length/3,s={restP:Float32Array.from(g.P),restN:Float32Array.from(g.N),J,W,nv,P:new Float32Array(nv*3),N:new Float32Array(nv*3)};
 s.geo=geo({P:s.restP,N:s.restN,U:g.U,C:g.C,W:g.W,I:g.I},true);skins.push(s);const ob=obj(s.geo,o);pObjs.push(ob);return ob}
const WHITE=hex(0xf4f5fb),BLUE=hex(0x3f6be0),mix3=(a,b,t)=>[lp(a[0],b[0],t),lp(a[1],b[1],t),lp(a[2],b[2],t)];
const hairCol=y=>mix3(WHITE,BLUE,Math.pow(sst(.9,.48,y),1.2)),prof=(R,a=6,b=.4)=>t=>R*Math.min(1,t*a+.35)*Math.pow(Math.max(1-t,0),b);
function wrapTex(){const W=512,H=512,c=cnv(W,H),g=c.getContext('2d');g.fillStyle='#efeef6';g.fillRect(0,0,W,H);let k=0;
 for(let r=26;r<H;r+=44,k++){const A=(k%2?1:-1)*20,ph=k*1.9;g.strokeStyle='rgba(150,152,190,.5)';g.lineWidth=9;g.beginPath();for(let x=0;x<=W;x+=8)g.lineTo(x,r+4+A*Math.sin(x/W*2*PI+ph));g.stroke();
  g.strokeStyle='rgba(105,108,158,.9)';g.lineWidth=2.6;g.beginPath();for(let x=0;x<=W;x+=8)g.lineTo(x,r+A*Math.sin(x/W*2*PI+ph));g.stroke()}return texture(c)}
function skirtTex(){const W=512,H=512,c=cnv(W,H),g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#23264a');gr.addColorStop(.5,'#191b36');gr.addColorStop(1,'#141529');g.fillStyle=gr;g.fillRect(0,0,W,H);
 for(let i=0;i<30;i++){const x=rr(0,W),y=rr(20,H*.8),s=rr(10,20);g.save();g.translate(x,y);g.rotate(rr(0,6));g.fillStyle='rgba(74,82,158,'+rr(.4,.8).toFixed(2)+')';
  for(let p=0;p<5;p++){g.save();g.rotate(p*2*PI/5);g.beginPath();g.ellipse(0,-s*.55,s*.3,s*.5,0,0,7);g.fill();g.restore()}g.restore()}return texture(c)}
function fitted(y0,y1,margin,vs=1){const T=PLD.torso,A=T.A,g=G(),n=Math.max(2,Math.round((y1-y0)/.012));
 for(let j=0;j<=n;j++){const y=lp(y0,y1,j/n),f=cl((y-T.y0)/T.dy,0,T.r.length-1.001),i=Math.floor(f),t=f-i,c=lp(T.cz[i],T.cz[i+1],t),mg=typeof margin==='function'?margin(j/n):margin;
  for(let k=0;k<=A;k+=2){const kk=k%A,a=kk/A*2*PI,r=lp(T.r[i][kk],T.r[i+1][kk],t)+mg;g.P.push(Math.cos(a)*r,y,c+Math.sin(a)*r);g.U.push(k/A,j/n*vs);g.C.push(1,1,1);g.W.push(0)}}
 grid(g,n+1,A/2);normals(g);seamAvg(g,n+1,A/2);if(g.N[0]<0)flip(g);return g}
function limbFit(tb,t0,t1,margin,vs=1){const A=tb.r[0].length,g=G(),n=Math.max(2,Math.round((t1-t0)*tb.L/.014)),m=tb.t.length-1;
 for(let j=0;j<=n;j++){const t=lp(t0,t1,j/n),f=cl((t-tb.t[0])/(tb.t[m]-tb.t[0])*m,0,m-.001),i=Math.floor(f),q=f-i,cu=lp(tb.c[i][0],tb.c[i+1][0],q),cv2=lp(tb.c[i][1],tb.c[i+1][1],q);
  for(let k=0;k<=A;k+=2){const kk=k%A,a=kk/A*2*PI,r=lp(tb.r[i][kk],tb.r[i+1][kk],q)+margin,pu=cu+Math.cos(a)*r,pv=cv2+Math.sin(a)*r,s=t*tb.L;
   g.P.push(tb.a[0]+tb.d[0]*s+tb.u[0]*pu+tb.v[0]*pv,tb.a[1]+tb.d[1]*s+tb.u[1]*pu+tb.v[1]*pv,tb.a[2]+tb.d[2]*s+tb.u[2]*pu+tb.v[2]*pv);g.U.push(k/A,j/n*vs);g.C.push(1,1,1);g.W.push(0)}}
 grid(g,n+1,A/2);normals(g);seamAvg(g,n+1,A/2);if(vdot([g.N[0],g.N[1],g.N[2]],tb.u)<0)flip(g);return g}

function buildPlayer(TX){skInit();
 const OUT=[.16,.15,.27],bin=atob(PLB),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);const buf=u8.buffer;
 const S={Face_00_SKIN:{shade:.22,out:.0016},FaceMouth:{shade:.3},EyeWhite:{shade:.1},EyeIris:{cut:.5,shade:0,iris:1},EyeHighlight:{blend:1,order:4,shade:0},
  FaceEyeline:{blend:1,order:2,col:[.1,.1,.18],shade:0},FaceEyelash:{blend:1,order:3,col:[.1,.1,.18],shade:0},FaceBrow:{blend:1,order:2,col:[.7,.72,.84],shade:0},
  Body_00_SKIN:{out:.0018},HairBack:{blend:1,order:0,col:[1.6,1.6,1.68],shade:.3}};
 let body=null;
 for(const gr of PLD.groups){const key=Object.keys(S).find(k=>gr.name.includes(k)),s=key?S[key]:{};
  const g={P:new Float32Array(buf,gr.P[0],gr.P[1]),N:new Float32Array(buf,gr.N[0],gr.N[1]),U:new Float32Array(buf,gr.U[0],gr.U[1]),I:new Uint16Array(buf,gr.I[0],gr.I[1]),C:new Float32Array(gr.nv*3).fill(1),W:new Float32Array(gr.nv)};
  const J=new Uint8Array(buf,gr.J[0],gr.J[1]),W=new Float32Array(buf,gr.W[0],gr.W[1]);
  if(s.iris)for(let i=0;i<gr.nv;i++){const d=g.P[i*3]>0;g.C[i*3]=d?.13:.72;g.C[i*3+1]=d?.13:.9;g.C[i*3+2]=d?.17:1.25}
  if(key==='Body_00_SKIN')body={P:g.P,J,W,nv:gr.nv};
  addSkin(g,J,W,{tex:TX[gr.tex],col:s.col,cut:s.cut,blend:s.blend,order:s.order,out:s.out,outCol:OUT,shade:s.shade})}
 // weight transfer: every clothing vertex follows the nearest body vertex
 const CELL=.05,hg=new Map(),hk=(x,y,z)=>((Math.floor(x/CELL)+64)*128+Math.floor(y/CELL)+64)*128+Math.floor(z/CELL)+64;
 for(let i=0;i<body.nv;i++){const k=hk(body.P[i*3],body.P[i*3+1],body.P[i*3+2]);let a=hg.get(k);if(!a)hg.set(k,a=[]);a.push(i)}
 const nearest=(x,y,z)=>{let best=-1,bd=1e9;for(let rad=1;rad<=3&&best<0;rad++){const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL),cz=Math.floor(z/CELL);
   for(let i=-rad;i<=rad;i++)for(let j=-rad;j<=rad;j++)for(let k=-rad;k<=rad;k++){const a=hg.get(((cx+i+64)*128+cy+j+64)*128+cz+k+64);if(!a)continue;
    for(const v of a){const dx=body.P[v*3]-x,dy=body.P[v*3+1]-y,dz=body.P[v*3+2]-z,d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;best=v}}}}
  if(best<0)for(let v=0;v<body.nv;v++){const dx=body.P[v*3]-x,dy=body.P[v*3+1]-y,dz=body.P[v*3+2]-z,d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;best=v}}return best};
 const near=g=>{const nv=g.P.length/3,J=new Uint8Array(nv*4),W=new Float32Array(nv*4);for(let i=0;i<nv;i++){const b=nearest(g.P[i*3],g.P[i*3+1],g.P[i*3+2]);for(let k=0;k<4;k++){J[i*4+k]=body.J[b*4+k];W[i*4+k]=body.W[b*4+k]}}return[J,W]};
 const rigid=(g,fn)=>{const nv=g.P.length/3,J=new Uint8Array(nv*4),W=new Float32Array(nv*4);for(let i=0;i<nv;i++){const l=fn(g.P[i*3+1],g.P[i*3],g.P[i*3+2]);for(let k=0;k<l.length&&k<4;k++){J[i*4+k]=l[k][0];W[i*4+k]=l[k][1]}}return[J,W]};
 const cloth=(g,o)=>{const[J,W]=near(g);return addSkin(g,J,W,o)};
 const WT=wrapTex(),ST=skirtTex(),navy=hex(0x2c3068),pale=hex(0xe9e8f4);
 cloth(fitted(.845,1.028,.0065),{tex:WT,out:.0018,outCol:OUT});
 cloth(fitted(.6,.86,.0075,.55),{tex:ST,out:.002,outCol:[.05,.05,.1]});
 const misc=[tint(fitted(.822,.9,t=>.016-.004*t),navy),tint(fitted(.852,.868,.0195),pale)];
 for(const k of['shinL','shinR']){misc.push(tint(limbFit(PLD.limbs[k],.03,.985,.0075),hex(0x1d2040)));misc.push(tint(limbFit(PLD.limbs[k],0,.1,.013),navy));misc.push(tint(limbFit(PLD.limbs[k],.04,.062,.0155),pale))}
 for(const k of['thighL','thighR'])misc.push(tint(limbFit(PLD.limbs[k],.12,1.1,.0065),hex(0x17182e)));
 misc.push(tint(limbFit(PLD.limbs.thighL,.42,.5,.009),navy));
 const rb=[];for(const s of[-1,1])rb.push(tube([[0,.864,-.118],[s*.05,.9,-.13],[s*.088,.864,-.124],[s*.05,.832,-.13],[0,.862,-.12]],{r:t=>.018*Math.pow(Math.sin(PI*(.08+.84*t)),.3),flat:.16,seg:6,n:12,wide:[0,0,1]}));
 rb.push(sphere(10,6,d=>[.036+d[0]*.017,.864+d[1]*.014,.114+d[2]*.012],{c:[.036,.864,.114]}));misc.push(tint(merge(rb),hex(0xf0eff8)));
 cloth(merge(misc),{out:.0018,outCol:OUT});
 cloth(merge([limbFit(PLD.limbs.foreL,.2,.93,.0045,3),limbFit(PLD.limbs.foreR,.2,.93,.0045,3)]),{tex:WT,out:.0014,outCol:OUT});
 const panel=(pts,w)=>tube(pts,{r:t=>w*Math.min(1,(1-t)*5+.12),flat:.07,seg:6,n:12,wide:[1,0,0],w:t=>t*t*.8});
 {const g=merge([panel([[0,.86,.094],[0,.78,.104],[0,.68,.102],[0,.6,.096],[0,.54,.092]],.046),panel([[0,.86,-.108],[0,.78,-.122],[0,.68,-.116],[0,.6,-.102],[0,.55,-.096]],.052)]);
  const[J,W]=rigid(g,()=>[[HB.hips,1]]);addSkin(g,J,W,{tex:ST,out:.002,outCol:[.05,.05,.1]})}
 // ---------- hair
 const H=[],hc=(t,p)=>hairCol(p[1]);
 const curtain=(Nn,dz,rad,tipLo,tipHi)=>{for(let i=0;i<Nn;i++){const a=cl(lp(-1,1,i/(Nn-1))+rr(-.02,.02),-1,1),q=Math.sqrt(1-a*a),ph=i*1.7,tip=rr(tipLo,tipHi);
  const pt=(y,Wd,D0,D1)=>[a*Wd+.01*Math.sin(y*9+ph),y,-(D0+D1*q)-dz+.008*Math.cos(y*7+ph*2)];
  H.push(tube([[a*.055,1.3,-(.05+.045*q)],pt(1.2,.092,.035,.085),pt(1.06,.135,.05,.065),pt(.9,.152,.06,.075),pt(.75,.162,.06,.075),pt(.6,.16,.062,.078),pt(tip,.14+rr(-.02,.02),.062,.075)],
   {r:prof(rad,6,.3),flat:.3,seg:5,n:16,wide:[q+.15,0,-a],col:hc,w:t=>t*t}))}};
 curtain(18,0,.046,.36,.5);curtain(11,-.016,.042,.42,.58);
 for(const s of[-1,1])for(let k=0;k<2;k++){const o=k*.024;H.push(tube([[s*(.088-o*.3),1.215,.02],[s*(.097-o*.3),1.12,.045],[s*(.088-o),1.0,.092+o*.3],[s*(.09-o),.9,.106],[s*(.1-o*.7),.76,.112],[s*(.108-o*.5),rr(.58,.66),.11]],
   {r:prof(.027-k*.003,6,.3),flat:.36,seg:5,n:14,wide:[1,0,.3],col:hc,w:t=>t*t*.9}))}
 {const g=merge(H),pts=[[1.2,HB.head],[1.05,HB.upperChest],[.9,HB.spine],[.75,HB.hips]];
  const[J,W]=rigid(g,y=>{if(y>=1.2)return[[HB.head,1]];if(y<=.75)return[[HB.hips,1]];for(let i=0;i<3;i++)if(y<=pts[i][0]&&y>=pts[i+1][0]){const t=(pts[i][0]-y)/(pts[i][0]-pts[i+1][0]);return[[pts[i][1],1-t],[pts[i+1][1],t]]}return[[HB.hips,1]]});
  addSkin(g,J,W,{out:.0014,outCol:[.47,.52,.74],shade:.8})}
 const HD=[];HD.push(sphere(28,14,d=>[d[0]*.101,1.262+d[1]*.107,-.012+d[2]*.105],{c:[0,1.262,-.012],th:u=>PI*(.7-.41*sst(.35,.88,Math.cos(2*PI*(u-.5))))}));
 const zf=(x,y)=>-.008+.1*Math.sqrt(Math.max(.05,1-(x/.097)*(x/.097)-((y-1.255)/.108)*((y-1.255)/.108)));
 const bx=[-.078,-.059,-.039,-.019,.002,.022,.042,.061,.079],bt=[1.248,1.236,1.244,1.228,1.206,1.246,1.232,1.24,1.25];
 bx.forEach((x,i)=>{const p=(xx,yy,e)=>[xx,yy,zf(xx,yy)+e];HD.push(tube([[x*.3,1.353,.028],p(x*.75,1.333,.011),p(x,1.29,.012),p(x*1.04+rr(-.005,.005),bt[i],.011)],{r:prof(.0185,5,.55),flat:.34,seg:5,n:8,wide:[1,0,0]}))});
 for(const s of[-1,1]){HD.push(tube([[s*.06,1.345,.05],[s*.093,1.275,.058],[s*.101,1.18,.052],[s*.1,1.09,.066],[s*.09,1.01,.09]],{r:prof(.019),flat:.4,seg:5,n:12,wide:[0,0,1]}));
  HD.push(tube([[s*.045,1.35,.06],[s*.08,1.285,.072],[s*.086,1.21,.07],[s*.078,1.15,.076]],{r:prof(.013,5,.6),flat:.4,seg:5,n:8,wide:[1,0,0]}))}
 const B=[0,1.378,-.05];HD.push(sphere(14,10,d=>[B[0]+d[0]*.066,B[1]+d[1]*.05,B[2]+d[2]*.062],{c:B}));
 for(let i=0;i<6;i++){const nrm=vnorm([Math.sin(i*2.4)*.8,.55+.35*Math.cos(i*1.7),Math.cos(i*2.4)*.8]),e1=vnorm(vcross(nrm,[.3,1,.2])),e2=vcross(nrm,e1),pts=[];
  for(let k=0;k<=8;k++){const an=k/8*2*PI*.86+i;pts.push(vadd(B,vadd(vmul(e1,Math.cos(an)*.058),vmul(e2,Math.sin(an)*.05))))}HD.push(tube(pts,{r:t=>.024*Math.pow(Math.sin(PI*(.04+.92*t)),.4),flat:.6,seg:5,n:12,wide:nrm}))}
 const dark=hex(0x2a2d4a),tas=hex(0x3247b5),pinA=[vadd(B,[-.105,.03,0]),vadd(B,[.105,0,0])],pinB=[vadd(B,[-.092,-.012,.026]),vadd(B,[.1,.034,-.016])],D=[];
 for(const p of[pinA,pinB])D.push(tint(tube(p,{r:()=>.003,seg:5,n:2}),dark));
 for(const[E,l]of[[pinA[1],.05],[pinB[1],.034],[pinA[0],.038]]){D.push(tint(tube([E,vadd(E,[0,-l,0])],{r:()=>.002,seg:4,n:2}),dark));D.push(tint(tube([vadd(E,[0,-l,0]),vadd(E,[0,-l-.042,0])],{r:t=>.007*Math.pow(Math.sin(PI*(.12+.86*t)),.5),seg:6,n:5}),tas))}
 {const g=merge([tint(merge(HD),WHITE),merge(D)]);const[J,W]=rigid(g,()=>[[HB.head,1]]);addSkin(g,J,W,{out:.0014,outCol:[.47,.52,.74],shade:.8})}
 // ---------- finger curls first: the right hand makes a fist around the grip, the left hand stays relaxed
 for(const f of['Index','Middle','Ring','Little'])for(const[seg,a]of[['Proximal',1.1],['Intermediate',1.2],['Distal',.7]]){SK.R[HB['right'+f+seg]]=rZ(a);SK.R[HB['left'+f+seg]]=rZ(-a*.22)}
 SK.R[HB.rightThumbProximal]=r3m(rY(.2),rZ(.45));SK.R[HB.rightThumbIntermediate]=rZ(.6);SK.R[HB.rightThumbDistal]=rZ(.45);
 // ---------- sword: the grip runs through the middle of the curled fingers (measured from the posed finger joints),
 // the blade leaves the fist on the thumb/index side. In the idle pose that side faces forward and up.
 {skUpdate();const GP=SK.GP,fc=[];
  for(const f of['Index','Middle','Ring','Little']){const a=GP[HB['right'+f+'Proximal']],b=GP[HB['right'+f+'Intermediate']],c=GP[HB['right'+f+'Distal']],t=vadd(c,vmul(vsub(c,b),.8));fc.push(vmul(vadd(vadd(a,b),vadd(c,t)),.25))}
  const ax=vnorm(vsub(fc[0],fc[3])),cen=vmul(vadd(vadd(fc[0],fc[1]),vadd(fc[2],fc[3])),.25),up=vnorm(vsub([0,1,0],vmul(ax,ax[1]))),sd=vcross(up,ax);
  const P=(dx,dy,dz)=>vadd(cen,vadd(vadd(vmul(sd,dx),vmul(up,dy)),vmul(ax,dz))),steel=hex(0xdfe8ff);
  const blade=tint(tube([P(0,0,.1),P(0,.006,.36),P(0,.022,.62),P(0,.05,.88)],{r:t=>.02*Math.min(1,(1-t)*9+.15),flat:.16,seg:6,n:14,wide:up}),steel);
  const grip=tint(tube([P(0,0,-.1),P(0,0,.09)],{r:()=>.0115,seg:6,n:3}),hex(0x22244a)),guard=tint(tube([P(0,0,.088),P(0,0,.104)],{r:()=>.04,seg:10,n:2,flat:.8,wide:up}),hex(0xc9a544)),pom=tint(tube([P(0,0,-.118),P(0,0,-.098)],{r:()=>.017,seg:8,n:2}),hex(0xc9a544));
  const g=merge([blade,grip,guard,pom]);const[J,W]=rigid(g,()=>[[HB.rightHand,1]]);addSkin(g,J,W,{out:.0022,outCol:[.1,.12,.25],shade:.5});
  SK.tipRest=P(0,.05,.86);SK.midRest=P(0,.02,.5);SK.gripRest=cen;SK.gripAx=ax}
}
// ---------- pose application (procedural joint angles) + optional arm IK targets
const POSE0={hipY:0,pel:0,spX:0,spY:0,spZ:0,chX:0,chY:0,hdX:0,hdY:0,LthX:0,RthX:0,LthZ:.04,RthZ:-.04,Lkn:0,Rkn:0,LaZ:1.22,LaX:.05,LaY:0,Lel:.25,RaZ:1.12,RaX:-.3,RaY:0,Rel:.55,RwX:0,RwY:0,RwZ:0,LwX:0,LwY:0,two:0,rev:0,choke:0};
function applyPose(q){const R=SK.R,H=HB;
 R[H.hips]=rX(q.pel);R[H.spine]=r3m(rX(q.spX),r3m(rY(q.spY),rZ(q.spZ)));R[H.chest]=r3m(rX(q.chX),rY(q.chY));R[H.neck]=rX(q.hdX*.4);R[H.head]=r3m(rX(q.hdX*.6),rY(q.hdY));
 R[H.leftUpperLeg]=r3m(rX(q.LthX),rZ(q.LthZ));R[H.rightUpperLeg]=r3m(rX(q.RthX),rZ(q.RthZ));R[H.leftLowerLeg]=rX(q.Lkn);R[H.rightLowerLeg]=rX(q.Rkn);
 R[H.leftFoot]=rX(cl(-(q.pel+q.LthX+q.Lkn),-.9,.9));R[H.rightFoot]=rX(cl(-(q.pel+q.RthX+q.Rkn),-.9,.9));
 R[H.leftUpperArm]=r3m(rY(q.LaY),r3m(rX(q.LaX),rZ(-q.LaZ)));R[H.leftLowerArm]=rY(-q.Lel);R[H.leftHand]=r3m(rX(q.LwX),rY(q.LwY));
 R[H.rightUpperArm]=r3m(rY(q.RaY),r3m(rX(q.RaX),rZ(q.RaZ)));R[H.rightLowerArm]=rY(q.Rel);R[H.rightHand]=r3m(rX(q.RwX),r3m(rY(q.RwY),rZ(q.RwZ)));
 const e=(th,kn)=>SK.L1*Math.cos(q.pel+th)+SK.L2*Math.cos(q.pel+th+kn);
 SK.root=[0,-(SK.L1+SK.L2-Math.max(e(q.LthX,q.Lkn),e(q.RthX,q.Rkn)))+q.hipY,0];skUpdate();
 // reverse grip (blade tip down, both hands): right hand to a point in front of the chest, blade axis turned straight down
 if(q.rev>.02){const h=lp(1.02,.82,cl(q.revDn||0,0,1));armIK('right',[-.02,h,.27],[-.6,.2,-.5],[0,-1,0],q.rev)}
 // left hand joins the grip (two-handed swings, charged heavy attack, guard, reverse grip)
 if(q.two>.02||q.rev>.02){const rh=HB.rightHand,g=SK.GR[rh],gp=vadd(SK.GP[rh],r3v(g,vsub(SK.gripRest,PLD.bones[rh].r))),ax=r3v(g,SK.gripAx),t=vsub(gp,vmul(ax,.085));armIK('left',t,[.6,.1,-.5],null,Math.max(q.two,q.rev))}
 // choke hold: both forearms around a neck in front of the chest
 if(q.choke>.02){const h=q.chokeH||.84;armIK('right',[.04,h,.3],[-.7,-.1,-.4],null,q.choke);armIK('left',[-.03,h+.04,.33],[.7,-.1,-.4],null,q.choke)}}
// rotation taking unit vector a onto unit vector b (Rodrigues), row-major 3x3
function fromTo(a,b){const v=vcross(a,b),c=cl(vdot(a,b),-1,1),s=Math.hypot(v[0],v[1],v[2]);if(s<1e-6){if(c>0)return R3I.slice();const p=Math.abs(a[0])<.9?[1,0,0]:[0,1,0],ax=vnorm(vcross(a,p));return axisAng(ax,PI)}return axisAng(vmul(v,1/s),Math.atan2(s,c))}
function axisAng(k,t){const c=Math.cos(t),s=Math.sin(t),C=1-c,[x,y,z]=k;return[c+x*x*C,x*y*C-z*s,x*z*C+y*s,y*x*C+z*s,c+y*y*C,y*z*C-x*s,z*x*C-y*s,z*y*C+x*s,c+z*z*C]}
const r3t=m=>[m[0],m[3],m[6],m[1],m[4],m[7],m[2],m[5],m[8]];
// two-bone arm IK in model space: shoulder->elbow->hand reaches `target`, elbow bends towards `pole`;
// `axisDown` (optional) turns the hand so the sword grip axis points that way. w = blend weight.
function armIK(side,target,pole,axisDown,w){const H=HB,U=H[side+'UpperArm'],Lo=H[side+'LowerArm'],Hd=H[side+'Hand'],B=PLD.bones;
 const S=SK.GP[U],L1=Math.hypot(...vsub(B[Lo].r,B[U].r)),L2=Math.hypot(...vsub(B[Hd].r,B[Lo].r));
 let T=target;if(w<1){const cur=SK.GP[Hd];T=vadd(cur,vmul(vsub(target,cur),w))}
 const st=vsub(T,S),d=cl(Math.hypot(...st),.05,L1+L2-.002),u=vnorm(st),pv=vsub(pole,vmul(u,vdot(pole,u))),v=vnorm(Math.hypot(...pv)>1e-4?pv:[0,-1,0]);
 const ca=cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1),sa=Math.sqrt(1-ca*ca),E=vadd(S,vadd(vmul(u,L1*ca),vmul(v,L1*sa)));
 const PG=SK.GR[SK.par[U]],r1=vnorm(vsub(B[Lo].r,B[U].r)),Gu=fromTo(r1,vnorm(vsub(E,S)));
 const r2=r3v(Gu,vnorm(vsub(B[Hd].r,B[Lo].r))),Gl=r3m(fromTo(r2,vnorm(vsub(vadd(S,vmul(u,d)),E))),Gu);
 SK.R[U]=r3m(r3t(PG),Gu);SK.R[Lo]=r3m(r3t(Gu),Gl);
 if(axisDown&&side==='right'){skUpdate();const g=SK.GR[Hd],cur=r3v(g,SK.gripAx),Gh=r3m(fromTo(vnorm(cur),axisDown),g);SK.R[Hd]=r3m(r3t(Gl),Gh)}
 skUpdate()}
