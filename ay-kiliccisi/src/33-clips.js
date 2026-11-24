// ===================== hero keyframe clips: attack timelines with anticipation, strike, follow-through, recovery =====================
// A clip is a list of keys [u, {channel: value}] on normalized time u (0..1 of the move's duration).
// Each channel is interpolated on its own keys with monotone cubic Hermite curves (no overshoot between keys,
// flat at extremes), so a key can define only the channels that change there. Channels use the POSE0 names.
// Timing is laid out around the game's real hit frames: light u=.36, heavy u=.5, running slash u=.38,
// so the blade passes through the target exactly when damage is dealt.
const CLIP_HIT={atk0:.36,atk1:.36,atk2:.36,heavy:.5,runatk:.38};
const HCLIP_SRC={
 // forehand: wide right-to-left cut. Wind-up coils the chest away from the target, the wrist cocks back;
 // the strike unwinds hips → chest → arm → wrist; the blade carries past the target and the body settles.
 atk0:[
  [0,  {RaZ:.3,RaX:-.1,RaY:.2,Rel:.55,RwZ:0,chY:0,spY:0,hdY:0,spX:.1,pel:.04,hipY:0,LthX:-.2,Lkn:.3,RthX:.15,Rkn:.2}],
  [.2, {RaZ:.15,RaX:-.2,RaY:-1.0,Rel:.62,RwZ:-.35,chY:-.75,spY:-.3,hdY:.55,spX:.08,pel:.06,hipY:-.025,LthX:-.42,Lkn:.58,RthX:.3,Rkn:.35}],
  [.27,{RaY:-.75,Rel:.5,RwZ:-.3,chY:-.6,spY:-.22,hdY:.45}],
  [.36,{RaZ:.2,RaX:-.1,RaY:1.0,Rel:.1,RwZ:.15,chY:.2,spY:.12,hdY:-.1,spX:.18,pel:.14,hipY:-.06,LthX:-.62,Lkn:.72,RthX:.45,Rkn:.2}],
  [.47,{RaY:2.35,Rel:.08,RwZ:.38,chY:.82,spY:.3,hdY:-.45,spX:.2,hipY:-.055}],
  [.72,{RaY:2.05,Rel:.2,RwZ:.22,chY:.62,spY:.22,hdY:-.3,hipY:-.04}],
  [1,  {RaZ:.25,RaY:1.35,Rel:.4,RwZ:.08,chY:.3,spY:.1,hdY:-.12,spX:.14,pel:.08,hipY:-.015,LthX:-.45,Lkn:.55,RthX:.3,Rkn:.25}]],
 // backhand: left-to-right return cut, the mirror of the forehand with the right leg leading.
 atk1:[
  [0,  {RaZ:.4,RaX:0,RaY:1.6,Rel:.3,RwZ:.15,chY:.4,spY:.15,hdY:-.2,spX:.12,pel:.06,hipY:-.01,LthX:-.2,Lkn:.35,RthX:-.1,Rkn:.3}],
  [.2, {RaZ:.5,RaY:2.45,Rel:.35,RwZ:.35,chY:.82,spY:.32,hdY:-.55,pel:.08,hipY:-.02,LthX:.28,Lkn:.3,RthX:-.42,Rkn:.6}],
  [.27,{RaY:2.2,RwZ:.3,chY:.68,spY:.26,hdY:-.45}],
  [.36,{RaZ:.42,RaY:.55,Rel:.1,RwZ:-.12,chY:-.12,spY:-.06,hdY:.1,spX:.18,pel:.15,hipY:-.06,LthX:.4,Lkn:.22,RthX:-.62,Rkn:.72}],
  [.47,{RaY:-.78,Rel:.08,RwZ:-.38,chY:-.72,spY:-.26,hdY:.42,hipY:-.055}],
  [.72,{RaY:-.52,Rel:.15,RwZ:-.22,chY:-.52,spY:-.18,hdY:.3,hipY:-.04}],
  [1,  {RaZ:.4,RaY:-.1,Rel:.35,RwZ:-.05,chY:-.2,spY:-.06,hdY:.1,spX:.14,pel:.08,hipY:-.015,LthX:.25,Lkn:.3,RthX:-.4,Rkn:.5}]],
 // overhead finisher: rise onto the toes with the blade high and a brief hang, then drive down through the
 // whole body (pelvis drops, front knee takes the weight), blade ends low and the hero holds the finish.
 atk2:[
  [0,  {RaZ:-.7,RaX:-.25,RaY:.25,Rel:.6,RwX:-.1,chX:0,spX:.05,pel:.06,hipY:0,hdX:0,LthX:-.3,Lkn:.4,RthX:.2,Rkn:.25}],
  [.2, {RaZ:-1.4,RaX:-1.0,Rel:.72,RwX:-.5,chX:-.3,spX:-.12,pel:.02,hipY:.012,hdX:-.15,LthX:-.42,Lkn:.4,RthX:.25,Rkn:.2}],
  [.28,{RaX:-1.08,Rel:.7,RwX:-.55,chX:-.33,spX:-.14,hipY:.014,hdX:-.17}],
  [.36,{RaZ:-1.3,RaX:.62,Rel:.1,RwX:.2,chX:.36,spX:.26,pel:.25,hipY:-.08,hdX:.1,LthX:-.82,Lkn:1.02,RthX:.42,Rkn:.4}],
  [.46,{RaX:1.35,Rel:.05,RwX:.36,chX:.56,spX:.36,pel:.3,hipY:-.115,hdX:.18}],
  [.74,{RaX:1.28,RwX:.3,chX:.5,spX:.33,hipY:-.105}],
  [1,  {RaZ:-1.0,RaX:.9,Rel:.2,RwX:.15,chX:.25,spX:.2,pel:.18,hipY:-.05,hdX:.05,LthX:-.6,Lkn:.75,RthX:.32,Rkn:.32}]],
 // charged heavy: continues from the charge pose, coils a little deeper (weight back, chest up),
 // then a two-handed downward cleave with a heavy plant and a long recovery.
 heavy:[
  [0,  {RaZ:-1.55,RaY:.25,RaX:-1.05,Rel:.75,RwX:-.55,chX:-.28,spX:-.12,pel:.1,hipY:-.03,hdX:0,LthX:-.55,Lkn:.7,RthX:.35,Rkn:.35}],
  [.3, {RaZ:-1.72,RaX:-1.32,Rel:.8,RwX:-.75,chX:-.4,spX:-.2,pel:.06,hipY:-.008,hdX:-.12,LthX:-.5,Lkn:.6,RthX:.4,Rkn:.3}],
  [.43,{RaX:-.05,Rel:.45,RwX:-.1,chX:.05,spX:.05}],
  [.5, {RaZ:-.88,RaX:.55,Rel:.1,RwX:.35,chX:.5,spX:.32,pel:.25,hipY:-.12,hdX:.12,LthX:-.9,Lkn:1.02,RthX:.46,Rkn:.45}],
  [.6, {RaZ:-.74,RaX:1.25,Rel:.05,RwX:.45,chX:.6,spX:.38,pel:.28,hipY:-.14,hdX:.2}],
  [.86,{RaX:1.2,RwX:.4,chX:.56,spX:.36,hipY:-.13}],
  [1,  {RaZ:-.9,RaX:1.0,Rel:.2,RwX:.2,chX:.35,spX:.25,pel:.2,hipY:-.07,hdX:.08,LthX:-.7,Lkn:.85,RthX:.4,Rkn:.38}]],
 // running slash: low lunge out of a sprint, blade sweeps across while the off arm swings back for balance.
 runatk:[
  [0,  {RaZ:.3,RaX:-.8,RaY:-.9,Rel:.7,RwZ:-.2,chY:-.55,spX:.32,pel:.18,hipY:-.02,hdY:.4,LthX:-.8,Lkn:.85,RthX:.5,Rkn:.35,LaX:.6,Lel:1.0}],
  [.24,{RaY:-1.2,RaX:-.92,Rel:.75,RwZ:-.35,chY:-.75,spX:.36,pel:.22,hipY:-.04,hdY:.55,LthX:-.95,Lkn:.95,RthX:.58,Rkn:.3}],
  [.38,{RaX:-.2,RaY:.9,Rel:.15,RwZ:.15,chY:.15,spX:.4,pel:.24,hipY:-.08,hdY:-.05,LaX:.9,Lel:1.15}],
  [.5, {RaX:.2,RaY:2.0,Rel:.05,RwZ:.38,chY:.75,hdY:-.45,hipY:-.07}],
  [.78,{RaY:1.85,RwZ:.25,chY:.65,spX:.34,pel:.2,hipY:-.05,hdY:-.35}],
  [1,  {RaX:0,RaY:1.4,Rel:.3,RwZ:.1,chY:.4,spX:.25,pel:.15,hipY:-.03,hdY:-.15,LthX:-.6,Lkn:.65,RthX:.4,Rkn:.3,LaX:.5,Lel:.9}]]};
