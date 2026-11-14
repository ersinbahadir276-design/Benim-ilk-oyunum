// ===================== math =====================
const PI=Math.PI,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),lp=(a,b,t)=>a+(b-a)*t,sst=(a,b,x)=>{x=cl((x-a)/(b-a),0,1);return x*x*(3-2*x)};
const hex=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255];
const vsub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],vadd=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],vmul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const vdot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],vcross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const vnorm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
const angd=(a,b)=>{let d=a-b;return Math.atan2(Math.sin(d),Math.cos(d))};   // shortest signed angle a-b
let _s=7;const rnd=()=>{_s=(_s*16807)%2147483647;return _s/2147483647},rr=(a,b)=>a+(b-a)*rnd();
function mmul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o}
function mpersp(fov,asp,n,f){const t=1/Math.tan(fov/2),o=new Float32Array(16);o[0]=t/asp;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o}
function mlook(e,t,up){const f=vnorm(vsub(t,e)),r=vnorm(vcross(f,up)),u=vcross(r,f),o=new Float32Array(16);
 o[0]=r[0];o[4]=r[1];o[8]=r[2];o[1]=u[0];o[5]=u[1];o[9]=u[2];o[2]=-f[0];o[6]=-f[1];o[10]=-f[2];o[12]=-vdot(r,e);o[13]=-vdot(u,e);o[14]=vdot(f,e);o[15]=1;return{m:o,f,r,u}}
function mtrs(p,rot){const[rx,ry,rz]=rot,cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz),o=new Float32Array(16);
 o[0]=cz*cy;o[1]=sz*cy;o[2]=-sy;o[4]=cz*sy*sx-sz*cx;o[5]=sz*sy*sx+cz*cx;o[6]=cy*sx;o[8]=cz*sy*cx+sz*sx;o[9]=sz*sy*cx-cz*sx;o[10]=cy*cx;o[12]=p[0];o[13]=p[1];o[14]=p[2];o[15]=1;return o}
const MID=mtrs([0,0,0],[0,0,0]);
const mpt=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
// 3x3 rotations (row-major arrays of 9) for the skeleton
const R3I=[1,0,0,0,1,0,0,0,1];
const rX=a=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,c,-s,0,s,c]},rY=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,s,0,1,0,-s,0,c]},rZ=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,-s,0,s,c,0,0,0,1]};
const r3m=(a,b)=>[a[0]*b[0]+a[1]*b[3]+a[2]*b[6],a[0]*b[1]+a[1]*b[4]+a[2]*b[7],a[0]*b[2]+a[1]*b[5]+a[2]*b[8],a[3]*b[0]+a[4]*b[3]+a[5]*b[6],a[3]*b[1]+a[4]*b[4]+a[5]*b[7],a[3]*b[2]+a[4]*b[5]+a[5]*b[8],a[6]*b[0]+a[7]*b[3]+a[8]*b[6],a[6]*b[1]+a[7]*b[4]+a[8]*b[7],a[6]*b[2]+a[7]*b[5]+a[8]*b[8]];
const r3v=(a,v)=>[a[0]*v[0]+a[1]*v[1]+a[2]*v[2],a[3]*v[0]+a[4]*v[1]+a[5]*v[2],a[6]*v[0]+a[7]*v[1]+a[8]*v[2]];
// ===================== geometry builders =====================
function sampleCR(K,n){const out=[],m=K.length-1,d=K[0].length;
 for(let i=0;i<=n;i++){const u=i/n*m,j=Math.min(Math.floor(u),m-1),t=u-j,p0=K[Math.max(j-1,0)],p1=K[j],p2=K[j+1],p3=K[Math.min(j+2,m)],q=[];
  for(let c=0;c<d;c++)q.push(.5*(2*p1[c]+(-p0[c]+p2[c])*t+(2*p0[c]-5*p1[c]+4*p2[c]-p3[c])*t*t+(-p0[c]+3*p1[c]-3*p2[c]+p3[c])*t*t*t));out.push(q)}
 return out}
