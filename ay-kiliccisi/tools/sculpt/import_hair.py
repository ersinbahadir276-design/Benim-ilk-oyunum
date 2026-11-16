#!/usr/bin/env python3
"""Fits "Long reddish hair for game" (CarlosTorresVFX, CC BY 4.0) to the Demon Queen's head bone -> data/hair.js
python3 -I tools/sculpt/import_hair.py <hair.glb> <tex512-dataurl.txt> [down] [fwd] [tilt_deg] [scale]"""
import sys, json, struct, base64, math, pathlib
import numpy as np
glb, texf = sys.argv[1], sys.argv[2]
down, fwd, tilt, sc = [float(v) for v in (sys.argv[3:7] + ['0.03', '0.012', '10', '1.04'][len(sys.argv) - 3:])]
b = open(glb, 'rb').read(); l = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + l]); B = b[20 + l + 8:]
def acc(i):
    a = j['accessors'][i]; v = j['bufferViews'][a['bufferView']]; n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16}[a['componentType']]
    return np.frombuffer(B, dt, a['count'] * n, v.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(-1, n)
prims = [dict(mat=p.get('material'), P=acc(p['attributes']['POSITION']), N=acc(p['attributes']['NORMAL']), U=acc(p['attributes']['TEXCOORD_0']), I=acc(p['indices']).ravel()) for m in j['meshes'] for p in m['primitives']]
s = 0.0084 * sc; rootY = 0.9001; zc = 0.13116; head = np.array([0, 0.594, 0])
allP = np.vstack([o['P'] for o in prims]); m = np.abs(allP[:, 2] - 146) < 1; ycen = (allP[m, 1].min() + allP[m, 1].max()) / 2
t = math.radians(tilt); ct, st = math.cos(t), math.sin(t); piv = np.array([0, 1.70, 0.131])   # tilt forward about the ear line
def rot(V, about=None):
    if about is not None: V = V - about
    y = V[:, 1] * ct - V[:, 2] * st; z = V[:, 1] * st + V[:, 2] * ct; V = np.stack([V[:, 0], y, z], 1)
    return V + about if about is not None else V
def fit(P):
    V = np.stack([P[:, 0] * s, (P[:, 2] - 156.5) * s + 1.795, -(P[:, 1] - ycen) * s + 0.147], 1)
    V = rot(V, piv); V[:, 1] -= down; V[:, 2] += fwd
    return np.stack([V[:, 0], V[:, 1] - rootY, V[:, 2] - zc], 1) - head
out = {}
for name, sel in [('cap', lambda o: o['mat'] == 0), ('cards', lambda o: o['mat'] == 1)]:
    P, N, U, I, off = [], [], [], [], 0
    for o in prims:
        if not sel(o): continue
        P.append(fit(o['P'])); N.append(rot(np.stack([o['N'][:, 0], o['N'][:, 2], -o['N'][:, 1]], 1))); U.append(o['U']); I.append(o['I'] + off); off += len(o['P'])
    enc = lambda a, dt: base64.b64encode(np.ascontiguousarray(a, dtype=dt).tobytes()).decode()
    out[name] = dict(P=enc(np.vstack(P), np.float32), N=enc(np.vstack(N), np.float32), U=enc(np.vstack(U), np.float32), I=enc(np.concatenate(I), np.uint16), nv=off)
root = pathlib.Path(__file__).resolve().parent.parent.parent
(root / 'data' / 'hair.js').write_text('// "Long reddish hair for game" — CarlosTorresVFX (Sketchfab), CC BY 4.0; fitted to the Demon Queen\'s head bone (tools/sculpt/import_hair.py)\nconst HAIRDATA=' + json.dumps(out) + ';\nconst HAIRTEX="' + open(texf).read() + '";\n')
print('hair', {k: v['nv'] for k, v in out.items()})
