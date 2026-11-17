// ===================== the dragon (your GLB: Tarisland Dragon) =====================
// Skeleton animation from the embedded clips (cross-faded), CPU skinning like the hero. Learnable pattern:
// GROUND  roar -> walk in -> CLAW (2.4 s raised claw + red circle) -> 1.7 s open -> second claw -> take-off
// AIR     hover -> FIRE BREATH (rears up and inhales 2.7 s, red line on the ground) -> sweep leaves burning ground -> x2
// LAND    down (shockwave circle) -> 3.2 s tired and open -> back to ground pattern
const DS=.2;let DRAGON=null;const BURNS=[],FLAMES=[];
const b64u8=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
function dragonInit(TX){const D=DRG,nb=D.par.length,groups=[];
 D.clipData={};for(const c of D.clips){const u=b64u8(c.D);D.clipData[c.name]={nf:c.nf,len:c.len,a:new Int16Array(u.buffer)}}
 D.nT=D.tB.filter(x=>x).length;D.tIdx=[];let k=0;for(let i=0;i<nb;i++)D.tIdx.push(D.tB[i]?k++:-1);
 for(let gi=0;gi<D.groups.length;gi++){const g=D.groups[gi],P0=new Float32Array(b64u8(g.P).buffer),N8=new Int8Array(b64u8(g.N).buffer),U=new Float32Array(b64u8(g.U).buffer),J=b64u8(g.J),W8=b64u8(g.W),I=new Uint16Array(b64u8(g.I).buffer);
  const nv=g.nv,N=new Float32Array(nv*3),W=new Float32Array(nv*4);for(let i=0;i<nv;i++){N[i*3]=N8[i*4]/127;N[i*3+1]=N8[i*4+1]/127;N[i*3+2]=N8[i*4+2]/127}for(let i=0;i<nv*4;i++)W[i]=W8[i]/255;
  const s={restP:P0,restN:N,J,W,nv,P:new Float32Array(nv*3),N:new Float32Array(nv*3)};s.geo=geo({P:P0,N,U,C:new Float32Array(nv*3).fill(1),W:new Float32Array(nv),I},true);
  s.o=obj(s.geo,{tex:TX['d_'+gi],out:.0,shade:.85,pos:[0,0,0],cull:240,ds:1});groups.push(s)}
 const d={x:LAIR[0],z:LAIR[1],y:0,yaw:PI,hp:9000,max:9000,phase:1,fy:0,pitch:0,roll:0,gm:0,am:0,cd:0,st:'sleep',t:0,clip:'stand',ct:0,prev:null,pt:0,fade:0,fadeT:.3,speed:1,claws:0,breaths:0,aware:0,ls:[0,0],group:'dragon',eye:4,hyaw:0,
  groups,G:new Float32Array(nb*16),S:new Float32Array(nb*12),L:new Float32Array(nb*10),L2:new Float32Array(nb*10),dead:0,flash:0,hitDone:false,breathA:null,breathB:null,emitT:0,dmgT:0,M:MID,spawn:[LAIR[0],LAIR[1]]};
 d.hostile=()=>d.st!=='sleep'&&d.st!=='return'&&!d.dead;d.open=()=>/^(tired|stagger|downed|crash|rise)$/.test(d.st)||(d.st==='claw'&&d.ct>3.4&&d.ct<4.1)||(d.st==='tail'&&d.t>(.6+.85)/dSpd(d))||(d.st==='nova'&&d.t>1.7);
 d.alt=()=>{const p=dBone(d,D.pelvis);return p[1]-hAt(d.x,d.z)-2.8};
 d.hurt=(dmg,dx,dz)=>{if(d.dead)return false;if(d.st==='awaken'){d.flash=.3;return false}if(/^(downed|crash|tired)$/.test(d.st))dmg*=1.35;d.hp-=dmg;d.flash=1;if(d.st==='sleep'){dWake(d)}
  if(d.hp<=0){d.hp=0;d.dead=1;d.st='dead';d.t=0;if(P.st==='ride')rideOff(true);if(P.st==='grabbed'&&GRAB.by===d)releaseHero(false,false);dRing(d,false);DSHOTS.length=0;dGo(d,'die',.4,1);bossBanner('EJDERHA DÜŞTÜ','Kül Kanat yenildi');return true}
  const ph=d.hp<d.max*.33?3:d.hp<d.max*.66?2:1;if(ph>d.phase){d.phase=ph;dAwaken(d)}return false};
 d.onParried=()=>{if(d.st==='claw'||d.st==='bite'){d.pitch=0;d.st='stagger';d.t=0;dPlay(d,'taitou',.25);d.flash=1}};
 d.hitPts=()=>[[...dBone(d,D.bones.chest),1.7],[...dBone(d,D.pelvis),1.7],[...dBone(d,D.bones.neck),1.1],[...dBone(d,D.headBone),.95],[...dBone(d,D.rHand),.7],[...dBone(d,D.lHand),.7]];
 d.calmDown=()=>{if(!d.dead&&d.hostile()){d.st='return';d.t=0;dPlay(d,'walk',.4)}};
 d.onKilled=()=>{SYS.dragon=1;addXP(1500,P);SYS.pts+=5;note('[Sistem] EJDERHA ALT EDİLDİ! +1500 XP · +5 stat puanı','gold');note('[Sistem] Unvan kazanıldı: «Ejder Avcısı»','gold');SYS.titles.push('Ejder Avcısı');SYS.title='Ejder Avcısı';save(P)};
 D.bones={chest:D.names.findIndex(n=>n.startsWith('Bip001-Spine2')),neck:D.names.findIndex(n=>n.startsWith('Bip001-Neck1'))};
 DRAGON=d;dPlay(d,'stand',0);dSample(d,0);dSkin(d)}
