// ===================== Kael: terrain foot IK =====================
// The procedural poses assume flat ground. On slopes and bumps this pass keeps both feet on the terrain:
// it samples the ground under each foot, lowers the pelvis to the lower foot, re-solves each leg as a
// two-bone chain (hip -> knee -> ankle, knee bending forward) so the ankle rises by the needed amount
// while keeping its stride position, and pitches the foot to the slope. The smoothed pose (P.ps) is never
// changed; the IK works on a copy right before applyPose, so pose blending stays stable.
const FIK={on:1,w:0,gL:0,gR:0,pL:0,pR:0,dbg:null};
// states in which the hero stands on his feet (no air, rolls, ragdoll, takedowns, getting up)
const FIK_OK={move:1,land:1,attack:1,charge:1,heavy:1,runatk:1,block:1,parry:1,gbreak:1,exec:1,assn:1,shoot:1,drink:1,hurt:1,skill:1};
// sagittal two-bone solve. a = pel+th (thigh from straight down, negative = forward), kn >= 0 bends the knee.
// Returns [th,kn] that move the ankle up by r (model units) while keeping its forward offset.
function legIK2(th,kn,pel,r,L1,L2){const a=pel+th,b=a+kn,y=-(L1*Math.cos(a)+L2*Math.cos(b)),z=-(L1*Math.sin(a)+L2*Math.sin(b)),y2=y+r;
 const D=cl(Math.hypot(z,y2),.05,L1+L2-1e-4),kn2=PI-Math.acos(cl((L1*L1+L2*L2-D*D)/(2*L1*L2),-1,1));
 const a2=Math.atan2(-z,-y2)-Math.acos(cl((L1*L1+D*D-L2*L2)/(2*L1*D),-1,1));return[a2-pel,kn2]}
function footIK(src,dt){const ok=FIK.on&&!P.air&&FIK_OK[P.st]&&P.rag.ang<.05&&P.y<hAt(P.x,P.z)+.05;
 FIK.w+=((ok?1:0)-FIK.w)*Math.min(1,(dt||0)*10);if(!dt)FIK.w=ok?1:0;
 if(FIK.w<.002)return src;
 const q=Object.assign({},src),H=HB,B=PLD.bones,L1=SK.L1,L2=SK.L2,w=FIK.w,M=mtrs([P.x,P.y,P.z],[0,P.yaw,0]),k=dt?Math.min(1,dt*18):1;
 const ext=(th,kn)=>L1*Math.cos(q.pel+th)+L2*Math.cos(q.pel+th+kn),fwd=(th,kn)=>-(L1*Math.sin(q.pel+th)+L2*Math.sin(q.pel+th+kn));
 const E0=Math.max(ext(q.LthX,q.Lkn),ext(q.RthX,q.Rkn)),g={},pt={};
 for(const[S,th,kn]of[['L',q.LthX,q.Lkn],['R',q.RthX,q.Rkn]]){const hp=B[S==='L'?H.leftUpperLeg:H.rightUpperLeg].r,z=hp[2]+fwd(th,kn);
  const f=mpt(M,[hp[0],0,z]),a=mpt(M,[hp[0],0,z+.16]),b=mpt(M,[hp[0],0,z-.16]);
  const gt=cl((hAt(f[0],f[2])-P.y)/PSC,-.42,.42),pit=cl(Math.atan((hAt(a[0],a[2])-hAt(b[0],b[2]))/(.32*PSC)),-.55,.55);
  FIK['g'+S]+=(gt-FIK['g'+S])*k;FIK['p'+S]+=(pit-FIK['p'+S])*k;g[S]=FIK['g'+S]*w;pt[S]=FIK['p'+S]*w}
 const drop=Math.min(g.L,g.R,0);
 [q.LthX,q.Lkn]=legIK2(q.LthX,q.Lkn,q.pel,g.L-drop,L1,L2);[q.RthX,q.Rkn]=legIK2(q.RthX,q.Rkn,q.pel,g.R-drop,L1,L2);
 // applyPose drops the root so the longer leg reaches rest height; cancel that and apply our own pelvis drop
 const E1=Math.max(ext(q.LthX,q.Lkn),ext(q.RthX,q.Rkn));q.hipY+=drop+(E0-E1);q.LfP=pt.L;q.RfP=pt.R;
 FIK.dbg={drop,gL:g.L,gR:g.R};return q}
