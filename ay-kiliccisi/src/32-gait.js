// ===================== hero locomotion: keyframed gait cycles, idle layer, lean, terrain foot IK =====================
// Each gait is a hand-keyed cycle for the LEFT leg over phase u (0 = left heel strike); the right leg plays the same
// keys half a cycle later. Channels: th = thigh pitch (negative = forward), kn = knee bend, ft = foot pitch on top of the
// automatic flat-foot (positive = toe down). Keys are sampled with a periodic Catmull-Rom spline and the three gaits are
// blended by speed, so walk → jog → sprint changes continuously instead of scaling one sine wave.
const GAIT={
 walk:{u:[0,.1,.3,.5,.6,.75,.88],th:[-.42,-.36,-.08,.28,.18,-.28,-.46],kn:[.04,.28,.1,.16,.62,1.05,.2],ft:[-.28,0,0,.28,.5,.05,-.18],
  lean:.04,pel:.02,twist:.1,roll:.05,arm:.32,el:[.3,.32],rarm:.16},
 run:{u:[0,.12,.32,.45,.62,.8,.92],th:[-.42,-.16,.38,.42,0,-.72,-.6],kn:[.32,.72,.38,1.15,1.85,1.35,.55],ft:[-.12,.05,.55,.55,.25,-.05,-.2],
  lean:.13,pel:.07,twist:.13,roll:.04,arm:.5,el:[.95,.35],rarm:.24},
 sprint:{u:[0,.12,.3,.44,.62,.8,.92],th:[-.6,-.2,.5,.55,0,-1.0,-.85],kn:[.35,.85,.45,1.5,2.2,1.6,.65],ft:[-.1,.08,.7,.65,.3,-.05,-.2],
  lean:.26,pel:.13,twist:.17,roll:.035,arm:.85,el:[1.2,.45],rarm:.3}};
// periodic Catmull-Rom over non-uniform keys
function gaitKey(G,ch,u){const U=G.u,V=G[ch],n=U.length;u-=Math.floor(u);let i=n-1;for(let k=0;k<n-1;k++)if(u<U[k+1]){i=k;break}
 const u0=U[i],u1=i+1<n?U[i+1]:1,t=(u-u0)/(u1-u0),p0=V[(i-1+n)%n],p1=V[i],p2=V[(i+1)%n],p3=V[(i+2)%n],t2=t*t,t3=t2*t;
 return .5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3)}
// stride length (m per full cycle) grows with speed: ~1.45 m walking, ~2.6 m jogging, ~4 m sprinting
function strideLen(spd){return spd<1.6?1.45:spd<3.7?lp(1.45,2.6,(spd-1.6)/2.1):lp(2.6,4.0,cl((spd-3.7)/2.9,0,1))}
// gait weights for a speed: [walk, run, sprint] plus an overall amplitude that fades the cycle in from standing
function gaitMix(spd,sprint){const r=sst(2.0,3.2,spd),s=sprint?sst(4.6,6.0,spd):0;return{w:[(1-r)*(1-s),r*(1-s),s],amp:sst(.05,1.0,spd)}}
function gaitSample(mix,ch,u){let v=0;const k=['walk','run','sprint'];for(let i=0;i<3;i++)if(mix.w[i]>1e-4)v+=mix.w[i]*(typeof GAIT[k[i]][ch]==='number'?GAIT[k[i]][ch]:gaitKey(GAIT[k[i]],ch,u));return v}
// smoothed turn and acceleration signals (body leans into turns and against speed changes)
const GL={yaw:null,yr:0,spd:0,acc:0,fik:[0,0]};
function gaitSignals(dt){if(!(dt>0))return;if(GL.yaw===null)GL.yaw=P.yaw;let d=P.yaw-GL.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));GL.yaw=P.yaw;
 const k=Math.min(1,dt*8);GL.yr+=(cl(d/dt,-8,8)-GL.yr)*k;GL.acc+=(cl((P.spd-GL.spd)/dt,-30,30)-GL.acc)*Math.min(1,dt*5);GL.spd=P.spd}
