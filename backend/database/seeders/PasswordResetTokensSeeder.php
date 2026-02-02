
<?php

use Illuminate\Database\Seeder;
use App\Models\PasswordResetToken;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordResetTokensSeeder extends Seeder
{
    public function run(): void
    {
        $tokens = [
            'max.mustermann@example.com',
            'admin@example.com'
        ];

        foreach ($tokens as $email) {
            PasswordResetToken::updateOrCreate(
                ['email' => $email],
                [
                    'token' => Str::random(60),
                    'created_at' => Carbon::now(),
                ]
            );
        }
    }
}
