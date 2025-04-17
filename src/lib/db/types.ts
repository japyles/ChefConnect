import { Database } from '@/types/supabase'

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type RecipeWithDetails = TablesRow<'recipes'> & {
  photos: TablesRow<'recipe_photos'>[]
  tags: string[]
  author: TablesRow<'profiles'>
  comments: Array<{
    comment: TablesRow<'comments'>
    user: TablesRow<'profiles'>
  }>
}
