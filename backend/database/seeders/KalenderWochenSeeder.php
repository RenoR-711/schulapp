<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KalenderWoche;
use Carbon\Carbon;

class KalenderWochenSeeder extends Seeder
{
    public function run(): void
    {
        // Beispiel: nächste 8 Kalenderwochen generieren
        $start = Carbon::now()->startOfWeek(Carbon::MONDAY);

        for ($i = 0; $i < 8; $i++) {
            $startDatum = $start->copy()->addWeeks($i);
            $endeDatum  = $startDatum->copy()->endOfWeek(Carbon::SUNDAY);

            KalenderWoche::updateOrCreate(
                ['start_datum' => $startDatum->format('Y-m-d')],
                [
                    'ende_datum' => $endeDatum->format('Y-m-d'),
                    'shift' => $i,
                ]
            );
        }
    }
}