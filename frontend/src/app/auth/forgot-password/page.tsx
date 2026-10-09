'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Mail, KeyRound, CheckCircle2, ArrowRight, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authService } from '@/lib/auth';

type Step = 'request' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Submit email to receive OTP/reset instruction
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await authService.requestPasswordReset(email.trim().toLowerCase());
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit OTP and new password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setError('Vui lòng nhập mã xác thực OTP.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('Mật khẩu mới tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await authService.resetPassword(email.trim().toLowerCase(), newPassword);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-orange-100 selection:text-[#FF5722]">
      {/* Brand Header */}
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
          {step === 'success' ? 'Đặt lại thành công' : 'Khôi phục mật khẩu'}
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          {step === 'request' && 'Nhập email liên kết với tài khoản của bạn để nhận mã xác thực'}
          {step === 'reset' && `Đã gửi mã xác nhận tới ${email}. Vui lòng nhập mã và mật khẩu mới`}
          {step === 'success' && 'Mật khẩu của bạn đã được cập nhật thành công'}
        </p>
      </div>

      {/* Main Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'request' && (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase"
                  htmlFor="email"
                >
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="name@example.com"
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-slate-900/10 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 transition-all bg-white"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={!email || isSubmitting}
                className="mt-2 w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-slate-900/10"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang gửi yêu cầu…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Gửi mã xác nhận
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase"
                  htmlFor="otp"
                >
                  Mã xác thực OTP (6 chữ số)
                </label>
                <div className="relative">
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Nhập mã ví dụ 123456"
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-slate-900/10 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 transition-all bg-white tracking-widest font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase"
                  htmlFor="newPassword"
                >
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full h-11 pl-4 pr-11 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-slate-900/10 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 transition-all bg-white"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase"
                  htmlFor="confirmPassword"
                >
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full h-11 pl-4 pr-11 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-slate-900/10 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 transition-all bg-white"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!otp || !newPassword || !confirmPassword || isSubmitting}
                className="mt-2 w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-slate-900/10"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang cập nhật mật khẩu…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Lưu mật khẩu mới
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Mật khẩu đã được thay đổi!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bây giờ bạn có thể đăng nhập bằng mật khẩu mới vừa thiết lập.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="w-full h-11 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-md shadow-orange-500/20"
              >
                Đăng nhập ngay
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Footer Back Link */}
          {step !== 'success' && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại Đăng nhập
              </Link>
              <Link
                href="/auth/register"
                className="text-[#FF5722] hover:underline font-bold"
              >
                Đăng ký mới
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
