'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Eye, EyeOff, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormState {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

function validate(form: LoginFormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.email) {
    errors.email = 'Vui lòng nhập email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email không hợp lệ.';
  }
  if (!form.password) {
    errors.password = 'Vui lòng nhập mật khẩu.';
  }
  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo } = useAuth();

  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      router.push('/dashboard');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setServerError(null);
    try {
      await loginDemo();
      router.push('/dashboard');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Không thể đăng nhập demo.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const isValid = form.email && form.password && !fieldErrors.email && !fieldErrors.password;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-orange-100 selection:text-[#FF5722]">
      {/* Brand header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 px-4">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#FF5722] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Fitness<span className="text-[#FF5722]">Leveling</span>
          </span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Đăng nhập tài khoản
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Tiếp tục hành trình tập luyện và thăng hạng thể hình của bạn
        </p>
      </div>

      {/* Form card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 font-medium leading-relaxed">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div>
              <label
                className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase"
                htmlFor="email"
              >
                Địa chỉ Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full h-11 px-4 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 transition-all bg-white ${
                  fieldErrors.email
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-xs font-bold text-slate-700 tracking-wide uppercase"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-[#FF5722] hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 transition-all bg-white ${
                    fieldErrors.password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting || isDemoLoading}
              className="mt-2 w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-slate-900/10"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Đăng nhập
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">hoặc</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Quick Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isDemoLoading || isSubmitting}
            className="w-full h-11 rounded-xl border border-orange-200 bg-orange-50/70 text-sm font-bold text-[#FF5722] flex items-center justify-center gap-2 hover:bg-orange-100 hover:border-orange-300 transition-all cursor-pointer shadow-2xs"
          >
            {isDemoLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-orange-500/30 border-t-[#FF5722] rounded-full animate-spin" />
                Đang kích hoạt Demo…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-orange-500 text-orange-500" />
                Đăng nhập nhanh tài khoản Demo
              </span>
            )}
          </button>

          {/* Footer links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Chưa có tài khoản?{' '}
              <Link
                href="/auth/register"
                className="text-slate-900 font-bold hover:text-[#FF5722] hover:underline underline-offset-2 transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
            <p className="text-xs text-slate-400">
              <Link href="/" className="hover:underline">
                ← Quay lại trang chủ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
