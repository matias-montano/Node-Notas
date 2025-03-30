import express from 'express';
import { 
  uploadImage, 
  getImage, 
  deleteImage,
  updateProfileImage 
} from '../controllers/imageController.js';
import { upload } from '../utils/gridFsConfig.js'; 
import { protect } from '../../auth/middleware/authMiddleware.js';


const router = express.Router();

// Ruta para subir cualquier imagen (protegida)
router.post('/upload', protect, upload.single('image'), uploadImage);

// Ruta para actualizar imagen de perfil (protegida)
router.post('/profile', protect, upload.single('image'), updateProfileImage);

// Ruta para obtener una imagen por ID (pública)
router.get('/:id', getImage);

// Ruta para eliminar una imagen (protegida)
router.delete('/:id', protect, deleteImage);

export default router;