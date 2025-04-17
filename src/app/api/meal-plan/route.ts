import { addToMealPlan, getMealPlan } from '@/lib/db/queries'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Missing date range' }, { status: 400 })
    }

    const mealPlan = await getMealPlan(userId, startDate, endDate)
    return NextResponse.json(mealPlan)
  } catch (error) {
    console.error('Error fetching meal plan:', error)
    return NextResponse.json({ error: 'Failed to fetch meal plan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const mealPlan = await addToMealPlan({ ...body, user_id: userId })
    return NextResponse.json(mealPlan)
  } catch (error) {
    console.error('Error adding to meal plan:', error)
    return NextResponse.json({ error: 'Failed to add to meal plan' }, { status: 500 })
  }
}
