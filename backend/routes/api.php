<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\KalenderController;
use App\Http\Controllers\SpeiseplanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// --------------------------------------
// PUBLIC ROUTES
// --------------------------------------
Route::post('/login', [AuthController::class, 'login']);
Route::get('/kalender/woche', [KalenderController::class, 'woche']);

// --------------------------------------
// PROTECTED ROUTES (Sanctum)
// --------------------------------------
Route::middleware('auth:sanctum')->group(function () {

    // Token refresh
    Route::post('/refresh-token', [AuthController::class, 'refresh']);

    Route::post('/menue-waehlen', [SpeiseplanController::class, 'waehlen']);
    
    // Eigene User-Daten abrufen
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());



    });

    // 🔥 Passwort ändern
    Route::post('/change-password', [UserController::class, 'changePassword']);
});