"use client";

import { useUser } from "@clerk/nextjs";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { CollectionCard } from "@/components/collection-card";
import { CreateCollectionDialog } from "@/components/create-collection-dialog";

// Temporary mock data
const mockCollections = [
  {
    id: "1",
    name: "Favorite Recipes",
    description: "My all-time favorite recipes",
    recipeCount: 12,
    coverImage: "/images/recipes/pasta.jpg",
  },
  {
    id: "2",
    name: "Healthy Meals",
    description: "Nutritious and delicious recipes",
    recipeCount: 8,
    coverImage: "/images/recipes/salad.jpg",
  },
  {
    id: "3",
    name: "Quick Dinners",
    description: "30-minute meals for busy days",
    recipeCount: 15,
    coverImage: "/images/recipes/soba.jpg",
  },
];

export default function CollectionsPage() {
  const { user } = useUser();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">My Collections</h1>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          <PlusCircle className="h-5 w-5" />
          Create Collection
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockCollections.map((collection) => (
          <CollectionCard key={collection.id} {...collection} />
        ))}
      </div>

      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
