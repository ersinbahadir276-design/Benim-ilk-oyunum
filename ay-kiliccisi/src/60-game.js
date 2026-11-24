// ===================== game: camera, sound, effects, telegraphs, marks, HUD, radar, input, loop =====================
const CAM={yaw:PI,pitch:.24,dist:4.8,shake:0,tx:P.x,ty:1.3,tz:P.z,eye:[0,0,0]};
const GT={stop:0,slow:0,time:0,clock:0,tod:.16,paused:true,dt:0,night:false};
let PM=MID,VPm=MID,pShadow,fxArc=[],sparks=[],sparkGeo,arcGeo;
// ---------- sound (synthesised; starts on the first touch)
let AC=null;const sfx={on(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}},
 noise(d,f0,f1,v,type='bandpass'){if(!AC)return;try{const n=Math.floor(AC.sampleRate*d),b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);
   const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type=type;f.frequency.setValueAtTime(f0,AC.currentTime);f.frequency.exponentialRampToValueAtTime(f1,AC.currentTime+d);g.gain.value=v;s.connect(f);f.connect(g);g.connect(AC.destination);s.start()}catch(e){}},
 tone(d,f0,f1,v,type='sine'){if(!AC)return;try{const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,AC.currentTime);o.frequency.exponentialRampToValueAtTime(f1,AC.currentTime+d);g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}},
 swing(){this.noise(.16,2600,700,.25)},hit(){this.noise(.12,900,200,.5,'lowpass');this.tone(.14,170,60,.5)},growl(){this.tone(.5,95,60,.22,'sawtooth')},bite(){this.noise(.09,1800,500,.35);this.tone(.1,120,70,.3,'square')},
 snarl(){this.tone(.9,70,140,.32,'sawtooth');this.noise(.9,300,900,.15)},thud(){this.tone(.25,110,40,.6);this.noise(.2,400,120,.4,'lowpass')},level(){this.tone(.18,520,780,.25);setTimeout(()=>this.tone(.3,780,1040,.25),150)},
 dodge(){this.noise(.2,500,1800,.18)},jump(){this.noise(.12,300,900,.12)},land(){this.noise(.1,300,120,.2,'lowpass')},parry(){this.tone(.35,1800,900,.35,'triangle');this.noise(.2,4000,2000,.3)},
 block(){this.tone(.18,900,500,.3,'triangle');this.noise(.12,2500,1200,.2)},hurt(){this.tone(.18,300,160,.25,'square')},charge(){this.tone(.9,200,520,.12,'sine')},charged(){this.tone(.25,900,1300,.2,'triangle')},
 grab(){this.noise(.25,600,200,.3,'lowpass')},stab(){this.noise(.18,1200,300,.45,'lowpass');this.tone(.2,140,50,.5)},struggle(){this.noise(.08,800,400,.2)},gobShout(){this.tone(.22,420,620,.18,'square')},
 roar(v=1){this.tone(1.4,90,45,.45*v,'sawtooth');this.noise(1.4,500,120,.35*v,'lowpass')},hiss(){this.noise(.6,5000,2500,.25,'highpass')},snap(){this.noise(.08,2500,800,.5);this.tone(.08,200,80,.4,'square')},
 wings(v=.6){this.noise(.3,250,80,.4*v,'lowpass')},rare(){this.tone(.25,660,990,.2,'triangle');setTimeout(()=>this.tone(.35,990,1320,.2,'triangle'),120)},anvil(){this.tone(.3,1400,900,.3,'triangle');this.noise(.1,3000,1500,.3)},drink(){this.noise(.5,300,600,.15,'lowpass')},
 rest(){this.tone(1.2,220,330,.2,'sine');this.tone(1.2,330,495,.12,'sine')},chest(){this.noise(.25,400,200,.3,'lowpass');this.tone(.3,500,800,.15,'triangle')},break(){this.tone(.3,300,90,.4,'square');this.noise(.25,2000,400,.3)},lock(){this.tone(.08,1200,1500,.12,'square')},howl(){this.tone(1.6,300,520,.3,'sawtooth');setTimeout(()=>this.tone(1.2,520,380,.25,'sawtooth'),700)},horn(){this.tone(1.3,150,140,.4,'sawtooth')},inhale(){this.noise(1.6,200,1800,.25)},fire(){this.noise(.25,700,300,.25,'lowpass')},hey(){this.tone(.25,330,280,.2,'triangle')}};
// ---------- effects: sword arcs, sparks, ground telegraphs
function buildFx(){const g=G(),n=18;for(let i=0;i<=n;i++){const t=i/n,a=lp(-1.15,1.15,t),w=Math.sin(PI*t),r0=1.75-w*.75,r1=1.75+w*.75;
  for(const[r,c]of[[r0,[.45,.6,1]],[r1,[1,1,1]]]){g.P.push(Math.sin(a)*r,0,Math.cos(a)*r);g.N.push(0,1,0);g.C.push(c[0],c[1],c[2]);g.U.push(0,0);g.W.push(0)}
  if(i){const o=(i-1)*2;g.I.push(o,o+1,o+2,o+1,o+3,o+2)}}
 arcGeo=geo(g);for(let i=0;i<3;i++){const o=obj(arcGeo,{unlit:1,blend:1,noOff:1,shade:0});o.vis=false;o.life=0;fxArc.push(o)}
 const q=G();q.P.push(-1,0,0,0,1,0,1,0,0,0,-1,0,0,0,1,0,0,-1);for(let i=0;i<6;i++){q.N.push(0,1,0);q.C.push(1,1,1);q.U.push(0,0);q.W.push(0)}q.I.push(0,1,2,0,2,3,4,1,5,4,5,3);sparkGeo=geo(q);
 for(let i=0;i<40;i++){const o=obj(sparkGeo,{unlit:1,shade:0});o.vis=false;o.life=0;o.p=[0,0,0];o.v=[0,0,0];sparks.push(o)}
 pShadow=obj(WG.shadow,{unlit:1,blend:1,col:[0,0,.03],shade:0});pShadow.alpha=.32;
 // telegraph decals: ring, filled disc, strip (unit sized, laid on the ground)
 const ring=G(),disc=G(),strip=G();for(let k=0;k<=32;k++){const a=k/32*2*PI,c=Math.cos(a),s=Math.sin(a);ring.P.push(c*.86,0,s*.86,c,0,s);if(k){const o=(k-1)*2;ring.I.push(o,o+2,o+1,o+1,o+2,o+3)}}
 disc.P.push(0,0,0);for(let k=0;k<=32;k++){const a=k/32*2*PI;disc.P.push(Math.cos(a),0,Math.sin(a));if(k)disc.I.push(0,k+1,k)}
 strip.P.push(-.5,0,0,.5,0,0,-.5,0,1,.5,0,1,0,0,1.25);strip.I.push(0,2,1,1,2,3,2,4,3);
 for(const g2 of[ring,disc,strip]){const nv=g2.P.length/3;for(let i=0;i<nv;i++){g2.N.push(0,1,0);g2.C.push(1,1,1);g2.U.push(0,0);g2.W.push(0)}}
 TELE.geo={ring:geo(ring),disc:geo(disc),strip:geo(strip)}}
