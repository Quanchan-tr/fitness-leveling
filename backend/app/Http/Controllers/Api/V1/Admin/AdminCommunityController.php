<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\CommunityPost;
use App\Models\PostComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class AdminCommunityController extends Controller
{
    public function posts(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $q = strtolower(trim((string) $request->query('q', '')));
        $trashed = (string) $request->query('trashed', '');

        $query = $trashed === 'only' ? CommunityPost::onlyTrashed() : CommunityPost::query();

        if ($q !== '') {
            $term = '%' . $q . '%';
            $query->where(function ($sub) use ($term) {
                $sub->whereRaw('LOWER(content) LIKE ?', [$term])
                    ->orWhereHas('user', function ($uq) use ($term) {
                        $uq->whereRaw('LOWER(name) LIKE ?', [$term])
                            ->orWhereRaw('LOWER(email) LIKE ?', [$term]);
                    });
            });
        }

        $paginator = $query
            ->with('user:id,name,email,avatar_url')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function destroyPost(string $id): JsonResponse
    {
        $post = CommunityPost::findOrFail($id);
        $post->delete();

        return response()->json([
            'data' => [
                'id' => $id,
                'deleted' => true,
            ],
        ]);
    }

    public function restorePost(string $id): JsonResponse
    {
        $post = CommunityPost::onlyTrashed()->findOrFail($id);
        $post->restore();

        return response()->json([
            'data' => $post->fresh()->load('user:id,name,email,avatar_url'),
        ]);
    }

    public function comments(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $q = strtolower(trim((string) $request->query('q', '')));
        $postId = trim((string) $request->query('post_id', ''));
        $trashed = (string) $request->query('trashed', '');

        $query = $trashed === 'only' ? PostComment::onlyTrashed() : PostComment::query();

        if ($postId !== '') {
            $query->where('post_id', $postId);
        }

        if ($q !== '') {
            $term = '%' . $q . '%';
            $query->where(function ($sub) use ($term) {
                $sub->whereRaw('LOWER(content) LIKE ?', [$term])
                    ->orWhereHas('user', function ($uq) use ($term) {
                        $uq->whereRaw('LOWER(name) LIKE ?', [$term])
                            ->orWhereRaw('LOWER(email) LIKE ?', [$term]);
                    });
            });
        }

        $paginator = $query
            ->with([
                'user:id,name,email',
                'post' => fn ($pq) => $pq->withTrashed()->select('id', 'content', 'deleted_at'),
            ])
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function destroyComment(string $id): JsonResponse
    {
        DB::transaction(function () use ($id) {
            $comment = PostComment::findOrFail($id);
            $comment->delete();

            CommunityPost::withTrashed()
                ->where('id', $comment->post_id)
                ->where('comments_count', '>', 0)
                ->decrement('comments_count');
        });

        return response()->json([
            'data' => [
                'id' => $id,
                'deleted' => true,
            ],
        ]);
    }

    public function restoreComment(string $id): JsonResponse
    {
        $comment = DB::transaction(function () use ($id) {
            $comment = PostComment::onlyTrashed()->findOrFail($id);
            $comment->restore();

            CommunityPost::withTrashed()
                ->where('id', $comment->post_id)
                ->increment('comments_count');

            return $comment->fresh()->load([
                'user:id,name,email',
                'post' => fn ($pq) => $pq->withTrashed()->select('id', 'content', 'deleted_at'),
            ]);
        });

        return response()->json([
            'data' => $comment,
        ]);
    }
}
