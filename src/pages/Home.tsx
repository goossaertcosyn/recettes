import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useRecipeStore from '../stores/recipeStore';
import { getRandomRecipe, generateWeeklyMealPlan } from '../utils/recipeUtils';
import { Recipe, MealPlanItem } from '../types/recipe';
import recipesData from '../data/recipes.json';

export default function Home() {
  const { recipes, mealPlans, importRecipesFromJson, generateShoppingListFromMealPlans } = useRecipeStore();
  const [randomRecipe, setRandomRecipe] = useState<Recipe | null>(null);
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<MealPlanItem[]>([]);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Importer les recettes depuis le JSON si la base est vide
    const importInitialRecipes = async () => {
      const storedRecipes = await useRecipeStore.getState().fetchRecipes();
      if (storedRecipes.length === 0) {
        await importRecipesFromJson(recipesData as Recipe[]);
      }
      setIsLoading(false);
    };
    importInitialRecipes();
  }, [importRecipesFromJson]);

  useEffect(() => {
    if (recipes.length > 0) {
      setRandomRecipe(getRandomRecipe(recipes));
      const newMealPlan = generateWeeklyMealPlan(recipes, 2);
      setWeeklyMealPlan(newMealPlan);
      
      // Générer la liste de courses pour le menu
      const shoppingItems = generateShoppingListFromMealPlans(newMealPlan, recipes);
      setShoppingList(shoppingItems);
    }
  }, [recipes, generateShoppingListFromMealPlans]);

  const handleGenerateNewRandom = () => {
    if (recipes.length > 0) {
      setRandomRecipe(getRandomRecipe(recipes));
    }
  };

  const handleGenerateNewMenu = () => {
    if (recipes.length > 0) {
      const newMealPlan = generateWeeklyMealPlan(recipes, 2);
      setWeeklyMealPlan(newMealPlan);
      const shoppingItems = generateShoppingListFromMealPlans(newMealPlan, recipes);
      setShoppingList(shoppingItems);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🎲 Recette aléatoire
        </h2>
        {randomRecipe ? (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">{randomRecipe.name}</h3>
              <p className="text-gray-600 mb-4">{randomRecipe.description}</p>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {randomRecipe.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {randomRecipe.prepTime} min
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {randomRecipe.portions} portions
                </span>
              </div>
              <Link
                to={`/recettes/${randomRecipe.id}`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Voir la recette
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleGenerateNewRandom}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Autre recette aléatoire"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Aucune recette disponible. Ajoutez-en une !</p>
        )}
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            📅 Menu de la semaine
          </h2>
          <button
            onClick={handleGenerateNewMenu}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Générer un nouveau menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
            </svg>
          </button>
        </div>
        
        {weeklyMealPlan.length > 0 ? (
          <div className="space-y-4">
            {weeklyMealPlan.slice(0, 3).map((meal) => {
              const recipe = recipes.find(r => r.id === meal.recipeId);
              return recipe ? (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{recipe.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(meal.day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-200 rounded text-xs">
                      {meal.portions} pers.
                    </span>
                    <Link
                      to={`/recettes/${recipe.id}`}
                      className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded text-xs"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              ) : null;
            })}
            
            {weeklyMealPlan.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                + {weeklyMealPlan.length - 3} autres jours
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Aucun menu généré. Ajoutez des recettes !</p>
        )}
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🛒 Liste de courses
        </h2>
        {shoppingList.length > 0 ? (
          <div className="space-y-2">
            {shoppingList.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-700">
                    {item.name} - {item.quantity} {item.unit}
                  </span>
                </div>
              </div>
            ))}
            
            {shoppingList.length > 5 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                + {shoppingList.length - 5} autres articles
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Aucune liste de courses générée.</p>
        )}
        
        <div className="mt-4 text-center">
          <Link
            to="/liste-courses"
            className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
          >
            Voir la liste complète
          </Link>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          📱 Fonctionnalités
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/recettes"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-indigo-600 mb-2">📚</div>
            <h3 className="font-semibold text-gray-800">Gérer les recettes</h3>
            <p className="text-sm text-gray-500">Ajoutez, modifiez, supprimez</p>
          </Link>
          <Link
            to="/menu"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-indigo-600 mb-2">📅</div>
            <h3 className="font-semibold text-gray-800">Planifier les menus</h3>
            <p className="text-sm text-gray-500">Créez vos menus hebdomadaires</p>
          </Link>
          <Link
            to="/liste-courses"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-indigo-600 mb-2">🛒</div>
            <h3 className="font-semibold text-gray-800">Liste de courses</h3>
            <p className="text-sm text-gray-500">Générez automatiquement</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
