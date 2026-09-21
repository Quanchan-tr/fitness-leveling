<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Jobs\ProcessPoseCheckJob;
use App\Models\PoseCheckSession;
use App\Services\Pose\PrivateVideoStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

/**
 * Pose Check Controller.
 *
 * Handles two pose-check flows:
 *
 * 1. Realtime (client-side MediaPipe):
 *    POST /api/v1/pose-check/realtime/result
 *    Client sends a summary JSON after local inference — server does NOT receive
 *    individual camera frames. Summary is persisted and returned 201.
 *
 * 2. Upload video (asynchronous):
 *    POST /api/v1/pose-check/sessions
 *    → Video saved to private local storage (storage/app/private/)
 *    → PoseCheckSession created with status=PENDING
 *    → ProcessPoseCheckJob dispatched to the Database Queue
 *    → 202 Accepted returned immediately
 *
 *    GET /api/v1/pose-check/sessions/{id}   — poll for status
 *    GET /api/v1/pose-check/sessions        — paginated list
 *
 * v2 MVP: No S3, no MinIO, no presigned URLs. Videos are stored locally and
 * shared with the Python CV Worker via a Docker named volume.
 */
class PoseCheckController extends Controller
{
    public function __construct(
        private readonly PrivateVideoStorageService $storage
    ) {}

    // -------------------------------------------------------------------------
    // POST /api/v1/pose-check/realtime/result
    // -------------------------------------------------------------------------

    public function realtimeResult(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'exercise_id'   => 'required|uuid|exists:exercises,id',
            'rep_count'     => 'required|integer|min:0',
            'score'         => 'required|numeric|min:0|max:100',
            'feedback_json' => 'required|array',
        ]);

        $session = PoseCheckSession::create([
            'user_id'       => $request->user()->id,
            'exercise_id'   => $validated['exercise_id'],
            'mode'          => 'realtime',
            'status'        => 'completed',
            'rep_count'     => $validated['rep_count'],
            'score'         => $validated['score'],
            'feedback_json' => $validated['feedback_json'],
            'completed_at'  => now(),
        ]);

        return response()->json([
            'data' => $session,
        ], 201);
    }

    // -------------------------------------------------------------------------
    // POST /api/v1/pose-check/sessions
    // -------------------------------------------------------------------------

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'exercise_id' => 'required|uuid|exists:exercises,id',
            'video'       => 'required|file|mimes:mp4,mov,quicktime|max:102400', // 100 MB
        ]);

        $file      = $request->file('video');
        $userId    = $request->user()->id;
        $sessionId = (string) Str::uuid();

        // Persist the file to private local storage.
        // Path: storage/app/private/pose-videos/{userId}/{sessionId}.{ext}
        $videoPath = $this->storage->store($file, $userId, $sessionId);
        $hash      = $this->storage->hash($videoPath);

        $session = PoseCheckSession::create([
            'id'          => $sessionId,
            'user_id'     => $userId,
            'exercise_id' => $request->input('exercise_id'),
            'mode'        => 'upload',
            'video_path'  => $videoPath,
            'mime'        => $file->getMimeType(),
            'size'        => $file->getSize(),
            'hash'        => $hash,
            'status'      => 'pending',
        ]);

        // Dispatch to the PostgreSQL-backed database queue.
        ProcessPoseCheckJob::dispatch($sessionId);

        return response()->json([
            'data' => [
                'session_id' => $session->id,
                'status'     => $session->status,
            ],
        ], 202);
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/pose-check/sessions/{id}
    // -------------------------------------------------------------------------

    /**
     * Return session metadata and results.
     *
     * NOTE: Video files are private and are NOT exposed via a public URL.
     * Ownership is enforced by filtering on user_id. If direct video access
     * is needed in the future, a dedicated streaming endpoint with auth checks
     * should be added (GET /api/v1/pose-check/sessions/{id}/video).
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $session = PoseCheckSession::with('exercise')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'data' => $session,
        ]);
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/pose-check/sessions
    // -------------------------------------------------------------------------

    public function index(Request $request): JsonResponse
    {
        $perPage  = min((int) $request->query('per_page', 20), 100);
        $sessions = PoseCheckSession::with('exercise')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $sessions->items(),
            'meta' => [
                'page'      => $sessions->currentPage(),
                'per_page'  => $sessions->perPage(),
                'total'     => $sessions->total(),
                'last_page' => $sessions->lastPage(),
            ],
        ]);
    }
}
