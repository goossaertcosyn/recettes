import { useEffect, useState } from 'react';
import useRecipeStore from './stores/recipeStore';
import type { Recipe, ShoppingListItem } from './types/recipe';
import recipesData from './data/recipes.json';

// Fonction pour générer un ID stable basé sur le nom et l'unité
const generateStableItemId = (name: string, unit: string): string => {
  const normalizedName = name.toLowerCase().trim();
  const normalizedUnit = unit.toLowerCase().trim();
  return `${normalizedName}-${normalizedUnit}`;
};

function App() {
  const { recipes, fetchRecipes, importRecipesFromJson, generateShoppingListFromMealPlans, resetApp } = useRecipeStore();
  const [numPeople, setNumPeople] = useState<number>(2);
  const [numRecipes, setNumRecipes] = useState<number>(3);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger la shopping list complète depuis localStorage au chargement initial
  useEffect(() => {
    const savedShoppingList = localStorage.getItem('shoppingList');
    if (savedShoppingList) {
      try {
        const parsedList = JSON.parse(savedShoppingList) as ShoppingListItem[];
        setShoppingList(parsedList);
      } catch (e) {
        console.error('Erreur lors du chargement de la liste de courses', e);
      }
    }
  }, []);

  // Sauvegarder la shopping list complète dans localStorage à chaque changement
  useEffect(() => {
    if (shoppingList.length > 0) {
      localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    }
  }, [shoppingList]);

  // Sauvegarder aussi les recettes générées pour les restaurer
  useEffect(() => {
    if (generatedRecipes.length > 0) {
      localStorage.setItem('generatedRecipes', JSON.stringify(generatedRecipes));
    }
  }, [generatedRecipes]);

  // Charger les recettes générées depuis localStorage
  useEffect(() => {
    const savedRecipes = localStorage.getItem('generatedRecipes');
    if (savedRecipes && recipes.length > 0) {
      try {
        const parsedRecipes = JSON.parse(savedRecipes) as Recipe[];
        // Vérifier que les recettes sauvegardées existent toujours dans la base
        const validRecipes = parsedRecipes.filter(r => 
          recipes.some(existing => existing.id === r.id)
        );
        if (validRecipes.length > 0) {
          setGeneratedRecipes(validRecipes);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des recettes générées', e);
      }
    }
  }, [recipes]);

  useEffect(() => {
    const init = async () => {
      const storedRecipes = await useRecipeStore.getState().getAllRecipes();
      if (storedRecipes.length === 0) {
        await importRecipesFromJson((recipesData as unknown as { recipes: Recipe[] }[])[0].recipes);
      }
      await fetchRecipes();
      setIsLoading(false);
    };
    init();
  }, [fetchRecipes, importRecipesFromJson]);

  // Ne plus régénérer automatiquement au chargement - on utilise ce qui est sauvegardé
  useEffect(() => {
    // Si on a déjà une shopping list, ne pas régénérer
    const savedShoppingList = localStorage.getItem('shoppingList');
    if (!savedShoppingList && recipes.length > 0 && !isLoading && generatedRecipes.length === 0) {
      generateRandomSelection();
    }
  }, [recipes, numPeople, numRecipes, isLoading, generatedRecipes.length]);

  const generateRandomSelection = () => {
    if (recipes.length === 0) return;

    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(numRecipes, shuffled.length));
    setGeneratedRecipes(selected);

    const mealPlans = selected.map(recipe => ({
      id: `${recipe.id}-${Date.now()}`,
      recipeId: recipe.id,
      day: new Date(),
      portions: numPeople,
    }));

    const items = generateShoppingListFromMealPlans(mealPlans, recipes);
    // Appliquer des IDs stables
    const itemsWithStableIds = items.map(item => ({
      ...item,
      id: generateStableItemId(item.name, item.unit),
    }));
    // Trier : éléments non cochés en premier, puis cochés
    const sortedItems = [...itemsWithStableIds].sort((a, b) => {
      if (a.checked !== b.checked) {
        return a.checked ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
    setShoppingList(sortedItems);
  };

  const replaceRecipe = (index: number) => {
    if (recipes.length <= numRecipes) return;

    const newRecipes = [...generatedRecipes];
    const availableRecipes = recipes.filter(
      r => !newRecipes.some(gr => gr.id === r.id)
    );
    
    if (availableRecipes.length === 0) return;

    const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    newRecipes[index] = randomRecipe;
    setGeneratedRecipes(newRecipes);

    const mealPlans = newRecipes.map(recipe => ({
      id: `${recipe.id}-${Date.now()}`,
      recipeId: recipe.id,
      day: new Date(),
      portions: numPeople,
    }));

    const items = generateShoppingListFromMealPlans(mealPlans, recipes);
    // Appliquer des IDs stables
    const itemsWithStableIds = items.map(item => ({
      ...item,
      id: generateStableItemId(item.name, item.unit),
    }));
    // Trier : éléments non cochés en premier, puis cochés
    const sortedItems = [...itemsWithStableIds].sort((a, b) => {
      if (a.checked !== b.checked) {
        return a.checked ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
    setShoppingList(sortedItems);
  };

  const getScaledIngredients = (recipe: Recipe) => {
    const scaleFactor = numPeople / recipe.portions;
    return recipe.ingredients.map(ingredient => {
      if (ingredient.quantity === null) {
        return { ...ingredient };
      }
      return {
        ...ingredient,
        quantity: parseFloat((ingredient.quantity * scaleFactor).toFixed(1)),
      };
    });
  };

  const handleNumPeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setNumPeople(Math.max(1, value));
  };

  const handleNumRecipesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setNumRecipes(Math.max(1, Math.min(value, recipes.length)));
  };

  const handleToggleChecked = (itemId: string) => {
    const newShoppingList = shoppingList.map(item => {
      if (item.id === itemId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    // Trier : éléments non cochés en premier, puis cochés
    const sortedList = [...newShoppingList].sort((a, b) => {
      if (a.checked !== b.checked) {
        return a.checked ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
    setShoppingList(sortedList);
  };

  const clearShoppingList = () => {
    setShoppingList([]);
    localStorage.removeItem('shoppingList');
    localStorage.removeItem('generatedRecipes');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Generateur de recettes */}
        <section className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Recettes
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de personnes
              </label>
              <input
                type="number"
                value={numPeople}
                onChange={handleNumPeopleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de recettes
              </label>
              <input
                type="number"
                value={numRecipes}
                onChange={handleNumRecipesChange}
                min="1"
                max={recipes.length}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={generateRandomSelection}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Générer
            </button>
            <button
              onClick={clearShoppingList}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Effacer
            </button>
            <button
              onClick={async () => {
                await resetApp((recipesData as unknown as { recipes: Recipe[] }[])[0].recipes);
                setGeneratedRecipes([]);
                setShoppingList([]);
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Reset App
            </button>
          </div>

          <div className="space-y-4">
            {generatedRecipes.map((recipe, index) => {
              const scaledIngredients = getScaledIngredients(recipe);
              
              return (
                <div key={`${recipe.id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{recipe.name}</h3>
                      <p className="text-sm text-gray-500">{recipe.description}</p>
                    </div>
                    <button
                      onClick={() => replaceRecipe(index)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                      title="Remplacer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 mb-1 text-sm">Ingrédients</h4>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {scaledIngredients.map((ingredient, i) => (
                        <li key={i}>
                          {ingredient.quantity !== null ?
                            `${parseFloat(ingredient.quantity.toString()).toFixed(1)} ${ingredient.unit} ` : ''}
                          {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-1 text-sm">Étapes</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      {recipe.steps.map((step, i) => (
                        <li key={i}>{step.description}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Liste de courses */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Liste de courses
          </h2>
          
          {shoppingList.length > 0 ? (
            <div className="space-y-2">
              {shoppingList.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked || false}
                      onChange={() => handleToggleChecked(item.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">
                      {item.quantity !== null ?
                        `${parseFloat(item.quantity.toString()).toFixed(1)} ${item.unit} ` : ''}
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Aucune liste de courses générée
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
