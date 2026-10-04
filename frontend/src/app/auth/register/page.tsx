'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface FormState {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  email?: string;
  displayName?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.email) {
    errors.email = 'Vui lòng nhập email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email không hợp lệ.';
  }
  if (form.displayName && form.displayName.length > 40) {
    errors.displayName = 'Tên hiển thị tối đa 40 ký tự.';
  }
  if (!form.password) {
    errors.password = 'Vui lòng nhập mật khẩu.';
  } else if (form.password.length < 8) {
    errors.password = 'Mật khẩu tối thiểu 8 ký tự.';
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
  }
  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState<FormState>({
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
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
      await register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        displayName: form.displayName.trim() || form.email.split('@')[0],
      });
      router.push('/auth/verify');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    form.email && form.password && form.confirmPassword &&
    !fieldErrors.email && !fieldErrors.password && !fieldErrors.confirmPassword;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Left panel — brand / visual ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-shrink-0 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Brand mark */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-[#FF5722] flex items-center justify-center">
            <Flame className="w-5 h-5 fill-white text-white" strokeWidth={1.5} />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-white block leading-none">
              FitTrack<span className="text-[#FF5722]">AI</span>
            </span>
            <span className="text-[11px] text-slate-500 font-semibold tracking-widest uppercase">
              Command Center
            </span>
          </div>
        </Link>

        {/* Headline copy */}
        <div className="relative z-10">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#FF5722] mb-4">
            Bắt đầu hành trình
          </p>
          <h1 className="font-black text-4xl xl:text-5xl text-white leading-[1.05] tracking-tight mb-6">
            Theo dõi.<br />Cải thiện.<br />
            <span className="text-[#FF5722]">Bứt phá.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Tạo tài khoản để bắt đầu hành trình cải thiện sức khoẻ với dữ liệu cơ thể và luyện tập cá nhân hoá.
          </p>
        </div>

        {/* Social proof */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {['#FF5722', '#0284C7', '#059669', '#7C3AED'].map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: color }}
              >
                {['Q', 'M', 'L', 'H'][i]}
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm">
            Cùng <span className="text-white font-semibold">4.200+</span> người đang luyện tập
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#FF5722] flex items-center justify-center">
              <Flame className="w-4 h-4 fill-white text-white" strokeWidth={1.5} />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900">
              FitTrack<span className="text-[#FF5722]">AI</span>
            </span>
          </Link>

          <h2 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight mb-1">
            Tạo tài khoản
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Chỉ cần email và mật khẩu. Thông tin thể hình sẽ được thiết lập sau.
          </p>

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-2.5 p-3.5 mb-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Display name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase" htmlFor="displayName">
                Tên hiển thị <span className="font-normal text-slate-400 normal-case">(tuỳ chọn)</span>
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                value={form.displayName}
                onChange={handleChange}
                placeholder="Ví dụ: Quân Trần"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
              {fieldErrors.displayName && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldErrors.displayName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
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

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 8 ký tự"
                  className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 transition-all bg-white [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
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

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 transition-all bg-white [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                    fieldErrors.confirmPassword
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="mt-2 w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo tài khoản…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Tạo tài khoản
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

          {/* Demo shortcut */}
          <Link
            href="/"
            className="w-full h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Vào demo không cần đăng ký
          </Link>

          <p className="text-center text-xs text-slate-400 mt-6">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-slate-900 font-semibold hover:underline underline-offset-2">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
