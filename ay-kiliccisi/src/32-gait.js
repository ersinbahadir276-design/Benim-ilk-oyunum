// ===================== hero locomotion: keyframed gait cycles (walk / run / sprint) =====================
// Replaces the old single-sine leg swing. Each leg follows hand-authored keyframe curves over its own phase
// (0 = heel strike, ~.5 = toe-off for a walk, earlier for a run), sampled with periodic Catmull-Rom splines.
// The right leg runs half a cycle behind the left. On top of the legs: ankle roll (heel strike -> toe-off),
// pelvis twist and drop, sideways weight shift over the stance foot, chest counter-rotation, pendulum arms
// with a small lag, a stabilised head, a flight lift for running, lean into acceleration and into turns.
// The cycles blend by speed, so walk -> run -> sprint has no pops. Angles in radians; thigh: negative = forward,
// knee: positive = bend, foot: positive = toes down (applied on top of applyPose's keep-the-foot-flat term).
const HGAIT={
 walk:{th:[[0,-.42],[.12,-.36],[.3,-.04],[.5,.3],[.62,.14],[.8,-.3],[.94,-.45]],
       kn:[[0,.05],[.12,.3],[.3,.12],[.5,.24],[.64,.95],[.8,.72],[.94,.08]],
       ft:[[0,-.18],[.1,.06],[.3,0],[.5,.38],[.62,.22],[.8,-.04],[.94,-.14]],
       arm:.7,armR:.4,el:.35,elR:.55,twist:.22,drop:.05,sway:.028,chY:.12,spX:.05,pel:.02,fly:0},
 run:{th:[[0,-.55],[.12,-.32],[.28,.25],[.4,.48],[.58,.12],[.74,-.62],[.9,-.74]],
      kn:[[0,.25],[.12,.62],[.28,.38],[.4,.32],[.58,1.6],[.74,1.45],[.9,.42]],
      ft:[[0,-.1],[.12,.08],[.28,.2],[.4,.5],[.58,.25],[.74,-.05],[.9,-.12]],
      arm:.8,armR:.45,el:.95,elR:.75,twist:.18,drop:.04,sway:.018,chY:.16,spX:.14,pel:.07,fly:.035},
 sprint:{th:[[0,-.72],[.1,-.42],[.25,.38],[.37,.66],[.54,.05],[.72,-.88],[.88,-1.02]],
         kn:[[0,.3],[.1,.66],[.25,.36],[.37,.36],[.54,2.0],[.72,1.8],[.88,.5]],
         ft:[[0,-.05],[.1,.1],[.25,.3],[.37,.6],[.54,.3],[.72,-.05],[.88,-.1]],
         arm:.95,armR:.5,el:1.2,elR:.9,twist:.14,drop:.03,sway:.012,chY:.18,spX:.24,pel:.12,fly:.06}};
// periodic Catmull-Rom through [t,v] keys (t in [0,1), sorted); u wraps
function hgKey(K,u){u-=Math.floor(u);const n=K.length;let i=n-1;for(let k=0;k<n;k++)if(K[k][0]>u){i=k-1;break}if(i<0)i=n-1;
 const at=j=>K[(j%n+n)%n],t0=K[i][0],t1=i+1<n?K[i+1][0]:K[0][0]+1,uu=u<t0?u+1:u,f=(uu-t0)/(t1-t0),
  p0=at(i-1)[1],p1=at(i)[1],p2=at(i+1)[1],p3=at(i+2)[1],f2=f*f,f3=f2*f;
 return .5*(2*p1+(-p0+p2)*f+(2*p0-5*p1+4*p2-p3)*f2+(-p0+3*p1-3*p2+p3)*f3)}
// blend weights of the three cycles from ground speed (m/s)
function hgWeights(spd,sprint){const r=sst(1.7,3.0,spd),s=sprint?sst(3.8,5.4,spd):0;return{walk:(1-r)*(1-s),run:r*(1-s),sprint:s}}
// per-frame motion state: smoothed yaw rate and acceleration (for leaning)
function hgTrack(dt){const g=P.gait||(P.gait={ly:P.yaw,ls:0,yr:0,ac:0});if(dt<=0)return g;
 const yr=angd(P.yaw,g.ly)/dt,ac=(P.spd-g.ls)/dt,k=Math.min(1,dt*6);g.yr+=(cl(yr,-8,8)-g.yr)*k;g.ac+=(cl(ac,-25,25)-g.ac)*k;g.ly=P.yaw;g.ls=P.spd;return g}
