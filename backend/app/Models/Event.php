<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $table = 'events';

    protected $fillable = [
        'tag_id',
        'beschreibung',
        'datum_von',
        'show_time',
    ];

    // Beziehung zum Tag
    public function tag()
    {
        return $this->belongsTo(Tag::class, 'tag_id');
    }
}