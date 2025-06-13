"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AlertTriangle, Moon, Sun, Trash2 } from "lucide-react"
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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { clearHistory } = useHistory()

  const handleClearHistory = () => {
    clearHistory()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative">
      <header className="p-6 border-b border-slate-200 dark:border-slate-800 relative z-10">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Customize your app experience</p>
      </header>

      <main className="flex-1 flex flex-col items-center py-8 px-2 pb-24 relative">
        {/* Background Pattern (matches Home page, only below the header) */}
        <div
          className="absolute inset-0 z-0 opacity-5 dark:opacity-3 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230f766e' fillOpacity='1' fillRule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "300px 300px",
          }}
        ></div>
        <PageTransition>
          <div className="w-full max-w-md space-y-6 mx-auto relative z-10">
            {/* Appearance Card */}
            <Card className="border border-[color:hsl(var(--border))] rounded-xl bg-white dark:bg-slate-900 shadow-lg">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <motion.span
                        key={theme}
                        initial={{ rotate: 0, opacity: 0 }}
                        animate={{ rotate: theme === "dark" ? 180 : 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-lg"
                      >
                        {theme === "dark" ? "🌜" : "🌞"}
                      </motion.span>
                      <span className="font-medium">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                    </div>
                    <span className="text-sm text-slate-500">Switch between light and dark themes</span>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management Card */}
            <Card className="border border-[color:hsl(var(--border))] rounded-xl bg-white dark:bg-slate-900 shadow-lg">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Manage your app data and history</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full py-3 text-base">
                      <Trash2 className="mr-2 h-5 w-5" />
                      Clear History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your scan history and reports.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* About Card */}
            <Card className="border border-[color:hsl(var(--border))] rounded-xl bg-white dark:bg-slate-900 shadow-lg">
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>App information and legal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Derm AI</h3>
                  <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-800 dark:text-amber-200">Medical Disclaimer</span>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      This app is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </main>

      <BottomNavigation currentPath="/settings" />
    </div>
  )
}
