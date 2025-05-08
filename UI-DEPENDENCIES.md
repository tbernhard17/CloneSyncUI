# UI Dependencies Management

This document explains how to manage dependencies in the UI codebase and fix common issues with duplicated files.

## Common Problems

The UI codebase may experience these issues:
- Duplicate Vite dependency files (.vite/deps_temp_* directories)
- Multiple copies of the same React component libraries
- Conflicting versions of dependencies

## Cleaning Up Duplicates

We've added several tools to manage dependencies:

### For Windows Users:

1. Run `clean-ui.bat` in the UI directory:
   ```
   .\clean-ui.bat
   ```

### Using NPM Scripts:

1. Run the clean script:
   ```
   npm run clean
   ```

2. Start development with clean cache:
   ```
   npm run dev
   ```

## Complete Cleanup (If Issues Persist)

If you're still experiencing issues:

1. Delete node_modules:
   ```
   rm -rf node_modules
   ```

2. Delete package-lock.json:
   ```
   rm package-lock.json
   ```

3. Clear npm cache:
   ```
   npm cache clean --force
   ```

4. Reinstall dependencies:
   ```
   npm install
   ```

## Vite Configuration

We've optimized the Vite configuration to handle dependencies better:

1. Added dependency deduplication with `resolve.dedupe`
2. Pre-optimized common dependencies with `optimizeDeps.include`
3. Created logical chunk grouping for vendors

## Avoiding Future Duplications

1. Always use `npm run dev` which includes the cleaning step
2. Don't manually edit the .vite/deps directory
3. Keep dependencies up to date with `npm update`

If you add new UI libraries, consider adding them to:
- `resolve.dedupe` array
- `optimizeDeps.include` array
- Appropriate `manualChunks` group

in the `vite.config.ts` file. 