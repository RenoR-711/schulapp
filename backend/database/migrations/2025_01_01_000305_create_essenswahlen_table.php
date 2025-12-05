<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
Schema::create('essenswahlen', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->date('datum');
    $table->foreignId('menue_id')->nullable()->constrained('menues')->onDelete('set null');
    $table->timestamps();
});
    }

    public function down()
    {
        Schema::dropIfExists('essenswahlen');
    }
};