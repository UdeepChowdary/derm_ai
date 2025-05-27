"use client"

import * as React from "react"
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right"
  className?: string
}

export function AnimatedSection({
  children,
  delay = 0,
  duration = 0.3,
  direction = "up",
  className,
  ...props
}: AnimatedSectionProps) {
  const variants = {
    hidden: {
      opacity: 0,
      x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: direction === "left" ? -20 : direction === "right" ? 20 : 0,
      y: direction === "up" ? -20 : direction === "down" ? 20 : 0,
      transition: {
        duration: duration * 0.8,
        ease: "easeIn",
      },
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Hover animation component
interface HoverAnimationProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode
  scale?: number
  className?: string
}

export function HoverAnimation({
  children,
  scale = 1.05,
  className,
  ...props
}: HoverAnimationProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration: 0.2 }}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Page transition component
interface PageTransitionProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
} 