function G(){return{P:[],N:[],U:[],C:[],W:[],I:[]}}
function normals(g){const P=g.P,I=g.I,N=new Array(P.length).fill(0);
 for(let i=0;i<I.length;i+=3){const a=I[i]*3,b=I[i+1]*3,c=I[i+2]*3,n=vcross([P[b]-P[a],P[b+1]-P[a+1],P[b+2]-P[a+2]],[P[c]-P[a],P[c+1]-P[a+1],P[c+2]-P[a+2]]);
  for(const k of[a,b,c]){N[k]+=n[0];N[k+1]+=n[1];N[k+2]+=n[2]}}
 for(let i=0;i<N.length;i+=3){const l=Math.hypot(N[i],N[i+1],N[i+2])||1;N[i]/=l;N[i+1]/=l;N[i+2]/=l}g.N=N}
function seamAvg(g,rows,cols){const N=g.N;for(let j=0;j<rows;j++){const a=(j*(cols+1))*3,b=(j*(cols+1)+cols)*3,n=vnorm([N[a]+N[b],N[a+1]+N[b+1],N[a+2]+N[b+2]]);for(const k of[a,b]){N[k]=n[0];N[k+1]=n[1];N[k+2]=n[2]}}}
function flip(g){for(let i=0;i<g.I.length;i+=3){const t=g.I[i+1];g.I[i+1]=g.I[i+2];g.I[i+2]=t}for(let i=0;i<g.N.length;i++)g.N[i]=-g.N[i]}
function grid(g,rows,cols){for(let j=0;j<rows-1;j++)for(let k=0;k<cols;k++){const a=j*(cols+1)+k,b=a+1,c=a+cols+1,d=c+1;g.I.push(a,c,b,b,c,d)}}
function loft(keys,seg,sub,o={}){const g=G(),K=keys.map(k=>[k.y,k.rx,k.rz===undefined?k.rx:k.rz,k.cx||0,k.cz||0]),R=sub>1?sampleCR(K,(K.length-1)*sub):K;
 let y0=1e9,y1=-1e9,big=0;R.forEach((r,j)=>{y0=Math.min(y0,r[0]);y1=Math.max(y1,r[0]);if(r[1]>R[big][1])big=j});
 R.forEach(r=>{const v=(r[0]-y0)/((y1-y0)||1),rx=Math.max(r[1],.0004),rz=Math.max(r[2],.0004);
  for(let k=0;k<=seg;k++){const a=k/seg*2*PI,m=o.fn?o.fn(a,r[0],v):1;g.P.push(r[3]+Math.cos(a)*rx*m,r[0],r[4]+Math.sin(a)*rz*m);g.U.push(k/seg*(o.us||1),v*(o.vs||1));
   const c=o.col?o.col(v,a):[1,1,1];g.C.push(c[0],c[1],c[2]);g.W.push(o.w?o.w(v,a):0)}});
 grid(g,R.length,seg);normals(g);seamAvg(g,R.length,seg);if(g.N[big*(seg+1)*3]<0)flip(g);return g}
function tube(pts,o){const n=o.n||16,seg=o.seg||6,S=sampleCR(pts,n),g=G(),flat=o.flat===undefined?1:o.flat;let Nv=vnorm(o.wide||[1,0,0]),mid=null;
 for(let i=0;i<=n;i++){const t=i/n,T=vnorm(vsub(S[Math.min(i+1,n)],S[Math.max(i-1,0)]));let q=vsub(Nv,vmul(T,vdot(Nv,T)));
  if(Math.hypot(q[0],q[1],q[2])<1e-4)q=vcross(T,[0,0,1]);Nv=vnorm(q);const B=vcross(T,Nv),r=Math.max(o.r(t),.0003);if(i===(n>>1))mid=Nv;
  for(let k=0;k<=seg;k++){const a=k/seg*2*PI,ca=Math.cos(a)*r,sa=Math.sin(a)*r*flat;
   g.P.push(S[i][0]+Nv[0]*ca+B[0]*sa,S[i][1]+Nv[1]*ca+B[1]*sa,S[i][2]+Nv[2]*ca+B[2]*sa);g.U.push(k/seg,t);
   const c=o.col?o.col(t,S[i]):[1,1,1];g.C.push(c[0],c[1],c[2]);g.W.push(o.w?o.w(t):0)}}
 grid(g,n+1,seg);normals(g);seamAvg(g,n+1,seg);const m=(n>>1)*(seg+1)*3;if(vdot([g.N[m],g.N[m+1],g.N[m+2]],mid)<0)flip(g);return g}
