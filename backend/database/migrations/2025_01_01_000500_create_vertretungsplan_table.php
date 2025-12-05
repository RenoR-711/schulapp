<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vertretungsplan', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('tag_id');
            $table->string('info');
            $table->string('klasse');
            $table->dateTime('datum'); // Zeit der Vertretung

            $table->timestamps(); // WICHTIG für updateOrCreate()

            $table->foreign('tag_id')
                ->references('id')
                ->on('tage')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vertretungsplan');
    }
};