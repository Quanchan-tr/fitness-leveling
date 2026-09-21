<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    | MVP uses local storage. No S3 / MinIO required.
    */
    'default' => env('FILESYSTEM_DISK', 'local'),

    'disks' => [
        'local' => [
            'driver' => 'local',
            'root'   => storage_path('app'),
            'throw'  => false,
        ],

        'public' => [
            'driver'     => 'local',
            'root'       => storage_path('app/public'),
            'url'        => env('APP_URL') . '/storage',
            'visibility' => 'public',
            'throw'      => false,
        ],

        /*
        |--------------------------------------------------------------------------
        | Private Disk
        |--------------------------------------------------------------------------
        | Used exclusively for pose-check video files. Files are never publicly
        | accessible — Laravel checks ownership before serving. Path structure:
        |
        |   storage/app/private/pose-videos/{user_id}/{session_id}.{ext}
        |
        | This disk is also shared with the Python CV Worker via Docker named
        | volume (private_storage) mounted at /var/www/html/storage/app/private.
        */
        'private' => [
            'driver' => 'local',
            'root'   => storage_path('app/private'),
            'throw'  => true,
        ],
    ],

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],
];
