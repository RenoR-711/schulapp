<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menue extends Model
{
    protected $table = 'menues';

    protected $fillable = [
        'tag_id',
        'menue_nr',
        'menue_text',
        'preis',
        'menge_verfuegbar',
        'ausgewaehlt',
    ];

    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }
}