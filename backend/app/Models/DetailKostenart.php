<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailKostenart extends Model
{
    use HasFactory;

    protected $table = 'detail_kostenarten';

    protected $fillable = [
        'tag_id',
        'detail_kostenart_id',
        'kostenart_id',
        'aenderbar',
        'pflicht',
    ];

    // Beziehung zum Tag
    public function tag()
    {
        return $this->belongsTo(Tag::class, 'tag_id');
    }
}