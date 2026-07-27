```markdown
# ABIDE Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the ABIDE repository, a TypeScript codebase built with React. You'll learn how to structure files, write and organize code, follow commit message standards, and implement and run tests in alignment with the project's established practices.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userProfile.tsx`, `dataFetcher.ts`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```typescript
    import { fetchData } from './dataFetcher';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In userProfile.tsx
    export function UserProfile() { ... }
    ```

### Commit Messages
- Follow the **Conventional Commits** standard.
- Use the `feat` prefix for new features.
- Commit message length averages 78 characters.
  - Example:
    ```
    feat: add user profile component for displaying user information
    ```

## Workflows

_No automated workflows were detected in this repository._

## Testing Patterns

- **Test file pattern:** All test files use the `*.test.*` naming convention.
  - Example: `userProfile.test.tsx`
- **Testing framework:** Not explicitly detected; refer to project documentation or package.json for details.
- **Test structure:** Place test files alongside or near the files they test.

  ```typescript
  // userProfile.test.tsx
  import { UserProfile } from './userProfile';

  describe('UserProfile', () => {
    it('renders user data', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command      | Purpose                                      |
|--------------|----------------------------------------------|
| /new-feature | Scaffold a new feature with proper conventions|
| /test        | Run all tests in the repository              |
| /commit      | Generate a conventional commit message        |
```