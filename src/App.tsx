import { useEffect, useState, useRef } from 'react';
import useRecipeStore from './stores/recipeStore';
import type { Recipe, ShoppingListItem } from './types/recipe';
import recipesData from './data/recipes.json';
import {
  getFoodSuggestions,
  type FoodReferenceItem,
} from './data/foodReference';

// Fonction pour générer un ID stable basé sur le nom et l'unité
const generateStableItemId = (name: string, unit: string): string => {
  const normalizedName = name.toLowerCase().trim();
  const normalizedUnit = unit.toLowerCase().trim();
  return `${normalizedName}-${normalizedUnit}`;
};

// Fonction pour formater l'affichage d'un ingrédient (ne pas afficher l'unité si vide)
const formatIngredientDisplay = (item: { name: string; quantity: number | null; unit: string }): string => {
  const parts: string[] = [];
  
  if (item.quantity !== null) {
    parts.push(parseFloat(item.quantity.toString()).toFixed(1));
  }
  
  // Ne pas afficher l'unité si elle est vide ou "pièce" ou ""
  if (item.unit && item.unit !== '' && item.unit.toLowerCase() !== 'pièce' && item.unit.toLowerCase() !== 'piece') {
    parts.push(item.unit);
  }
  
  parts.push(item.name);
  return parts.join(' ');
};

