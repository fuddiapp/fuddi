#!/usr/bin/env node

/**
 * Script para configurar el bucket de storage de Supabase
 * 
 * Este script proporciona instrucciones paso a paso para configurar
 * el bucket de storage necesario para las promociones.
 */

const chalk = require('chalk');
const inquirer = require('inquirer');

console.log(chalk.blue.bold('🚀 Configuración del Bucket de Storage de Supabase\n'));

const questions = [
  {
    type: 'confirm',
    name: 'hasSupabaseProject',
    message: '¿Ya tienes un proyecto de Supabase configurado?',
    default: true
  },
  {
    type: 'input',
    name: 'projectUrl',
    message: 'Ingresa la URL de tu proyecto de Supabase:',
    when: (answers) => answers.hasSupabaseProject,
    validate: (input) => {
      if (input.includes('supabase.co')) {
        return true;
      }
      return 'Por favor ingresa una URL válida de Supabase';
    }
  },
  {
    type: 'confirm',
    name: 'openDashboard',
    message: '¿Quieres abrir el dashboard de Supabase ahora?',
    default: true
  }
];

async function setupStorage() {
  try {
    const answers = await inquirer.prompt(questions);

    console.log(chalk.green('\n✅ Configuración del Bucket de Storage\n'));

    console.log(chalk.yellow('📋 Pasos para configurar el bucket:\n'));

    console.log(chalk.white('1. Ve al dashboard de Supabase'));
    if (answers.projectUrl) {
      console.log(chalk.cyan(`   URL: ${answers.projectUrl}`));
    }

    console.log(chalk.white('\n2. En el menú lateral, haz clic en "Storage"'));

    console.log(chalk.white('\n3. Haz clic en "Create a new bucket"'));

    console.log(chalk.white('\n4. Configura el bucket con estos parámetros:'));
    console.log(chalk.cyan('   - Nombre: promotions'));
    console.log(chalk.cyan('   - Public bucket: ✅ Activado'));
    console.log(chalk.cyan('   - File size limit: 5MB'));
    console.log(chalk.cyan('   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif'));

    console.log(chalk.white('\n5. Haz clic en "Create bucket"'));

    console.log(chalk.yellow('\n🔧 Configuración de Políticas:\n'));

    console.log(chalk.white('6. Después de crear el bucket, ejecuta este comando:'));
    console.log(chalk.cyan('   supabase db push'));

    console.log(chalk.white('\n7. Esto aplicará las políticas de seguridad necesarias'));

    console.log(chalk.green('\n✅ ¡Listo! El bucket de storage estará configurado correctamente.\n'));

    if (answers.openDashboard) {
      console.log(chalk.blue('🔗 Abriendo dashboard de Supabase...'));
      const open = require('open');
      await open('https://supabase.com/dashboard');
    }

    console.log(chalk.gray('\n💡 Consejos:'));
    console.log(chalk.gray('   - Si tienes problemas, verifica que las políticas de RLS estén habilitadas'));
    console.log(chalk.gray('   - Asegúrate de que el bucket sea público para que las imágenes sean accesibles'));
    console.log(chalk.gray('   - Los archivos se almacenarán en la carpeta "promotions/" dentro del bucket'));

  } catch (error) {
    console.error(chalk.red('❌ Error durante la configuración:'), error.message);
  }
}

// Verificar si se ejecuta directamente
if (require.main === module) {
  setupStorage();
}

module.exports = { setupStorage }; 