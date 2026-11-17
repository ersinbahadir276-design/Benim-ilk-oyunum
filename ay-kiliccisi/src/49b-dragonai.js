// ===================== KÜL KANAT — the dragon as a three-awakening boss (v21) =====================
// Built like a real animal of that size would fight, and like a manhwa/Soulslike boss: it never stands still to trade.
// AWAKENING I  «KÜL KANAT»  ground fighter — claw (sometimes DELAYED: it holds the claw up, then snaps), a backing-up
//              BITE LUNGE that crosses 10 m, a TAIL SWEEP when you stand behind or beside it (jump it), a STOMP if
//              you hide under it; it takes off, breathes fire across the ground, lands tired.
// AWAKENING II «KIZIL UYANIŞ» (66 %): roar shockwave, the sky turns red. It flies CIRCLES around you and comes down
//              in a TALON DIVE — the feet first, the line is marked on the ground: dash through it; if it catches you
//              it carries you into the air (mash to stab its foot, or it slams you into the ground). It STRAFES with fire
//              from above and spits FIREBALLS. Claws chain into a second claw or the tail.
// AWAKENING III «KARA GÜNEŞ» (33 %): a burning ring closes the arena; METEORS fall during the fight; NOVA — it draws
//              the fire in and bursts (get out or dash at the right time); every move is faster and more often delayed.
// OPENINGS (inspired by Crimson Desert's boss design — weak points and grapples, done our own way): a missed dive
//              makes it CRASH and skid; a posture break or a crash leaves it DOWN — climb its neck (ETKİLEŞ), mash to
//              stab; when it THRASHES («TUTUN!») hold BLOK or you are thrown off.
const DPH=[null,{n:'KÜL KANAT',s:'Birinci uyanış'},{n:'KIZIL UYANIŞ',s:'İkinci uyanış — gökyüzü yanıyor'},{n:'KARA GÜNEŞ',s:'Son uyanış — her şey yanar'}];
const DSHOTS=[];
const dSpd=d=>[1,1,1.2,1.4][d.phase],dDmg=(d,v)=>v*[1,1,1.18,1.35][d.phase];
function dragonTitle(){const d=DRAGON;return DPH[d.phase||1].n+' · EJDERHA'+(d.phase>1?' · '+['','I','II','III'][d.phase]+'. UYANIŞ':'')}
function dGo(d,name,fade,speed,ct0){if(d.clip!==name){d.prev=d.clip;d.pt=d.ct}d.clip=name;d.ct=ct0||0;d.fade=fade>0?0:1;d.fadeT=fade||.01;d.speed=speed||1}
function dWake(d){d.st='roar';d.t=0;dPlay(d,'taitou',.35,1.4);sfx.roar(1);CAM.shake=Math.max(CAM.shake,.5);bossBanner('KÜL KANAT','Ejderha uyandı');note('[!] EJDERHA UYANDI! Pençeyi kaldırınca, kuyruğu savurunca, gökten dalınca kaç.','red');alertGroup(d,P,0,[])}
function dFace(d,tx,tz,dt,rate){d.yaw+=cl(angd(Math.atan2(tx-d.x,tz-d.z),d.yaw),-rate*dt,rate*dt)}
function dWalk(d,sp,dt){const p=collide(d.x+Math.sin(d.yaw)*sp*dt,d.z+Math.cos(d.yaw)*sp*dt,2.2);d.x=p[0];d.z=p[1]}
function dFly(d,tx,tz,sp,dt){const mx=tx-d.x,mz=tz-d.z,ml=Math.hypot(mx,mz);if(ml>.3){const s=Math.min(sp,ml*2.5);d.x+=mx/ml*s*dt;d.z+=mz/ml*s*dt}
 const r=Math.hypot(d.x-d.spawn[0],d.z-d.spawn[1]);if(r>120){d.x=d.spawn[0]+(d.x-d.spawn[0])*120/r;d.z=d.spawn[1]+(d.z-d.spawn[1])*120/r}}
function dTalon(d){const p=dBone(d,DRG.pelvis);return[p[0],p[1]-2.4,p[2]]}
function dHit(d,o){return hitPlayer(Object.assign({src:d,dir:[P.x-d.x,P.z-d.z]},o,{dmg:dDmg(d,o.dmg)}))}
function dToGround(d){d.st='approach';d.t=0;d.pitch=0;d.roll=0;dGo(d,'walk',.4,1.1*dSpd(d))}
function dragonEnv(env){const d=DRAGON;if(!d)return;const want=!d.dead&&d.hostile()&&Math.hypot(P.x-d.x,P.z-d.z)<160?[0,0,.5,.85][d.phase||1]:0;d.envK=lp(d.envK||0,want,.02);const k=d.envK;if(k<.01)return;
 const R=d.phase>=3?[.2,.05,.04]:[.5,.16,.08];env.fogC=[lp(env.fogC[0],R[0],k),lp(env.fogC[1],R[1],k),lp(env.fogC[2],R[2],k)];env.sun=[lp(env.sun[0],1.2,k*.5),lp(env.sun[1],.62,k*.5),lp(env.sun[2],.48,k*.5)]}
