// ===================== MAGIC, GOBLİN KÖYÜ, TAMED WOLVES, ROAD ROBBERS, SLIMES (v27) =====================
// ---------- magic: spells bought from the bookseller / taught at the academy, cast with BÜYÜ (double tap = next spell)
const MAGIC=[];let manaEl=null;
function spellHud(){const b=$('bSpell');if(!b)return;const k=SYS.spell;b.style.display=SYS.spells&&Object.keys(SYS.spells).length?'':'none';if(k&&SPELLS[k])b.lastChild.textContent=SPELLS[k].n.split(' ')[0].toUpperCase();
 if(!manaEl){manaEl=document.createElement('div');manaEl.style.cssText='position:fixed;left:10px;top:64px;width:150px;height:5px;background:rgba(0,0,0,.45);border-radius:3px;z-index:5;pointer-events:none';manaEl.innerHTML='<div style="height:100%;width:100%;background:linear-gradient(90deg,#3a6cff,#8fb6ff);border-radius:3px"></div>';document.body.appendChild(manaEl)}
 manaEl.style.display=b.style.display}
function spellTap(){const now=GT.clock;if(now-(P.spTap||-9)<.32&&SYS.spells){const ks=Object.keys(SYS.spells),i=ks.indexOf(SYS.spell);SYS.spell=ks[(i+1)%ks.length];P.spTap=-9;P.spQueued=0;note('[Büyü] Seçili: '+SPELLS[SYS.spell].n);spellHud();return}P.spTap=now;P.spQueued=now+.33}
function castSpell(){const k=SYS.spell;if(!k||!SYS.spells||!SYS.spells[k])return;if(!/^(move|block)$/.test(P.st)||!P.alive)return;const S=SPELLS[k];if((P.mana??100)<S.cost){note('Büyü gücü yetersiz');return}
 P.mana=(P.mana??100)-S.cost;P.manaT=1;P.st='cast';P.t=0;P.castK=k;P.cast=0;sfx.charge();const lk=P.lock&&!P.lock.dead?P.lock:nearestFoe(16,1.2);if(lk)P.yaw=Math.atan2(lk.x-P.x,lk.z-P.z)}
const spellPow=k=>(1+.25*((SYS.spells&&SYS.spells[k]||1)-1))*(18+weaponDmg()*.45)*dmgMul();
function updateCast(dt){P.vx*=Math.exp(-dt*10);P.vz*=Math.exp(-dt*10);if(P.t>.22&&!P.cast){P.cast=1;const k=P.castK,from=[P.x+Math.sin(P.yaw)*.8,P.y+1.4,P.z+Math.cos(P.yaw)*.8];
  if(k==='fire'||k==='frost'){const lk=P.lock&&!P.lock.dead?P.lock:nearestFoe(20,.8);let d=[Math.sin(P.yaw),0,Math.cos(P.yaw)];if(lk){const ty=(lk.y||0)+(lk.big?1.3:.8),v=[lk.x-from[0],ty-from[1],lk.z-from[2]],l=Math.hypot(...v)||1;d=v.map(q=>q/l)}
   let m=MAGIC.find(o=>!o.on);if(!m){m={ob:obj(FIREGEO(),{unlit:1,shade:0,col:[1,1,1],pos:[0,0,0],cull:200})};MAGIC.push(m)}const sp=k==='fire'?24:32;Object.assign(m,{on:1,k,x:from[0],y:from[1],z:from[2],vx:d[0]*sp,vy:d[1]*sp,vz:d[2]*sp,life:1.6,hit:new Set(),dmg:spellPow(k)*(k==='fire'?1.1:.8)});m.ob.vis=true;m.ob.col=k==='fire'?[1.6,.6,.15]:[.5,.9,1.8]}
  else if(k==='bolt'){let at=[P.x,P.y+1.3,P.z];const used=new Set();for(let n=0;n<3;n++){let b=null,bd=n?7:12;for(const f of foes()){if(used.has(f)||!foeHostile(f))continue;const q=Math.hypot(f.x-at[0],f.z-at[2]);if(q<bd){bd=q;b=f}}if(!b)break;used.add(b);const to=[b.x,(b.y||0)+1,b.z];for(let s=0;s<6;s++){const u=s/5;spawnSparks(lp(at[0],to[0],u)+rr(-.2,.2),lp(at[1],to[1],u)+rr(-.3,.3),lp(at[2],to[2],u)+rr(-.2,.2),3,[.7,.8,1.6],2)}
    const dm=Math.round(spellPow('bolt')*(n?.7:1)),k2=Math.hypot(b.x-P.x,b.z-P.z)||1,dead=foeHurt(b,dm,(b.x-P.x)/k2,(b.z-P.z)/k2,'spell');addPosture(b,30);floatText(b.x,(b.y||0)+1.6,b.z,'ŞİMŞEK '+dm,'crit');if(dead)onFoeKilled(b,false);at=to}sfx.clang();CAM.shake=Math.max(CAM.shake,.3)}
  else if(k==='ward'){P.wardT=6*(1+.15*((SYS.spells.ward||1)-1));floatText(P.x,P.y+2,P.z,'KORUYUCU MÜHÜR','gold');sfx.parry()}}
 if(P.t>.5){P.st='move';P.t=0}}
