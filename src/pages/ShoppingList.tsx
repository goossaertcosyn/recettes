import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useRecipeStore from '../stores/recipeStore';
import { ShoppingList, ShoppingListItem } from '../types/recipe';
import { mergeShoppingListItems, sortShoppingListItems, getIngredientCategory } from '../utils/recipeUtils';

export default function ShoppingListPage() {
  const { 
    mealPlans, 
    recipes, 
    shoppingLists, 
    currentShoppingList, 
    setCurrentShoppingList,
    addShoppingList,
    updateShoppingList,
    fetchMealPlans,
    fetchRecipes,
    fetchShoppingLists,
    generateShoppingListFromMealPlans,
  } = useRecipeStore();
  
  const location = useLocation();
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [listName, setListName] = useState('');
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);

  useEffect(() => {
    fetchMealPlans();
    fetchRecipes();
    fetchShoppingLists();
  }, [fetchMealPlans, fetchRecipes, fetchShoppingLists]);

  useEffect(() => {
    // Si on vient du planificateur de menu, générer automatiquement la liste
    if (location.state?.fromMealPlan && mealPlans.length > 0 && recipes.length > 0) {
      const items = generateShoppingListFromMealPlans(mealPlans, recipes);
      setShoppingList(items.map(item => ({
        ...item,
        category: getIngredientCategory(item.name),
      })));
      setListName(`Liste du ${new Date().toLocaleDateString('fr-FR')}`);
    } else if (currentShoppingList) {
      setShoppingList(currentShoppingList.items);
      setListName(currentShoppingList.name);
    }
  }, [location.state, mealPlans, recipes, currentShoppingList]);

  // Appliquer les filtres et le tri
  const filteredShoppingList = sortShoppingListItems(shoppingList)
    .filter((item) => !showOnlyUnchecked || !item.checked);

  // Regrouper par catégorie si activé
  const groupedShoppingList = groupByCategory
    ? filteredShoppingList.reduce((acc, item) => {
        const category = item.category || 'Autres';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as Record<string, ShoppingListItem[]>)
    : { '': filteredShoppingList };

  const handleToggleItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSaveShoppingList = async () => {
    const newShoppingList: ShoppingList = {
      id: Date.now().toString(),
      name: listName || `Liste du ${new Date().toLocaleDateString('fr-FR')}`,
      items: shoppingList,
      createdAt: new Date(),
    };

    await addShoppingList(newShoppingList);
    setCurrentShoppingList(newShoppingList);
  };

  const handleUpdateShoppingList = async () => {
    if (!currentShoppingList) return;

    const updatedShoppingList: ShoppingList = {
      ...currentShoppingList,
      name: listName || currentShoppingList.name,
      items: shoppingList,
      createdAt: currentShoppingList.createdAt,
    };

    await updateShoppingList(updatedShoppingList);
    setCurrentShoppingList(updatedShoppingList);
  };

  const handleGenerateFromMealPlans = () => {
    if (mealPlans.length > 0 && recipes.length > 0) {
      const items = generateShoppingListFromMealPlans(mealPlans, recipes);
      setShoppingList(items.map(item => ({
        ...item,
        category: getIngredientCategory(item.name),
      })));
      setListName(`Liste du ${new Date().toLocaleDateString('fr-FR')}`);
    }
  };

  const handleClearList = () => {
    setShoppingList([]);
    setListName('');
  };

  const getTotalItems = () => {
    return shoppingList.length;
  };

  const getCheckedItems = () => {
    return shoppingList.filter((item) => item.checked).length;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            🛒 Liste de courses
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateFromMealPlans}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm"
            >
              📅 À partir du menu
            </button>
            {currentShoppingList ? (
              <button
                onClick={handleUpdateShoppingList}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                ✅ Enregistrer
              </button>
            ) : (
              <button
                onClick={handleSaveShoppingList}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                ✅ Enregistrer
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la liste
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Liste du 25/08/2024"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={groupByCategory}
                  onChange={(e) => setGroupByCategory(e.target.checked)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Grouper par catégorie</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOnlyUnchecked}
                  onChange={(e) => setShowOnlyUnchecked(e.target.checked)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Afficher uniquement les non cochés</span>
              </label>
            </div>
          </div>
        </div>

        {shoppingList.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              {getCheckedItems()} / {getTotalItems()} articles cochés
            </p>
          </div>
        )}

        {Object.entries(groupedShoppingList).map(([category, items]) => (
          <div key={category} className="mb-6">
            {category && (
              <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">
                {category}
              </h2>
            )}
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    item.checked ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    onChange={() => handleToggleItem(item.id)}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity !== null ? `${item.quantity} ${item.unit}` : 'Au goût'}
                    </p>
                  </div>
                  {item.recipeIds && item.recipeIds.length > 0 && (
                    <div className="flex gap-1">
                      {item.recipeIds.slice(0, 3).map((recipeId) => {
                        const recipe = recipes.find((r) => r.id === recipeId);
                        return recipe ? (
                          <span
                            key={recipeId}
                            className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                            title={recipe.name}
                          >
                            {recipe.name.substring(0, 3)}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {shoppingList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Votre liste de courses est vide.</p>
            <p className="mt-2">
              <button
                onClick={handleGenerateFromMealPlans}
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                Générer une liste à partir de votre menu
              </button>
            </p>
          </div>
        )}

        {shoppingList.length > 0 && (
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={handleClearList}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
            >
              Effacer la liste
            </button>
          </div>
        )}
      </div>

      {/* Afficher les listes sauvegardées */}
      {shoppingLists.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📋 Listes de courses sauvegardées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shoppingLists
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((list) => (
                <div
                  key={list.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{list.name}</h3>
                      <p className="text-sm text-gray-500">
                        {list.items.length} articles - {new Date(list.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShoppingList(list.items);
                        setListName(list.name);
                        setCurrentShoppingList(list);
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Ouvrir"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>
                      {list.items.filter((item) => item.checked).length} / {list.items.length} cochés
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
