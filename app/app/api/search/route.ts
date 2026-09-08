import { validateFilters, matchMeals } from '@/lib/matching';
import { DemoLocationProvider } from '@/lib/location';
import { getMeals } from '@/lib/database';
export async function POST(request: Request) {
  let filters;
  try {
    const text = await request.text();
    if (text.length > 12000)
      return Response.json({ error: 'Request too large.' }, { status: 413 });
    filters = validateFilters(JSON.parse(text));
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof SyntaxError ? 'Invalid JSON.' : (e as Error).message,
      },
      { status: 400 },
    );
  }
  try {
    const coverage = await new DemoLocationProvider().lookup(filters.zip);
    if (!coverage.supported)
      return Response.json({ coverage, strict: [], demo: [], near: [] });
    const meals = await getMeals();
    return Response.json({
      coverage,
      ...matchMeals(meals, filters, coverage.locations),
    });
  } catch (e) {
    console.error('Search database failure', e);
    return Response.json(
      {
        error:
          'Meal search is temporarily unavailable. Please try again. If you just installed FoodieGoals, run the database setup command in the README.',
      },
      { status: 503 },
    );
  }
}
