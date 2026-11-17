// ===================== WOLF BRAIN (v20 phase 3): packs, dens, scent, mood scoring, bite-and-retreat =====================
// A pack has a den, a leader and a mode: REST (lying around the den by day), ROAM (the leader walks the territory, the
// others follow in a loose file; more often at night) or HUNT (any member engaged). A wolf in a fight scores AGGRESSION
// (boldness, alpha, pack mates fighting, night, the hero bleeding) against FEAR (its wounds, dead pack mates, how many
// wolves the hero just killed, berserk). Frightened wolves back off to watch from cover or run to the den; bold ones
// stalk in low, circle for the flank and look for an opening (the hero swinging at someone else, healing, turned away).
// The normal attack is a short rush and a BITE followed by a retreat; the LEAP is rare (own 8-12 s cooldown) and needs
// a reason (an opening, an alpha) — and it keeps its long, readable crouch.
const PACKS=[],WKILL=[];
function buildPacks(){const used=new Set();for(const w of wolves){if(used.has(w)||w.tame)continue;const mem=wolves.filter(o=>!used.has(o)&&!o.tame&&Math.hypot(o.hx-w.hx,o.hz-w.hz)<26);mem.forEach(o=>used.add(o));
  const cx=mem.reduce((a,o)=>a+o.hx,0)/mem.length,cz=mem.reduce((a,o)=>a+o.hz,0)/mem.length,lead=mem.find(o=>o.boss)||mem.find(o=>o.alpha)||mem[0];
  const pk={id:PACKS.length,den:[cx,cz],mem,lead,mode:'rest',t:rr(4,30),tgt:null};mem.forEach((o,i)=>{o.pack=pk;o.slot=i;if(o.bold===undefined)o.bold=rr(.45,.78)});PACKS.push(pk)}}
function packRoamTarget(pk){const a=Math.random()*6.28,r=rr(15,62);return collide(pk.den[0]+Math.cos(a)*r,pk.den[1]+Math.sin(a)*r,.6)}
function updatePacks(dt){for(const pk of PACKS){if(!pk.lead||pk.lead.dead||pk.lead.tame)pk.lead=pk.mem.find(o=>!o.dead&&!o.tame)||pk.lead;
  if(Math.hypot(pk.den[0]-P.x,pk.den[1]-P.z)>300)continue;
  if(pk.mem.some(o=>!o.dead&&!o.tame&&hostileSt(o))){pk.mode='hunt';continue}if(pk.mode==='hunt'){pk.mode='rest';pk.t=rr(10,20);pk.tgt=null}
  pk.t-=dt;if(pk.t<=0){const roam=pk.mode==='rest'?(GT.night?.8:.45):(GT.night?.55:.3);if(Math.random()<roam){pk.mode='roam';pk.t=rr(25,50);pk.tgt=packRoamTarget(pk)}else{pk.mode='rest';pk.t=rr(18,40);pk.tgt=null}}
  if(pk.mode==='roam'&&pk.tgt&&pk.lead&&Math.hypot(pk.lead.x-pk.tgt[0],pk.lead.z-pk.tgt[1])<3)pk.tgt=packRoamTarget(pk)}}