// the phase change: invulnerable roar, a shockwave you jump or dash, flames burst out, the sky changes
function dAwaken(d){if(P.st==='grabbed'&&GRAB.by===d)releaseHero(false,false);if(P.st==='ride')rideOff(true);d.st='awaken';d.t=0;d.hitDone=false;dGo(d,'taitou',.3,1.15);sfx.roar(1);
 const ph=DPH[d.phase];bossBanner(ph.n,ph.s);note('[!] '+ph.n+' — ejderha yeniden uyanıyor! Şok dalgası: zıpla ya da atıl.','red')}
function dragonBreak(d){floatText(d.x,d.y+5,d.z,'YERE DÜŞTÜ','crit');if(d.fy>1.5||/^(hover|breath|circle|dive|strafe|volley|takeoff)$/.test(d.st)){d.st='crash';d.t=0;d.hitDone=false;dGo(d,'down',.25,1)}else dDown(d)}
function dDown(d){d.st='downed';d.t=0;d.pitch=0;d.roll=0;dGo(d,'die',.35,1);note('[Sistem] Ejderha yerde! Boynuna tırman (ETKİLEŞ) ya da saldır.','gold')}
// ---------- moves
function dPickGround(d,dist,fa){const now=GT.clock,sp=dSpd(d),r=Math.random();
 if(d.phase>=3&&(d.novaCd||0)<now&&dist<12&&(r<.45||d.gm>=2)){d.st='nova';d.t=0;d.hitDone=false;d.novaCd=now+16;dGo(d,'taitou',.3,1.3);sfx.inhale();return}
 if(dist<5&&!(d.stompCd>now)){d.st='stomp';d.t=0;d.hitDone=false;d.stompCd=now+4;dangerRing(d.x,d.z,6.2,1.15/sp);dGo(d,'taitou',.25,1.3*sp);sfx.roar(.8);return}
 if(fa>1.5&&dist<10){d.st='tail';d.t=0;d.hitDone=false;d.spin=angd(Math.atan2(P.x-d.x,P.z-d.z),d.yaw)>0?1:-1;dGo(d,'walk',.25,.6);sfx.snarl();return}
 if(fa<.55&&dist>5.5&&dist<15&&(r<.45||dist>10)){d.st='bite';d.t=0;d.hitDone=false;dGo(d,'walk',.25,.5);sfx.snarl();return}
 if(fa<.6&&dist<10){d.st='claw';d.t=0;d.hitDone=false;d.chain=0;d.slow=Math.random()<[0,.25,.4,.55][d.phase];dGo(d,'attack01',.2,1.5*sp,1.25);sfx.roar(.7);return}}
function dTakeoff(d){d.st='takeoff';d.t=0;d.gm=0;d.am=0;dGo(d,'up',.3,1);sfx.wings()}
function dLand(d){d.st='land';d.t=0;d.landed=false;d.roll=0;d.pitch=0;dGo(d,'down',.3,1)}
function dShot(x,z,T,r,dmg){DSHOTS.push({x,z,t:0,T,r,dmg})}
function updateDShots(d,dt){for(let i=DSHOTS.length-1;i>=0;i--){const s=DSHOTS[i];s.t+=dt;
  if(s.t<s.T){if(Math.random()<dt*14){const y=hAt(s.x,s.z);spawnFlame([s.x+rr(-6,6),y+26*(1-s.t/s.T)+4,s.z+rr(-6,6)],[s.x,y+.3,s.z])}continue}
  DSHOTS.splice(i,1);const y=hAt(s.x,s.z);CAM.shake=Math.max(CAM.shake,Math.hypot(P.x-s.x,P.z-s.z)<15?.55:.2);sfx.thud();sfx.fire();spawnSparks(s.x,y+.4,s.z,22,[1,.5,.15],8);
  for(let k=0;k<8;k++){const a=k*.785;spawnFlame([s.x,y+.3,s.z],[s.x+Math.cos(a)*s.r,y+.6,s.z+Math.sin(a)*s.r])}for(let k=0;k<4;k++)BURNS.push({x:s.x+rr(-1.5,1.5),z:s.z+rr(-1.5,1.5),t:0,life:5});
  if(d&&!d.dead&&Math.hypot(P.x-s.x,P.z-s.z)<s.r&&!(P.st==='grabbed'||P.st==='ride'))dHit(d,{dmg:s.dmg,guard:60,knock:'down',power:1.3,unblockable:true,parryable:false})}}
function dRing(d,on){for(let i=BURNS.length-1;i>=0;i--)if(BURNS[i].ring){if(BURNS[i].ob){BURNS[i].ob.vis=false;BURNPOOL.push(BURNS[i].ob)}BURNS.splice(i,1)}
 if(on){const cx=d.x,cz=d.z;d.ringC=[cx,cz];for(let k=0;k<44;k++){const a=k/44*2*PI;BURNS.push({x:cx+Math.cos(a)*31,z:cz+Math.sin(a)*31,t:0,life:1e9,ring:1})}}}
