'use strict';
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Mail, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyPage() {
  const router = useRouter();
  const { user, verifyEmail, resendVerificationEmail, signOut } = useAuth();

  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  // If user is already verified, skip to onboarding
  useEffect(() => {
    if (user?.isEmailVerified && !user?.hasCompletedOnboarding) {
      router.replace('/onboarding');
    } else if (user?.isEmailVerified && user?.hasCompletedOnboarding) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // If no user (session lost), redirect back to register
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.replace('/auth/register');
    }
  }, [user, router]);

  // Resend cooldown timer
  const startCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const handleVerify = async () => {
    const cleanCode = otpCode.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setVerifyError('Vui lòng nhập đầy đủ mã xác thực gồm 6 chữ số.');
      return;
    }
    setIsVerifying(true);
    setVerifyError(null);
    try {
      await verifyEmail(cleanCode);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setResendSuccess(false);
    try {
      await resendVerificationEmail();
      setResendSuccess(true);
      startCooldown();
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Không thể gửi lại mã xác nhận. Vui lòng kiểm tra lại kết nối mạng.');
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = async () => {
    await signOut();
    router.push('/auth/register');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[460px]">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-[#FF5722] flex items-center justify-center">
            <Flame className="w-4.5 h-4.5 fill-white text-white" strokeWidth={1.5} />
          </div>
          <span className="font-black text-lg tracking-tight text-slate-900">
            Fitness<span className="text-[#FF5722]">Leveling</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center shadow-sm">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-slate-700" strokeWidth={1.5} />
          </div>

          <h1 className="font-black text-2xl text-slate-900 tracking-tight mb-2">
            Xác nhận email
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-2">
            Email xác nhận đã được gửi đến
          </p>
          <p className="font-semibold text-slate-900 text-sm mb-6 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 inline-block">
            {user.email}
          </p>

          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Vui lòng kiểm tra hộp thư đến (hoặc Spam) để lấy mã xác thực 6 chữ số và nhập vào bên dưới.
          </p>

          {/* Error */}
          {verifyError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm text-left">
              {verifyError}
            </div>
          )}

          {/* 6-digit OTP Input */}
          <div className="mb-4 text-left">
            <label htmlFor="otp-code" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              Mã xác thực (6 chữ số)
            </label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => {
                setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                if (verifyError) setVerifyError(null);
              }}
              placeholder="000000"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-center text-lg font-bold tracking-[0.35em] text-slate-900 outline-none bg-white"
            />
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleVerify}
            disabled={isVerifying || otpCode.length !== 6}
            className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-3"
          >
            {isVerifying ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xác thực…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận email
              </>
            )}
          </button>

          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="w-full h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Đang gửi lại…
              </>
            ) : resendCooldown > 0 ? (
              `Gửi lại sau ${resendCooldown}s`
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Gửi lại email
              </>
            )}
          </button>

          {resendSuccess && (
            <p className="text-xs text-emerald-600 font-semibold mt-2">Email đã được gửi lại!</p>
          )}
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-5 mt-6">
          <button
            onClick={handleChangeEmail}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            Đổi email
          </button>
          <div className="w-px h-3 bg-slate-300" />
          <Link
            href="/auth/login"
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
          >
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
