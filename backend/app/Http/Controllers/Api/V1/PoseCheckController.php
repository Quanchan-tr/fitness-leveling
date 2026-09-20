<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Jobs\ProcessPoseCheckJob;
use App\Models\PoseCheckSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PoseCheckController extends Controller
{
    public function realtimeResult(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'exercise_id' => 'required|uuid|exists:exercises,id',
            'rep_count' => 'required|integer|min:0',
            'score' => 'required|numeric|min:0|max:100',
            'feedback_json' => 'required|array',
        ]);

        $session = PoseCheckSession::create([
            'user_id' => $request->user()->id,
            'exercise_id' => $validated['exercise_id'],
            'mode' => 'realtime',
            'status' => 'completed',
            'rep_count' => $validated['rep_count'],
            'score' => $validated['score'],
            'feedback_json' => $validated['feedback_json'],
            'completed_at' => now(),
        ]);

        return response()->json([
            'data' => $session,
        ], 201);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'exercise_id' => 'required|uuid|exists:exercises,id',
            'video' => 'required|file|mimes:mp4,mov,quicktime|max:102400', // 100MB
        ]);

        $file = $request->file('video');
        $userId = $request->user()->id;
        $sessionId = (string) Str::uuid();
        $ext = $file->getClientOriginalExtension();
        $s3Key = "pose-videos/{$userId}/{$sessionId}.{$ext}";

        // Upload to S3
        Storage::disk('s3')->putFileAs(
            "pose-videos/{$userId}",
            $file,
            "{$sessionId}.{$ext}",
            'private'
        );

        $session = PoseCheckSession::create([
            'id' => $sessionId,
            'user_id' => $userId,
            'exercise_id' => $request->input('exercise_id'),
            'mode' => 'upload',
            's3_bucket' => config('filesystems.disks.s3.bucket', 'fittrack-user-assets'),
            's3_object_key' => $s3Key,
            'video_mime' => $file->getMimeType(),
            'video_size_bytes' => $file->getSize(),
            'status' => 'pending',
        ]);

        // Dispatch background queue job
        ProcessPoseCheckJob::dispatch($sessionId);

        return response()->json([
            'data' => [
                'session_id' => $sessionId,
                'status' => 'pending',
            ],
        ], 202);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $session = PoseCheckSession::where('user_id', $request->user()->id)->findOrFail($id);

        $responsePayload = $session->toArray();

        // If upload video exists, attach temporary pre-signed URL (30 mins)
        if ($session->s3_object_key && Storage::disk('s3')->exists($session->s3_object_key)) {
            $responsePayload['video_presigned_url'] = Storage::disk('s3')->temporaryUrl(
                $session->s3_object_key,
                now()->addMinutes(30)
            );
        }

        return response()->json([
            'data' => $responsePayload,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 20), 100);
        $sessions = PoseCheckSession::with('exercise')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $sessions->items(),
            'meta' => [
                'page' => $sessions->currentPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
                'last_page' => $sessions->lastPage(),
            ],
        ]);
    }
}
