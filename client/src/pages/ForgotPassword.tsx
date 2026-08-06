import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, ShoppingBag } from 'lucide-react';
import api from '../api/axios';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Reset instructions sent to your email.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to request password reset';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)] relative overflow-hidden">
      {/* Decorations */}
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-[var(--color-primary)]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-[var(--color-secondary)]/8 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-[var(--shadow-lg)] relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-[var(--shadow-md)] group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
          </Link>

          {isSubmitted ? (
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 flex items-center justify-center mb-3 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-subtle)] border border-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
          )}

          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text)] font-['Outfit']">
            {isSubmitted ? 'Check Your Email' : 'Reset Password'}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1.5 leading-relaxed max-w-xs">
            {isSubmitted ? (
              <>
                We sent reset instructions to{' '}
                <span className="font-semibold text-[var(--color-text)]">{submittedEmail}</span>.
              </>
            ) : (
              'Enter your registered email and we\'ll send you a reset link.'
            )}
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] leading-relaxed">
              💡 <span className="font-medium text-[var(--color-text)]">Development note:</span> Check your server terminal console log for the stubbed password reset token.
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] text-sm font-semibold rounded-xl border border-[var(--color-border)] transition-all"
            >
              Try Another Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] text-white font-semibold rounded-xl shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
