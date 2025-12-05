<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED AUTO_INCREMENT

            // Benutzername (Login)
            $table->string('username', 50)->unique();

            // Voller Name
            $table->string('name');

            // Optional: E-Mail (kann NULL sein, muss aber unique bleiben)
            $table->string('email')->nullable()->unique();

            // Eltern / Lehrer / Schüler / Admin
            $table->enum('rolle', [
                'schueler',
                'eltern',
                'lehrer',
                'admin'
            ])->default('eltern');

            // Passwort (gehashed)
            $table->string('password');

            // Für "remember me" & Session Management
            $table->rememberToken();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};