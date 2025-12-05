<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ------------------------------------------
    // Passwort ändern (API)
    // ------------------------------------------
    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => ['required'],
            'new_password' => ['required', 'min:6'],
        ]);

        $user = $request->user();

        // Altes Passwort prüfen
        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'message' => 'Das alte Passwort ist falsch.'
            ], 422);
        }

        // Neues Passwort setzen
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Passwort erfolgreich geändert.'
        ]);
    }
}