const TELE={geo:null,pool:{ring:[],disc:[],strip:[]},q:[]};
function tele(kind,x,z,a,b,yaw,alpha){TELE.q.push({kind,x,z,a,b,yaw,alpha})}// ring/disc: a = radius; strip: a = width, b = length
function drawTele(){const used={ring:0,disc:0,strip:0},pulse=.65+.35*Math.sin(GT.time*14);
 for(const t of TELE.q){const parts=t.kind==='circle'?['ring','disc']:['strip'];for(const k of parts){let o=TELE.pool[k][used[k]];if(!o){o=obj(TELE.geo[k],{unlit:1,blend:1,noOff:0,order:3,shade:0,pos:[0,0,0],cull:400});TELE.pool[k].push(o)}used[k]++;
   const y=hAt(t.x,t.z)+.14;if(k==='strip'){o.M=mtrs([t.x,y,t.z],[0,t.yaw,0]);o.M[0]*=t.a;o.M[2]*=t.a;o.M[8]*=t.b;o.M[10]*=t.b}else{o.M=mtrs([t.x,y,t.z],[0,0,0]);o.M[0]*=t.a;o.M[10]*=t.a}
   o.col=[1,.1,.06];o.alpha=(k==='disc'?.22:.85)*pulse*(t.alpha||1);o.vis=true;o.pos=[t.x,y,t.z]}}
 for(const k in TELE.pool)for(let i=used[k];i<TELE.pool[k].length;i++)TELE.pool[k][i].vis=false;TELE.q.length=0}
function spawnArc(kind){const o=fxArc.find(o=>o.life<=0)||fxArc[0];o.life=.17;o.kind=kind;o.vis=true}
function spawnSparks(x,y,z,n,col,sp=5){for(let i=0;i<n;i++){const o=sparks.find(o=>o.life<=0);if(!o)return;o.life=rr(.2,.42);o.max=o.life;o.p=[x,y,z];const a=rnd()*6.28;o.v=[Math.cos(a)*rr(1,sp),rr(1.5,sp),Math.sin(a)*rr(1,sp)];o.col=col;o.vis=true;o.rot=[rnd()*6,rnd()*6,rnd()*6]}}
function updateFx(dt){for(const o of fxArc){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.vis=false;continue}const u=1-o.life/.17,s=PSC*(1+u*.18);
  const M=mmul(mtrs([P.x+Math.sin(P.yaw)*.25,P.y+1.0*PSC,P.z+Math.cos(P.yaw)*.25],[0,P.yaw,0]),mtrs([0,0,0],[0,0,o.kind===0?.3:o.kind===1?-.3:1.42]));for(let k=0;k<12;k++)M[k]*=s;o.M=M;o.alpha=.85*(1-u);o.col=[.85,.92,1]}
 for(const o of sparks){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.vis=false;continue}o.v[1]-=14*dt;for(let k=0;k<3;k++)o.p[k]+=o.v[k]*dt;const s=.07*(o.life/o.max);o.M=mtrs(o.p,o.rot);for(let k=0;k<12;k++)o.M[k]*=s}}
// ---------- floating numbers and marks over creatures (DOM, projected)
function project(x,y,z){const m=VPm,w=m[3]*x+m[7]*y+m[11]*z+m[15];if(w<=.1)return null;return[((m[0]*x+m[4]*y+m[8]*z+m[12])/w*.5+.5)*innerWidth,(1-((m[1]*x+m[5]*y+m[9]*z+m[13])/w*.5+.5))*innerHeight]}
function floatText(x,y,z,txt,cls){const s=project(x,y,z);if(!s)return;const d=document.createElement('div');d.className='dmg '+(cls||'');d.textContent=txt;d.style.left=s[0]+'px';d.style.top=s[1]+'px';$('marks').appendChild(d);setTimeout(()=>{if(d.parentNode)d.parentNode.removeChild(d)},800)}
const markEls=[];
function markFor(a,kind){if(a.dead)return null;
 if(kind==='wolf'){const w=a;if(w.st==='windup')return['!','red'];if(w.tame)return['♥','tame'];if(w.calm>0)return['%'+w.trust,'tame'];if(!hostileSt(w)&&(w.aware>.25||w.st==='alert'||w.st==='search'))return['?','yel'];if(hostileSt(w)&&w.hp<w.max)return['','hpb'];return null}
 if(kind==='npc'){if(a.st==='watch')return['!','yel'];return null}
 if(a.st==='windup'||a.st==='open'||(kind==='dragon'&&(a.st==='claw'&&a.ct<2.7||a.st==='breath'&&a.ct<2.7)))return['!','red'];
 if(a.open&&a.open())return['★','gold'];if(!a.hostile()&&a.aware>.25)return['?','yel'];if(a.hostile()&&a.hp<a.max&&kind!=='dragon')return['','hpb'];return null}
