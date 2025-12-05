<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Essenswahl;
use App\Models\Menue;
use Illuminate\Support\Facades\Auth;

class SpeiseplanController extends Controller
{
    public function waehlen(Request $request)
    {
        $request->validate([
            'datum'    => 'required|date',
            'menue_id' => 'nullable|integer'
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Nicht eingeloggt'], 401);
        }

        // Datensatz für diesen Tag pro Benutzer finden oder neuen erstellen
        $wahl = Essenswahl::firstOrNew([
            'user_id' => $user->id,
            'datum'   => $request->datum,
        ]);

        // Abmelden (menue_id = null)
        if (is_null($request->menue_id)) {
            $wahl->menue_id = null;
            $wahl->save();

            return response()->json(['status' => 'abgemeldet']);
        }

        // Menü existiert NICHT?
        if (!Menue::where('id', $request->menue_id)->exists()) {
            return response()->json(['error' => 'Menü nicht gefunden'], 404);
        }

        // Menü speichern
        $wahl->menue_id = $request->menue_id;
        $wahl->save();

        return response()->json([
            'status'   => 'ok',
            'wahl_id'  => $wahl->id,
            'menue_id' => $wahl->menue_id,
        ]);
    }
}