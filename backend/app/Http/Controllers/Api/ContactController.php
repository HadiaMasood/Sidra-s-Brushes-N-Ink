<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10',
        ]);

        $contact = ContactSubmission::create($validated);
        return response()->json(['message' => 'Contact submission received', 'data' => $contact], 201);
    }

    public function index()
    {
        $submissions = ContactSubmission::orderBy('created_at', 'desc')->paginate(20);
        return response()->json($submissions);
    }

    public function show($id)
    {
        $submission = ContactSubmission::findOrFail($id);
        if ($submission->status === 'new') {
            $submission->update(['status' => 'read']);
        }
        return response()->json($submission);
    }

    public function destroy($id)
    {
        ContactSubmission::findOrFail($id)->delete();
        return response()->json(['message' => 'Submission deleted successfully']);
    }

    public function reply(Request $request, $id)
    {
        $submission = ContactSubmission::findOrFail($id);
        
        $validated = $request->validate([
            'message' => 'required|string|min:5',
        ]);

        // In a real app, you would send an actual email here:
        // Mail::to($submission->email)->send(new \App\Mail\ContactReply($submission, $validated['message']));
        
        // For now, we'll log it and mark the submission as replied
        \Log::info("Reply sent to {$submission->email}", [
            'original_message' => $submission->message,
            'reply' => $validated['message']
        ]);

        $submission->update([
            'status' => 'responded',
            // You might want to save the reply in a new column or table
        ]);

        return response()->json([
            'message' => 'Reply sent successfully',
            'data' => $submission
        ]);
    }
}
