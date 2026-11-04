<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\IdempotencyRecord;
use Illuminate\Console\Command;

class PruneIdempotencyRecords extends Command
{
    protected $signature = 'app:prune-idempotency-records {--hours=24 : Age in hours beyond which records are deleted}';

    protected $description = 'Prune completed and expired idempotency records older than specified hours.';

    public function handle(): int
    {
        $hours = (int) $this->option('hours');
        $cutoff = now()->subHours($hours);

        $count = IdempotencyRecord::where('created_at', '<', $cutoff)->delete();

        $this->info("Successfully pruned {$count} expired idempotency records older than {$hours} hours.");

        return self::SUCCESS;
    }
}

