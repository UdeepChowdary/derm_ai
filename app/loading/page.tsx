"use client"

import { LoadingLogo } from "@/components/loading-logo"
import { PageTransition } from "@/components/page-transition"

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <PageTransition>
        <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
          <div className="flex flex-col items-center">
            <div className="rounded-full p-4 mb-4 bg-teal-100 dark:bg-teal-900/50 text-teal-500 dark:text-teal-400">
              <LoadingLogo size="lg" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Loading...
            </h2>
            
            <p className="text-lg mb-6 text-slate-500 dark:text-slate-400">
              Please wait while we prepare your camera
            </p>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-4">
              <div 
                className="h-2.5 rounded-full bg-teal-500"
                style={{
                  width: '70%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              ></div>
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  )
} 