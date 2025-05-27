"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AlertTriangle, Moon, Sun, Trash2, Globe } from "lucide-react"
import { useTheme } from "next-themes"
import { useHistory } from "@/components/history-provider"
import { ThemeCustomizer } from "@/components/theme-customizer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import { useTranslations } from "@/lib/language-provider"
import { useLanguage } from "@/lib/language-provider"
import { LanguageSelectorMenu } from "@/components/language-selector-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { clearHistory } = useHistory()
  const { locale, setLocale, localeNames } = useLanguage()
  const t = useTranslations()

  const handleClearHistory = () => {
    clearHistory()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('settings.title')}</h1>
          <LanguageSelectorMenu />
        </div>
        <p className="text-slate-500 dark:text-slate-400">{t('settings.subtitle')}</p>
      </header>

      <main className="flex-1 flex flex-col items-center py-8 px-2 pb-24">
        <PageTransition>
          <div className="w-full max-w-md space-y-6 mx-auto">
            {/* Appearance Card */}
            <Card className="border border-[color:hsl(var(--border))] rounded-xl shadow-none">
              <CardHeader>
                <CardTitle>{t('settings.appearance.title')}</CardTitle>
                <CardDescription>{t('settings.appearance.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="grid place-items-center p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      {theme === "dark" ? <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.appearance.theme')}</p>
                    </div>
                  </div>

                  <ThemeCustomizer />
                </div>
              </CardContent>
            </Card>

            {/* Language Card */}
            <Card className="border border-[color:hsl(var(--border))] rounded-xl shadow-none">
              <CardHeader>
                <CardTitle>{t('settings.language.title')}</CardTitle>
                <CardDescription>{t('settings.language.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="grid place-items-center p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <Globe className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.language.language')}</p>
                    </div>
                  </div>

                  <Select
                    value={locale}
                    onValueChange={(value) => setLocale(value as 'en' | 'es' | 'fr')}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={localeNames[locale]} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(localeNames).map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Management Card */}
            <Card className="border border-[color:hsl(var(--border))] rounded-xl shadow-none">
              <CardHeader>
                <CardTitle>{t('settings.data.title')}</CardTitle>
                <CardDescription>{t('settings.data.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('settings.data.clear_history')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                          {t('settings.data.confirm')}
                        </div>
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('settings.data.confirm_description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('settings.data.cancel_button')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory} className="bg-red-500 hover:bg-red-600">
                        {t('settings.data.confirm_button')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </main>

      <BottomNavigation currentPath="/settings" />
    </div>
  )
}
