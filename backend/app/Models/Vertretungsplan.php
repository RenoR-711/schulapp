<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vertretungsplan extends Model
{
    protected $table = 'vertretungsplan';

    protected $fillable = [
        'tag_id',
        'info',
        'klasse',
        'datum',
    ];

    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }
}