function castPose(q){const k=sst(0,.2,P.t)*(1-sst(.35,.5,P.t));q.LaX=-1.5*k;q.LaZ=.25;q.Lel=.1;q.RaX=-1.2*k;q.RaZ=.4;q.Rel=.5;q.spX=-.1*k;q.LthX=-.35;q.Lkn=.4;q.RthX=.2;q.Rkn=.2}
function magicTick(dt){P.mana=Math.min(100,(P.mana??100)+(P.manaT>0?0:7)*dt);if(P.manaT>0)P.manaT-=dt;if(P.wardT>0){P.wardT-=dt;if(Math.random()<dt*10){const a=rnd()*6.28;spawnSparks(P.x+Math.cos(a)*.8,P.y+rr(.3,1.8),P.z+Math.sin(a)*.8,1,[.9,.8,.4],.5)}}
 if(P.spQueued&&GT.clock>P.spQueued){P.spQueued=0;castSpell()}
 if(manaEl)manaEl.firstChild.style.width=Math.round(P.mana??100)+'%';
 for(const m of MAGIC){if(!m.on){m.ob.vis=false;continue}m.life-=dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.z+=m.vz*dt;const s=m.k==='fire'?1.1:.8;m.ob.M=mtrs([m.x,m.y-.4,m.z],[GT.time*9,GT.time*7,0]);for(let i=0;i<12;i++)if(i%4<3)m.ob.M[i]*=s;m.ob.pos=[m.x,0,m.z];if(Math.random()<.5)spawnSparks(m.x,m.y,m.z,1,m.k==='fire'?[1,.5,.1]:[.6,.9,1],1);
  let boom=m.life<=0||m.y<hAt(m.x,m.z)||inBuilding(m.x,m.z,0);for(const f of foes()){if(m.hit.has(f)||f.dead)continue;const fy=(f.y||0)+(f===DRAGON?3:f.big?1.2:.7);if(Math.hypot(f.x-m.x,f.z-m.z)<(f===DRAGON?3:1.1)&&Math.abs(m.y-fy)<(f===DRAGON?3.5:1.3)){m.hit.add(f);const k=Math.hypot(m.vx,m.vz)||1,dm=Math.round(m.dmg),dead=foeHurt(f,dm,m.vx/k,m.vz/k,'spell');floatText(f.x,fy+.9,f.z,(m.k==='fire'?'ALEV ':'BUZ ')+dm,'crit');
    if(m.k==='fire'){f.bleedT=Math.max(f.bleedT||0,3);f.bleedD=Math.max(f.bleedD||0,dm*.08);boom=true}else{f.slowUntil=GT.clock+4;if(f.spdMul===undefined||f.spdMul>=1)f.spdMul0=f.spdMul||1;f.spdMul=.45;addPosture(f,20)}if(dead)onFoeKilled(f,false)}}
  if(boom){m.on=false;m.ob.vis=false;spawnSparks(m.x,m.y,m.z,16,m.k==='fire'?[1,.5,.1]:[.6,.9,1],5);if(m.k==='fire'){sfx.fire();for(const f of foes()){if(m.hit.has(f)||f.dead)continue;if(Math.hypot(f.x-m.x,f.z-m.z)<2.6){const dead=foeHurt(f,Math.round(m.dmg*.45),0,0,'spell');if(dead)onFoeKilled(f,false)}}}}}
 for(const f of foes())if(f.slowUntil&&GT.clock>f.slowUntil){f.slowUntil=0;f.spdMul=f.spdMul0||1}}
