'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { Home, FolderHeart, PlusCircle, IdCard } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Collections', href: '/collections', icon: FolderHeart },
  { name: 'Recipes', href: '/recipes', icon: IdCard },
]

export function Header() {
  const { isSignedIn } = useUser()
  const pathname = usePathname()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-orange-500">
            Chef Connect
          </Link>
          <nav className="flex items-center gap-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/recipes/new" className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  New Recipe
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/profile" className="flex items-center gap-2">
                  Profile
                </Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <SignInButton>
              <Button variant="default">Sign In</Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}
