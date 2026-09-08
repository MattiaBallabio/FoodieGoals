'use client';
import { useEffect, useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { categories, nutrients, rank } from '@/lib/matching';
const emojis = ['🍕', '🍜', '🍔', '🍗', '🌮', '🥪', '🥗', '🧀'];
const initial = {
  calories: { value: '600', mode: 'range', tolerance: '100' },
  protein: { value: '', mode: 'min', tolerance: '5' },
  carbs: { value: '', mode: 'max', tolerance: '5' },
  fiber: { value: '', mode: 'min', tolerance: '2' },
  fat: { value: '', mode: 'max', tolerance: '5' },
};
function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="choice" aria-label={label}>
        <SelectValue>
          {options.find((o) => o.value === value)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export default function Home() {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(1),
    [goals, setGoals] = useState<any>(initial),
    [cats, setCats] = useState<string[]>([]),
    [zip, setZip] = useState(''),
    [radius, setRadius] = useState('10'),
    [sort, setSort] = useState('calories'),
    [screen, setScreen] = useState('search'),
    [result, setResult] = useState<any>(null),
    [applied, setApplied] = useState<any>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [favorites, setFavorites] = useState<string[]>([]),
    [catalog, setCatalog] = useState<any[]>([]),
    [detail, setDetail] = useState<any>(null),
    [storageError, setStorageError] = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setReady(true);
    try {
      const ids = JSON.parse(localStorage.getItem('foodie-favorites') || '[]');
      if (Array.isArray(ids))
        setFavorites(ids.filter((id) => typeof id === 'string'));
    } catch {
      setStorageError('Saved meals are unavailable in this browser.');
    }
  }, []);
  useEffect(() => {
    titleRef.current?.focus();
  }, [step, screen]);
  const update = (key: string, field: string, value: string) =>
    setGoals((g: any) => ({ ...g, [key]: { ...g[key], [field]: value } }));
  const validGoals = () => {
    for (const n of nutrients) {
      const g = goals[n];
      if (g.value === '') {
        if (n === 'calories') return 'Enter calories for this meal.';
        continue;
      }
      if (
        !Number.isFinite(Number(g.value)) ||
        Number(g.value) < 0 ||
        Number(g.value) > 10000 ||
        (n === 'calories' && Number(g.value) === 0)
      )
        return `Enter valid ${n} (${n === 'calories' ? 'above zero' : 'zero or more'}).`;
      if (
        g.mode === 'range' &&
        (g.tolerance === '' ||
          !Number.isFinite(Number(g.tolerance)) ||
          Number(g.tolerance) < 0 ||
          Number(g.tolerance) > 10000)
      )
        return `Enter a valid ${n} tolerance.`;
    }
    return '';
  };
  const move = (next: number) => {
    const message = next > 1 ? validGoals() : '';
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setStep(next);
    setScreen('search');
  };
  const payload = () => ({
    ...Object.fromEntries(
      nutrients
        .filter((n) => goals[n].value !== '')
        .map((n) => [
          n,
          {
            value: Number(goals[n].value),
            mode: goals[n].mode,
            tolerance: Number(goals[n].tolerance),
          },
        ]),
    ),
    categories: cats,
    zip,
    radius: Number(radius),
    sort,
  });
  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    const message = validGoals();
    if (message) {
      setError(message);
      setStep(1);
      return;
    }
    if (!/^\d{5}$/.test(zip)) {
      setError('Enter a five-digit US ZIP code, such as 02108.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const filters = payload();
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      const data: any = await res.json();
      if (!res.ok)
        throw Error(data.error || 'Search failed. Please try again.');
      setApplied(filters);
      setResult(data);
      setScreen('results');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function toggle(id: string) {
    const ids = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    try {
      localStorage.setItem('foodie-favorites', JSON.stringify(ids));
      setFavorites(ids);
      setStorageError('');
    } catch {
      setStorageError(
        'Your browser could not save this meal. Allow local storage and try again.',
      );
    }
  }
  async function showSaved() {
    setError('');
    setScreen('saved');
    setBusy(true);
    try {
      const res = await fetch('/api/meals');
      if (!res.ok) throw Error('Could not load saved meals. Please try again.');
      setCatalog(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const sorted = (list: any[]) => rank(list, { ...applied, sort });
  const card = (meal: any) => (
    <article className="meal-card" key={meal.id}>
      <div className="card-head">
        <div>
          <span className="eyebrow">{meal.restaurant}</span>
          <h3>{meal.name}</h3>
        </div>
        <button
          className="save"
          aria-label={`${favorites.includes(meal.id) ? 'Unsave' : 'Save'} ${meal.name}`}
          aria-pressed={favorites.includes(meal.id)}
          onClick={() => toggle(meal.id)}
        >
          {favorites.includes(meal.id) ? '♥' : '♡'}
        </button>
      </div>
      <p className="included">
        {meal.components
          .map((c: any) => `${c.quantity} × ${c.item.name} (${c.item.serving})`)
          .join(' + ')}
      </p>
      <div className="nutrition">
        {nutrients.map((n) => (
          <div key={n}>
            <strong>
              {meal.totals[n] ?? '—'}
              {n !== 'calories' && meal.totals[n] !== null ? (
                <small>g</small>
              ) : null}
            </strong>
            <span>
              {n === 'calories' ? 'Calories' : n[0].toUpperCase() + n.slice(1)}
            </span>
          </div>
        ))}
      </div>
      {meal.met?.map((text: string) => (
        <div className="met" key={text}>
          ✓ {text}
        </div>
      ))}
      {meal.misses?.map((text: string) => (
        <div className="miss" key={text}>
          {text}
        </div>
      ))}
      <p className="card-note">{meal.note}</p>
      {meal.distance !== null && meal.distance !== undefined ? (
        <p className="hint">
          {meal.location.address} · Approx. {meal.distance.toFixed(1)} miles
          from ZIP-code center
        </p>
      ) : (
        <p className="hint">Branch availability and distance unverified.</p>
      )}
      <div className="card-foot">
        <a
          href={meal.components[0].item.source}
          target="_blank"
          rel="noreferrer"
        >
          Nutrition source ↗
        </a>
        <span>Checked {meal.components[0].item.checked}</span>
      </div>
      <button className="detail-button" onClick={() => setDetail(meal)}>
        Meal details <span>↗</span>
      </button>
    </article>
  );
  return (
    <>
      <a className="skip" href="#main">
        Skip to main content
      </a>
      <header>
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setScreen('search');
          }}
        >
          foodie<span className="brand-goals">goals</span>
          <span>✳</span>
        </a>
        <span className="header-note">
          A little intention. A great next bite.
        </span>
        <button onClick={showSaved}>
          ♡ Saved meals <span className="count">{favorites.length}</span>
        </button>
      </header>
      <main id="main" data-ready={ready}>
        <div className="intro">
          <span className="eyebrow">GOOD FOOD. YOUR GOALS.</span>
          <h1>
            Find your next bite<span>.</span>
          </h1>
          <p>Your cravings and your nutrition goals can share a table.</p>
        </div>
        {storageError && (
          <p role="alert" className="error">
            {storageError}
          </p>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {screen === 'search' ? (
          <div className="workspace">
            <section className="search-panel">
              <nav className="steps" aria-label="Meal search steps">
                {['Meal goals', 'Cravings', 'Location'].map((label, i) => (
                  <button
                    key={label}
                    className={step === i + 1 ? 'active' : ''}
                    aria-current={step === i + 1 ? 'step' : undefined}
                    onClick={() => move(i + 1)}
                  >
                    <span className="step-number">{i + 1}</span> {label}
                  </button>
                ))}
              </nav>
              <Progress
                value={(step / 3) * 100}
                aria-label={`Step ${step} of 3`}
              />
              <form
                className="form-body"
                onSubmit={
                  step === 3
                    ? search
                    : (e) => {
                        e.preventDefault();
                        move(step + 1);
                      }
                }
                noValidate
              >
                <span className="eyebrow">STEP 0{step} / 03</span>
                <h2 ref={titleRef} tabIndex={-1}>
                  {
                    [
                      'What are your meal goals?',
                      'What sounds good?',
                      'Where are you eating?',
                    ][step - 1]
                  }
                </h2>
                {step === 1 ? (
                  <>
                    <p>Start with calories. Make it yours from there.</p>
                    <label htmlFor="calories">
                      Calories for this meal{' '}
                      <span className="required">Required</span>
                    </label>
                    <div className="unit-input">
                      <input
                        id="calories"
                        type="number"
                        min="1"
                        max="10000"
                        value={goals.calories.value}
                        onChange={(e) =>
                          update('calories', 'value', e.target.value)
                        }
                        aria-describedby="calorie-help"
                      />
                      <span>calories</span>
                    </div>
                    <div className="tolerance">
                      <label htmlFor="cal-tolerance">Calorie tolerance ±</label>
                      <input
                        id="cal-tolerance"
                        type="number"
                        min="0"
                        max="10000"
                        value={goals.calories.tolerance}
                        onChange={(e) =>
                          update('calories', 'tolerance', e.target.value)
                        }
                      />
                      <span>cal</span>
                    </div>
                    <p className="hint" id="calorie-help">
                      Your range:{' '}
                      {Math.max(
                        0,
                        Number(goals.calories.value) -
                          Number(goals.calories.tolerance),
                      )}
                      –
                      {Number(goals.calories.value) +
                        Number(goals.calories.tolerance)}{' '}
                      calories.
                    </p>
                    <details>
                      <summary>
                        Add nutrient preferences{' '}
                        <span className="optional">Optional ＋</span>
                      </summary>
                      <p className="hint">
                        Leave blank for no preference. Zero is a real limit.
                      </p>
                      {nutrients.slice(1).map((n) => (
                        <div className="nutrient-row" key={n}>
                          <label htmlFor={n}>
                            {n[0].toUpperCase() + n.slice(1)} (g)
                          </label>
                          <div className="nutrient-fields">
                            <input
                              id={n}
                              type="number"
                              min="0"
                              max="10000"
                              placeholder="No preference"
                              value={goals[n].value}
                              onChange={(e) =>
                                update(n, 'value', e.target.value)
                              }
                            />
                            <Choice
                              label={`${n} comparison`}
                              value={goals[n].mode}
                              onChange={(v) => update(n, 'mode', v)}
                              options={[
                                { value: 'min', label: 'Minimum' },
                                { value: 'max', label: 'Maximum' },
                                { value: 'range', label: 'Target range' },
                              ]}
                            />
                          </div>
                          {goals[n].mode === 'range' && (
                            <label className="tolerance">
                              Tolerance ± (g)
                              <input
                                type="number"
                                min="0"
                                aria-label={`${n} tolerance`}
                                value={goals[n].tolerance}
                                onChange={(e) =>
                                  update(n, 'tolerance', e.target.value)
                                }
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </details>
                  </>
                ) : step === 2 ? (
                  <>
                    <p>Pick a few favorites, or keep your options open.</p>
                    <div className="chips">
                      {categories.map((c, i) => (
                        <button
                          type="button"
                          key={c}
                          aria-pressed={cats.includes(c)}
                          className={cats.includes(c) ? 'selected' : ''}
                          onClick={() =>
                            setCats(
                              cats.includes(c)
                                ? cats.filter((x) => x !== c)
                                : [...cats, c],
                            )
                          }
                        >
                          {emojis[i]} {c}
                        </button>
                      ))}
                      <button
                        type="button"
                        className={!cats.length ? 'selected' : ''}
                        aria-pressed={!cats.length}
                        onClick={() => setCats([])}
                      >
                        ✨ Anything
                      </button>
                    </div>
                    <p className="hint">
                      Choose as many as you like. Some categories are not in our
                      starter catalog yet.
                    </p>
                  </>
                ) : (
                  <>
                    <p>A place to start, wherever your day takes you.</p>
                    <label htmlFor="zip">
                      US ZIP code <span className="required">Required</span>
                    </label>
                    <input
                      id="zip"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={5}
                      value={zip}
                      placeholder="e.g. 02108"
                      onChange={(e) => setZip(e.target.value)}
                      aria-describedby="location-help"
                    />
                    <label>Search radius</label>
                    <Choice
                      label="Search radius"
                      value={radius}
                      onChange={setRadius}
                      options={[5, 10, 25].map((n) => ({
                        value: String(n),
                        label: `${n} miles`,
                      }))}
                    />
                    <div className="notice" id="location-help">
                      <b>Limited location demo</b>
                      <p>
                        Try{' '}
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setZip('10001')}
                        >
                          10001
                        </button>{' '}
                        (New York) or{' '}
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setZip('02108')}
                        >
                          02108
                        </button>{' '}
                        (Boston). Nutrition comes from official guides. Branches
                        and distances are not connected, so we cannot verify
                        your radius.
                      </p>
                    </div>
                  </>
                )}
                <div className="form-actions">
                  {step > 1 && (
                    <button type="button" onClick={() => move(step - 1)}>
                      ← Back
                    </button>
                  )}
                  <button className="primary" type="submit" disabled={busy}>
                    {busy
                      ? 'Finding your meals…'
                      : step === 3
                        ? 'Find my meals'
                        : step === 1
                          ? 'Next: what sounds good →'
                          : 'Next: your location →'}
                  </button>
                </div>
              </form>
            </section>
            <aside>
              <div className="aside-top">
                <span className="eyebrow">ON THE MENU</span>
                <h2>
                  A better fit.
                  <br />
                  Still your favorites.
                </h2>
                <p>
                  Real menu items. Clear nutrition.
                  <br />A meal that works for you.
                </p>
              </div>
              <img
                className="food-photo"
                src="https://www.chick-fil-a.com/wp-content/uploads/sites/2/2025/06/nuggets_8ct_PDP_Desk.png"
                alt="Chick-fil-A eight-count nuggets"
              />
              <div className="aside-bottom">
                <span className="pill">FROM OFFICIAL NUTRITION GUIDES</span>
                <h3>Less guesswork. More good food.</h3>
                <p>
                  See exactly what’s in each meal, with sources you can check.
                </p>
                <div className="chain-list">
                  Panda Express · Chick-fil-A · Chipotle
                </div>
              </div>
            </aside>
          </div>
        ) : screen === 'saved' ? (
          <section>
            <div className="results-heading">
              <h2 ref={titleRef} tabIndex={-1}>
                Your saved meals
              </h2>
              <button onClick={() => setScreen(result ? 'results' : 'search')}>
                ← Back to meals
              </button>
            </div>
            <p>
              Saved on this browser. Nutrition may change; check sources before
              ordering.
            </p>
            {busy ? (
              <p role="status">Loading saved meals…</p>
            ) : (
              <>
                {!catalog.some((m) => favorites.includes(m.id)) && (
                  <div className="empty">
                    No saved meals yet. Tap the heart on a meal to keep it here.
                  </div>
                )}
                <div className="meal-grid">
                  {catalog.filter((m) => favorites.includes(m.id)).map(card)}
                </div>
              </>
            )}
          </section>
        ) : (
          <section aria-live="polite">
            <div className="results-heading">
              <div>
                <h2 ref={titleRef} tabIndex={-1}>
                  Let’s find your fit.
                </h2>
                <p>
                  {applied.calories.value} ± {applied.calories.tolerance} cal ·{' '}
                  {applied.categories.join(', ') || 'Anything'} · {applied.zip}{' '}
                  · {applied.radius} miles requested
                </p>
              </div>
              <button
                onClick={() => {
                  setScreen('search');
                  setStep(1);
                }}
              >
                Edit filters
              </button>
            </div>
            <div className="notice">{result.coverage.message}</div>
            <div className="sort-row">
              <span>Sorted by a clear rule. No match scores.</span>
              <Choice
                label="Sort meals"
                value={sort}
                onChange={setSort}
                options={[
                  { value: 'calories', label: 'Closest calorie match' },
                  { value: 'protein', label: 'Highest protein' },
                  {
                    value: 'distance',
                    label: 'Distance (unavailable)',
                    disabled: !result.strict.some(
                      (m: any) => m.distance !== null,
                    ),
                  },
                ]}
              />
            </div>
            <h3>Strict matches · {result.strict.length}</h3>
            {!result.strict.length && (
              <div className="empty">
                <b>No verified matches for every filter.</b>
                <p>
                  {result.coverage.supported
                    ? 'We cannot verify a branch within your radius. The separate demo section below shows meals that meet your nutrition and category preferences.'
                    : 'This ZIP is outside our demo coverage. Edit your filters to use an example ZIP.'}
                </p>
              </div>
            )}
            <div className="meal-grid">{sorted(result.strict).map(card)}</div>
            {result.coverage.supported && (
              <>
                <div className="section-heading">
                  <span className="eyebrow">NATIONAL MENU DEMO</span>
                  <h2>Nutrition matches · {result.demo.length}</h2>
                  <p>
                    These meet every active nutrient and category preference.
                    Location is unverified.
                  </p>
                </div>
                {!result.demo.length && (
                  <div className="empty">
                    No nutrition matches. Try editing your goals or categories;
                    no filters were relaxed.
                  </div>
                )}
                <div className="meal-grid">{sorted(result.demo).map(card)}</div>
                {result.near.length > 0 && (
                  <>
                    <div className="section-heading">
                      <span className="eyebrow">
                        DOES NOT MEET EVERY FILTER
                      </span>
                      <h2>Near matches</h2>
                      <p>
                        Up to 8 alternatives. Each missing constraint is listed
                        on the card.
                      </p>
                    </div>
                    <div className="meal-grid">
                      {sorted(result.near).slice(0, 8).map(card)}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        )}
        <footer>
          Nutrition and menu availability can vary. National menu listings do
          not confirm branch stock.<span>Local preview · Location demo</span>
        </footer>
      </main>
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="meal-dialog">
          <DialogTitle>{detail?.name}</DialogTitle>
          <DialogDescription>
            {detail?.restaurant} · Exact included portions
          </DialogDescription>
          {detail && (
            <>
              <p>{detail.note}</p>
              <div className="table-scroll">
                <table>
                  <caption>
                    Nutrition per included component, multiplied by quantity
                  </caption>
                  <thead>
                    <tr>
                      <th>Included item</th>
                      {nutrients.map((n) => (
                        <th key={n}>{n === 'calories' ? 'Cal' : n + ' (g)'}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.components.map((c: any) => (
                      <tr key={c.item.id}>
                        <th>
                          {c.quantity} × {c.item.name}
                          <small>{c.item.serving}</small>
                        </th>
                        {nutrients.map((n) => (
                          <td key={n}>
                            {c.item[n] === null
                              ? 'Unknown'
                              : Math.round(c.item[n] * c.quantity * 100) / 100}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <th>Total</th>
                      {nutrients.map((n) => (
                        <td key={n}>{detail.totals[n] ?? 'Unknown'}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              {detail.components.map((c: any) => (
                <div key={c.item.id} className="source-row">
                  <a target="_blank" rel="noreferrer" href={c.item.source}>
                    {c.item.name} — official source ↗
                  </a>
                  <small>
                    Checked {c.item.checked}. {c.item.note}
                  </small>
                </div>
              ))}
              <p className="hint">
                Unknown nutrition is not zero. Branch availability is
                unverified. Nutrition and portions can vary.
              </p>
              <button onClick={() => toggle(detail.id)}>
                {favorites.includes(detail.id)
                  ? '♥ Saved — remove'
                  : '♡ Save meal'}
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
