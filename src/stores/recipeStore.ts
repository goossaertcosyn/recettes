import { create } from 'zustand';
import { Recipe, MealPlanItem, ShoppingList, ShoppingListItem } from '../types/recipe';
import { openDB } from 'idb';

// Nom de la base de données IndexedDB
const DB_NAME = 'RecettesDB';
const STORE_NAMES = {
  RECIPES: 'recipes',
  MEAL_PLANS: 'mealPlans',
  SHOPPING_LISTS: 'shoppingLists',
};

// Version de la base de données
const DB_VERSION = 1;

// Initialisation de la base de données IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAMES.RECIPES)) {
        db.createObjectStore(STORE_NAMES.RECIPES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_NAMES.MEAL_PLANS)) {
        db.createObjectStore(STORE_NAMES.MEAL_PLANS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_NAMES.SHOPPING_LISTS)) {
        db.createObjectStore(STORE_NAMES.SHOPPING_LISTS, { keyPath: 'id' });
      }
    },
  });
};

// Fonctions pour gérer les recettes dans IndexedDB
const recipeDB = {
  async getAllRecipes(): Promise<Recipe[]> {
    const db = await initDB();
    return db.getAll(STORE_NAMES.RECIPES);
  },

  async getRecipeById(id: string): Promise<Recipe | undefined> {
    const db = await initDB();
    return db.get(STORE_NAMES.RECIPES, id);
  },

  async addRecipe(recipe: Recipe): Promise<void> {
    const db = await initDB();
    await db.add(STORE_NAMES.RECIPES, recipe);
  },

  async updateRecipe(recipe: Recipe): Promise<void> {
    const db = await initDB();
    await db.put(STORE_NAMES.RECIPES, recipe);
  },

  async deleteRecipe(id: string): Promise<void> {
    const db = await initDB();
    await db.delete(STORE_NAMES.RECIPES, id);
  },

  async importRecipes(recipes: Recipe[]): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(STORE_NAMES.RECIPES, 'readwrite');
    const store = tx.objectStore(STORE_NAMES.RECIPES);
    
    // Effacer toutes les recettes existantes
    await store.clear();
    
    // Ajouter les nouvelles recettes
    for (const recipe of recipes) {
      await store.add(recipe);
    }
    
    await tx.done;
  },

  async exportRecipes(): Promise<Recipe[]> {
    return this.getAllRecipes();
  },
};

// Fonctions pour gérer les menus dans IndexedDB
const mealPlanDB = {
  async getAllMealPlans(): Promise<MealPlanItem[]> {
    const db = await initDB();
    return db.getAll(STORE_NAMES.MEAL_PLANS);
  },

  async getMealPlanById(id: string): Promise<MealPlanItem | undefined> {
    const db = await initDB();
    return db.get(STORE_NAMES.MEAL_PLANS, id);
  },

  async addMealPlan(mealPlan: MealPlanItem): Promise<void> {
    const db = await initDB();
    await db.add(STORE_NAMES.MEAL_PLANS, mealPlan);
  },

  async updateMealPlan(mealPlan: MealPlanItem): Promise<void> {
    const db = await initDB();
    await db.put(STORE_NAMES.MEAL_PLANS, mealPlan);
  },

  async deleteMealPlan(id: string): Promise<void> {
    const db = await initDB();
    await db.delete(STORE_NAMES.MEAL_PLANS, id);
  },

  async clearMealPlans(): Promise<void> {
    const db = await initDB();
    await db.clear(STORE_NAMES.MEAL_PLANS);
  },
};

// Fonctions pour gérer les listes de courses dans IndexedDB
const shoppingListDB = {
  async getAllShoppingLists(): Promise<ShoppingList[]> {
    const db = await initDB();
    return db.getAll(STORE_NAMES.SHOPPING_LISTS);
  },

  async getShoppingListById(id: string): Promise<ShoppingList | undefined> {
    const db = await initDB();
    return db.get(STORE_NAMES.SHOPPING_LISTS, id);
  },

  async addShoppingList(shoppingList: ShoppingList): Promise<void> {
    const db = await initDB();
    await db.add(STORE_NAMES.SHOPPING_LISTS, shoppingList);
  },

  async updateShoppingList(shoppingList: ShoppingList): Promise<void> {
    const db = await initDB();
    await db.put(STORE_NAMES.SHOPPING_LISTS, shoppingList);
  },

  async deleteShoppingList(id: string): Promise<void> {
    const db = await initDB();
    await db.delete(STORE_NAMES.SHOPPING_LISTS, id);
  },

  async clearShoppingLists(): Promise<void> {
    const db = await initDB();
    await db.clear(STORE_NAMES.SHOPPING_LISTS);
  },
};

