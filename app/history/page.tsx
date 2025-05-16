"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Calendar, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useHistory } from "@/components/history-provider"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function HistoryPage() {
  const { reports } = useHistory()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredReports = reports.filter(
    (report) =>
      report.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">History</h1>
        <p className="text-slate-500 dark:text-slate-400">View your past skin analyses</p>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 pb-20">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search reports..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            {reports.length === 0 ? (
              <>
                <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't created any reports yet</p>
                <Link href="/home">
                  <Button className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700">
                    Create Your First Report
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No reports match your search</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Link key={report.id} href={`/report/${report.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="relative w-24 h-24">
                        <Image
                          src={report.imageUrl || "/placeholder.svg"}
                          alt={report.condition}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3 flex-1">
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(report.date)}</span>
                        </div>
                        <h3 className="font-medium text-slate-800 dark:text-white line-clamp-1">{report.condition}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation currentPath="/history" />
    </div>
  )
}