function updateMarks(){let i=0;const putTxt=(a,txt,cls,h)=>{if(!txt)return;const p=project(a.x,(a.y||0)+h,a.z);if(!p)return;let e=markEls[i];if(!e){e=document.createElement('div');$('marks').appendChild(e);markEls[i]=e}i++;e.className='mark '+cls;e.style.display='block';e.style.left=p[0]+'px';e.style.top=p[1]+'px';e.textContent=txt};
 const put=(a,kind,h)=>{const m=markFor(a,kind);if(!m)return;const p=project(a.x,(a.y||0)+h+(a.air||0),a.z);if(!p)return;let e=markEls[i];if(!e){e=document.createElement('div');$('marks').appendChild(e);markEls[i]=e}i++;
  e.className='mark '+m[1];e.style.display='block';e.style.left=p[0]+'px';e.style.top=p[1]+'px';if(m[1]==='hpb')e.innerHTML='<i style="width:'+cl(a.hp/a.max*100,0,100)+'%"></i><b style="width:'+(posFrac(a)*100)+'%"></b><em>Sv.'+(a.lv||1)+'</em>';else e.textContent=m[0]};
 for(const s of wslots)if(s.w)put(s.w,'wolf',1.25*s.w.sc);
 for(const g of GOBS)if(Math.hypot(g.x-P.x,g.z-P.z)<60)put(g,'gob',g.big?3.0:1.45);for(const c of CROCS)if(Math.hypot(c.x-P.x,c.z-P.z)<60)put(c,'croc',1.0);
 for(const n of NPCS)if(Math.hypot(n.x-P.x,n.z-P.z)<40){if(n.role&&questFor(n))putTxt(n,'!','gold',2.25);else put(n,'npc',2.0)}if(VEYRA&&VEYRA.on&&!VEYRA.hidden)putTxt(VEYRA,VEYRA.down?'✚':'',VEYRA.down?'red':'tame',1.9);
 if(P.lock){const f=P.lock,h=f.hitPts?f.hitPts()[0][1]-(f.y||0):1.0;putTxt(f,'◎','lock',h)}for(const f of foes())if(isBroken(f)&&Math.hypot(f.x-P.x,f.z-P.z)<25)putTxt(f,'İNFAZ','crit',(f.big?2.6:1.5));if(DRAGON&&Math.hypot(DRAGON.x-P.x,DRAGON.z-P.z)<90){const h=DRAGON.alt?DRAGON.alt()+6:6;put(DRAGON,'dragon',h)}
 for(;i<markEls.length;i++)markEls[i].style.display='none'}
// ---------- wolf callbacks (System messages, sounds, pin)
const PARTN={omuzL:'sol omzuna',omuzR:'sağ omzuna',kolL:'sol koluna',kolR:'sağ koluna',govde:'göğsüne',bacakL:'sol bacağına',bacakR:'sağ bacağına'};let lastSpot=-9;
const GS={onAggro(w){sfx.growl()},onWindup(w){sfx.snarl()},onPounce(w){sfx.noise(.25,300,900,.2)},
 onSpotted(w){if(GT.clock-lastSpot>4){lastSpot=GT.clock;sfx.growl();note('[!] Bir kurt seni gördü, sürü sana dönüyor.','red')}},
 onDodged(w){SYS.dodges++;GT.slow=.28;addXP(6,P);note('[Sistem] Kusursuz kaçınma! Kurt savunmasız.','gold')},
 onMiss(w){SYS.dodges++;note('[Sistem] Atlayıştan kaçındın. Kurt savunmasız.')},
 // the wolf grabs where it landed on the body: high -> shoulder, middle -> arm or chest, low -> leg
 onPin(w,h){const lat=(w.x-P.x)*Math.cos(P.yaw)-(w.z-P.z)*Math.sin(P.yaw),side=lat<0?'R':'L';
  const key=h>.72?'omuz'+side:h>.38?(Math.abs(lat)>.22?'kol'+side:'govde'):'bacak'+side,S=side==='R'?'right':'left';
  w.part={key,bone:key.startsWith('omuz')?HB[S+'UpperArm']:key.startsWith('kol')?HB[S+'LowerArm']:key==='govde'?HB.chest:HB[S+'LowerLeg']};
  P.pinBy=w;P.struggle=0;w.st='pin';w.t=0;w.bites=0;w.bt=.5;w.air=0;w.kx=w.kz=0;CAM.shake=.8;spawnSparks(P.x,P.y+.8,P.z,8,[.8,.75,.6],3);note('[Sistem] Kurt '+PARTN[key]+' saldırdı! Düğmelere art arda basarak kurtul.','red')},
 onBite(w){const dmg=2+(w.alpha?1:0)+(rnd()<.3?1:0);P.hp-=dmg;P.jig=1;P.flash=.5;CAM.shake=Math.max(CAM.shake,.3);sfx.bite();const b=mpt(PM,SK.GP[w.part.bone]);floatText(b[0],b[1]+.3,b[2],'-'+dmg,'red');spawnSparks(b[0],b[1],b[2],4,[.9,.2,.2],2.5);
  if(P.hp<=0)die()},
 onKill(w,byPet){SYS.kills++;SYS.meat++;addXP(w.alpha?70:30,P);note('[Sistem] Kurt öldürüldü'+(byPet?' (yoldaşın)':'')+' · +'+(w.alpha?70:30)+' XP · +1 çiğ et');GT.stop=Math.max(GT.stop,.12);save(P)}};
