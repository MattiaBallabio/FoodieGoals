import { getMeals } from '@/lib/database';
export async function GET() {
  try {
    return Response.json(await getMeals());
  } catch {
    return Response.json(
      { error: 'Meal database unavailable.' },
      { status: 503 },
    );
  }
}
