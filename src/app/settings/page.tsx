import { UserSettings } from '@/components/settings/user-settings'

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>
      <UserSettings />
    </div>
  )
}