// ---------- interaction: silent choke on an unaware goblin from behind, talk, feed/tame a wolf, statue
function interact(){const v=tdTarget(1.9);if(v&&!isWolf(v)){if(v.big){note('Büyük goblin tutulamaz, boyun kilidine alınamaz.');return}startChoke(v);return}
 const ai=nearAltar();if(ai>=0){restAt(ai);return}const ci=nearChest();if(ci>=0){P.yaw=Math.atan2(CHESTS[ci].x-P.x,CHESTS[ci].z-P.z);P.interactT=.6;openChest(ci);return}
 if(storyInteract())return;
 let n=null,nd=2.8;for(const o of NPCS){const d=Math.hypot(o.x-P.x,o.z-P.z);if(d<nd){nd=d;n=o}}if(n){npcTalk(n);return}
 let b=null,bd=3.2;for(const w of wolves){if(w.dead||w.tame)continue;const d=Math.hypot(w.x-P.x,w.z-P.z);if(d<bd){bd=d;b=w}}
 if(!b){if(Math.hypot(P.x-10,P.z-50)<5)note('«Unutulmuş Şövalye» — güller bile onu terk etmedi.');else{const g=GOBS.find(g=>!g.dead&&Math.hypot(g.x-P.x,g.z-P.z)<2.5);note(g?(g.hostile()||g.aware>=.5?'Goblin seni fark etti: boyun kilidi olmaz':'Arkasına geç: önünden yaklaşırsan görür'):'Yakında etkileşilecek bir şey yok')}return}
 if(hostileSt(b)){note('Kurt saldırgan: önce sakinleşmesi ya da seni fark etmemesi gerek');return}if(!P.crouch){note('Yavaş ol: EĞİL ve öyle yaklaş');return}if(SYS.meat<1){note('Çiğ et yok (kurtlardan düşer, tüccardan alınır)');return}
 if(wolves.filter(w=>w.tame).length>=5){note('En fazla 5 yoldaşın olabilir');return}
 SYS.meat--;b.trust=Math.min(100,b.trust+34);b.calm=9;b.aware=0;b.st='idle';b.t=0;
 if(b.trust>=100){b.tame=true;b.hp=b.max=Math.round(b.max*.75);SYS.tamed++;note('[Sistem] Kurt evcilleşti! Yoldaş gücü %75.','gold');addXP(40,P)}else note('Kurt eti kabul etti. Güven %'+b.trust);save(P)}
// ---------- one simulation step
let lastZone='';
function step(dt){GT.dt=dt;if(dt>0){GT.clock+=dt;updatePlayer(dt);
  for(const w of wolves)if(Math.hypot(w.x-P.x,w.z-P.z)<170||w.tame||w.dead)updateWolf(w,P,dt,GS);
  for(const g of GOBS)if(Math.hypot(g.x-P.x,g.z-P.z)<180)updateGob(g,dt);for(const n of NPCS)updateNpc(n,dt);for(const c of CROCS)if(Math.hypot(c.x-P.x,c.z-P.z)<200)updateCroc(c,dt);
  updateDragon(DRAGON,dt);GT.tod=(GT.tod+dt/600)%1;updateFx(dt);updateDragonFx(dt);
  updateLoot(dt);updateChests(dt);updatePosture(dt);updateRage(dt);updateLock(dt);updateBosses(dt);updateVeyra(dt);updateStory(dt);foeTicks(dt);updateBag(GT.time);updateSeals(GT.time);updateRings(dt);updateArrows(dt);checkStances();if(P.counterT>0)P.counterT-=dt;
  const lv=regionLevel(P.x,P.z);if(lv!==GT.lastLv){if(lv>SYS.lv+3)note('[!] Tehlikeli bölge: düşmanlar Sv.'+lv+' (sen Sv.'+SYS.lv+')','red');GT.lastLv=lv}
  const z=zoneAt(P.x,P.z);if(z!==lastZone){if(lastZone)note('Bölge: '+ZNAME[z]);lastZone=z}}
 poseTarget();applyPose(P.ps);footIK(dt);PM=playerMatrix(dt);
 if(P.pinBy){const w=P.pinBy,b=mpt(PM,SK.GP[w.part.bone]),ty=Math.atan2(b[0]-w.x,b[2]-w.z);w.yaw+=angd(ty,w.yaw)*.25;const gx=b[0]-Math.sin(w.yaw)*.95*w.sc,gz=b[2]-Math.cos(w.yaw)*.95*w.sc;w.x=lp(w.x,gx,.25);w.z=lp(w.z,gz,.25);w.y=hAt(w.x,w.z)}
 queueTelegraphs()}
// enemies' visible tells on the ground
function queueTelegraphs(){for(const w of wolves){if(w.st!=='windup'||w.dead||w.tame)continue;const L=cl(Math.hypot(w.ax-w.x,w.az-w.z)+.4,2.5,8);tele('strip',w.x,w.z,.9,L,Math.atan2(w.ax-w.x,w.az-w.z),sst(0,.3,w.t))}
 for(const g of GOBS){if(g.dead||g.st!=='windup')continue;if(g.big&&g.move==='stomp')tele('circle',g.x,g.z,5.6,0,0,1);else if(g.big&&g.move==='sweep')tele('circle',g.x+Math.sin(g.yaw)*1.2,g.z+Math.cos(g.yaw)*1.2,3.2,0,0,sst(0,.4,g.t));else if(g.big)tele('circle',g.x+Math.sin(g.yaw)*2.3*g.sc/1.25,g.z+Math.cos(g.yaw)*2.3*g.sc/1.25,1.35,0,0,sst(0,.4,g.t));else tele('strip',g.x,g.z,.7,1.8,g.yaw,1)}
 for(const w of wolves)if(w.st==='howl'&&!w.dead)tele('circle',w.x,w.z,3,0,0,.6);
 for(const c of CROCS){if(c.dead||c.st!=='open')continue;const h=crocHead(c);tele('circle',h[0]+Math.sin(c.yaw)*.4,h[2]+Math.cos(c.yaw)*.4,1.2,0,0,sst(0,.3,c.t))}
 const d=DRAGON;if(d&&!d.dead){if(d.st==='claw'&&d.ct>.6&&d.ct<2.8)tele('circle',d.x+Math.sin(d.yaw)*6.2+Math.cos(d.yaw)*-1.2,d.z+Math.cos(d.yaw)*6.2-Math.sin(d.yaw)*-1.2,2.6,0,0,sst(.6,1.2,d.ct));
  if(d.st==='breath'&&d.breathA&&d.ct<4.4){const ax=d.breathA[0],az=d.breathA[1],bx=d.breathB[0],bz=d.breathB[1];tele('strip',ax,az,3.6,Math.hypot(bx-ax,bz-az),Math.atan2(bx-ax,bz-az),d.ct<2.7?1:.5)}
  if(d.st==='land'&&d.ct<.6)tele('circle',d.x,d.z,5.5,0,0,1)}}