// compile: per channel, sorted [u,v] arrays and monotone tangents (Fritsch–Carlson)
function compileClip(src){const ch={};for(const[u,k]of src)for(const n in k)(ch[n]||(ch[n]=[])).push([u,k[n]]);
 for(const n in ch){const K=ch[n],m=K.length,d=[],tg=new Array(m).fill(0);
  for(let i=0;i<m-1;i++)d.push((K[i+1][1]-K[i][1])/(K[i+1][0]-K[i][0]));
  for(let i=1;i<m-1;i++)tg[i]=d[i-1]*d[i]<=0?0:2/(1/d[i-1]+1/d[i]);// harmonic mean of the slopes: never overshoots
  ch[n]={K,tg}}
 return ch}
const HCLIP={};for(const n in HCLIP_SRC)HCLIP[n]=compileClip(HCLIP_SRC[n]);
function clipVal(c,u){const K=c.K,m=K.length;if(u<=K[0][0])return K[0][1];if(u>=K[m-1][0])return K[m-1][1];
 let i=0;while(i<m-2&&u>K[i+1][0])i++;const t0=K[i][0],t1=K[i+1][0],h=t1-t0,s=(u-t0)/h,s2=s*s,s3=s2*s;
 return(2*s3-3*s2+1)*K[i][1]+(s3-2*s2+s)*h*c.tg[i]+(-2*s3+3*s2)*K[i+1][1]+(s3-s2)*h*c.tg[i+1]}
// writes every channel of clip `name` at normalized time u into the pose target q
function clipApply(q,name,u){const C=HCLIP[name];if(!C)return;u=cl(u,0,1);for(const n in C)q[n]=clipVal(C[n],u)}
