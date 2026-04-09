---
name: shadcn-ui
description: Conventions and instructions for using shadcn/ui components.
---

# shadcn/ui Skill

## Overview
This project uses shadcn/ui for UI components. 

## Rules
- DO NOT modify components inside `components/ui/` unless strictly necessary to fit the project's design system.
- Always use the CLI to add new components: `npx shadcn@latest add [component]`
- Prefer using composed patterns (e.g., FieldGroup/Field for forms, Cards, Dialogs/Sheets).
- Maintain accessibility: Ensure ARIA labels and screen-reader only elements (`sr-only`) are maintained.
- Ensure all custom styling aligns with Tailwind CSS v4 usage in the project.
- Combine classes using `cn()` from `lib/utils` to avoid conflicts.
