import { LoadingLogo } from "@/components/loading-logo"

export default function ScanLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="text-center flex flex-col items-center">
        <div className="flex justify-center">
          <LoadingLogo />
        </div>
        <p className="mt-4 text-slate-600 dark:text-slate-300 animate-pulse">Preparing camera...</p>
      </div>
    </div>
  )
}
