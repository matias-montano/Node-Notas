import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';
import dbConfig from '../../../config/dbConfig.js';

// Configuración del almacenamiento para multer usando GridFS
const storage = new GridFsStorage({
  url: dbConfig.url,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return new Error('Tipo de archivo no soportado. Sube solo imágenes (jpeg, png, gif, webp).');
    }
    
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'uploads',
      metadata: {
        userId: req.user?._id || null,
        uploadedAt: new Date()
      }
    };
  },
});

// Referencia global a GridFS Bucket para operaciones directas
let gfs;

// Inicializar GridFS Bucket
const initGridFS = () => {
  if (!mongoose.connection.readyState) {
    throw new Error('La conexión a MongoDB no está establecida');
  }
  
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
  
  return gfs;
};

// Obtener instancia de GridFS
const getGridFS = () => {
  if (!gfs) {
    return initGridFS();
  }
  return gfs;
};

// Crear middleware de multer con la configuración de GridFS
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  }
});

export { upload, getGridFS, initGridFS };