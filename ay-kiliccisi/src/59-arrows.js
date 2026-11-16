// ===================== bows and arrows: goblin archers, the hero's bow, road patrols =====================
// Arrows are real projectiles (gravity, travel time): they can be blocked, dodged (i-frames) or out-walked.
// Archers keep their distance, draw for a readable 0.9 s (bow up, "!"), then loose with a little lead.
const ARROWS=[];let arrowGeo=null,bowGeo=null;
function arrowGeom(){if(arrowGeo)return;const g=G(),sh=[.42,.3,.18],fe=[.85,.82,.75],tip=[.55,.55,.6];
 box(g,-.008,-.008,-.38,.008,.008,.32,sh);box(g,-.02,-.02,.32,.02,.02,.4,tip);box(g,-.002,-.035,-.38,.002,.035,-.26,fe);box(g,-.035,-.002,-.38,.035,.002,-.26,fe);arrowGeo=geo(g);
 const b=tube([[0,.42,0],[0,.22,.07],[0,0,.09],[0,-.22,.07],[0,-.42,0]],{r:()=>.013,seg:5,n:10});tint(b,[.36,.24,.13]);const st=tube([[0,.42,0],[0,-.42,0]],{r:()=>.003,seg:3,n:2});tint(st,[.9,.88,.8]);bowGeo=geo(merge([b,st]))}
function shootArrow(from,to,speed,owner,dmg,lead){arrowGeom();const T=Math.hypot(to[0]-from[0],to[2]-from[2])/speed,tx=to[0]+(lead?lead[0]*T:0),tz=to[2]+(lead?lead[1]*T:0);
 const dx=tx-from[0],dz=tz-from[2],dh=Math.hypot(dx,dz)||1,t=dh/speed,vy=(to[1]-from[1])/t+4.9*t;
 let a=ARROWS.find(x=>!x.on);if(!a){a={ob:obj(arrowGeo,{shade:.9,pos:[0,0,0],cull:120,out:.004,outCol:[.05,.04,.03]})};ARROWS.push(a)}
 Object.assign(a,{on:true,x:from[0],y:from[1],z:from[2],vx:dx/dh*speed,vy,vz:dz/dh*speed,owner,dmg,life:4,stuck:0});a.ob.vis=true;sfx.swing()}
function updateArrows(dt){for(const a of ARROWS){if(!a.on){a.ob.vis=false;continue}a.life-=dt;if(a.life<=0){a.on=false;continue}
  if(!a.stuck){a.vy-=9.8*dt;a.x+=a.vx*dt;a.y+=a.vy*dt;a.z+=a.vz*dt;
   if(a.y<hAt(a.x,a.z)+.05){a.stuck=1;a.life=Math.min(a.life,3);a.y=hAt(a.x,a.z)+.08}
   else if(a.owner==='foe'){if(P.alive&&Math.hypot(P.x-a.x,P.z-a.z)<.45&&a.y>P.y+.1&&a.y<P.y+1.8){const r=hitPlayer({src:{x:a.x-a.vx*.05,z:a.z-a.vz*.05,lv:a.lv},dmg:a.dmg,guard:a.dmg*1.6,dir:[a.vx/24,a.vz/24],knock:'flinch',noPush:1});if(r!=='iframe'){a.on=false;if(r==='block'||r==='parry')spawnSparks(a.x,a.y,a.z,6,[1,.9,.6],3)}}}
   else{for(const f of foes()){const big=f===DRAGON?3:f.big||f.boss?1.0:isWolf(f)?.65:.5,fy=f===DRAGON?f.y+2:(f.y||0)+(f.big?1.4:.8);if(Math.hypot(f.x-a.x,f.z-a.z)<big&&Math.abs(a.y-fy)<(f===DRAGON?3:1)){
     const k=Math.hypot(a.vx,a.vz)||1,dead=foeHurt(f,a.dmg,a.vx/k,a.vz/k,'arrow');addPosture(f,6);floatText(f.x,fy+.6,f.z,''+a.dmg,'');spawnSparks(a.x,a.y,a.z,5,[.9,.2,.15],2);if(dead)onFoeKilled(f,false);else{f.aware=1;if(f.ls)f.ls=[P.x,P.z]}a.on=false;break}}}}
  const yaw=Math.atan2(a.vx,a.vz),pit=-Math.atan2(a.vy,Math.hypot(a.vx,a.vz));a.ob.M=mtrs([a.x,a.y,a.z],[pit,yaw,0]);a.ob.pos=[a.x,0,a.z]}}
