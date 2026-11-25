<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Database\Seeders\ShowcaseDataSeeder;
use Illuminate\Console\Command;

class ClearShowcaseDataCommand extends Command
{
    protected $signature = 'app:clear-showcase-data';

    protected $description = 'Remove all showcase seed data created by ShowcaseDataSeeder without affecting real records.';

    public function handle(): int
    {
        $counts = ShowcaseDataSeeder::clear();
        $total = array_sum($counts);

        $rows = [];
        foreach ($counts as $table => $deleted) {
            $rows[] = [$table, $deleted];
        }

        $this->table(['Table', 'Deleted Rows'], $rows);
        $this->info("Đã dọn sạch tổng cộng {$total} bản ghi dữ liệu mẫu (dữ liệu thật được giữ nguyên).");

        return self::SUCCESS;
    }
}
