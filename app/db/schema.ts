import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
export const restaurants = sqliteTable('restaurants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});
export const menuItems = sqliteTable('menu_items', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurant_id')
    .notNull()
    .references(() => restaurants.id),
  record: text('record').notNull(),
});
export const meals = sqliteTable('meals', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurant_id')
    .notNull()
    .references(() => restaurants.id),
  record: text('record').notNull(),
});
export const mealComponents = sqliteTable('meal_components', {
  id: text('id').primaryKey(),
  mealId: text('meal_id')
    .notNull()
    .references(() => meals.id),
  itemId: text('item_id')
    .notNull()
    .references(() => menuItems.id),
  quantity: real('quantity').notNull(),
});
export const locations = sqliteTable('locations', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurant_id')
    .notNull()
    .references(() => restaurants.id),
  record: text('record').notNull(),
});