function dPlay(d,name,fade=.3,speed=1){if(d.clip===name&&fade>0)return;d.prev=d.clip;d.pt=d.ct;d.clip=name;d.ct=0;d.fade=fade>0?0:1;d.fadeT=fade;d.speed=speed}
// local TRS of every bone for clip `name` at time t, into arr (q xyzw, t xyz, s xyz)
function dLocal(name,t,arr,loop){const D=DRG,c=D.clipData[name],nb=D.par.length,fr=D.fps*(loop?(t%c.len):Math.min(t,c.len)),i0=Math.min(c.nf-1,Math.floor(fr)),i1=Math.min(c.nf-1,i0+1),a=fr-i0,stride=nb*4+D.nT*3;
 const A=c.a,o0=i0*stride,o1=i1*stride;
 for(let i=0;i<nb;i++){const q0=o0+i*4,q1=o1+i*4;let x1=A[q1],y1=A[q1+1],z1=A[q1+2],w1=A[q1+3];const x0=A[q0],y0=A[q0+1],z0=A[q0+2],w0=A[q0+3];if(x0*x1+y0*y1+z0*z1+w0*w1<0){x1=-x1;y1=-y1;z1=-z1;w1=-w1}
  let x=x0+(x1-x0)*a,y=y0+(y1-y0)*a,z=z0+(z1-z0)*a,w=w0+(w1-w0)*a;const l=Math.hypot(x,y,z,w)||1,o=i*10;arr[o]=x/l;arr[o+1]=y/l;arr[o+2]=z/l;arr[o+3]=w/l;
  const ti=D.tIdx[i];if(ti>=0){const s=D.tScale[i],p0=o0+nb*4+ti*3,p1=o1+nb*4+ti*3;arr[o+4]=(A[p0]+(A[p1]-A[p0])*a)*s;arr[o+5]=(A[p0+1]+(A[p1+1]-A[p0+1])*a)*s;arr[o+6]=(A[p0+2]+(A[p1+2]-A[p0+2])*a)*s}
  else{const r=D.restT[i];arr[o+4]=r[0];arr[o+5]=r[1];arr[o+6]=r[2]}const sc=D.restS[i];arr[o+7]=sc[0];arr[o+8]=sc[1];arr[o+9]=sc[2]}}
const DLOOP={stand:1,walk:1,skill08:1};
function dSample(d,dt){const D=DRG,nb=D.par.length,L=d.L,L2=d.L2;d.ct+=dt*d.speed;d.pt+=dt;if(d.fade<1)d.fade=Math.min(1,d.fade+dt/Math.max(.01,d.fadeT));
 dLocal(d.clip,d.ct,L,DLOOP[d.clip]);if(d.fade<1&&d.prev){dLocal(d.prev,d.pt,L2,DLOOP[d.prev]);const f=d.fade;
  for(let i=0;i<nb;i++){const o=i*10;let s=L2[o]*L[o]+L2[o+1]*L[o+1]+L2[o+2]*L[o+2]+L2[o+3]*L[o+3]<0?-1:1;for(let k=0;k<4;k++)L[o+k]=L2[o+k]*(1-f)+L[o+k]*s*f;const l=Math.hypot(L[o],L[o+1],L[o+2],L[o+3])||1;for(let k=0;k<4;k++)L[o+k]/=l;for(let k=4;k<10;k++)L[o+k]=L2[o+k]*(1-f)+L[o+k]*f}}
 // globals (column-major 4x4) and skin matrices (3x4 rows) = G * IBM
 const G=d.G,S=d.S;for(let i=0;i<nb;i++){const o=i*10,x=L[o],y=L[o+1],z=L[o+2],w=L[o+3],sx=L[o+7],sy=L[o+8],sz=L[o+9];
  const m=[(1-2*(y*y+z*z))*sx,2*(x*y+z*w)*sx,2*(x*z-y*w)*sx,0,2*(x*y-z*w)*sy,(1-2*(x*x+z*z))*sy,2*(y*z+x*w)*sy,0,2*(x*z+y*w)*sz,2*(y*z-x*w)*sz,(1-2*(x*x+y*y))*sz,0,L[o+4],L[o+5],L[o+6],1];
  const p=D.par[i],par=p<0?D.roots[i]:G.subarray(p*16,p*16+16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)G[i*16+c*4+r]=par[r]*m[c*4]+par[4+r]*m[c*4+1]+par[8+r]*m[c*4+2]+par[12+r]*m[c*4+3];
  const g=G.subarray(i*16,i*16+16),B=D.ibm[i];for(let r=0;r<3;r++)for(let c=0;c<4;c++)S[i*12+r*4+c]=g[r]*B[c*4]+g[4+r]*B[c*4+1]+g[8+r]*B[c*4+2]+g[12+r]*B[c*4+3]}}
