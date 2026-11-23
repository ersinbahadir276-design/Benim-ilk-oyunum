// ===================== THE HERO'S BOW (v25): hold L2 to draw, aim with the camera, release to loose =====================
// Draw levels: QUICK (< 0.45 s: weak, flat), FULL (0.45–1.0 s), PERFECT (released 1.0–1.25 s, a soft chime marks the
// moment: fastest, ×1.4). Held longer the arm tires: stamina drains and the aim shakes. Arrows fly with gravity; a hit
// above the body centre is a HEAD SHOT (×2). A soft aim-assist bends the shot only onto a foe within ~5° of the aim.
// A quick tap still shoots at the locked target (one-thumb play on a phone).
function startDraw(){if(P.st!=='move'||!P.alive)return;if(P.sta<10){note('Dayanıklılık yetersiz');return}habitAdd('bow');spend(8);P.st='draw';P.t=0;P.drawCue=0;sfx.swing()}
function drawLevel(t){return t<.45?0:t<1.0?1:t<=1.25?2:1}
function updateDraw(dt,moveFree){const lvl=drawLevel(P.t);moveFree(1.1,10);P.yaw+=angd(CAM.yaw,P.yaw)*Math.min(1,dt*14);
 if(P.t>1.0&&!P.drawCue){P.drawCue=1;sfx.charged();const tp=swordTip();spawnSparks(tp[0],tp[1],tp[2],4,[.7,.9,1],1)}
 if(P.t>1.25){P.sta=Math.max(0,P.sta-15*dt);P.staT=.85;if(P.sta<=0)releaseDraw()}
 if(!IN.bowHeld)releaseDraw()}
function releaseDraw(){if(P.st!=='draw')return;const t=P.t,lvl=drawLevel(t);P.st='move';P.t=0;
 if(t<.2){P.st='move';useBow();return}// a tap: the old quick shot at the locked / nearest target
 const sp=[24,40,48][lvl],mul=[.5,1,1.4][lvl],shake=t>1.25?.05:0;
 const yaw=CAM.yaw+rr(-shake,shake),pit=-CAM.pitch+.06+rr(-shake,shake);let dir=[Math.sin(yaw)*Math.cos(pit),Math.sin(pit),Math.cos(yaw)*Math.cos(pit)];
 const from=[P.x+Math.sin(P.yaw)*.5,P.y+1.45,P.z+Math.cos(P.yaw)*.5];
 // soft aim assist: a foe within ~5° of the aim ray is aimed at (gravity included)
 let best=null,bs=.09;for(const f of foes()){const fy=f===DRAGON?f.y+2:(f.y||0)+(f.big?1.4:.8),v=[f.x-from[0],fy-from[1],f.z-from[2]],l=Math.hypot(...v);if(l>60)continue;const c=(v[0]*dir[0]+v[1]*dir[1]+v[2]*dir[2])/l,a=Math.acos(cl(c,-1,1));if(a<bs){bs=a;best=[f.x,fy,f.z]}}
 const dmg=Math.round(weaponDmg()*.75*dmgMul()*mul);
 if(best)shootArrow(from,best,sp,'hero',dmg,null);else{arrowGeom();let a=ARROWS.find(x=>!x.on);if(!a){a={ob:obj(arrowGeo,{shade:.9,pos:[0,0,0],cull:120,out:.004,outCol:[.05,.04,.03]})};ARROWS.push(a)}Object.assign(a,{on:true,x:from[0],y:from[1],z:from[2],vx:dir[0]*sp,vy:dir[1]*sp,vz:dir[2]*sp,owner:'hero',dmg,life:4,stuck:0});a.ob.vis=true;sfx.swing()}
 const last=ARROWS.filter(a=>a.on&&a.owner==='hero').pop();if(last)last.perf=lvl===2;
 if(lvl===2)floatText(P.x,P.y+2,P.z,'KUSURSUZ ATIŞ','gold');P.st='shoot';P.t=.32;P.shot=1;P.bowT=null}
function drawPose(q){const k=sst(0,.45,P.t),sh=P.t>1.25?Math.sin(P.t*40)*.04:0;q.LaZ=.3;q.LaX=-1.45+sh;q.Lel=.05;q.RaZ=.55;q.RaX=-1.3+sh;q.Rel=lp(.9,2.0,k);q.RaY=-.2*k;q.spY=-.35;q.chY=-.15*k;q.LthX=-.3;q.Lkn=.35;q.RthX=.2;q.Rkn=.25;q.hdY=.15}
