import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import useRecipeStore from './stores/recipeStore';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import RecipeGenerator from './pages/RecipeGenerator';
import ShoppingList from './pages/ShoppingList';
import AddRecipe from './pages/AddRecipe';

function App() {
  const { fetchRecipes } = useRecipeStore();

  useEffect(() => {
    // Charger les donn\u00e9es au d\u00e9marrage
    fetchRecipes();
  }, [fetchRecipes]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                  \ud83c\udf73 Recettes
                </Link>
                <div className="hidden md:flex space-x-4">
                  <Link
                    to="/"
                    className="px-3 py-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Accueil
                  </Link>
                  <Link
                    to="/recettes"
                    className="px-3 py-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Recettes
                  </Link>
                  <Link
                    to="/liste-courses"
                    className="px-3 py-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Liste de courses
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  to="/ajouter-recette"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  + Ajouter
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recettes" element={<Recipes />} />
            <Route path="/recettes/:id" element={<RecipeDetail />} />
            <Route path="/ajouter-recette" element={<AddRecipe />} />
            <Route path="/generateur" element={<RecipeGenerator />} />
            <Route path="/liste-courses" element={<ShoppingList />} />
          </Routes>
        </main>

        <footer className="bg-white border-t py-4">
          <div className="max-w-6xl mx-auto px-4 text-center text-gray-500">
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