// ---------- goblin archers
function archerChase(g,d,dt){if(!g.archer)return false;if(g.unseen>1||d>22)return false;
 if(d<5.5){const ax=g.x+(g.x-P.x)/d*3,az=g.z+(g.z-P.z)/d*3;agentMove(g,ax,az,4.6,dt,g.rad,6);agentFace(g,P.x,P.z,dt,6);return true}// too close: back off
 if(g.cd<=0){g.st='aim';g.t=0;sfx.gobShout();return true}
 const a=Math.atan2(g.x-P.x,g.z-P.z)+.6*dt*(g.side||1),r=Math.min(14,Math.max(9,d));agentMove(g,P.x+Math.sin(a)*r,P.z+Math.cos(a)*r,3.2,dt,g.rad,6);agentFace(g,P.x,P.z,dt,8);return true}
function archerAim(g,d,dt){g.spd=lp(g.spd,0,.4);agentFace(g,P.x,P.z,dt,8);
 if(g.t>.9&&!g.shot){g.shot=1;const hy=hAt(g.x,g.z);shootArrow([g.x+Math.sin(g.yaw)*.4,hy+1.0,g.z+Math.cos(g.yaw)*.4],[P.x,P.y+1.1,P.z],24,'foe',Math.round(8*lvDmg(g.lv||1)),[P.vx*.6,P.vz*.6]);ARROWS.find(a=>a.on&&a.owner==='foe'&&!a.lv&&(a.lv=g.lv||1))}
 if(g.t>1.3){g.shot=0;g.st='chase';g.t=0;g.cd=rr(1.6,2.6)}}
function archerPose(g,q){if(!g.archer)return;const aim=g.st==='aim',k=aim?sst(0,.35,g.t):(g.hostile()?.4:0);if(!k)return;
 q.LsX=lp(q.LsX||0,-1.5,k);q.LsZ=lp(q.LsZ||0,.1,k);q.LeX=lp(q.LeX||0,-.05,k);q.RsX=lp(q.RsX||0,-1.35,k);q.RsY=lp(q.RsY||0,.5,k);q.ReX=lp(q.ReX||0,-1.9*(aim?sst(0,.8,g.t):.3),k);q.spY=lp(q.spY||0,-.35,k)}
function drawGobBow(g){if(!g.archer||!g.R)return;if(!g.bowOb){arrowGeom();g.bowOb=obj(bowGeo,{shade:.9,pos:[0,0,0],cull:120,out:.004,outCol:[.05,.04,.03]})}
 const d=g.R.def;if(!g.R.ob.vis||!d.WR||g.dead){g.bowOb.vis=false;return}const R=d.WR[5],p=boneW(d,5,[0,-.06*g.sc,0],1),M=new Float32Array(16);
 M[0]=R[0];M[1]=R[3];M[2]=R[6];M[4]=R[1];M[5]=R[4];M[6]=R[7];M[8]=R[2];M[9]=R[5];M[10]=R[8];for(let i=0;i<11;i++)if(i%4<3)M[i]*=g.sc;M[12]=p[0];M[13]=p[1];M[14]=p[2];M[15]=1;g.bowOb.M=M;g.bowOb.pos=[g.x,0,g.z];g.bowOb.vis=true}
