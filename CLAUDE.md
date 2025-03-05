# Defence Dashboard - Development Guide

## Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style Guidelines
- **Types**: Use TypeScript with strict mode enabled
- **Imports**: Use `@/*` path alias for src directory imports
- **Component Structure**: Follow Next.js App Router conventions
- **Naming**: Use PascalCase for components, camelCase for functions/variables
- **CSS**: Use Tailwind CSS for styling
- **Formatting**: ESLint with Next.js core-web-vitals and TypeScript rules
- **Error Handling**: Use React Error Boundaries for UI errors
- **State Management**: Use React hooks for local state
- **Commits**: Use clear, concise commit messages describing changes

## Project Structure
- `/src/app` - Next.js App Router directory
- `/public` - Static assets