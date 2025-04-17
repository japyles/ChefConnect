import { TablesRow } from '@/lib/db/types'
import { Star } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface RecipeCommentsProps {
  comments: Array<{
    comment: TablesRow<'comments'>
    user: TablesRow<'profiles'>
  }>
  onAddComment: (content: string, rating: number) => Promise<void>
  isAuthenticated: boolean
}

export function RecipeComments({
  comments,
  onAddComment,
  isAuthenticated,
}: RecipeCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment, rating)
      setNewComment('')
      setRating(5)
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Comments</h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="h-6 w-6" fill="currentColor" />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="mb-8 rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-gray-600">Please sign in to leave a comment</p>
        </div>
      )}

      <div className="space-y-6">
        {comments.map(({ comment, user }) => (
          <div key={comment.id} className="flex space-x-4">
            <Image
              src={user.image_url || '/placeholder-avatar.jpg'}
              alt={user.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1">
              <div className="mb-1 flex items-center space-x-2">
                <span className="font-medium text-gray-900">{user.name}</span>
                <span className="text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="mb-2 flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < comment.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
