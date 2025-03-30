import mongoose from 'mongoose';
import dotenv from 'dotenv';

import seedUsers from './features/users/seeders/userSeed.js';
import dbConfig from './config/dbConfig.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Función principal para ejecutar todos los seeds
 */
const runSeed = async () => {
  try {
    console.log('Iniciando proceso de seed...');

    // Conectar a la base de datos
    console.log(`Conectando a MongoDB en: ${dbConfig.url}`);
    await mongoose.connect(dbConfig.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('Conexión a MongoDB establecida');

    // Ejecutar seeds
    console.log('-----------------------');
    await seedUsers();
    console.log('-----------------------');

    // Puedes agregar más seeds aquí a medida que crees nuevos modelos
    // await seedGroups();
    // await seedNotes();

    console.log('Proceso de seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el proceso de seed:', error);
    process.exit(1);
  }
};

const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  runSeed();
}

export default runSeed;
