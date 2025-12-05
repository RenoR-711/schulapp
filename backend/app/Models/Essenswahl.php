<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Essenswahl extends Model
{
    protected $table = 'essenswahlen';
    
    protected $fillable = [
        'user_id',
        'datum',
        'menue_id'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function menue() {
        return $this->belongsTo(Menue::class);
    }
}