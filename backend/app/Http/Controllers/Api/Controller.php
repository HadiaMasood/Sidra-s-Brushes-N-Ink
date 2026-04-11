<?php

namespace App\Http\Controllers\Api;

use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    protected function authorize($role)
    {
        if (!auth()->check() || auth()->user()->role !== $role) {
            abort(403, 'Unauthorized');
        }
    }
}
