<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
$this->call([
            UsersSeeder::class,
            RolesSeeder::class,
            PasswordResetTokensSeeder::class,

            // BASIS → unbedingt zuerst
            TageSeeder::class,

            // danach alles, was einen Tag braucht
            MenueSeeder::class,
            EventsSeeder::class,
            VertretungsplanSeeder::class,
            DetailKostenartenSeeder::class,
            KalenderWochenSeeder::class,
]);
    }
}