// Référentiel d'aliments normalisés pour homogénéiser les recettes
// et faciliter l'autocomplétion dans la liste de courses

export interface FoodReferenceItem {
  id: string;
  name: string; // Nom normalisé (singulier)
  category: string;
  defaultUnit: string; // Unité par défaut
  aliases: string[]; // Variantes de noms acceptées
  pluralName?: string; // Nom pluriel si différent
}

export interface FoodCategory {
  id: string;
  name: string;
  icon?: string;
}

// Catégories d'aliments
export const FOOD_CATEGORIES: FoodCategory[] = [
  { id: 'fruits', name: 'Fruits' },
  { id: 'legumes', name: 'Légumes' },
  { id: 'viandes', name: 'Viandes & Poissons' },
  { id: 'produits_laitiers', name: 'Produits laitiers' },
  { id: 'fromages', name: 'Fromages' },
  { id: 'feculents', name: 'Féculents' },
  { id: 'epicerie_salee', name: 'Épicerie salée' },
  { id: 'epicerie_sucree', name: 'Épicerie sucrée' },
  { id: 'boissons', name: 'Boissons' },
  { id: 'condiments', name: 'Condiments & Sauces' },
  { id: 'herbes_epices', name: 'Herbes & Épices' },
  { id: 'surgeles', name: 'Surgelés' },
  { id: 'conserves', name: 'Conserves' },
  { id: 'boulangerie', name: 'Boulangerie' },
  { id: 'divers', name: 'Divers' },
];