function sphere(nu,nv,fn,o={}){const g=G();
 for(let j=0;j<=nv;j++)for(let k=0;k<=nu;k++){const u=k/nu,th=j/nv*(o.th?o.th(u):PI),ph=2*PI*(u-.5),d=[Math.sin(ph)*Math.sin(th),Math.cos(th),Math.cos(ph)*Math.sin(th)],p=fn(d,u,j/nv);
  g.P.push(p[0],p[1],p[2]);g.U.push(u,th/PI);const c=o.col?o.col(d,j/nv):[1,1,1];g.C.push(c[0],c[1],c[2]);g.W.push(0)}
 grid(g,nv+1,nu);normals(g);seamAvg(g,nv+1,nu);const m=((nv>>1)*(nu+1)+(nu>>1))*3,c=o.c||[0,0,0];
 if(vdot([g.N[m],g.N[m+1],g.N[m+2]],[g.P[m]-c[0],g.P[m+1]-c[1],g.P[m+2]-c[2]])<0)flip(g);return g}
// flat-shaded box / prism helpers (each face has its own vertices)
function quad(g,a,b,c,d,col,uv){const n=vnorm(vcross(vsub(b,a),vsub(d,a))),o=g.P.length/3;for(const p of[a,b,c,d]){g.P.push(p[0],p[1],p[2]);g.N.push(n[0],n[1],n[2]);g.C.push(col[0],col[1],col[2]);g.W.push(0)}
 const q=uv||[0,0,1,0,1,1,0,1];for(let i=0;i<8;i++)g.U.push(q[i]);g.I.push(o,o+1,o+2,o,o+2,o+3)}
function tri(g,a,b,c,col){const n=vnorm(vcross(vsub(b,a),vsub(c,a))),o=g.P.length/3;for(const p of[a,b,c]){g.P.push(p[0],p[1],p[2]);g.N.push(n[0],n[1],n[2]);g.C.push(col[0],col[1],col[2]);g.W.push(0);g.U.push(0,0)}g.I.push(o,o+1,o+2)}
function box(g,x0,y0,z0,x1,y1,z1,col,top){const t=top||col;let q;if(x0>x1){q=x0;x0=x1;x1=q}if(y0>y1){q=y0;y0=y1;y1=q}if(z0>z1){q=z0;z0=z1;z1=q}
 quad(g,[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],col);quad(g,[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],col);
 quad(g,[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],col);quad(g,[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],col);
 quad(g,[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],t)}
function merge(list){const g=G();for(const h of list){const off=g.P.length/3;for(const k of['P','N','U','C','W'])for(let i=0;i<h[k].length;i++)g[k].push(h[k][i]);for(let i=0;i<h.I.length;i++)g.I.push(h.I[i]+off)}return g}
function bake(g,m){const P=g.P,N=g.N;for(let i=0;i<P.length;i+=3){const x=P[i],y=P[i+1],z=P[i+2];P[i]=m[0]*x+m[4]*y+m[8]*z+m[12];P[i+1]=m[1]*x+m[5]*y+m[9]*z+m[13];P[i+2]=m[2]*x+m[6]*y+m[10]*z+m[14];
 const a=N[i],b=N[i+1],c=N[i+2];N[i]=m[0]*a+m[4]*b+m[8]*c;N[i+1]=m[1]*a+m[5]*b+m[9]*c;N[i+2]=m[2]*a+m[6]*b+m[10]*c}return g}
