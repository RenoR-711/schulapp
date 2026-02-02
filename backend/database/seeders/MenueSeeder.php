<?php

use Illuminate\Database\Seeder;
use App\Models\Menue;
use App\Models\Tag;

class MenueSeeder extends Seeder
{
    public function run(): void
    {
        $tage = Tag::all(); // alle 7 Tage holen

        foreach ($tage as $tag) {

            Menue::create([
                'tag_id' => $tag->id,
                'menue_nr' => 1,
                'menue_text' => 'Schnitzel mit Pommes',
                'preis' => 3.50,
                'menge_verfuegbar' => 10,
            ]);

            Menue::create([
                'tag_id' => $tag->id,
                'menue_nr' => 2,
                'menue_text' => 'Gemüsepasta',
                'preis' => 4.20,
                'menge_verfuegbar' => 8,
            ]);
        }
    }
}
