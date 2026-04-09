---
name: forms-zod
description: React Hook Form + Zod patterns for building type-safe, accessible forms with server validation and Next.js Server Actions.
---

# Forms Skill

## Overview
This skill provides opinionated React Hook Form + Zod patterns for building type-safe, accessible forms with server validation and Next.js Server Actions. It standardizes form components, error handling, and UX defaults so forms are consistent, resilient, and easy to reuse. The patterns enforce Zod as the source of truth and require server-side revalidation before persistence.

## How this skill works
Define validation in Zod schemas and use zodResolver with useForm to type your form. Use a FormWrapper that wires React Hook Form's FormProvider and handles global errors, and use FormField (plus concrete field components) to ensure consistent label/input/error markup and proper ARIA attributes. Submit via a client-side onSubmit that calls a Server Action which safeParses the Zod schema and returns a typed ApiResponse; applyActionErrors maps server field errors back into RHF with setError.

## When to use it
- Creating new forms with React Hook Form and Zod schemas
- Submitting to Next.js Server Actions while preserving rich UX feedback
- Building reusable, accessible form fields across an app
- Handling server-side validation and mapping field errors to inputs
- Implementing conditional or async-loaded form data that must reset

## Best practices
- Keep all validation rules in Zod schemas — never validate in JSX
- Use mode: "onTouched" and provide defaultValues for predictable UX
- Always revalidate on the server with safeParse() before persisting
- Use FormWrapper + FormField components — avoid duplicating label/input/error markup
- Apply aria-invalid and aria-describedby for accessibility and use role="alert" for inline errors
- Return a typed ApiResponse from Server Actions and use applyActionErrors to set field errors

## Example use cases
- A CreateUser form that validates client-side via Zod and revalidates in a Server Action before creating a DB record
- An edit profile flow that loads user data, resets the form with methods.reset, and submits updates with rich field error feedback
- A complex form with conditional sections using shouldUnregister: true so hidden fields are removed from values
- A select or custom third-party input handled only with Controller when necessary; default to native inputs otherwise
- A paged multi-step form that shares the same FormField components and centralized error handling

## FAQ
**Why must validation live in Zod and not in JSX?**
Zod is the single source of truth: keeping rules in Zod prevents duplication, ensures consistent messages/types, and enables identical server-side revalidation.

**How do server field errors get shown next to inputs?**
Server Actions return fieldErrors in a typed ApiResponse. applyActionErrors maps those into react-hook-form via setError so errors render inline with aria attributes.
