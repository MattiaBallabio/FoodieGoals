import { env } from 'cloudflare:workers';
import { totalNutrition } from './matching';
export async function getMeals() {
  const db = (env as any).DB;
  const [meals, items, components, restaurants] = await Promise.all(
    ['meals', 'menu_items', 'meal_components', 'restaurants'].map((table) =>
      db.prepare(`SELECT * FROM ${table}`).all(),
    ),
  );
  const itemMap = new Map(
    items.results.map((i: any) => [i.id, JSON.parse(i.record)]),
  );
  const names = new Map(restaurants.results.map((r: any) => [r.id, r.name]));
  return meals.results
    .filter((row: any) => JSON.parse(row.record).verification === 'official')
    .map((row: any) => {
      const meal = JSON.parse(row.record);
      const parts = components.results
        .filter((c: any) => c.meal_id === row.id)
        .map((c: any) => ({
          quantity: c.quantity,
          item: itemMap.get(c.item_id),
        }));
      // Fail closed if an independent item update invalidated an existing meal.
      if (
        !parts.length ||
        parts.some(
          (c: any) =>
            !c.item ||
            c.item.verification !== 'official' ||
            c.item.restaurantId !== meal.restaurantId,
        )
      )
        return null;
      return {
        ...meal,
        restaurant: names.get(meal.restaurantId),
        components: parts,
        totals: totalNutrition(parts),
      };
    })
    .filter(Boolean);
}
