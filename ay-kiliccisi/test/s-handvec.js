module.exports = async ({ page, G }) => {
  await page.waitForTimeout(500);
  const r = await G(() => { const g = __G, H = g.HB, SK = g.SK, gr = SK.GR[H.rightHand];
    const loc = (v) => g.r3v(gr, v).map((x) => +x.toFixed(2));
    return JSON.stringify({ x: loc([1, 0, 0]), y: loc([0, 1, 0]), z: loc([0, 0, 1]), handPos: SK.GP[H.rightHand].map((x) => +x.toFixed(3)), elbow: SK.GP[H.rightLowerArm].map((x) => +x.toFixed(3)), tipRest: SK.tipRest }); });
  console.log('HAND local axes in model space (idle):', r);
};
