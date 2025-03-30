import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar configuraciones
import dbConfig from './config/dbConfig.js';
// Importar rutas
import authRoutes from './features/auth/routes/authRoutes.js';
import userRoutes from './features/users/routes/userRoute.js';
import imageRoutes from './features/images/routes/imageRoutes.js';
import { initGridFS } from './features/images/utils/gridFsConfig.js';

// Configuración de variables de entorno
dotenv.config();

// Crear la aplicación Express
const app = express();

// Configurar middleware para JSON y urlencodedç
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Habilitar CORS
app.use(cors());

// Connect to MongoDB only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(dbConfig.url)
    .then(() => {
      console.log('Conectado a MongoDB');
      // Inicializar GridFS para manejo de imágenes
      initGridFS();
    })
    .catch(error => {
      console.error('Error al conectar a MongoDB:', error.message);
      process.exit(1);
    });
}

// Ruta base
app.get('/', (req, res) => {
  res.json({
    message: 'API funcionando correctamente',
    environment: process.env.NODE_ENV,
  });
});

// Configurar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);

// Middleware para manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Middleware para manejo de errores
app.use((err, req, res, _next) => {
  console.error('Error de servidor:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
  });
});

// Configurar puerto
const PORT = process.env.PORT || 5000;

// Solo inicia el servidor si no estamos en test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
  });
}

export default app;
