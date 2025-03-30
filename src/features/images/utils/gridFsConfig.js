import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';

import dbConfig from '../../../config/dbConfig.js';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración condicional de almacenamiento basada en el entorno
let storage;
let gfs;
let upload;
let initGridFS;
let getGridFS;

// Para entorno de pruebas, usar almacenamiento local
if (process.env.NODE_ENV === 'test') {
  // Crear carpeta de uploads para tests si no existe
  const testUploadsDir = path.join(__dirname, '../../../test/uploads');
  if (!fs.existsSync(testUploadsDir)) {
    fs.mkdirSync(testUploadsDir, { recursive: true });
  }

  // Configurar almacenamiento local para tests
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, testUploadsDir);
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return cb(err);
        }
        file.id = buf.toString('hex'); // add this line
        cb(null, file.id + path.extname(file.originalname));
      });
    },
  });

  // Mock para GridFS en tests
  const mockGridFS = {
    find: () => ({
      toArray: async () => [
        {
          _id: 'test-file-id',
          filename: 'test-file.jpg',
          contentType: 'image/jpeg',
        },
      ],
    }),
    openDownloadStream: () => {
      const readStream = fs.createReadStream(path.join(testUploadsDir, 'test-image.jpg'));
      return readStream;
    },
    delete: async () => true,
  };

  // Inicializar GridFS con mock para tests
  initGridFS = () => mockGridFS;

  // Getter para GridFS mock
  getGridFS = () => mockGridFS;

  // Crear middleware multer con disco local para tests
  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(
          new Error('Tipo de archivo no soportado. Sube solo imágenes (jpeg, png, gif, webp).')
        );
      }
      cb(null, true);
    },
  });
} else {
  // Configuración normal de GridFS para producción/desarrollo
  storage = new GridFsStorage({
    url: dbConfig.url,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return reject(
            new Error('Tipo de archivo no soportado. Sube solo imágenes (jpeg, png, gif, webp).')
          );
        }

        // Generate a unique filename
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
            metadata: {
              userId: req.user?._id || null,
              uploadedAt: new Date(),
              originalname: file.originalname,
            },
          };
          resolve(fileInfo);
        });
      });
    },
  });

  // Inicializar GridFS Bucket
  initGridFS = () => {
    if (!mongoose.connection.readyState) {
      throw new Error('La conexión a MongoDB no está establecida');
    }

    gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });

    return gfs;
  };

  // Obtener instancia de GridFS
  getGridFS = () => {
    if (!gfs) {
      return initGridFS();
    }
    return gfs;
  };

  // Crear middleware de multer con GridFS para producción
  upload = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // Límite de 5MB
    },
  });
}

// Export at the top level - outside of conditional blocks
export { upload, getGridFS, initGridFS };
