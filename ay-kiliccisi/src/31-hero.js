// ===================== Kael, the Black Armor: our own armour design on the berserk_armor proportions =====================
// Blackened plate, horned helm with a burning eye slit, wolf-fur mantle, tattered cape and a huge two-handed sword.
// Plates are rigid on their bone; joints get blended under-layers so nothing tears when limbs bend.
const HERO={};
function heroBuild(){const RIG=makeHumanRig(heroProportions());
 // extra bones for the cape (driven procedurally in applyPose)
 const uc=RIG.hum.upperChest,hips=RIG.hum.hips,shY=RIG.bones[RIG.hum.leftUpperArm].r[1];
 const cA=RIG.bones.push({n:'CapeA',p:uc,r:[0,shY-.02,-.2]})-1,cB=RIG.bones.push({n:'CapeB',p:cA,r:[0,1.12,-.25]})-1,cC=RIG.bones.push({n:'CapeC',p:cB,r:[0,.66,-.28]})-1;
 RIG.hum.capeA=cA;RIG.hum.capeB=cB;RIG.hum.capeC=cC;return RIG}
// palette: blackened steel, worn edges, oxblood, old bronze, leather
const KC={iron:[.17,.18,.21],mid:[.25,.26,.3],edge:[.42,.43,.49],dark:[.08,.08,.1],red:[.5,.07,.08],bronze:[.42,.32,.18],leather:[.22,.15,.11],fur:[.16,.15,.15],bone:[.62,.58,.5]};
// sculpted hero (tools/sculpt/models/hero.mjs): one CPU-skinned mesh with gloss/metal/glow channels
function heroMesh(TX){const m=MODEL.hero;if(!m)return heroMeshOld(TX);const nv=m.nv,J=new Uint8Array(nv*4);for(let i=0;i<nv*4;i++)J[i]=m.J[i];
 const ob=addSkin({P:m.P,N:m.N,C:m.C,M:m.M,U:new Float32Array(nv*2),W:new Float32Array(nv),I:m.I},J,m.K,{out:.0035,outCol:[.03,.03,.045],shade:1,pbr:1});
 HERO.armor=ob;HERO.cape=null;HERO.glow={set col(v){ob.em=v;if(HERO.overlay)HERO.overlay.em=v},get col(){return ob.em}}}
