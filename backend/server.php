<?php
/*
 |--------------------------------------------------------------------------
 | Development server router
 |--------------------------------------------------------------------------
 |
 | When using the PHP built-in server for local development, route requests
 | through the Laravel `public/index.php`. This file acts as a router so
 | that static assets are served directly while other requests are handled
 | by the framework.
 |
*/

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// If the request points to an actual file in the public folder, let the
// built-in server handle it directly.
if ($uri !== '/' && file_exists(__DIR__ . '/public' . $uri)) {
	return false;
}

// Otherwise, forward the request to Laravel's front controller
require_once __DIR__ . '/public/index.php';
