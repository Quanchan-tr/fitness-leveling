<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AuthOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $code,
        public readonly string $type, // 'email_verification' | 'password_reset'
        public readonly string $userName = 'Học viên'
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->type) {
            'email_verification' => "[FitTrack AI] Mã xác minh đăng ký tài khoản: {$this->code}",
            'password_reset' => "[FitTrack AI] Mã khôi phục mật khẩu của bạn: {$this->code}",
            default => "[FitTrack AI] Mã xác thực OTP: {$this->code}",
        };

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.auth_otp',
        );
    }
}

