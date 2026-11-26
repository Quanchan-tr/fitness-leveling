<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schedule;

// Prune idempotency records daily
Schedule::command('app:prune-idempotency-records --hours=24')->daily();