// full locomotion pose for the 'move' state (not crouching): writes into q
function heroGait(q,t){const qi=Object.assign({},q);heroIdle(qi,t);const spd=P.spd,mix=gaitMix(spd,P.sprinting),a=mix.amp,u=P.ph/(2*PI);
 const legL=ch=>gaitSample(mix,ch,u)*a,legR=ch=>gaitSample(mix,ch,u+.5)*a;
 q.LthX=legL('th');q.Lkn=.04+legL('kn');q.LftX=legL('ft');q.RthX=legR('th');q.Rkn=.04+legR('kn');q.RftX=legR('ft');
 const lean=gaitSample(mix,'lean'),tw=gaitSample(mix,'twist'),roll=gaitSample(mix,'roll'),arm=gaitSample(mix,'arm'),rarm=gaitSample(mix,'rarm');
 const el0=mix.w[0]*GAIT.walk.el[0]+mix.w[1]*GAIT.run.el[0]+mix.w[2]*GAIT.sprint.el[0],el1=mix.w[0]*GAIT.walk.el[1]+mix.w[1]*GAIT.run.el[1]+mix.w[2]*GAIT.sprint.el[1];
 const c=Math.cos(2*PI*u),c2=Math.cos(2*PI*(u-.05)),s1=Math.sin(2*PI*u);
 // pelvis: twists the swinging hip forward, drops on the swing side during single support; shoulders counter-rotate
 q.pelY=-tw*c*a;q.pelZ=roll*s1*a;q.chY=tw*1.15*c*a;q.spY=tw*.35*c*a;
 // arms swing against the same-side leg with a small lag; the elbow folds more on the forward swing
 const sw=c2*a;q.LaX=.05+arm*sw;q.Lel=lp(.25,el0,a)+el1*(1-c2)*.5*a;q.LaZ=1.22-.08*a;
 q.RaX=-.3-rarm*sw;q.Rel=lp(.55,Math.max(.55,el0*.9),a)+el1*.6*(1+c2)*.5*a;
 // trunk: lean grows with speed, pitches against acceleration, rolls into turns (centripetal), head stays level
 const accL=cl(GL.acc*.018,-.14,.14)*sst(.3,2,spd),turn=-cl(GL.yr*spd/9.8*.55,-.22,.22);
 q.spX=lean*a+accL;q.pel=gaitSample(mix,'pel')*a+accL*.4;q.spZ=turn*.6;q.pelZ+=turn*.35;
 q.hdX=-(q.spX+q.pel)*.55;q.hdY=-q.chY*.5;q.chX=.015*Math.sin(2*PI*u*2)*a;
 if(a<1)for(const n in qi)q[n]=lp(qi[n],q[n],a)}
// standing: breathing, slow weight shift between the legs, a glance around
function heroIdle(q,t){const br=Math.sin(t*1.6),ws=Math.sin(t*.37)*.65+Math.sin(t*.23+1)*.35;
 q.chX=br*.022;q.LaZ=1.22-br*.012;q.RaZ=1.12-br*.012;q.LaX=.05+br*.015;
 q.pelZ=ws*.04;q.LthZ=.04-ws*.035;q.RthZ=-.04-ws*.035;q.Lkn=.05+Math.max(0,-ws)*.14;q.Rkn=.05+Math.max(0,ws)*.14;q.LthX=-Math.max(0,-ws)*.06;q.RthX=-Math.max(0,ws)*.06;
 q.spZ=-ws*.045;q.hdY=Math.sin(t*.5)*.12+Math.sin(t*.13)*.08;q.hdX=Math.sin(t*.29)*.04}
// ---------- terrain foot IK: lower the hips to the downhill foot, shorten the uphill leg so neither floats nor sinks
function legExt(pel,th,kn){return SK.L1*Math.cos(pel+th)+SK.L2*Math.cos(pel+th+kn)}
function footIK(q,dt){const on=(P.st==='move'||P.st==='land')&&!P.air&&!(P.rag&&P.rag.ang>.01);let dL=0,dR=0;
 if(on&&typeof PM!=='undefined'&&PM){for(const[i,b]of[[0,HB.leftFoot],[1,HB.rightFoot]]){const w=mpt(PM,SK.GP[b]),d=cl(hAt(w[0],w[2])-P.y,-.3,.3);i?dR=d:dL=d}}
 const k=dt>0?Math.min(1,dt*12):1;GL.fik[0]+=(dL-GL.fik[0])*k;GL.fik[1]+=(dR-GL.fik[1])*k;dL=GL.fik[0];dR=GL.fik[1];
 if(Math.abs(dL)<.004&&Math.abs(dR)<.004)return q;
 const o=Object.assign({},q),drop=Math.min(dL,dR),e0=[legExt(q.pel,q.LthX,q.Lkn),legExt(q.pel,q.RthX,q.Rkn)],mx0=Math.max(e0[0],e0[1]);
 const solve=(th,kn,target)=>{let lo=0,hi=1.1;for(let it=0;it<14;it++){const m=(lo+hi)/2;if(legExt(q.pel,th-m,kn+2*m)>target)lo=m;else hi=m}return(lo+hi)/2};
 const r=[dL-drop,dR-drop];
 if(r[0]>.003){const m=solve(q.LthX,q.Lkn,e0[0]-r[0]);o.LthX=q.LthX-m;o.Lkn=q.Lkn+2*m}
 if(r[1]>.003){const m=solve(q.RthX,q.Rkn,e0[1]-r[1]);o.RthX=q.RthX-m;o.Rkn=q.Rkn+2*m}
 const mx1=Math.max(legExt(q.pel,o.LthX,o.Lkn),legExt(q.pel,o.RthX,o.Rkn));o.hipY=q.hipY+drop+(mx0-mx1);return o}
