import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User as UserIcon, Eye, EyeOff, ShoppingBag, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerAuth(data);
      toast.success('Account created successfully! Welcome to the store.');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-2)] border ${
      hasError ? 'border-red-400' : 'border-[var(--color-border)]'
    } rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 text-sm transition-all`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-48 -right-48 w-96 h-96 bg-[var(--color-primary)]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-[var(--color-secondary)]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, var(--color-primary) 40px, var(--color-primary) 41px)`
      }} />

      {/* Card */}
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-[var(--shadow-lg)] relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-[var(--shadow-md)] group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text)] font-['Outfit']">
            Create Account
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
            Join thousands of football enthusiasts today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                <UserIcon className="w-4 h-4" />
              </div>
              <input {...register('name')} type="text" placeholder="John Doe" className={inputClass(!!errors.name)} />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                <Mail className="w-4 h-4" />
              </div>
              <input {...register('email')} type="email" placeholder="name@example.com" className={inputClass(!!errors.email)} />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                className={`${inputClass(!!errors.password)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                className={`${inputClass(!!errors.confirmPassword)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] text-white font-semibold rounded-xl shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] hover:underline ml-1 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