// ---------- GOBLİN KÖYÜ: palisade, huts, the war-wolf kennels; the camps around it are its outposts
function buildGoblinVillage(){const g=G(),[cx,cz]=GVIL,R=mkRng(777),wood=[.38,.27,.16],dk=[.25,.18,.11],hide=[.48,.38,.26];
 for(let k=0;k<90;k++){const a=k/90*2*PI;if(Math.abs(angd(a,PI*1.25))<.12)continue;const x=cx+Math.sin(a)*95,z=cz+Math.cos(a)*95,y=hAt(x,z)-.5,h=4+R()*1.6;box(g,x-.55,y,z-.55,x+.55,y+h,z+.55,wood);box(g,x-.25,y+h,z-.25,x+.25,y+h+.7,z+.25,dk);addBox(x-.55,z-.55,x+.55,z+.55,4)}
 for(let i=0;i<18;i++){const a=R()*2*PI,r=20+R()*60,x=cx+Math.sin(a)*r,z=cz+Math.cos(a)*r,y=hAt(x,z)-.3,w=3+R()*2;box(g,x-w,y,z-w,x+w,y+2.2,z+w,hide);for(let q=0;q<3;q++){const f=1-q*.32;box(g,x-(w+.4)*f,y+2.2+q*.8,z-(w+.4)*f,x+(w+.4)*f,y+3+q*.8,z+(w+.4)*f,q%2?dk:hide)}box(g,x-.6,y,z+w-.05,x+.6,y+1.6,z+w+.05,[.08,.06,.05]);addBox(x-w,z-w,x+w,z+w,2.5)}
 // the chieftain's long-house and a totem
 {const y=hAt(cx,cz);box(g,cx-8,y,cz-5,cx+8,y+4,cz+5,hide);box(g,cx-9,y+4,cz-6,cx+9,y+6,cz+6,dk);addBox(cx-8,cz-5,cx+8,cz+5,4);const tx=cx,tz=cz-14;box(g,tx-.5,y,tz-.5,tx+.5,y+7,tz+.5,wood);box(g,tx-1.2,y+5.5,tz-.6,tx+1.2,y+6.8,tz+.6,[.7,.65,.55])}
 // kennels: wolves tamed by goblins
 for(let i=0;i<3;i++){const a=i*2.1+.5,x=cx+Math.sin(a)*45,z=cz+Math.cos(a)*45,y=hAt(x,z);box(g,x-3,y,z-2,x+3,y+1.6,z+2,wood);box(g,x-3.3,y+1.6,z-2.3,x+3.3,y+1.9,z+2.3,dk)}
 obj(geo(g),{shade:.9,pos:[cx,0,cz],cull:900,out:.01,outCol:[.05,.04,.03]})}
