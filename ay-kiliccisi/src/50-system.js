// ===================== the System: stats, levels, quests, notifications, windows, save =====================
const $=id=>document.getElementById(id);
const SAVE_V=3,SYS={v:SAVE_V,lowShake:0,lv:1,xp:0,pts:0,str:5,agi:5,vit:5,per:5,kills:0,dodges:0,tamed:0,walked:0,gate:0,knight:0,title:'Yok',titles:[],done:{},meat:2,dodgeLv:1,intro:0,cp:null,gold:0,parries:0,takedowns:0,gkills:0,ckills:0,dragon:0,seenGob:0,seenSwamp:0,seenLair:0};
const maxHP=()=>Math.round(110+(stat('vit')-5)*12+gear('hp')),dmgMul=()=>(1+(stat('str')-5)*.06+gear('dmg')/100)*(SYS.title==='Kurt Avcısı'?1.05:1),spdMul=()=>1+(stat('agi')-5)*.01,iframes=()=>.36+(stat('agi')-5)*.006+(SYS.dodgeLv-1)*.06,radarR=()=>30+(stat('per')-5)*4,xpNeed=()=>60*SYS.lv*SYS.lv+40;
const QUESTS=[
 {id:'wake',name:'Uyanış',desc:'Çimenlerin arasında 40 m yürü',goal:40,get:()=>SYS.walked,xp:20},
 {id:'hunt1',name:'İlk Av',desc:'Bir kurt öldür',goal:1,get:()=>SYS.kills,xp:60},
 {id:'dodge',name:'Kusursuz Kaçınma',desc:'Kurt atlayışından 3 kez kaçın',goal:3,get:()=>SYS.dodges,xp:90,skill:1},
 {id:'hunt5',name:'Sürü Avcısı',desc:'5 kurt öldür',goal:5,get:()=>SYS.kills,xp:150,title:'Kurt Avcısı'},
 {id:'tame',name:'Yoldaş',desc:'Bir kurdu besleyerek evcilleştir',goal:1,get:()=>SYS.tamed,xp:120},
 {id:'gate',name:'Krallığa Yolculuk',desc:'Krallığın kapısına ulaş',goal:1,get:()=>SYS.gate,xp:150},
 {id:'knight',name:'Unutulmuş Şövalye',desc:'Meydandaki şövalye heykeline yaklaş',goal:1,get:()=>SYS.knight,xp:200,title:'Şövalyenin Varisi',pts:5},
 {id:'parry',name:'Kılıçla Savunma',desc:'3 saldırıyı tam zamanında savuştur (BLOK)',goal:3,get:()=>SYS.parries,xp:150},
 {id:'gob',name:'Goblin Tehdidi',desc:'Bir goblin kampında 5 goblin alt et',goal:5,get:()=>SYS.gkills,xp:200,title:'Kamp Yıkıcı'},
 {id:'silent',name:'Sessiz Gölge',desc:'3 sessiz alt etme yap (arkadan)',goal:3,get:()=>SYS.takedowns,xp:220,title:'Gölge Kılıç'},
 {id:'croc',name:'Bataklık Avı',desc:'Sisli Bataklık’ta bir timsah öldür',goal:1,get:()=>SYS.ckills,xp:150},
 {id:'dragon',name:'Ejderin Dağı',desc:'Kuzey dağlarındaki ejderhayı alt et',goal:1,get:()=>SYS.dragon,xp:500}];
function note(txt,cls){const n=$('notes'),d=document.createElement('div');d.className='note '+(cls||'');d.textContent=txt;n.appendChild(d);while(n.children.length>4)n.removeChild(n.firstChild);
 setTimeout(()=>{d.classList.add('out');setTimeout(()=>{if(d.parentNode)d.parentNode.removeChild(d)},400)},3800)}