// ---------- camera, environment, render
function render(dtReal){const down=P.st==='down'||P.st==='dead';if(!window.__G||!__G.__lockCam){const k=1-Math.exp(-dtReal*12);CAM.tx=lp(CAM.tx,P.x,k);CAM.tz=lp(CAM.tz,P.z,k);CAM.ty=lp(CAM.ty,P.y+(down?.7:P.crouch?1.15:P.st==='td'&&P.td&&P.td.kind!=='choke'?.9:1.5),1-Math.exp(-dtReal*8))}
 CAM.shake=Math.max(0,CAM.shake-dtReal*1.3);const sh=CAM.shake*CAM.shake*(SYS.lowShake?.3:1),T=GT.time,tg=[CAM.tx+Math.sin(T*47)*Math.cos(T*31)*sh*.38,CAM.ty+Math.sin(T*53+1.7)*sh*.3,CAM.tz+Math.sin(T*41+.6)*Math.cos(T*37)*sh*.38];
 const fx=Math.sin(CAM.yaw),fz=Math.cos(CAM.yaw),cp=Math.cos(CAM.pitch),spt=Math.sin(CAM.pitch);const boss=DRAGON&&!DRAGON.dead&&DRAGON.hostile()&&Math.hypot(DRAGON.x-P.x,DRAGON.z-P.z)<60;let dist=CAM.dist*(down?.85:1)*(boss?1.5:1),eye;
 for(;;){eye=[tg[0]-fx*cp*dist,tg[1]+spt*dist,tg[2]-fz*cp*dist];if(dist<=1.2||eye[1]>9||!inBuilding(eye[0],eye[2],.35))break;dist-=.35}
 eye[1]=Math.max(eye[1],hAt(eye[0],eye[2])+.35,waterAt(eye[0],eye[2])+.3);CAM.eye=eye;
 const L=mlook(eye,tg,[0,1,0]);VPm=mmul(mpersp(58*PI/180,cv.width/cv.height,.25,620),L.m);
 const dk=cl(Math.sin(GT.tod*2*PI)*1.7+.62,0,1),m3=(a,b,t)=>[lp(a[0],b[0],t),lp(a[1],b[1],t),lp(a[2],b[2],t)],dusk=1-Math.abs(dk-.5)*2;GT.night=dk<.35;
 const zn=zoneAt(P.x,P.z),swamp=zn==='swamp'?1:0,qf=[1,1,.85,.7][QUAL.QL];
 let fog=m3([.07,.09,.19],[.66,.8,.93],dk);fog=m3(fog,[.93,.62,.45],dusk*.35);fog=m3(fog,[.45,.5,.42],swamp*.45);
 const env={fogC:fog,sun:m3([.5,.56,.82],[1,1,1],dk),fog:[lp(35,60,dk)*(1-swamp*.4),lp(220,300,dk)*(1-swamp*.35)*qf],focus:[CAM.tx,CAM.ty,CAM.tz]};updateScenery(GT.time,dtReal,env,eye);
 const light=vnorm(vadd(vadd(vmul(L.r,-.45),vmul(L.u,.62)),vmul(L.f,-.62)));
 for(const o of pObjs){o.M=PM;o.flash=P.flash*.6;o.vis=true}if(P.inv>0&&P.st!=='dodge'&&P.st!=='getup'&&Math.floor(GT.time*14)%2===0)for(const o of pObjs)o.flash=.35;
 if(P.st==='charge'&&P.charge>=1)for(const o of pObjs)o.flash=.15+.1*Math.sin(GT.time*20);
 pShadow.M=mtrs([P.x,hAt(P.x,P.z)+.07,P.z],[0,0,0]);const ps=down?.75:.42;pShadow.M[0]*=ps;pShadow.M[10]*=ps;
 for(const w of WATERS)w.alpha=w.alpha;
 streamForest(P.x,P.z,(window.__G&&__G.fastStream)?99:1);for(const f of CAMPFIRES){const k=1+Math.sin(GT.time*13+f.x)*.12;f.o.M=mtrs([f.x,f.y+.1,f.z],[0,GT.time*.7,0]);f.o.M[5]*=k*(1+Math.sin(GT.time*9)*.15)}
 updateAltars(GT.time);if(HERO.glow){const g=P.berserk>0?1.6+.4*Math.sin(GT.time*12):(P.rage>=100?1.1+.3*Math.sin(GT.time*6):1);HERO.glow.col=[g,.25*g,.15*g]}if(HERO.armor){const a=eqItem('armor'),t=HERO.armor.pbr?[1,1,1]:(a&&a.look?a.look.tint:[1,1,1]),k=P.berserk>0?.25+.15*Math.sin(GT.time*10):0;HERO.armor.col=[t[0]*(1+k),t[1]*(1-k*.4),t[2]*(1-k*.4)]}
 skinAll();drawWolves(P,GT.time);drawVeyra(GT.time);drawGobs(GT.time);drawHeroBow();drawNpcs(GT.time);drawCrocs(GT.time);drawDragon();drawTele();drawAll(VPm,eye,light,GT.time,env);updateMarks()}