function mirrorX(g){for(let i=0;i<g.P.length;i+=3){g.P[i]=-g.P[i];g.N[i]=-g.N[i]}for(let i=0;i<g.I.length;i+=3){const t=g.I[i+1];g.I[i+1]=g.I[i+2];g.I[i+2]=t}return g}
function tint(g,c){for(let i=0;i<g.C.length;i+=3){g.C[i]*=c[0];g.C[i+1]*=c[1];g.C[i+2]*=c[2]}return g}
// ===================== WebGL =====================
const cv=document.getElementById('c'),gl=cv.getContext('webgl',{antialias:true,alpha:false});
const VS=`attribute vec3 aP,aN,aC;attribute vec2 aU;attribute float aW;attribute vec4 aJ,aK,aM;uniform mat4 uVP,uM;uniform float uT,uOut,uSkin;uniform mediump float uPbr;uniform vec4 uB[66];
varying vec3 vW,vN,vC;varying vec2 vU;varying float vD,vK;varying vec4 vM;
vec3 bp(int i,vec4 p){return vec3(dot(uB[i],p),dot(uB[i+1],p),dot(uB[i+2],p));}
void main(){vec4 lp=vec4(aP,1.0);vec3 ln=aN;vM=aM;if(uSkin>0.5){vec4 n4=vec4(aN,0.0);int i0=int(aJ.x+0.5)*3,i1=int(aJ.y+0.5)*3,i2=int(aJ.z+0.5)*3,i3=int(aJ.w+0.5)*3;
 lp=vec4(bp(i0,lp)*aK.x+bp(i1,lp)*aK.y+bp(i2,lp)*aK.z+bp(i3,lp)*aK.w,1.0);ln=bp(i0,n4)*aK.x+bp(i1,n4)*aK.y+bp(i2,n4)*aK.z+bp(i3,n4)*aK.w;}vec4 w=uM*lp;vK=aW;float s=sin(uT*1.15+w.y*3.0+w.x*2.5)*0.02*aW*(1.0-uPbr);w.x+=s;w.z+=s*0.6;vec3 n=(uM*vec4(ln,0.0)).xyz;w.xyz+=n*uOut;vW=w.xyz;vN=n;vU=aU;vC=aC;gl_Position=uVP*w;vD=gl_Position.w;}`;
