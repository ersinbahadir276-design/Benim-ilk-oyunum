// ===================== perception: every creature and NPC only sees in front of its eyes =====================
// Cheap to expensive: distance, then the view cone (from the HEAD direction), then line of sight
// (trees, rocks, walls, buildings, hills). Results are cached and refreshed ~8 times a second per agent.
// Awareness fills faster up close and slower when the player crouches; when an agent spots the player it
// calls out and every agent of the same group nearby turns towards the player.
const SENSE={fov:.92,crouchMul:.5,nightMul:.75};
function canSee(a,P,range,fov){if(!P.alive)return false;const dx=P.x-a.x,dz=P.z-a.z,d=Math.hypot(dx,dz);let R=range*(P.crouch&&P.spd<2.6?SENSE.crouchMul:1)*(GT.night?SENSE.nightMul:1);
 if(d>R)return false;if(Math.abs(angd(Math.atan2(dx,dz),a.yaw+(a.hyaw||0)))>(fov||SENSE.fov))return false;
 return los(a.x,a.z,P.x,P.z,a.eye||1.2)}
function senseTick(a,P,dt,range,fov){a.seeT=(a.seeT||Math.random()*.12)-dt;if(a.seeT<=0){a.seeT=.12;a.sees=canSee(a,P,range,fov)}return a.sees}
// awareness meter: returns true once when it crosses the "spotted" threshold
function fillAware(a,P,sees,dt,range){const d=Math.hypot(P.x-a.x,P.z-a.z);const was=a.aware||0;
 if(sees)a.aware=Math.min(1,was+dt*(P.crouch?.55:1)*(P.sprinting?1.5:1)/(.25+d/range*1.6));else a.aware=Math.max(0,was-dt*.3);
 if(sees){a.ls=[P.x,P.z];a.unseen=0}else a.unseen=(a.unseen||0)+dt;
 return was<.5&&a.aware>=.5}
// call out: same-group agents nearby turn towards the player and become suspicious
function alertGroup(src,P,radius,list){for(const o of list){if(o===src||o.dead||o.tame||o.group!==src.group)continue;if(Math.hypot(o.x-src.x,o.z-src.z)>radius)continue;
  o.aware=Math.max(o.aware||0,.6);o.ls=[P.x,P.z];o.heard=1.2;if(o.onAlerted)o.onAlerted(P)}}
// helpers shared by all agents
function agentFace(a,tx,tz,dt,rate=8){a.yaw+=angd(Math.atan2(tx-a.x,tz-a.z),a.yaw)*Math.min(1,dt*rate)}
function agentMove(a,tx,tz,speed,dt,rad,turn=7){const dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz);if(d<.05){a.spd=lp(a.spd||0,0,Math.min(1,dt*10));return d}
 const ty=Math.atan2(dx,dz);a.yaw+=angd(ty,a.yaw)*Math.min(1,dt*turn);const f=Math.max(.25,Math.cos(angd(ty,a.yaw))),s=Math.min(speed*f,d/Math.max(dt,1e-3));
 let nx=a.x+Math.sin(a.yaw)*s*dt,nz=a.z+Math.cos(a.yaw)*s*dt;if(!a.swims&&depthAt(nx,nz)>.6){nx=a.x;nz=a.z}const p=collide(nx,nz,rad);
 const moved=Math.hypot(p[0]-a.x,p[1]-a.z);a.x=p[0];a.z=p[1];a.spd=lp(a.spd||0,moved/Math.max(dt,1e-3),Math.min(1,dt*10));
 a.stuck=moved<s*dt*.25?(a.stuck||0)+dt:0;if(a.stuck>.9){a.stuck=0;a.yaw+=(a.side||1)*1.2;a.side=-(a.side||1)}return d}
// is the player behind this agent (for takedowns)? angle from the agent's facing to the player
const behind=(a,P,limit=1.95)=>Math.abs(angd(Math.atan2(P.x-a.x,P.z-a.z),a.yaw+(a.hyaw||0)))>limit;
