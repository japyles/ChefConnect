'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuth } from '@clerk/nextjs'
import { Edit2, Loader2, Plus, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Note {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url: string
  }
}

interface RecipeNotesProps {
  recipeId: string
  isOwner: boolean
}

export function RecipeNotes({ recipeId, isOwner }: RecipeNotesProps) {
  const { userId } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/recipes/${recipeId}/notes`)
        if (response.ok) {
          const data = await response.json()
          setNotes(data)
        }
      } catch (error) {
        console.error('Error fetching notes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [recipeId])

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setSaving(true)
    try {
      const response = await fetch(`/api/recipes/${recipeId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote }),
      })

      if (response.ok) {
        const data = await response.json()
        setNotes((prev) => [...prev, data])
        setNewNote('')
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(
        `/api/recipes/${recipeId}/notes/${noteId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== noteId))
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  if (notes.length === 0 && !isOwner) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recipe Notes</h2>
        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>Add Note</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-gray-500">No notes yet</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {note.user.avatar_url ? (
                    <img
                      src={note.user.avatar_url}
                      alt=""
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                      <span className="text-sm text-gray-500">
                        {note.user.full_name[0]}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500">
                    {note.user.full_name}
                  </span>
                </div>
                {userId === note.user.id && (
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap text-gray-700">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Add Recipe Note
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={saving || !newNote.trim()}
                className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Note</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