// Référentiel des aliments normalisés
export const FOOD_REFERENCE: FoodReferenceItem[] = [
  // Fruits
  {
    id: 'pomme',
    name: 'Pomme',
    category: 'fruits',
    defaultUnit: '',
    aliases: ['pomme', 'pommes'],
    pluralName: 'Pommes',
  },
  {
    id: 'banane',
    name: 'Banane',
    category: 'fruits',
    defaultUnit: '',
    aliases: ['banane', 'bananes'],
    pluralName: 'Bananes',
  },
  {
    id: 'citron_jaune',
    name: 'Citron jaune',
    category: 'fruits',
    defaultUnit: '',
    aliases: ['citron', 'citron jaune', 'citrons', 'citrons jaunes', 'jus de citron'],
    pluralName: 'Citrons jaunes',
  },
  {
    id: 'citron_vert',
    name: 'Citron vert',
    category: 'fruits',
    defaultUnit: '',
    aliases: ['citron vert', 'citrons verts', 'lime'],
    pluralName: 'Citrons verts',
  },
  {
    id: 'orange',
    name: 'Orange',
    category: 'fruits',
    defaultUnit: '',
    aliases: ['orange', 'oranges'],
    pluralName: 'Oranges',
  },
  {
    id: 'tomate',
    name: 'Tomate',
    category: 'legumes',
    defaultUnit: '',
    aliases: ['tomate', 'tomates', 'tomate chair'],
    pluralName: 'Tomates',
  },
  {
    id: 'tomate_concentre',
    name: 'Tomate concentré',
    category: 'conserves',
    defaultUnit: 'c. à café',
    aliases: ['tomate concentré', 'tomate concentrée', 'concentré de tomate', 'pâte de tomate'],
  },
  {
    id: 'tomate_concassee',
    name: 'Tomate concassée',
    category: 'conserves',
    defaultUnit: 'g',
    aliases: ['tomate concassée', 'tomates concassées', 'pulpe de tomate'],
  },
  {
    id: 'tomate_sechee',
    name: 'Tomate séchée',
    category: 'epicerie_salee',
    defaultUnit: 'g',
    aliases: ['tomate séchée', 'tomates séchées'],
    pluralName: 'Tomates séchées',
  },

  // Légumes
  {
    id: 'oignon_jaune',
    name: 'Oignon jaune',
    category: 'legumes',
    defaultUnit: '',
    aliases: ['oignon', 'oignon jaune', 'oignons', 'oignons jaunes'],
    pluralName: 'Oignons jaunes',
  },
  {
    id: 'oignon_rouge',
    name: 'Oignon rouge',
    category: 'legumes',
    defaultUnit: '',
    aliases: ['oignon rouge', 'oignons rouges'],
    pluralName: 'Oignons rouges',
  },
  {
    id: 'ail',
    name: 'Ail',
    category: 'legumes',
    defaultUnit: 'gousse',
    aliases: ['ail', 'gousse d\'ail', 'gousses d\'ail'],
  },
  {
    id: 'echalote',
    name: 'Échalote',
    category: 'legumes',
    defaultUnit: '',
    aliases: ['échalote', 'échalotes'],
    pluralName: 'Échalotes',
  },
  {
    id: 'poireau',
    name: 'Poireau',
    category: 'legumes',
    defaultUnit: '',
    aliases: ['poireau', 'poireaux'],
    pluralName: 'Poireaux',
  },
  {
    id: 'courgette',
    name: 'Courgette',
    category: 'legumes',
    defaultUnit: 'g',
    aliases: ['courgette', 'courgettes'],
    pluralName: 'Courgettes',
  },
  {
    id: 'champignon_paris',
    name: 'Champignon de Paris',
    category: 'legumes',
    defaultUnit: 'g',
    aliases: ['champignon', 'champignons', 'champignon de paris', 'champignons de paris'],
    pluralName: 'Champignons de Paris',
  },
  {
    id: 'epinard',
    name: 'Épinard',
    category: 'legumes',
    defaultUnit: 'poignée',
    aliases: ['épinard', 'épinards', 'pousses d\'épinards'],
    pluralName: 'Épinards',
  },
  {
    id: 'carotte',
    name: 'Carotte',
    category: 'legumes',
    defaultUnit: '',
    aliases: ['carotte', 'carottes'],
    pluralName: 'Carottes',
  },
  {
    id: 'salade',
    name: 'Salade',
    category: 'legumes',
    defaultUnit: '',
    aliases: ['salade', 'salade verte', 'laitue', 'feuille de salade'],
  },

  // Féculents
  {
    id: 'pates',
    name: 'Pâtes',
    category: 'feculents',
    defaultUnit: 'g',
    aliases: ['pâtes', 'pâte', 'pâtes alimentaires', 'linguine', 'penne', 'penne rigate'],
  },
  {
    id: 'pates_proteinees',
    name: 'Pâtes protéinées',
    category: 'feculents',
    defaultUnit: 'g',
    aliases: ['pâtes protéinées', 'penne rigate protéinées'],
  },
  {
    id: 'riz',
    name: 'Riz',
    category: 'feculents',
    defaultUnit: 'g',
    aliases: ['riz', 'riz blanc', 'riz basmati', 'riz thaï'],
  },
  {
    id: 'lentilles',
    name: 'Lentilles',
    category: 'feculents',
    defaultUnit: 'g',
    aliases: ['lentilles', 'lentille', 'lentilles cuites', 'lentilles vertes', 'lentilles corail'],
  },
  {
    id: 'pois_chiches',
    name: 'Pois chiches',
    category: 'conserves',
    defaultUnit: 'g',
    aliases: ['pois chiches', 'pois chiche', 'pois chiches cuits'],
  },
  {
    id: 'pomme_de_terre',
    name: 'Pomme de terre',
    category: 'legumes',
    defaultUnit: '',
    aliases: ['pomme de terre', 'pommes de terre', 'patate'],
    pluralName: 'Pommes de terre',
  },

  // Produits laitiers
  {
    id: 'lait',
    name: 'Lait',
    category: 'produits_laitiers',
    defaultUnit: 'ml',
    aliases: ['lait', 'lait entier', 'lait demi-écrémé', 'lait écrémé'],
  },
  {
    id: 'creme_liquide',
    name: 'Crème liquide',
    category: 'produits_laitiers',
    defaultUnit: 'ml',
    aliases: ['crème liquide', 'crème', 'crème fraîche liquide'],
  },
  {
    id: 'creme_fraiche',
    name: 'Crème fraîche',
    category: 'produits_laitiers',
    defaultUnit: 'c. à soupe',
    aliases: ['crème fraîche', 'crème fraîche épaisse'],
  },
  {
    id: 'yaourt_grec',
    name: 'Yaourt grec',
    category: 'produits_laitiers',
    defaultUnit: 'c. à soupe',
    aliases: ['yaourt grec', 'yaourt grec nature', 'yaourt à la grecque'],
  },

  // Fromages
  {
    id: 'burrata',
    name: 'Burrata',
    category: 'fromages',
    defaultUnit: '',
    aliases: ['burrata', 'burratas'],
  },
  {
    id: 'parmesan',
    name: 'Parmesan',
    category: 'fromages',
    defaultUnit: 'g',
    aliases: ['parmesan', 'parmesan râpé', 'parmigiano'],
  },
  {
    id: 'feta',
    name: 'Feta',
    category: 'fromages',
    defaultUnit: 'g',
    aliases: ['feta', 'fromage feta'],
  },
  {
    id: 'fromage_fouette',
    name: 'Fromage fouetté',
    category: 'fromages',
    defaultUnit: 'g',
    aliases: ['fromage fouetté', 'fromage à tartiner', 'cancoillotte'],
  },

  // Viandes & Poissons
  {
    id: 'poulet',
    name: 'Poulet',
    category: 'viandes',
    defaultUnit: 'g',
    aliases: ['poulet', 'blanc de poulet', 'cuisse de poulet', 'filet de poulet'],
  },
  {
    id: 'boeuf',
    name: 'Bœuf',
    category: 'viandes',
    defaultUnit: 'g',
    aliases: ['bœuf', 'viande de bœuf', 'steak', 'haché'],
  },
  {
    id: 'porc',
    name: 'Porc',
    category: 'viandes',
    defaultUnit: 'g',
    aliases: ['porc', 'viande de porc'],
  },
  {
    id: 'saumon',
    name: 'Saumon',
    category: 'viandes',
    defaultUnit: 'g',
    aliases: ['saumon', 'filet de saumon', 'saumon frais'],
  },

  // Œufs
  {
    id: 'oeuf',
    name: 'Œuf',
    category: 'viandes',
    defaultUnit: '',
    aliases: ['œuf', 'œufs', 'uf', 'ufs'],
    pluralName: 'Œufs',
  },

  // Épicerie salée
  {
    id: 'huile_olive',
    name: 'Huile d\'olive',
    category: 'condiments',
    defaultUnit: 'c. à café',
    aliases: ['huile d\'olive', 'huile d olive', 'huile'],
  },
  {
    id: 'sauce_tomate',
    name: 'Sauce tomate',
    category: 'conserves',
    defaultUnit: 'g',
    aliases: ['sauce tomate', 'sauce tomate basilic', 'coupe de tomate'],
  },

  // Épicerie sucrée
  {
    id: 'sucre',
    name: 'Sucre',
    category: 'epicerie_sucree',
    defaultUnit: 'g',
    aliases: ['sucre', 'sucre blanc', 'sucre en poudre'],
  },
  {
    id: 'miel',
    name: 'Miel',
    category: 'epicerie_sucree',
    defaultUnit: 'c. à café',
    aliases: ['miel', 'miel liquide'],
  },

  // Boissons
  {
    id: 'eau',
    name: 'Eau',
    category: 'boissons',
    defaultUnit: 'ml',
    aliases: ['eau', 'eau plate', 'eau gazeuse'],
  },
  {
    id: 'lait_coco',
    name: 'Lait de coco',
    category: 'boissons',
    defaultUnit: 'ml',
    aliases: ['lait de coco', 'lait coco'],
  },

  // Herbes & Épices
  {
    id: 'basilic',
    name: 'Basilic',
    category: 'herbes_epices',
    defaultUnit: 'brin',
    aliases: ['basilic', 'basilic frais', 'feuilles de basilic'],
  },
  {
    id: 'origan',
    name: 'Origan',
    category: 'herbes_epices',
    defaultUnit: 'pincée',
    aliases: ['origan', 'origan séché'],
  },
  {
    id: 'menthe',
    name: 'Menthe',
    category: 'herbes_epices',
    defaultUnit: 'bouquet',
    aliases: ['menthe', 'menthe fraîche', 'feuilles de menthe'],
  },
  {
    id: 'curry',
    name: 'Curry',
    category: 'herbes_epices',
    defaultUnit: 'c. à café',
    aliases: ['curry', 'poudre de curry'],
  },
  {
    id: 'cannelle',
    name: 'Cannelle',
    category: 'herbes_epices',
    defaultUnit: 'c. à café',
    aliases: ['cannelle', 'cannelle en poudre'],
  },

  // Surgelés
  {
    id: 'epinard_surgeles',
    name: 'Épinard surgelé',
    category: 'surgeles',
    defaultUnit: 'g',
    aliases: ['épinard surgelé', 'épinards surgelés'],
    pluralName: 'Épinards surgelés',
  },

  // Conserves
  {
    id: 'tomates_concassee',
    name: 'Tomates concassées',
    category: 'conserves',
    defaultUnit: 'g',
    aliases: ['tomates concassées', 'tomate concassée'],
  },

  // Boulangerie
  {
    id: 'pain',
    name: 'Pain',
    category: 'boulangerie',
    defaultUnit: '',
    aliases: ['pain', 'baguette', 'pain de campagne'],
  },

  // Divers
  {
    id: 'beurre_cacahuete',
    name: 'Beurre de cacahuète',
    category: 'epicerie_salee',
    defaultUnit: 'c. à café',
    aliases: ['beurre de cacahuète', 'beurre de cacahuetes', 'purée de cacahuète'],
  },
  {
    id: 'cacahuetes',
    name: 'Cacahuète',
    category: 'epicerie_salee',
    defaultUnit: 'g',
    aliases: ['cacahuète', 'cacahuètes', 'arachide'],
    pluralName: 'Cacahuètes',
  },
  {
    id: 'boulettes_vegetales',
    name: 'Boulettes végétales',
    category: 'viandes',
    defaultUnit: 'g',
    aliases: ['boulettes végétales', 'boulettes veggie', 'galette végétale'],
  },
];