function updateDragon(d,dt){if(!d)return;d.t+=dt;d.flash=Math.max(0,d.flash-dt*4);const dist=Math.hypot(P.x-d.x,P.z-d.z),fromLair=Math.hypot(P.x-d.spawn[0],P.z-d.spawn[1]),sp=dSpd(d);
 updateDShots(d,dt);
 d.fy=Math.max(0,d.fy);d.y=hAt(d.x,d.z)+d.fy;if(dist<260){dSample(d,dt);d.M=dMatrix(d)}
 if(d.dead){d.st='dead';d.fy=Math.max(0,d.fy-dt*9);d.pitch=lp(d.pitch,0,.1);d.roll=lp(d.roll,0,.1);if(!d.ringOff){d.ringOff=1;dRing(d,false)}return}
 const sees=senseTick(d,P,dt,58,1.15);
 if(d.st==='sleep'){d.fy=0;if(fillAware(d,P,sees,dt,58)||d.aware>=.8||(P.noise>0&&dist<P.noise*2))dWake(d);if(d.ct>3)dPlay(d,'stand',.3,.6);return}
 if(d.st!=='return'&&(fromLair>150||!P.alive)){d.calmDown();return}
 const fa=Math.abs(angd(Math.atan2(P.x-d.x,P.z-d.z),d.yaw));
 // phase III: meteors keep falling during the whole fight
 if(d.phase>=3&&d.st!=='awaken'&&(d.metT=(d.metT||6)-dt)<=0){d.metT=rr(7,10);for(let k=0;k<4;k++){const a=rnd()*6.28,r=k?rr(4,11):0;dShot(P.x+Math.cos(a)*r+P.vx*.6,P.z+Math.sin(a)*r+P.vz*.6,1.3+k*.35,3,24)}note('[!] Gökten ateş yağıyor — kırmızı halkalardan çık!','red')}
 if(d.phase>=3&&Math.random()<dt*8){const b=dBone(d,[DRG.bones.chest,DRG.pelvis,DRG.bones.neck][Math.floor(rnd()*3)]);spawnFlame(b,[b[0]+rr(-1,1),b[1]+rr(1.5,3),b[2]+rr(-1,1)])}
 if(d.phase>=3&&d.ringC&&P.alive){const r=Math.hypot(P.x-d.ringC[0],P.z-d.ringC[1]);if(r>32.5){const k=32.5/r;P.x=d.ringC[0]+(P.x-d.ringC[0])*k;P.z=d.ringC[1]+(P.z-d.ringC[1])*k}}
 if(!/^(takeoff|hover|breath|circle|dive|carry|strafe|volley|awaken|crash)$/.test(d.st))d.fy=Math.max(0,d.fy-dt*12);
 if(!/^(circle|carry|strafe)$/.test(d.st))d.roll=lp(d.roll,0,Math.min(1,dt*4));
 switch(d.st){
 case'return':{d.fy=Math.max(0,d.fy-dt*6);dFace(d,d.spawn[0],d.spawn[1],dt,1.2);const dd=Math.hypot(d.spawn[0]-d.x,d.spawn[1]-d.z);if(dd>2){d.x+=Math.sin(d.yaw)*3*dt;d.z+=Math.cos(d.yaw)*3*dt}else{d.st='sleep';d.t=0;d.hp=d.max;d.phase=1;d.pos=0;d.aware=0;dRing(d,false);DSHOTS.length=0;dPlay(d,'stand',.4,.6)}break}
 case'roar':if(d.t>2.0){dToGround(d);d.gm=0}break;
 case'awaken':{d.fy=Math.max(0,d.fy-dt*10);d.pitch=lp(d.pitch,-.15,.1);
  if(d.t>.95&&!d.hitDone){d.hitDone=true;CAM.shake=1;sfx.roar(1);sfx.thud();dangerRing(d.x,d.z,12,.25);spawnSparks(d.x,d.y+2,d.z,40,[1,.45,.12],10);for(let k=0;k<20;k++){const a=k/20*6.28,b=dBone(d,DRG.bones.chest);spawnFlame(b,[d.x+Math.cos(a)*11,d.y+.5,d.z+Math.sin(a)*11])}
   if(dist<12&&!P.air&&P.inv<=0)dHit(d,{dmg:14,guard:60,knock:'down',power:1.8,unblockable:true,parryable:false});if(d.phase>=3){dRing(d,true);note('[!] Ateş halkası arenayı kapattı — kaçış yok.','red')}}
  if(d.t>2.6){d.pitch=0;if(d.phase>=2&&Math.random()<.5)dTakeoff(d);else{dToGround(d);d.cd=.2}}break}
 case'approach':{dFace(d,P.x,P.z,dt,1.3*sp);if(dist>6.5)dWalk(d,(dist>18?5.5:3.8)*sp,dt);if(d.clip!=='walk')dGo(d,'walk',.3,1.1*sp);
  d.cd=(d.cd||0)-dt;if(d.cd<=0&&d.t>.35/sp){if(d.gm>=[0,4,3,3][d.phase]||dist>26&&d.t>2.5){dTakeoff(d);break}dPickGround(d,dist,fa)}break}
 case'stomp':{d.speed=1.3*sp;if(!d.hitDone&&d.t>1.15/sp){d.hitDone=true;CAM.shake=Math.max(CAM.shake,.8);sfx.thud();spawnSparks(d.x,d.y+.3,d.z,30,[.6,.55,.45],7);if(dist<6.2&&!P.air)dHit(d,{dmg:26,guard:60,knock:'down',power:1.5,parryable:false})}
  if(d.t>2.0/sp){d.gm++;dToGround(d);d.cd=.3}break}
 case'claw':{// the claw clip from its raise; a DELAYED claw holds high (slow) then snaps (fast)
  d.speed=d.slow?(d.ct<2.25?.42:2.5*sp):1.5*sp;if(d.ct<2.35)dFace(d,P.x,P.z,dt,1.5*sp);
  if(!d.hitDone&&d.ct>2.6&&d.ct<3.4){const c=dBone(d,DRG.rHand),hit=Math.hypot(c[0]-P.x,c[2]-P.z)<2.5&&c[1]<P.y+2.4;
   if(hit){d.hitDone=true;const k=Math.hypot(P.x-d.x,P.z-d.z)||1;dHit(d,{dmg:34,guard:70,dir:[(P.x-d.x)/k,(P.z-d.z)/k],knock:'down',power:1.7})}}
  if(d.ct>2.7&&d.ct<2.7+dt*d.speed+.001){CAM.shake=Math.max(CAM.shake,dist<14?.45:.15);sfx.thud();if(!d.hitDone&&dist<3.6&&!P.air){d.hitDone=true;dHit(d,{dmg:16,guard:35,knock:'flinch',parryable:false})}}
  if(d.ct>4.1){d.gm++;const r=Math.random();if(d.phase>=2&&!d.chain&&r<.5){d.chain=1;d.hitDone=false;d.slow=Math.random()<.35;dGo(d,'attack01',.15,1.6*sp,1.5);sfx.roar(.6)}
   else if(d.phase>=2&&r<.8&&dist<10){d.st='tail';d.t=0;d.hitDone=false;d.spin=Math.random()<.5?1:-1;dGo(d,'walk',.25,.6)}else{dToGround(d);d.cd=rr(.3,.8)/sp}}break}
 case'tail':{const W=.6/sp,S=.85/sp;
  if(d.t<W){d.yaw-=d.spin*.6*dt;d.speed=.5}
  else if(d.t<W+S){d.speed=2.2;const prev=d.yaw;d.yaw+=d.spin*2*PI/S*dt;if(Math.floor(d.t*8)!==Math.floor((d.t-dt)*8))sfx.swing();
   const ta=Math.atan2(P.x-d.x,P.z-d.z),a0=angd(ta,prev+PI),a1=angd(ta,d.yaw+PI);if(!d.hitDone&&dist<10.5&&dist>1&&(Math.abs(a1)<.35||a0*a1<0&&Math.abs(a0)<1.5)&&!P.air){d.hitDone=true;dHit(d,{dmg:30,guard:80,knock:'down',power:1.6,parryable:false,dir:[Math.cos(d.yaw)*d.spin,-Math.sin(d.yaw)*d.spin]})}}
  else if(d.t>W+S+.9/sp){d.gm++;dToGround(d);d.cd=.25}break}
 case'bite':{const W=.6/sp,L=.42;
  if(d.t<W){dFace(d,P.x,P.z,dt,2.6);dWalk(d,-1.6,dt);d.pitch=lp(d.pitch,-.12,.15);d.speed=.5}
  else if(d.t<W+L){if(d.clip!=='walk'||d.speed<2)dGo(d,'walk',.1,2.6);dWalk(d,15*sp,dt);d.pitch=lp(d.pitch,.15,.3);
   const m=dMouth(d);if(!d.hitDone&&Math.hypot(m[0]-P.x,m[2]-P.z)<2.4&&m[1]<P.y+3){d.hitDone=true;sfx.bite();const r=dHit(d,{dmg:30,guard:65,knock:'down',power:1.5});if(r==='parry')d.onParried()}}
  else{d.pitch=lp(d.pitch,0,.15);d.speed=.6;if(d.t>W+L+.75/sp){d.gm++;dToGround(d);d.cd=.3}}break}
 case'nova':{d.speed=1;const G=1.6;
  if(d.t<G){if(Math.random()<dt*30){const a=rnd()*6.28,b=dBone(d,DRG.bones.chest);spawnFlame([d.x+Math.cos(a)*10,d.y+.4,d.z+Math.sin(a)*10],b)}d.flash=Math.max(d.flash,.25*Math.sin(d.t*20)+.25)}
  else if(!d.hitDone){d.hitDone=true;CAM.shake=1;sfx.roar(1);sfx.fire();sfx.thud();spawnSparks(d.x,d.y+1.5,d.z,50,[1,.4,.1],12);for(let k=0;k<24;k++){const a=k/24*6.28,b=dBone(d,DRG.bones.chest);spawnFlame(b,[d.x+Math.cos(a)*10,d.y+.4,d.z+Math.sin(a)*10])}
   for(let k=0;k<12;k++){const a=k/12*6.28,r=rr(5,9);BURNS.push({x:d.x+Math.cos(a)*r,z:d.z+Math.sin(a)*r,t:0,life:6})}if(dist<10&&P.inv<=0)dHit(d,{dmg:42,guard:99,knock:'down',power:2,unblockable:true,parryable:false})}
  if(d.t>G+1.0){d.st='tired';d.t=0;dGo(d,'stand',.3,.5);note('[Sistem] Patlamadan sonra soluklanıyor — saldır!','gold')}break}
 case'stagger':if(d.t>1.6){dToGround(d);d.cd=.4}break;
 case'tired':if(d.t>(d.phase>=3?2.2:3.0)){dToGround(d);d.gm=0}break;
 case'downed':{d.speed=d.ct>2.6?0:1.3;d.flash=Math.max(d.flash,.12+.1*Math.sin(d.t*8));
  if(d.t>(P.st==='ride'?9:4.5)){if(P.st==='ride')rideOff(true);d.st='rise';d.t=0;dGo(d,'taitou',.8,1.2);sfx.roar(.9)}break}
 case'rise':if(d.t>1.6){dToGround(d);d.cd=.2}break;
 // ---------------- the air
 case'takeoff':{d.speed=1;d.fy=lp(d.fy,d.phase>=2?9:2.5,Math.min(1,dt*1.8*(d.ct>.6?1:0)));if(d.ct>.7&&d.ct<.75+dt){CAM.shake=Math.max(CAM.shake,.35);sfx.wings();spawnSparks(d.x,d.y+.3,d.z,24,[.6,.55,.45],8)}
  if(d.ct>=1.45){d.t=0;d.breaths=0;if(d.phase>=2){d.st='circle';d.ang=Math.atan2(d.x-P.x,d.z-P.z);d.cdir=Math.random()<.5?1:-1;dGo(d,'skill08',.3,1.2)}else{d.st='hover';dGo(d,'skill08',.3,1)}}break}
 case'hover':{const k=dist||1,ax=P.x-(P.x-d.x)/k*13,az=P.z-(P.z-d.z)/k*13;dFace(d,P.x,P.z,dt,1.6);dFly(d,ax,az,6,dt);d.fy=lp(d.fy,2.5,.05);
  if(Math.floor(d.t/.45)!==Math.floor((d.t-dt)/.45))sfx.wings(.35);
  if(d.t>(d.breaths?1.3:1.8)/sp){if(d.breaths>=(d.phase>=2?1:2)){if(d.phase>=2){d.st='circle';d.t=0;d.ang=Math.atan2(d.x-P.x,d.z-P.z);d.cdir=1;dGo(d,'skill08',.3,1.2)}else dLand(d)}else{d.st='breath';d.t=0;d.breathA=null;d.emitT=0;dGo(d,'skill10',.3,1.25*sp);sfx.inhale()}}break}
 case'breath':{dFace(d,P.x,P.z,dt,d.ct<2.2?1.6:.4);d.fy=lp(d.fy,2.5,.05);
  if(d.ct>=2.0&&!d.breathA){const k=dist||1,dx=(P.x-d.x)/k,dz=(P.z-d.z)/k,px=-dz,pz=dx;d.breathA=[P.x-px*7-dx*2,P.z-pz*7-dz*2];d.breathB=[P.x+px*7+dx*2,P.z+pz*7+dz*2];if(Math.random()<.5){const t=d.breathA;d.breathA=d.breathB;d.breathB=t}}
  if(d.ct>2.7&&d.ct<4.4&&d.breathA){const u=(d.ct-2.7)/1.7,T=[lp(d.breathA[0],d.breathB[0],u),lp(d.breathA[1],d.breathB[1],u)],m=dMouth(d);d.breathT=T;
   d.emitT-=dt;if(d.emitT<=0){d.emitT=.04;spawnFlame(m,[T[0]+rr(-.8,.8),hAt(T[0],T[1])+.3,T[1]+rr(-.8,.8)])}
   if((d.burnT=(d.burnT||0)-dt)<=0){d.burnT=.13;BURNS.push({x:T[0]+rr(-.4,.4),z:T[1]+rr(-.4,.4),t:0,life:6})}
   d.dmgT=(d.dmgT||0)-dt;if(d.dmgT<=0&&Math.hypot(P.x-T[0],P.z-T[1])<1.9&&!P.air){d.dmgT=.3;dHit(d,{dmg:9,guard:24,knock:'flinch',parryable:false})}
   if(Math.floor(d.ct/.2)!==Math.floor((d.ct-dt)/.2))sfx.fire()}else d.breathT=null;
  if(d.ct>5.5){d.breaths++;d.st='hover';d.t=0;dGo(d,'skill08',.3,1)}break}
 case'circle':{d.speed=1.2;d.ang+=.62*sp*dt*d.cdir;const R=22,tx=P.x+Math.sin(d.ang)*R,tz=P.z+Math.cos(d.ang)*R,ox=d.x,oz=d.z;dFly(d,tx,tz,17*sp,dt);d.fy=lp(d.fy,8,.04);
  const vx=d.x-ox,vz=d.z-oz;if(Math.hypot(vx,vz)>1e-3)d.yaw+=angd(Math.atan2(vx,vz),d.yaw)*Math.min(1,dt*5);d.roll=lp(d.roll,-.32*d.cdir,.05);d.pitch=lp(d.pitch,0,.05);
  if(Math.floor(d.t/.5)!==Math.floor((d.t-dt)/.5))sfx.wings(.5);
  if(d.t>2.2/sp){d.am=(d.am||0)+1;if(d.am>[0,0,4,5][d.phase]){dLand(d);break}const r=Math.random();d.t=0;d.hitDone=false;
   if(r<.5){d.st='dive';d.dv=null;sfx.roar(.9);note('[!] Ejderha dalışa geçiyor — çizgiden atıl!','red')}else if(r<.78){d.st='strafe';d.sA=[d.x,d.z];const k=dist||1;d.sB=[P.x+(P.x-d.x)/k*20,P.z+(P.z-d.z)/k*20]}else{d.st='volley';d.vn=0;dGo(d,'skill10',.3,1.4*sp)}}break}
 case'dive':{const W=1.05/sp;
  if(d.t<W){dFace(d,P.x,P.z,dt,3);d.roll=lp(d.roll,0,.1);d.pitch=lp(d.pitch,-.25,.08);d.fy=lp(d.fy,11,.05);if(d.t<W*.75){const k=Math.hypot(P.x-d.x,P.z-d.z)||1;d.dv=[(P.x-d.x)/k,(P.z-d.z)/k];d.dS=[d.x,d.z];d.dL=k}break}
  const dv=d.dv,tr=Math.hypot(d.x-d.dS[0],d.z-d.dS[1]),rem=d.dL-tr;d.yaw=Math.atan2(dv[0],dv[1]);d.x+=dv[0]*28*sp*dt;d.z+=dv[1]*28*sp*dt;d.speed=1.6;
  d.fy=1.4+9.6*Math.pow(Math.min(1,Math.abs(rem)/18),1.6);d.pitch=rem>0?.35:-.3;
  if(!d.hitDone&&d.fy<4&&Math.hypot(P.x-d.x,P.z-d.z)<3.4&&heroOpen()){d.hitDone=true;
   if(P.inv>0){perfectDodge({src:d});floatText(P.x,P.y+1.8,P.z,'KAÇINDIN','gold')}
   else{holdHurt(d,dDmg(d,10));d.grabLost=()=>d.st!=='carry';
    if(grabHero(d,{kind:'talon',lim:2.8,need:1.3,tickT:.9,pos:()=>dTalon(d),msg:'EJDERHA SENİ PENÇELERİYLE KAPTI! Art arda bas — ayağına sapla!',label:'SAPLA! Düğmelere art arda bas',
     onTick:o=>holdHurt(o,dDmg(o,3)),
     onFree:o=>{if(o.hurt(o.max*.025,0,0,'stab')){onFoeKilled(o,false);return}addPosture(o,POSMAX.dragon*.25);o.flash=1;floatText(P.x,P.y+1,P.z,'AYAĞINA SAPLADIN','gold');sfx.stab();spawnSparks(P.x,P.y+1,P.z,16,[.8,.1,.05],5);o.st='circle';o.t=0;o.am=Math.max(o.am,3)},
     onFail:o=>{CAM.shake=1;sfx.thud();const g=hAt(P.x,P.z);P.y=g;P.air=false;spawnSparks(P.x,g+.2,P.z,30,[.6,.55,.45],8);dHit(o,{dmg:44,guard:99,knock:'down',power:2.2,unblockable:true,parryable:false});note('[!] Ejderha seni yere çaldı!','red');o.fy=2;dLand(o)}})){d.st='carry';d.t=0;break}}}
  if(rem<-16){if(d.phase<3||Math.random()<.55){d.st='crash';d.t=0;d.hitDone=false;dGo(d,'down',.25,1);note('[Sistem] Ejderha ıskaladı ve yere çakıldı — şimdi!','gold')}else{d.st='circle';d.t=0;d.ang=Math.atan2(d.x-P.x,d.z-P.z);dGo(d,'skill08',.3,1.2)}}break}
 case'carry':{if(P.st!=='grabbed'||GRAB.by!==d){if(d.st==='carry'){d.st='circle';d.t=0;d.ang=Math.atan2(d.x-P.x,d.z-P.z)}break}
  d.fy=lp(d.fy,13,.03);d.ang=(d.ang||0)+.9*dt;const cx=d.dS[0]+d.dv[0]*d.dL,cz=d.dS[1]+d.dv[1]*d.dL,ox=d.x,oz=d.z;dFly(d,cx+Math.sin(d.ang)*9,cz+Math.cos(d.ang)*9,12,dt);const vx=d.x-ox,vz=d.z-oz;if(Math.hypot(vx,vz)>1e-3)d.yaw+=angd(Math.atan2(vx,vz),d.yaw)*Math.min(1,dt*4);d.roll=lp(d.roll,-.25,.05);d.pitch=lp(d.pitch,-.15,.05);
  if(Math.floor(d.t/.45)!==Math.floor((d.t-dt)/.45))sfx.wings(.5);break}
 case'crash':{d.speed=1;if(!d.hitDone){d.hitDone=true;d.vx=Math.sin(d.yaw)*14;d.vz=Math.cos(d.yaw)*14}d.fy=Math.max(0,d.fy-dt*16);d.pitch=lp(d.pitch,.2,.2);
  if(d.fy<=0){const p=collide(d.x+d.vx*dt,d.z+d.vz*dt,2.2);d.x=p[0];d.z=p[1];d.vx*=Math.exp(-dt*3);d.vz*=Math.exp(-dt*3);if(Math.random()<dt*20)spawnSparks(d.x,d.y+.2,d.z,3,[.6,.5,.4],4);if(!d.crashed){d.crashed=1;CAM.shake=Math.max(CAM.shake,.9);sfx.thud();if(dist<5)dHit(d,{dmg:20,guard:50,knock:'down',power:1.4,parryable:false})}}
  if(d.t>1.0){d.crashed=0;dDown(d)}break}
 case'strafe':{const ax=d.sB[0]-d.x,az=d.sB[1]-d.z,al=Math.hypot(ax,az);d.fy=lp(d.fy,7,.05);
  if(d.t<.85/sp){dFace(d,d.sB[0],d.sB[1],dt,3);break}
  d.yaw+=angd(Math.atan2(ax,az),d.yaw)*Math.min(1,dt*3);d.x+=Math.sin(d.yaw)*19*sp*dt;d.z+=Math.cos(d.yaw)*19*sp*dt;d.roll=lp(d.roll,0,.1);
  const m=dMouth(d),T=[d.x-Math.sin(d.yaw)*1.5,d.z-Math.cos(d.yaw)*1.5];d.emitT=(d.emitT||0)-dt;if(d.emitT<=0){d.emitT=.045;spawnFlame(m,[T[0]+rr(-1,1),hAt(T[0],T[1])+.3,T[1]+rr(-1,1)])}
  if((d.burnT=(d.burnT||0)-dt)<=0){d.burnT=.12;BURNS.push({x:T[0]+rr(-.6,.6),z:T[1]+rr(-.6,.6),t:0,life:6})}if(Math.floor(d.t/.2)!==Math.floor((d.t-dt)/.2))sfx.fire();
  d.dmgT=(d.dmgT||0)-dt;if(d.dmgT<=0&&Math.hypot(P.x-T[0],P.z-T[1])<2.3&&!P.air){d.dmgT=.3;dHit(d,{dmg:11,guard:26,knock:'flinch',parryable:false})}
  if(al<2||d.t>4){d.st='circle';d.t=0;d.ang=Math.atan2(d.x-P.x,d.z-P.z);dGo(d,'skill08',.3,1.2)}break}
 case'volley':{dFace(d,P.x,P.z,dt,2);d.fy=lp(d.fy,9,.05);const N=d.phase>=3?5:3;
  if(d.t>.7+d.vn*.42/sp&&d.vn<N){d.vn++;sfx.fire();const lead=1.1,tx=P.x+P.vx*lead*(d.vn===1?1:.5)+(d.vn>1?rr(-4,4):0),tz=P.z+P.vz*lead*(d.vn===1?1:.5)+(d.vn>1?rr(-4,4):0);dShot(tx,tz,1.15,3.2,26)}
  if(d.t>.9+N*.42/sp+.8){d.st='circle';d.t=0;d.ang=Math.atan2(d.x-P.x,d.z-P.z);dGo(d,'skill08',.3,1.2)}break}
 case'land':{d.fy=Math.max(0,d.fy-dt*10);d.pitch=lp(d.pitch,0,.1);if(d.ct>.56&&!d.landed&&d.fy<.5){d.landed=true;CAM.shake=Math.max(CAM.shake,dist<20?.7:.25);sfx.thud();spawnSparks(d.x,d.y+.3,d.z,24,[.6,.55,.45],6);if(dist<5.5)dHit(d,{dmg:18,guard:40,knock:'down',power:1.2,parryable:false})}
  if(d.ct>=1.75&&d.fy<=0){d.landed=false;d.am=0;d.gm=0;if(d.phase>=2){dToGround(d);d.cd=.3}else{d.st='tired';d.t=0;dGo(d,'stand',.3,.5);note('[Sistem] Ejderha yoruldu: şimdi saldır!','gold')}}break}}
 // burning ground: hurts while standing in it; dodging through it still burns (it is fire, not a blow)
 if(P.alive&&!P.held&&(P.burnT=(P.burnT||0)-dt)<=0)for(const b of BURNS)if(b.t<b.life&&Math.hypot(P.x-b.x,P.z-b.z)<1.3&&!P.air){P.burnT=.5;const inv=P.inv;P.inv=0;hitPlayer({dmg:4,knock:'none',unblockable:true,parryable:false});P.inv=inv;break}}
