<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        // Rollen anlegen
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);

        // Beispiel: Benutzer 1 zum Admin machen
        $user = User::find(1);
        if ($user) {
            $user->assignRole('admin');
        }
    }
}