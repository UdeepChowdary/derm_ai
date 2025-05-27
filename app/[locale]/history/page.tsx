"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ArrowRight, Calendar, Info } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useHistory } from "@/components/history-provider"
import { useTranslations } from "@/lib/language-provider"
import { LanguageSelectorMenu } from "@/components/language-selector-menu"

export default function HistoryPage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const { reports } = useHistory()
  const { locale } = params
  const t = useTranslations()

  // Sort reports by date (newest first)
  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('navigation.history')}</h1>
          <LanguageSelectorMenu />
        </div>
        <p className="text-slate-500 dark:text-slate-400">{t('home.history_button')}</p>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 pb-20">
        {sortedReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Info className="h-8 w-8 text-slate-500 dark:text-slate-400" />
            </div>
            <h2 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('common.no')} {t('navigation.history')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
              {t('scan.subtitle')} {t('common.or')} {t('upload.title')}
            </p>
            <Button
              onClick={() => router.push(`/${locale}/home`)}
              className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
            >
              {t('navigation.home')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReports.map((report) => (
              <Card
                key={report.id}
                className="overflow-hidden border-[color:hsl(var(--border))] dark:border-slate-800"
              >
                <CardContent className="p-0">
                  <button
                    className="w-full"
                    onClick={() => router.push(`/${locale}/report/${report.id}`)}
                  >
                    <div className="flex">
                      <div className="w-24 h-24 relative flex-shrink-0">
                        <Image
                          src={report.imageUrl || "/placeholder.svg"}
                          alt={report.condition}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 96px, 96px"
                        />
                      </div>
                      <div className="flex-1 p-3 text-left">
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(report.date)}</span>
                        </div>
                        <h3 className="font-medium text-teal-600 dark:text-teal-400">
                          {report.condition}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mt-1">
                          {report.severity}
                        </p>
                      </div>
                      <div className="flex items-center pr-3">
                        <ArrowRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation currentPath="/history" />
    </div>
  )
}