// ---------- HUD
let hudT=0,chkT=0,saveT=0;
function promptText(){if(P.st==='down'&&P.pinBy)return'KURTUL! Düğmelere art arda bas';if(P.st==='td'||P.st==='exec')return'';if(execTarget())return'SALDIR: İNFAZ';
 if(nearAltar()>=0)return'ETKİLEŞ: sunakta dinlen'+(SYS.altars&&SYS.altars[nearAltar()]?'':' (yak)');if(nearChest()>=0)return'ETKİLEŞ: sandığı aç';const sp=storyPrompt();if(sp)return sp;
 const v=tdTarget(4.8);if(v){const d=Math.hypot(v.x-P.x,v.z-P.z);if(!isWolf(v)&&v.big)return d<2.4?'△ SUİKAST (ağır yara)':'Büyük goblin tutulamaz';if(d<2.4)return'△ SUİKAST'+(!isWolf(v)&&d<1.9?'  ·  R1: boyun kilidi':'')+'  ·  ✕✕: üstüne atla';return isWolf(v)?'✕✕: kurdun sırtına atla  ·  yaklaş: △ suikast':'✕✕: goblinin üstüne atla  ·  yaklaş: △ suikast'}
 for(const n of NPCS)if(Math.hypot(n.x-P.x,n.z-P.z)<2.8)return'ETKİLEŞ: konuş';return''}
function uiTick(dt){hudT=Math.min(hudT,.1)-dt;if(hudT<=0){hudT=.1;hud(P);drawRadar();
  const all=[...wolves.filter(w=>!w.tame&&!w.dead&&Math.hypot(w.x-P.x,w.z-P.z)<60).map(w=>[hostileSt(w),w.aware]),...GOBS.filter(g=>!g.dead&&Math.hypot(g.x-P.x,g.z-P.z)<60).map(g=>[g.hostile(),g.aware]),...CROCS.filter(c=>!c.dead&&Math.hypot(c.x-P.x,c.z-P.z)<60).map(c=>[c.hostile(),c.aware])];
  const hostile=all.some(a=>a[0])||(DRAGON&&DRAGON.hostile()&&Math.hypot(DRAGON.x-P.x,DRAGON.z-P.z)<120),sus=all.some(a=>!a[0]&&a[1]>.25),e=$('stealth');
  e.textContent=hostile?'TEHLİKE':sus?'ŞÜPHE':P.crouch?'GİZLİ':'';e.className=hostile?'red':sus?'yel':'';
  const pr=promptText(),pe=$('prompt');pe.textContent=pr;pe.style.display=pr?'block':'none';
  const m=$('mash');if(P.st==='down'&&P.pinBy){m.style.display='block';m.firstChild.style.width=cl(P.struggle*100,0,100)+'%'}else m.style.display='none';
  const kd=Math.hypot(P.x,P.z),b=angd(Math.atan2(-P.x,-P.z),CAM.yaw);const tg=questTarget();if(tg){const bb2=angd(Math.atan2(tg[0]-P.x,tg[1]-P.z),CAM.yaw),dd=Math.hypot(tg[0]-P.x,tg[1]-P.z);$('compass').innerHTML='<span style="display:inline-block;color:#ffd76a;transform:rotate('+(-bb2)+'rad)">◆</span> Görev '+Math.round(dd)+' m<br><small>'+ZNAME[zoneAt(P.x,P.z)]+' · Sv.'+regionLevel(P.x,P.z)+'</small>'}else $('compass').innerHTML=(kd<120?'Krallık':'<span style="display:inline-block;transform:rotate('+(-b)+'rad)">▲</span> Krallık '+Math.round(kd)+' m')+'<br><small>'+ZNAME[zoneAt(P.x,P.z)]+'</small>';
  const bb=$('boss'),dr=bossTarget();if(dr){bb.style.display='block';$('bossn').textContent=(dr===DRAGON?'KÜL KANAT · EJDERHA':dr.title||'')+' · Sv.'+(dr.lv||18);$('bossf').style.width=cl(dr.hp/dr.max*100,0,100)+'%';$('bossp').style.width=posFrac(dr)*100+'%'}else bb.style.display='none';
  $('rgf').style.width=(P.berserk>0?P.berserk/12*100:P.rage||0)+'%';$('rgf').className=P.berserk>0?'on':(P.rage>=100?'full':'');$('bRage').style.display=(P.rage>=100||P.berserk>0)?'flex':'none';$('bRage').classList.toggle('on',P.berserk>0);
  $('bFlask').innerHTML='<i>▼</i>İKSİR <b>'+SYS.flasks+'</b>';const sk=SYS.skill,cdl=sk&&P.cd&&P.cd[sk]?Math.max(0,P.cd[sk]-GT.clock):0;$('bSkill').innerHTML='<i>▲</i>'+(sk?SKILLS[sk].n.split(' ')[0].slice(0,7):'YETENEK')+(cdl>0?' <b>'+cdl.toFixed(0)+'</b>':'');$('bSkill').classList.toggle('cd',cdl>0);$('bLock').classList.toggle('on',!!P.lock);
  let nw=null,nd=3.2;for(const w of wolves){if(w.dead||w.tame)continue;const d=Math.hypot(w.x-P.x,w.z-P.z);if(d<nd){nd=d;nw=w}}$('bInt').classList.toggle('on',!!pr&&pr.startsWith('ETKİLEŞ')||(!!nw&&!hostileSt(nw)));
  $('bBlk').classList.toggle('on',P.st==='block');$('bSpr').classList.toggle('on',P.sprinting);$('bCrc').classList.toggle('on',P.crouch)}
 chkT-=dt;if(chkT<=0){chkT=.4;checkQuests(P)}saveT-=dt;if(saveT<=0){saveT=6;save(P)}}
