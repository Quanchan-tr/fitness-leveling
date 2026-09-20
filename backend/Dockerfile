FROM php:8.3-cli-alpine

WORKDIR /var/www/html

# Install system dependencies
RUN apk update && apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    linux-headers

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql bcmath zip pcntl

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
