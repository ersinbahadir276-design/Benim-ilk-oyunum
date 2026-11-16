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
 const d={x:LAIR[0],z:LAIR[1],y:0,yaw:PI,hp:1400,max:1400,st:'sleep',t:0,clip:'stand',ct:0,prev:null,pt:0,fade:0,fadeT:.3,speed:1,claws:0,breaths:0,aware:0,ls:[0,0],group:'dragon',eye:4,hyaw:0,
  groups,G:new Float32Array(nb*16),S:new Float32Array(nb*12),L:new Float32Array(nb*10),L2:new Float32Array(nb*10),dead:0,flash:0,hitDone:false,breathA:null,breathB:null,emitT:0,dmgT:0,M:MID,spawn:[LAIR[0],LAIR[1]]};
 d.hostile=()=>d.st!=='sleep'&&d.st!=='return'&&!d.dead;d.open=()=>d.st==='tired'||d.st==='stagger'||(d.st==='claw'&&d.ct>3.5&&d.ct<5.2);
 d.alt=()=>{const p=dBone(d,D.pelvis);return p[1]-hAt(d.x,d.z)-2.8};
 d.hurt=(dmg,dx,dz)=>{if(d.dead)return false;d.hp-=dmg;d.flash=1;if(d.st==='sleep'){dWake(d)}if(d.hp<=0){d.hp=0;d.dead=1;d.st='dead';d.t=0;dPlay(d,'die',.4);return true}return false};
 d.onParried=()=>{if(d.st==='claw'){d.st='stagger';d.t=0;dPlay(d,'taitou',.25);d.flash=1}};
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
function dMatrix(d){const M=mtrs([d.x,d.y,d.z],[0,d.yaw,0]);for(let k=0;k<12;k++)M[k]*=DS;return M}
function dBone(d,i){const g=d.G,o=i*16;return mpt(d.M,[g[o+12],g[o+13],g[o+14]])}
function dMouth(d){const h=dBone(d,DRG.headBone),n=dBone(d,DRG.bones.neck),f=vnorm(vsub(h,n));return vadd(h,vmul(f,1.3))}
function dWake(d){d.st='roar';d.t=0;dPlay(d,'taitou',.35,1.4);sfx.roar(1);CAM.shake=Math.max(CAM.shake,.5);note('[!] EJDERHA UYANDI! Saldırı düzenini izle: pençeyi kaldırınca, havada nefes alınca kaç.','red');alertGroup(d,P,0,[])}
function dFace(d,tx,tz,dt,rate){d.yaw+=cl(angd(Math.atan2(tx-d.x,tz-d.z),d.yaw),-rate*dt,rate*dt)}
function updateDragon(d,dt){if(!d)return;d.t+=dt;d.flash=Math.max(0,d.flash-dt*4);const dist=Math.hypot(P.x-d.x,P.z-d.z),fromLair=Math.hypot(P.x-d.spawn[0],P.z-d.spawn[1]);
 if(dist<260){dSample(d,dt);d.M=dMatrix(d)}
 d.y=hAt(d.x,d.z);if(d.dead){d.st='dead';return}
 const sees=senseTick(d,P,dt,58,1.15);
 if(d.st==='sleep'){if(fillAware(d,P,sees,dt,58)||d.aware>=.8||(P.noise>0&&dist<P.noise*2))dWake(d);if(d.ct>3)dPlay(d,'stand',.3,.6);return}
 if(d.st!=='return'&&(fromLair>140||!P.alive)){d.calmDown();return}
 switch(d.st){
 case'return':{dFace(d,d.spawn[0],d.spawn[1],dt,1.2);const dd=Math.hypot(d.spawn[0]-d.x,d.spawn[1]-d.z);if(dd>2){d.x+=Math.sin(d.yaw)*3*dt;d.z+=Math.cos(d.yaw)*3*dt}else{d.st='sleep';d.t=0;d.hp=Math.min(d.max,d.hp+400);d.aware=0;dPlay(d,'stand',.4,.6)}break}
 case'roar':if(d.t>2.2){d.st='approach';d.t=0;d.claws=0;dPlay(d,'walk',.4,1.1)}break;
 case'approach':{dFace(d,P.x,P.z,dt,1.1);const fa=Math.abs(angd(Math.atan2(P.x-d.x,P.z-d.z),d.yaw));if(dist>7.5){const p=collide(d.x+Math.sin(d.yaw)*3.6*dt,d.z+Math.cos(d.yaw)*3.6*dt,2.2);d.x=p[0];d.z=p[1]}
  if(d.clip!=='walk')dPlay(d,'walk',.3,1.1);if(dist<4.6&&d.t>.4&&!(d.stompCd>GT.clock)){d.st='stomp';d.t=0;d.hitDone=false;d.stompCd=GT.clock+4;dangerRing(d.x,d.z,6.2,1.15);dPlay(d,'taitou',.25);sfx.roar(.8);break}
  if(dist<9.5&&fa<.45&&d.t>.6){d.st='claw';d.t=0;d.hitDone=false;dPlay(d,'attack01',.25,1);sfx.roar(.7)}
  if(d.t>9&&d.claws<2){d.st='claw';d.t=0;d.hitDone=false;dPlay(d,'attack01',.25,1)}break}
 // standing under the dragon is not safe: it rears and stamps (red ring, jump to avoid)
 case'stomp':{if(!d.hitDone&&d.t>1.15){d.hitDone=true;CAM.shake=Math.max(CAM.shake,.8);sfx.thud();spawnSparks(d.x,d.y+.3,d.z,30,[.6,.55,.45],7);if(dist<6.2&&!P.air){const k=dist||1;hitPlayer({src:d,dmg:26,guard:60,dir:[(P.x-d.x)/k,(P.z-d.z)/k],knock:'down',power:1.5,parryable:false})}}
  if(d.t>2.1){d.st='approach';d.t=0;dPlay(d,'walk',.3,1.1)}break}
 case'claw':{if(d.ct<1.9)dFace(d,P.x,P.z,dt,.9);
  if(!d.hitDone&&d.ct>2.65&&d.ct<3.6){const c=dBone(d,DRG.rHand),hit=Math.hypot(c[0]-P.x,c[2]-P.z)<2.3&&c[1]<P.y+2.2;
   if(hit){d.hitDone=true;const k=Math.hypot(P.x-d.x,P.z-d.z)||1;hitPlayer({src:d,dmg:32,guard:70,dir:[(P.x-d.x)/k,(P.z-d.z)/k],knock:'down',power:1.7})}}
  if(d.ct>2.7&&d.ct<2.75+dt){CAM.shake=Math.max(CAM.shake,dist<14?.45:.15);sfx.thud();if(!d.hitDone&&dist<3.6&&!P.air){d.hitDone=true;hitPlayer({src:d,dmg:16,guard:35,dir:[P.x-d.x,P.z-d.z],knock:'flinch',parryable:false})}}
  if(d.ct>5.2){d.claws++;if(d.claws>=2){d.st='takeoff';d.t=0;dPlay(d,'up',.3,1);sfx.wings()}else{d.st='approach';d.t=0;dPlay(d,'walk',.4,1.1)}}break}
 case'stagger':if(d.t>1.8){d.st='approach';d.t=0;dPlay(d,'walk',.4,1.1)}break;
 case'takeoff':if(d.ct>.7&&d.ct<.75+dt){CAM.shake=Math.max(CAM.shake,.35);sfx.wings()}if(d.ct>=1.45){d.st='hover';d.t=0;d.breaths=0;dPlay(d,'skill08',.3,1)}break;
 case'hover':{const k=dist||1,ax=P.x-(P.x-d.x)/k*13,az=P.z-(P.z-d.z)/k*13;dFace(d,P.x,P.z,dt,1.6);const mx=ax-d.x,mz=az-d.z,ml=Math.hypot(mx,mz);if(ml>.5){const sp=Math.min(6,ml*1.5);const p=collide(d.x+mx/ml*sp*dt,d.z+mz/ml*sp*dt,1.5);d.x=p[0];d.z=p[1]}
  if(Math.floor(d.t/.45)!==Math.floor((d.t-dt)/.45))sfx.wings(.35);
  if(d.t>(d.breaths?1.6:2.4)){if(d.breaths>=2){d.st='land';d.t=0;dPlay(d,'down',.3,1);d.landAt=[d.x,d.z]}else{d.st='breath';d.t=0;d.breathA=null;d.emitT=0;dPlay(d,'skill10',.3,1);sfx.inhale()}}break}
 case'breath':{dFace(d,P.x,P.z,dt,d.ct<2.2?1.4:.35);
  if(d.ct>=2.0&&!d.breathA){const k=dist||1,dx=(P.x-d.x)/k,dz=(P.z-d.z)/k,px=-dz,pz=dx;d.breathA=[P.x-px*7-dx*2,P.z-pz*7-dz*2];d.breathB=[P.x+px*7+dx*2,P.z+pz*7+dz*2];if(Math.random()<.5){const t=d.breathA;d.breathA=d.breathB;d.breathB=t}}
  if(d.ct>2.7&&d.ct<4.4&&d.breathA){const u=(d.ct-2.7)/1.7,T=[lp(d.breathA[0],d.breathB[0],u),lp(d.breathA[1],d.breathB[1],u)],m=dMouth(d);d.breathT=T;
   d.emitT-=dt;if(d.emitT<=0){d.emitT=.04;spawnFlame(m,[T[0]+rr(-.8,.8),hAt(T[0],T[1])+.3,T[1]+rr(-.8,.8)])}
   if((d.burnT=(d.burnT||0)-dt)<=0){d.burnT=.13;BURNS.push({x:T[0]+rr(-.4,.4),z:T[1]+rr(-.4,.4),t:0,life:6})}
   d.dmgT=(d.dmgT||0)-dt;if(d.dmgT<=0&&Math.hypot(P.x-T[0],P.z-T[1])<1.9&&!P.air){d.dmgT=.3;hitPlayer({src:d,dmg:9,guard:24,dir:[P.x-d.x,P.z-d.z],knock:'flinch',parryable:false})}
   if(Math.floor(d.ct/.2)!==Math.floor((d.ct-dt)/.2))sfx.fire()}else d.breathT=null;
  if(d.ct>5.5){d.breaths++;d.st='hover';d.t=0;dPlay(d,'skill08',.3,1)}break}
 case'land':{if(d.ct>.56&&!d.landed){d.landed=true;CAM.shake=Math.max(CAM.shake,dist<20?.7:.25);sfx.thud();spawnSparks(d.x,d.y+.3,d.z,24,[.6,.55,.45],6);if(dist<5.5)hitPlayer({src:d,dmg:18,guard:40,dir:[P.x-d.x,P.z-d.z],knock:'down',power:1.2,parryable:false})}
  if(d.ct>=1.75){d.landed=false;d.st='tired';d.t=0;dPlay(d,'stand',.3,.5);note('[Sistem] Ejderha yoruldu: şimdi saldır!','gold')}break}
 case'tired':if(d.t>3.2){d.st='approach';d.t=0;d.claws=0;dPlay(d,'walk',.4,1.1)}break}
 // burning ground: hurts while standing in it; dodging through it still burns (it is fire, not a blow)
 if(P.alive&&(P.burnT=(P.burnT||0)-dt)<=0)for(const b of BURNS)if(b.t<b.life&&Math.hypot(P.x-b.x,P.z-b.z)<1.3&&!P.air){P.burnT=.5;const inv=P.inv;P.inv=0;hitPlayer({dmg:4,knock:'none',unblockable:true,parryable:false});P.inv=inv;break}}