function addXP(v,P){SYS.xp+=v;while(SYS.xp>=xpNeed()){SYS.xp-=xpNeed();SYS.lv++;SYS.pts+=3;if(P){P.hp=maxHP();P.flash=1}note('[Sistem] Seviye atladın! Seviye '+SYS.lv+' · +3 stat puanı','gold');if(typeof checkSkillUnlocks!=='undefined')checkSkillUnlocks();if(typeof sfx!=='undefined')sfx.level()}}
function checkQuests(P){for(const q of QUESTS){if(SYS.done[q.id]||q.get()<q.goal)continue;SYS.done[q.id]=1;note('[Sistem] Görev tamamlandı: '+q.name+' · +'+q.xp+' XP','gold');
  if(q.title){SYS.titles.push(q.title);SYS.title=q.title;note('[Sistem] Unvan kazanıldı: «'+q.title+'»','gold')}if(q.pts){SYS.pts+=q.pts;note('[Sistem] +'+q.pts+' stat puanı')}
  if(q.skill){SYS.dodgeLv=2;note('[Sistem] Yetenek gelişti: [Kaçınma Lv.2]')}addXP(q.xp,P);save(P)}}
function save(P){try{if(P)SYS.cp=P.cp;localStorage.setItem('kf2_save',JSON.stringify(SYS))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem('kf2_save')||'null');if(s&&typeof s==='object'){for(const k in SYS)if(k in s)SYS[k]=s[k];if((s.v||1)<2){SYS.lowShake=0}SYS.v=SAVE_V}}catch(e){}}
function drawMap(c){const g=c.getContext('2d'),S=c.width,k=S/(WS*2),T=(x,z)=>[(x+WS)*k,(z+WS)*k];g.fillStyle='#24402a';g.fillRect(0,0,S,S);
 const step=28;for(let x=-WS;x<WS;x+=step)for(let z=-WS;z<WS;z+=step){const zn=zoneAt(x+step/2,z+step/2),col={kingdom:'#a08a64',lair:'#4a3434',lake:'#3d6f9a',river:'#3d6f9a',swamp:'#4b5a36',camp:'#8a6a3e',ruins:'#7c7c74',mountain:'#7a7a78',dense:'#1c3a20',forest:'#2f5a30'}[zn];g.fillStyle=col;const p=T(x,z);g.fillRect(p[0],p[1],step*k+1,step*k+1)}
 g.font='bold 10px system-ui';g.fillStyle='#fff';g.textAlign='center';for(const[n,x,z]of[['Krallık',0,0],['Ejderha Yuvası',LAIR[0],LAIR[1]],['Gümüş Göl',LAKE[0],LAKE[1]],['Bataklık',SWAMP[0],SWAMP[1]],['Kara Orman',-1050,700]]){const p=T(x,z);g.fillText(n,p[0],p[1])}
 for(const c2 of CAMPS){const p=T(c2[0],c2[1]);g.fillStyle='#ffb35a';g.fillText('⚑',p[0],p[1])}for(const r of RUINS){const p=T(r[0],r[1]);g.fillStyle='#ddd';g.fillText('▦',p[0],p[1])}
 ALTARS.forEach((a,i)=>{const q=T(a.x,a.z);g.fillStyle=SYS.altars&&SYS.altars[i]?'#ff5040':'#6a4a50';g.fillText('▲',q[0],q[1]+4)});const tg=questTarget();if(tg){const q=T(tg[0],tg[1]);g.fillStyle='#ffd76a';g.font='bold 16px system-ui';g.fillText('◆',q[0],q[1]+5)}if(SYS.bag){const q=T(SYS.bag.x,SYS.bag.z);g.fillStyle='#ffc040';g.fillText('$',q[0],q[1]+4)}
 const p=T(P.x,P.z);g.fillStyle='#8fd0ff';g.beginPath();g.arc(p[0],p[1],4,0,7);g.fill();g.strokeStyle='#fff';g.stroke()}
function hud(P){$('hpf').style.width=cl(P.hp/maxHP()*100,0,100)+'%';$('hpt').textContent=Math.ceil(P.hp)+' / '+maxHP();$('stf').style.width=cl(P.sta,0,100)+'%';$('stf').style.opacity=P.exhausted?.45:1;$('gdf').style.width=cl(P.guard,0,100)+'%';$('gdf').style.background=P.st==='gbreak'||P.guard<25?'linear-gradient(90deg,#844,#a66)':'';
 $('xpf').style.width=cl(SYS.xp/xpNeed()*100,0,100)+'%';$('lvt').textContent='Sv. '+SYS.lv+(SYS.pts?' · +'+SYS.pts+' puan':'');$('meat').textContent='Et '+SYS.meat+' · Altın '+(SYS.gold||0);
 const q=curMain(),tg=questTarget();$('quest').innerHTML='<b>GÖREV · '+q.t+'</b><br>'+(typeof q.d==='function'?q.d():q.d)+(tg?' <span>'+Math.round(Math.hypot(tg[0]-P.x,tg[1]-P.z))+' m</span>':'')}
