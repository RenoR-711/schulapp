<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetToken extends Model
{
    use HasFactory;

    protected $table = 'password_reset_tokens';

    protected $primaryKey = 'email'; // Primärschlüssel ist nicht id

    public $incrementing = false; // Da der Primärschlüssel kein Auto-Increment ist
    protected $keyType = 'string';

    public $timestamps = false; // Keine updated_at Spalte

    protected $fillable = [
        'email',
        'token',
        'created_at',
    ];
}