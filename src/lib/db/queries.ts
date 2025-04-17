import { supabase } from '@/lib/supabase'
import { RecipeWithDetails, TablesInsert, TablesRow } from './types'

export async function getRecipes({
  limit = 10,
  offset = 0,
  userId,
  tag,
  search,
}: {
  limit?: number
  offset?: number
  userId?: string
  tag?: string
  search?: string
}) {
  let query = supabase
    .from('recipes')
    .select(`
      *,
      photos:recipe_photos(photo_url, is_primary),
      tags:recipe_tags(tags(name)),
      author:profiles(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (tag) {
    query = query.contains('tags.tags.name', [tag])
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getRecipeById(id: string): Promise<RecipeWithDetails | null> {
  const { data, error } = await supabase
    .rpc('get_recipe_with_details', { recipe_id: id })
    .single()

  if (error) throw error
  return data
}

export async function createRecipe(recipe: TablesInsert<'recipes'>) {
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipe)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateRecipe(id: string, recipe: Partial<TablesRow<'recipes'>>) {
  const { data, error } = await supabase
    .from('recipes')
    .update(recipe)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteRecipe(id: string) {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function addRecipePhoto(photo: TablesInsert<'recipe_photos'>) {
  const { data, error } = await supabase
    .from('recipe_photos')
    .insert(photo)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleFavorite(userId: string, recipeId: string) {
  const { data: existing } = await supabase
    .from('favorites')
    .select()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)

    if (error) throw error
    return false
  } else {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, recipe_id: recipeId })

    if (error) throw error
    return true
  }
}

export async function addComment(comment: TablesInsert<'comments'>) {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select(`
      *,
      user:profiles(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      recipe_id,
      recipe:recipes(
        *,
        photos:recipe_photos(photo_url, is_primary),
        tags:recipe_tags(tags(name)),
        author:profiles(*)
      )
    `)
    .eq('user_id', userId)

  if (error) throw error
  return data
}

export async function getMealPlan(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select(`
      *,
      recipe:recipes(
        *,
        photos:recipe_photos(photo_url, is_primary)
      )
    `)
    .eq('user_id', userId)
    .gte('planned_date', startDate)
    .lte('planned_date', endDate)

  if (error) throw error
  return data
}

export async function addToMealPlan(mealPlan: TablesInsert<'meal_plans'>) {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert(mealPlan)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createShoppingList(shoppingList: TablesInsert<'shopping_lists'>) {
  const { data, error } = await supabase
    .from('shopping_lists')
    .insert(shoppingList)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addShoppingListItem(item: TablesInsert<'shopping_list_items'>) {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleShoppingListItem(id: string, isCompleted: boolean) {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .update({ is_completed: isCompleted })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