// Store Zustand pour gérer l'état global de l'application
interface AppState {
  recipes: Recipe[];
  mealPlans: MealPlanItem[];
  shoppingLists: ShoppingList[];
  currentShoppingList: ShoppingList | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchRecipes: () => Promise<void>;
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  importRecipesFromJson: (recipes: Recipe[]) => Promise<void>;
  
  fetchMealPlans: () => Promise<void>;
  addMealPlan: (mealPlan: MealPlanItem) => Promise<void>;
  updateMealPlan: (mealPlan: MealPlanItem) => Promise<void>;
  deleteMealPlan: (id: string) => Promise<void>;
  clearMealPlans: () => Promise<void>;
  
  fetchShoppingLists: () => Promise<void>;
  addShoppingList: (shoppingList: ShoppingList) => Promise<void>;
  updateShoppingList: (shoppingList: ShoppingList) => Promise<void>;
  deleteShoppingList: (id: string) => Promise<void>;
  setCurrentShoppingList: (shoppingList: ShoppingList | null) => void;
  clearShoppingLists: () => Promise<void>;
  
  // Fonction pour générer une liste de courses à partir des menus
  generateShoppingListFromMealPlans: (mealPlans: MealPlanItem[], recipes: Recipe[]) => ShoppingListItem[];
}

