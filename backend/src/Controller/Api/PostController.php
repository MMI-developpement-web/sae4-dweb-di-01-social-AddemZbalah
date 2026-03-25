<?php

namespace App\Controller\Api;

use App\Entity\Like;
use App\Entity\Post;
use App\Entity\User;
use App\Repository\FollowRepository;
use App\Repository\LikeRepository;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api', format: 'json')]
class PostController extends AbstractController
{
    public function __construct(
        private PostRepository $postRepository,
        private LikeRepository $likeRepository,
        private FollowRepository $followRepository,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
    ) {
    }

    /**
     * List all posts in reverse chronological order (paginated)
     * GET /api/posts?page=1&per_page=20&author_id=1
     * Public endpoint - no authentication required to view posts
     */
    #[Route('/posts', name: 'api.posts.all', methods: ['GET'])]
    public function all(Request $request): JsonResponse
    {
        // This endpoint is public - allows viewing posts without authentication
        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = min(50, max(1, (int) $request->query->get('per_page', 20)));
        $offset = ($page - 1) * $perPage;
        
        $authorId = $request->query->get('author_id');
        $authorId = $authorId ? (int) $authorId : null;

        $posts = $this->postRepository->findLatest($perPage, $offset, $authorId);
        
        // Transform posts to include isAuthorBlocked info instead of filtering them out
        $postsData = array_map(function(Post $post) {
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'createdAt' => $post->getCreatedAt()?->format('c'),
                'author' => [
                    'id' => $post->getAuthor()->getId(),
                    'name' => $post->getAuthor()->getName(),
                    'mail' => $post->getAuthor()->getMail(),
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode($post->getAuthor()->getName()),
                ],
                'isAuthorBlocked' => $post->getAuthor()->getIsBlocked(),
                'likes' => count($post->getLikes()),
            ];
        }, $posts);
        
        $total = $this->postRepository->count($authorId ? ['author' => $authorId] : []);

        return $this->json([
            'posts' => $postsData,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_items' => $total,
            ],
        ]);
    }

    /**
     * Delete a post
     * DELETE /api/posts/{id}
     */
    #[Route('/posts/{id}', name: 'api.posts.delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(Post $post): JsonResponse
    {
        if ($post->getAuthor() !== $this->getUser()) {
            return $this->json(['error' => 'Unauthorized or you are not the author.'], 403);
        }

        $this->em->remove($post);
        $this->em->flush();

        return $this->json(null, 204);
    }

    /**
     * Create a new post
     * POST /api/posts
     */
    #[Route('/posts', name: 'api.posts.create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $content = trim((string) ($data['content'] ?? ''));

        $violations = $this->validator->validate($content, [
            new Assert\NotBlank(message: 'Le post ne peut pas être vide.'),
            new Assert\Length(max: 200, maxMessage: 'Le post ne peut pas dépasser 200 caractères.'),
        ]);

        if (count($violations) > 0) {
            return $this->json(['error' => $violations[0]->getMessage()], 422);
        }

        $post = new Post();
        $post->setContent($content);
        $post->setCreatedAt(new \DateTimeImmutable());
        $post->setAuthor($this->getUser());

        $this->em->persist($post);
        $this->em->flush();

        return $this->json($post, 201, [], ['groups' => 'default']);
    }

    /**
     * Like a post
     * POST /api/posts/{id}/like
     */
    #[Route('/posts/{id}/like', name: 'api.posts.like', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function like(Post $post): JsonResponse
    {
        $user = $this->getUser();
        
        // Check if already liked
        $existing = $this->likeRepository->findByPostAndUser($post, $user);

        if ($existing) {
            return $this->json(['error' => 'Already liked'], 409);
        }

        $like = new Like();
        $like->setPost($post);
        $like->setUser($user);
        $like->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($like);
        $this->em->flush();

        return $this->json([
            'liked' => true,
            'likes_count' => count($post->getLikes())
        ], 201);
    }

    /**
     * Unlike a post
     * DELETE /api/posts/{id}/like
     */
    #[Route('/posts/{id}/like', name: 'api.posts.unlike', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function unlike(Post $post): JsonResponse
    {
        $user = $this->getUser();
        
        $like = $this->likeRepository->findByPostAndUser($post, $user);

        if (!$like) {
            return $this->json(['error' => 'Not liked'], 404);
        }

        $this->em->remove($like);
        $this->em->flush();

        return $this->json([
            'liked' => false,
            'likes_count' => count($post->getLikes())
        ]);
    }

    /**
     * Check if current user liked a post
     * GET /api/posts/{id}/like
     */
    #[Route('/posts/{id}/like', name: 'api.posts.liked', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function isLiked(Post $post): JsonResponse
    {
        $user = $this->getUser();
        
        $like = $this->likeRepository->findByPostAndUser($post, $user);

        return $this->json([
            'liked' => $like !== null,
            'likes_count' => count($post->getLikes())
        ]);
    }

    /**
     * Get feed of posts from followed users
     * GET /api/feed?page=1&per_page=20
     */
    #[Route('/feed', name: 'api.feed', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function feed(Request $request): JsonResponse
    {
        $currentUser = $this->getUser();
        
        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = min(50, max(1, (int) $request->query->get('per_page', 20)));
        $offset = ($page - 1) * $perPage;

        // Get all users that the current user is following
        $following = $this->followRepository->findFollowingByUser($currentUser);
        $followingUsers = array_map(fn ($f) => $f->getFollowing(), $following);
        
        // Filter out blocked users
        $followingUsers = array_filter($followingUsers, fn ($user) => !$user->getIsBlocked());

        // Get posts from followed users
        $posts = $this->postRepository->findFeed($followingUsers, $perPage, $offset);
        
        // Transform posts to include isAuthorBlocked info instead of filtering them out
        $postsData = array_map(function(Post $post) {
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'createdAt' => $post->getCreatedAt()?->format('c'),
                'author' => [
                    'id' => $post->getAuthor()->getId(),
                    'name' => $post->getAuthor()->getName(),
                    'mail' => $post->getAuthor()->getMail(),
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode($post->getAuthor()->getName()),
                ],
                'isAuthorBlocked' => $post->getAuthor()->getIsBlocked(),
                'likes' => count($post->getLikes()),
            ];
        }, $posts);
        
        $total = $this->postRepository->countFeed($followingUsers);

        return $this->json([
            'posts' => $postsData,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_items' => $total,
            ],
        ], 200, [], ['groups' => 'default']);
    }
}