// road patrols near the village so goblins are met early (two melee + two archers each)
function spawnPatrols(){const spots=[[0,260,0],[255,0,1.57],[-250,40,-1.57]];spots.forEach(([x,z,yaw],i)=>{const grp='road'+i,c=CAMPSITES[i%CAMPSITES.length];const pts=[[x,z],[x+Math.sin(yaw+1.57)*40,z+Math.cos(yaw+1.57)*40],[x+Math.sin(yaw)*35,z+Math.cos(yaw)*35]];
  for(let k=0;k<4;k++){const p=collide(x+(k-1.5)*2,z+(k%2)*2,.4),g=mkGob(p[0],p[1],false,grp,c);g.patrol=pts;g.pi=k%3;g.archer=k>=2;g.R=rigObj(GOBM,{out:.014,cull:150});rigHide(g.R)}});
 for(const c of CAMPSITES){const g=GOBS.find(x=>!x.big&&x.camp===c&&!x.archer&&!x.patrol);if(g)g.archer=true}}
// ---------- the hero's bow: tap YAY — shoots at the locked target or the nearest foe in front
let heroBow=null;
function useBow(){if(P.st!=='move'||!P.alive)return;if((P.bowCd||0)>GT.clock)return;if(P.sta<10){note('Dayanıklılık yetersiz');return}spend(12);P.bowCd=GT.clock+.75;
 let t=P.lock&&!P.lock.dead?P.lock:null;if(!t){let bs=1e9;for(const f of foes()){const d=Math.hypot(f.x-P.x,f.z-P.z),a=Math.abs(angd(Math.atan2(f.x-P.x,f.z-P.z),CAM.yaw));if(d<34&&a<.7&&d*(1+a*3)<bs){bs=d*(1+a*3);t=f}}}
 if(t)P.yaw=Math.atan2(t.x-P.x,t.z-P.z);else P.yaw=CAM.yaw;P.st='shoot';P.t=0;P.bowT=t;P.shot=0}
function updateShoot(dt){P.vx*=Math.exp(-dt*10);P.vz*=Math.exp(-dt*10);const t=P.bowT;if(t&&!t.dead)P.yaw+=angd(Math.atan2(t.x-P.x,t.z-P.z),P.yaw)*Math.min(1,dt*12);
 if(P.t>.32&&!P.shot){P.shot=1;const fy=t?(t===DRAGON?t.y+2:(t.y||hAt(t.x,t.z))+(t.big?1.4:isWolf(t)?.6:.8)):P.y+1.3,to=t?[t.x,fy,t.z]:[P.x+Math.sin(P.yaw)*30,P.y+1.4,P.z+Math.cos(P.yaw)*30];
  shootArrow([P.x+Math.sin(P.yaw)*.5,P.y+1.45,P.z+Math.cos(P.yaw)*.5],to,40,'hero',Math.round(weaponDmg()*.7*dmgMul()),t&&t.kx!==undefined?[0,0]:null)}
 if(P.t>.6){P.st='move';P.t=0}}
function drawHeroBow(){if(!heroBow){arrowGeom();heroBow=obj(bowGeo,{shade:.9,pos:[0,0,0],cull:60,out:.004,outCol:[.05,.04,.03]})}heroBow.vis=P.st==='shoot';if(!heroBow.vis)return;
 const R=SK.GR[HB.leftHand],gp=SK.GP[HB.leftHand],w=mpt(PM,gp),M=new Float32Array(16),Ry=rY(P.yaw),RR=r3m(Ry,R);M[0]=RR[0];M[1]=RR[3];M[2]=RR[6];M[4]=RR[1];M[5]=RR[4];M[6]=RR[7];M[8]=RR[2];M[9]=RR[5];M[10]=RR[8];M[12]=w[0];M[13]=w[1];M[14]=w[2];M[15]=1;heroBow.M=M;heroBow.pos=[P.x,0,P.z]}
