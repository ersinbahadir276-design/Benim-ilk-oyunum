// ===================== crocodiles (swamp): rush along the ground, open the jaws wide, snap =====================
// No jumping: the body always follows the ground/water surface. The jaw opening is the tell: block right when it is
// fully open and the snap gets parried (the crocodile reels); block late and the bite only drains the guard.
const CROCS=[];let CROCM=null;
const CROC_HOSTILE={rush:1,open:1,snap:1,recover:1,stagger:1,hurt:1};
function mkCroc(x,z){const c={x,z,y:0,yaw:rnd()*6.28,hyaw:0,hx:x,hz:z,st:'idle',t:rr(0,3),hp:120,max:120,spd:0,aware:0,ls:[x,z],unseen:9,group:'swamp',rad:.7,sc:1.15,ph:rnd()*6,cd:0,eye:.35,
  flash:0,kx:0,kz:0,jaw:0,dead:0,deadT:0,R:null,swims:true,openAt:-9,hitDone:false};
 c.hostile=()=>!!CROC_HOSTILE[c.st];c.open=()=>c.st==='stagger';
 c.hurt=(dmg,dx,dz)=>{if(c.dead)return false;c.hp-=dmg;c.flash=1;c.aware=1;c.ls=[P.x,P.z];if(c.hp<=0){c.hp=0;c.dead=1;c.st='dead';c.t=0;return true}c.kx=dx*2;c.kz=dz*2;crocReact(c,dmg,dx,dz);if(c.st!=='stagger'&&c.st!=='snap'&&c.st!=='open'){c.st='hurt';c.t=0}alertGroup(c,P,25,CROCS);return false};
 c.onParried=()=>{c.st='stagger';c.t=0;c.flash=1;c.jaw=0;c.kx=-Math.sin(c.yaw)*4;c.kz=-Math.cos(c.yaw)*4};
 c.calmDown=()=>{if(!c.dead){c.aware=0;if(c.hostile()){c.st='return';c.t=0}}};
 c.onKilled=()=>{SYS.ckills=(SYS.ckills||0)+1;SYS.meat+=2;addXP(90,P);note('[Sistem] Timsah öldürüldü · +90 XP · +2 çiğ et');save(P)};
 c.onAlerted=()=>{if(!c.hostile()&&!c.dead){c.st='alert';c.t=0}};
 CROCS.push(c);return c}
function spawnCrocs(){CROCM=MODEL.croc?{def:crocDef(),geo:sculptGeo('croc'),binv:bindInv(crocDef(),null)}:crocGeo();const R=mkRng(31);let n=0,tries=0;while(n<7&&tries++<500){const a=R()*6.283,d=Math.sqrt(R())*(SWAMP[2]-30),x=SWAMP[0]+Math.cos(a)*d,z=SWAMP[1]+Math.sin(a)*d;if(depthAt(x,z)<.25)continue;mkCroc(x,z);n++}
 for(const c of CROCS){c.R=rigObj(CROCM,{out:.012,cull:140,outCol:[.06,.08,.05]});rigHide(c.R)}}