function App() {
  const { recipes, fetchRecipes, importRecipesFromJson, generateShoppingListFromMealPlans, resetApp } = useRecipeStore();
  const [numPeople, setNumPeople] = useState<number>(2);
  const [numRecipes, setNumRecipes] = useState<number>(3);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // État pour l'ajout manuel d'éléments
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('');
  const [newItemUnit, setNewItemUnit] = useState<string>('');
  const [suggestions, setSuggestions] = useState<FoodReferenceItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  
  // État pour la modale de recherche de recettes
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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
        await importRecipesFromJson(recipesData as Recipe[]);
      }
      await fetchRecipes();
      setIsLoading(false);
    };
    init();
  }, [fetchRecipes, importRecipesFromJson]);

  // Gestion des suggestions pour l'autocomplétion
  useEffect(() => {
    if (newItemName.length > 1) {
      const suggestions = getFoodSuggestions(newItemName, 10);
      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [newItemName]);

  // Filtrer les recettes pour la modale de recherche
  useEffect(() => {
    if (showSearchModal) {
      const query = searchQuery.toLowerCase().trim();
      if (query === '') {
        setFilteredRecipes(recipes);
      } else {
        const filtered = recipes.filter(recipe => 
          recipe.name.toLowerCase().includes(query) ||
          recipe.description?.toLowerCase().includes(query) ||
          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query)) ||
          recipe.tags?.some(tag => tag.toLowerCase().includes(query))
        );
        setFilteredRecipes(filtered);
      }
    }
  }, [searchQuery, recipes, showSearchModal]);

  // Fermer les suggestions et la modale quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeSearchModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateRandomSelection = () => {
    if (recipes.length === 0) return;

    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(numRecipes, shuffled.length));
    setGeneratedRecipes(selected);
  };

  const generateShoppingListFromRecipes = () => {
    if (generatedRecipes.length === 0) return;

    const mealPlans = generatedRecipes.map(recipe => ({
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
  };

  const removeRecipe = (index: number) => {
    const newRecipes = [...generatedRecipes];
    newRecipes.splice(index, 1);
    setGeneratedRecipes(newRecipes);
  };

  const addRecipeToSelection = (recipe: Recipe) => {
    if (replaceIndex !== null) {
      // Remplacer la recette à l'index spécifié
      const newRecipes = [...generatedRecipes];
      newRecipes[replaceIndex] = recipe;
      setGeneratedRecipes(newRecipes);
    } else if (!generatedRecipes.some(r => r.id === recipe.id)) {
      // Ajouter la recette à la sélection
      setGeneratedRecipes([...generatedRecipes, recipe]);
    }
    closeSearchModal();
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

  // Gestion de l'ajout manuel d'éléments
  const handleNewItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItemName(e.target.value);
    setSelectedSuggestionIndex(-1);
  };

  const handleNewItemQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItemQuantity(e.target.value);
  };

  const handleNewItemUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItemUnit(e.target.value);
  };

  const handleSelectSuggestion = (suggestion: FoodReferenceItem) => {
    setNewItemName(suggestion.name);
    setNewItemUnit(suggestion.defaultUnit);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
    }
  };

  const addManualItem = () => {
    if (!newItemName.trim()) return;

    const newItem: ShoppingListItem = {
      id: generateStableItemId(newItemName, newItemUnit),
      name: newItemName.trim(),
      quantity: newItemQuantity ? parseFloat(newItemQuantity) : null,
      unit: newItemUnit || '',
      checked: false,
    };

    // Vérifier si un élément similaire existe déjà (même nom et unité)
    const existingIndex = shoppingList.findIndex(item => 
      item.name.toLowerCase() === newItem.name.toLowerCase() &&
      item.unit.toLowerCase() === newItem.unit.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Mettre à jour la quantité si l'élément existe
      const updatedList = [...shoppingList];
      const existingItem = updatedList[existingIndex];
      
      if (existingItem.quantity !== null && newItem.quantity !== null) {
        existingItem.quantity += newItem.quantity;
      } else if (newItem.quantity !== null) {
        existingItem.quantity = newItem.quantity;
      }
      
      // Trier : éléments non cochés en premier, puis cochés
      const sortedList = [...updatedList].sort((a, b) => {
        if (a.checked !== b.checked) {
          return a.checked ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });
      setShoppingList(sortedList);
    } else {
      // Ajouter le nouvel élément
      const updatedList = [...shoppingList, newItem];
      // Trier : éléments non cochés en premier, puis cochés
      const sortedList = [...updatedList].sort((a, b) => {
        if (a.checked !== b.checked) {
          return a.checked ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });
      setShoppingList(sortedList);
    }

    // Réinitialiser les champs
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemUnit('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddItemKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualItem();
    }
  };

  const openSearchModal = (index?: number) => {
    setShowSearchModal(true);
    setSearchQuery('');
    setFilteredRecipes(recipes);
    setReplaceIndex(index ?? null);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery('');
    setReplaceIndex(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Generateur de recettes */}
        <section className="bg-white rounded-lg shadow p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
            Recettes
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Nombre de personnes
              </label>
              <input
                type="number"
                value={numPeople}
                onChange={handleNumPeopleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Nombre de recettes
              </label>
              <input
                type="number"
                value={numRecipes}
                onChange={handleNumRecipesChange}
                min="1"
                max={recipes.length}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
            <button
              onClick={generateRandomSelection}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Générer
            </button>
            <button
              onClick={generateShoppingListFromRecipes}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Générer la liste
            </button>
            <button
              onClick={() => openSearchModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1 md:gap-2"
              title="Rechercher des recettes"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Rechercher</span>
            </button>
            <button
              onClick={async () => {
                await resetApp(recipesData as Recipe[]);
                setGeneratedRecipes([]);
                setShoppingList([]);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Reset App
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {generatedRecipes.map((recipe, index) => {
              const scaledIngredients = getScaledIngredients(recipe);
              
              return (
                <div key={`${recipe.id}-${index}`} className="border border-gray-200 rounded-lg p-3 md:p-4">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{recipe.name}</h3>
                      {recipe.description && (
                        <p className="text-sm text-gray-500">{recipe.description}</p>
                      )}
                    </div>
                    <div className="flex gap-0.5 md:gap-1">
                      <button
                        onClick={() => replaceRecipe(index)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Remplacer"
                        aria-label="Remplacer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openSearchModal(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Chercher une recette"
                        aria-label="Chercher une recette"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeRecipe(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Supprimer"
                        aria-label="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-2 md:mb-3">
                    <h4 className="font-medium text-gray-700 mb-1 text-sm">Ingrédients</h4>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {scaledIngredients.map((ingredient, i) => (
                        <li key={i}>
                          {formatIngredientDisplay(ingredient)}
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
        <section className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
            Liste de courses
          </h2>
          
          {/* Champ pour ajouter manuellement un élément */}
          <div className="mb-3 md:mb-4">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={newItemName}
                  onChange={handleNewItemNameChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Nom de l'aliment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul
                    ref={suggestionsRef}
                    className="absolute z-20 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={suggestion.id}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${
                          index === selectedSuggestionIndex ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="text-sm text-gray-700">{suggestion.name}</div>
                        <div className="text-xs text-gray-500">{suggestion.category}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newItemQuantity}
                  onChange={handleNewItemQuantityChange}
                  onKeyDown={handleAddItemKeyPress}
                  placeholder="Quantité"
                  className="flex-1 min-w-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                />
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={handleNewItemUnitChange}
                  onKeyDown={handleAddItemKeyPress}
                  placeholder="Unité"
                  className="flex-1 min-w-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                />
                <button
                  onClick={addManualItem}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
          
          {shoppingList.length > 0 ? (
            <div className="space-y-1 md:space-y-2">
              {shoppingList.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center justify-between p-2 md:p-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked || false}
                      onChange={() => handleToggleChecked(item.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 md:w-5 md:h-5"
                    />
                    <span className="text-sm md:text-base text-gray-700">
                      {formatIngredientDisplay(item)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-3 md:py-4">
              Aucune liste de courses générée
            </p>
          )}
          
          <button
            onClick={clearShoppingList}
            className="mt-3 md:mt-4 w-full px-4 md:px-6 py-2 md:py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Vider la liste de courses
          </button>
        </section>
      </div>

      {/* Modale de recherche de recettes */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  {replaceIndex !== null ? 'Remplacer une recette' : 'Rechercher des recettes'}
                </h2>
                <button
                  onClick={closeSearchModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title="Fermer"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-3 md:mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, ingrédient ou tag..."
                  className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-lg"
                  autoFocus
                />
              </div>

              {filteredRecipes.length === 0 ? (
                <p className="text-gray-500 text-center py-6 md:py-8">
                  Aucune recette trouvée
                </p>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {filteredRecipes.map((recipe) => (
                    <div 
                      key={recipe.id}
                      onClick={() => addRecipeToSelection(recipe)}
                      className="p-3 md:p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">{recipe.name}</h3>
                          {recipe.description && (
                            <p className="text-sm text-gray-600 mb-1 md:mb-2">{recipe.description}</p>
                          )}
                          {recipe.tags && recipe.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {recipe.tags?.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="mt-1 md:mt-2">
                        <p className="text-xs md:text-sm text-gray-500">
                          {recipe.ingredients.length} ingrédients • {recipe.prepTime} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 md:mt-6">
                <button
                  onClick={closeSearchModal}
                  className="w-full px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