function spawnGoblinVillage(){const[cx,cz]=GVIL,c=CAMPSITES[0];for(let i=0;i<10;i++){const a=i/10*2*PI,r=25+(i%3)*15,p=collide(cx+Math.sin(a)*r,cz+Math.cos(a)*r,.5),g=mkGob(p[0],p[1],false,'gvil',c);g.R=rigObj(GOBM,{out:.014,cull:150});g.archer=i%4===0;scaleFoe(g,15,HPK.gob);g.vil=1}
 {const p=collide(cx,cz+8,1),b=mkGob(p[0],p[1],true,'gvil',c);b.R=rigObj(BIGM,{out:.014,cull:150});scaleFoe(b,17,HPK.big);b.vil=1}
 // war wolves: tamed by the goblins, darker, they stay by their masters and answer the village alarm
 for(let i=0;i<6;i++){const a=i/6*2*PI+.3,p=collide(cx+Math.sin(a)*40,cz+Math.cos(a)*40,.6),w=mkWolf(p[0],p[1],{yaw:a});w.warg=1;w.title='SAVAŞ KURDU';scaleFoe(w,15,HPK.wolf);w.calm=0}}
function wargTick(){for(const w of wolves){if(!w.warg||w.dead||w.tame)continue;if(!hostileSt(w)){const alarm=GOBS.some(g=>g.vil&&!g.dead&&g.hostile()&&Math.hypot(g.x-w.x,g.z-w.z)<70);if(alarm){w.aware=1;w.st='stalk';w.t=0;w.ls=[P.x,P.z];w.unseen=0}}}}
// ---------- road robbers: "adventurers" on the roads between the two cities who want your purse
EVDEF.robbers={n:'YOL SOYGUNCULARI',w:3,ok:()=>Math.abs(P.x)<140&&P.z>200&&P.z<CAP.z-CAP.R,start(E){const p=evSpot(22,32);if(!p)return false;const lv=Math.max(2,SYS.lv);E.ents=[mkHuman(p[0],p[1],{lv,shield:true,title:'MACERACI · Sırtlan Bora',col:[.9,.8,.6]}),mkHuman(p[0]+2,p[1]+1,{lv,col:[.85,.75,.6]}),mkHuman(p[0]-2,p[1]+1,{lv,col:[.85,.75,.6]})];
  for(const g of E.ents){g.so=1;g.rob=1}E.x=p[0];E.z=p[1];E.demand=Math.max(30,Math.round((SYS.gold||0)*.3));E.ask=0;note('[Olay] Yolu üç "maceracı" kesiyor. Yaklaşınca konuşacaklar…','red');return true},reward:8};
function robTick(dt){const E=EVT.cur;if(!E||E.k!=='robbers')return;const lead=E.ents[0];if(!lead||lead.dead)return;const d=Math.hypot(P.x-lead.x,P.z-lead.z);
 for(const g of E.ents)if(g.so&&!g.dead){g.yaw+=angd(Math.atan2(P.x-g.x,P.z-g.z),g.yaw)*Math.min(1,dt*4);if(d>7&&d<40)agentMove(g,P.x,P.z,3,dt,g.rad,6),g.so=1;g.y=hAt(g.x,g.z)}
 if(!E.ask&&d<8){E.ask=1;E.askT=GT.clock+10;note('Sırtlan Bora: "Yol vergisi, kardeş. '+E.demand+' altın bırak — ya da kılıçla öde." (ETKİLEŞ = öde, saldır = savaş)','red')}
 const hit=E.ents.some(g=>g.hp<g.max);if(E.ask&&(hit||GT.clock>E.askT)){for(const g of E.ents){g.so=0;g.st='chase';g.aware=1;g.ls=[P.x,P.z]}E.ask=2;E.k2='fight';if(!hit)note('Sırtlan Bora: "Demek öyle. Alın onu!"','red');EVT.cur.k='robbers_f'}}
EVDEF.robbers_f={n:'YOL SOYGUNCULARI',w:0,ok:()=>false,start(){return false},reward:8};
function robPay(){const E=EVT.cur;if(!E||E.k!=='robbers'||E.ask!==1)return false;if(Math.hypot(P.x-E.ents[0].x,P.z-E.ents[0].z)>9)return false;if((SYS.gold||0)<E.demand){note('Sırtlan Bora: "Bu kadar mı? O zaman kılıç konuşsun."','red');E.askT=0;return true}
 SYS.gold-=E.demand;note('[Olay] '+E.demand+' altın verdin. Maceracılar gülerek yollarına gitti.','');const L=E.ents;EVT.cur=null;for(const g of L){g.so=0;g.st='return';g.aware=0}setTimeout(()=>evFree(L),6000);save(P);return true}
