<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FitTrack AI - Mã xác thực</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #0b0f19;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #e2e8f0;
        }
        .container {
            max-width: 560px;
            margin: 40px auto;
            background-color: #131b2e;
            border-radius: 16px;
            border: 1px solid #1e293b;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }
        .header {
            background: linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1.5px;
            color: #ffffff;
            text-transform: uppercase;
        }
        .header p {
            margin: 6px 0 0 0;
            font-size: 13px;
            color: #e0e7ff;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 36px 28px;
            text-align: center;
        }
        .content h2 {
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 700;
            color: #f8fafc;
        }
        .content p {
            margin: 0 0 24px 0;
            font-size: 15px;
            line-height: 1.6;
            color: #94a3b8;
        }
        .otp-box {
            display: inline-block;
            background: #0f172a;
            border: 2px solid #38bdf8;
            border-radius: 12px;
            padding: 16px 36px;
            margin: 12px 0 24px 0;
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 10px;
            color: #38bdf8;
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
        }
        .expiry-note {
            font-size: 13px;
            color: #f59e0b;
            margin-bottom: 24px;
        }
        .security-warning {
            border-top: 1px solid #1e293b;
            padding-top: 20px;
            font-size: 12px;
            color: #64748b;
            line-height: 1.5;
        }
        .footer {
            background-color: #0b0f19;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #475569;
            border-top: 1px solid #1e293b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FITTRACK AI</h1>
            <p>HỆ THỐNG HUẤN LUYỆN THỂ HÌNH THÔNG MINH</p>
        </div>
        <div class="content">
            <h2>Xin chào {{ $userName }},</h2>
            @if ($type === 'email_verification')
                <p>Cảm ơn bạn đã gia nhập hàng ngũ Thợ Săn FitTrack AI. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất kích hoạt tài khoản của bạn:</p>
            @elseif ($type === 'password_reset')
                <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản FitTrack AI của bạn. Hãy nhập mã bảo mật sau trên ứng dụng để tiếp tục:</p>
            @else
                <p>Dưới đây là mã bảo mật OTP một lần của bạn:</p>
            @endif

            <div class="otp-box">
                {{ $code }}
            </div>

            <p class="expiry-note">⏱️ Mã xác thực này có hiệu lực trong vòng <strong>15 phút</strong>.</p>

            <div class="security-warning">
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Tuyệt đối không chia sẻ mã này cho bất kỳ ai khác để bảo vệ tài khoản của bạn.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} FitTrack AI. All rights reserved.
        </div>
    </div>
</body>
</html>

