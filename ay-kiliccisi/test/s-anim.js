// node test/harness.js test/s-anim.js  -> hero animation layer (foot IK, cape, lean, look-at)
const path = require('path');
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(800);
  await page.addScriptTag({ path: path.join(__dirname, 'anim-tests.js') });
  const res = await page.evaluate(() => window.runAnim());
  for (const r of res) log(r.name, r.pass, r.extra);
};
module.exports.pauseAtStart = true;
