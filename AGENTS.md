# Bolt.diy Agent Guidelines

## Commands
- Build: `pnpm build`
- Dev: `pnpm dev`
- Test: `pnpm test` (all tests), `pnpm test tests/file.test.ts` (single test)
- Test watch mode: `pnpm test:watch`
- Lint: `pnpm lint`
- Fix linting issues: `pnpm lint:fix`
- Type check: `pnpm typecheck`

## Code Style
- Use absolute imports with `~/` prefix instead of relative imports
- Follow Prettier config: 120 char line width, 2 space indent, single quotes
- Always use semicolons and curly braces for blocks
- Use TypeScript with strict mode enabled
- Use PascalCase for React components, camelCase for functions/variables
- Handle errors with try/catch blocks and provide meaningful error messages
- Follow Unix line endings
- Use arrow functions with proper spacing
- Avoid eval and other unsafe patterns
- Use consistent object/array spacing
- Components should be in .tsx files, utilities in .ts files

## Project Structure
- React components in `app/components/`
- Stores in `app/lib/stores/`
- Utilities in `app/utils/`
- Routes in `app/routes/`