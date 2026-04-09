---
name: motion-react
description: Patterns for using Motion (formerly framer-motion) for animations.
---

# Motion React Skill

## Overview
We use the `motion` package for all animations, prioritizing natural, accessible, and high-performance transitions.

## Rules
- Use `motion/react` imports exclusively (DO NOT use `framer-motion`).
- Since `motion` relies on React context and hooks, add `"use client"` to the top of any file using animations, or create a minimal client wrapper to use within Server Components.
- Keep animations subtle and fast (typically < 300ms). Avoid flashy or distracting motion.
- Manage mount/unmount animations using `AnimatePresence`.
- Prioritize CSS transforms (translate, scale, rotate) and opacity for animations to leverage hardware acceleration.
- Respect accessibility: Automatically adapt or disable animations for users who prefer reduced motion. You can use `<MotionConfig reducedMotion="user">` globally or the `useReducedMotion` hook.
