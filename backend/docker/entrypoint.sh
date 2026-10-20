#!/bin/sh
set -e

# Ensure Laravel storage symlink exists
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link --no-interaction || true
fi

exec "$@"