function drawRadar(){const c=$('radar'),g=c.getContext('2d'),S=c.width,R=radarR(),k=S/2/R,cy=CAM.yaw,fx=Math.sin(cy),fz=Math.cos(cy);g.clearRect(0,0,S,S);g.fillStyle='rgba(10,20,45,.55)';g.beginPath();g.arc(S/2,S/2,S/2-2,0,7);g.fill();g.strokeStyle='rgba(120,180,255,.7)';g.lineWidth=2;g.stroke();
 const T=(x,z)=>{const dx=x-P.x,dz=z-P.z;return[S/2+(dx*-fz+dz*fx)*k,S/2-(dx*fx+dz*fz)*k]};
 const dot=(a,col,range,hostile,calm,sz=5)=>{const d=Math.hypot(a.x-P.x,a.z-P.z);if(d>R+range*.5)return;const p=T(a.x,a.z),q=T(a.x+Math.sin(a.yaw+(a.hyaw||0)),a.z+Math.cos(a.yaw+(a.hyaw||0))),an=Math.atan2(q[1]-p[1],q[0]-p[0]);
  if(!hostile&&!calm){g.fillStyle=a.aware>.25?'rgba(255,220,80,.28)':'rgba(255,255,255,.14)';g.beginPath();g.moveTo(p[0],p[1]);g.arc(p[0],p[1],range*k*(P.crouch?SENSE.crouchMul:1),an-SENSE.fov,an+SENSE.fov);g.closePath();g.fill()}
  if(d<=R){g.fillStyle=col;g.beginPath();g.arc(p[0],p[1],sz,0,7);g.fill()}};
 for(const w of wolves){if(w.dead)continue;const h=hostileSt(w);dot(w,w.tame?'#7dffb0':h?'#ff5a5a':w.aware>.25?'#ffd84a':'#e8eeff',27,h,w.tame||w.calm>0)}
 for(const o of GOBS)if(!o.dead)dot(o,o.hostile()?'#ff7a3a':'#c7e070',o.big?24:20,o.hostile(),false,o.big?7:5);
 for(const o of CROCS)if(!o.dead)dot(o,o.hostile()?'#ff5a5a':'#6fae6f',18,o.hostile(),false,6);
 for(const o of NPCS)dot(o,'#9fd0ff',16,false,false,4);if(DRAGON&&!DRAGON.dead)dot(DRAGON,'#ff2a2a',58,DRAGON.hostile(),false,9);
 g.fillStyle='#8fd0ff';g.beginPath();g.moveTo(S/2,S/2-8);g.lineTo(S/2+6,S/2+6);g.lineTo(S/2-6,S/2+6);g.closePath();g.fill()}
