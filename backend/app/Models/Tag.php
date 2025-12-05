<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $table = 'tage';

    protected $fillable = ['datum'];

    public function menues()
    {
        return $this->hasMany(Menue::class);
    }
}