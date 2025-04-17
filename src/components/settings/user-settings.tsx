'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Bell, Globe, Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UserPreferences {
  notification_email: boolean
  notification_web: boolean
  notification_mobile: boolean
  email_digest_frequency: string
  theme: string
  language: string
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'pl', label: 'Polski' },
  { value: 'ru', label: 'Русский' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
]

const EMAIL_FREQUENCIES = [
  { value: 'never', label: 'Never' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export function UserSettings() {
  const { userId } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>({
    notification_email: true,
    notification_web: true,
    notification_mobile: true,
    email_digest_frequency: 'daily',
    theme: 'light',
    language: 'en',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/users/preferences')
        if (response.ok) {
          const data = await response.json()
          setPreferences(data)
        }
      } catch (error) {
        console.error('Error fetching preferences:', error)
      }
    }

    if (userId) {
      fetchPreferences()
    }
  }, [userId])

  const updatePreference = async (key: keyof UserPreferences, value: boolean | string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })

      if (response.ok) {
        setPreferences((prev) => ({ ...prev, [key]: value }))
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Notification Settings */}
      <div>
        <h2 className="text-lg font-semibold">Notification Settings</h2>
        <p className="text-sm text-gray-500">
          Choose how you want to receive notifications
        </p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <label
                htmlFor="email-notifications"
                className="text-sm font-medium"
              >
                Email Notifications
              </label>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.notification_email}
              onCheckedChange={(checked: boolean) =>
                updatePreference('notification_email', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <label htmlFor="web-notifications" className="text-sm font-medium">
                Web Notifications
              </label>
            </div>
            <Switch
              id="web-notifications"
              checked={preferences.notification_web}
              onCheckedChange={(checked: boolean) =>
                updatePreference('notification_web', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <label
                htmlFor="mobile-notifications"
                className="text-sm font-medium"
              >
                Mobile Notifications
              </label>
            </div>
            <Switch
              id="mobile-notifications"
              checked={preferences.notification_mobile}
              onCheckedChange={(checked: boolean) =>
                updatePreference('notification_mobile', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <label
                htmlFor="email-digest"
                className="text-sm font-medium"
              >
                Email Digest Frequency
              </label>
            </div>
            <Select
              value={preferences.email_digest_frequency}
              onValueChange={(value: string) =>
                updatePreference('email_digest_frequency', value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_FREQUENCIES.map((frequency) => (
                  <SelectItem key={frequency.value} value={frequency.value}>
                    {frequency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div>
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="text-sm text-gray-500">
          Customize how Recipe Share looks on your device
        </p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {preferences.theme === 'light' ? (
                <Sun className="h-5 w-5 text-gray-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-500" />
              )}
              <label htmlFor="theme" className="text-sm font-medium">
                Theme
              </label>
            </div>
            <Select
              value={preferences.theme}
              onValueChange={(value: string) => updatePreference('theme', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div>
        <h2 className="text-lg font-semibold">Language</h2>
        <p className="text-sm text-gray-500">
          Choose your preferred language for Recipe Share
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-gray-500" />
              <label htmlFor="language" className="text-sm font-medium">
                Display Language
              </label>
            </div>
            <Select
              value={preferences.language}
              onValueChange={(value: string) => updatePreference('language', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-green-100 px-4 py-2 text-sm text-green-700">
          Saving changes...
        </div>
      )}
    </div>
  )
}
