<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Models\CommunityPost;
use App\Models\PostComment;
use App\Models\PostLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class CommunityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 20), 50);
        $userId = $request->user()->id;

        $posts = CommunityPost::with([
            'user:id,name,avatar_url,level',
            'workoutLog.sets.exercise:id,name,primary_muscle,thumbnail_url',
            'poseCheckSession:id,exercise_type,reps_completed,avg_score,status',
        ])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Map is_liked status for the authenticated user
        $postIds = $posts->pluck('id')->toArray();
        $userLikes = PostLike::query()
            ->where('user_id', $userId)
            ->whereIn('post_id', $postIds)
            ->pluck('post_id')
            ->flip()
            ->toArray();

        $items = collect($posts->items())->map(function ($post) use ($userLikes) {
            $data = $post->toArray();
            $data['is_liked'] = isset($userLikes[$post->id]);
            return $data;
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'page' => $posts->currentPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
                'last_page' => $posts->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
            'workout_log_id' => 'nullable|uuid|exists:workout_logs,id',
            'pose_check_session_id' => 'nullable|uuid|exists:pose_check_sessions,id',
        ]);

        $post = CommunityPost::create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'workout_log_id' => $validated['workout_log_id'] ?? null,
            'pose_check_session_id' => $validated['pose_check_session_id'] ?? null,
            'likes_count' => 0,
            'comments_count' => 0,
        ]);

        $post->load([
            'user:id,name,avatar_url,level',
            'workoutLog.sets.exercise',
            'poseCheckSession',
        ]);

        return response()->json([
            'data' => [
                ...$post->toArray(),
                'is_liked' => false,
            ],
        ], 201);
    }

    public function toggleLike(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $post = CommunityPost::findOrFail($id);

        $deleted = PostLike::where('user_id', $userId)->where('post_id', $id)->delete();

        if ($deleted) {
            $post->decrement('likes_count');
            $liked = false;
        } else {
            PostLike::create([
                'user_id' => $userId,
                'post_id' => $id,
            ]);
            $post->increment('likes_count');
            $liked = true;
        }

        return response()->json([
            'data' => [
                'post_id' => $id,
                'liked' => $liked,
                'likes_count' => max(0, $post->fresh()->likes_count),
            ],
        ]);
    }

    public function comments(string $id): JsonResponse
    {
        $post = CommunityPost::findOrFail($id);

        $comments = PostComment::with('user:id,name,avatar_url,level')
            ->where('post_id', $post->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'data' => $comments,
        ]);
    }

    public function addComment(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $post = CommunityPost::findOrFail($id);

        $comment = PostComment::create([
            'user_id' => $request->user()->id,
            'post_id' => $post->id,
            'content' => $validated['content'],
        ]);

        $post->increment('comments_count');
        $comment->load('user:id,name,avatar_url,level');

        return response()->json([
            'data' => $comment,
        ], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $post = CommunityPost::where('user_id', $request->user()->id)->findOrFail($id);
        $post->delete();

        return response()->json([
            'data' => [
                'message' => 'Post deleted successfully.',
            ],
        ]);
    }
}
