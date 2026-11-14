// node test/harness.js test/s-mech.js  -> runs every mechanic test inside the real game page
const path = require('path');
module.exports = async ({ page, G, log }) => {
  await page.waitForTimeout(800);
  await page.addScriptTag({ path: path.join(__dirname, 'mech-tests.js') });
  const res = await page.evaluate(() => window.runMech());
  for (const r of res) log(r.name, r.pass, r.extra);
};
