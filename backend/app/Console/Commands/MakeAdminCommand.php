<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdminCommand extends Command
{
    protected $signature = 'user:make-admin {email : Email của tài khoản} {--revoke : Hạ quyền về user thường}';

    protected $description = 'Promote a user to admin or revoke admin privileges.';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$user) {
            $this->error("Không tìm thấy người dùng với email: {$email}");
            return self::FAILURE;
        }

        $targetRole = $this->option('revoke') ? 'user' : 'admin';
        $user->role = $targetRole;
        $user->save();

        $this->info("Đã cập nhật role của {$user->email} thành '{$targetRole}'.");

        return self::SUCCESS;
    }
}