const useRecipeStore = create<AppState>((set, get) => ({
  recipes: [],
  mealPlans: [],
  shoppingLists: [],
  currentShoppingList: null,
  isLoading: false,
  error: null,

  fetchRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const recipes = await recipeDB.getAllRecipes();
      set({ recipes, isLoading: false });
    } catch (err) {
      set({ error: 'Erreur lors du chargement des recettes', isLoading: false });
    }
  },

  addRecipe: async (recipe: Recipe) => {
    set({ isLoading: true, error: null });
    try {
      await recipeDB.addRecipe(recipe);
      await get().fetchRecipes();
    } catch (err) {
      set({ error: 'Erreur lors de l\'ajout de la recette', isLoading: false });
    }
  },

  updateRecipe: async (recipe: Recipe) => {
    set({ isLoading: true, error: null });
    try {
      await recipeDB.updateRecipe(recipe);
      await get().fetchRecipes();
    } catch (err) {
      set({ error: 'Erreur lors de la mise à jour de la recette', isLoading: false });
    }
  },

  deleteRecipe: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await recipeDB.deleteRecipe(id);
      await get().fetchRecipes();
    } catch (err) {
      set({ error: 'Erreur lors de la suppression de la recette', isLoading: false });
    }
  },

  importRecipesFromJson: async (recipes: Recipe[]) => {
    set({ isLoading: true, error: null });
    try {
      await recipeDB.importRecipes(recipes);
      await get().fetchRecipes();
    } catch (err) {
      set({ error: 'Erreur lors de l\'import des recettes', isLoading: false });
    }
  },

  fetchMealPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const mealPlans = await mealPlanDB.getAllMealPlans();
      set({ mealPlans, isLoading: false });
    } catch (err) {
      set({ error: 'Erreur lors du chargement des menus', isLoading: false });
    }
  },

  addMealPlan: async (mealPlan: MealPlanItem) => {
    set({ isLoading: true, error: null });
    try {
      await mealPlanDB.addMealPlan(mealPlan);
      await get().fetchMealPlans();
    } catch (err) {
      set({ error: 'Erreur lors de l\'ajout du menu', isLoading: false });
    }
  },

  updateMealPlan: async (mealPlan: MealPlanItem) => {
    set({ isLoading: true, error: null });
    try {
      await mealPlanDB.updateMealPlan(mealPlan);
      await get().fetchMealPlans();
    } catch (err) {
      set({ error: 'Erreur lors de la mise à jour du menu', isLoading: false });
    }
  },

  deleteMealPlan: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await mealPlanDB.deleteMealPlan(id);
      await get().fetchMealPlans();
    } catch (err) {
      set({ error: 'Erreur lors de la suppression du menu', isLoading: false });
    }
  },

  clearMealPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      await mealPlanDB.clearMealPlans();
      set({ mealPlans: [], isLoading: false });
    } catch (err) {
      set({ error: 'Erreur lors de la suppression des menus', isLoading: false });
    }
  },

  fetchShoppingLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const shoppingLists = await shoppingListDB.getAllShoppingLists();
      set({ shoppingLists, isLoading: false });
    } catch (err) {
      set({ error: 'Erreur lors du chargement des listes de courses', isLoading: false });
    }
  },

  addShoppingList: async (shoppingList: ShoppingList) => {
    set({ isLoading: true, error: null });
    try {
      await shoppingListDB.addShoppingList(shoppingList);
      await get().fetchShoppingLists();
    } catch (err) {
      set({ error: 'Erreur lors de l\'ajout de la liste de courses', isLoading: false });
    }
  },

  updateShoppingList: async (shoppingList: ShoppingList) => {
    set({ isLoading: true, error: null });
    try {
      await shoppingListDB.updateShoppingList(shoppingList);
      await get().fetchShoppingLists();
    } catch (err) {
      set({ error: 'Erreur lors de la mise à jour de la liste de courses', isLoading: false });
    }
  },

  deleteShoppingList: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await shoppingListDB.deleteShoppingList(id);
      await get().fetchShoppingLists();
    } catch (err) {
      set({ error: 'Erreur lors de la suppression de la liste de courses', isLoading: false });
    }
  },

  setCurrentShoppingList: (shoppingList: ShoppingList | null) => {
    set({ currentShoppingList: shoppingList });
  },

  clearShoppingLists: async () => {
    set({ isLoading: true, error: null });
    try {
      await shoppingListDB.clearShoppingLists();
      set({ shoppingLists: [], currentShoppingList: null, isLoading: false });
    } catch (err) {
      set({ error: 'Erreur lors de la suppression des listes de courses', isLoading: false });
    }
  },

  // Fonction pour générer une liste de courses à partir des menus
  generateShoppingListFromMealPlans: (mealPlans: MealPlanItem[], recipes: Recipe[]): ShoppingListItem[] => {
    const shoppingListMap = new Map<string, { quantity: number; unit: string; recipeIds: string[] }>();

    mealPlans.forEach((mealPlan) => {
      const recipe = recipes.find((r) => r.id === mealPlan.recipeId);
      if (!recipe) return;

      const portionRatio = mealPlan.portions / recipe.portions;

      recipe.ingredients.forEach((ingredient) => {
        if (ingredient.quantity === null) return; // On ignore les ingrédients sans quantité

        const key = ingredient.name.toLowerCase().trim();
        const scaledQuantity = ingredient.quantity * portionRatio;

        if (shoppingListMap.has(key)) {
          const existing = shoppingListMap.get(key)!;
          // Si l'unité est la même, on additionne
          if (existing.unit === ingredient.unit) {
            shoppingListMap.set(key, {
              ...existing,
              quantity: existing.quantity + scaledQuantity,
              recipeIds: [...existing.recipeIds, mealPlan.recipeId],
            });
          } else {
            // Sinon, on garde les deux séparément (ex : 2 tomates + 500g de tomates)
            shoppingListMap.set(`${key}-${ingredient.unit}`, {
              quantity: scaledQuantity,
              unit: ingredient.unit,
              recipeIds: [mealPlan.recipeId],
            });
          }
        } else {
          shoppingListMap.set(key, {
            quantity: scaledQuantity,
            unit: ingredient.unit,
            recipeIds: [mealPlan.recipeId],
          });
        }
      });
    });

    return Array.from(shoppingListMap.entries()).map(([name, data]) => ({
      id: `${name}-${Date.now()}`,
      name: name.split('-')[0], // On retire l'unité si elle était ajoutée
      quantity: data.quantity,
      unit: data.unit,
      checked: false,
      recipeIds: data.recipeIds,
    }));
  },
}));

export default useRecipeStore;
