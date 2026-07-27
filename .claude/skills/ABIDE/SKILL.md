```markdown
# ABIDE Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the ABIDE TypeScript codebase. ABIDE is structured without a specific frontend framework, relying on TypeScript for both backend and frontend logic. The repository emphasizes clear file naming, consistent import/export styles, and a workflow that synchronizes backend and frontend feature development.

## Coding Conventions

### File Naming
- **PascalCase** is used for file names, especially for components.
  - Example: `App.tsx`, `UserProfile.tsx`

### Import Style
- **Relative imports** are preferred.
  - Example:
    ```typescript
    import UserProfile from './components/UserProfile';
    ```

### Export Style
- **Default exports** are standard.
  - Example:
    ```typescript
    // In UserProfile.tsx
    const UserProfile = () => { /* ... */ };
    export default UserProfile;
    ```

### Commit Messages
- Mixed types, often using the `feat` prefix for features.
- Average commit message length is 51 characters.

## Workflows

### Feature Implementation with Server and App Update
**Trigger:** When adding a new feature or capability that affects both backend and frontend logic.  
**Command:** `/add-feature`

1. **Update `server.ts`**  
   Implement new backend logic or endpoints to support the feature.
   ```typescript
   // server.ts
   app.post('/api/new-feature', (req, res) => {
     // Handle the new feature logic
     res.send({ success: true });
   });
   ```

2. **Modify `src/App.tsx`**  
   Integrate or expose the new feature in the frontend application entry point.
   ```typescript
   // src/App.tsx
   import NewFeature from './components/NewFeature';

   function App() {
     return (
       <div>
         <NewFeature />
       </div>
     );
   }

   export default App;
   ```

3. **(Optional) Create or Update Related Components**  
   If the feature requires UI elements, create or modify files in `src/components/`.
   ```typescript
   // src/components/NewFeature.tsx
   const NewFeature = () => (
     <div>
       {/* Feature UI */}
     </div>
   );
   export default NewFeature;
   ```

**Files Involved:**
- `server.ts`
- `src/App.tsx`
- `src/components/*.tsx`

**Frequency:** ~2x/month

## Testing Patterns

- **Test Framework:** Unknown (not detected).
- **Test File Pattern:** Files are named with `.test.` in their filename.
  - Example: `UserProfile.test.tsx`
- **Location:** Typically alongside the files they test.
- **Example:**
  ```typescript
  // UserProfile.test.tsx
  import UserProfile from './UserProfile';

  test('renders user profile', () => {
    // Test implementation
  });
  ```

## Commands

| Command      | Purpose                                                        |
|--------------|----------------------------------------------------------------|
| /add-feature | Implements a new feature, updating backend and frontend logic. |

```
