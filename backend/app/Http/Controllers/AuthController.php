<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // -------------------------------------
    // LOGIN
    // -------------------------------------
    public function login(Request $request)
    {
        $credentials = $request->only('username', 'password');

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Benutzername oder Passwort falsch.'
            ], 401);
        }

        $user = Auth::user();

        // Neuen Token generieren
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }


    // -------------------------------------
    // GET CURRENT USER / ME
    // -------------------------------------
    public function me(Request $request)
    {
        return response()->json($request->user());
    }


    // -------------------------------------
    // REFRESH TOKEN
    // -------------------------------------
    public function refresh(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Nicht authentifiziert.'
            ], 401);
        }

        // Neuen Token erzeugen
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
        ]);
    }


    // -------------------------------------
    // LOGOUT (Token löschen)
    // -------------------------------------
    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user) {
            // Alle Tokens löschen
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'Erfolgreich abgemeldet.'
        ]);
    }
}