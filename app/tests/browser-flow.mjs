// Run with a fresh FoodieGoals tab from Codex's supported browser tools.
// Example: await runBrowserFlow(await browser.tabs.get(testTabId)).
// The tab must already be on the local app. Uses no hidden browser state.
export async function runCalorieBoundsFlow(tab) {
  const p = tab.playwright;
  await p.locator('main[data-ready="true"]').waitFor({ state: 'visible' });
  const minimum = p.getByLabel('Minimum calories', { exact: true });
  const maximum = p.getByLabel('Maximum calories', { exact: true });
  const next = p.getByRole('button', { name: 'Next: what sounds good →' });
  const assert = (ok, message) => { if (!ok) throw Error(message); };
  await minimum.fill('800');
  await maximum.fill('600');
  await next.click();
  assert(await p.getByRole('alert').isVisible(), 'Reversed calorie bounds were accepted');
  assert(await minimum.isVisible(), 'Invalid calorie bounds advanced the form');
  await minimum.fill('');
  await next.click();
  assert(await p.getByRole('alert').isVisible(), 'Missing minimum was accepted');
  await minimum.fill('500');
  await maximum.fill('500');
  await next.click();
  await p.getByRole('button', { name: 'Next: your location →' }).click();
  await p.getByRole('button', { name: '44512', exact: true }).click();
  await p.getByRole('button', { name: 'Find my meals', exact: true }).click();
  await p.getByRole('heading', { name: 'Let’s find your fit.' }).waitFor({ state: 'visible' });
  const dom = await p.domSnapshot();
  assert(dom.includes('44512'), '44512 shortcut did not reach the results');
  assert(dom.includes('Nutrition matches'), 'Exact calorie target failed to return a result section');
  assert(dom.includes('Two 8-count') || dom.includes('Double 8-count'), 'Expected exact 500-calorie meal is missing');
  await p.getByRole('button', { name: 'Edit filters', exact: true }).click();
  assert(await minimum.isVisible(), 'Edit filters did not restore calorie controls');
  return 'Passed: min/max labels, reversed/missing validation, equal bounds, 44512 results, and edit filters.';
}

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