// ---------- SLIMES: bouncing jelly in the meadows and the swamp; big ones split when they die
const SLIMES=[];let slimeGeo=null;const SLK={green:{col:[.35,.9,.35],n:'Balçık'},blue:{col:[.4,.65,1.2],n:'Buz Balçığı'},red:{col:[1.2,.4,.3],n:'Ateş Balçığı'}};
function slimeGeom(){if(slimeGeo)return slimeGeo;const g=G(),N=10,M=7;for(let j=0;j<=M;j++){const v=j/M,ph=v*PI;for(let i=0;i<=N;i++){const th=i/N*2*PI,x=Math.sin(ph)*Math.cos(th),y=Math.cos(ph),z=Math.sin(ph)*Math.sin(th);g.P.push(x*.5,(y*.5+.5)*(y<0?.6:1),z*.5);g.N.push(x,y,z);g.C.push(1,1,1);g.U.push(0,0);g.W.push(0)}}
 for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;g.I.push(a,c,b,b,c,d)}
 box(g,-.18,.55,.38,-.08,.7,.46,[.05,.05,.05]);box(g,.08,.55,.38,.18,.7,.46,[.05,.05,.05]);return slimeGeo=geo(g)}
function mkSlime(x,z,sz,kind,lv){const s={slime:1,x,z,y:hAt(x,z),hx:x,hz:z,sz,kind,yaw:rnd()*6.28,st:'idle',t:rr(0,2),air:0,vy:0,hp:0,max:0,lv,rad:.45*sz,pk:'slime',dead:0,flash:0,kx:0,kz:0,aware:0,sc:sz};
 s.max=s.hp=Math.round(70*sz*lvMul(lv));s.hostile=()=>s.aware>=1&&!s.dead;s.open=()=>s.st==='squash';
 s.hurt=(dmg,dx,dz,kind)=>{if(s.dead)return false;s.hp-=dmg;s.flash=1;s.aware=1;s.kx=(dx||0)*4/sz;s.kz=(dz||0)*4/sz;s.st='squash';s.t=0;if(s.hp<=0){s.hp=0;s.dead=1;slimeSplit(s);return true}return false};
 s.ob=obj(slimeGeom(),{shade:.7,pos:[x,0,z],cull:120,out:.01,outCol:[.05,.1,.05],col:SLK[kind].col});s.ob.alpha=.85;SLIMES.push(s);return s}
function slimeSplit(s){spawnSparks(s.x,s.y+.4*s.sz,s.z,14,SLK[s.kind].col,4);sfx.flesh&&sfx.flesh();if(s.sz>.55){for(let i=0;i<2;i++){const c=mkSlime(s.x+rr(-.8,.8),s.z+rr(-.8,.8),s.sz*.6,s.kind,s.lv);c.aware=1;c.st='hop';c.t=.3;c.vy=4;c.air=.1;c.kx=rr(-3,3);c.kz=rr(-3,3);c.child=1}}
 setTimeout(()=>{s.ob.vis=false},1500)}
POSMAX.slime=40;
function spawnSlimes(){const R=mkRng(8080);let n=0;for(let i=0;i<500&&n<70;i++){const x=(R()-.5)*2*(WS-100),z=(R()-.5)*2*(WS-100),zn=zoneAt(x,z);if(!(zn==='forest'||zn==='swamp'||zn==='dense')||Math.hypot(x,z)<240||inCapital(x,z,60)||depthAt(x,z)>.2)continue;
  const kind=zn==='swamp'?'green':R()<.5?'green':Math.hypot(x,z)>1500?(R()<.5?'blue':'red'):'green';const lv=regionLevel(x,z);const k=1+Math.floor(R()*3);for(let j=0;j<k;j++)mkSlime(x+R()*6,z+R()*6,j===0?1.4:1,kind,lv);n++}}
