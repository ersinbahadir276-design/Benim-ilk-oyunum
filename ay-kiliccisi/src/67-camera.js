// ===================== CAMERA + MOBILE CONTROLS (v20 phase 4) =====================
// Settings (saved): look speed horizontal/vertical, invert vertical, camera distance (also pinch), button size.
// Touch: the left part of the screen is the stick, the rest is the camera; every finger is tracked on its own, so walking,
// looking and pressing buttons work at the same time. Two fingers on the camera side pinch to zoom.
// Lock-on: R3 locks; a quick sideways flick on the camera side switches to the next target that way; when the target
// dies the lock moves to the nearest fighting foe. The lock turns the camera softly and yields while you drag.
// The camera never sits inside a tree crown or behind a trunk, pulls back a little in a group fight, and attacks from
// outside the view are shown as red arrows on the screen edge.
const camSet=()=>SYS.cam||(SYS.cam={sx:1,sy:1,inv:0,dist:4.8,bs:1});
function camInit(){SYS.cam=Object.assign({sx:1,sy:1,inv:0,dist:4.8,bs:1},SYS.cam||{});CAM.dist=SYS.cam.dist;hudApply()}
// ---------- target switching
function lockCands(){return foes().filter(f=>!f.dead&&Math.hypot(f.x-P.x,f.z-P.z)<28&&!(f.alt&&f.alt()>8))}
function switchLock(dir){const cur=P.focus&&!P.focus.dead?P.focus:null;if(!cur){const f=nearestFoe(14,PI);if(f){P.focus=f;sfx.lock();floatText(f.x,(f.y||0)+2,f.z,'ODAK','')}return}const ac=angd(Math.atan2(cur.x-P.x,cur.z-P.z),CAM.yaw);let best=null,bd=1e9;
 for(const f of lockCands()){if(f===cur)continue;const a=angd(Math.atan2(f.x-P.x,f.z-P.z),CAM.yaw),da=(a-ac)*-dir;if(da<=.02)continue;const s=da+Math.hypot(f.x-P.x,f.z-P.z)*.02;if(s<bd){bd=s;best=f}}
 if(best){P.focus=best;sfx.lock();floatText(best.x,(best.y||0)+2,best.z,'ODAK','')}}
function relock(){P.lock=null;return;let best=null,bd=15;for(const f of lockCands()){if(!foeHostile(f))continue;const d=Math.hypot(f.x-P.x,f.z-P.z);if(d<bd){bd=d;best=f}}P.lock=best;if(best)sfx.lock()}
// ---------- obstacles: tree crowns and trunks between the hero and the camera
function camTree(eye,tg){const cx=Math.floor(eye[0]/TG),cz=Math.floor(eye[2]/TG);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=treeGrid.get((cx+i+200)*1000+cz+j+200);if(!a)continue;
  for(const t of a){if(t.h<3)continue;const gy=hAt(t.x,t.z),de=Math.hypot(eye[0]-t.x,eye[2]-t.z);if(t.r>.9){if(de<t.r+.35&&eye[1]<gy+t.r*1.6)return true}// a rock: just not inside it
   else if(de<2.4&&eye[1]>gy+1.4&&eye[1]<gy+t.h+2)return true;// inside a crown
   for(const k of[.35,.6,.85]){const px=lp(tg[0],eye[0],k),pz=lp(tg[2],eye[2],k);if(Math.hypot(px-t.x,pz-t.z)<t.r+.35)return true}}}// a trunk in between
 return false}
// ---------- group-fight framing
function camFrame(dtR){let n=0;for(const f of foes())if(foeHostile(f)&&Math.hypot(f.x-P.x,f.z-P.z)<9)n++;CAM.fr=lp(CAM.fr||1,n>=2?1.18:1,Math.min(1,dtR*1.5));return CAM.fr}
// ---------- threats outside the view: red arrows on the screen edge
let thrEls=[];
function threatTell(f){return isWolf(f)?(f.st==='windup'||f.st==='bitewind'||f.st==='rush'||f.st==='pounce'):(f.st==='windup'||f.st==='aim'||f.st==='strike')}
function updateThreats(){const box=$('threats');if(!box)return;box.style.display='none';return;let i=0;
 for(const f of foes()){const d=Math.hypot(f.x-P.x,f.z-P.z);if(d>16||!threatTell(f))continue;const s=project(f.x,(f.y||0)+1,f.z),inView=s&&s[0]>30&&s[0]<innerWidth-30&&s[1]>30&&s[1]<innerHeight-30;if(inView)continue;
  const a=angd(Math.atan2(f.x-P.x,f.z-P.z),CAM.yaw),rx=innerWidth/2-46,ry=innerHeight/2-46,x=innerWidth/2-Math.sin(a)*rx,y=innerHeight/2-Math.cos(a)*ry;
  let e=thrEls[i];if(!e){e=document.createElement('div');e.className='thr';box.appendChild(e);thrEls[i]=e}i++;e.style.display='block';e.style.left=x+'px';e.style.top=y+'px';e.style.transform='translate(-50%,-50%) rotate('+(-a)+'rad)';e.textContent='▲'}
 for(;i<thrEls.length;i++)thrEls[i].style.display='none'}
