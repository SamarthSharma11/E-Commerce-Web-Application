import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-canvas-mist)] select-none">
      {/* Floating Card */}
      <div className="w-full max-w-md bg-white border-none rounded-[28px] p-8 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1 mb-4">
            <span className="text-2xl font-normal tracking-[-0.05em] text-[#000000]">goalkart</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#5433eb]" />
          </Link>

          {isSubmitted ? (
            <div className="w-12 h-12 rounded-full bg-[#f2f4f5] text-[#000000] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#f2f4f5] text-[#000000] flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
          )}

          <h1 className="text-2xl font-normal tracking-[-0.05em] text-[#000000]">
            {isSubmitted ? 'Check Your Email' : 'Reset Password'}
          </h1>
          <p className="text-[14px] text-[#787574] mt-1.5 leading-relaxed max-w-xs">
            {isSubmitted ? (
              <>
                We sent reset instructions to{' '}
                <span className="font-normal text-[#000000]">{submittedEmail}</span>.
              </>
            ) : (
              'Enter your registered email and we\'ll send you a reset link.'
            )}
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-[20px] bg-[#f2f4f5] text-[12px] text-[#787574] leading-relaxed">
              Check your server terminal console log for the stubbed password reset token.
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full py-3 bg-white hover:bg-[#f2f4f5] text-[#000000] text-[14px] font-normal rounded-full border border-[#ebebeb] transition-colors cursor-pointer"
            >
              Try Another Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[12px] font-normal uppercase tracking-wider text-[#787574] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#787574]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full pl-11 pr-4 py-3 bg-white border ${
                    errors.email ? 'border-red-400' : 'border-[#ebebeb]'
                  } rounded-full text-[#000000] placeholder-[#787574] text-[14px] focus:outline-none`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-[12px] text-red-500 font-normal">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-[#000000] hover:opacity-90 text-white font-normal text-[14px] rounded-full transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mt-8 pt-6 border-t border-[#ebebeb] text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[12px] font-normal text-[#787574] hover:text-[#000000] transition-colors"
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
