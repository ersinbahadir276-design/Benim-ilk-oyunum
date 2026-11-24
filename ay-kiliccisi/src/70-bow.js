// ===================== THE HERO'S BOW (v25): hold L2 to draw, aim with the camera, release to loose =====================
// Draw levels: QUICK (< 0.45 s: weak, flat), FULL (0.45–1.0 s), PERFECT (released 1.0–1.25 s, a soft chime marks the
// moment: fastest, ×1.4). Held longer the arm tires: stamina drains and the aim shakes. Arrows fly with gravity; a hit
// above the body centre is a HEAD SHOT (×2). A soft aim-assist bends the shot only onto a foe within ~5° of the aim.
// A quick tap still shoots at the locked target (one-thumb play on a phone).
function startDraw(){if(P.st!=='move'||!P.alive)return;if(P.sta<10){note('Dayanıklılık yetersiz');return}habitAdd('bow');spend(8);P.st='draw';P.t=0;P.drawCue=0;sfx.swing()}
function drawLevel(t){return t<.45?0:t<1.0?1:t<=1.25?2:1}
function updateDraw(dt,moveFree){const lvl=drawLevel(P.t);xhair(true,lvl,P.t);moveFree(1.1,10);P.yaw+=angd(CAM.yaw,P.yaw)*Math.min(1,dt*14);
 if(P.t>1.0&&!P.drawCue){P.drawCue=1;sfx.charged();const tp=swordTip();spawnSparks(tp[0],tp[1],tp[2],4,[.7,.9,1],1)}
 if(P.t>1.25){P.sta=Math.max(0,P.sta-15*dt);P.staT=.85;if(P.sta<=0)releaseDraw()}
 if(!IN.bowHeld)releaseDraw()}
function releaseDraw(){if(P.st!=='draw')return;const t=P.t,lvl=drawLevel(t);P.st='move';P.t=0;xhair(false);
 if(t<.2){P.st='move';useBow();return}// a tap: the old quick shot at the locked / nearest target
 const sp=[24,40,48][lvl],mul=[.5,1,1.4][lvl],shake=t>1.25?.05:0;
 const from=[P.x+Math.sin(P.yaw)*.5,P.y+1.45,P.z+Math.cos(P.yaw)*.5],to=aimPoint(shake),dmg=Math.round(weaponDmg()*.75*dmgMul()*mul);shootArrow(from,to,sp,'hero',dmg,null);
 const last=ARROWS.filter(a=>a.on&&a.owner==='hero').pop();if(last)last.perf=lvl===2;
 if(lvl===2)floatText(P.x,P.y+2,P.z,'KUSURSUZ ATIŞ','gold');P.st='shoot';P.t=.32;P.shot=1;P.bowT=null}
function drawPose(q){const k=sst(0,.45,P.t),sh=P.t>1.25?Math.sin(P.t*40)*.04:0;q.LaZ=.3;q.LaX=-1.45+sh;q.Lel=.05;q.RaZ=.55;q.RaX=-1.3+sh;q.Rel=lp(.9,2.0,k);q.RaY=-.2*k;q.spY=-.35;q.chY=-.15*k;q.LthX=-.3;q.Lkn=.35;q.RthX=.2;q.Rkn=.25;q.hdY=.15}

// the crosshair: the point the camera looks at, found by marching the view ray (foes first, then the ground)
function aimPoint(shake){const e=CAM.eye||[P.x,P.y+2,P.z],t=CAM.tgt||[P.x+Math.sin(P.yaw),P.y+1.5,P.z+Math.cos(P.yaw)];let d=[t[0]-e[0],t[1]-e[1],t[2]-e[2]];const l=Math.hypot(...d)||1;d=d.map(v=>v/l);if(shake){d[0]+=rr(-shake,shake);d[1]+=rr(-shake,shake);d[2]+=rr(-shake,shake)}
 for(let s=2;s<90;s+=.5){const p=[e[0]+d[0]*s,e[1]+d[1]*s,e[2]+d[2]*s];if(Math.hypot(p[0]-P.x,p[2]-P.z)<1.2)continue;for(const f of foes()){const fy=f===DRAGON?f.y+2.5:(f.y||0)+(f.big?1.3:f.slime?.4*f.sz:isWolf(f)?.6:.9),R=f===DRAGON?3:f.big?1.1:.75;if(Math.hypot(f.x-p[0],f.z-p[2])<R&&Math.abs(fy-p[1])<(f===DRAGON?3:1.1))return[p[0],p[1],p[2]]}if(p[1]<hAt(p[0],p[2])||inBuilding(p[0],p[2],0))return p}
 return[e[0]+d[0]*90,e[1]+d[1]*90,e[2]+d[2]*90]}
let xhEl=null;function xhair(on,lvl,t){if(!xhEl){xhEl=document.createElement('div');xhEl.style.cssText='position:fixed;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border:2px solid rgba(255,255,255,.85);border-radius:50%;pointer-events:none;z-index:6;display:none;box-shadow:0 0 4px #000';xhEl.innerHTML='<div style="position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px 0 0 -2px;background:#fff;border-radius:50%"></div>';document.body.appendChild(xhEl)}
 xhEl.style.display=on?'block':'none';if(!on)return;const sz=lvl===2?14:lvl===1?20:28;xhEl.style.width=xhEl.style.height=sz+'px';xhEl.style.margin=(-sz/2)+'px 0 0 '+(-sz/2)+'px';xhEl.style.borderColor=lvl===2?'#ffd24a':'rgba(255,255,255,.85)'}
