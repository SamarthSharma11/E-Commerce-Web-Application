import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
    `w-full pl-11 pr-4 py-3 bg-white border ${
      hasError ? 'border-red-400' : 'border-[#ebebeb]'
    } rounded-full text-[#000000] placeholder-[#787574] text-[14px] focus:outline-none`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-canvas-mist)] select-none">
      {/* Floating Card */}
      <div className="w-full max-w-md bg-white border-none rounded-[28px] p-8 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-1 mb-3">
            <span className="text-2xl font-normal tracking-[-0.05em] text-[#000000]">goalkart</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#5433eb]" />
          </Link>
          <h1 className="text-2xl font-normal tracking-[-0.05em] text-[#000000]">
            Create Account
          </h1>
          <p className="text-[14px] text-[#787574] mt-1">
            Join thousands of football enthusiasts today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-[12px] font-normal uppercase tracking-wider text-[#787574] mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#787574]">
                <UserIcon className="w-4 h-4" />
              </div>
              <input {...register('name')} type="text" placeholder="John Doe" className={inputClass(!!errors.name)} />
            </div>
            {errors.name && <p className="mt-1 text-[12px] text-red-500 font-normal">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[12px] font-normal uppercase tracking-wider text-[#787574] mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#787574]">
                <Mail className="w-4 h-4" />
              </div>
              <input {...register('email')} type="email" placeholder="name@example.com" className={inputClass(!!errors.email)} />
            </div>
            {errors.email && <p className="mt-1 text-[12px] text-red-500 font-normal">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[12px] font-normal uppercase tracking-wider text-[#787574] mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#787574]">
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
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#787574] hover:text-[#000000] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-[12px] text-red-500 font-normal">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[12px] font-normal uppercase tracking-wider text-[#787574] mb-1.5">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#787574]">
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
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#787574] hover:text-[#000000] transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-[12px] text-red-500 font-normal">{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 mt-2 bg-[#000000] hover:opacity-90 text-white font-normal text-[14px] rounded-full transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-[#ebebeb] text-center text-[12px] text-[#787574]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-normal text-[#000000] hover:underline ml-1 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
