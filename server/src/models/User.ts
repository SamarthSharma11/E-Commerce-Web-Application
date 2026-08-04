import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { hashPassword, comparePassword } from '../utils/auth';

// =====================================================
// Address Sub-document Interface
// =====================================================
export interface IAddress {
  _id?: Types.ObjectId;
  label: string;           // e.g. "Home", "Office"
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

// =====================================================
// User Document Interface
// =====================================================
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  addresses: IAddress[];
  phone?: string;
  avatar?: string;
  isActive: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(jwtIssuedAt: number): boolean;
}

// =====================================================
// User Model Interface (for static methods)
// =====================================================
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

// =====================================================
// Address Sub-schema
// =====================================================
const AddressSchema = new Schema<IAddress>(
  {
    label:     { type: String, required: true, trim: true, maxlength: 50 },
    line1:     { type: String, required: true, trim: true },
    line2:     { type: String, trim: true },
    city:      { type: String, required: true, trim: true },
    state:     { type: String, required: true, trim: true },
    pincode:   { type: String, required: true, trim: true },
    country:   { type: String, required: true, trim: true, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

// =====================================================
// User Schema
// =====================================================
const UserSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,       // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    addresses: {
      type: [AddressSchema],
      default: [],
      validate: {
        validator: (arr: IAddress[]) => arr.length <= 10,
        message: 'A user cannot have more than 10 saved addresses',
      },
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Please provide a valid phone number'],
    },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as Record<string, unknown>;
        delete obj['password'];
        delete obj['passwordResetToken'];
        delete obj['passwordResetExpires'];
        return obj;
      },
    },
  }
);

// =====================================================
// Indexes
// =====================================================
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// =====================================================
// Pre-save Hook — Hash password before saving
// =====================================================
UserSchema.pre<IUser>('save', async function (next) {
  // Only hash if the password field was modified
  if (!this.isModified('password')) return next();

  try {
    this.password = await hashPassword(this.password);

    // Record when password was changed (for JWT invalidation)
    if (!this.isNew) {
      this.passwordChangedAt = new Date(Date.now() - 1000); // 1 s in the past
    }
    next();
  } catch (err) {
    next(err as Error);
  }
});

// =====================================================
// Instance Methods
// =====================================================
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return comparePassword(candidatePassword, this.password);
};

UserSchema.methods.changedPasswordAfter = function (
  jwtIssuedAt: number
): boolean {
  if (this.passwordChangedAt) {
    const changedAt = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtIssuedAt < changedAt;
  }
  return false;
};

// =====================================================
// Static Methods
// =====================================================
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() }).select('+password');
};

// =====================================================
// Export
// =====================================================
const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
export default User;
