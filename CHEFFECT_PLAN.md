# Cheffect Implementation Plan

A fluent builder DSL describing the implementation roadmap for Cheffect.

```typescript
import { Plan, Feature, Acceptance, Context, Phase, Constraint } from "@plan/dsl"

// ============================================================================
// PLAN IDENTITY
// ============================================================================

export const plan = Plan.make("Cheffect MVP")
  .version("0.1.0")
  .goal("Local-first recipe tracking with AI-powered extraction and grocery planning")
  .architecture("See ARCHITECTURE.md")
  .domain("See DOMAIN.md")

// ============================================================================
// CONTEXT (Self-contained domain knowledge for agent)
// ============================================================================

const context = Context.make()

  // --- Entities ---
  .entity("Recipe", {
    fields: [
      "id: string (primaryKey, generatedByApp)",
      "title: string",
      "imageUrl: string | null",
      "prepTime: Duration | null",
      "cookingTime: Duration | null",
      "rating: Rating(1-5) | null",
      "servings: number | null",
      "ingredients: IngredientsComponent[] (JSON)",
      "steps: Step[] (JSON)",
      "createdAt: DateTime (auto)",
      "updatedAt: DateTime (auto)",
      "deletedAt: DateTime | null (softDelete)",
    ],
    computed: ["totalTime = prepTime + cookingTime"],
    events: ["RecipeCreated", "RecipeUpdated", "RecipeDeleted"],
  })

  .entity("IngredientsComponent", {
    fields: [
      "name: string (e.g., 'Marinade', 'Filling')",
      "ingredients: Ingredient[]",
    ],
  })

  .entity("Ingredient", {
    fields: [
      "name: string",
      "quantity: number | null",
      "unit: Unit | null (g, kg, ml, l, tsp, tbsp, cup, oz, lb)",
    ],
    computed: ["quantityWithUnit = `${quantity} ${unit}`"],
  })

  .entity("Step", {
    fields: [
      "text: string",
      "tips: string[]",
    ],
  })

  .entity("GroceryItem", {
    fields: [
      "id: string (primaryKey, generatedByApp)",
      "name: string",
      "quantity: string | null",
      "aisle: GroceryAisle | null",
      "completed: boolean (default: false)",
      "createdAt: DateTime (auto)",
      "updatedAt: DateTime (auto)",
    ],
    events: [
      "GroceryItemAdded",
      "GroceryItemUpdated",
      "GroceryItemToggled",
      "GroceryItemDeleted",
      "GroceryItemCleared",
      "GroceryItemClearedCompleted",
    ],
  })

  .entity("SearchState (clientDocument)", {
    fields: [
      "query: string (default: '')",
      "sortBy: 'title' | 'createdAt' (default: 'title')",
    ],
    events: ["SearchStateSet"],
    note: "Local-only, not synced",
  })

  .valueType("GroceryAisle", [
    "Bakery", "Dairy & Eggs", "Meat & Seafood", "Produce",
    "Pantry", "Frozen Foods", "Beverages", "Snacks",
  ])

  .valueType("Rating", "number between 1-5, branded type")

  // --- Capabilities ---
  .capability("AI Recipe Extraction", {
    input: "URL (string)",
    output: "Recipe",
    via: ["CorsProxy (fetch HTML)", "OpenAI gpt-4-mini (extract structured data)"],
    flow: [
      "1. Fetch HTML via CorsProxy",
      "2. Strip to text content",
      "3. Send to OpenAI with ExtractedRecipe schema",
      "4. Convert to Recipe entity with generated ID",
    ],
  })

  .capability("Grocery Beautify", {
    input: "GroceryItem[]",
    output: "{ updated: GroceryItem[], removed: GroceryItem[] }",
    via: ["OpenAI o4-mini with reasoning"],
    flow: [
      "1. Encode incomplete items as XML",
      "2. AI merges similar items, assigns aisles, cleans names",
      "3. Return updated items and IDs to remove",
    ],
  })

// ============================================================================
// FEATURES (Acceptance-level tasks)
// ============================================================================

const RecipeManagement = Feature.make("Recipe Management")
  .accepts([
    Acceptance.make("User can view a list of all recipes")
      .given("Recipes exist in the database")
      .when("User navigates to home page (/)")
      .then("Recipes are displayed as cards with title, image, time"),

    Acceptance.make("User can search recipes by title")
      .given("Multiple recipes exist")
      .when("User types in the search input")
      .then("List filters in real-time to matching titles"),

    Acceptance.make("User can sort recipes")
      .given("Multiple recipes exist")
      .when("User selects 'Latest' or 'Title' sort option")
      .then("List reorders accordingly"),

    Acceptance.make("User can view recipe details")
      .given("A recipe exists")
      .when("User clicks on a recipe card")
      .then("Full recipe page shows: title, image, times, servings, rating, ingredients by component, steps with tips"),

    Acceptance.make("User can add a recipe from a URL")
      .given("User has a recipe URL from any cooking website")
      .when("User enters URL and clicks extract")
      .then("AI extracts recipe data and saves it locally"),

    Acceptance.make("User can manually create a recipe")
      .given("User wants to add a recipe without URL")
      .when("User fills out the recipe form with title, ingredients, steps")
      .then("Recipe is saved with all fields"),

    Acceptance.make("User can edit an existing recipe")
      .given("A recipe exists")
      .when("User clicks edit, modifies fields, and saves")
      .then("Changes persist locally and updatedAt is updated"),

    Acceptance.make("User can delete a recipe")
      .given("A recipe exists")
      .when("User clicks delete and confirms")
      .then("Recipe is soft-deleted (deletedAt timestamp set, no longer visible)"),

    Acceptance.make("User can rate a recipe")
      .given("A recipe exists")
      .when("User selects a 1-5 star rating")
      .then("Rating is saved to the recipe"),
  ])

const GroceryManagement = Feature.make("Grocery List")
  .accepts([
    Acceptance.make("User can view grocery list")
      .given("Grocery items exist")
      .when("User navigates to /groceries")
      .then("Items are displayed grouped by aisle"),

    Acceptance.make("User can add recipe ingredients to grocery list")
      .given("User is viewing a recipe with ingredients")
      .when("User clicks 'Add to groceries' button")
      .then("All ingredients are added as grocery items"),

    Acceptance.make("User can manually add a grocery item")
      .given("User is on grocery list page")
      .when("User fills out add item form")
      .then("Item is added to the list"),

    Acceptance.make("User can check off grocery items")
      .given("Grocery items exist")
      .when("User taps/clicks the checkbox")
      .then("Item is marked completed (strikethrough)"),

    Acceptance.make("User can clear completed items")
      .given("Some items are marked completed")
      .when("User clicks 'Clear completed'")
      .then("Completed items are removed from the list"),

    Acceptance.make("User can clear all items")
      .given("Grocery items exist")
      .when("User clicks 'Clear all' and confirms")
      .then("All items are removed from the list"),

    Acceptance.make("User can beautify groceries with AI")
      .given("Messy ingredient items exist (e.g., '2 cups chopped onion', '1 onion diced')")
      .when("User clicks 'Beautify' button")
      .then("AI merges similar items, assigns aisles, cleans names"),

    Acceptance.make("User can export groceries to CSV")
      .given("Grocery items exist")
      .when("User clicks export")
      .then("CSV file downloads with id, name, quantity, aisle columns"),
  ])

const MealPlanning = Feature.make("Meal Planning")
  .status("Future")
  .accepts([
    Acceptance.make("User can plan meals for the week")
      .given("Recipes exist")
      .when("User assigns recipes to days")
      .then("Meal plan is saved and visible on /plan"),
  ])

// ============================================================================
// PHASES (Implementation order)
// ============================================================================

const Phase1 = Phase.make("Foundation")
  .milestone("Data layer complete, events flow, no UI")
  .includes([
    "Initialize Vite + React + TypeScript project",
    "Setup LiveStore with OPFS adapter",
    "Define schema: tables, events, materializers",
    "Create domain entities (Recipe, GroceryItem, etc.)",
    "Create query atoms (allRecipes, recipeById, allGroceryItems, searchState)",
    "Verify events materialize correctly in DevTools",
  ])
  .constraints([
    "No external API calls",
    "No UI components",
    "Focus on data correctness",
  ])

const Phase2 = Phase.make("Core UI")
  .after(Phase1)
  .milestone("User can CRUD recipes through UI")
  .features([RecipeManagement])
  .includes([
    "Setup TanStack Router with file-based routes",
    "Create root layout with navigation",
    "Recipe list page (/) with search and sort",
    "Recipe detail page (/recipe/:id)",
    "Recipe form component (create + edit)",
    "Add recipe page (/add)",
    "Edit recipe page (/edit/:id)",
    "Delete confirmation flow",
    "Tailwind + Shadcn UI components",
  ])
  .constraints([
    "No AI features yet",
    "Manual recipe entry only",
  ])

const Phase3 = Phase.make("AI Features")
  .after(Phase2)
  .milestone("AI extraction and beautify work end-to-end")
  .includes([
    "Create CorsProxy service",
    "Create AiHelpers Effect service",
    "Integrate OpenAI for recipe extraction",
    "Add URL input to recipe creation flow",
    "Implement grocery beautify with AI",
    "Handle loading states and errors",
  ])
  .constraints([
    "Requires VITE_OPENAI_API_KEY environment variable",
    "Graceful fallback if API unavailable",
  ])

const Phase4 = Phase.make("Grocery & Polish")
  .after(Phase3)
  .milestone("Full MVP complete with groceries and PWA")
  .features([GroceryManagement])
  .includes([
    "Grocery list page (/groceries)",
    "'Add to groceries' button on recipe page",
    "Grocery item toggle, clear, delete",
    "Aisle grouping display",
    "CSV export",
    "PWA manifest and service worker",
    "Mobile-responsive polish",
    "Settings page (/settings)",
  ])

const Phase5 = Phase.make("Sync (Future)")
  .after(Phase4)
  .status("Planned")
  .milestone("Multi-device sync via Cloudflare")
  .includes([
    "Setup Cloudflare Durable Object",
    "Configure @livestore/sync-cf",
    "Handle conflict resolution",
    "Add user authentication",
  ])

// ============================================================================
// GLOBAL CONSTRAINTS
// ============================================================================

plan
  .addContext(context)
  .addFeature(RecipeManagement)
  .addFeature(GroceryManagement)
  .addFeature(MealPlanning)
  .addPhase(Phase1)
  .addPhase(Phase2)
  .addPhase(Phase3)
  .addPhase(Phase4)
  .addPhase(Phase5)

  // Architectural constraints
  .addConstraint("All mutations MUST go through events (event sourcing)")
  .addConstraint("Soft deletes only (set deletedAt, never hard delete)")
  .addConstraint("Local-first: app MUST work fully offline")
  .addConstraint("All synced events MUST be versioned (v1.EventName)")

  // Code quality constraints
  .addConstraint("Use Effect Schema for all domain types")
  .addConstraint("Use atoms for all reactive state")
  .addConstraint("Keep components in feature folders")
  .addConstraint("No console.log in production code")

  // UX constraints
  .addConstraint("Mobile-friendly responsive design")
  .addConstraint("Instant feedback for all actions (optimistic UI)")
  .addConstraint("Loading states for async operations")
  .addConstraint("Toast notifications for success/error")
```

---

## Quick Reference

| DSL Concept | Purpose |
|-------------|---------|
| `Plan.make()` | Root container with version, goal |
| `Context.entity()` | Domain knowledge (fields, events) |
| `Context.capability()` | AI/service capabilities |
| `Feature.make().accepts([])` | Group of acceptance criteria |
| `Acceptance.given().when().then()` | BDD-style outcome |
| `Phase.make().after().milestone()` | Implementation order |
| `.addConstraint()` | Global invariants |

## Status Legend

- **No status**: Active, should be implemented
- `status("Future")`: Planned but not in current scope
- `status("Planned")`: Will be implemented after MVP

## Agent Instructions

When implementing a phase:
1. Read the `includes` list for specific tasks
2. Check `constraints` for rules to follow
3. Reference `features` for acceptance criteria
4. Use `context` for domain knowledge
5. Verify milestone is achievable before moving to next phase
