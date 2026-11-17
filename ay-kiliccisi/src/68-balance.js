// ===================== DIFFICULTY + BALANCE (v20 phase 5): attack director, habits, elites, level fairness =====================
// ATTACK DIRECTOR: across every enemy type, at most two melee attacks are being thrown at the hero at once (a big one
// counts double) and two attacks never start within 0.35 s of each other — a group fight has a rhythm you can read.
// HABITS: the last ~20 s of what the hero does (light/heavy swings, blocks, parries, dashes, arrows) decay over time;
// enemies answer the habit: against light-button spam they deflect more, against a turtle more 危 and delayed swings,
// against dash spam they hold the swing a beat longer, against an archer they close in instead of circling.
// ELITES: each goblin camp has a CHAMPION — three-hit chains with a delayed beat, 危 lunges, it deflects light hits
// from the front and answers at once, only a heavy blow (or a parry) opens its guard.
// LEVELS: enemy damage and the hero's damage both lean on the level gap (fair both ways, capped).
const DIR={last:-9,act:[]};
function attackActive(f){if(isWolf(f))return/^(windup|pounce|pin|bitewind|rush|bite)$/.test(f.st);return f.st==='windup'||f.st==='strike'}
function attackOK(f){const t=GT.clock;if(t-DIR.last<.35)return false;let w=0;for(const o of foes()){if(o===f||o.dead||!attackActive(o)||(o.archer&&!o.cornered))continue;if(Math.hypot(o.x-P.x,o.z-P.z)>9)continue;w+=o.big||o.boss?2:1}
 if(w+(f.big||f.boss?2:1)>2&&w>0)return false;DIR.last=t;return true}
// ---------- habits
const HAB={light:0,heavy:0,block:0,parry:0,dodge:0,bow:0,t:0};
function habitAdd(k){habitDecay();HAB[k]=(HAB[k]||0)+1}
function habitDecay(){const t=GT.clock,dt=t-HAB.t;if(dt<=0)return;const k=Math.pow(.5,dt/20);for(const n of['light','heavy','block','parry','dodge','bow'])HAB[n]*=k;HAB.t=t}
function habits(){habitDecay();return{spam:HAB.light>6&&HAB.light>HAB.heavy*3,turtle:HAB.block>5,dodger:HAB.dodge>5,parrier:HAB.parry>3,archer:HAB.bow>3}}
// ---------- elites: one champion per goblin camp
function assignChampions(){CAMPSITES.forEach((c,i)=>{const g=GOBS.find(o=>!o.big&&!o.archer&&!o.boss&&!o.lookout&&o.camp===c&&o.group==='camp'+i);if(!g)return;
  g.elite=1;g.champ=1;g.sc=1.15;g.title='KAMP ŞAMPİYONU';scaleFoe(g,(g.lv||regionLevel(g.hx,g.hz))+2,230);g.pk='elite';if(g.R)g.R.ob.col=[1.25,.78,.72]})}
POSMAX.elite=125;
// deflect: a champion (or any goblin against light-button spam) turns a light hit from the front and answers
function gobDeflect(g,kind){if(g.big||g.dead)return false;const light=kind&&kind.startsWith&&kind.startsWith('light');if(!light)return false;
 if(/^(windup|strike|stagger|hurt|choked|pinned|escape|flee)$/.test(g.st))return false;if(Math.abs(angd(Math.atan2(P.x-g.x,P.z-g.z),g.yaw))>1.1)return false;
 const H=habits(),ch=(g.elite?.42:.0)+(H.spam?(g.elite?.2:.18):0);if(Math.random()>=ch)return false;
 g.blockedAt=GT.clock;g.kx=g.kz=0;g.yaw=Math.atan2(P.x-g.x,P.z-g.z);if(Math.random()<(g.elite?.55:.3)){g.st='windup';g.t=.12;g.hitDone=false;g.peril=0;g.cn=g.elite?1:0;g.delay=0;floatText(g.x,(g.y||0)+1.9,g.z,'SAPTIRDI','')}return true}
// how a goblin's next swing is shaped by elite rank and the hero's habits
function gobSwingStyle(g){const H=habits();let peril=.18,combo=.4,delay=0;
 if(g.elite){peril=.3;combo=.6;delay=.45}if(H.turtle){peril+=.2;delay+=.25}if(H.parrier){peril+=.12;combo+=.15}if(H.dodger)delay+=.4;if((g.adapt||0)>GT.clock){peril=Math.max(peril,.5);combo=Math.max(combo,.75);delay=Math.max(delay,.7)}
 return{peril:Math.min(.7,peril),combo:Math.min(.9,combo),delay:Math.min(.9,delay),three:g.elite&&Math.random()<.55}}
// ---------- level fairness
const lvGapIn=src=>src&&src.lv?cl(1+.05*(src.lv-SYS.lv),.75,1.5):1;// enemy damage to the hero
const lvGapOut=f=>f&&f.lv?cl(1+.035*(SYS.lv-f.lv),.75,1.3):1;// the hero's damage to an enemy
