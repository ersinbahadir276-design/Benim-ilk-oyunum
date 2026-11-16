// ===================== animated manhwa scenes =====================
// Every story strip plays as a small film inside the engine: the camera glides through each panel, characters are
// posed and can move during the shot, fire and capes keep animating, and the text types itself in manhwa boxes
// (narration, speech with the speaker's name, blue System windows, the armour's red whisper). Tap ▶ for the next
// panel, ATLA to skip. A strip that arrives while another is playing waits its turn.
const CINE={on:false,shots:[],i:0,t:0,done:null,choice:false},MHQ=[];
const FREE_PANELS=()=>[{h:.65,st:{eye:[SHRINE.x+2.5,1.6,SHRINE.z+2.2],at:[SHRINE.x,1,SHRINE.z],env:DUSK,setup:()=>{VEYRA.forcePose={LsX:-.3,RsX:-.4,hdP:-.1}},teardown:()=>{VEYRA.forcePose=null}},say:[{who:'Veyra',txt:'Neden?.. Ben bir iblisim.'},{who:'Kael',txt:'Bu sefer başka türlü bitecek.'}]}];
const KILL_PANELS=()=>[{h:.55,black:true,whisper:'Güzel.',sys:['Hırlayan güçlendi: Öfke daha hızlı dolar.']}];
function showManhwa(panels,done){if(CINE.on){MHQ.push([panels,done]);return}const ov=$('manhwa');Object.assign(CINE,{on:true,shots:panels,i:-1,t:0,done,choice:panels.some(p=>p.choice)});GT.inStory=true;GT.paused=true;document.body.classList.add('incine');
 ov.className='cine';ov.style.display='block';ov.innerHTML='<div class="cn-black"></div><div class="cn-flash"></div><div class="cn-bar t"></div><div class="cn-bar b"><b class="cn-who"></b><span class="cn-txt"></span></div><div class="cn-nar"></div><div class="cn-sys"></div><div class="cn-w"></div><div class="mh-ch" style="display:none"><button id="mhFree">Zincirlerini kır</button><button id="mhKill">Kılıcını indir</button></div><button class="mh-skip">ATLA</button><button class="mh-next">▶</button><div class="cn-dots"></div>';
 ov.querySelector('.mh-next').onclick=()=>cineNext(true);ov.querySelector('.mh-skip').onclick=()=>{if(CINE.choice){const k=CINE.shots.findIndex(p=>p.choice);if(CINE.i<k){CINE.i=k-1;CINE.t=1e9;cineNext(false)}}else cineEnd()};
 $('mhFree').onclick=()=>{const d=CINE.done;CINE.done=null;cineEnd(true);chooseFate(true);showManhwa(FREE_PANELS(),()=>{note('[Görev] Kül Kanat: kuzeydeki ejderhayı yen.','gold');if(d)d()})};
 $('mhKill').onclick=()=>{const d=CINE.done;CINE.done=null;cineEnd(true);chooseFate(false);showManhwa(KILL_PANELS(),()=>{note('[Görev] Kül Kanat: kuzeydeki ejderhayı yen.','gold');if(d)d()})};
 cineNext(true)}