function dSkin(d){const S=d.S;for(const s of d.groups){const p=s.restP,q=s.restN,J=s.J,W=s.W,P2=s.P,N2=s.N;
 for(let v=0;v<s.nv;v++){const v3=v*3,v4=v*4,x=p[v3],y=p[v3+1],z=p[v3+2],nx=q[v3],ny=q[v3+1],nz=q[v3+2];let px=0,py=0,pz=0,ax=0,ay=0,az=0;
  for(let k=0;k<4;k++){const w=W[v4+k];if(w===0)continue;const o=J[v4+k]*12;px+=w*(S[o]*x+S[o+1]*y+S[o+2]*z+S[o+3]);py+=w*(S[o+4]*x+S[o+5]*y+S[o+6]*z+S[o+7]);pz+=w*(S[o+8]*x+S[o+9]*y+S[o+10]*z+S[o+11]);
   ax+=w*(S[o]*nx+S[o+1]*ny+S[o+2]*nz);ay+=w*(S[o+4]*nx+S[o+5]*ny+S[o+6]*nz);az+=w*(S[o+8]*nx+S[o+9]*ny+S[o+10]*nz)}
  P2[v3]=px;P2[v3+1]=py;P2[v3+2]=pz;N2[v3]=ax;N2[v3+1]=ay;N2[v3+2]=az}updGeo(s.geo,P2,N2)}}
function dMatrix(d){const M=mmul(mtrs([d.x,d.y,d.z],[0,d.yaw,0]),mtrs([0,0,0],[d.pitch||0,0,d.roll||0]));for(let k=0;k<12;k++)M[k]*=DS;return M}
function dBone(d,i){const g=d.G,o=i*16;return mpt(d.M,[g[o+12],g[o+13],g[o+14]])}
function dMouth(d){const h=dBone(d,DRG.headBone),n=dBone(d,DRG.bones.neck),f=vnorm(vsub(h,n));return vadd(h,vmul(f,1.3))}
function spawnFlame(from,to){let o=FLAMES.find(f=>f.life<=0);if(!o){if(FLAMES.length>70)return;o={life:0,ob:obj(FIREGEO(),{unlit:1,col:[1,.55,.15],shade:0,pos:[0,0,0],cull:300})};FLAMES.push(o)}o.life=.42;o.max=.42;o.a=from;o.b=to;o.ob.vis=true}
function updateDragonFx(dt){for(const f of FLAMES){if(f.life<=0){f.ob.vis=false;continue}f.life-=dt;const u=1-f.life/f.max,p=[lp(f.a[0],f.b[0],u),lp(f.a[1],f.b[1],u),lp(f.a[2],f.b[2],u)],s=.6+u*2.4;f.ob.M=mtrs(p,[rnd()*.5,rnd()*6,rnd()*.5]);for(let k=0;k<12;k++)f.ob.M[k]*=s;f.ob.pos=p;f.ob.col=[1,lp(.75,.3,u),lp(.3,.05,u)]}
 for(let i=BURNS.length-1;i>=0;i--){const b=BURNS[i];b.t+=dt;if(b.t>b.life){if(b.ob){b.ob.vis=false;BURNPOOL.push(b.ob)}BURNS.splice(i,1);continue}
  if(!b.ob){b.ob=BURNPOOL.pop()||obj(FIREGEO(),{unlit:1,col:[1,.5,.1],shade:0,pos:[0,0,0],cull:200});b.ob.vis=true}const k=(1-b.t/b.life),s=(.7+.3*Math.sin(GT.time*14+b.x))*Math.min(1,b.t*6)*k*1.4;b.ob.M=mtrs([b.x,hAt(b.x,b.z),b.z],[0,b.x,0]);b.ob.M[0]*=s;b.ob.M[5]*=s*1.3;b.ob.M[10]*=s;b.ob.pos=[b.x,0,b.z]}}
const BURNPOOL=[];
function drawDragon(){const d=DRAGON;if(!d)return;const dist=Math.hypot(P.x-d.x,P.z-d.z),vis=dist<230;for(const s of d.groups){s.o.vis=vis;s.o.M=d.M;s.o.pos=[d.x,d.y,d.z];s.o.flash=d.flash*.4}if(vis)dSkin(d)}
