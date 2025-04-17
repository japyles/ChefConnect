"use client";

import { RecipeCard } from "@/components/recipe-card";
import { RecipeFilters } from "@/components/recipe-filters";
import { SearchBar } from "@/components/search-bar";
import { useFilteredRecipes } from "@/hooks/useFilteredRecipes";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const filteredRecipes = useFilteredRecipes();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar />
      </div>

      <h1 className="mb-8 text-4xl font-bold">Discover</h1>

      <div className="mb-12">
        <RecipeFilters />
      </div>

      <section>
        <h2 className="mb-6 text-xl font-semibold">Popular Recipes</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <motion.div layout>
            <AnimatePresence mode="popLayout">
              {filteredRecipes.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                >
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      id={recipe.id}
                      name={recipe.title}
                      description={`by ${recipe.author}`}
                      recipeCount={1}
                      coverImage={recipe.image}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <p className="mb-2 text-lg font-medium text-gray-900">
                    No recipes found
                  </p>
                  <p className="text-sm text-gray-600">
                    Try adjusting your search or filters to find what you're looking
                    for
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}