const FS=`precision mediump float;uniform sampler2D uTex;uniform float uUseTex,uUnlit,uIsOut,uShade,uCut,uBlend,uAlpha,uFlash,uPbr;uniform vec3 uCol,uL,uCam,uOutCol,uFogC,uSun,uEm,uTintM;uniform vec2 uFog;
varying vec3 vW,vN,vC;varying vec2 vU;varying float vD,vK;varying vec4 vM;
void main(){vec4 tx=vec4(1.0);if(uUseTex>0.5)tx=texture2D(uTex,vU);if(uCut>0.0&&tx.a<uCut)discard;float al=(uBlend>0.5?tx.a:1.0)*uAlpha;
float fg=clamp((vD-uFog.x)/(uFog.y-uFog.x),0.0,1.0);
if(uIsOut>0.5){gl_FragColor=vec4(mix(uOutCol*uSun,uFogC,fg),1.0);return;}
vec3 base=uCol*vC*tx.rgb;
if(uUnlit>0.5){gl_FragColor=vec4(mix(base,uFogC,fg*uShade),al);return;}
vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;float d=dot(n,uL);
if(uPbr>0.5){if(uUseTex>0.5)base=mix(uCol*vC,tx.rgb,tx.a*vK);base*=mix(vec3(1.0),uTintM,vM.w);float gl2=vM.x,mt=vM.y;vec3 v=normalize(uCam-vW),h=normalize(uL+v);
 float lt=mix(clamp((d+0.3)/1.3,0.0,1.0),smoothstep(0.0,0.2,d),0.6);float hm=n.y*0.5+0.5;vec3 amb=mix(vec3(0.34,0.29,0.25),mix(uFogC,vec3(0.56,0.63,0.82),0.55),hm)*uSun;
 vec3 df=base*(amb*0.78+uSun*lt*0.9)*(1.0-mt*0.38);float sp=pow(max(dot(n,h),0.0),mix(6.0,90.0,gl2))*gl2*1.6*lt;vec3 r=reflect(-v,n);float ek=clamp(r.y*0.5+0.5,0.0,1.0);
 vec3 cc=df+mix(vec3(0.06),base*2.3+0.05,mt)*sp*uSun+mix(vec3(0.1,0.09,0.08),vec3(0.62,0.68,0.85),ek)*uSun*mt*(0.15+gl2*0.5)*(base*1.8+0.06);
 float rm=pow(1.0-max(dot(n,v),0.0),3.0);cc+=vec3(0.22,0.3,0.5)*rm*0.2;cc=mix(cc,base*1.25+uEm*0.55,vM.z);cc=mix(cc,vec3(1.0),uFlash);gl_FragColor=vec4(mix(cc,uFogC,fg),al);return;}
float lit=smoothstep(-0.03,0.05,d);vec3 sh=base*vec3(0.68,0.69,0.9);vec3 c=mix(base,sh,(1.0-lit)*uShade)*uSun;
vec3 v=normalize(uCam-vW);float rim=pow(1.0-max(dot(n,v),0.0),3.0);c+=vec3(0.2,0.3,0.7)*rim*0.22*uShade;
c=mix(c,vec3(1.0),uFlash);gl_FragColor=vec4(mix(c,uFogC,fg),al);}`;
const GVS=`attribute vec3 aB,aV;uniform mat4 uVP;uniform vec3 uCen;uniform float uT,uTile,uHN,uHS,uHO;uniform sampler2D uH;varying vec3 vC;varying float vD;
float hc(vec4 t){return (t.r*255.0*256.0+t.g*255.0)/65535.0*140.0-20.0;}
vec4 tx(vec2 i){return texture2D(uH,(i+0.5)/uHN);}
void main(){vec2 b=aB.xy;vec2 w=b+uTile*floor((uCen.xz-b)/uTile+0.5);float d=distance(w,uCen.xz),R=uTile*0.5;
vec2 g=(w-vec2(uHO))/uHS;vec2 i=clamp(floor(g),0.0,uHN-2.0);vec2 f=clamp(g-i,0.0,1.0);
vec4 ta=tx(i),tb=tx(i+vec2(1.0,0.0)),tc=tx(i+vec2(0.0,1.0)),td=tx(i+vec2(1.0,1.0));float ha=hc(ta),hb=hc(tb),hcc=hc(tc),hd=hc(td);
float h=(f.x+f.y<1.0)?ha+(hb-ha)*f.x+(hcc-ha)*f.y:hd+(hcc-hd)*(1.0-f.x)+(hb-hd)*(1.0-f.y);
float dens=mix(mix(ta.b,tb.b,f.x),mix(tc.b,td.b,f.x),f.y),tint=mix(mix(ta.a,tb.a,f.x),mix(tc.a,td.a,f.x),f.y);
float s=(1.0-smoothstep(R*0.72,R,d))*step(aB.z,dens);float H=(0.3+0.55*fract(aB.z*7.31))*s*(1.0+tint*0.5);
float ph=uT*1.7+w.x*0.33+w.y*0.27;float sw=(sin(ph)+0.5*sin(ph*2.3+aV.z))*0.13*aV.y*aV.y*H*2.0;
float ang=aV.z;vec3 p=vec3(w.x+cos(ang)*aV.x*s+sw,h+aV.y*H,w.y+sin(ang)*aV.x*s+sw*0.6);
float k=fract(aB.z*13.7);vec3 top=mix(mix(vec3(0.36,0.62,0.22),vec3(0.55,0.70,0.26),k),mix(vec3(0.42,0.45,0.22),vec3(0.5,0.48,0.3),k),tint);
vC=mix(mix(vec3(0.10,0.28,0.10),vec3(0.16,0.2,0.1),tint),top,aV.y);gl_Position=uVP*vec4(p,1.0);vD=gl_Position.w;}`;
const GFS=`precision mediump float;uniform vec3 uFogC,uSun;uniform vec2 uFog;varying vec3 vC;varying float vD;
void main(){float fg=clamp((vD-uFog.x)/(uFog.y-uFog.x),0.0,1.0);gl_FragColor=vec4(mix(vC*uSun,uFogC,fg),1.0);}`;
let prog,gprog,loc={},gloc={},U16=true;
function mkProg(vs,fs){const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
 const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p}
