// ===================== GOBLIN BRAIN (v20 phase 3): a small society — lookouts, alarms, help, morale, surrounding, feints =====================
// Every camp keeps a LOOKOUT at its gate (longer sight, higher eyes); when it spots the hero it blows a horn and the whole
// camp turns out. A goblin that gets hurt badly SHOUTS FOR HELP once. Goblins weigh COURAGE (friends nearby, their own camp)
// against FEAR (wounds, friends who just died, being alone): frightened ones flee and regroup, wounded ones fall back
// behind friends. In a group they SPREAD AROUND the hero (each has its own side) and take turns; alone they guard more.
// Against a hero hiding behind his block they FEINT and go for his side. Archers keep distance, look for an escape line
// when he closes in, and fight with the knife only when cornered.
const GOBDEAD=[];
function assignLookouts(){CAMPSITES.forEach((c,i)=>{const g=GOBS.find(o=>!o.big&&!o.archer&&!o.boss&&o.camp===c&&o.group==='camp'+i);if(!g)return;g.lookout=1;g.eye=2.0;
  const p=collide(c.x+Math.cos(c.gate)*11,c.z+Math.sin(c.gate)*11,.4);g.x=g.hx=p[0];g.z=g.hz=p[1];g.y=hAt(g.x,g.z);g.yaw=c.gate;g.patrol=null})}
function gobCampAlarm(g){const c=g.camp;let n=0;for(const o of GOBS){if(o.dead||o===g||o.so)continue;if((c&&o.camp===c&&Math.hypot(o.x-g.x,o.z-g.z)<80)||Math.hypot(o.x-g.x,o.z-g.z)<30){o.aware=1;o.ls=[P.x,P.z];o.unseen=0;o.alarmT=GT.clock+20;if(!o.hostile()){o.st='chase';o.t=0}n++}}
 sfx.horn();CAM.shake=Math.max(CAM.shake,.15);note('[!] Gözcü boru çaldı — kamp ayağa kalktı ('+n+' goblin)!','red')}
function gobCallHelp(g){g.helped=1;sfx.gobShout();let n=0;for(const o of GOBS){if(o.dead||o===g||o.hostile()||o.so)continue;if(Math.hypot(o.x-g.x,o.z-g.z)<38){o.aware=1;o.ls=[P.x,P.z];o.st='chase';o.t=0;n++}}if(n)note('[!] Goblin yardım çağırdı — '+n+' goblin geliyor!','red');floatText(g.x,(g.y||0)+1.9,g.z,'YARDIM!','')}
// courage vs fear
function gobMood(g){const t=GT.clock;while(GOBDEAD.length&&t-GOBDEAD[0].t>15)GOBDEAD.shift();let friends=0,dead=0;
 for(const o of GOBS)if(o!==g&&!o.dead&&o.hostile()&&Math.hypot(o.x-g.x,o.z-g.z)<12)friends++;for(const k of GOBDEAD)if(Math.hypot(k.x-g.x,k.z-g.z)<20)dead++;
 const home=g.camp&&Math.hypot(g.x-g.camp.x,g.z-g.camp.z)<45;
 return{fear:(1-g.hp/g.max)*1.2+dead*.35+(friends?0:.2)+(P.berserk>0?.2:0),courage:.7+friends*.15+(home?.3:0)+(g.big?1.5:0)+(g.boss?5:0)+(g.elite?.4:0),friends}}
