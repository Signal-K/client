const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Define the directory of your Next.js project
const projectDirectory = '/path/to/your/nextjs/project';

// Function to recursively read files in a directory
function readFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      readFiles(filePath);
    } else if (filePath.endsWith('.tsx')) {
      processFile(filePath);
    }
  });
}

// Function to process a TypeScript file
function processFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');

  // Parse the TypeScript code using Babel parser
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  // Traverse the AST to find exported components
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const { declaration } = path.node;
      if (declaration.type === 'VariableDeclaration') {
        declaration.declarations.forEach(declaration => {
          if (declaration.id.type === 'Identifier') {
            console.log(`Exported component: ${declaration.id.name}`);
          }
        });
      } else if (declaration.type === 'FunctionDeclaration') {
        console.log(`Exported component: ${declaration.id.name}`);
      }
    }
  });
}

// Start reading files in the project directory
readFiles(projectDirectory);