const crocY=(x,z)=>Math.max(hAt(x,z),waterAt(x,z)-.22);
function crocMove(c,tx,tz,speed,dt,turn){const d=agentMove(c,tx,tz,speed,dt,c.rad,turn);return d}
function updateCroc(c,dt){c.t+=dt;c.flash=Math.max(0,c.flash-dt*6);c.cd-=dt;const d=Math.hypot(P.x-c.x,P.z-c.z);
 if(Math.abs(c.kx)+Math.abs(c.kz)>.05){const p=collide(c.x+c.kx*dt,c.z+c.kz*dt,c.rad);c.x=p[0];c.z=p[1];const k=Math.exp(-dt*6);c.kx*=k;c.kz*=k}
 if(c.dead){c.deadT+=dt;if(c.deadT>150&&d>110)Object.assign(c,{dead:0,hp:c.max,x:c.hx,z:c.hz,st:'idle',aware:0,deadT:0});c.y=crocY(c.x,c.z);return}
 const range=18,sees=senseTick(c,P,dt,range,.8);
 if(!c.hostile()){if(fillAware(c,P,sees,dt,range)){sfx.hiss();note('[!] Bir timsah seni fark etti!','red');alertGroup(c,P,25,CROCS)}if(c.aware>=1){c.st='rush';c.t=0}}
 else if(sees||d<4&&P.alive){c.ls=[P.x,P.z];c.unseen=0}else c.unseen=(c.unseen||0)+dt;
 const inSwamp=Math.hypot(c.x-SWAMP[0],c.z-SWAMP[1])<SWAMP[2]+50;
 switch(c.st){
 case'idle':c.spd=lp(c.spd,0,.1);c.jaw=lp(c.jaw,.05,.1);if(c.aware>.3){c.st='alert';c.t=0}else if(c.t>rr(6,12)){c.st='drift';c.t=0;const a=rnd()*6.28;c.tx=c.hx+Math.cos(a)*rr(3,12);c.tz=c.hz+Math.sin(a)*rr(3,12)}break;
 case'drift':if(crocMove(c,c.tx,c.tz,.8,dt,2)<1||c.t>15){c.st='idle';c.t=0}break;
 case'alert':c.spd=lp(c.spd,0,.2);agentFace(c,c.ls[0],c.ls[1],dt,3);if(c.aware>=1){c.st='rush';c.t=0}else if(c.t>4&&c.aware<.3){c.st='idle';c.t=0}break;
 case'return':if(crocMove(c,c.hx,c.hz,2.5,dt,3)<2||c.t>30){c.st='idle';c.t=0;c.aware=0}break;
 case'rush':{c.jaw=lp(c.jaw,.1,.2);if(!P.alive||!inSwamp&&Math.hypot(c.x-c.hx,c.z-c.hz)>60||c.unseen>6){c.st='return';c.t=0;c.aware=0;break}
  if(d<2.9&&c.cd<=0&&P.st!=='down'){c.st='open';c.t=0;c.hitDone=false;sfx.hiss();break}
  crocMove(c,c.unseen<1?P.x:c.ls[0],c.unseen<1?P.z:c.ls[1],d>5?7.4:3.2,dt,5);break}
 case'open':{// the tell: jaws swing wide open (0.75 s); block from the moment they are fully open = parry
  c.spd=lp(c.spd,0,.4);agentFace(c,P.x,P.z,dt,4);c.jaw=sst(0,.42,c.t)*1.0;if(c.t>=.42&&c.openAt<GT.clock-1)c.openAt=GT.clock;if(c.t>=.78){c.st='snap';c.t=0;sfx.snap()}break}
 case'snap':{const u=c.t/.24;c.jaw=lp(1,0,sst(.35,.6,u));c.x+=Math.sin(c.yaw)*6*dt*(1-u);c.z+=Math.cos(c.yaw)*6*dt*(1-u);
  if(!c.hitDone&&u>=.5){c.hitDone=true;const hx=c.x+Math.sin(c.yaw)*1.5*c.sc,hz=c.z+Math.cos(c.yaw)*1.5*c.sc;if(Math.hypot(P.x-hx,P.z-hz)<1.25&&P.y<crocY(c.x,c.z)+1.6)
    hitPlayer({src:c,dmg:16,guard:45,dir:[Math.sin(c.yaw),Math.cos(c.yaw)],knock:'down',power:1.1,parryFrom:c.openAt})}
  if(u>=1){c.st='recover';c.t=0;c.cd=rr(1.2,1.8)}break}
 case'recover':c.spd=0;c.jaw=lp(c.jaw,0,.2);if(c.t>.9){c.st='rush';c.t=0}break;
 case'stagger':c.spd=0;c.jaw=0;c.hyaw=Math.sin(c.t*12)*.5*(1-c.t/1.9);if(c.t>1.9){c.st='rush';c.t=0;c.hyaw=0}break;
 case'hurt':c.spd=0;if(c.t>.35){c.st='rush';c.t=0}break}
 if(!inSwamp&&!c.hostile()&&c.st!=='return'){c.st='return';c.t=0}
 c.y=crocY(c.x,c.z);if(c.spd>.1)c.ph+=c.spd*dt*2.6}
function crocPose(c,time){const r=[],a=cl(c.spd/4,0,1),ph=c.ph,sw=Math.sin(ph)*.25*a+(c.st==='idle'?Math.sin(time*.8+c.hx)*.05:0);
 r[0]=eul(0,sw*.5,0);r[1]=eul(0,-sw*.6,0);r[2]=eul(-c.jaw*.25,c.hyaw-sw*.3,0);r[3]=eul(c.jaw*.95,0,0);
 r[4]=eul(0,-sw*.8,0);r[5]=eul(0,-sw*1.1,0);r[6]=eul(0,-sw*1.3,0);r[7]=eul(0,-sw*1.5,0);
 const leg=(i,ph2,side)=>{const s=Math.sin(ph2),lift=Math.max(0,Math.cos(ph2))*.5*a;r[i]=eul(0,s*.6*a*side,side*(-.25+lift));r[i+1]=eul(0,0,side*(.35-lift*.6))};
 leg(8,ph,1);leg(10,ph+PI,-1);leg(12,ph+PI,1);leg(14,ph,-1);if(c.st==='dead')for(let i=8;i<16;i++)r[i]=eul(0,0,(i%4<2?1:-1)*.8);return r}