function cineLines(p){const L=[];if(p.nar)L.push(['nar',p.nar+(p.nar2?' '+p.nar2:'')]);for(const s of p.say||[])L.push(['say',s.txt,s.who]);if(p.sys)L.push(['sys',p.sys.map(t=>'[Sistem] '+t).join('\n')]);if(p.whisper)L.push(['w',p.whisper]);return L}
function cineNext(byTap){const ov=$('manhwa');if(!CINE.on)return;const cur=CINE.shots[CINE.i];
 if(cur&&byTap&&CINE.t<CINE.dur-.05&&CINE.t<CINE.textEnd){CINE.t=CINE.textEnd;return}                              // first tap finishes the text, the next one moves on
 if(cur&&cur.choice){ov.querySelector('.mh-ch').style.display='flex';ov.querySelector('.mh-next').style.display='none';ov.querySelector('.mh-skip').style.display='none';return}
 if(CINE.i>=CINE.shots.length-1){cineEnd();return}CINE.i++;CINE.t=0;const p=CINE.shots[CINE.i];CINE.lines=cineLines(p);let n=0;CINE.at=CINE.lines.map(l=>{const a=n;n+=l[1].length/34+.7;return a});CINE.textEnd=n;CINE.dur=Math.max(3.4,n+1.6);
 ov.querySelector('.cn-black').style.display=p.black?'block':'none';const f=ov.querySelector('.cn-flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
 ov.querySelector('.cn-dots').textContent=CINE.shots.map((_,k)=>k===CINE.i?'●':'○').join(' ');if(p.whisper||p.sys)sfx.charge&&sfx.charge()}
function cineEnd(silent){const ov=$('manhwa'),d=CINE.done;CINE.on=false;CINE.done=null;ov.style.display='none';ov.innerHTML='';ov.className='';document.body.classList.remove('incine');GT.inStory=false;GT.paused=false;streamForest(P.x,P.z,99);
 if(!silent&&d)d();if(MHQ.length&&!silent){const[p,dn]=MHQ.shift();setTimeout(()=>showManhwa(p,dn),60)}}
// one frame of the film: camera move, staged actors, typed text
function cineFrame(dt){const p=CINE.shots[CINE.i],ov=$('manhwa');if(!p)return;CINE.t+=dt;const u=cl(CINE.t/CINE.dur,0,1),e=u*u*(3-2*u);
 const show=(sel,txt)=>{const el=ov.querySelector(sel);if(el.textContent!==txt)el.textContent=txt;el.style.display=txt?'block':'none'};let nar='',who='',say='',sys='',w='';
 CINE.lines.forEach((l,k)=>{const tt=CINE.t-CINE.at[k];if(tt<0)return;const txt=l[1].slice(0,Math.floor(tt*34));if(l[0]==='nar')nar=txt;else if(l[0]==='say'){who=l[2];say=txt}else if(l[0]==='sys')sys=txt;else w=txt});
 show('.cn-nar',nar);show('.cn-who',who);show('.cn-txt',say);show('.cn-sys',sys);show('.cn-w',w);
 if(!p.black&&p.st)cineDraw(p.st,e,u);if(CINE.t>=CINE.dur+(p.choice?0:.6))cineNext(false)}
function cineDraw(st,e,u){const rel=q=>st.abs?q:[q[0],q[1]+hAt(q[0],q[2]),q[2]],e0=rel(st.eye),a0=rel(st.at),save={x:P.x,z:P.z,y:P.y,yaw:P.yaw,ps:P.ps,rag:Object.assign({},P.rag),lift:P.lift};
 // slow push-in with a little sideways drift (or an explicit second camera position)
 const dir=vsub(a0,e0),side=vnorm(vcross(dir,[0,1,0])),eye=st.eye1?rel(st.eye1).map((v,i)=>lp(e0[i],v,e)):vadd(vadd(e0,vmul(dir,.11*e)),vmul(side,(e-.5)*.14*Math.hypot(dir[0],dir[1],dir[2]))),at=st.at1?rel(st.at1).map((v,i)=>lp(a0[i],v,e)):a0,fov=(st.fov||50)*(1-.04*e)*PI/180;
 try{if(st.hero){const h=st.hero;P.x=h.x;P.z=h.z;P.y=hAt(P.x,P.z);P.yaw=h.yaw;const pose=Object.assign({},POSE0,h.pose||{});if(h.pose1)for(const k in h.pose1)pose[k]=lp(pose[k]||0,h.pose1[k],e);pose.chX=(pose.chX||0)+Math.sin(GT.time*1.6)*.02;P.ps=pose;P.rag.ang=lp(h.lie||0,h.lie1===undefined?(h.lie||0):h.lie1,e);P.rag.fx=0;P.rag.fz=-1}
  applyPose(P.ps);PM=playerMatrix(0);if(st.hero&&st.hero.lie)PM[13]+=.12;for(const o of pObjs){o.M=PM;o.flash=0;o.vis=!st.noHero}
  if(st.setup)st.setup(e,u);streamForest(at[0],at[2],99);
  const L=mlook(eye,at,[0,1,0]),VP=mmul(mpersp(fov,cv.width/cv.height,.25,620),L.m),env=Object.assign({fogC:[.6,.72,.85],sun:[1,1,1],fog:[60,300],focus:at},st.env||{}),light=vnorm(vadd(vadd(vmul(L.r,-.45),vmul(L.u,.62)),vmul(L.f,-.62)));
  for(const f of FIRE_PROPS)if(f.vis){const k=1+Math.sin(GT.time*11+f.M[12])*.1;f.M[5]*=k}
  updateScenery(GT.time,0,env,eye);skinAll();drawWolves(P,GT.time);drawGobs(GT.time);drawNpcs(GT.time);drawCrocs(GT.time);drawDragon();drawVeyra(GT.time);drawKing();drawAll(VP,eye,light,GT.time,env)}
 finally{if(st.teardown)st.teardown();for(const o of pObjs)o.vis=true;Object.assign(P,{x:save.x,z:save.z,y:save.y,yaw:save.yaw,ps:save.ps,lift:save.lift});P.rag=save.rag}}