// runs before the normal goblin state machine; returns true when it took the goblin over for this frame
function gobBrain(g,d,dt){
 if(g.st==='horn'&&!g.chief){g.spd=0;agentFace(g,P.x,P.z,dt,8);if(g.t>1.2){gobCampAlarm(g);g.st='chase';g.t=0}return true}
 if(g.st==='flee'){const c=g.camp,ax=g.x-P.x,az=g.z-P.z,k=Math.hypot(ax,az)||1,tx=c&&Math.hypot(c.x-P.x,c.z-P.z)>Math.hypot(g.x-P.x,g.z-P.z)?c.x:g.x+ax/k*8,tz=c&&Math.hypot(c.x-P.x,c.z-P.z)>Math.hypot(g.x-P.x,g.z-P.z)?c.z:g.z+az/k*8;
  agentMove(g,tx,tz,5.8,dt,g.rad,8);if(g.t>(g.fleeT||5)){const m=gobMood(g);if(m.friends>=1&&m.fear<m.courage+.4){g.st='chase';g.t=0;floatText(g.x,(g.y||0)+1.8,g.z,'!','')}else{g.st='return';g.t=0;g.aware=0}}return true}
 if(g.st==='fallback'){const fr=GOBS.filter(o=>o!==g&&!o.dead&&o.hostile()&&Math.hypot(o.x-g.x,o.z-g.z)<15).sort((a,b)=>Math.hypot(a.x-g.x,a.z-g.z)-Math.hypot(b.x-g.x,b.z-g.z))[0];
  if(fr){const ax=fr.x-P.x,az=fr.z-P.z,k=Math.hypot(ax,az)||1;agentMove(g,fr.x+ax/k*3,fr.z+az/k*3,5,dt,g.rad,8)}else{const ax=g.x-P.x,az=g.z-P.z,k=Math.hypot(ax,az)||1;agentMove(g,g.x+ax/k*4,g.z+az/k*4,5,dt,g.rad,8)}
  agentFace(g,P.x,P.z,dt,4);if(g.t>2.2){g.st='chase';g.t=0;g.cd=Math.min(g.cd,.4)}return true}
 // morale check while fighting
 if(g.hostile()&&!g.big&&!g.boss&&!g.so){g.mT=(g.mT||0)-dt;if(g.mT<=0){g.mT=.5;const m=gobMood(g);
  if(m.fear>m.courage+.25&&g.st!=='windup'&&g.st!=='strike'){g.st='flee';g.t=0;g.fleeT=rr(3.5,6);sfx.gobShout();floatText(g.x,(g.y||0)+1.8,g.z,'KAÇ!','');return true}
  if(g.hp<g.max*.4&&m.friends>=1&&!g.fellBack&&g.st==='chase'){g.fellBack=1;g.st='fallback';g.t=0;return true}}}
 return false}
// where a goblin wants to stand in a group fight: its own side of the hero (spread out), never all in one line
function gobSlotPoint(g,r){const grp=GOBS.filter(o=>!o.dead&&!o.big&&!o.archer&&o.hostile()&&Math.hypot(o.x-P.x,o.z-P.z)<10);if(grp.length<2||!grp.includes(g))return null;
 // evenly spaced sides, in a stable order, starting from where the first one already stands
 const i=grp.indexOf(g),base=Math.atan2(grp[0].x-P.x,grp[0].z-P.z);g.slotA=base+i*6.283/grp.length;if((g.flankT||0)>GT.clock)return[P.x+Math.sin(g.flankA)*r,P.z+Math.cos(g.flankA)*r];
 return[P.x+Math.sin(g.slotA)*r,P.z+Math.cos(g.slotA)*r]}
// against a hero waiting behind his block: break off the swing and go for his side
function gobFeint(g){if(g.big||g.peril||g.feinted||P.st!=='block'||g.t<.22)return false;if(Math.random()>.55){g.feinted=1;return false}
 g.feinted=1;g.st='circle';g.t=0;g.dur=.9;g.flankT=GT.clock+1.6;g.flankA=P.yaw+(Math.random()<.5?1.9:-1.9);floatText(g.x,(g.y||0)+1.7,g.z,'ALDATMA','');sfx.gobShout();return true}
// archer: an escape line away from the hero (8 headings, the open one that gains most distance); null when cornered
function archerEscape(g){let best=null,bv=-1;const cur=Math.hypot(g.x-P.x,g.z-P.z);for(let k=0;k<8;k++){const a=k/8*6.283,tx=g.x+Math.sin(a)*4,tz=g.z+Math.cos(a)*4,p=collide(tx,tz,g.rad),moved=Math.hypot(p[0]-g.x,p[1]-g.z);
  if(moved<2.5||depthAt(p[0],p[1])>.4)continue;const gain=Math.hypot(p[0]-P.x,p[1]-P.z)-cur;if(gain>bv){bv=gain;best=p}}return bv>1?best:null}
