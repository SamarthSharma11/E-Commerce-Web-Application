import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Eye, EyeOff, ShoppingBag, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success('Welcome back! Logged in successfully.');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-[var(--color-primary)]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-[var(--color-secondary)]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, var(--color-primary) 40px, var(--color-primary) 41px)`
      }} />

      {/* Card */}
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-[var(--shadow-lg)] relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-[var(--shadow-md)] group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text)] font-['Outfit']">
            Welcome Back
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
            Sign in to access your account and orders
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                {...register('email')}
                type="email"
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-3 bg-[var(--color-surface-2)] border ${
                  errors.email ? 'border-red-400' : 'border-[var(--color-border)]'
                } rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 text-sm transition-all`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-3 bg-[var(--color-surface-2)] border ${
                  errors.password ? 'border-red-400' : 'border-[var(--color-border)]'
                } rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 text-sm transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] text-white font-semibold rounded-xl shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] hover:underline ml-1 transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
