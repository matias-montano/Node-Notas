import mongoose from 'mongoose';
import { getGridFS } from '../utils/gridFsConfig.js';
import User from '../../users/models/user.js';

/**
 * @desc    Subir una imagen
 * @route   POST /api/images/upload
 * @access  Private
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No se subió ninguna imagen.' 
      });
    }
    
    res.status(201).json({ 
      success: true,
      message: 'Imagen subida con éxito.', 
      fileId: req.file.id,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error en uploadImage:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al subir la imagen', 
      error: error.message 
    });
  }
};

/**
 * @desc    Obtener una imagen por su ID
 * @route   GET /api/images/:id
 * @access  Public
 */
export const getImage = async (req, res) => {
  try {
    const gfs = getGridFS();
    const file = await gfs.find({ _id: new mongoose.Types.ObjectId(req.params.id) }).toArray();
    
    if (!file || file.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }
    
    // Establecer el tipo de contenido adecuado
    res.set('Content-Type', file[0].contentType);
    
    // Crear un stream para la descarga
    const downloadStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(req.params.id));
    
    // Pipe el stream directamente a la respuesta
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error en getImage:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la imagen',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar una imagen por su ID
 * @route   DELETE /api/images/:id
 * @access  Private
 */
export const deleteImage = async (req, res) => {
  try {
    const gfs = getGridFS();
    await gfs.delete(new mongoose.Types.ObjectId(req.params.id));
    
    res.status(200).json({
      success: true,
      message: 'Imagen eliminada con éxito'
    });
  } catch (error) {
    console.error('Error en deleteImage:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar imagen de perfil de usuario
 * @route   POST /api/images/profile
 * @access  Private
 */
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No se subió ninguna imagen.' 
      });
    }

    // Obtener usuario desde el middleware de autenticación
    const userId = req.user._id;
    
    // Actualizar la imagen del usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        profileImage: {
          url: `/api/images/${req.file.id}`, // URL para acceder a la imagen
          publicId: req.file.id.toString(),
          alt: 'Imagen de perfil'
        }
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Imagen de perfil actualizada con éxito',
      data: {
        user: updatedUser,
        imageId: req.file.id
      }
    });
  } catch (error) {
    console.error('Error en updateProfileImage:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la imagen de perfil',
      error: error.message
    });
  }
};