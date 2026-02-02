
<?php

use Illuminate\Database\Seeder;
use App\Models\Tag;
use Carbon\Carbon;

class TageSeeder extends Seeder
{
    public function run(): void
    {
        // Start-Montag dieser Woche
        $monday = Carbon::today()->startOfWeek(Carbon::MONDAY);

        for ($i = 0; $i < 7; $i++) {
            $datum = $monday->copy()->addDays($i)->format('Y-m-d');
            Tag::firstOrCreate(['datum' => $datum]);
        }
    }
}
