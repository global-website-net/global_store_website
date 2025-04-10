'use client'

import { motion } from 'framer-motion'

interface MotionComponentProps {
  children: React.ReactNode
  className?: string
  initial?: any
  animate?: any
  transition?: any
  whileInView?: any
  viewport?: any
}

export const MotionDiv = motion.div as React.FC<MotionComponentProps>
export const MotionH1 = motion.h1 as React.FC<MotionComponentProps>
export const MotionP = motion.p as React.FC<MotionComponentProps> 