function heroMeshOld(TX){const B=PLD.bones,H=HB,P=i=>B[i].r,parts={armor:[],cape:[],glow:[]};
 // weights: fn(x,y,z) -> [[bone,w],...]
 const W=(g,fn)=>{const nv=g.P.length/3,J=new Uint8Array(nv*4),Wt=new Float32Array(nv*4);for(let i=0;i<nv;i++){const l=fn(g.P[i*3],g.P[i*3+1],g.P[i*3+2]);for(let k=0;k<l.length&&k<4;k++){J[i*4+k]=l[k][0];Wt[i*4+k]=l[k][1]}}g.J4=J;g.W4=Wt;return g};
 const rig=(g,b,col)=>{if(col)tint(g,col);parts.armor.push(W(g,()=>[[b,1]]));return g};
 const blend=(g,b0,b1,a0,a1,axis,col)=>{if(col)tint(g,col);parts.armor.push(W(g,(x,y,z)=>{const v=axis==='x'?Math.abs(x):axis==='y'?y:z,t=sst(a0,a1,v);return[[b0,1-t],[b1,t]]}));return g};
 const spineW=(x,y)=>{const keys=[[H.hips,P(H.hips)[1]],[H.spine,P(H.spine)[1]],[H.chest,P(H.chest)[1]],[H.upperChest,P(H.upperChest)[1]+.03]];if(y<=keys[0][1])return[[keys[0][0],1]];
  for(let i=0;i<3;i++)if(y<=keys[i+1][1]){const t=sst(keys[i][1],keys[i+1][1],y);return[[keys[i][0],1-t],[keys[i+1][0],t]]}return[[keys[3][0],1]]};
 const hipY=P(H.hips)[1],chestY=P(H.chest)[1],ucY=P(H.upperChest)[1],nkY=P(H.neck)[1],hdY=P(H.head)[1];
 // ---------- torso: sculpted breastplate with a centre ridge, back plate, abdomen lames, belt
 const ridge=(a)=>1+.07*Math.exp(-Math.pow(angd(a,PI/2),2)/.04);
 const torso=loft([{y:hipY-.02,rx:.16,rz:.115},{y:hipY+.1,rx:.165,rz:.12},{y:chestY-.08,rx:.18,rz:.13,cz:.01},{y:chestY+.02,rx:.215,rz:.155,cz:.03},{y:ucY+.04,rx:.235,rz:.16,cz:.025},{y:nkY-.06,rx:.21,rz:.13,cz:0},{y:nkY-.01,rx:.1,rz:.09}],20,3,
  {fn:(a,y)=>y>chestY-.1?ridge(a):1,col:(v,a)=>{const front=Math.sin(a)>.3;return v>.55&&front?KC.mid:KC.iron}});
 parts.armor.push(W(tint(torso,[1,1,1]),spineW));
 for(let i=0;i<3;i++){const y=hipY+.06+i*.07;const l=loft([{y:y-.035,rx:.178+i*.004,rz:.13},{y:y+.03,rx:.172+i*.004,rz:.126}],20,1,{col:()=>i%2?KC.mid:KC.iron});parts.armor.push(W(l,spineW))}
 {const belt=loft([{y:hipY-.05,rx:.185,rz:.135},{y:hipY+.01,rx:.185,rz:.135}],20,1,{col:()=>KC.leather});parts.armor.push(W(belt,spineW));
  const bk=sphere(10,8,d=>[d[0]*.045,hipY-.02+d[1]*.04,.14+d[2]*.02],{c:[0,hipY-.02,.14],col:()=>KC.bronze});rig(bk,H.hips);
  rig(sphere(8,6,d=>[d[0]*.016,hipY-.02+d[1]*.016,.163+d[2]*.01],{c:[0,hipY-.02,.163]}),H.hips,KC.red)}
 // tassets (hip plates): front/side/back plates that follow the thighs a little
 for(const[ang,b]of[[PI/2-.42,H.leftUpperLeg],[PI/2+.42,H.rightUpperLeg],[.15,H.leftUpperLeg],[PI-.15,H.rightUpperLeg],[-PI/2,H.hips]]){
  const g=G(),rows=6,cols=6,span=ang===-PI/2?.7:.5;for(let j=0;j<=rows;j++){const t=j/rows,y=hipY-.03-t*.26,r=.2+t*.045;for(let k=0;k<=cols;k++){const a=ang-span/2+span*k/cols;g.P.push(Math.cos(a)*r,y,Math.sin(a)*r*.82);g.U.push(0,0);const c=j%2?KC.mid:KC.iron,e=k===0||k===cols||j===rows?1.4:1;g.C.push(c[0]*e,c[1]*e,c[2]*e);g.W.push(0)}}
  grid(g,rows+1,cols);normals(g);parts.armor.push(W(g,(x,y)=>{const t=sst(hipY,hipY-.25,y)*(b===H.hips?0:.55);return[[H.hips,1-t],[b,t]]}))}
 // gorget + fur mantle (wolf pelt) around the shoulders
 parts.armor.push(W(loft([{y:nkY-.07,rx:.13,rz:.11},{y:nkY+.02,rx:.1,rz:.095},{y:nkY+.05,rx:.09,rz:.085}],16,1,{col:()=>KC.mid}),spineW));
 {const fur=[];for(let i=0;i<34;i++){const a=i/34*2*PI,r=.2+.02*Math.sin(i*2.7),x=Math.cos(a)*r*1.05,z=Math.sin(a)*r*.75-.02,y=ucY+.07+(Math.sin(a)<0?.02:-.02);
   const tip=[x*1.18,y-.13-.05*Math.abs(Math.cos(i*1.3)),z*1.18-(Math.sin(a)<0?.04:0)];fur.push(tint(tube([[x*.92,y+.03,z*.92],[x*1.06,y-.03,z*1.06],tip],{r:t=>.04*(1-t*.8),seg:5,n:4}),mix3(KC.fur,KC.dark,(i%3)/3)))}
  parts.armor.push(W(merge(fur),()=>[[H.upperChest,1]]))}
 // ---------- arms
 for(const[s,S]of[[1,'left'],[-1,'right']]){const ua=H[S+'UpperArm'],la=H[S+'LowerArm'],hd=H[S+'Hand'],sh=H[S+'Shoulder'],p0=P(ua),p1=P(la),p2=P(hd),y=p0[1];
  // pauldron: layered domes with a hooked spike
  const pc=[p0[0]+s*.02,y+.05,0];for(let i=0;i<4;i++){const c=[pc[0]+s*i*.035,pc[1]-i*.045,pc[2]],rx=.16-i*.012,ry=.11-i*.012,rz=.15-i*.01;
   const d=sphere(14,8,dd=>[c[0]+dd[0]*rx,c[1]+dd[1]*ry,c[2]+dd[2]*rz],{c,th:()=>PI*.55,col:(dd,v)=>v>.45?mix3(KC.edge,KC.iron,.4):i%2?KC.mid:KC.iron});
   parts.armor.push(W(d,()=>[[ua,.65],[sh,.35]]))}
  parts.armor.push(W(tint(tube([[pc[0],pc[1]+.08,0],[pc[0]+s*.04,pc[1]+.2,-.02],[pc[0]+s*.1,pc[1]+.26,-.07]],{r:t=>lp(.035,.003,t),seg:6,n:5}),KC.bone),()=>[[ua,.65],[sh,.35]]));
  // rerebrace, couter, vambrace, cuff
  rig(tube([[p0[0],y,0],[lp(p0[0],p1[0],.5),y,0],[p1[0]-s*.02,y,0]],{r:t=>lp(.066,.057,t),seg:10,n:4,col:t=>t>.8?KC.mid:KC.iron}),ua);
  blend(sphere(10,8,d=>[p1[0]+d[0]*.07,y+d[1]*.07,d[2]*.07],{c:p1,col:()=>KC.mid}),ua,la,Math.abs(p1[0])-.03,Math.abs(p1[0])+.03,'x');
  rig(tint(tube([[p1[0],y+.02,-.06],[p1[0]+s*.03,y+.03,-.13]],{r:t=>lp(.03,.004,t),seg:5,n:3}),KC.edge),la);
  rig(tube([[p1[0]+s*.02,y,0],[lp(p1[0],p2[0],.5),y,0],[p2[0]-s*.05,y,0],[p2[0]-s*.015,y,0]],{r:t=>t<.7?lp(.056,.048,t/.7):lp(.048,.068,(t-.7)/.3),seg:10,n:6,col:t=>t>.7?KC.mid:KC.iron}),la);
  // gauntlet: back-of-hand plate + articulated fingers
  rig(loft([{y:0,rx:.024,rz:.046},{y:.05,rx:.022,rz:.048},{y:.085,rx:.018,rz:.046}],10,1,{col:()=>KC.iron}),hd);
  const gb=parts.armor[parts.armor.length-1];bake(gb,mtrs([p2[0],y+.004,0],[0,0,-s*PI/2]));
  for(const F of['Index','Middle','Ring','Little','Thumb'])for(const[n,m]of[['Proximal','Intermediate'],['Intermediate','Distal'],['Distal',null]]){const b=H[S+F+n],a=P(b),e=m?P(H[S+F+m]):vadd(a,vmul(vnorm(vsub(a,P(H[S+F+(n==='Distal'?'Intermediate':'Proximal')]))),.026));
   rig(tube([a,e],{r:t=>lp(.0125,.0105,t)*(F==='Thumb'?1.1:1),seg:6,n:2,col:()=>n==='Proximal'?KC.mid:KC.iron}),b)}}
 // ---------- legs
 for(const[s,S]of[[1,'left'],[-1,'right']]){const ul=H[S+'UpperLeg'],ll=H[S+'LowerLeg'],ft=H[S+'Foot'],to=H[S+'Toes'],p0=P(ul),p1=P(ll),p2=P(ft),p3=P(to),x=p0[0];
  blend(tube([[x*.6,hipY+.04,0],[x,p0[1]-.06,0]],{r:()=>.095,seg:10,n:2}),H.hips,ul,p0[1]+.02,p0[1]-.06,'y',KC.leather);
  rig(tube([[x,p0[1]-.04,0],[x,lp(p0[1],p1[1],.5),.005],[x,p1[1]+.03,.01]],{r:t=>lp(.086,.07,t),seg:12,n:4,col:t=>t>.85?KC.mid:KC.iron}),ul);
  rig(loft([{y:0,rx:.06,rz:.02},{y:.18,rx:.065,rz:.024},{y:.3,rx:.05,rz:.02}],10,1,{col:()=>KC.mid}),ul);bake(parts.armor[parts.armor.length-1],mtrs([x,p1[1]+.06,.07],[0,0,0]));
  blend(sphere(10,8,d=>[x+d[0]*.07,p1[1]+d[1]*.075,.03+d[2]*.07],{c:[x,p1[1],.03],col:()=>KC.mid}),ul,ll,p1[1]+.04,p1[1]-.03,'y');
  rig(tint(tube([[x,p1[1]+.02,.09],[x,p1[1]+.1,.13]],{r:t=>lp(.028,.004,t),seg:5,n:3}),KC.edge),ll);
  rig(tube([[x,p1[1]-.02,0],[x,lp(p1[1],p2[1],.5),.005],[x,p2[1]+.03,0]],{r:t=>lp(.066,.05,t),seg:12,n:4,flat:.95,col:t=>t<.1?KC.mid:KC.iron}),ll);
  rig(tube([[x,p1[1]-.05,.06],[x,p2[1]+.06,.05]],{r:()=>.012,seg:5,n:2,col:()=>KC.edge}),ll);
  // sabaton: heel to toe, toe cap on the toe bone
  rig(loft([{y:-.09,rx:.052,rz:.045},{y:0,rx:.058,rz:.06},{y:.1,rx:.055,rz:.05}],12,1,{col:()=>KC.iron}),ft);bake(parts.armor[parts.armor.length-1],mtrs([x,p2[1]-.035,.03],[PI/2,0,0]));
  rig(loft([{y:0,rx:.05,rz:.042},{y:.07,rx:.045,rz:.035},{y:.1,rx:.02,rz:.02}],12,1,{col:()=>KC.mid}),to);bake(parts.armor[parts.armor.length-1],mtrs([x,p2[1]-.045,p3[2]-.055],[PI/2,0,0]))}
 // ---------- helm: rounded skull, V visor with a burning slit, jaw guard, back-swept horns, crest
 const hc=[0,hdY+.075,.01];
 rig(sphere(18,12,d=>[hc[0]+d[0]*.13,hc[1]+d[1]*.14,hc[2]+d[2]*.15],{c:hc,col:(d)=>d[1]>.6?KC.mid:KC.iron}),H.head);
 rig(loft([{y:hdY-.035,rx:.118,rz:.15,cz:.012},{y:hdY+.04,rx:.132,rz:.162,cz:.02},{y:hdY+.12,rx:.13,rz:.155,cz:.015}],20,2,{fn:a=>Math.sin(a)>0?1+.12*Math.exp(-Math.pow(angd(a,PI/2),2)/.05):1.0001,col:(v,a)=>Math.sin(a)>.2?KC.mid:KC.iron}),H.head);
 rig(loft([{y:hdY-.1,rx:.09,rz:.1,cz:.04},{y:hdY-.04,rx:.12,rz:.14,cz:.03}],16,1,{fn:a=>Math.sin(a)>0?1+.18*Math.exp(-Math.pow(angd(a,PI/2),2)/.04):1,col:()=>KC.iron}),H.head);
 for(const s of[-1,1]){
  const slit=G();box(slit,s*.012,hdY+.068,.168,s*.07,hdY+.082,.176,KC.dark);rig(slit,H.head);
  const gl=G();box(gl,s*.016,hdY+.071,.174,s*.064,hdY+.079,.18,[1,1,1]);parts.glow.push(W(gl,()=>[[H.head,1]]));
  rig(tint(tube([[s*.1,hdY+.13,0],[s*.17,hdY+.17,-.05],[s*.24,hdY+.21,-.15],[s*.26,hdY+.3,-.25]],{r:t=>lp(.032,.004,t),seg:7,n:10}),KC.bone),H.head)}
 rig(tint(tube([[0,hdY+.21,.1],[0,hdY+.24,0],[0,hdY+.22,-.12]],{r:t=>.018*Math.sin(PI*(.1+.8*t)),flat:.3,seg:5,n:8,wide:[1,0,0]}),KC.red),H.head);
 // ---------- tattered cape on its own bones
 {const g=G(),strips=9,rows=10;for(let s=0;s<strips;s++){const x0=-.3+.6*s/(strips-1),len=.95+.25*Math.abs(Math.sin(s*2.3)),o=g.P.length/3;
   for(let j=0;j<=rows;j++){const t=j/rows,y=shY(),yy=y-.02-t*len,w=.045+.01*Math.sin(s),z=-.19-.04*t-.08*Math.abs(x0)*t;const jag=j===rows?(s%2?.08:-.05):0;
    for(const dx of[-w,w]){g.P.push(x0*(1+.25*t)+dx,yy+(dx>0?jag:0),z);g.U.push(0,0);const c=mix3([.16,.05,.06],[.33,.07,.08],t);g.C.push(c[0],c[1],c[2]);g.W.push(t*t*2)}}
   for(let j=0;j<rows;j++){const a=o+j*2;g.I.push(a,a+2,a+1,a+1,a+2,a+3)}}normals(g);
  parts.cape.push(W(g,(x,y)=>{const ya=P(H.capeA)[1],yb=P(H.capeB)[1],yc=P(H.capeC)[1];if(y>ya-.06)return[[H.upperChest,.7],[H.capeA,.3]];if(y>yb){const t=sst(ya,yb,y);return[[H.capeA,1-t],[H.capeB,t]]}const t=sst(yb,yc,y);return[[H.capeB,1-t],[H.capeC,t]]}))}
 function shY(){return P(H.leftUpperArm)[1]}
 // ---------- upload: one skin per material group
 const OUT=[.04,.04,.06];
 const mk=(list,o)=>{if(!list.length)return;const g=merge(list);const nv=g.P.length/3,J=new Uint8Array(nv*4),Wt=new Float32Array(nv*4);let off=0;for(const p of list){J.set(p.J4,off*4);Wt.set(p.W4,off*4);off+=p.P.length/3}
  if(!g.N||g.N.length!==g.P.length)normals(g);return addSkin(g,J,Wt,o)};
 HERO.armor=mk(parts.armor,{out:.004,outCol:OUT,shade:.95});HERO.cape=mk(parts.cape,{out:0,shade:.8,ds:1});HERO.glow=mk(parts.glow,{unlit:1,col:[1,.25,.15],shade:0})}
