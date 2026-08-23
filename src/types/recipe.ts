// Types pour les recettes

export interface Ingredient {
  name: string;
  quantity: number | null; // null pour "au goût"
  unit: string; // 'g', 'kg', 'L', 'ml', 'piece', 'c. à soupe', etc.
}

export interface Step {
  description: string;
  time?: number; // en minutes (optionnel)
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string; // 'entrée', 'plat', 'dessert', 'accompagnement', etc.
  prepTime: number; // en minutes
  cookTime?: number; // en minutes (optionnel)
  portions: number; // portions de base
  difficulty?: 'facile' | 'moyenne' | 'difficile';
  ingredients: Ingredient[];
  steps: Step[];
  image?: string; // URL ou base64
  tags?: string[]; // ex : ['végétarien', 'rapide', 'été']
  source?: string; // URL ou nom du livre de recettes
  createdAt: Date;
  updatedAt: Date;
}

// Type pour une recette dans le menu hebdomadaire
export interface MealPlanItem {
  id: string;
  recipeId: string;
  day: Date; // Date du jour
  portions: number; // Peut différer de la recette de base
  notes?: string;
}

// Type pour un élément de la liste de courses
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  category?: string; // ex : 'fruits', 'légumes', 'épicerie', 'surgelés'
  checked: boolean;
  recipeIds?: string[]; // Pour tracer d'où vient l'ingrédient
}

// Type pour la liste de courses globale
export interface ShoppingList {
  id: string;
  name: string; // ex : "Liste du 25/08"
  items: ShoppingListItem[];
  createdAt: Date;
}