// what the ground shows before each move (called from the telegraph pass)
function dragonTele(){const d=DRAGON;if(!d||d.dead)return;const sp=dSpd(d);
 if(d.st==='claw'&&d.ct<2.6)tele('circle',d.x+Math.sin(d.yaw)*6.2+Math.cos(d.yaw)*-1.2,d.z+Math.cos(d.yaw)*6.2-Math.sin(d.yaw)*-1.2,2.6,0,0,d.slow&&d.ct<2.25?.55:1);
 if(d.st==='breath'&&d.breathA&&d.ct<4.4){const ax=d.breathA[0],az=d.breathA[1],bx=d.breathB[0],bz=d.breathB[1];tele('strip',ax,az,3.6,Math.hypot(bx-ax,bz-az),Math.atan2(bx-ax,bz-az),d.ct<2.7?1:.5)}
 if(d.st==='land'&&d.ct<.6)tele('circle',d.x,d.z,5.5,0,0,1);
 if(d.st==='tail'&&d.t<.6/sp+.85/sp)tele('circle',d.x,d.z,10.5,0,0,sst(0,.3,d.t)*.8);
 if(d.st==='bite'&&d.t<.6/sp)tele('strip',d.x,d.z,3,12,d.yaw,sst(0,.3,d.t));
 if(d.st==='nova'&&d.t<1.6)tele('circle',d.x,d.z,10,0,0,sst(0,1.6,d.t));
 if(d.st==='awaken'&&d.t<.95)tele('circle',d.x,d.z,12,0,0,sst(0,.9,d.t));
 if(d.st==='dive'&&d.dv){const L=d.dL+16;tele('strip',d.dS[0],d.dS[1],3.6,L,Math.atan2(d.dv[0],d.dv[1]),d.t<1.05/sp?1:.45)}
 if(d.st==='strafe'&&d.t<1.4/sp)tele('strip',d.sA[0],d.sA[1],3.2,Math.hypot(d.sB[0]-d.sA[0],d.sB[1]-d.sA[1]),Math.atan2(d.sB[0]-d.sA[0],d.sB[1]-d.sA[1]),.9);
 for(const s of DSHOTS)tele('circle',s.x,s.z,s.r,0,0,sst(0,.4,s.t))}
