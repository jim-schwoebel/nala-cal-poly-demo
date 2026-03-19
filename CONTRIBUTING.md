# Contributing to Nala

We love contributions! Nala is an open-source project and we welcome help from anyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/nala-cal-poly-demo.git`
3. Start the app with Docker: `docker compose up --build`
4. Make your changes
5. Open a pull request

## Development Setup

See the [README](README.md) for full setup instructions. The quickest path:

```bash
docker compose up --build
# App: http://localhost:5173
# API: http://localhost:3001
```

Source files are volume-mounted, so edits hot-reload without rebuilding.

## What to Work On

Check [open issues](https://github.com/jim-schwoebel/nala-cal-poly-demo/issues) for things to pick up. Good areas for contributions:

- **New voices/languages** - Add voice options or language support
- **UI improvements** - Animations, accessibility, mobile polish
- **New starter prompts** - Better onboarding suggestions
- **Performance** - Optimize WebLLM loading, reduce bundle size
- **Testing** - Add integration tests, improve coverage
- **Documentation** - Tutorials, guides, examples

## Guidelines

- **Keep it simple** - Small, focused PRs are easier to review
- **Follow existing patterns** - Match the code style already in the project
- **Test your changes** - Run `npm run test:client` before submitting
- **Describe your PR** - Explain what you changed and why

## Code Style

- TypeScript strict mode
- Functional React components with hooks
- Named exports (no default exports)
- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase`
- CSS: BEM-style class names

## Running Tests

```bash
# Client tests
cd client && npx vitest run

# Server tests (requires PostgreSQL)
cd server && DATABASE_URL=postgresql://localhost:5432/nala_test npx vitest run
```

## License

By contributing, you agree that your contributions will be licensed under the [Apache 2.0 License](LICENSE).