function initGL(){prog=mkProg(VS,FS);try{if(gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS)>0)gprog=mkProg(GVS,GFS)}catch(e){gprog=null}
 for(const a of['aP','aN','aC','aU','aW','aJ','aK','aM'])loc[a]=gl.getAttribLocation(prog,a);loc.uSkin=gl.getUniformLocation(prog,'uSkin');loc.uB=gl.getUniformLocation(prog,'uB');
 for(const u of['uVP','uM','uT','uOut','uTex','uUseTex','uUnlit','uIsOut','uShade','uCut','uBlend','uAlpha','uFlash','uCol','uL','uCam','uOutCol','uFogC','uSun','uFog','uPbr','uEm','uTintM'])loc[u]=gl.getUniformLocation(prog,u);
 if(gprog)for(const a of['aB','aV'])gloc[a]=gl.getAttribLocation(gprog,a);if(gprog)for(const u of['uVP','uCen','uT','uTile','uFogC','uSun','uFog','uHN','uHS','uHO','uH'])gloc[u]=gl.getUniformLocation(gprog,u);
 gl.enable(gl.DEPTH_TEST)}
// geometry buffers (shared between objects); dyn=true keeps CPU copies for skinning
function geo(g,dyn){const b=(d,u)=>{const x=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,x);gl.bufferData(gl.ARRAY_BUFFER,d instanceof Float32Array?d:new Float32Array(d),u?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);return x};
 if(g.P.length/3>65535)throw new Error('mesh too large: '+g.P.length/3);
 const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,g.I instanceof Uint16Array?g.I:new Uint16Array(g.I),gl.STATIC_DRAW);
 const nv=g.P.length/3;return{P:b(g.P,dyn),N:b(g.N,dyn),C:b(g.C),U:b(g.U||new Float32Array(nv*2)),W:b(g.W||new Float32Array(nv)),J:g.J?b(g.J instanceof Float32Array?g.J:Float32Array.from(g.J)):null,Jn:g.J?g.J.length/nv:0,K:g.K?b(g.K):null,M:g.M?b(g.M):null,I:ib,n:g.I.length,nv}}
function freeGeo(ge){for(const k of['P','N','C','U','W','J','K','M','I'])if(ge[k])gl.deleteBuffer(ge[k])}
function unobj(m){const i=objs.indexOf(m);if(i>=0){objs.splice(i,1);objsDirty=true}}
function updGeo(ge,P,N){gl.bindBuffer(gl.ARRAY_BUFFER,ge.P);gl.bufferSubData(gl.ARRAY_BUFFER,0,P);gl.bindBuffer(gl.ARRAY_BUFFER,ge.N);gl.bufferSubData(gl.ARRAY_BUFFER,0,N)}
const objs=[];let objsDirty=true;
function obj(ge,o={}){const m={geo:ge,M:o.M||MID,col:o.col||[1,1,1],tex:o.tex||null,out:o.out||0,outCol:o.outCol||[.12,.12,.22],unlit:o.unlit?1:0,shade:o.shade===undefined?1:o.shade,cut:o.cut||0,blend:o.blend?1:0,
  order:o.order||0,alpha:1,flash:0,vis:true,pbr:o.pbr?1:0,em:o.em||[1,.32,.12],tintM:[1,1,1],bones:o.bones||null,pos:o.pos||null,cull:o.cull||0,noOff:o.noOff?1:0,ds:o.ds===undefined?1:o.ds};objs.push(m);objsDirty=true;return m}
function texture(src){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
 gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t}
