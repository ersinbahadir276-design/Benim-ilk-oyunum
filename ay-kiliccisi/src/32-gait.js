// ===================== hero gait: planted feet, leg IK, pelvis and torso motion =====================
// Instead of swinging the thighs with a sine (which made the planted foot skate over the ground), each foot follows
// a path in the hips' frame: in stance it slides backwards at exactly the body's speed (so in the world it stays put),
// in swing it lifts and travels forwards. A two-bone sagittal IK turns that path into thigh/knee angles.
// The phase P.ph advances by distance (updatePlayer), 2*PI per gait cycle of heroGaitParams().cycle metres.
// b: 0 = slow walk .. 1 = jog; sprint has its own set. Numbers are fractions of the leg length L (hip -> ankle).
function heroGaitParams(mv,sprint){const b=sst(.3,.85,mv);
 if(sprint)return{b:1,h0:.9,duty:.28,half:.41,lift:.36,bob:.035,lean:.3,arm:.85,twist:.16,sway:.008};
 const half=lp(.25,.36,b),duty=lp(.6,.36,b);
 return{b,h0:lp(.96,.92,b),duty,half,lift:lp(.12,.25,b),bob:lp(.006,.025,b),lean:lp(.04,.13,b),arm:lp(.35,.6,b),twist:lp(.07,.11,b),sway:lp(.022,.012,b)}}
// metres of travel per gait cycle (two steps)
function heroGaitCycle(mv,sprint){const g=heroGaitParams(mv,sprint);return 2*g.half*(SK.L1+SK.L2)/g.duty}
// one leg: phase u in [0,1), u=0 at touchdown. Returns hip-frame ankle target {z,y} (y up, z forward), foot pitch, forwardness f in [-1,1]
function heroGaitFoot(u,g,L){const D=g.duty,H=g.half*L;let z,y=0,pitch=0;
 if(u<D){const s=u/D;z=H-2*H*s;pitch=lp(-.22,0,sst(0,.18,s))+.55*sst(.72,1,s);y=.07*L*sst(.72,1,s)*sst(.72,1,s)}
 else{const w=(u-D)/(1-D),e=w*w*w*(w*(w*6-15)+10);z=-H+2*H*e;y=g.lift*L*Math.sin(PI*Math.pow(w,.75))+.07*L*(1-sst(0,.25,w));pitch=lp(.55,-.22,sst(.15,.9,w))}
 return{z,y,pitch,f:z/H}}
// sagittal two-bone IK: hip at origin, ankle target (z forward, -depth). Returns world-sagittal thigh angle (forward +) and knee flex.
function heroLegIK(z,depth,L1,L2){const d=cl(Math.hypot(z,depth),.05,(L1+L2)*.999),a=Math.atan2(z,depth),
 b=Math.acos(cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1)),k=PI-Math.acos(cl((L1*L1+L2*L2-d*d)/(2*L1*L2),-1,1));return[a+b,k]}
// fills q with the locomotion pose; mv = speed/3.4 clamped, t = time. Writes the exact leg channels to q.__gait.
function heroGaitPose(q,mv,sprint,t){const g=heroGaitParams(mv,sprint),L1=SK.L1,L2=SK.L2,L=L1+L2,ph=P.ph/(2*PI),uL=ph-Math.floor(ph),uR=(uL+.5)%1;
 const lean=g.lean+cl(P.accS||0,-4,4)*.025;q.pel=lean*.45;q.spX=lean*.55;
 const fl=heroGaitFoot(uL,g,L),fr=heroGaitFoot(uR,g,L),zc=.03*L;
 // stance compression (run) / vault (walk): the stance leg is a bit shorter at mid-stance when jogging
 const stS=(u)=>u<g.duty?Math.sin(PI*u/g.duty):0,h=g.h0*L-g.bob*L*Math.max(stS(uL),stS(uR))*(g.b*2-1);
 const[lt,lk]=heroLegIK(fl.z+zc,h-fl.y,L1,L2),[rt,rk]=heroLegIK(fr.z+zc,h-fr.y,L1,L2);
 q.hipFix=1;q.hipH=h;q.LthX=-lt-q.pel;q.Lkn=lk;q.RthX=-rt-q.pel;q.Rkn=rk;q.LftX=fl.pitch;q.RftX=fr.pitch;
 // pelvis: turns with the forward leg, drops on the swing side, weight moves over the stance foot
 const stanceL=uL<g.duty?1:0,stanceR=uR<g.duty?1:0,ws=stanceL-stanceR;
 q.pelY=-g.twist*fl.f*.5;q.pelZ=.045*ws*(1-g.b*.4);q.hipX=g.sway*L*Math.sin(2*PI*(uL-.25*g.duty))*(sprint?.5:1);
 // torso counter-rotates, arms swing against the legs (sword arm less), head stays level
 q.spY=-q.pelY;q.chY=g.twist*fl.f*.7;q.LaX=.05+g.arm*.75*fl.f;q.RaX=-.3-g.arm*.4*fr.f;q.Lel=lp(.35,1.2,sprint?1:g.b*.6)+.15*Math.max(0,-fr.f);q.Rel=sprint?.9:lp(.5,.6,g.b);q.LaZ=lp(1.22,1.1,g.b);
 q.hdX=-(q.pel+q.spX)*.55;q.chX=.02*Math.sin(t*2.2);
 q.__gait=1}
// idle: weight drifts slowly from foot to foot, the unloaded knee softens, chest breathes, head looks around
function heroIdlePose(q,t){const w=Math.sin(t*.42+.6*Math.sin(t*.13)),br=Math.sin(t*1.5);
 q.hipX=.022*w;q.pelZ=.035*w;q.Lkn=.08+.1*Math.max(0,-w);q.Rkn=.08+.1*Math.max(0,w);q.LthX=-.04*Math.max(0,-w);q.RthX=-.04*Math.max(0,w);q.LthZ=.04+.03*w;q.RthZ=-.04+.03*w;
 q.chX=.025*br;q.spX=.03;q.LaZ=1.2-.02*br;q.RaZ=1.1-.02*br;q.LaX=.06+.02*br;q.Lel=.3;q.hdY=Math.sin(t*.5)*.12+.1*Math.sin(t*.17);q.hdX=.04*Math.sin(t*.31)}
// turn banking + start/stop lean, measured once per pose update
function heroGaitTrack(dt){if(!(dt>0))return;const yr=angd(P.yaw,P._py===undefined?P.yaw:P._py)/dt;P._py=P.yaw;P.yawRate=lp(P.yawRate||0,cl(yr,-12,12),Math.min(1,dt*10));
 const sp=P.spd||0,a=(sp-(P._ps===undefined?sp:P._ps))/dt;P._ps=sp;P.accS=lp(P.accS||0,cl(a,-20,20),Math.min(1,dt*6))}
