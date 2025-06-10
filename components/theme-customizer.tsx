"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Moon, Sun, Palette, Contrast, Droplet } from "lucide-react"

type ThemeColor = {
  name: string
  value: string
  class: string
}

const themeColors: ThemeColor[] = [
  { name: "Default", value: "#0ea5e9", class: "bg-sky-500" },
  { name: "Rose", value: "#f43f5e", class: "bg-rose-500" },
  { name: "Green", value: "#22c55e", class: "bg-green-500" },
  { name: "Purple", value: "#a855f7", class: "bg-purple-500" },
  { name: "Orange", value: "#f97316", class: "bg-orange-500" },
]

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme()
  const [contrast, setContrast] = React.useState(1)
  const [saturation, setSaturation] = React.useState(1)
  const [selectedColor, setSelectedColor] = React.useState(themeColors[0])

  // Apply theme changes
  React.useEffect(() => {
    document.documentElement.style.setProperty("--theme-contrast", contrast.toString())
    document.documentElement.style.setProperty("--theme-saturation", saturation.toString())
    document.documentElement.style.setProperty("--theme-primary", selectedColor.value)
  }, [contrast, saturation, selectedColor])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customizer
        </CardTitle>
        <CardDescription>Customize the appearance of your app</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dark/Light Mode Toggle */}
        <div className="space-y-2">
          <Label>Theme Mode</Label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <Label>Primary Color</Label>
          <ToggleGroup type="single" value={selectedColor.name} onValueChange={(value) => {
            const color = themeColors.find(c => c.name === value)
            if (color) setSelectedColor(color)
          }}>
            {themeColors.map((color) => (
              <ToggleGroupItem
                key={color.name}
                value={color.name}
                className={`${color.class} data-[state=on]:ring-2 data-[state=on]:ring-offset-2`}
              >
                <span className="sr-only">{color.name}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Contrast Adjustment */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Contrast className="h-4 w-4" />
            Contrast
          </Label>
          <Slider
            value={[contrast]}
            onValueChange={([value]) => setContrast(value)}
            min={0.5}
            max={1.5}
            step={0.1}
          />
        </div>

        {/* Saturation Adjustment */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Droplet className="h-4 w-4" />
            Saturation
          </Label>
          <Slider
            value={[saturation]}
            onValueChange={([value]) => setSaturation(value)}
            min={0.5}
            max={1.5}
            step={0.1}
          />
        </div>
      </CardContent>
    </Card>
  )
} 