let winOpen=false;
let winTab='durum',winSel=null;
function openWin(tab){winTab=tab||winTab;winSel=null;if(!winOpen){winOpen=true;$('win').style.display='flex'}renderWin(P)}
function renderWin(P){const tabs=[['durum','DURUM'],['envanter','ENVANTER'],['yetenek','YETENEK'],['gorev','GÖREV'],['harita','HARİTA'],['demirci','DEMİRCİ'],['ayar','AYAR']];
 let h='<div class="tabs">'+tabs.map(([k,n])=>'<button class="tab'+(k===winTab?' on':'')+'" data-tab="'+k+'">'+n+'</button>').join('')+'</div>';
 const row=(k,n,d)=>'<div class="st"><span>'+n+'</span><b>'+SYS[k]+(gear(k)?'<small>+'+Math.round(gear(k))+'</small>':'')+'</b><i>'+d+'</i>'+(SYS.pts>0?'<button data-k="'+k+'">+</button>':'')+'</div>';
 const rc=r=>'style="color:'+RAR[r].c+'"';
 if(winTab==='durum'){h+='<div class="wt">DURUM PENCERESİ</div><div class="wr"><span>İsim</span><b>Kael Varn</b></div><div class="wr"><span>Sınıf</span><b>Kara Zırh</b></div><div class="wr"><span>Unvan</span><b>'+SYS.title+'</b></div>'+
  '<div class="wr"><span>Seviye</span><b>'+SYS.lv+'</b></div><div class="wr"><span>XP</span><b>'+SYS.xp+' / '+xpNeed()+'</b></div><div class="wr"><span>Can</span><b>'+Math.ceil(P.hp)+' / '+maxHP()+'</b></div>'+
  '<div class="wr"><span>Silah hasarı</span><b>'+Math.round(weaponDmg()*dmgMul())+'</b></div><div class="wr"><span>Zırh</span><b>'+Math.round(armorDef())+' <small>(-%'+Math.round(100-10000/(100+armorDef()))+' hasar)</small></b></div>'+
  '<div class="wr"><span>Altın · Demir</span><b>'+(SYS.gold||0)+' · '+SYS.shards+'</b></div><div class="wr"><span>İksir</span><b>'+SYS.flasks+'/'+SYS.flaskMax+'</b></div>'+
  '<div class="wt2">STATLAR'+(SYS.pts?' · dağıtılacak '+SYS.pts+' puan':'')+'</div>'+row('str','Güç','hasar +%6')+row('agi','Çeviklik','hız, kaçınma')+row('vit','Dayanıklılık','can +12')+row('per','Algı','radar menzili')+
  (SYS.veyraFate==='freed'?'<div class="wt2">VEYRA</div><div class="wr"><span>Güven</span><b>'+(SYS.trust||0)+'</b></div>':'')}
 if(winTab==='envanter'){const slots=[['weapon','Silah'],['armor','Zırh'],['charm','Tılsım'],['ring','Yüzük']];
  h+='<div class="wt">KUŞANILANLAR</div>'+slots.map(([k,n])=>{const it=eqItem(k);return'<div class="slot" data-id="'+(it?it.id:'')+'"><span>'+n+'</span><b '+(it?rc(it.rar):'')+'>'+(it?it.name+(it.up?' +'+it.up:''):'—')+'</b></div>'}).join('');
  const bag=SYS.inv.filter(i=>!Object.values(SYS.eq).includes(i.id)).sort((a,b)=>b.rar-a.rar||itemScore(b)-itemScore(a));h+='<div class="wt2">ÇANTA ('+bag.length+'/48) · demir parçası: '+SYS.shards+'</div>';
  h+=bag.map(it=>'<div class="item'+(winSel===it.id?' sel':'')+'" data-id="'+it.id+'"><b '+rc(it.rar)+'>'+it.name+(it.up?' +'+it.up:'')+'</b><i>Sv.'+it.lv+' · '+({weapon:'Silah',armor:'Zırh',charm:'Tılsım',ring:'Yüzük'})[it.slot]+'</i></div>').join('')||'<div class="sk">Çanta boş. Düşmanlar ve sandıklar eşya düşürür.</div>';
  const sel=SYS.inv.find(i=>i.id===winSel);if(sel){const cur=eqItem(sel.slot),eq=cur&&cur.id===sel.id;h+='<div class="det"><b '+rc(sel.rar)+'>'+sel.name+'</b> <small>'+RAR[sel.rar].n+' · Sv.'+sel.lv+'</small><br>'+itemLines(sel).join('<br>')+
   (cur&&!eq?'<br><small>Şu an: '+cur.name+' — '+itemLines(cur).slice(0,2).join(', ')+'</small>':'')+'<div class="btns">'+(eq?'':'<button data-act="eq">KUŞAN</button><button data-act="sal">PARÇALA</button>')+'</div></div>'}}
 if(winTab==='yetenek'){h+='<div class="wt">YETENEKLER</div><div class="sk">YETENEK düğmesi seçili yeteneği kullanır. ÖFKE çubuğu dolunca ÖFKE düğmesi belirir.</div>'+Object.entries(SKILLS).map(([k,v])=>{const on=(SYS.skills||{})[k];return'<div class="item'+(SYS.skill===k?' sel':'')+'" data-skill="'+(on?k:'')+'"><b style="color:'+(on?'#ffd76a':'#777')+'">'+v.n+(SYS.skill===k?' ✓':'')+'</b><i>'+(on?v.d+' · '+v.cost+' dayanıklılık · '+v.cd+' sn':'Kilitli: '+v.how)+'</i></div>'}).join('')+
  '<div class="wt2">TEMEL HAREKETLER</div><div class="sk">[Hafif kombo] · [Ağır: SALDIR basılı] · [Koşarak] · [Zıplayarak] · [Blok + Savuşturma] · [Denge kırıp İNFAZ] · [Sessiz alt etme] · [Öfke]</div>'}
 if(winTab==='gorev'){const q=curMain();h+='<div class="wt">ANA GÖREV</div><div class="qs"><b>◆ '+q.t+'</b> — '+(typeof q.d==='function'?q.d():q.d)+'</div>'+MAIN.slice(0,SYS.main).map(m=>'<div class="qs dn">✔ '+m.t+'</div>').join('')+
  '<div class="wt2">YAN GÖREVLER</div><div class="qs'+(SYS.q_pelts===2?' dn':'')+'">'+(SYS.q_pelts===2?'✔':'◆')+' Avcı Lena: kurt postları '+(SYS.q_pelts?(SYS.pelts||0)+'/3':'(köyde Lena ile konuş)')+'</div>'+
  (SYS.q_legacy?'<div class="qs'+(SYS.q_legacy===2?' dn':'')+'">'+(SYS.q_legacy===2?'✔':'◆')+' Ustanın Mirası: mühürler '+Object.keys(SYS.seals||{}).length+'/3 (harabeler)</div>':'<div class="qs">◆ Rahibe Mira bir sır biliyor</div>')+
  '<div class="wt2">BAŞARIMLAR</div>'+QUESTS.map(x=>'<div class="qs'+(SYS.done[x.id]?' dn':'')+'">'+(SYS.done[x.id]?'✔ ':'◆ ')+x.name+' — '+x.desc+' ('+Math.min(x.goal,Math.floor(x.get()))+'/'+x.goal+')</div>').join('')}
 if(winTab==='harita'){h+='<div class="wt">HARİTA</div><canvas id="wmap" width="300" height="300" style="width:100%;max-width:340px;display:block;margin:0 auto;border:1px solid var(--line);border-radius:6px"></canvas><div class="sk">Kırmızı alev: yakılmış sunak (dinlen ve hızlı yolculuk) · sarı: görev · altın: düşürdüğün kese</div>'}
 if(winTab==='demirci'){const near=ROLES.smith&&Math.hypot(ROLES.smith.x-P.x,ROLES.smith.z-P.z)<5;h+='<div class="wt">DEMİRCİ HASK</div>'+(near?'':'<div class="sk">Yükseltme için köydeki demirciye git (kalenin kuzey kapısı).</div>')+
  ['weapon','armor','charm','ring'].map(k=>{const it=eqItem(k);if(!it)return'';const c=upgradeCost(it);return'<div class="item"><b '+rc(it.rar)+'>'+it.name+' +'+it.up+'</b><i>'+itemLines(it).slice(0,2).join(', ')+'</i>'+(near&&it.up<5?'<button data-up="'+it.id+'">YÜKSELT · '+c.gold+' altın, '+c.shards+' demir</button>':'')+'</div>'}).join('')+'<div class="sk">Zırh +3: gümüş kakma ve perçinler · +5: altın hilal ve ay taşları görünür.</div><div class="sk">Altın: '+(SYS.gold||0)+' · Demir parçası: '+SYS.shards+' (eşya parçalayarak kazanılır)</div>'}
 if(winTab==='ayar'){h+='<div class="wt">AYARLAR</div><div class="wr"><span>Sarsıntıyı azalt</span><button id="shk">'+(SYS.lowShake?'AÇIK':'KAPALI')+'</button></div><div class="wr"><span>Otomatik kuşan</span><button id="aeq">'+(SYS.autoEq===0?'KAPALI':'AÇIK')+'</button></div>'+
  '<div class="wt2">MODELLER VE LİSANSLAR</div><div class="cr" style="opacity:.85;font-size:11px;line-height:1.4">Kahraman Kael: iskelet oranları «Berserk Armor» (Angy97, CC BY 4.0) modelinden alındı; zırh, miğfer, pelerin ve kılıç bu oyun için kodla tasarlandı.<br>'+
  'Şeytan Kral: «body base low poly elf» — Yamato (Sketchfab), CC BY 4.0; saç: «Long reddish hair for game» — CarlosTorresVFX (Sketchfab), CC BY 4.0.<br>'+
  'Veyra: iskelet oranları «Kawaiope» (chained_tan, CC BY 4.0); görünüş bu oyun için kodla tasarlandı.<br>Şeytan Kral oranları: «Aldrich» (9S, CC BY 4.0) iskeletinden ölçüldü.<br>'+
  'Ejderha: «Tarisland - Dragon (High Poly)» — Doctor A. (Sketchfab), CC BY 4.0; oyuncunun eklediği model, sadeleştirildi. Not: tasarım Tarisland oyununa aittir.<br>'+
  'Meydan heykeli: «The Forgotten Knight» — dark_igorek, CC BY 4.0.<br>Kurtlar, goblinler, köylüler, timsahlar, dünya ve sesler: bu oyun için kodla üretildi.</div>'}
 $('winb').innerHTML=h+'<button id="winx">KAPAT</button>';
 $('winb').querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{winTab=b.dataset.tab;winSel=null;renderWin(P)}));
 $('winb').querySelectorAll('button[data-k]').forEach(b=>b.addEventListener('click',()=>{if(SYS.pts>0){SYS[b.dataset.k]++;SYS.pts--;if(b.dataset.k==='vit')P.hp+=12;save(P);renderWin(P)}}));
 $('winb').querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>{const id=+b.dataset.id;if(id){winSel=id;winTab='envanter';renderWin(P)}}));
 $('winb').querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>{const it=SYS.inv.find(i=>i.id===winSel);if(!it)return;if(b.dataset.act==='eq')equip(it);else salvage(it);winSel=null;renderWin(P)}));
 $('winb').querySelectorAll('[data-skill]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.skill){SYS.skill=b.dataset.skill;save(P);renderWin(P)}}));
 $('winb').querySelectorAll('[data-up]').forEach(b=>b.addEventListener('click',()=>{const it=SYS.inv.find(i=>i.id===+b.dataset.up);if(it)upgrade(it);renderWin(P)}));
 const sh=$('shk');if(sh)sh.addEventListener('click',()=>{SYS.lowShake=SYS.lowShake?0:1;save(P);renderWin(P)});const ae=$('aeq');if(ae)ae.addEventListener('click',()=>{SYS.autoEq=SYS.autoEq===0?1:0;save(P);renderWin(P)});
 $('winx').addEventListener('click',()=>toggleWin(P));try{if($('wmap'))drawMap($('wmap'))}catch(e){}}
function toggleWin(P){winOpen=!winOpen;$('win').style.display=winOpen?'flex':'none';if(winOpen)renderWin(P)}
