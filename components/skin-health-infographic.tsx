"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HoverAnimation } from "./animated-section"
import { cn } from "@/lib/utils"

interface SkinHealthMetric {
  name: string
  value: number
  description: string
  icon: React.ReactNode
  color: string
}

interface SkinHealthInfographicProps {
  metrics: SkinHealthMetric[]
  className?: string
}

export function SkinHealthInfographic({ metrics, className }: SkinHealthInfographicProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<SkinHealthMetric | null>(null)

  return (
    <div className={cn("grid gap-4", className)}>
      {metrics.map((metric, index) => (
        <HoverAnimation key={metric.name} scale={1.02}>
          <Card
            className={cn(
              "cursor-pointer transition-all duration-200",
              selectedMetric?.name === metric.name && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedMetric(metric)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("p-2 rounded-full", metric.color)}>
                    {metric.icon}
                  </div>
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                </div>
                <span className="text-2xl font-bold">{metric.value}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={metric.value} className="h-2" />
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: selectedMetric?.name === metric.name ? "auto" : 0,
                  opacity: selectedMetric?.name === metric.name ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <CardDescription className="mt-2">
                  {metric.description}
                </CardDescription>
              </motion.div>
            </CardContent>
          </Card>
        </HoverAnimation>
      ))}
    </div>
  )
}

// Example usage:
export const exampleMetrics: SkinHealthMetric[] = [
  {
    name: "Hydration",
    value: 85,
    description: "Your skin's moisture level is well-maintained. Keep up the good work with your hydration routine!",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    name: "Elasticity",
    value: 72,
    description: "Your skin shows good elasticity. Consider incorporating collagen-boosting products into your routine.",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg>,
    color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
  },
  {
    name: "Texture",
    value: 68,
    description: "Your skin texture is improving. Regular exfoliation can help maintain smooth skin.",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    name: "Evenness",
    value: 75,
    description: "Your skin tone is relatively even. Sun protection is key to maintaining this balance.",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300",
  },
] 