// calm life: rest at the den, roam behind the leader. Returns true when it handled the wolf.
function wolfCalm(w,dt){const pk=w.pack;if(!pk||w.calm>0)return false;w.hyaw=lp(w.hyaw,Math.sin(w.t*.6+w.ph)*.45,.05);
 if(pk.mode==='roam'&&pk.tgt){if(w===pk.lead){w.st='roam';wolfMove(w,pk.tgt[0],pk.tgt[1],1.75,dt,3);w.crouch=lp(w.crouch,0,.1);return true}
  const L=pk.lead,row=1+Math.floor((w.slot-1)/2),side=(w.slot%2?1:-1),ox=side*1.4*row,oz=-2.1*row,c=Math.cos(L.yaw),s=Math.sin(L.yaw),gx=L.x+ox*c+oz*s,gz=L.z-ox*s+oz*c,q=Math.hypot(gx-w.x,gz-w.z);
  w.st='follow';if(q>1)wolfMove(w,gx,gz,q>9?5.5:q>3?2.6:1.75,dt,4);else{w.spd=lp(w.spd,0,.2);wolfFace(w,L.x+Math.sin(L.yaw)*5,L.z+Math.cos(L.yaw)*5,dt,3)}w.crouch=lp(w.crouch,0,.1);return true}
 // rest: lie around the den
 const a=w.slot*2.1+pk.id,gx=pk.den[0]+Math.cos(a)*(w===pk.lead?0:2.4),gz=pk.den[1]+Math.sin(a)*(w===pk.lead?0:2.4),q=Math.hypot(gx-w.x,gz-w.z);
 const bx=w.x,bz=w.z;if(q>2.2&&(w.restStuck||0)<2){w.st='roam';wolfMove(w,gx,gz,q>12?3.4:1.9,dt,3);w.crouch=lp(w.crouch,0,.1);w.restStuck=Math.hypot(w.x-bx,w.z-bz)<.4*dt?(w.restStuck||0)+dt:0}
 else{w.st='rest';w.spd=lp(w.spd,0,.2);w.crouch=lp(w.crouch,.85,.05);if(q<2.2)w.restStuck=0}return true}// a tree on the spot: lie down where it stands
// scent: an unseen hero close by is smelled (less when crouching); the wolf learns roughly where, not exactly
function wolfSmell(w,d,dt){const R=P.crouch?6:13;if(d>R||!P.alive||w.calm>0)return false;w.aware=Math.min(.95,w.aware+dt*.3*(1-d/R));if(Math.random()<dt*2)w.ls=[P.x+rr(-2.5,2.5),P.z+rr(-2.5,2.5)];return true}
const heroThreat=()=>{const t=GT.clock;while(WKILL.length&&t-WKILL[0]>25)WKILL.shift();return WKILL.length*.25+(P.berserk>0?.25:0)};
function wolfMood(w){const pk=w.pack,dead=pk?pk.mem.filter(o=>o.dead).length/pk.mem.length:0,eng=pk?pk.mem.filter(o=>!o.dead&&!o.tame&&hostileSt(o)).length:1;
 const fear=(1-w.hp/w.max)*1.3+dead*.9+Math.min(.7,heroThreat()),aggr=(w.bold||.6)+(w.alpha?.25:0)+(w.boss?3:0)+.12*Math.max(0,eng-1)+(GT.night?.1:0)+(P.hp<maxHP()*.35?.25:0);return{fear,aggr}}
// a hiding spot: the nearest tree or bush with its trunk between the wolf and the hero
function wolfCover(w){let best=null,bd=14;const cx=Math.floor(w.x/TG),cz=Math.floor(w.z/TG);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=treeGrid.get((cx+i+200)*1000+cz+j+200);if(!a)continue;
  for(const t of a){const d=Math.hypot(t.x-w.x,t.z-w.z);if(d<bd&&Math.hypot(t.x-P.x,t.z-P.z)>8){bd=d;best=t}}}
 if(!best){const k=Math.hypot(w.x-P.x,w.z-P.z)||1;return[P.x+(w.x-P.x)/k*16,P.z+(w.z-P.z)/k*16]}const k=Math.hypot(best.x-P.x,best.z-P.z)||1;return[best.x+(best.x-P.x)/k*(best.r+.9),best.z+(best.z-P.z)/k*(best.r+.9)]}