// ---- terrain fit for the crocodile (16-bone sprawl rig). The body pitches and rolls with the ground under its
// shoulders/hips, the neck and the three tail segments each bend so the next joint keeps its rest height above the
// ground (no head or tail sunk into a bank), and each leg swings its upper bone up/down (splay) so the foot keeps
// its flat-ground height above the ground under the foot itself. Off when floating, dead, or beyond CFIK.dist.
// CFIK.on=0 = old behaviour (rigid level body).
const CFIK={on:1,dist:60,maxP:.5,maxR:.4,maxB:.45,maxL:.7,k:.25,last:null};
const CFOOT=[[8,9,1],[10,11,-1],[12,13,1],[14,15,-1]];
function crocFootLocal(l,s){const back=l>=12;return[s*(MODEL.croc?(back?.27:.23):.03),MODEL.croc?-.075:-.25,MODEL.croc?.05:.06]}
function crocFit(c,rot,x,y,z,sc){if(c.gp===undefined){c.gp=0;c.gr=0}
 const def=c.R.def,tmp=crocFit.tmp||(crocFit.tmp=new Float32Array(MAXB*12)),gnd=(px,pz)=>crocY(px,pz);
 const floating=waterAt(x,z)-.22>hAt(x,z)+.02,on=CFIK.on&&!c.dead&&!floating&&Math.hypot(x-P.x,z-P.z)<CFIK.dist;
 let tp=0,tr=0;const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw);
 if(on){const e=.6*sc,w=.3*sc,hf=gnd(x+fx*e,z+fz*e),hb=gnd(x-fx*e,z-fz*e),hr=gnd(x+rx*w,z+rz*w),hl=gnd(x-rx*w,z-rz*w);
  tp=-cl(Math.atan2(hf-hb,2*e),-CFIK.maxP,CFIK.maxP);tr=cl(Math.atan2(hr-hl,2*w),-CFIK.maxR,CFIK.maxR)}
 const k=CFIK.k;c.gp+=(tp-c.gp)*k;c.gr+=(tr-c.gr)*k;if(Math.abs(c.gp)<1e-4&&!tp)c.gp=0;if(Math.abs(c.gr)<1e-4&&!tr)c.gr=0;
 const extra=(c.gp||c.gr)?r3m(rX(c.gp),rZ(c.gr)):null;if(!on){CFIK.last={p:c.gp,r:c.gr,on:0};return extra}
 // rest heights above the ground (flat ground, no pitch): joints sit at the root's height + their offset
 const y0=.24*sc,fk=()=>rigFK(def,rot,[x,y,z],c.yaw,sc,tmp,extra),bend=[],h0=[];
 // flat-ground foot heights for this pose (before any bending)
 rigFK(def,rot,[0,0,0],0,sc,tmp,null);for(const[u,l,s]of CFOOT)h0.push(boneW(def,l,crocFootLocal(l,s),sc)[1]+y0);const WP=def.WP;
 // neck (bone 1 -> head joint 2) and tail (4->5, 5->6, 6->7): pre-rotate each bone about its local x
 for(const[i,j,dir]of[[1,2,1],[4,5,-1],[5,6,-1],[6,7,-1]]){fk();const J=WP[j],want=gnd(J[0],J[2])+y0+(i===1?.05*sc:0),dy=want-J[1],len=Math.hypot(...def[j].o)*sc;
  {const a=cl(Math.atan2(dy,len),-CFIK.maxB,CFIK.maxB);if(Math.abs(a)>1e-4){rot[i]=r3m(rX(-dir*a),rot[i]||R3I);bend.push(+a.toFixed(3))}}}
 // legs: splay the upper bone up/down (and counter-rotate the lower one) until the foot is at its flat height
 const legs=[];CFOOT.forEach(([u,l,s],n)=>{let d=0;for(let it=0;it<3;it++){fk();const F=boneW(def,l,crocFootLocal(l,s),sc),dy=gnd(F[0],F[2])+h0[n]-F[1];
  const S=WP[u],reach=Math.max(.08*sc,Math.hypot(F[0]-S[0],F[2]-S[2])),a=cl(s*Math.atan2(dy,reach),-CFIK.maxL-d,CFIK.maxL-d);if(Math.abs(a)<1e-4)break;d+=a;
  rot[u]=r3m(rot[u]||R3I,rZ(a));rot[l]=r3m(rZ(-a),rot[l]||R3I)}legs.push(+d.toFixed(3))});
 CFIK.last={p:c.gp,r:c.gr,bend,legs,on:1};return extra}
