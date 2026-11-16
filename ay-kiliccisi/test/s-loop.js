// node test/harness.js test/s-loop.js -> phase-2 loop tests inside the real game page
const path = require('path');
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(800);
  // close the prologue strip if it opened
  await page.evaluate(() => { const m = document.getElementById('manhwa'); const s = m && m.querySelector('.mh-skip'); if (s) s.click(); });
  await page.addScriptTag({ path: path.join(__dirname, 'loop-tests.js') });
  const res = await page.evaluate(() => window.runLoop());
  for (const r of res) log(r.name, r.pass, r.extra);
};
module.exports.pauseAtStart = true;