function dragonTell(d){return d.st==='claw'&&d.ct<2.7||d.st==='breath'&&d.ct<2.7||d.st==='tail'&&d.t<.6/dSpd(d)||d.st==='bite'&&d.t<.6/dSpd(d)||d.st==='nova'&&d.t<1.6||d.st==='dive'&&d.t<1.05/dSpd(d)}
// ---------- climbing the downed dragon: stab the neck, hold on when it thrashes
function rideTarget(){const d=DRAGON;if(!d||d.dead||d.st!=='downed'||d.t>4)return null;const n=dBone(d,DRG.bones.neck);return Math.hypot(n[0]-P.x,n[2]-P.z)<5.5?d:null}
function startRide(){const d=rideTarget();if(!d)return false;P.st='ride';P.t=0;P.held=1;P.vx=P.vz=0;P.stabT=0;d.thr=1.9;d.thrW=0;d.t=0;sfx.jump();note('[Sistem] Ejderhanın boynuna tırmandın! Saldırıya art arda bas — «TUTUN!» görünce BLOK basılı tut.','gold');return true}
function rideOff(safe){const d=DRAGON;P.held=0;if(P.st!=='ride')return;P.st='move';P.t=0;P.air=true;P.vy=4;const k=safe?3:7;P.vx=Math.sin(d.yaw+PI/2)*k;P.vz=Math.cos(d.yaw+PI/2)*k;P.inv=Math.max(P.inv,.5);if(!safe){P.air=false;knockDown([Math.sin(d.yaw+PI/2),Math.cos(d.yaw+PI/2)],1.6);holdHurt(d,dDmg(d,14))}}
function updateRide(dt){const d=DRAGON;if(!d||d.dead||d.st!=='downed'){rideOff(true);return}const n=dBone(d,DRG.bones.neck);P.x=n[0];P.z=n[2];P.y=n[1]+.35;P.yaw=d.yaw;P.air=false;CAM.tx=P.x;CAM.tz=P.z;
 P.stabT=Math.max(0,P.stabT-dt);BUF.atk=BUF.dodge=BUF.jump=BUF.hvy=-9;
 if(IN.mash>0&&!IN.blockHeld&&P.stabT<=.12){P.stabT=.32;const dm=d.max*.011*(1+(SYS.str-5)*.02);if(d.hurt(dm,0,0,'stab')){onFoeKilled(d,false);return}if(P.st!=='ride')return;sfx.stab();spawnSparks(n[0],n[1]+.2,n[2],10,[.75,.08,.04],4);floatText(n[0],n[1]+.8,n[2],''+Math.round(dm),'');gainRage(4);}
 d.thr-=dt;if(d.thr<=0&&!d.thrW){d.thrW=1;d.thr=.65;floatText(P.x,P.y+1.8,P.z,'TUTUN!','crit');sfx.roar(.8);note('[!] Silkeleniyor — BLOK basılı tut!','red')}
 else if(d.thr<=0&&d.thrW){d.thrW=0;CAM.shake=Math.max(CAM.shake,.8);sfx.thud();if(!IN.blockHeld){rideOff(false);note('[!] Ejderha seni üstünden fırlattı!','red');return}floatText(P.x,P.y+1.8,P.z,'TUTUNDUN','gold');d.thr=2.1;d.thrN=(d.thrN||0)+1;if(d.thrN>=3){d.thrN=0;rideOff(true);return}}
 if(d.thrW)P.yaw+=Math.sin(P.t*30)*.06}
function ridePose(q){const s=P.stabT>0?Math.sin((1-P.stabT/.32)*PI):0,hold=IN.blockHeld;q.pel=.4;q.spX=.55;q.hdX=-.3;q.LthX=-1.2;q.RthX=-1.0;q.Lkn=1.9;q.Rkn=1.8;
 if(hold){q.LaX=-1.0;q.LaZ=.6;q.Lel=1.3;q.RaX=-1.1;q.Rel=1.0}else{q.RaX=lp(-2.8,-.6,s);q.Rel=lp(.4,.1,s);q.LaX=lp(-2.6,-.7,s);q.Lel=.4;q.spX=.55+.25*s}}