// ===== directional hit reaction (CREACT): the crocodile recoils along the push instead of a silent 0.35 s pause =====
// c.hurt stores the push direction in the croc's own frame (hrF: +forward, hrS: +right) and a strength; the draw adds a
// short spring-like envelope (snap in ~70 ms, small rebound, settled by ~0.75 s). Applied AFTER the terrain fit so the
// fit does not undo it. Front hit → head thrown up and back, body nose-up, jaw gapes (hiss); hit from behind →
// tail whips up, body shoved forward, head dips; side hit → body slides and rolls away while head and tail lag behind
// (the spine bows into a C, the head stays turned at the attacker). A croc that shrugs a hit off mid-bite (open/snap)
// gets a third of it. CREACT.on=0 → old behaviour.
const CREACT={on:1,shift:.12,pitch:.04,roll:.07,head:.34,dip:.1,tailUp:.07,bowN:.24,bowT:.05,jaw:.35};
function crocReact(c,dmg,dirx,dirz){if(!CREACT.on||c.dead)return;const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),n=Math.hypot(dirx,dirz)||1;
 c.hrF=(dirx*fx+dirz*fz)/n;c.hrS=(dirx*fz-dirz*fx)/n;c.hrX=dirx/n;c.hrZ=dirz/n;
 c.hrA=cl(.6+dmg/Math.max(1,c.max||1)*3,.6,1)*((c.st==='open'||c.st==='snap')?.35:1);c.hrT=GT.clock}
function crocReactEnv(c){if(!CREACT.on||c.hrT===undefined||c.dead)return 0;const t=GT.clock-c.hrT;if(t<0||t>.75)return 0;
 if(t<.07)return sst(0,1,t/.07)*c.hrA;const u=t-.07;return Math.exp(-u*6)*Math.cos(u*8.5)*c.hrA}
function crocReactPose(c,rot,rk){const K=CREACT,back=Math.max(0,-c.hrF),fwd=Math.max(0,c.hrF),S=c.hrS;
 const post=(i,m)=>{rot[i]=r3m(rot[i]||R3I,m)};
 // the front legs hang off the neck bone (1), so the neck only yaws (bow); the lift/dip is done by the head bone (2)
 post(1,eul(0,-S*K.bowN*rk,0));post(2,eul(-(K.head*back-K.dip*fwd)*rk,-S*K.bowN*.5*rk,0));
 // tail: whips up from behind, bows against a side push
 [4,5,6].forEach((i,n)=>post(i,eul(K.tailUp*fwd*rk*(1-n*.25),S*K.bowT*rk*(1+n*.3),0)));
 c.jawR=K.jaw*Math.max(back,Math.abs(S)*.6)*Math.max(0,rk)}
function drawCrocs(time){for(const c of CROCS){const d=Math.hypot(c.x-P.x,c.z-P.z);if(d>140||(c.dead&&c.deadT>25)){rigHide(c.R);continue}
  const roll=c.dead?PI*sst(0,.8,c.t):0,y=c.y+.24*c.sc+(roll?.05:0),pose=crocPose(c,time),fit=roll?null:crocFit(c,pose,c.x,y,c.z,c.sc);let extra=roll?rZ(roll):fit||R3I;
  const rk=roll?0:crocReactEnv(c);let rx=c.x,rz=c.z;c.jawR=0;
  if(rk){crocReactPose(c,pose,rk);const sh=rk*CREACT.shift*c.sc;rx+=c.hrX*sh;rz+=c.hrZ*sh;extra=r3m(extra,r3m(rX(c.hrF*CREACT.pitch*rk),rZ(-c.hrS*CREACT.roll*rk)));
   if(c.jawR>0)pose[3]=r3m(pose[3]||R3I,eul(c.jawR,0,0))}
  rigDraw(c.R,rx,y,rz,c.yaw,c.sc,pose,1.1,extra);
  c.R.ob.flash=c.flash;c.R.ob.col=c.st==='open'?[1.1,.9,.85]:c.st==='stagger'?[1.15,1.05,.8]:[1,1,1]}}
function crocHead(c){return[c.x+Math.sin(c.yaw)*1.4*c.sc,c.y+.3,c.z+Math.cos(c.yaw)*1.4*c.sc]}
