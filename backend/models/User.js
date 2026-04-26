const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    phone:     { type: String, required: true, unique: true, trim: true },
    password:  { type: String, required: true, minlength: 6 },
    role:      { type: String, enum: ['customer', 'employee', 'admin'], default: 'customer' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublic = function () {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName:  this.lastName,
    phone:     this.phone,
    role:      this.role,
  };
};

module.exports = mongoose.model('User', userSchema);
