// Run with a fresh FoodieGoals tab from Codex's supported browser tools.
// Example: await runBrowserFlow(await browser.tabs.get(testTabId)).
// The tab must already be on the local app. Uses no hidden browser state.
export async function runBrowserFlow(tab) {
  const p = tab.playwright;
  await p.locator('main[data-ready="true"]').waitFor({ state: 'visible' });
  const assert = (ok, message) => {
    if (!ok) throw Error(message);
  };
  await p.getByRole('button', { name: 'Next: what sounds good →' }).click();
  await p.getByRole('button', { name: 'Next: your location →' }).click();
  await p.getByLabel('US ZIP code Required').fill('02108');
  await p.getByRole('button', { name: 'Find my meals', exact: true }).click();
  await p
    .getByRole('heading', { name: 'Let’s find your fit.' })
    .waitFor({ state: 'visible' });
  let dom = await p.domSnapshot();
  assert(dom.includes('02108'), 'ZIP leading zero lost');
  assert(
    dom.includes('Strict matches · 0'),
    'Unverified location marked strict',
  );
  assert(dom.includes('Nutrition matches'), 'Nutrition results missing');
  assert(dom.includes('Near matches'), 'Near matches missing');
  const name = 'Orange Chicken + Super Greens';
  const save = p.getByRole('button', { name: 'Save ' + name, exact: true });
  const alreadySaved = !(await save.isVisible());
  if (!alreadySaved) await save.click();
  await p
    .getByRole('article')
    .filter({ hasText: name })
    .getByRole('button', { name: 'Meal details ↗' })
    .click();
  dom = await p.domSnapshot();
  assert(dom.includes('Total 640 25 67 9 28'), 'Component totals wrong');
  await p.getByRole('button', { name: 'Close', exact: true }).press('Escape');
  await tab.reload();
  await p.locator('main[data-ready="true"]').waitFor({ state: 'visible' });
  await p.getByRole('button', { name: /Saved meals/ }).click();
  await p
    .getByRole('heading', { name, exact: true })
    .waitFor({ state: 'visible' });
  assert(
    await p.getByRole('heading', { name, exact: true }).isVisible(),
    'Favorite lost after refresh',
  );
  if (!alreadySaved)
    await p
      .getByRole('button', { name: 'Unsave ' + name, exact: true })
      .click();
  return 'Passed: three-step search, ZIP, strict/demo/near, details totals, favorites after refresh.';
}