// engaged: stalk in, circle for the flank, pick an opening; or lose heart
function wolfEngage(w,d,dt,GS){w.brT=(w.brT||0)-dt;if(w.brT<=0){w.brT=.35;const m=wolfMood(w);w.mood=m;
  if(!w.boss&&(m.fear>m.aggr+.35||w.hp<w.max*.4&&m.fear>m.aggr-.05)){if(w.hp<w.max*.4){w.st='flee';w.t=0;w.hpit=0;sfx.hurt();return}w.st='retreat';w.t=0;w.retTo=11;w.after='watch';return}
  // attack decision (one wolf at a time; an opening raises the odds)
  if(w.st==='circle'&&!tokenBusy()&&w.cd<=0&&P.alive&&P.st!=='down'&&P.st!=='getup'&&P.st!=='td'&&w.unseen<.6){
   const opp=/^(attack|heavy|charge|drink|shoot|skill|hurt|exec|assn)$/.test(P.st)||Math.abs(angd(Math.atan2(w.x-P.x,w.z-P.z),P.yaw))>1.7,
    ch=.14+(opp?.45:0)+Math.min(.35,w.t*.07)+(w.boss?.2:0)+(m.aggr-m.fear)*.15;
   if(Math.random()<ch&&attackOK(w)){if(d>3.2&&d<7.8&&(w.pcd||0)<GT.clock&&(opp||w.alpha||w.boss)&&Math.random()<(w.boss?.45:.3)&&!P.air){w.pcd=GT.clock+rr(8,12);w.st='windup';w.t=0;w.dodged=false;w.resolved=false;GS.onWindup(w)}
    else{w.st='bitewind';w.t=0;w.bwT=.38+(habits().dodger?rr(.1,.45):0);w.resolved=false;sfx.growl()}return}}}// a dash-happy hero gets a held, uneven tell
 if(w.unseen>=.6){w.st='chase';wolfMove(w,w.ls[0],w.ls[1],5,dt);w.crouch=lp(w.crouch,0,.2);w.hpit=lp(w.hpit||0,.35,.1);if(w.unseen>4.5){w.st='search';w.t=0}return}
 w.hpit=lp(w.hpit||0,0,.2);
 if(d>9.5){w.st='stalk';const away=P.spd>2.2&&Math.abs(angd(Math.atan2(P.vx,P.vz),Math.atan2(P.x-w.x,P.z-w.z)))<1.3,fast=d>20||away;/* the prey walking off is chased, not stalked */wolfMove(w,P.x,P.z,fast?6.6:3.4,dt,fast?7:4);w.crouch=lp(w.crouch,fast?0:.45,.15);return}// stalk in low, run only from far away
 // circle at 5-6.5 m, working round towards the hero's back
 if(w.st!=='circle'){w.st='circle';w.t=0}w.crouch=lp(w.crouch,.25,.15);const me=Math.atan2(w.x-P.x,w.z-P.z),back=P.yaw+PI,dir=Math.sign(angd(back,me))||w.strafe;
 const a=me+dir*Math.min(1,.9/Math.max(d,2))*1.2,R=lp(5.2,6.6,(Math.sin(w.t*.7+w.ph)+1)/2),gx=P.x+Math.sin(a)*R,gz=P.z+Math.cos(a)*R,k=Math.hypot(gx-w.x,gz-w.z)||1,px=w.x,pz=w.z;
 const cs=Math.max(3.6,(P.spd||0)*1.15),p=collide(w.x+(gx-w.x)/k*cs*dt,w.z+(gz-w.z)/k*cs*dt,.42);w.x=p[0];w.z=p[1];w.spd=lp(w.spd,3.4,.2);w.ph+=3*dt*4;wolfFace(w,P.x,P.z,dt,9);if(Math.hypot(w.x-px,w.z-pz)<3.6*dt*.3)w.strafe*=-1}
