import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useRecipeStore from '../stores/recipeStore';
import type { Recipe, Ingredient } from '../types/recipe';
import { formatIngredient, formatDuration, scaleRecipeIngredients } from '../utils/recipeUtils';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { recipes, fetchRecipes, deleteRecipe } = useRecipeStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [portions, setPortions] = useState(0);
  const [scaledIngredients, setScaledIngredients] = useState<Ingredient[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    if (id) {
      const foundRecipe = recipes.find((r) => r.id === id);
      if (foundRecipe) {
        setRecipe(foundRecipe);
        setPortions(foundRecipe.portions);
        setScaledIngredients(foundRecipe.ingredients);
      }
    }
  }, [id, recipes]);

  useEffect(() => {
    if (recipe) {
      setScaledIngredients(scaleRecipeIngredients(recipe, portions));
    }
  }, [portions, recipe]);

  const handlePortionsChange = (newPortions: number) => {
    setPortions(newPortions);
  };

  const handleDelete = async () => {
    if (id && window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      await deleteRecipe(id);
      navigate('/recettes');
    }
  };

  if (!recipe) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{recipe.name}</h1>
            <p className="text-gray-600 mt-1">{recipe.description}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/recettes/${recipe.id}/edit`}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
            >
              Supprimer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              ⏱️ Informations
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Catégorie:</span>
                <span className="font-medium">{recipe.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Temps de préparation:</span>
                <span className="font-medium">{formatDuration(recipe.prepTime)}</span>
              </div>
              {recipe.cookTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Temps de cuisson:</span>
                  <span className="font-medium">{formatDuration(recipe.cookTime)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Portions:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePortionsChange(Math.max(1, portions - 1))}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="font-medium min-w-[30px] text-center">{portions}</span>
                  <button
                    onClick={() => handlePortionsChange(portions + 1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              {recipe.difficulty && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Difficulté:</span>
                  <span className="font-medium">{recipe.difficulty}</span>
                </div>
              )}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              📝 Ingrédients ({recipe.ingredients.length})
            </h2>
            <ul className="space-y-2">
              {scaledIngredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span className="text-gray-700">
                    {formatIngredient(ingredient)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            👨‍🍳 Étapes de préparation
          </h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm">
                  {index + 1}
                </span>
                <span className="text-gray-700">{step.description}</span>
              </li>
            ))}
          </ol>
        </div>

        {recipe.source && (
          <div className="border-t pt-4">
            <p className="text-gray-500 text-sm">
              Source: {recipe.source}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <Link
            to="/recettes"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Retour aux recettes
          </Link>
          <button
            onClick={() => {
              // Ajouter cette recette au menu
              navigate('/menu', { state: { recipeToAdd: recipe } });
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Ajouter au menu
          </button>
        </div>
      </div>
    </div>
  );
}
