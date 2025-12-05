<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tage', function (Blueprint $table) {
            $table->id(); // BIGINT UNSIGNED
            $table->date('datum')->unique();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tage');
    }
};