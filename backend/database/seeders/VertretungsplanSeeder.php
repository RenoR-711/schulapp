<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vertretungsplan;
use App\Models\Tag;
use Carbon\Carbon;

class VertretungsplanSeeder extends Seeder
{
    public function run(): void
    {
        $tage = Tag::all();

        foreach ($tage as $index => $tag) {
            Vertretungsplan::updateOrCreate(
                ['tag_id' => $tag->id],
                [
                    'info' => 'Vertretung Beispiel ' . ($index + 1),
                    'klasse' => 'Klasse ' . (($index % 5) + 1),
                    'datum' => Carbon::parse($tag->datum)->addHours(9), // 09:00 Uhr
                ]
            );
        }
    }
}