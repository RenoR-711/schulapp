<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Menue;
use Carbon\Carbon;
use Illuminate\Http\Request;

class KalenderController extends Controller
{
    public function woche(Request $request)
    {
        $shift = intval($request->query('shift', 0));

        // Montag der gewünschten Woche berechnen
        $monday = Carbon::today()->startOfWeek(Carbon::MONDAY)->addWeeks($shift);

        $tage = [];

        for ($i = 0; $i < 7; $i++) {
            $datum = $monday->copy()->addDays($i)->format('Y-m-d');

            // Tag aus DB holen (Tabelle "tage")
            $tag = Tag::where('datum', $datum)->first();

            // Menüs zu diesem Tag laden
            $menues = Menue::where('tag_id', optional($tag)->id)->get();

            $tage[] = [
                'datum' => $datum,
                'menues' => $menues,
            ];
        }

        return response()->json([
            'tage' => $tage,
            'details' => [],
        ]);
    }
}