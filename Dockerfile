FROM php:8.3-apache

# Installer les extensions PHP + Composer + Node.js
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    unzip \
    curl \
    nodejs \
    npm \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && a2enmod rewrite \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Config PHP production : desactive l'affichage des warnings/erreurs dans le HTML
# (sans php.ini actif, binaire = display_errors On, ce qui corromprait les reponses JSON de /api).
RUN cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini

# Copier la config Apache pour pointer vers /public
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Etape 1 : copier composer.json/lock d'abord (cache Docker)
COPY composer.json composer.lock ./

# Etape 2 : installer les dépendances PHP (sans autoloader, on le génère après)
RUN composer install --no-dev --no-scripts --no-autoloader

# Etape 3 : copier le code de l'application
COPY . .

# Etape 4 : Builder React
WORKDIR /var/www/html/public/react-app
RUN npm install
RUN npm run build
WORKDIR /var/www/html

# Etape 5 : generer l'autoloader optimisé avec le code applicatif présent
RUN composer dump-autoload --optimize --no-dev

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage 2>/dev/null || true \
    && chmod -R 755 /var/www/html/public/uploads 2>/dev/null || true

# Script de demarrage
COPY render-start.sh /usr/local/bin/render-start.sh
RUN chmod +x /usr/local/bin/render-start.sh

EXPOSE 80

CMD ["/usr/local/bin/render-start.sh"]
