const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
const tmpDir = path.join(apiDir, 'tmp');

// Create directories with correct parameter names
const dirs = [
  'collections/[collectionId]/recipes',
  'notifications/[notificationId]',
  'recipes/[recipeId]/comments/[commentId]',
  'recipes/[recipeId]/notes/[noteId]',
  'recipes/[recipeId]/photos/[photoId]',
  'recipes/[recipeId]/tags',
  'recipes/[recipeId]/variations',
  'shopping-lists/[listId]/items/[itemId]',
  'shopping-lists/[listId]/export'
];

// Create directories
dirs.forEach(dir => {
  const fullPath = path.join(apiDir, dir);
  fs.mkdirSync(fullPath, { recursive: true });
});

// Copy route files back
const routeFiles = {
  'collections/[collectionId]/route.ts': 'tmp/collections/[collectionId]/route.ts',
  'notifications/[notificationId]/route.ts': 'tmp/notifications/[notificationId]/route.ts',
  'recipes/[recipeId]/route.ts': 'tmp/recipes/[recipeId]/route.ts',
  'shopping-lists/[listId]/route.ts': 'tmp/shopping-lists/[listId]/route.ts'
};

Object.entries(routeFiles).forEach(([dest, src]) => {
  const srcPath = path.join(apiDir, src);
  const destPath = path.join(apiDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
});

// Clean up tmp directory
fs.rmSync(tmpDir, { recursive: true, force: true });
