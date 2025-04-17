'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import { suggestion } from './mention-suggestion'
import { EmojiPicker } from './emoji-picker'
import { ImageUpload } from './image-upload'
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Image as ImageIcon,
} from 'lucide-react'
import { useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write something...',
  minHeight = '150px',
}: RichTextEditorProps) {
  const [showImageUpload, setShowImageUpload] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-4',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-200 pl-4 italic',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[${minHeight}]`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }

    editor.chain().focus().setLink({ href: url }).run()
  }

  const addImage = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run()
    setShowImageUpload(false)
  }

  const addEmoji = (emoji: any) => {
    editor.chain().focus().insertContent(emoji.native).run()
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-1 hover:bg-gray-100 ${
            editor.isActive('bold') ? 'bg-gray-100' : ''
          }`}
          title="Bold"
        >
          <Bold className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-1 hover:bg-gray-100 ${
            editor.isActive('italic') ? 'bg-gray-100' : ''
          }`}
          title="Italic"
        >
          <Italic className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded p-1 hover:bg-gray-100 ${
            editor.isActive('bulletList') ? 'bg-gray-100' : ''
          }`}
          title="Bullet List"
        >
          <List className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded p-1 hover:bg-gray-100 ${
            editor.isActive('orderedList') ? 'bg-gray-100' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`rounded p-1 hover:bg-gray-100 ${
            editor.isActive('blockquote') ? 'bg-gray-100' : ''
          }`}
          title="Quote"
        >
          <Quote className="h-5 w-5" />
        </button>
        <button
          onClick={toggleLink}
          className={`rounded p-1 hover:bg-gray-100 ${
            editor.isActive('link') ? 'bg-gray-100' : ''
          }`}
          title="Link"
        >
          <LinkIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setShowImageUpload(!showImageUpload)}
          className={`rounded p-1 hover:bg-gray-100 ${
            showImageUpload ? 'bg-gray-100' : ''
          }`}
          title="Image"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <EmojiPicker onEmojiSelect={addEmoji} />
        <div className="mx-2 h-6 w-px bg-gray-200" />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="rounded p-1 hover:bg-gray-100 disabled:opacity-50"
          title="Undo"
        >
          <Undo className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="rounded p-1 hover:bg-gray-100 disabled:opacity-50"
          title="Redo"
        >
          <Redo className="h-5 w-5" />
        </button>
      </div>

      {showImageUpload && (
        <div className="border-b border-gray-200 p-4">
          <ImageUpload onUpload={addImage} />
        </div>
      )}

      <style jsx global>{`
        .mention {
          color: #2563eb;
          font-weight: 500;
        }
      `}</style>

      <EditorContent editor={editor} className="p-4" />
    </div>
  )
}