// ---------- HUD editor: drag buttons, bigger/smaller, reset; saved per device and per orientation
const HUDKEY='kf2_hud';
function hudLoad(){try{return JSON.parse(localStorage.getItem(HUDKEY)||'{}')||{}}catch(e){return{}}}
function hudSave(h){try{localStorage.setItem(HUDKEY,JSON.stringify(h))}catch(e){}}
const hudOri=()=>innerHeight>innerWidth?'port':'land';
function hudApply(){const h=hudLoad(),pos=h[hudOri()]||{};document.documentElement.style.setProperty('--bs',String(h.bs||camSet().bs||1));
 for(const b of document.querySelectorAll('.btn')){if(!b.id)continue;if(!b.dataset.home)b.dataset.home=b.getAttribute('style')||'';const p=pos[b.id];
  if(p){b.setAttribute('style',b.dataset.home);b.style.right='auto';b.style.bottom='auto';b.style.left=(p[0]*innerWidth)+'px';b.style.top=(p[1]*innerHeight)+'px'}else b.setAttribute('style',b.dataset.home)}}
let hudDrag=null;
function hudEdit(on){document.body.classList.toggle('hudedit',on);let bar=$('hudbar');
 if(on&&!bar){bar=document.createElement('div');bar.id='hudbar';bar.innerHTML='<b>DÜĞMELERİ DÜZENLE</b> sürükle · <button data-a="m">− küçült</button><button data-a="p">+ büyüt</button><button data-a="r">sıfırla</button><button data-a="d">BİTTİ</button>';document.body.appendChild(bar);
  bar.addEventListener('pointerdown',e=>{e.stopPropagation();const a=e.target.dataset&&e.target.dataset.a;if(!a)return;const h=hudLoad();
   if(a==='m'||a==='p'){h.bs=cl(+((h.bs||1)+(a==='p'?.1:-.1)).toFixed(2),.7,1.5);SYS.cam.bs=h.bs;hudSave(h);hudApply()}else if(a==='r'){delete h[hudOri()];h.bs=1;SYS.cam.bs=1;hudSave(h);hudApply()}else if(a==='d'){hudEdit(false);save(P)}})}
 if(bar)bar.style.display=on?'flex':'none';GT.paused=on?true:!!winOpen}
function hudBind(){document.addEventListener('pointerdown',e=>{if(!document.body.classList.contains('hudedit'))return;const b=e.target.closest&&e.target.closest('.btn');if(!b||!b.id)return;e.preventDefault();e.stopPropagation();
  const r=b.getBoundingClientRect();hudDrag={b,id:e.pointerId,ox:e.clientX-r.left,oy:e.clientY-r.top}},true);
 addEventListener('pointermove',e=>{if(!hudDrag||e.pointerId!==hudDrag.id)return;const b=hudDrag.b,x=cl(e.clientX-hudDrag.ox,0,innerWidth-40),y=cl(e.clientY-hudDrag.oy,0,innerHeight-40);b.style.right='auto';b.style.bottom='auto';b.style.left=x+'px';b.style.top=y+'px'},true);
 addEventListener('pointerup',e=>{if(!hudDrag||e.pointerId!==hudDrag.id)return;const b=hudDrag.b,h=hudLoad(),o=hudOri();h[o]=h[o]||{};h[o][b.id]=[parseFloat(b.style.left)/innerWidth,parseFloat(b.style.top)/innerHeight];hudSave(h);hudDrag=null},true);
 addEventListener('resize',()=>{if(!hudDrag)hudApply()})}
// ---------- settings rows (SİSTEM → AYAR)
function camSettingsHtml(){const c=camSet(),row=(id,t,v)=>'<div class="wr"><span>'+t+'</span><span><button data-cs="'+id+'" data-d="-1">−</button> <b style="display:inline-block;min-width:40px;text-align:center">'+v+'</b> <button data-cs="'+id+'" data-d="1">+</button></span></div>';
 return'<div class="wt2">KAMERA VE KONTROLLER</div>'+row('sx','Kamera hızı (yatay)',c.sx.toFixed(1))+row('sy','Kamera hızı (dikey)',c.sy.toFixed(1))+row('dist','Kamera uzaklığı',c.dist.toFixed(1)+' m')+row('bs','Düğme boyutu',Math.round((hudLoad().bs||c.bs)*100)+'%')+
  '<div class="wr"><span>Dikey bakışı ters çevir</span><button data-cs="inv">'+(c.inv?'AÇIK':'KAPALI')+'</button></div><div class="wr"><span>Düğmelerin yerini değiştir</span><button data-cs="edit">DÜZENLE</button></div>'+
  '<div class="sk" style="font-size:11px;opacity:.8">İki parmakla sıkıştır = yakınlaştır. Hedef kilitliyken kamera tarafında hızlıca sağa/sola kaydır = hedef değiştir.</div>'}
function camSettingsBind(root){for(const b of root.querySelectorAll('[data-cs]'))b.addEventListener('click',()=>{const k=b.dataset.cs,d=+(b.dataset.d||0),c=camSet();
  if(k==='sx'||k==='sy')c[k]=cl(+(c[k]+d*.1).toFixed(1),.3,2.5);else if(k==='dist'){c.dist=cl(+(c.dist+d*.3).toFixed(1),2.6,8);CAM.dist=c.dist}else if(k==='bs'){const h=hudLoad();h.bs=cl(+((h.bs||c.bs)+d*.1).toFixed(2),.7,1.5);c.bs=h.bs;hudSave(h);hudApply()}
  else if(k==='inv')c.inv=c.inv?0:1;else if(k==='edit'){toggleWin(P);hudEdit(true);return}save(P);renderWin(P)})}
