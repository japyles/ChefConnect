import { TablesRow } from '@/lib/db/types'
import Image from 'next/image'

interface RecipeInstructionsProps {
  instructions: string[] | string
  photos: Array<{
    photo_url: string
    step_number?: number | null
  }>
}

export function RecipeInstructions({ instructions, photos }: RecipeInstructionsProps) {
  // Ensure instructions is always an array
  const steps = Array.isArray(instructions)
    ? instructions
    : typeof instructions === 'string' && instructions.trim() !== ''
    ? instructions.split(/\r?\n|\./).map(s => s.trim()).filter(Boolean)
    : [];
  const photoList = Array.isArray(photos) ? photos : [];

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Instructions</h2>
      <div className="space-y-8">
        {steps.map((instruction, index) => {
          const stepPhoto = photoList.find(p => p.step_number === index + 1)

          return (
            <div key={index} className="flex flex-col space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  {index + 1}
                </div>
                <p className="flex-1 text-gray-700">{instruction}</p>
              </div>
              {stepPhoto && (
                <div className="relative ml-12 aspect-video w-full max-w-2xl overflow-hidden rounded-lg">
                  <Image
                    src={stepPhoto.photo_url}
                    alt={`Step ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
