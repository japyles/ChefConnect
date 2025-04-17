'use client'

import { useAuth } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { CommentReactions } from './comment-reactions'
import { RichTextEditor } from '@/components/editor/rich-text-editor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Loader2,
  MessageSquare,
  Reply,
  Star,
  Trash,
  X,
  Pin,
} from 'lucide-react'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string | null
  user: {
    id: string
    full_name: string
    avatar_url: string
  }
  reactions: Array<{
    emoji: string
    count: number
    users: Array<{
      id: string
      full_name: string
    }>
  }>
  replies: Comment[]
  pinned: boolean
}

interface RecipeCommentsProps {
  recipeId: string
}

export function RecipeComments({ recipeId }: RecipeCommentsProps) {
  const router = useRouter()
  const { userId } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [pinnedComments, setPinnedComments] = useState<Comment[]>([])

  useEffect(() => {
    fetchComments()
    fetchPinnedComments()
  }, [recipeId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPinnedComments = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments/pinned`)
      if (response.ok) {
        const data = await response.json()
        setPinnedComments(data)
      }
    } catch (error) {
      console.error('Error fetching pinned comments:', error)
    }
  }

  const handleAddComment = async () => {
    if (!userId) {
      router.push('/sign-in')
      return
    }

    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
        }),
      })

      if (response.ok) {
        setNewComment('')
        setShowAddModal(false)
        await fetchComments()
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/recipes/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchComments()
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handlePinComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments/${commentId}/pin`, {
        method: 'POST',
      })

      if (response.ok) {
        await Promise.all([fetchComments(), fetchPinnedComments()])
      }
    } catch (error) {
      console.error('Error pinning comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pinned Comments */}
      {pinnedComments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500">Pinned Comments</h3>
          <div className="space-y-4">
            {pinnedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onUpdate={fetchComments}
                onPin={handlePinComment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Comments */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Comments ({comments.length})
        </h2>
        {userId && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Add Comment</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {comments
          .filter((comment) => !comment.pinned)
          .map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={fetchComments}
              onPin={handlePinComment}
            />
          ))}
        {comments.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Add Comment</h2>
            <RichTextEditor
              content={newComment}
              onChange={setNewComment}
              placeholder="Write your comment..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Post Comment
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const CommentItem = ({
  comment,
  onUpdate,
  onPin,
}: {
  comment: Comment
  onUpdate: () => void
  onPin: (commentId: string) => void
}) => {
  const { userId } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editContent, setEditContent] = useState(comment.content)

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/recipes/comments/${comment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Error editing comment:', error)
    }
  }

  const handleReply = async () => {
    try {
      const response = await fetch(`/api/recipes/comments/${comment.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
        }),
      })

      if (response.ok) {
        setReplyContent('')
        setShowReplyForm(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Error adding reply:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/recipes/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  return (
    <div className={`space-y-4 ${comment.pinned ? 'bg-yellow-50 p-4 rounded-lg' : ''}`}>
      <div className="flex space-x-4">
        <Avatar user={comment.user} />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium">{comment.user.full_name}</p>
                {comment.pinned && (
                  <span className="flex items-center space-x-1 text-xs text-yellow-600">
                    <Pin className="h-3 w-3" />
                    <span>Pinned</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at))} ago
                {comment.updated_at && (
                  <span className="ml-2 text-xs">(edited)</span>
                )}
              </p>
            </div>
            {userId === comment.user.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPin(comment.id)}>
                    {comment.pinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <RichTextEditor
                content={editContent}
                onChange={setEditContent}
                minHeight="100px"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          )}

          <div className="flex items-center space-x-4">
            <CommentReactions
              commentId={comment.id}
              reactions={comment.reactions}
              onReactionChange={onUpdate}
            />
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reply
            </button>
          </div>

          {showReplyForm && (
            <div className="mt-4 space-y-4">
              <RichTextEditor
                content={replyContent}
                onChange={setReplyContent}
                minHeight="100px"
                placeholder="Write a reply..."
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 space-y-4 border-l-2 border-gray-100 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onUpdate={onUpdate} onPin={onPin} />
          ))}
        </div>
      )}
    </div>
  )
}
