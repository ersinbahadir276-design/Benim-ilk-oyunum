// v21 görüntüler: goblin toprak atışı, bacağa sarılma, kurt kol kilidi, ejderha uçuşu/kapma/yerde/tırmanış/III. uyanış
module.exports = async ({ shot, G }) => {
  const prep = `window.__noAutoQ=1;__G.GT.tod=.3;const P=__G.P,X=__G.X,d=__G.DRAGON;for(const w of __G.wolves){if(w.boss)continue;w.dead=300;w.st='dead';w.x=w.hx=9000}for(const g of __G.GOBS){g.dead=1;g.x=g.hx=5000}__G.SYS.vit=600;`;
  const run = async (body, name, wait = 300) => { await G(new Function(prep + '__G.GT.paused=false;' + body + ';__G.GT.paused=true')); await shot(name, { wait }) };
  const gob = `const gob=(dx,dz)=>{const g=__G.GOBS.find(g=>!g.big&&!g.boss&&g.dead&&!g.lookout&&!g.elite);g.dead=0;g.x=g.hx=P.x+dx;g.z=g.hz=P.z+dz;g.hp=g.max;g.st='chase';g.aware=1;g.unseen=0;g.cd=5;g.archer=false;g.yaw=Math.atan2(P.x-g.x,P.z-g.z);g.ls=[P.x,P.z];return g};`;
  await run(gob + `__G.tp(20,290);P.st='move';P.hp=X.maxHP();P.yaw=Math.PI;const g=gob(0,3.5);g.st='dirt';g.t=0;g.thrown=0;__G.CAM.yaw=1.3;__G.CAM.pitch=.12;__G.CAM.dist=4.5;__G.sim(1/60,46)`, 'b-dirt');
  await run(`__G.sim(1/60,20)`, 'b-blind', 100);
  await run(gob + `__G.tp(24,290);P.blindT=0;P.st='move';P.yaw=Math.PI;const g=gob(0,4.5);g.st='tackle';g.t=0;g.hitDone=false;__G.CAM.yaw=1.4;__G.CAM.pitch=.15;__G.CAM.dist=4.5;for(let i=0;i<80&&P.st!=='grabbed';i++)__G.sim(1/60,1);__G.sim(1/60,20)`, 'b-legs');
  await run(`X.releaseHero(true);for(const g of __G.GOBS){g.dead=1;g.x=5000}__G.tp(28,292);P.st='move';P.yaw=0;const w=__G.mkWolf(P.x,P.z+3);w.hp=w.max=180;w.aware=1;w.st='armleap';w.t=0;w.resolved=false;__G.CAM.yaw=1.2;__G.CAM.pitch=.15;__G.CAM.dist=4.5;for(let i=0;i<60&&P.st!=='grabbed';i++)__G.sim(1/60,1);__G.sim(1/60,25)`, 'b-arm');
  const dr = `X.releaseHero(true);for(const w of __G.wolves){if(w.boss)continue;w.dead=300;w.st='dead';w.x=9000}__G.tp(d.spawn[0],d.spawn[1]+22);d.x=d.spawn[0];d.z=d.spawn[1];d.dead=0;d.aware=1;d.yaw=Math.atan2(P.x-d.x,P.z-d.z);P.st='move';P.hp=X.maxHP();`;
  await run(dr + `d.hp=d.max*.5;d.phase=2;d.envK=.85;d.st='circle';d.t=0;d.fy=10;d.ang=0;d.cdir=1;d.am=0;__G.sim(1/60,60);__G.CAM.yaw=Math.atan2(d.x-P.x,d.z-P.z)+Math.PI;__G.CAM.pitch=-.25;__G.CAM.dist=7`, 'b-circle');
  await run(dr + `d.hp=d.max*.5;d.phase=2;d.envK=.85;d.st='dive';d.t=0;d.dv=null;d.fy=11;d.hitDone=false;let n=0;while(P.st!=='grabbed'&&n<300){__G.sim(1/60,1);n++}__G.sim(1/60,50);__G.CAM.yaw=Math.atan2(d.x-P.x,d.z-P.z)+2.2;__G.CAM.pitch=-.1;__G.CAM.dist=8`, 'b-carry');
  await run(dr + `X.releaseHero(true);d.hp=d.max*.5;d.phase=2;d.fy=0;d.pitch=d.roll=0;__G.sim(1/60,30);X.dragonBreak(d);__G.sim(1/60,110);const n=d.hitPts()[2];__G.CAM.yaw=d.yaw+1.9;__G.CAM.pitch=.35;__G.CAM.dist=8;__G.tp(n[0]+2,n[2]+1)`, 'b-downed');
  await run(`const n=d.hitPts()[2];__G.tp(n[0]+1,n[2]);d.t=0;X.startRide();__G.IN.mash=1;__G.sim(1/60,8);__G.CAM.yaw=d.yaw+1.6;__G.CAM.pitch=.3;__G.CAM.dist=6`, 'b-ride');
  await run(dr + `__G.P.held=0;d.hp=d.max*.5;d.phase=2;d.st='approach';d.fy=0;d.hurt(d.max*.2,0,0,'heavy');__G.sim(1/60,58);d.envK=.85;__G.CAM.yaw=Math.atan2(d.x-P.x,d.z-P.z)+Math.PI+.3;__G.CAM.pitch=.05;__G.CAM.dist=8`, 'b-awaken3');
  await run(`d.st='nova';d.t=0;d.hitDone=false;d.fy=0;__G.sim(1/60,80)`, 'b-nova');
  await G(() => { const d = __G.DRAGON; d.st = 'sleep'; d.hp = d.max; d.phase = 1; d.envK = 0 });
};