const cnv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
let grassGeo=null,drawn=0,HTEX=null;
function drawAll(VP,cam,L,time,env){
 gl.depthMask(true);gl.viewport(0,0,cv.width,cv.height);gl.clearColor(env.fogC[0],env.fogC[1],env.fogC[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 if(objsDirty){objs.sort((a,b)=>(a.blend-b.blend)||(a.order-b.order));objsDirty=false}
 gl.useProgram(prog);for(const a of['aP','aN','aC','aU','aW'])gl.enableVertexAttribArray(loc[a]);
 gl.uniformMatrix4fv(loc.uVP,false,VP);gl.uniform1f(loc.uT,time);gl.uniform3fv(loc.uL,L);gl.uniform3fv(loc.uCam,cam);gl.uniform3fv(loc.uFogC,env.fogC);gl.uniform3fv(loc.uSun,env.sun);gl.uniform2f(loc.uFog,env.fog[0],env.fog[1]);
 let lastGeo=null;drawn=0;
 for(const m of objs){if(!m.vis)continue;
  if(m.cull){const dx=m.pos[0]-env.focus[0],dz=m.pos[2]-env.focus[2];if(dx*dx+dz*dz>m.cull*m.cull)continue}
  const ge=m.geo;if(ge!==lastGeo){const at=(l,b,s)=>{gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.vertexAttribPointer(l,s,gl.FLOAT,false,0,0)};
   at(loc.aP,ge.P,3);at(loc.aN,ge.N,3);at(loc.aC,ge.C,3);at(loc.aU,ge.U,2);at(loc.aW,ge.W,1);if(ge.J){gl.enableVertexAttribArray(loc.aJ);at(loc.aJ,ge.J,ge.Jn)}else{gl.disableVertexAttribArray(loc.aJ);gl.vertexAttrib4f(loc.aJ,0,0,0,0)}
   if(ge.K){gl.enableVertexAttribArray(loc.aK);at(loc.aK,ge.K,4)}else{gl.disableVertexAttribArray(loc.aK);gl.vertexAttrib4f(loc.aK,1,0,0,0)}if(ge.M){gl.enableVertexAttribArray(loc.aM);at(loc.aM,ge.M,4)}else{gl.disableVertexAttribArray(loc.aM);gl.vertexAttrib4f(loc.aM,0,0,0,0)}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ge.I);lastGeo=ge}
  if(m.bones){gl.uniform1f(loc.uSkin,1);gl.uniform4fv(loc.uB,m.bones)}else gl.uniform1f(loc.uSkin,0);
  gl.uniformMatrix4fv(loc.uM,false,m.M);gl.uniform3fv(loc.uCol,m.col);gl.uniform1f(loc.uUnlit,m.unlit);gl.uniform1f(loc.uShade,m.shade);gl.uniform1f(loc.uCut,m.cut);gl.uniform1f(loc.uBlend,m.blend);gl.uniform1f(loc.uAlpha,m.alpha);gl.uniform1f(loc.uFlash,m.flash);
  gl.uniform1f(loc.uPbr,m.pbr);gl.uniform3fv(loc.uEm,m.em);gl.uniform3fv(loc.uTintM,m.tintM);gl.uniform1f(loc.uUseTex,m.tex?1:0);if(m.tex)gl.bindTexture(gl.TEXTURE_2D,m.tex);
  if(m.blend){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);if(!m.noOff){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1-m.order,-1-m.order)}else gl.disable(gl.POLYGON_OFFSET_FILL)}
  else{gl.disable(gl.BLEND);gl.depthMask(true);gl.disable(gl.POLYGON_OFFSET_FILL)}
  if(m.ds)gl.disable(gl.CULL_FACE);else{gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK)}
  gl.uniform1f(loc.uIsOut,0);gl.uniform1f(loc.uOut,0);gl.drawElements(gl.TRIANGLES,ge.n,gl.UNSIGNED_SHORT,0);drawn++;
  if(m.out>0&&!m.blend&&!(m.pos&&(m.pos[0]-cam[0])*(m.pos[0]-cam[0])+(m.pos[2]-cam[2])*(m.pos[2]-cam[2])>900)){gl.enable(gl.CULL_FACE);gl.cullFace(gl.FRONT);gl.uniform1f(loc.uIsOut,1);gl.uniform1f(loc.uOut,m.out);gl.uniform3fv(loc.uOutCol,m.outCol);gl.drawElements(gl.TRIANGLES,ge.n,gl.UNSIGNED_SHORT,0)}}
 for(const a of['aP','aN','aC','aU','aW','aJ','aK','aM'])gl.disableVertexAttribArray(loc[a]);
 gl.disable(gl.BLEND);gl.depthMask(true);gl.disable(gl.POLYGON_OFFSET_FILL);gl.disable(gl.CULL_FACE);
 if(grassGeo&&HTEX&&gprog&&grassGeo.n>0){gl.useProgram(gprog);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,HTEX);gl.uniform1i(gloc.uH,0);gl.uniform1f(gloc.uHN,HN);gl.uniform1f(gloc.uHS,HS);gl.uniform1f(gloc.uHO,-WS);gl.uniformMatrix4fv(gloc.uVP,false,VP);gl.uniform3fv(gloc.uCen,env.focus);gl.uniform1f(gloc.uT,time);gl.uniform1f(gloc.uTile,grassGeo.tile);
  gl.uniform3fv(gloc.uFogC,env.fogC);gl.uniform3fv(gloc.uSun,env.sun);gl.uniform2f(gloc.uFog,env.fog[0],env.fog[1]);
  gl.enableVertexAttribArray(gloc.aB);gl.enableVertexAttribArray(gloc.aV);gl.bindBuffer(gl.ARRAY_BUFFER,grassGeo.B);gl.vertexAttribPointer(gloc.aB,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,grassGeo.V);gl.vertexAttribPointer(gloc.aV,3,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,grassGeo.n);gl.disableVertexAttribArray(gloc.aB);gl.disableVertexAttribArray(gloc.aV)}}
