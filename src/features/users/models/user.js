import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Datos básicos
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'admin'],
    default: 'user' 
  },
  profileImage: {
    url: { type: String },
    publicId: { type: String },
    alt: { type: String }
  },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  joinedAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;