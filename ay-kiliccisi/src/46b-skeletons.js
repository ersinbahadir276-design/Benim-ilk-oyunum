// ===================== skeleton warriors: the dead of the old ruins rise at night =====================
// They reuse the goblin brain (perception, chase, circle, windup/strike, stagger) and add their own life cycle:
// buried by day -> rise from the earth at night when the hero comes near -> fight -> fall apart.
// A plain blow only scatters the bones: after a few seconds they pull themselves together once more (half health).
// A heavy blow, a jump attack, a skill, an execution or an assassination ends them for good.
const SKEL_RISE=2.2,SKEL_REFORM=1.4,SKEL_HP=70,SKEL_REST=300;
const SKEL_FINISH={heavy:1,jumpatk:1,exec:1,assn:1,stab:1,fire:1,burst:1,skill:1};
// per ruin: 4 sword skeletons around the centre + 2 skeleton archers on the broken outer walls
const SKEL_PER_RUIN=6,SKEL_ARCHERS=2;
function spawnSkeletons(){RUINS.forEach((r,i)=>{for(let k=0;k<SKEL_PER_RUIN;k++){const arch=k>=SKEL_PER_RUIN-SKEL_ARCHERS,a=k/SKEL_PER_RUIN*2*PI+i*1.3,rd=arch?rr(14,18):k?rr(6,13):2,p=collide(r[0]+Math.cos(a)*rd,r[1]+Math.sin(a)*rd,.4),g=mkGob(p[0],p[1],false,'ruin'+i,null);
  Object.assign(g,{skel:1,hp:SKEL_HP,max:SKEL_HP,rad:.36,eye:1.7,buried:1,dead:1,st:'dead',deadT:999,restUntil:0,reformed:0,reformPend:0});if(arch){g.archer=1;g.side=k%2?1:-1}g.yaw=rnd()*6.28}})}
const isSkel=(f)=>!!(f&&f.skel);
const skelName=(g)=>g.archer?'İskelet okçu':'İskelet savaşçı';
// a dry clatter of bones (rise, spotting the hero, scattering, nocking a soul arrow)
function skelRattle(g,n){if(!sfx.bones)return;if(g&&P&&Math.hypot(g.x-P.x,g.z-P.z)>40)return;sfx.bones(n||4)}
// how far below the ground a rising skeleton is drawn
function skelSink(g){return g.skel&&g.st==='rise'?(1-sst(0,.75,g.t/SKEL_RISE))*1.5:0}
function skelDust(g,n){spawnSparks(g.x,(g.y||hAt(g.x,g.z))+.3,g.z,n,[.5,.9,1.3],3)}
// returns true when the skeleton's own life cycle handled this frame (the goblin AI is skipped)
function skelTick(g,dt,d){
 if(g.buried){g.dead=1;g.st='dead';g.deadT=999;g.y=hAt(g.x,g.z);
  if(GT.night&&GT.clock>=g.restUntil&&P.alive&&d<75&&d>5){
   Object.assign(g,{buried:0,dead:0,hp:g.max,st:'rise',t:0,deadT:0,reformed:0,reformPend:0,aware:d<20?1:.4,x:g.hx,z:g.hz,ls:[P.x,P.z],pos:0,held:null,kx:0,kz:0,spd:0});g.y=hAt(g.x,g.z);
   if(d<45){skelDust(g,14);skelRattle(g,6);if(!skelTick.warned||GT.clock-skelTick.warned>60){skelTick.warned=GT.clock;note('[!] Harabelerde ölüler topraktan kalkıyor…','red')}}}
  return true}
 if(g.st==='rise'){g.spd=0;agentFace(g,P.x,P.z,dt,2);g.y=hAt(g.x,g.z);if(g.t>=SKEL_RISE){g.st=g.aware>=1?'chase':'idle';g.t=0;if(g.aware>=1)alertGroup(g,P,24,GOBS)}return true}
 if(g.dead){g.deadT+=dt;g.y=hAt(g.x,g.z);
  if(g.reformPend&&g.deadT>3.2){Object.assign(g,{dead:0,reformPend:0,reformed:1,hp:Math.max(1,Math.round(g.max*.5)),st:'reform',t:0,aware:1,ls:[P.x,P.z],pos:0});skelDust(g,12);skelRattle(g,5);if(d<30)note('[!] '+skelName(g)+': kemikler yeniden birleşti!','red')}
  else if(!g.reformPend&&g.deadT>30&&d>40){g.buried=1;g.restUntil=GT.clock+SKEL_REST}
  return true}
 if(g.st==='reform'){g.spd=0;g.y=hAt(g.x,g.z);if(g.t>=SKEL_REFORM){g.st='chase';g.t=0}return true}
 if(!GT.night&&!g.hostile()&&d>20){g.buried=1;g.dead=1;g.st='dead';g.deadT=999;return true}// dawn: back into the earth
 return false}
// a killing blow that is not a finisher only scatters the bones (once)
function skelCollapse(g,kind){if(g.reformed||SKEL_FINISH[kind])return false;
 Object.assign(g,{hp:0,dead:1,st:'dead',t:0,deadT:0,reformPend:1,held:null});skelDust(g,10);sfx.thud&&sfx.thud();skelRattle(g,7);
 if(!SYS.skelHint){SYS.skelHint=1;note('[Sistem] Kemikler dağıldı ama ruh ateşi sönmedi. İskeleti ağır saldırı, zıplama saldırısı ya da İNFAZ ile bitir.','gold')}
 return true}
function skelKilled(g){SYS.skelKills=(SYS.skelKills||0)+1;if(g.archer)SYS.skelArcherKills=(SYS.skelArcherKills||0)+1;const xp=g.archer?70:60;SYS.gold=(SYS.gold||0)+8;addXP(xp,P);note('[Sistem] '+skelName(g)+' huzura kavuştu · +'+xp+' XP · +8 altın');skelDust(g,18);save(P)}
