# Cheffect

> Local-first recipe tracking with AI-powered extraction and grocery planning.

## Entities

- **Recipe**: id, title, imageUrl, prepTime, cookingTime, rating (1-5), servings, ingredients[], steps[], createdAt, updatedAt, deletedAt
- **IngredientsComponent**: name (e.g., "Marinade"), ingredients[]
- **Ingredient**: name, quantity, unit
- **Step**: text, tips[]
- **GroceryItem**: id, name, quantity, aisle, completed, createdAt, updatedAt
- **SearchState** (client-only): query, sortBy

## Events

**Recipe**
- RecipeCreated, RecipeUpdated, RecipeDeleted (soft delete)

**Grocery**
- GroceryItemAdded, GroceryItemUpdated, GroceryItemToggled
- GroceryItemDeleted, GroceryItemCleared, GroceryItemClearedCompleted

**Search**
- SearchStateSet (local only, not synced)

## Features

**Recipe Management**
- [ ] View list of all recipes
- [ ] Search recipes by title (real-time filter)
- [ ] Sort by title or date added
- [ ] View recipe details (ingredients, steps, times)
- [ ] Add recipe from URL (AI extraction)
- [ ] Add recipe manually
- [ ] Edit existing recipe
- [ ] Delete recipe (soft delete)
- [ ] Rate recipe (1-5 stars)

**Grocery List**
- [ ] View grocery list grouped by aisle
- [ ] Add recipe ingredients to grocery list
- [ ] Add item manually
- [ ] Check off items
- [ ] Clear completed items
- [ ] Clear all items
- [ ] Beautify with AI (merge, categorize, clean names)
- [ ] Export to CSV

**AI Capabilities**
- Extract recipe from any URL (OpenAI + CorsProxy)
- Beautify groceries (merge duplicates, assign aisles)

## Constraints

- All mutations via events (event sourcing)
- Soft deletes only (set deletedAt, never hard delete)
- Synced events versioned as v1.EventName
- SearchState is client-only, not synced
- Works fully offline
- Mobile-friendly responsive UI

## Routes

- `/` - Recipe list with search
- `/add` - Add recipe (URL or manual)
- `/recipe/:id` - Recipe detail
- `/edit/:id` - Edit recipe
- `/groceries` - Shopping list
- `/plan` - Meal planner (future)
- `/settings` - Settings

## Phases

1. **Foundation** - Schema, entities, events, queries (no UI)
2. **Core UI** - Recipe list, detail, form, routing
3. **AI Features** - URL extraction, grocery beautify
4. **Grocery & Polish** - Grocery list, PWA, mobile polish