// the bite: a short crouch and growl (the tell), a rush, a snap, then away again
function wolfBite(w,d,dt,GS){const fx=P.x-w.x,fz=P.z-w.z;
 if(w.st==='bitewind'){w.spd=lp(w.spd,0,.4);w.crouch=lp(w.crouch,.75,Math.min(1,dt*10));w.jaw=lp(w.jaw,.55,.2);wolfFace(w,P.x,P.z,dt,12);if(w.t>(w.bwT||.38)){w.st='rush';w.t=0}return}
 if(w.st==='rush'){w.crouch=lp(w.crouch,0,.3);w.jaw=lp(w.jaw,.7,.2);wolfMove(w,P.x,P.z,9.5,dt,10);if(d<1.5){w.st='bite';w.t=0;w.bitten=0}else if(w.t>1.3){w.st='retreat';w.t=0;w.retTo=6;w.after='circle';w.cd=rr(.8,1.4)}return}
 if(w.st==='bite'){if(w.t<.16){const p=collide(w.x+Math.sin(w.yaw)*4.5*dt,w.z+Math.cos(w.yaw)*4.5*dt,.42);w.x=p[0];w.z=p[1]}w.spd=lp(w.spd,0,.5);/* the snap lunges forward */w.pitch=lp(w.pitch,-.2,.4);w.jaw=w.t<.12?1:lp(w.jaw,.2,.3);wolfFace(w,P.x,P.z,dt,14);
  if(!w.bitten&&w.t>.08){w.bitten=1;const fa=Math.abs(angd(Math.atan2(fx,fz),w.yaw));if(d<1.75&&fa<1.1){const r=hitPlayer({src:w,dmg:5+(w.alpha?2:0)+(w.boss?3:0),guard:16,dir:[Math.sin(w.yaw),Math.cos(w.yaw)],knock:'flinch',name:'kurt'});sfx.bite();
    if(r==='parry')return;if(r==='block'||r==='guardbreak'){w.kx=-Math.sin(w.yaw)*6;w.kz=-Math.cos(w.yaw)*6}if(r==='iframe'&&!w.dodged){w.dodged=true;GS.onMiss(w)}}else sfx.snap()}
  if(w.t>.32){w.pitch=0;w.st='retreat';w.t=0;w.retTo=rr(5,6.5);w.after='circle';w.cd=rr(1.1,2.2)}return}}
// retreat (back out of reach), watch (from cover), flee (to the den, wounded)
function wolfAway(w,d,dt){const ax=w.x-P.x,az=w.z-P.z,k=Math.hypot(ax,az)||1;
 if(w.st==='retreat'){wolfMove(w,w.x+ax/k*4,w.z+az/k*4,7,dt,9);w.crouch=lp(w.crouch,.2,.2);if(d>w.retTo||w.t>1.8){const nx=w.after||'circle';w.after=null;w.st=nx;w.t=0;if(nx==='watch'){w.cover=wolfCover(w);w.watchT=rr(4,9)}}return}
 if(w.st==='watch'){const c=w.cover||(w.cover=wolfCover(w));if(w.t<.9){w.spd=lp(w.spd,0,.3);wolfFace(w,P.x,P.z,dt,8)}// first it stops and stares
  else{const dx=c[0]-w.x,dz=c[1]-w.z,q=Math.hypot(dx,dz);if(q>1){const sp=Math.min(2.6,q*2),p=collide(w.x+dx/q*sp*dt,w.z+dz/q*sp*dt,.42);w.x=p[0];w.z=p[1];w.spd=lp(w.spd,sp,.2);w.ph+=sp*dt*4.4}else w.spd=lp(w.spd,0,.3);wolfFace(w,P.x,P.z,dt,6)}/* eyes never leave the prey while it backs into cover */w.crouch=lp(w.crouch,.6,.1);w.tail=-.3;
  if(w.t>(w.watchT||6)){const m=wolfMood(w);if(m.aggr>m.fear+.15&&Math.hypot(P.x,P.z)>150&&Math.random()<.6){w.st='stalk';w.t=0}else{w.st='return';w.t=0;w.aware=0;w.calm=4}}return}
 if(w.st==='flee'){const pk=w.pack,tx=pk?pk.den[0]:w.x+ax/k*30,tz=pk?pk.den[1]:w.z+az/k*30,awayDen=Math.hypot(tx-w.x,tz-w.z)<6;wolfMove(w,awayDen?w.x+ax/k*5:tx,awayDen?w.z+az/k*5:tz,7.4,dt,6);w.crouch=lp(w.crouch,.3,.2);w.tail=-.6;
  if(w.t>7||d>38){w.st='return';w.t=0;w.aware=0;w.calm=6}}}
