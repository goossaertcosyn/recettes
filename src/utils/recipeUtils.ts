import { Recipe, Ingredient, MealPlanItem, ShoppingListItem } from '../types/recipe';

/**
 * Parse une chaîne de quantité (ex: "200g", "2 pieces") en objet { quantity, unit }
 */
export const parseIngredient = (input: string): { quantity: number | null; unit: string } => {
  const trimmed = input.trim().toLowerCase();
  
  // Cas particulier : "au goût", "à volonté", etc.
  if (['au goût', 'à volonté', 'selon goût', ''].includes(trimmed)) {
    return { quantity: null, unit: '' };
  }

  // Expression régulière pour extraire la quantité et l'unité
  const match = trimmed.match(/^([\d.]+)\s*([a-zA-Zà-ü\s]*)$/);
  
  if (!match) {
    // Si pas de quantité numérique, on considère que c'est "au goût"
    return { quantity: null, unit: trimmed };
  }

  const quantity = parseFloat(match[1]);
  const unit = match[2].trim();

  return { quantity, unit };
};

/**
 * Formate un ingrédient en chaîne lisible (ex: "200g de tomates")
 */
export const formatIngredient = (ingredient: Ingredient): string => {
  if (ingredient.quantity === null) {
    return ingredient.name;
  }
  
  const quantityStr = ingredient.quantity % 1 === 0 
    ? ingredient.quantity.toString() 
    : ingredient.quantity.toFixed(2);
  
  return `${quantityStr} ${ingredient.unit} ${ingredient.name}`;
};

/**
 * Génère un ID unique
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

/**
 * Calcule le facteur de mise à l'échelle pour les portions
 */
export const getPortionScaleFactor = (originalPortions: number, targetPortions: number): number => {
  return targetPortions / originalPortions;
};

/**
 * Met à l'échelle les ingrédients d'une recette pour un nombre de portions donné
 */
export const scaleRecipeIngredients = (recipe: Recipe, targetPortions: number): Ingredient[] => {
  const scaleFactor = getPortionScaleFactor(recipe.portions, targetPortions);
  
  return recipe.ingredients.map(ingredient => {
    if (ingredient.quantity === null) {
      return { ...ingredient };
    }
    
    return {
      ...ingredient,
      quantity: parseFloat((ingredient.quantity * scaleFactor).toFixed(2)),
    };
  });
};

/**
 * Fusionne les ingrédients similaires dans une liste de courses
 */
export const mergeShoppingListItems = (items: ShoppingListItem[]): ShoppingListItem[] => {
  const mergedMap = new Map<string, ShoppingListItem>();
  
  items.forEach(item => {
    const key = `${item.name.toLowerCase().trim()}-${item.unit}`;
    
    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key)!;
      if (existing.quantity !== null && item.quantity !== null) {
        mergedMap.set(key, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          checked: existing.checked && item.checked,
        });
      }
    } else {
      mergedMap.set(key, { ...item });
    }
  });
  
  return Array.from(mergedMap.values());
};

/**
 * Trie les éléments de la liste de courses par catégorie puis par nom
 */
export const sortShoppingListItems = (items: ShoppingListItem[]): ShoppingListItem[] => {
  return [...items].sort((a, b) => {
    // D'abord par catégorie
    const categoryA = a.category || '';
    const categoryB = b.category || '';
    
    if (categoryA < categoryB) return -1;
    if (categoryA > categoryB) return 1;
    
    // Puis par nom
    return a.name.localeCompare(b.name);
  });
};

/**
 * Assigne des catégories par défaut aux ingrédients
 */
export const getIngredientCategory = (ingredientName: string): string => {
  const lowerName = ingredientName.toLowerCase();
  
  const fruitKeywords = ['pomme', 'poire', 'banane', 'orange', 'fraise', 'tomate', 'citron', 'pêche', 'abricot', 'cerise'];
  const vegetableKeywords = ['carotte', 'poireau', 'pomme de terre', 'oignon', 'ail', 'courgette', 'aubergine', 'salade', 'épinard', 'brocoli'];
  const meatKeywords = ['poulet', 'bœuf', 'porc', 'agneau', 'canard', 'jambon', 'lardons', 'saucisse'];
  const fishKeywords = ['saumon', 'thon', 'cabillaud', 'sardine', 'crevette', 'moules'];
  const dairyKeywords = ['lait', 'fromage', 'yaourt', 'crème', 'beurre', 'mozzarella', 'parmesan'];
  const bakeryKeywords = ['pain', 'pâtes', 'farine', 'riz', 'biscuit', 'croissant'];
  const pantryKeywords = ['huile', 'vinaigre', 'sucre', 'sel', 'poivre', 'épice', 'cannelle', 'moutarde', 'ketchup'];
  const frozenKeywords = ['surgelé', 'glace', 'légume surgelé'];
  const drinkKeywords = ['eau', 'jus', 'vin', 'bière', 'café', 'thé'];
  
  if (fruitKeywords.some(keyword => lowerName.includes(keyword))) return 'Fruits';
  if (vegetableKeywords.some(keyword => lowerName.includes(keyword))) return 'Légumes';
  if (meatKeywords.some(keyword => lowerName.includes(keyword))) return 'Viandes';
  if (fishKeywords.some(keyword => lowerName.includes(keyword))) return 'Poissons';
  if (dairyKeywords.some(keyword => lowerName.includes(keyword))) return 'Produits laitiers';
  if (bakeryKeywords.some(keyword => lowerName.includes(keyword))) return 'Boulangerie';
  if (pantryKeywords.some(keyword => lowerName.includes(keyword))) return 'Épicerie';
  if (frozenKeywords.some(keyword => lowerName.includes(keyword))) return 'Surgelés';
  if (drinkKeywords.some(keyword => lowerName.includes(keyword))) return 'Boissons';
  
  return 'Autres';
};

/**
 * Formate une durée en minutes en chaîne lisible (ex: "1h 30min")
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Génère une recette aléatoire à partir d'une liste
 */
export const getRandomRecipe = (recipes: Recipe[]): Recipe | null => {
  if (recipes.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * recipes.length);
  return recipes[randomIndex];
};

/**
 * Génère un menu aléatoire pour une semaine (7 jours)
 */
export const generateWeeklyMealPlan = (recipes: Recipe[], portions: number = 2): MealPlanItem[] => {
  const mealPlan: MealPlanItem[] = [];
  const usedRecipeIds = new Set<string>();
  
  // On essaie d'avoir des recettes différentes chaque jour
  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setDate(day.getDate() + i);
    
    // Filtrer les recettes non utilisées ou si on a tout utilisé, on recommence
    const availableRecipes = recipes.filter(r => !usedRecipeIds.has(r.id));
    const recipe = availableRecipes.length > 0 
      ? getRandomRecipe(availableRecipes)!
      : getRandomRecipe(recipes)!;
    
    if (recipe) {
      usedRecipeIds.add(recipe.id);
      mealPlan.push({
        id: generateId(),
        recipeId: recipe.id,
        day,
        portions,
      });
    }
  }
  
  return mealPlan;
};
