import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  try {
    // Get all published recipes by the user
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('cuisine_type, cooking_time, servings, difficulty')
      .eq('user_id', params.userId)
      .eq('status', 'published')

    if (recipesError) throw recipesError

    if (!recipes || recipes.length === 0) {
      return NextResponse.json({
        topCuisines: [],
        difficultyBreakdown: {},
        avgCookingTime: 0,
        avgServings: 0,
      })
    }

    // Calculate cuisine frequency
    const cuisineCount: { [key: string]: number } = {}
    recipes.forEach((recipe) => {
      if (recipe.cuisine_type) {
        cuisineCount[recipe.cuisine_type] = (cuisineCount[recipe.cuisine_type] || 0) + 1
      }
    })

    // Get top cuisines
    const topCuisines = Object.entries(cuisineCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate difficulty breakdown
    const difficultyBreakdown: { [key: string]: number } = {}
    recipes.forEach((recipe) => {
      if (recipe.difficulty) {
        difficultyBreakdown[recipe.difficulty] = (difficultyBreakdown[recipe.difficulty] || 0) + 1
      }
    })

    // Calculate averages
    const avgCookingTime = recipes.reduce((sum, recipe) => sum + (recipe.cooking_time || 0), 0) / recipes.length
    const avgServings = recipes.reduce((sum, recipe) => sum + (recipe.servings || 0), 0) / recipes.length

    return NextResponse.json({
      topCuisines,
      difficultyBreakdown,
      avgCookingTime,
      avgServings,
    })
  } catch (error) {
    console.error('Error analyzing cooking style:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