// ---------- input: named actions; touch buttons and keyboard feed the same actions
function bindInput(){const btn=(id,down,up)=>{const el=$(id);el.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();sfx.on();try{el.setPointerCapture(e.pointerId)}catch(_){}down()});
  if(up){const u=e=>{e.stopPropagation();up()};el.addEventListener('pointerup',u);el.addEventListener('pointercancel',u);el.addEventListener('lostpointercapture',u)}};
 const atkDown=()=>{IN.atkHeld=true;IN.atkAt=GT.clock;IN.atkEdge=true;IN.atkUsed=false;IN.mash=(IN.mash||0)+1},atkUp=()=>{if(IN.atkHeld){IN.atkHeld=false;IN.atkUp=true}};
 btn('bAtk',atkDown,atkUp);btn('bHvy',()=>{press('hvy');IN.atkHeld=true;IN.atkAt=GT.clock-1;IN.atkEdge=false;IN.atkUsed=false;IN.mash=(IN.mash||0)+1},atkUp);btn('bDod',()=>{press('dodge');IN.mash=(IN.mash||0)+1});btn('bJmp',()=>{press('jump');IN.mash=(IN.mash||0)+1});btn('bInt',()=>press('inter'));btn('bSys',()=>toggleWin(P));
 btn('bFlask',()=>drinkFlask());btn('bSkill',()=>useSkill());btn('bRage',()=>startRage());btn('bLock',()=>toggleLock());btn('bBow',()=>useBow());btn('bStance',()=>cycleStance());
 btn('bBlk',()=>{IN.blockHeld=true;IN.mash=(IN.mash||0)+1},()=>{IN.blockHeld=false});btn('bSpr',()=>{P.sprintHeld=true;P.crouch=false},()=>{P.sprintHeld=false});btn('bCrc',()=>{P.crouch=!P.crouch;if(P.crouch)P.sprintHeld=false});
 let jId=null,jx=0,jy=0,lId=null,lx=0,ly=0;const kbg=$('kbg'),kn=$('kn');
 cv.addEventListener('pointerdown',e=>{sfx.on();if(e.clientX<innerWidth*.42&&jId===null){jId=e.pointerId;jx=e.clientX;jy=e.clientY;kbg.style.display='block';kbg.style.left=jx-60+'px';kbg.style.top=jy-60+'px'}else if(lId===null){lId=e.pointerId;lx=e.clientX;ly=e.clientY}});
 addEventListener('pointermove',e=>{if(e.pointerId===jId){let dx=e.clientX-jx,dy=e.clientY-jy,d=Math.hypot(dx,dy);if(d>60){dx*=60/d;dy*=60/d;d=60}kn.style.left=35+dx+'px';kn.style.top=35+dy+'px';const m=d/60>.14?(d/60-.14)/.86:0;IN.mx=d?dx/d*m:0;IN.mz=d?-dy/d*m:0}
  else if(e.pointerId===lId){CAM.yaw-=(e.clientX-lx)*.0052;CAM.pitch=cl(CAM.pitch+(e.clientY-ly)*.004,-.12,1.1);lx=e.clientX;ly=e.clientY}});
 const end=e=>{if(e.pointerId===jId){jId=null;IN.mx=IN.mz=0;kbg.style.display='none';kn.style.left=kn.style.top='35px'}if(e.pointerId===lId)lId=null};addEventListener('pointerup',end);addEventListener('pointercancel',end);
 document.addEventListener('contextmenu',e=>e.preventDefault());const K={};
 const kb=()=>{IN.kx=(K.KeyD?1:0)-(K.KeyA?1:0);IN.kz=(K.KeyW?1:0)-(K.KeyS?1:0)};
 addEventListener('keydown',e=>{if(e.repeat)return;sfx.on();K[e.code]=1;kb();if(e.code==='KeyF'||e.code==='KeyJ')atkDown();if(e.code==='Space'){press('jump');IN.mash=(IN.mash||0)+1;e.preventDefault()}if(e.code==='KeyQ'||e.code==='KeyK'){press('dodge');IN.mash=(IN.mash||0)+1}
  if(e.code==='KeyR'||e.code==='KeyL'){IN.blockHeld=true;IN.mash=(IN.mash||0)+1}if(e.code==='KeyE')press('inter');if(e.code==='KeyH')drinkFlask();if(e.code==='KeyV')useSkill();if(e.code==='KeyG')startRage();if(e.code==='KeyT')toggleLock();if(e.code==='KeyB')useBow();if(e.code==='KeyQ')cycleStance();{const i=['Digit1','Digit2','Digit3','Digit4'].indexOf(e.code);if(i>=0)setStance(STANCE_ORDER[i])}if(e.code==='ShiftLeft'||e.code==='ShiftRight'){P.sprintHeld=true;P.crouch=false}
  if(e.code==='KeyC'){P.crouch=!P.crouch;if(P.crouch)P.sprintHeld=false}if(e.code==='Tab'||e.code==='KeyM'){toggleWin(P);e.preventDefault()}});
 addEventListener('keyup',e=>{K[e.code]=0;kb();if(e.code==='KeyF'||e.code==='KeyJ')atkUp();if(e.code==='KeyR'||e.code==='KeyL')IN.blockHeld=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight')P.sprintHeld=false});
 addEventListener('blur',()=>{IN.atkHeld=false;IN.blockHeld=false;P.sprintHeld=false})}
// ---------- boot + adaptive quality (performance: measure first, then lower resolution, grass, draw distance)
const QUAL={QL:0};
function boot(TX){initGL();buildWorld();buildKnight(TX);buildWolfGeo();buildPlayer(TX);buildFx();spawnWolves();spawnGoblins();spawnPatrols();spawnNpcs();spawnCrocs();dragonInit(TX);buildAltars();buildChests();buildSeals();load();invInit();applyLooks();scaleWorld();spawnBosses();veyraInit();storyInit();checkStances();stanceHud();P.hp=maxHP();if(SYS.altarAt>=0&&ALTARS[SYS.altarAt]){const a=ALTARS[SYS.altarAt];P.x=a.x+1.6;P.z=a.z+1.6}CAM.tx=P.x;CAM.tz=P.z;bindInput();
 // save when the phone hides or closes the tab (mobile browsers kill background tabs)
 addEventListener('visibilitychange',()=>{if(document.hidden)save(P)});addEventListener('pagehide',()=>save(P));
 function size(){const r=Math.min(devicePixelRatio||1,[1.75,1.3,1,.8][QUAL.QL]);cv.width=Math.round(innerWidth*r);cv.height=Math.round(innerHeight*r)}size();addEventListener('resize',size);let fAvg=16,fN=0;const grassFull=grassGeo.n;
 streamForest(P.x,P.z,999);$('load').style.display='none';
 if(SYS.intro){GT.paused=false;$('intro').style.display='none';note('[Sistem] Tekrar hoş geldin, Kara Zırh.')}else{$('intro').style.display='flex';$('introb').addEventListener('click',()=>{sfx.on();SYS.intro=1;$('intro').style.display='none';GT.paused=false;if(!SYS.prologue){SYS.prologue=1;showManhwa(PANELS.prologue(),()=>{note('[Sistem] Sınıf: Kara Zırh. İlk görev: «Uyanış»');save(P)})}
   save(P)})}
 let last=performance.now();
 function frame(now){requestAnimationFrame(frame);const raw=Math.max(0,now-last),dtR=Math.min(raw/1000,.05);last=now;GT.time+=dtR;let dt=dtR;
  fAvg+=(Math.min(raw,100)-fAvg)*.05;if(!window.__noAutoQ&&++fN>150&&fAvg>30&&QUAL.QL<3){QUAL.QL++;fN=0;fAvg=20;size();grassGeo.n=Math.floor(grassFull*[1,1,.5,.25][QUAL.QL]/3)*3}
  if(GT.paused||winOpen)dt=0;else if(GT.stop>0){GT.stop-=dtR;dt=0}else if(GT.slow>0){GT.slow-=dtR;dt*=.3}
  step(dt);render(dtR);if(dt>0||hudT<=0)uiTick(dtR)}
 window.__G={ANIM,HCLIP,CLIP_HIT,clipVal,swordTip,startLight,startHeavy,waterAt,P,IN,CAM,GT,SYS,BUF,wolves,GOBS,NPCS,CROCS,get DRAGON(){return DRAGON},BURNS,QUAL,step,mkWolf,note,TREES,objCount:()=>objs.length,hAt,zoneAt,depthAt,SK,HB,get PM(){return PM},mpt,r3v,press,
  hitPlayer,tdTarget,isWolf,los,canSee,hostileSt,render,clubSeg,segCapsule,crocHead,dBone,dPlay,drawn:()=>drawn,
  X:{makeItem,randomDrop,giveItem,equip,gear,hasFx,weaponDmg,armorDef,stat,salvage,upgrade,upgradeCost,LOOT,dropLoot,lootFor,drinkFlask,itemScore,
   ALTARS,restAt,openTravel,nearAltar,CHESTS,openChest,nearChest,dropBag,SEALS,regionLevel,scaleFoe,
   POSMAX,addPosture,breakFoe,isBroken,execTarget,startExec,gainRage,startRage,SKILLS,useSkill,unlockSkill,checkSkillUnlocks,toggleLock,bossTarget,
   BOSSES,MAIN,curMain,questTarget,questEvent,storyInteract,chooseFate,showManhwa,PANELS,get VEYRA(){return VEYRA},get KING(){return KING},
   dbg:{get PLD(){return PLD},humanGeo,faceTex,promptText,get hudT(){return hudT},crocDef,get VEYM(){return VEYM},WHIP,W_UP,W_LO},
   openWin,renderWin,uiTick,maxHP,useBow,startAssassin,STANCES,setStance,cycleStance,checkStances,curStance,foes,foeHurt,onFoeKilled,interact,save,load,addXP},
  tp(x,z){P.x=x;P.z=z;P.y=hAt(x,z);P.air=false;CAM.tx=x;CAM.tz=z;streamForest(x,z,999)},sim(dt,n){for(let i=0;i<n;i++){GT.time+=dt;step(dt)}}};
 step(0);requestAnimationFrame(frame)}
