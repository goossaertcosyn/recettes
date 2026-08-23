import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useRecipeStore from '../stores/recipeStore';
import type { Recipe, Ingredient, ShoppingListItem } from '../types/recipe';

interface GeneratedRecipe extends Recipe {
  targetPortions: number;
  scaledIngredients: Ingredient[];
}

export default function RecipeGenerator() {
  const { recipes, fetchRecipes, generateShoppingListFromMealPlans } = useRecipeStore();
  const [numPeople, setNumPeople] = useState<number>(2);
  const [numRecipes, setNumRecipes] = useState<number>(3);
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRecipes().then(() => setIsLoading(false));
  }, [fetchRecipes]);

  useEffect(() => {
    if (recipes.length > 0) {
      generateRandomSelection();
    }
  }, [recipes, numPeople, numRecipes]);

  const generateRandomSelection = () => {
    if (recipes.length === 0) return;

    // Sélection aléatoire sans doublons
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(numRecipes, shuffled.length));

    // Calcul des ingrédients mis à l'échelle
    const scaledRecipes = selected.map(recipe => ({
      ...recipe,
      targetPortions: numPeople,
      scaledIngredients: recipe.ingredients.map(ingredient => {
        if (ingredient.quantity === null) {
          return { ...ingredient };
        }
        const scaleFactor = numPeople / recipe.portions;
        return {
          ...ingredient,
          quantity: parseFloat((ingredient.quantity * scaleFactor).toFixed(2)),
        };
      }),
    }));

    setGeneratedRecipes(scaledRecipes);

    // Génération de la liste de courses
    const mealPlans = selected.map(recipe => ({
      id: `${recipe.id}-${Date.now()}`,
      recipeId: recipe.id,
      day: new Date(),
      portions: numPeople,
    }));

    const items = generateShoppingListFromMealPlans(mealPlans, recipes);
    setShoppingList(items);
  };

  const replaceRecipe = (index: number) => {
    if (recipes.length <= numRecipes) return;

    const newRecipes = [...generatedRecipes];
    
    // Trouver une recette qui n'est pas déjà sélectionnée
    const availableRecipes = recipes.filter(
      r => !newRecipes.some(gr => gr.id === r.id)
    );
    
    if (availableRecipes.length === 0) return;

    const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    
    newRecipes[index] = {
      ...randomRecipe,
      targetPortions: numPeople,
      scaledIngredients: randomRecipe.ingredients.map(ingredient => {
        if (ingredient.quantity === null) {
          return { ...ingredient };
        }
        const scaleFactor = numPeople / randomRecipe.portions;
        return {
          ...ingredient,
          quantity: parseFloat((ingredient.quantity * scaleFactor).toFixed(2)),
        };
      }),
    };

    setGeneratedRecipes(newRecipes);

    // Mise à jour de la liste de courses
    const mealPlans = newRecipes.map(recipe => ({
      id: `${recipe.id}-${Date.now()}`,
      recipeId: recipe.id,
      day: new Date(),
      portions: numPeople,
    }));

    const items = generateShoppingListFromMealPlans(mealPlans, recipes);
    setShoppingList(items);
  };

  const handleNumPeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setNumPeople(Math.max(1, value));
  };

  const handleNumRecipesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setNumRecipes(Math.max(1, Math.min(value, recipes.length)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          \ud83c\udf73 G\u00e9n\u00e9rateur de recettes
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

        <button
          onClick={generateRandomSelection}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors mb-6"
        >
          \ud83c\udf73 G\u00e9n\u00e9rer une nouvelle s\u00e9lection
        </button>
      </div>

      {/* Affichage des recettes g\u00e9n\u00e9r\u00e9es */}
      <div className="space-y-4">
        {generatedRecipes.map((recipe, index) => (
          <div key={`${recipe.id}-${index}`} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-indigo-600">{recipe.name}</h3>
                <p className="text-gray-600 mt-1">{recipe.description}</p>
              </div>
              <button
                onClick={() => replaceRecipe(index)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Remplacer par une autre recette"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Cat\u00e9gorie</p>
                <p className="font-medium">{recipe.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Temps de pr\u00e9paration</p>
                <p className="font-medium">{recipe.prepTime} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Portions</p>
                <p className="font-medium">{recipe.targetPortions} personnes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Difficult\u00e9</p>
                <p className="font-medium capitalize">{recipe.difficulty || 'facile'}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Ingr\u00e9dients (pour {recipe.targetPortions} personnes)</h4>
              <ul className="space-y-1">
                {recipe.scaledIngredients.map((ingredient, i) => (
                  <li key={i} className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    <span>
                      {ingredient.quantity !== null ?
                        `${ingredient.quantity} ${ingredient.unit}` : 'Au go\u00fbt'}
                      {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to={`/recettes/${recipe.id}`}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Voir la recette compl\u00e8te
            </Link>
          </div>
        ))}
      </div>

      {/* Liste de courses */}
      {shoppingList.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            \ud83d\uded2 Liste de courses pour {numRecipes} recettes ({numPeople} personnes)
          </h2>
          <div className="space-y-2">
            {shoppingList.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">
                    {item.quantity !== null ?
                      `${item.quantity} ${item.unit} ` : ''}
                    {item.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Link
              to="/liste-courses"
              state={{ fromGenerator: true, shoppingList }}
              className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Voir la liste compl\u00e8te
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
