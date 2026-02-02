<?php

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Tag;
use Carbon\Carbon;

class EventsSeeder extends Seeder
{
    public function run(): void
    {
        $tage = Tag::all();

        foreach ($tage as $index => $tag) {
            Event::updateOrCreate(
                ['tag_id' => $tag->id],
                [
                    'beschreibung' => 'Beispiel-Event ' . ($index + 1),
                    'datum_von' => Carbon::parse($tag->datum)->addHours(10),
                    'show_time' => true,
                ]
            );
        }
    }
}