function spawnFlame(from,to){let o=FLAMES.find(f=>f.life<=0);if(!o){if(FLAMES.length>70)return;o={life:0,ob:obj(FIREGEO(),{unlit:1,col:[1,.55,.15],shade:0,pos:[0,0,0],cull:300})};FLAMES.push(o)}o.life=.42;o.max=.42;o.a=from;o.b=to;o.ob.vis=true}
function updateDragonFx(dt){for(const f of FLAMES){if(f.life<=0){f.ob.vis=false;continue}f.life-=dt;const u=1-f.life/f.max,p=[lp(f.a[0],f.b[0],u),lp(f.a[1],f.b[1],u),lp(f.a[2],f.b[2],u)],s=.6+u*2.4;f.ob.M=mtrs(p,[rnd()*.5,rnd()*6,rnd()*.5]);for(let k=0;k<12;k++)f.ob.M[k]*=s;f.ob.pos=p;f.ob.col=[1,lp(.75,.3,u),lp(.3,.05,u)]}
 for(let i=BURNS.length-1;i>=0;i--){const b=BURNS[i];b.t+=dt;if(b.t>b.life){if(b.ob){b.ob.vis=false;BURNPOOL.push(b.ob)}BURNS.splice(i,1);continue}
  if(!b.ob){b.ob=BURNPOOL.pop()||obj(FIREGEO(),{unlit:1,col:[1,.5,.1],shade:0,pos:[0,0,0],cull:200});b.ob.vis=true}const k=(1-b.t/b.life),s=(.7+.3*Math.sin(GT.time*14+b.x))*Math.min(1,b.t*6)*k*1.4;b.ob.M=mtrs([b.x,hAt(b.x,b.z),b.z],[0,b.x,0]);b.ob.M[0]*=s;b.ob.M[5]*=s*1.3;b.ob.M[10]*=s;b.ob.pos=[b.x,0,b.z]}}
const BURNPOOL=[];
function drawDragon(){const d=DRAGON;if(!d)return;const dist=Math.hypot(P.x-d.x,P.z-d.z),vis=dist<230;for(const s of d.groups){s.o.vis=vis;s.o.M=d.M;s.o.pos=[d.x,d.y,d.z];s.o.flash=d.flash*.4}if(vis)dSkin(d)}
