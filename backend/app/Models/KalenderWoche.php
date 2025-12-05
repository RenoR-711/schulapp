<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KalenderWoche extends Model
{
    use HasFactory;

    protected $table = 'kalender_wochen';

    protected $fillable = [
        'start_datum',
        'ende_datum',
        'shift',
    ];
}