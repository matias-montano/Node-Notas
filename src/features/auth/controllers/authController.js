import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from '../../users/models/user.js';

// Utilidad para generar tokens JWT
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Verificar si los campos obligatorios están presentes
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione todos los campos obligatorios',
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe',
      });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear un nuevo usuario
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
    });

    if (user) {
      // Generar token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          token,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Datos de usuario inválidos',
      });
    }
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

/**
 * @desc    Login de usuario
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si se proporcionaron los campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione email y contraseña',
      });
    }

    // Buscar al usuario por email
    const user = await User.findOne({ email });

    // Verificar si el usuario existe y la contraseña es correcta
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generar token
      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          token,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener perfil de usuario
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    // El usuario ya está disponible en req.user desde el middleware protect
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.status(200).json({
        success: true,
        data: user,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }
  } catch (error) {
    console.error('Error en getUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil de usuario',
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar perfil de usuario
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Actualizar campos
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;

      // Si se proporciona una nueva contraseña, actualizarla
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      // Guardar cambios
      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        data: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          token: generateToken(updatedUser._id),
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }
  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el perfil',
      error: error.message,
    });
  }
};
