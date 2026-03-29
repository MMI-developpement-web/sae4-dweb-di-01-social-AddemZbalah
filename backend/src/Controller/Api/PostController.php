<?php

namespace App\Controller\Api;

use App\Entity\Like;
use App\Entity\Post;
use App\Entity\Reply;
use App\Entity\User;
use App\Repository\FollowRepository;
use App\Repository\LikeRepository;
use App\Repository\PostRepository;
use App\Repository\ReplyRepository;
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
        private ReplyRepository $replyRepository,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
    ) {
    }

    /**
     * Helper method to format post data with author info
     */
    private function formatPostData(Post $post): array
    {
        $author = $post->getAuthor();
        $profilePhoto = $author->getProfilePhoto();
        // Use profile photo from DB if available, otherwise use dicebear API
        $avatar = $profilePhoto ?: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode($author->getName());
        
        // If post is censored, show placeholder content and hide likes/replies
        if ($post->isCensored()) {
            return [
                'id' => $post->getId(),
                'content' => 'Ce message enfreint les conditions d\'utilisation de la plateforme',
                'mediaUrl' => null,
                'createdAt' => $post->getCreatedAt()?->format('c'),
                'author' => [
                    'id' => $author->getId(),
                    'name' => $author->getName(),
                    'mail' => $author->getMail(),
                    'avatar' => $avatar,
                    'profilePhoto' => $profilePhoto,
                    'bannerImage' => $author->getBannerImage(),
                ],
                'isAuthorBlocked' => $author->getIsBlocked(),
                'isCensored' => true,
                'isPinned' => $post->isPinned(),
                'retweetOf' => $post->getRetweetOf() ? $post->getRetweetOf()->getId() : null,
                'likes' => 0,
                'replies' => 0,
            ];
        }
        
        return [
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'mediaUrl' => $post->getMediaUrl(),
            'createdAt' => $post->getCreatedAt()?->format('c'),
            'author' => [
                'id' => $author->getId(),
                'name' => $author->getName(),
                'mail' => $author->getMail(),
                'avatar' => $avatar,
                'profilePhoto' => $profilePhoto,
                'bannerImage' => $author->getBannerImage(),
            ],
            'isAuthorBlocked' => $author->getIsBlocked(),
            'isCensored' => false,
            'isPinned' => $post->isPinned(),
            'retweetOf' => $post->getRetweetOf() ? $post->getRetweetOf()->getId() : null,
            'likes' => count($post->getLikes()),
            'replies' => count($post->getReplies()),
        ];
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
        $postsData = array_map([$this, 'formatPostData'], $posts);
        
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
        $mediaUrl = isset($data['mediaUrl']) ? trim((string) $data['mediaUrl']) : null;

        $violations = $this->validator->validate($content, [
            new Assert\NotBlank(message: 'Le post ne peut pas être vide.'),
            new Assert\Length(max: 280, maxMessage: 'Le post ne peut pas dépasser 280 caractères.'),
        ]);

        if (count($violations) > 0) {
            return $this->json(['error' => $violations[0]->getMessage()], 422);
        }

        $post = new Post();
        $post->setContent($content);
        if ($mediaUrl) {
            $post->setMediaUrl($mediaUrl);
        }
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
        // Check if post is censored
        if ($post->isCensored()) {
            return $this->json(['error' => 'Ce post a été censuré'], 403);
        }

        $user = $this->getUser();
        $postAuthor = $post->getAuthor();
        
        // Check if user is blocked by post author
        if ($postAuthor->isBlockingUser($user)) {
            return $this->json(['error' => 'Vous avez été bloqué par cet utilisateur'], 403);
        }
        
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
        $postsData = array_map([$this, 'formatPostData'], $posts);
        
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

    /**
     * Update a post (edit)
     * PUT /api/posts/{id}
     */
    #[Route('/posts/{id}', name: 'api.posts.update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function update(Post $post, Request $request): JsonResponse
    {
        if ($post->getAuthor() !== $this->getUser()) {
            return $this->json(['error' => 'Unauthorized or you are not the author.'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $content = trim((string) ($data['content'] ?? ''));
        $mediaUrl = isset($data['mediaUrl']) ? trim((string) $data['mediaUrl']) : null;

        $violations = $this->validator->validate($content, [
            new Assert\NotBlank(message: 'Le post ne peut pas être vide.'),
            new Assert\Length(max: 280, maxMessage: 'Le post ne peut pas dépasser 280 caractères.'),
        ]);

        if (count($violations) > 0) {
            return $this->json(['error' => $violations[0]->getMessage()], 422);
        }

        $post->setContent($content);
        if ($mediaUrl !== null) {
            $post->setMediaUrl($mediaUrl ?: null);
        }

        $this->em->flush();

        return $this->json($post, 200, [], ['groups' => 'default']);
    }

    /**
     * Create a reply to a post
     * POST /api/posts/{id}/replies
     */
    #[Route('/posts/{id}/replies', name: 'api.replies.create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createReply(Post $post, Request $request): JsonResponse
    {
        // Check if post is censored
        if ($post->isCensored()) {
            return $this->json(['error' => 'Vous ne pouvez pas répondre à un post censuré'], 403);
        }

        $user = $this->getUser();
        $postAuthor = $post->getAuthor();
        
        // Check if user is blocked by post author
        if ($postAuthor->isBlockingUser($user)) {
            return $this->json(['error' => 'Vous avez été bloqué par cet utilisateur'], 403);
        }
        
        // US 2.3: Check if post author has read-only mode enabled
        if ($postAuthor->isReadOnly()) {
            return $this->json(['error' => 'Cet utilisateur a activé le mode lecture seule, vous ne pouvez pas commenter'], 403);
        }
        
        $data = json_decode($request->getContent(), true);
        $textContent = trim((string) ($data['textContent'] ?? ''));

        $violations = $this->validator->validate($textContent, [
            new Assert\NotBlank(message: 'La réponse ne peut pas être vide.'),
            new Assert\Length(max: 280, maxMessage: 'La réponse ne peut pas dépasser 280 caractères.'),
        ]);

        if (count($violations) > 0) {
            return $this->json(['error' => $violations[0]->getMessage()], 422);
        }

        $reply = new Reply();
        $reply->setTextContent($textContent);
        $reply->setCreatedAt(new \DateTimeImmutable());
        $reply->setAuthor($this->getUser());
        $reply->setCommentOf($post);

        $this->em->persist($reply);
        $this->em->flush();

        return $this->json($reply, 201, [], ['groups' => 'reply:read']);
    }

    /**
     * Get replies for a post
     * GET /api/posts/{id}/replies
     */
    #[Route('/posts/{id}/replies', name: 'api.replies.list', methods: ['GET'])]
    public function getReplies(Post $post): JsonResponse
    {
        $replies = $this->replyRepository->findBy(['commentOf' => $post], ['createdAt' => 'DESC']);

        return $this->json($replies, 200, [], ['groups' => 'reply:read']);
    }

    /**
     * Delete a reply
     * DELETE /api/replies/{id}
     */
    #[Route('/replies/{id}', name: 'api.replies.delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteReply(Reply $reply): JsonResponse
    {
        if ($reply->getAuthor() !== $this->getUser()) {
            return $this->json(['error' => 'Unauthorized or you are not the author.'], 403);
        }

        $this->em->remove($reply);
        $this->em->flush();

        return $this->json(null, 204);
    }

    /**
     * Censor a post (admin only)
     * POST /api/posts/{id}/censor
     */
    #[Route('/posts/{id}/censor', name: 'api.posts.censor', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function censorPost(Post $post): JsonResponse
    {
        $post->setCensored(true);
        $this->em->flush();

        return $this->json(['censored' => true], 200);
    }

    /**
     * Uncensor a post (admin only)
     * DELETE /api/posts/{id}/censor
     */
    #[Route('/posts/{id}/censor', name: 'api.posts.uncensor', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function uncensorPost(Post $post): JsonResponse
    {
        $post->setCensored(false);
        $this->em->flush();

        return $this->json(['censored' => false], 200);
    }

    /**
     * Pin/Unpin a post on author's profile
     * POST /api/posts/{id}/pin
     */
    #[Route('/posts/{id}/pin', name: 'api.posts.pin', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function pinPost(Post $post): JsonResponse
    {
        $user = $this->getUser();
        
        if ($post->getAuthor() !== $user) {
            return $this->json(['error' => 'Vous ne pouvez épingler que vos propres posts'], 403);
        }

        // Only one post can be pinned per user
        $pinnedPosts = $this->postRepository->findBy(['author' => $user, 'isPinned' => true]);
        foreach ($pinnedPosts as $pinnedPost) {
            if ($pinnedPost !== $post) {
                $pinnedPost->setIsPinned(false);
            }
        }

        $post->setIsPinned(true);
        $this->em->flush();

        return $this->json(['pinned' => true, 'post' => $post], 200, [], ['groups' => 'default']);
    }

    /**
     * Unpin a post
     * DELETE /api/posts/{id}/pin
     */
    #[Route('/posts/{id}/pin', name: 'api.posts.unpin', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function unpinPost(Post $post): JsonResponse
    {
        $user = $this->getUser();
        
        if ($post->getAuthor() !== $user) {
            return $this->json(['error' => 'Vous ne pouvez désépingler que vos propres posts'], 403);
        }

        $post->setIsPinned(false);
        $this->em->flush();

        return $this->json(['pinned' => false], 200);
    }

    /**
     * Retweet a post
     * POST /api/posts/{id}/retweet
     */
    #[Route('/posts/{id}/retweet', name: 'api.posts.retweet', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function retweetPost(Post $post, Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if ($post->getAuthor() === $user) {
            return $this->json(['error' => 'Vous ne pouvez pas retweeter vos propres posts'], 400);
        }

        // Check if already retweeted
        $existingRetweet = $this->postRepository->findOneBy(['author' => $user, 'retweetOf' => $post]);
        if ($existingRetweet) {
            return $this->json(['error' => 'Vous avez déjà retweeté ce post'], 409);
        }

        // Optional: get comment from request
        $data = json_decode($request->getContent(), true);
        $comment = isset($data['comment']) ? trim((string) $data['comment']) : null;

        // Create retweet post
        $retweet = new Post();
        $retweet->setAuthor($user);
        $retweet->setRetweetOf($post);
        $retweet->setCreatedAt(new \DateTimeImmutable());
        
        if ($comment) {
            $retweet->setContent($comment);
        } else {
            $retweet->setContent('');
        }

        $this->em->persist($retweet);
        $this->em->flush();

        return $this->json($retweet, 201, [], ['groups' => 'default']);
    }

    /**
     * Remove a retweet
     * DELETE /api/posts/{id}/retweet
     */
    #[Route('/posts/{id}/retweet', name: 'api.posts.unretweet', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function unretweetPost(Post $retweet): JsonResponse
    {
        $user = $this->getUser();
        
        if ($retweet->getAuthor() !== $user) {
            return $this->json(['error' => 'Vous ne pouvez supprimer que vos propres retweets'], 403);
        }

        if (!$retweet->getRetweetOf()) {
            return $this->json(['error' => 'Ce post n\'est pas un retweet'], 400);
        }

        $this->em->remove($retweet);
        $this->em->flush();

        return $this->json(null, 204);
    }

    /**
     * Search posts with filters
     * GET /api/posts/search?q=query&type=tweet|user|hashtag&date_from=2020-01-01&date_to=2025-12-31&author_id=1
     */
    #[Route('/search/posts', name: 'api.posts.search', methods: ['GET'])]
    public function searchPosts(Request $request): JsonResponse
    {
        $query = $request->query->get('q', '');
        $type = $request->query->get('type', 'tweet'); // tweet, user, hashtag
        $dateFrom = $request->query->get('date_from');
        $dateTo = $request->query->get('date_to');
        $authorId = $request->query->get('author_id');
        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = min(50, max(1, (int) $request->query->get('per_page', 20)));
        $offset = ($page - 1) * $perPage;

        $qb = $this->postRepository->createQueryBuilder('p')
            ->where('p.censored = false')
            ->orderBy('p.createdAt', 'DESC');

        // Search by content
        if ($query) {
            $qb->andWhere('p.content LIKE :query')
               ->setParameter('query', '%' . $query . '%');
        }

        // Filter by type
        if ($type === 'hashtag' && $query) {
            $qb->andWhere('p.content LIKE :hashtag')
               ->setParameter('hashtag', '%#' . $query . '%');
        } elseif ($type === 'user' && $query) {
            // Search by username in content @mentions
            $qb->andWhere('p.content LIKE :mention')
               ->setParameter('mention', '%@' . $query . '%');
        }

        // Filter by date range
        if ($dateFrom) {
            $qb->andWhere('p.createdAt >= :dateFrom')
               ->setParameter('dateFrom', new \DateTime($dateFrom));
        }
        if ($dateTo) {
            $qb->andWhere('p.createdAt <= :dateTo')
               ->setParameter('dateTo', new \DateTime($dateTo . ' 23:59:59'));
        }

        // Filter by author
        if ($authorId) {
            $qb->andWhere('p.author = :authorId')
               ->setParameter('authorId', (int) $authorId);
        }

        // Get total count
        $total = $qb->select('COUNT(p.id)')->getQuery()->getSingleScalarResult();

        // Get paginated results
        $posts = $qb->select('p')
            ->setFirstResult($offset)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        $postsData = array_map([$this, 'formatPostData'], $posts);

        return $this->json([
            'posts' => $postsData,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_items' => $total,
            ],
        ]);
    }
}
