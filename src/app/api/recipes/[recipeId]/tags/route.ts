import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tags } = await req.json();

    // For now, we'll just return success
    // In a real app, this would save to a database
    return NextResponse.json({
      recipe_id: params.recipeId,
      tags,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[RECIPE_TAGS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
