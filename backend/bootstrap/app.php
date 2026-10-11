<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Every API error uses one shape: {error: {code, message, details?}}
        // (matches `ApiError` in frontend/src/lib/api.ts).
        $exceptions->shouldRenderJsonWhen(fn (Request $request) => $request->is('api/*'));

        $error = fn (string $code, string $message, int $status, array $details = []) => response()->json(
            ['error' => array_filter(['code' => $code, 'message' => $message, 'details' => $details])],
            $status
        );

        $exceptions->render(fn (ValidationException $e, Request $r) => $r->is('api/*')
            ? $error('VALIDATION_ERROR', $e->getMessage(), 422, $e->errors()) : null);
        $exceptions->render(fn (AuthenticationException $e, Request $r) => $r->is('api/*')
            ? $error('UNAUTHENTICATED', 'Unauthenticated.', 401) : null);
        $exceptions->render(fn (ModelNotFoundException|NotFoundHttpException $e, Request $r) => $r->is('api/*')
            ? $error('NOT_FOUND', 'Resource not found.', 404) : null);
    })->create();
