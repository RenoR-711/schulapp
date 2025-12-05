<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tag_id');
            $table->string('beschreibung');
            $table->dateTime('datum_von');
            $table->boolean('show_time')->default(false);

            $table->timestamps();

            $table->foreign('tag_id')
                  ->references('id')
                  ->on('tage')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('events');
    }
};