"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AlertTriangle, Moon, Sun, Trash2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useHistory } from "@/components/history-provider"
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
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { clearHistory } = useHistory()
  const { toast } = useToast()

  const handleClearHistory = () => {
    clearHistory()
    toast({
      title: "History Cleared",
      description: "All your scan history has been deleted",
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Customize your app experience</p>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 pb-20">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  ) : (
                    <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  )}
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">Dark Mode</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your app data and history</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
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

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>App information and legal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-800 dark:text-white">Derm AI</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Version 1.0.0</p>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-medium">Medical Disclaimer</p>
                  <p className="mt-1">
                    This app is for informational purposes only and is not a substitute for professional medical advice,
                    diagnosis, or treatment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation currentPath="/settings" />
    </div>
  )
}
