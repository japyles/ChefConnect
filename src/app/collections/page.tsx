"use client";

import { useUser } from "@clerk/nextjs";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { CollectionCard } from "@/components/collection-card";
import { CreateCollectionDialog } from "@/components/create-collection-dialog";

export default function CollectionsPage() {
  const { user } = useUser();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);

  async function fetchCollections() {
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      setCollections(
        (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          recipeCount: c.recipe_count || 0,
          coverImage: c.cover_image || '/images/recipes/placeholder.jpg',
        }))
      );
    } catch (e) {
      setCollections([]);
    }
  }

  useEffect(() => {
    fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {collections.map((collection) => (
          <CollectionCard key={collection.id} {...collection} />
        ))}
      </div>

      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCollectionCreated={fetchCollections}
      />
    </div>
  );
}
