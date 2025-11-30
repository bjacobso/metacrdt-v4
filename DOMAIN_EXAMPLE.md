# Cheffect Domain Specification

A fluent builder DSL describing the recipe tracking application domain.

```typescript
import { App, Entity, Event, Query, Capability, Route } from "@domain/dsl"
import * as Schema from "effect/Schema"

// ============================================================================
// VALUE TYPES
// ============================================================================

const Unit = Schema.Literal(
  "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "oz", "lb", "inch", "cm", "mm", "fl oz", "pt", "qt"
)

const Rating = Schema.Number.pipe(Schema.brand("Rating"), Schema.between(1, 5))

const GroceryAisle = Schema.Literal(
  "Bakery", "Dairy & Eggs", "Meat & Seafood", "Produce", "Pantry", "Frozen Foods", "Beverages", "Snacks"
)

const SortBy = Schema.Literal("title", "createdAt")

// ============================================================================
// ENTITIES
// ============================================================================

const Ingredient = Entity.make("Ingredient")
  .addField("name", Schema.String)
  .addField("quantity", Schema.NullOr(Schema.Number))
  .addField("unit", Schema.NullOr(Unit))
  .addComputed("quantityWithUnit", (i) => `${i.quantity} ${i.unit}`)

const IngredientsComponent = Entity.make("IngredientsComponent")
  .addField("name", Schema.String)  // e.g., "Marinade", "Filling", "Cake"
  .addField("ingredients", Schema.Array(Ingredient))

const Step = Entity.make("Step")
  .addField("text", Schema.String)
  .addField("tips", Schema.Array(Schema.String))

const Recipe = Entity.make("Recipe")
  .addField("id", Schema.String, { primaryKey: true, generatedBy: "app" })
  .addField("title", Schema.String)
  .addField("imageUrl", Schema.NullOr(Schema.String))
  .addField("prepTime", Schema.NullOr(Schema.Duration))
  .addField("cookingTime", Schema.NullOr(Schema.Duration))
  .addField("rating", Schema.NullOr(Rating))
  .addField("servings", Schema.NullOr(Schema.Number))
  .addField("ingredients", Schema.Array(IngredientsComponent), { storage: "json" })
  .addField("steps", Schema.Array(Step), { storage: "json" })
  .addField("createdAt", Schema.DateTime, { auto: "insert" })
  .addField("updatedAt", Schema.DateTime, { auto: "update" })
  .addField("deletedAt", Schema.NullOr(Schema.DateTime), { softDelete: true })
  .addComputed("totalTime", (r) => Duration.sum(r.prepTime ?? 0, r.cookingTime ?? 0))

const RecipeTag = Entity.make("RecipeTag")
  .addField("id", Schema.String, { primaryKey: true })
  .addField("recipeId", Schema.String, { references: Recipe })
  .addField("tag", Schema.String)
  .addField("deletedAt", Schema.NullOr(Schema.DateTime), { softDelete: true })

const GroceryItem = Entity.make("GroceryItem")
  .addField("id", Schema.String, { primaryKey: true, generatedBy: "app" })
  .addField("name", Schema.String)
  .addField("quantity", Schema.NullOr(Schema.String))
  .addField("aisle", Schema.NullOr(GroceryAisle))
  .addField("completed", Schema.Boolean, { default: false })
  .addField("createdAt", Schema.DateTime, { auto: "insert" })
  .addField("updatedAt", Schema.DateTime, { auto: "update" })
  .addFactory("fromIngredient", (ingredient: Ingredient) => ({
    name: ingredient.name,
    quantity: ingredient.quantityWithUnit,
  }))

// Client-only document (not synced)
const SearchState = Entity.clientDocument("SearchState")
  .addField("query", Schema.String, { default: "" })
  .addField("sortBy", SortBy, { default: "title" })

// ============================================================================
// EVENTS (Mutations)
// ============================================================================

const RecipeEvents = Event.group("Recipe")
  .add(Event.synced("RecipeCreated").setPayload(Recipe))
  .add(Event.synced("RecipeUpdated").setPayload(Recipe.partial.requiring("id")))
  .add(Event.synced("RecipeDeleted").setPayload(Schema.Struct({ id: Schema.String, deletedAt: Schema.DateTime })))

const GroceryEvents = Event.group("Grocery")
  .add(Event.synced("GroceryItemAdded").setPayload(GroceryItem))
  .add(Event.synced("GroceryItemUpdated").setPayload(GroceryItem.pick("id", "name", "aisle", "quantity")))
  .add(Event.synced("GroceryItemToggled").setPayload(Schema.Struct({ id: Schema.String, completed: Schema.Boolean })))
  .add(Event.synced("GroceryItemDeleted").setPayload(Schema.Struct({ id: Schema.String })))
  .add(Event.synced("GroceryItemCleared").setPayload(Schema.Void))
  .add(Event.synced("GroceryItemClearedCompleted").setPayload(Schema.Void))

const SearchEvents = Event.group("Search")
  .add(Event.local("SearchStateSet").setPayload(SearchState))

// ============================================================================
// QUERIES (Reads)
// ============================================================================

const allRecipes = Query.make("allRecipes")
  .from(Recipe)
  .where((get) => {
    const { query } = get(SearchState)
    return query ? sql`title LIKE ${`%${query}%`}` : sql`1=1`
  })
  .orderBy((get) => get(SearchState).sortBy === "createdAt" ? "createdAt DESC" : "title ASC")
  .excludeDeleted()

const recipeById = Query.family("recipeById", (id: string) =>
  Query.make(`recipe:${id}`)
    .from(Recipe)
    .where(sql`id = ${id}`)
    .single()
)

const allGroceryItems = Query.make("allGroceryItems")
  .from(GroceryItem)
  .orderBy("aisle ASC, name DESC")
  .groupBy("aisle", { fallback: "Other" })

const searchState = Query.make("searchState")
  .from(SearchState)
  .single()

// ============================================================================
// CAPABILITIES (Features)
// ============================================================================

const aiRecipeExtraction = Capability.make("AI Recipe Extraction")
  .description("Extract structured recipe data from any URL using AI")
  .input(Schema.String)  // URL
  .output(Recipe)
  .uses("OpenAI/gpt-4-mini", "CorsProxy")
  .flow([
    "Fetch HTML via CorsProxy",
    "Strip to text content",
    "Send to OpenAI with ExtractedRecipe schema",
    "Convert to Recipe entity",
  ])

const groceryBeautify = Capability.make("Grocery Beautify")
  .description("Clean, merge, and categorize grocery items using AI")
  .input(Schema.Array(GroceryItem))
  .output(Schema.Struct({
    updated: Schema.Array(GroceryItem),
    removed: Schema.Array(GroceryItem),
  }))
  .uses("OpenAI/o4-mini")
  .flow([
    "Encode items as XML",
    "Send to AI with merge/categorize instructions",
    "Parse response, update items with new names/aisles",
    "Return updated and removed items",
  ])

const groceryExport = Capability.make("Grocery Export")
  .description("Export grocery list to CSV")
  .input(Schema.Array(GroceryItem))
  .output(Schema.String)  // CSV content

// ============================================================================
// ROUTES (UI Pages)
// ============================================================================

const routes = Route.group("Routes")
  .add(Route.make("/").page("RecipeList").description("Home - browse and search recipes"))
  .add(Route.make("/add").page("AddRecipe").description("Add recipe from URL or manual entry"))
  .add(Route.make("/recipe/:id").page("ViewRecipe").params({ id: Schema.String }))
  .add(Route.make("/edit/:id").page("EditRecipe").params({ id: Schema.String }))
  .add(Route.make("/groceries").page("GroceryList").description("Shopping list with aisle grouping"))
  .add(Route.make("/plan").page("MealPlanner").description("Weekly meal planning"))
  .add(Route.make("/settings").page("Settings").description("App settings"))

// ============================================================================
// APP DEFINITION
// ============================================================================

export const Cheffect = App.make("Cheffect")
  .description("Local-first recipe tracking with AI-powered extraction and grocery planning")
  .architecture("local-first")
  .storage("OPFS + SQLite via LiveStore")
  .sync("Cloudflare Durable Objects (prepared)")

  // Entities
  .addEntity(Recipe)
  .addEntity(RecipeTag)
  .addEntity(GroceryItem)
  .addEntity(SearchState)

  // Events
  .addEvents(RecipeEvents)
  .addEvents(GroceryEvents)
  .addEvents(SearchEvents)

  // Queries
  .addQuery(allRecipes)
  .addQuery(recipeById)
  .addQuery(allGroceryItems)
  .addQuery(searchState)

  // Capabilities
  .addCapability(aiRecipeExtraction)
  .addCapability(groceryBeautify)
  .addCapability(groceryExport)

  // Routes
  .addRoutes(routes)

  // Constraints
  .addConstraint("Rating must be 1-5")
  .addConstraint("Soft deletes only (deletedAt timestamp, never hard delete)")
  .addConstraint("All synced events are versioned (v1.EventName)")
  .addConstraint("SearchState is client-only, not synced")
```

## Quick Reference

| Concept | Pattern |
|---------|---------|
| **Entity** | `Entity.make("Name").addField().addComputed()` |
| **Event** | `Event.synced("Name").setPayload(Schema)` |
| **Query** | `Query.make("name").from(Entity).where().orderBy()` |
| **Capability** | `Capability.make("Name").input().output().uses()` |
| **Route** | `Route.make("/path").page("Component")` |
| **App** | `App.make("Name").addEntity().addEvents().addCapability()` |
