<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('kalender_wochen', function (Blueprint $table) {
            $table->id();
            $table->date('start_datum');
            $table->date('ende_datum');
            $table->integer('shift')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('kalender_wochen');
    }
};