// write the moving pose into q. mv: 0..1 speed fraction (fades the cycle in from a stand), u: cycle phase 0..1
function heroGait(q,u,spd,mv,sprint,g){const W=hgWeights(spd,sprint),fade=sst(.05,.35,mv),two=2*PI;
 const mix=(f)=>W.walk*f(HGAIT.walk)+W.run*f(HGAIT.run)+W.sprint*f(HGAIT.sprint);
 const uL=u,uR=u+.5;
 q.LthX=fade*mix(c=>hgKey(c.th,uL));q.RthX=fade*mix(c=>hgKey(c.th,uR));
 q.Lkn=.06+fade*(mix(c=>hgKey(c.kn,uL))-.06);q.Rkn=.06+fade*(mix(c=>hgKey(c.kn,uR))-.06);
 q.Lft=fade*mix(c=>hgKey(c.ft,uL));q.Rft=fade*mix(c=>hgKey(c.ft,uR));
 const P_=k=>mix(c=>c[k]);
 // pelvis: swing-side hip leads (twist), swing side drops a little, body shifts over the stance foot
 const thd=(q.LthX-q.RthX)*.5;q.pelY=P_('twist')*thd;q.spY=-q.pelY*.7;
 const st=Math.sin(two*u);q.pelZ=fade*P_('drop')*st;q.spZ=-q.pelZ*1.1;q.hipX=fade*P_('sway')*st;
 q.pel=fade*P_('pel');q.spX=fade*P_('spX');q.chY=-P_('chY')*thd/(.3+.4*W.run+.55*W.sprint)*fade;
 // flight phase (run/sprint): both feet off the ground just after each toe-off
 const fl=Math.max(0,Math.sin(two*(2*u-.3)));q.hipY=fade*P_('fly')*fl*fl;
 // arms: pendulum opposite to the same-side leg, lagging a little; the sword arm swings less
 const lag=.05,aL=mix(c=>hgKey(c.th,uL-lag)),aR=mix(c=>hgKey(c.th,uR-lag));
 q.LaX=.05-fade*P_('arm')*aL;q.RaX=-.3-fade*P_('armR')*aR;q.Lel=.25+fade*(P_('el')-.25)+fade*.18*Math.max(0,-aR);q.Rel=.55+fade*(P_('elR')-.55);
 q.LaZ=1.22-.12*fade*(W.run+W.sprint);
 // lean: forward into acceleration, sideways into turns (more at speed); head stays level and looks ahead
 const lean=cl(g.ac*.025,-.12,.2),bank=cl(-g.yr*spd*.03,-.24,.24);q.spX+=lean;q.spZ+=bank;q.hipX-=bank*.06;
 q.hdX=-(q.spX+q.pel)*.55;q.hdY=-q.chY*.6-q.pelY*.3;q.hdZ=-q.spZ*.6}
// standing idle: breathing, slow weight shift (contrapposto), a relaxed knee, looking around
function heroIdle(q,t){const br=Math.sin(t*1.8),ws=Math.sin(t*.33)+.35*Math.sin(t*.91);
 q.chX=br*.022;q.spX=.02+br*.008;q.LaZ=1.22-br*.02;q.RaZ=1.12-br*.015;q.LaX=.05+Math.sin(t*1.6+.5)*.02;q.Lel=.28+br*.03;
 q.hipX=.022*ws;q.pelZ=.028*ws;q.spZ=-q.pelZ*.8;q.LthZ=.07;q.RthZ=-.07;q.Lkn=.06+.14*Math.max(0,-ws);q.Rkn=.06+.14*Math.max(0,ws);
 q.Lft=-.02;q.Rft=-.02;q.hdY=Math.sin(t*.5)*.14+Math.sin(t*1.3)*.03;q.hdX=Math.sin(t*.27)*.05-.02}
