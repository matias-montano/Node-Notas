import bcrypt from 'bcrypt';

import User from '../models/user.js';

/**
 * Seed para crear usuarios iniciales
 */
const seedUsers = async () => {
  try {
    // Verificar si ya existen usuarios en la base de datos
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      console.log('Ya existen usuarios en la base de datos. Omitiendo seed de usuarios.');
      return;
    }

    console.log('Iniciando seed de usuarios...');

    // Hash de la contraseña para el usuario administrador
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    // Crear el usuario administrador
    const adminUser = await User.create({
      username: 'janadoe',
      email: 'jana.doe@example.com',
      password: hashedPassword,
      firstName: 'Jana',
      lastName: 'Doe',
      role: 'admin',
    });

    console.log(`Usuario administrador creado: ${adminUser.username} (${adminUser.email})`);
    console.log('Seed de usuarios completado exitosamente');

    return { adminUser };
  } catch (error) {
    console.error('Error durante el seed de usuarios:', error);
    throw error;
  }
};

export default seedUsers;