// Fonction pour normaliser un nom d'ingrédient
export const normalizeIngredientName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[()]/g, '') // Retirer les parenthèses
    .replace(/\s+/g, ' '); // Normaliser les espaces
};

// Fonction pour trouver un aliment dans le référentiel
export const findFoodInReference = (
  name: string,
  category?: string
): FoodReferenceItem | null => {
  const normalizedName = normalizeIngredientName(name);
  
  // D'abord chercher une correspondance exacte ou par alias
  for (const food of FOOD_REFERENCE) {
    const foodNormalized = normalizeIngredientName(food.name);
    if (foodNormalized === normalizedName) {
      return food;
    }
    
    for (const alias of food.aliases) {
      const aliasNormalized = normalizeIngredientName(alias);
      if (aliasNormalized === normalizedName) {
        return food;
      }
    }
  }
  
  // Puis chercher par correspondance partielle
  for (const food of FOOD_REFERENCE) {
    const foodNormalized = normalizeIngredientName(food.name);
    if (normalizedName.includes(foodNormalized) || foodNormalized.includes(normalizedName)) {
      if (!category || food.category === category) {
        return food;
      }
    }
    
    for (const alias of food.aliases) {
      const aliasNormalized = normalizeIngredientName(alias);
      if (normalizedName.includes(aliasNormalized) || aliasNormalized.includes(normalizedName)) {
        if (!category || food.category === category) {
          return food;
        }
      }
    }
  }
  
  return null;
};

