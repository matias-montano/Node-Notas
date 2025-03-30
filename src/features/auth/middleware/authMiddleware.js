import jwt from 'jsonwebtoken';
import User from '../../users/models/user.js'; 

/**
 * Middleware para proteger rutas - verifica el token JWT
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Verificar si hay token en los headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      // Alternativa: verificar en cookies
      token = req.cookies.jwt;
    }

    // Si no hay token, denegar acceso
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, no se proporcionó token'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Obtener el usuario del token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Añadir el usuario al objeto de solicitud
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(401).json({
      success: false,
      message: 'No autorizado, token inválido',
      error: error.message
    });
  }
};

/**
 * Middleware para verificar si el usuario es administrador
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'No autorizado como administrador'
    });
  }
};