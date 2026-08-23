import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRecipeStore from '../stores/recipeStore';
import type { Recipe, Ingredient, Step } from '../types/recipe';
import { generateId, parseIngredient } from '../utils/recipeUtils';

export default function AddRecipe() {
  const { addRecipe, recipes } = useRecipeStore();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }>({
    name: '',
    description: '',
    category: 'plat',
    prepTime: 0,
    cookTime: 0,
    portions: 2,
    difficulty: 'facile',
    ingredients: [{ name: '', quantity: null, unit: '' }],
    steps: [{ description: '' }],
    tags: [],
    image: '',
    source: '',
  });

  const [newTag, setNewTag] = useState('');

  const categories = ['entrée', 'plat', 'dessert', 'accompagnement', 'soupe', 'salade', 'autre'];
  const difficulties = ['facile', 'moyenne', 'difficile'];

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number | null) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...recipe.steps];
    newSteps[index] = { ...newSteps[index], description: value };
    setRecipe({ ...recipe, steps: newSteps });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { name: '', quantity: null, unit: '' }],
    });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const addStep = () => {
    setRecipe({ ...recipe, steps: [...recipe.steps, { description: '' }] });
  };

  const removeStep = (index: number) => {
    const newSteps = [...recipe.steps];
    newSteps.splice(index, 1);
    setRecipe({ ...recipe, steps: newSteps });
  };

  const addTag = () => {
    if (newTag.trim() && !recipe.tags.includes(newTag.trim())) {
      setRecipe({ ...recipe, tags: [...recipe.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setRecipe({ ...recipe, tags: recipe.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Nettoyer les ingrédients vides
    const cleanedIngredients = recipe.ingredients.filter(
      (ing) => ing.name.trim() !== ''
    );

    // Nettoyer les étapes vides
    const cleanedSteps = recipe.steps.filter((step) => step.description.trim() !== '');

    const newRecipe: Recipe = {
      ...recipe,
      id: generateId(),
      ingredients: cleanedIngredients,
      steps: cleanedSteps,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addRecipe(newRecipe);
    navigate('/recettes');
  };

  const parseIngredientString = (index: number, value: string) => {
    const parsed = parseIngredient(value);
    handleIngredientChange(index, 'quantity', parsed.quantity);
    handleIngredientChange(index, 'unit', parsed.unit);
    
    // Extraire le nom (tout sauf la quantité et l'unité)
    const name = value
      .replace(/^[\d.]+\s*/, '')
      .replace(/\s*[a-zA-Zà-ü]+$/, '')
      .trim();
    
    if (name) {
      handleIngredientChange(index, 'name', name);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Ajouter une recette</h1>
          <button
            onClick={() => navigate('/recettes')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la recette *
              </label>
              <input
                type="text"
                value={recipe.name}
                onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Pâtes carbonara"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={recipe.category}
                onChange={(e) => setRecipe({ ...recipe, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={recipe.description}
              onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Une description courte de la recette..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temps de préparation (min)
              </label>
              <input
                type="number"
                value={recipe.prepTime}
                onChange={(e) => setRecipe({ ...recipe, prepTime: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temps de cuisson (min)
              </label>
              <input
                type="number"
                value={recipe.cookTime}
                onChange={(e) => setRecipe({ ...recipe, cookTime: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portions
              </label>
              <input
                type="number"
                value={recipe.portions}
                onChange={(e) => setRecipe({ ...recipe, portions: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulté
            </label>
            <div className="flex gap-4">
              {difficulties.map((diff) => (
                <label key={diff} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={diff}
                    checked={recipe.difficulty === diff}
                    onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value as 'facile' | 'moyenne' | 'difficile' })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source (optionnel)
            </label>
            <input
              type="text"
              value={recipe.source}
              onChange={(e) => setRecipe({ ...recipe, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: https://marmiton.org/recette/pates-carbonara"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-indigo-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ajouter un tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
              >
                Ajouter
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingrédients
            </label>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={`${ingredient.quantity || ''} ${ingredient.unit} ${ingredient.name}`.trim()}
                      onChange={(e) => parseIngredientString(index, e.target.value)}
                      placeholder="Ex: 200g de farine"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                + Ajouter un ingrédient
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Étapes
            </label>
            <div className="space-y-3">
              {recipe.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <textarea
                      value={step.description}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Étape ${index + 1}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addStep}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                + Ajouter une étape
              </button>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Ajouter la recette
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
