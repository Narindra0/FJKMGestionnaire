<?php
/*
 | Commentaire technique
 | Ce fichier fait partie du noyau de l'application : il gère les mécanismes communs comme le routage, la session, la sécurité ou l'accès aux vues.
 */
namespace App\Core;

final class Router
{
    private array $routes = [];

    public function get(string $uri, array $action, array $middlewares = []): void
    {
        $this->add('GET', $uri, $action, $middlewares);
    }

    public function post(string $uri, array $action, array $middlewares = []): void
    {
        $this->add('POST', $uri, $action, $middlewares);
    }

    public function add(string $method, string $uri, array $action, array $middlewares = []): void
    {
        $this->routes[] = compact('method', 'uri', 'action', 'middlewares');
    }

    public function dispatch(string $method, string $path): void
    {
        $path = '/' . trim($path, '/');
        if ($path === '//') $path = '/';

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;
            $params = $this->match($route['uri'], $path);
            if ($params === false) continue;

            foreach ($route['middlewares'] as $middleware) {
                $this->runMiddleware($middleware);
            }

            [$controllerClass, $methodName] = $route['action'];
            $controller = new $controllerClass();
            call_user_func_array([$controller, $methodName], $params);
            return;
        }

        http_response_code(404);
        View::render('errors/404', ['title' => 'Page introuvable']);
    }

    private function match(string $routeUri, string $path): array|false
    {
        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '([0-9]+)', '/' . trim($routeUri, '/'));
        if ($routeUri === '/') $pattern = '/';
        $pattern = '#^' . $pattern . '$#';
        if (preg_match($pattern, $path, $matches)) {
            array_shift($matches);
            return array_map('intval', $matches);
        }
        return false;
    }

    private function runMiddleware(string $definition): void
    {
        [$name, $args] = array_pad(explode(':', $definition, 2), 2, '');
        $class = 'App\\Middlewares\\' . $name;
        if (!class_exists($class)) {
            throw new \RuntimeException("Middleware introuvable : {$name}");
        }
        (new $class())->handle($args ? explode(',', $args) : []);
    }
}
