const fs = require('fs');
const path = require('path');

// Buscar archivos *.module.ts
function findModuleFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findModuleFiles(filePath, fileList);
    } else if (file.endsWith('.module.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Corregir los imports de PrismaService
function fixPrismaImports(modulePath) {
  const content = fs.readFileSync(modulePath, 'utf8');
  
  // Verificar si el archivo importa PrismaService directamente
  if (!content.includes('PrismaService') || !content.includes('import { PrismaService }')) {
    return false;
  }
  
  console.log(`Corrigiendo: ${modulePath}`);
  
  // Determinar si importa PrismaModule
  const importsPrismaModule = content.includes('import { PrismaModule }') || 
                              content.includes('PrismaModule');
  
  // Patrón para eliminar la importación de PrismaService
  const importRegex = /import\s+{\s*PrismaService\s*}\s*from\s*['"].*?['"]\s*;?\s*\n/;
  
  // Patrón para eliminar PrismaService de providers
  const providersRegex = /providers\s*:\s*\[\s*([^]*?)\s*\]/;
  
  let newContent = content;
  
  // Eliminar import de PrismaService
  newContent = newContent.replace(importRegex, '');
  
  // Actualizar providers eliminando PrismaService
  newContent = newContent.replace(providersRegex, (match, providersContent) => {
    // Eliminar PrismaService de la lista de providers
    const newProviders = providersContent
      .split(',')
      .map(p => p.trim())
      .filter(p => p !== 'PrismaService')
      .join(', ');
    
    return `providers: [${newProviders}]`;
  });
  
  // Agregar import de PrismaModule si no existe
  if (!importsPrismaModule) {
    const importPath = determineRelativePath(modulePath);
    const importStatement = `import { PrismaModule } from '${importPath}';\n`;
    
    // Insertar después del último import
    const lastImportIndex = newContent.lastIndexOf('import');
    const lastImportEnd = newContent.indexOf('\n', lastImportIndex) + 1;
    
    newContent = newContent.slice(0, lastImportEnd) + importStatement + newContent.slice(lastImportEnd);
    
    // Agregar PrismaModule a imports si no existe
    if (!newContent.includes('imports: [')) {
      newContent = newContent.replace(/@Module\(\{\s*/, '@Module({\n  imports: [PrismaModule],\n  ');
    } else {
      newContent = newContent.replace(/imports\s*:\s*\[\s*/, 'imports: [PrismaModule, ');
    }
  }
  
  fs.writeFileSync(modulePath, newContent);
  return true;
}

// Calcular la ruta relativa a prisma.module.ts
function determineRelativePath(modulePath) {
  const moduleDir = path.dirname(modulePath);
  const rootDir = 'src';
  
  // Calcular cuántos niveles hay que subir para llegar a src
  const relativePath = path.relative(moduleDir, rootDir);
  
  // Si estamos en src, la ruta es './prisma.module'
  if (relativePath === '') {
    return './prisma.module';
  }
  
  // Si tenemos que subir a src, agregar los niveles necesarios
  return relativePath + '/prisma.module';
}

// Script principal
function main() {
  // Buscar todos los archivos de módulo
  const moduleFiles = findModuleFiles('src');
  let fixedCount = 0;
  
  // Corregir cada módulo
  moduleFiles.forEach(modulePath => {
    if (fixPrismaImports(modulePath)) {
      fixedCount++;
    }
  });
  
  console.log(`\nProceso completo. Se corrigieron ${fixedCount} archivos.`);
}

main(); 