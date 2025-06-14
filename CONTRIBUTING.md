# Contributing to Derm AI

Thank you for your interest in contributing to Derm AI! We're excited to have you on board. This document outlines the process for contributing to our project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)
- [License](#license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report any unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v8 or later) or Yarn
- Git

### Installation

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/UdeepChowdary/derm_ai.git
   ```
3. Navigate to the project directory:
   ```bash
   cd derm_ai
   ```
4. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
5. Set up environment variables (create a `.env.local` file based on `.env.example`)
6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Development Workflow

### Branch Naming Convention

We use the following branch naming conventions:

- `feature/feature-name` - New features
- `bugfix/issue-description` - Bug fixes
- `docs/documentation-update` - Documentation updates
- `refactor/component-name` - Code refactoring

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Example:
```
feat(auth): add Google OAuth integration

- Add Google OAuth configuration
- Implement sign-in with Google
- Add user authentication state management

Closes #123
```

## Pull Request Process

1. Ensure your fork is up to date with the main repository
2. Create a new branch for your changes
3. Make your changes following the coding standards
4. Add tests if applicable
5. Run the test suite and ensure all tests pass
6. Commit your changes using the commit message format
7. Push your changes to your fork
8. Open a Pull Request (PR) with a clear description of your changes
9. Request reviews from at least one team member
10. Address any review feedback
11. Once approved, a maintainer will merge your PR

## Coding Standards

### General
- Follow the [TypeScript](https://www.typescriptlang.org/docs/) style guide
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Add comments to explain complex logic
- Remove commented-out code before committing

### React/Next.js
- Use functional components with TypeScript
- Follow the [React Hooks](https://reactjs.org/docs/hooks-rules.html) rules
- Use [Next.js](https://nextjs.org/docs) best practices
- Organize components in the `components` directory
- Use absolute imports (e.g., `@/components/Button`)

### Styling
- Use [Tailwind CSS](https://tailwindcss.com/) for styling
- Follow the utility-first approach
- Use the `cn` utility for conditional class names
- Keep styles scoped to components

## Testing

### Running Tests

```bash
# Run all tests
npm test
# or
yarn test

# Run tests in watch mode
npm test -- --watch
# or
yarn test --watch

# Run tests with coverage
npm test -- --coverage
# or
yarn test --coverage
```

### Writing Tests
- Write unit tests for utility functions
- Write integration tests for components
- Use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- Follow the [Testing Library best practices](https://testing-library.com/docs/guiding-principles/)

## Reporting Issues

When creating an issue, please include:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots or screen recordings if applicable
6. Browser/device information if relevant

## License

By contributing to Derm AI, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.
