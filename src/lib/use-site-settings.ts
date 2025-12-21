import { useState, useEffect } from 'react'
import { supabase } from './supabase'

interface SiteSetting {
  key: string
  value: string
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')

      if (error) throw error

      const settingsMap: Record<string, string> = {}
      data?.forEach((setting: SiteSetting) => {
        settingsMap[setting.key] = setting.value
      })

      setSettings(settingsMap)
    } catch (error) {
      console.error('Error fetching site settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue
  }

  return { settings, getSetting, loading }
}
