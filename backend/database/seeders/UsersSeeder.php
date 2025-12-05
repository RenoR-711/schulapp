<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Beispiel-Admin
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name'     => 'Administrator',
                'email'    => 'admin@example.com',
                'rolle'    => 'admin',
                'password' => Hash::make('admin123'), // Passwort wird gehasht
            ]
        );

        // Beispiel-Eltern
        User::updateOrCreate(
            ['username' => 'eltern01'],
            [
                'name'     => 'Muster Eltern',
                'email'    => 'eltern01@example.com',
                'rolle'    => 'eltern',
                'password' => Hash::make('passwort'),
            ]
        );

        // Beispiel-Schüler
        User::updateOrCreate(
            ['username' => 'schueler01'],
            [
                'name'     => 'Max Musterschüler',
                'email'    => 'schueler01@example.com',
                'rolle'    => 'schueler',
                'password' => Hash::make('123456'),
            ]
        );
    }
}