function updateSlimes(dt){for(let i=SLIMES.length-1;i>=0;i--){const s=SLIMES[i],d=Math.hypot(P.x-s.x,P.z-s.z);
  if(s.dead){s.deadT=(s.deadT||0)+dt;if(s.child&&s.deadT>2){s.ob.vis=false;SLIMES.splice(i,1);continue}if(!s.child&&s.deadT>150&&d>90){Object.assign(s,{dead:0,hp:s.max,x:s.hx,z:s.hz,st:'idle',aware:0,deadT:0});s.ob.vis=true}continue}
  if(d>160)continue;s.t+=dt;s.flash=Math.max(0,s.flash-dt*5);if(Math.abs(s.kx)+Math.abs(s.kz)>.05){const p=collide(s.x+s.kx*dt,s.z+s.kz*dt,s.rad);s.x=p[0];s.z=p[1];s.kx*=Math.exp(-dt*6);s.kz*=Math.exp(-dt*6)}
  if(!s.aware&&d<(P.crouch?5:11)&&P.alive){s.aware=1;sfx.flesh&&sfx.flesh()}if(s.aware&&(d>30||!P.alive)){s.aware=0}
  if(s.air>0||s.vy>0){s.vy-=18*dt;s.air=Math.max(0,s.air+s.vy*dt);const p=collide(s.x+Math.sin(s.yaw)*s.hs*dt,s.z+Math.cos(s.yaw)*s.hs*dt,s.rad);s.x=p[0];s.z=p[1];
   if(s.air<=0&&s.vy<0){s.vy=0;s.air=0;s.st='land';s.t=0;if(s.aware&&d<.55*s.sz+.6&&P.alive){const r=hitPlayer({src:s,dmg:Math.round(4+5*s.sz),guard:12*s.sz,dir:[Math.sin(s.yaw),Math.cos(s.yaw)],knock:s.sz>1.2?'down':'flinch'});if(r==='hit'){if(s.kind==='blue')P.slowT=Math.max(P.slowT||0,2.5);if(s.kind==='red'){P.burnT=0;holdHurt(s,3)}}}}}
  else if(s.st==='squash'){if(s.t>.35){s.st='idle';s.t=0}}
  else if(s.aware&&s.t>(s.st==='land'?.45:.2)&&P.alive){s.yaw=Math.atan2(P.x-s.x,P.z-s.z);s.vy=5.2+s.sz;s.air=.01;s.hs=Math.min(4.5,d*1.6);s.st='hop';s.t=0}
  else if(!s.aware&&s.t>rr(2,4)){s.yaw=rnd()*6.28;s.vy=3.5;s.air=.01;s.hs=1.2;s.t=0}
  s.y=hAt(s.x,s.z)}}
function drawSlimes(time){for(const s of SLIMES){const d=Math.hypot(P.x-s.x,P.z-s.z);if(d>120||s.dead&&s.deadT>1.2||DUN.on){s.ob.vis=false;continue}s.ob.vis=true;
  const sq=s.st==='squash'?.7:s.st==='land'&&s.t<.2?.75:s.air>0?1.15:1+.05*Math.sin(time*4+s.hx),sd=s.dead?Math.max(.05,1-s.deadT):1,k=s.sz*sd;
  s.ob.M=mtrs([s.x,s.y+s.air,s.z],[0,s.yaw,0]);s.ob.M[0]*=k/Math.sqrt(sq);s.ob.M[1]*=k/Math.sqrt(sq);s.ob.M[2]*=k/Math.sqrt(sq);s.ob.M[4]*=k*sq;s.ob.M[5]*=k*sq;s.ob.M[6]*=k*sq;s.ob.M[8]*=k/Math.sqrt(sq);s.ob.M[9]*=k/Math.sqrt(sq);s.ob.M[10]*=k/Math.sqrt(sq);
  s.ob.pos=[s.x,0,s.z];s.ob.flash=s.flash}}
