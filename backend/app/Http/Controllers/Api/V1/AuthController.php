<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Mail\AuthOtpMail;
use App\Models\OtpVerification;
use App\Models\User;
use App\Services\Gamification\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamificationService = new GamificationService()
    ) {}

    private function generateAndSendOtp(string $email, string $type, string $userName): string
    {
        OtpVerification::where('email', $email)
            ->where('type', $type)
            ->delete();

        $code = sprintf('%06d', random_int(100000, 999999));

        OtpVerification::create([
            'email' => $email,
            'code' => $code,
            'type' => $type,
            'expires_at' => now()->addMinutes(15),
        ]);

        Log::info("[OTP GENERATED] Type: {$type} | Email: {$email} | Code: {$code}");

        try {
            Mail::to($email)->send(new AuthOtpMail($code, $type, $userName));
        } catch (\Throwable $e) {
            Log::error("Failed to send OTP mail to {$email}: " . $e->getMessage());
        }

        return $code;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'goal' => $validated['goal'] ?? 'maintain',
            'weight_kg' => $validated['weight_kg'] ?? 70.0,
            'height_cm' => $validated['height_cm'] ?? 170.0,
            'birth_date' => $validated['birth_date'] ?? '2000-01-01',
            'gender' => $validated['gender'] ?? 'other',
            'activity_level' => $validated['activity_level'] ?? 'moderate',
            'role' => 'user',
            'xp' => 0,
            'level' => 1,
            'current_streak' => 1,
            'last_active_date' => now()->toDateString(),
            'email_verified_at' => null,
        ]);

        $this->generateAndSendOtp($user->email, 'email_verification', $user->name);

        return response()->json([
            'data' => [
                'user' => $user->toArray(),
                'requires_email_verification' => true,
                'email' => $user->email,
                'message' => 'Đăng ký thành công. Vui lòng kiểm tra email để nhập mã xác thực 6 chữ số.',
            ],
        ], 201);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $otp = OtpVerification::where('email', $validated['email'])
            ->where('type', 'email_verification')
            ->where('code', $validated['code'])
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return response()->json([
                'error' => [
                    'code' => 'INVALID_OTP',
                    'message' => 'Mã xác thực không hợp lệ hoặc đã hết hạn.',
                ],
            ], 422);
        }

        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            return response()->json([
                'error' => [
                    'code' => 'USER_NOT_FOUND',
                    'message' => 'Người dùng không tồn tại.',
                ],
            ], 404);
        }

        $user->email_verified_at = now();
        $user->save();

        OtpVerification::where('email', $validated['email'])
            ->where('type', 'email_verification')
            ->delete();

        $token = $user->createToken('auth_token')->plainTextToken;
        $gamification = $this->gamificationService->getGamificationSummary($user);

        return response()->json([
            'data' => [
                'user' => [
                    ...$user->toArray(),
                    'gamification' => $gamification,
                ],
                'token' => $token,
                'message' => 'Xác minh email thành công.',
            ],
        ]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            return response()->json([
                'error' => [
                    'code' => 'USER_NOT_FOUND',
                    'message' => 'Email không tồn tại trong hệ thống.',
                ],
            ], 404);
        }

        if ($user->email_verified_at !== null) {
            return response()->json([
                'error' => [
                    'code' => 'ALREADY_VERIFIED',
                    'message' => 'Tài khoản này đã được xác thực email trước đó.',
                ],
            ], 400);
        }

        $this->generateAndSendOtp($user->email, 'email_verification', $user->name);

        return response()->json([
            'data' => [
                'email' => $user->email,
                'message' => 'Mã xác thực mới đã được gửi tới email của bạn.',
            ],
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Invalid email or password credentials.',
                ],
            ], 401);
        }

        if ($user->email_verified_at === null) {
            $this->generateAndSendOtp($user->email, 'email_verification', $user->name);

            return response()->json([
                'error' => [
                    'code' => 'EMAIL_NOT_VERIFIED',
                    'message' => 'Tài khoản chưa được xác thực email. Mã xác thực mới đã được gửi tới email của bạn.',
                ],
                'data' => [
                    'email' => $user->email,
                    'requires_email_verification' => true,
                ],
            ], 403);
        }

        $this->gamificationService->recordDailyLogin($user);
        $user->refresh();

        $token = $user->createToken('auth_token')->plainTextToken;
        $gamification = $this->gamificationService->getGamificationSummary($user);

        return response()->json([
            'data' => [
                'user' => [
                    ...$user->toArray(),
                    'gamification' => $gamification,
                ],
                'token' => $token,
            ],
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            return response()->json([
                'error' => [
                    'code' => 'USER_NOT_FOUND',
                    'message' => 'Email không tồn tại trong hệ thống FitTrack AI.',
                ],
            ], 404);
        }

        $this->generateAndSendOtp($user->email, 'password_reset', $user->name);

        return response()->json([
            'data' => [
                'email' => $user->email,
                'message' => 'Mã khôi phục mật khẩu 6 số đã được gửi tới email của bạn.',
            ],
        ]);
    }

    public function verifyResetCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $otp = OtpVerification::where('email', $validated['email'])
            ->where('type', 'password_reset')
            ->where('code', $validated['code'])
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return response()->json([
                'error' => [
                    'code' => 'INVALID_OTP',
                    'message' => 'Mã xác thực không hợp lệ hoặc đã hết hạn.',
                ],
            ], 422);
        }

        $resetToken = bin2hex(random_bytes(32));
        $otp->reset_token = $resetToken;
        $otp->save();

        return response()->json([
            'data' => [
                'email' => $validated['email'],
                'reset_token' => $resetToken,
                'message' => 'Mã xác thực hợp lệ.',
            ],
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'reset_token' => ['required', 'string', 'size:64'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $otp = OtpVerification::where('email', $validated['email'])
            ->where('type', 'password_reset')
            ->where('reset_token', $validated['reset_token'])
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return response()->json([
                'error' => [
                    'code' => 'INVALID_RESET_TOKEN',
                    'message' => 'Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thao tác lại từ đầu.',
                ],
            ], 422);
        }

        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            return response()->json([
                'error' => [
                    'code' => 'USER_NOT_FOUND',
                    'message' => 'Người dùng không tồn tại.',
                ],
            ], 404);
        }

        $user->password = Hash::make($validated['password']);
        if ($user->email_verified_at === null) {
            $user->email_verified_at = now();
        }
        $user->save();

        $user->tokens()->delete();

        OtpVerification::where('email', $validated['email'])
            ->where('type', 'password_reset')
            ->delete();

        return response()->json([
            'data' => [
                'message' => 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.',
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->gamificationService->recordDailyLogin($user);
        $user->refresh();
        $gamification = $this->gamificationService->getGamificationSummary($user);

        return response()->json([
            'data' => [
                ...$user->toArray(),
                'gamification' => $gamification,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'data' => [
                'message' => 'Logged out successfully.',
            ],
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());
        $freshUser = $user->fresh();
        $gamification = $this->gamificationService->getGamificationSummary($freshUser);

        return response()->json([
            'data' => [
                'user' => [
                    ...$freshUser->toArray(),
                    'gamification' => $gamification,
                ],
                'message' => 'Profile updated successfully.',
            ],
        ]);
    }
}
