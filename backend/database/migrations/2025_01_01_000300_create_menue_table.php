<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('menues', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tag_id');
            $table->integer('menue_nr');
            $table->string('menue_text');
            $table->decimal('preis', 8, 2);
            $table->integer('menge_verfuegbar')->default(0);
            $table->timestamps();

            $table->foreign('tag_id')
                  ->references('id')
                  ->on('tage')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('menues');
    }
};