function makeGrass(count,tile){const B=new Float32Array(count*9),V=new Float32Array(count*9);
 for(let i=0;i<count;i++){const x=rnd()*tile,z=rnd()*tile,r=rnd(),a=rnd()*6.283,w=.045+rnd()*.03;
  for(let k=0;k<3;k++){B[i*9+k*3]=x;B[i*9+k*3+1]=z;B[i*9+k*3+2]=r;V[i*9+k*3]=k===0?-w:k===1?w:0;V[i*9+k*3+1]=k===2?1:0;V[i*9+k*3+2]=a}}
 const mk=d=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,d,gl.STATIC_DRAW);return b};grassGeo={B:mk(B),V:mk(V),n:count*3,tile}}

// ---------- sculpted models (data/models.js, built by tools/sculpt): gzip+base64 -> typed arrays
const MODEL={};
async function decodeModels(){if(typeof MODELS==='undefined'||typeof DecompressionStream==='undefined')return;
 for(const k in MODELS){try{const bin=Uint8Array.from(atob(MODELS[k]),c=>c.charCodeAt(0)),buf=await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer(),dv=new DataView(buf);
  let q=0;const nv=dv.getUint32(0,true),ni=dv.getUint32(4,true);q=8;const lo=[],sc=[];for(let a=0;a<3;a++){lo.push(dv.getFloat32(q,true));q+=4}for(let a=0;a<3;a++){sc.push(dv.getFloat32(q,true));q+=4}
  const P=new Float32Array(nv*3),N=new Float32Array(nv*3),C=new Float32Array(nv*3),M=new Float32Array(nv*4),J=new Float32Array(nv*4),K=new Float32Array(nv*4),I=new Uint16Array(ni);
  for(let i=0;i<nv*3;i++){P[i]=lo[i%3]+dv.getUint16(q,true)*sc[i%3];q+=2}for(let i=0;i<nv*3;i++)N[i]=dv.getInt8(q++)/127;for(let i=0;i<nv*3;i++)C[i]=dv.getUint8(q++)/255*1.6;
  for(let i=0;i<nv*4;i++)M[i]=dv.getUint8(q++)/255;for(let i=0;i<nv*4;i++)J[i]=dv.getUint8(q++);for(let i=0;i<nv*4;i++)K[i]=dv.getUint8(q++)/255;for(let i=0;i<ni;i++){I[i]=dv.getUint16(q,true);q+=2}const U=new Float32Array(nv*2),Wm=new Float32Array(nv);if(q+nv*5<=buf.byteLength){for(let i=0;i<nv*2;i++){U[i]=dv.getUint16(q,true)/65535;q+=2}for(let i=0;i<nv;i++)Wm[i]=dv.getUint8(q++)/255}
  MODEL[k]={P,N,C,M,J,K,I,U,Wm,nv}}catch(e){console.warn('model',k,e)}}}