// Fonction pour obtenir les suggestions d'autocomplétion
export const getFoodSuggestions = (query: string, limit: number = 10): FoodReferenceItem[] => {
  const normalizedQuery = normalizeIngredientName(query);
  
  const matches: { food: FoodReferenceItem; score: number }[] = [];
  
  for (const food of FOOD_REFERENCE) {
    const foodNormalized = normalizeIngredientName(food.name);
    const aliasesNormalized = food.aliases.map(a => normalizeIngredientName(a));
    
    // Score de correspondance
    let score = 0;
    
    // Correspondance exacte
    if (foodNormalized === normalizedQuery) {
      score = 100;
    } else if (aliasesNormalized.includes(normalizedQuery)) {
      score = 95;
    }
    // Correspondance partielle au début
    else if (foodNormalized.startsWith(normalizedQuery)) {
      score = 80;
    } else if (aliasesNormalized.some(a => a.startsWith(normalizedQuery))) {
      score = 75;
    }
    // Correspondance partielle n'importe où
    else if (foodNormalized.includes(normalizedQuery)) {
      score = 60;
    } else if (aliasesNormalized.some(a => a.includes(normalizedQuery))) {
      score = 55;
    }
    
    if (score > 0) {
      matches.push({ food, score });
    }
  }
  
  // Trier par score décroissant, puis par nom
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.food.name.localeCompare(b.food.name);
  });
  
  return matches.slice(0, limit).map(m => m.food);
};

// Fonction pour obtenir tous les aliments d'une catégorie
export const getFoodsByCategory = (categoryId: string): FoodReferenceItem[] => {
  return FOOD_REFERENCE.filter(food => food.category === categoryId);
};

// Fonction pour normaliser un ingrédient avec le référentiel
export const normalizeIngredientWithReference = (
  ingredient: { name: string; quantity: number | null; unit: string }
): { name: string; quantity: number | null; unit: string } => {
  const food = findFoodInReference(ingredient.name);
  
  if (food) {
    // Utiliser le nom normalisé du référentiel
    const normalizedName = ingredient.name.includes('(') 
      ? food.name + ingredient.name.match(/\([^)]*\)/)?.[0] || ''
      : food.name;
    
    // Si l'unité est vide, utiliser l'unité par défaut du référentiel
    const normalizedUnit = ingredient.unit === '' || ingredient.unit === null
      ? food.defaultUnit
      : ingredient.unit;
    
    return {
      name: normalizedName,
      quantity: ingredient.quantity,
      unit: normalizedUnit,
    };
  }
  
  return ingredient;
};

export default FOOD_REFERENCE;
