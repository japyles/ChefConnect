import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = auth()
    if (!currentUserId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const supabase = createClient()

    // Get recipes first
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, created_at, category')
      .eq('user_id', params.userId)
      .eq('status', 'published')

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError)
      throw recipesError
    }

    if (!recipes || recipes.length === 0) {
      return NextResponse.json({
        totalRecipes: 0,
        totalLikes: 0,
        totalShares: 0,
        avgRating: 0,
        topCategories: [],
        monthlyStats: [],
      })
    }

    // Get likes count
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('recipe_id')
      .in('recipe_id', recipes.map(r => r.id))

    if (likesError) {
      console.error('Error fetching likes:', likesError)
      throw likesError
    }

    // Get shares count
    const { data: sharesData, error: sharesError } = await supabase
      .from('shares')
      .select('recipe_id')
      .in('recipe_id', recipes.map(r => r.id))

    if (sharesError) {
      console.error('Error fetching shares:', sharesError)
      throw sharesError
    }

    // Get ratings
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('recipe_ratings')
      .select('recipe_id, rating')
      .in('recipe_id', recipes.map(r => r.id))

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError)
      throw ratingsError
    }

    // Process likes and shares by recipe
    const likesCount = new Map()
    likesData?.forEach(like => {
      likesCount.set(like.recipe_id, (likesCount.get(like.recipe_id) || 0) + 1)
    })

    const sharesCount = new Map()
    sharesData?.forEach(share => {
      sharesCount.set(share.recipe_id, (sharesCount.get(share.recipe_id) || 0) + 1)
    })

    // Calculate totals
    const totalLikes = likesData?.length || 0
    const totalShares = sharesData?.length || 0

    // Calculate average rating
    const ratings = ratingsData?.map(r => r.rating) || []
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0

    // Calculate top categories
    const categoryCount: { [key: string]: number } = {}
    recipes.forEach((recipe) => {
      if (recipe.category) {
        categoryCount[recipe.category] = (categoryCount[recipe.category] || 0) + 1
      }
    })

    const topCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate monthly stats
    const monthlyStats = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toLocaleString('default', { month: 'short' })
      const year = date.getFullYear()
      const startOfMonth = new Date(year, date.getMonth(), 1)
      const endOfMonth = new Date(year, date.getMonth() + 1, 0)

      const monthRecipes = recipes.filter(
        (recipe) =>
          new Date(recipe.created_at) >= startOfMonth &&
          new Date(recipe.created_at) <= endOfMonth
      )

      const monthRecipeIds = monthRecipes.map(r => r.id)
      const monthLikes = likesData?.filter(l => monthRecipeIds.includes(l.recipe_id)).length || 0

      return {
        month: `${month} ${year}`,
        recipes: monthRecipes.length,
        likes: monthLikes
      }
    }).reverse()

    return NextResponse.json({
      totalRecipes: recipes.length,
      totalLikes,
      totalShares,
      avgRating,
      topCategories,
      monthlyStats,
    })
  } catch (error) {
    console.error('Error fetching recipe stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
