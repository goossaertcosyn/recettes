import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useRecipeStore from '../stores/recipeStore';
import type { MealPlanItem, Recipe } from '../types/recipe';
import { generateId, generateWeeklyMealPlan, formatDuration } from '../utils/recipeUtils';

export default function MealPlanner() {
  const { recipes, mealPlans, addMealPlan, deleteMealPlan, clearMealPlans, fetchMealPlans, fetchRecipes } = useRecipeStore();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [portions, setPortions] = useState(2);
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
    fetchMealPlans();
  }, [fetchRecipes, fetchMealPlans]);

  useEffect(() => {
    // Si on a reçu une recette à ajouter depuis la page de détail
    if (location.state?.recipeToAdd) {
      const recipe = location.state.recipeToAdd as Recipe;
      setSelectedRecipe(recipe.id);
      setPortions(recipe.portions);
      setSelectedDay(new Date());
    }
  }, [location.state]);

  // Générer les 7 jours à partir de aujourd'hui
  const getWeekDays = (): Date[] => {
    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const weekDays = getWeekDays();

  // Obtenir les recettes pour un jour spécifique
  const getRecipesForDay = (day: Date): MealPlanItem[] => {
    return mealPlans.filter((meal) => {
      const mealDay = new Date(meal.day);
      mealDay.setHours(0, 0, 0, 0);
      const compareDay = new Date(day);
      compareDay.setHours(0, 0, 0, 0);
      return mealDay.getTime() === compareDay.getTime();
    });
  };

  const handleAddToMenu = async () => {
    if (!selectedDay || !selectedRecipe) return;

    const newMealPlan: MealPlanItem = {
      id: generateId(),
      recipeId: selectedRecipe,
      day: selectedDay,
      portions,
    };

    await addMealPlan(newMealPlan);
    setSelectedDay(null);
    setSelectedRecipe('');
    setPortions(2);
  };

  const handleRemoveFromMenu = async (mealId: string) => {
    await deleteMealPlan(mealId);
  };

  const handleGenerateRandomMenu = async () => {
    if (window.confirm('Voulez-vous remplacer le menu actuel par un nouveau menu aléatoire ?')) {
      await clearMealPlans();
      const newMealPlan = generateWeeklyMealPlan(recipes, 2);
      for (const meal of newMealPlan) {
        await addMealPlan(meal);
      }
    }
  };

  const handleGenerateShoppingList = () => {
    navigate('/liste-courses', { state: { fromMealPlan: true } });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            📅 Planificateur de menus
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateRandomMenu}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm"
            >
              🎲 Menu aléatoire
            </button>
            <button
              onClick={handleGenerateShoppingList}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
            >
              🛒 Générer liste de courses
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Vue semaine
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Vue liste
          </button>
        </div>

        {viewMode === 'week' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayRecipes = getRecipesForDay(day);
              const dayName = day.toLocaleDateString('fr-FR', { weekday: 'short' });
              const dayNumber = day.getDate();
              const isToday = new Date().toDateString() === day.toDateString();

              return (
                <div
                  key={day.toISOString()}
                  className={`bg-gray-50 rounded-lg p-3 ${isToday ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <div className="text-center mb-2">
                    <p className="font-medium text-gray-700">{dayName}</p>
                    <p className="text-2xl font-bold text-gray-800">{dayNumber}</p>
                    <p className="text-xs text-gray-500">
                      {day.toLocaleDateString('fr-FR', { month: 'short' })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {dayRecipes.length > 0 ? (
                      dayRecipes.map((meal) => {
                        const recipe = recipes.find((r) => r.id === meal.recipeId);
                        return recipe ? (
                          <div
                            key={meal.id}
                            className="bg-white rounded p-2 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm truncate">{recipe.name}</p>
                                <p className="text-xs text-gray-500">
                                  {meal.portions} pers.
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveFromMenu(meal.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Retirer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : null;
                      })
                    ) : (
                      <p className="text-xs text-gray-500 text-center">
                        Aucun plat
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedRecipe('');
                      setPortions(2);
                    }}
                    className="w-full mt-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                  >
                    + Ajouter
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {mealPlans.length > 0 ? (
              mealPlans
                .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
                .map((meal) => {
                  const recipe = recipes.find((r) => r.id === meal.recipeId);
                  return recipe ? (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          <span className="font-medium text-indigo-600">
                            {new Date(meal.day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-gray-500">-</span>
                          <span className="font-medium text-gray-800">{recipe.name}</span>
                          <span className="text-sm text-gray-500">({meal.portions} portions)</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/recettes/${recipe.id}`}
                          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        >
                          Voir
                        </Link>
                        <button
                          onClick={() => handleRemoveFromMenu(meal.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ) : null;
                })
            ) : (
              <p className="text-gray-500 text-center py-8">
                Votre menu est vide. Ajoutez des recettes !
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal pour ajouter une recette au menu */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Ajouter au menu
              </h2>
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setSelectedRecipe('');
                  setPortions(2);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jour
                </label>
                <input
                  type="date"
                  value={selectedDay.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDay(new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recette
                </label>
                <select
                  value={selectedRecipe}
                  onChange={(e) => setSelectedRecipe(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Sélectionnez une recette</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portions
                </label>
                <input
                  type="number"
                  value={portions}
                  onChange={(e) => setPortions(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => {
                    setSelectedDay(null);
                    setSelectedRecipe('');
                    setPortions(2);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddToMenu}
                  disabled={!selectedRecipe}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                >
                  Ajouter au menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
