import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useRecipeStore from '../stores/recipeStore';
import { getRandomRecipe } from '../utils/recipeUtils';
import type { Recipe } from '../types/recipe';
import recipesData from '../data/recipes.json';

export default function Home() {
  const { recipes, getAllRecipes, importRecipesFromJson } = useRecipeStore();
  const [randomRecipe, setRandomRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const importInitialRecipes = async () => {
      const storedRecipes = await getAllRecipes();
      if (storedRecipes.length === 0) {
        await importRecipesFromJson(recipesData as Recipe[]);
      }
      setIsLoading(false);
    };
    importInitialRecipes();
  }, [getAllRecipes, importRecipesFromJson]);

  useEffect(() => {
    if (recipes.length > 0) {
      setRandomRecipe(getRandomRecipe(recipes));
    }
  }, [recipes]);

  const handleGenerateNewRandom = () => {
    if (recipes.length > 0) {
      setRandomRecipe(getRandomRecipe(recipes));
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
          \ud83c\udfb2 Recette al\u00e9atoire
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
                title="Autre recette al\u00e9atoire"
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

      <section className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          \ud83d\udcf1 Fonctionnalit\u00e9s
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/recettes"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-indigo-600 mb-2">\ud83d\udcda</div>
            <h3 className="font-semibold text-gray-800">G\u00e9rer les recettes</h3>
            <p className="text-sm text-gray-500">Ajoutez, modifiez, supprimez</p>
          </Link>
          <Link
            to="/generateur"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-indigo-600 mb-2">\ud83c\udf73</div>
            <h3 className="font-semibold text-gray-800">G\u00e9n\u00e9rateur de recettes</h3>
            <p className="text-sm text-gray-500">G\u00e9n\u00e9rez des listes al\u00e9atoires</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
