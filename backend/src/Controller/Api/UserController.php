<?php

namespace App\Controller\Api;

use App\Entity\Follow;
use App\Entity\User;
use App\Repository\FollowRepository;
use App\Repository\UserRepository;
use App\Service\FileUploader;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/users', name: 'api_users_')]
class UserController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private FollowRepository $followRepository,
        private EntityManagerInterface $em,
        private FileUploader $fileUploader,
    ) {
    }

    #[Route('/{id}/follow', name: 'follow', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_USER')]
    public function follow(int $id): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        if ($currentUser === $user) {
            return $this->json(['error' => 'Cannot follow yourself'], Response::HTTP_BAD_REQUEST);
        }

        // Check if current user is blocking this user
        if ($currentUser->isBlockingUser($user)) {
            return $this->json(['error' => 'You have blocked this user'], Response::HTTP_FORBIDDEN);
        }

        // Check if already following
        if ($this->followRepository->isFollowing($currentUser, $user)) {
            return $this->json(['error' => 'Already following this user'], Response::HTTP_BAD_REQUEST);
        }

        $follow = new Follow();
        $follow->setFollower($currentUser);
        $follow->setFollowing($user);
        $follow->setCreatedAt(new \DateTime());

        $this->em->persist($follow);
        $this->em->flush();

        return $this->json(['success' => true, 'message' => 'Following user'], Response::HTTP_CREATED);
    }

    #[Route('/{id}/unfollow', name: 'unfollow', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_USER')]
    public function unfollow(int $id): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $follow = $this->followRepository->getFollow($currentUser, $user);

        if (!$follow) {
            return $this->json(['error' => 'Not following this user'], Response::HTTP_BAD_REQUEST);
        }

        $this->em->remove($follow);
        $this->em->flush();

        return $this->json(['success' => true, 'message' => 'Unfollowed user']);
    }

    #[Route('/{id}/is-following', name: 'is_following', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_USER')]
    public function isFollowing(int $id): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $isFollowing = $this->followRepository->isFollowing($currentUser, $user);

        return $this->json(['isFollowing' => $isFollowing]);
    }

    #[Route('/{id}/followers', name: 'followers', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getFollowers(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $followers = $this->followRepository->findFollowersByUser($user);
        
        $data = array_map(function (Follow $follow) {
            return [
                'id' => $follow->getFollower()->getId(),
                'name' => $follow->getFollower()->getName(),
                'mail' => $follow->getFollower()->getMail(),
                'followedAt' => $follow->getCreatedAt()->format('c'),
            ];
        }, $followers);

        return $this->json($data);
    }

    #[Route('/{id}/following', name: 'following', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getFollowing(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $following = $this->followRepository->findFollowingByUser($user);
        
        $data = array_map(function (Follow $follow) {
            return [
                'id' => $follow->getFollowing()->getId(),
                'name' => $follow->getFollowing()->getName(),
                'mail' => $follow->getFollowing()->getMail(),
                'followedAt' => $follow->getCreatedAt()->format('c'),
            ];
        }, $following);

        return $this->json($data);
    }

    /**
     * Update current user profile
     * PUT /api/users/profile
     */
    #[Route('/profile', name: 'update_profile', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updateProfile(Request $request): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        try {
            if (isset($data['bio'])) {
                $currentUser->setBio(trim((string) $data['bio']) ?: null);
            }

            if (isset($data['profilePhoto'])) {
                $profilePhoto = $this->fileUploader->process($data['profilePhoto'], 'profilePhoto');
                $currentUser->setProfilePhoto($profilePhoto);
            }

            if (isset($data['bannerImage'])) {
                $bannerImage = $this->fileUploader->process($data['bannerImage'], 'bannerImage');
                $currentUser->setBannerImage($bannerImage);
            }

            if (isset($data['website'])) {
                $currentUser->setWebsite(trim((string) $data['website']) ?: null);
            }

            if (isset($data['location'])) {
                $currentUser->setLocation(trim((string) $data['location']) ?: null);
            }

            $this->em->flush();

            return $this->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'user' => [
                    'id' => $currentUser->getId(),
                    'name' => $currentUser->getName(),
                    'mail' => $currentUser->getMail(),
                    'bio' => $currentUser->getBio(),
                    'profilePhoto' => $currentUser->getProfilePhoto(),
                    'bannerImage' => $currentUser->getBannerImage(),
                    'website' => $currentUser->getWebsite(),
                    'location' => $currentUser->getLocation(),
                ]
            ], 200);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            error_log("Erreur updateProfile: " . $e->getMessage());
            return $this->json(['error' => 'Erreur lors de la mise à jour'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Block a user
     * POST /api/users/{id}/block
     */
    #[Route('/{id}/block', name: 'block_user', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_USER')]
    public function blockUser(int $id): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $userToBlock = $this->userRepository->find($id);
        if (!$userToBlock) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        if ($currentUser === $userToBlock) {
            return $this->json(['error' => 'Cannot block yourself'], Response::HTTP_BAD_REQUEST);
        }

        if ($currentUser->isBlockingUser($userToBlock)) {
            return $this->json(['error' => 'User already blocked'], Response::HTTP_BAD_REQUEST);
        }

        $currentUser->addBlockedUser($userToBlock);

        // Unfollow the blocked user if following
        $follow = $this->followRepository->getFollow($currentUser, $userToBlock);
        if ($follow) {
            $this->em->remove($follow);
        }

        // Also unfollow if the blocked user was following current user
        $reverseFollow = $this->followRepository->getFollow($userToBlock, $currentUser);
        if ($reverseFollow) {
            $this->em->remove($reverseFollow);
        }

        $this->em->flush();

        return $this->json(['success' => true, 'message' => 'User blocked'], Response::HTTP_CREATED);
    }

    /**
     * Unblock a user
     * DELETE /api/users/{id}/block
     */
    #[Route('/{id}/block', name: 'unblock_user', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_USER')]
    public function unblockUser(int $id): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $userToUnblock = $this->userRepository->find($id);
        if (!$userToUnblock) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$currentUser->isBlockingUser($userToUnblock)) {
            return $this->json(['error' => 'User not blocked'], Response::HTTP_BAD_REQUEST);
        }

        $currentUser->removeBlockedUser($userToUnblock);
        $this->em->flush();

        return $this->json(['success' => true, 'message' => 'User unblocked']);
    }

    /**
     * Get list of blocked users
     * GET /api/users/blocked-users
     */
    #[Route('/blocked-users', name: 'get_blocked_users', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getBlockedUsers(): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $blockedUsers = $currentUser->getBlockedUsers();
        
        $data = [];
        foreach ($blockedUsers as $user) {
            $data[] = [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'mail' => $user->getMail(),
            ];
        }

        return $this->json($data);
    }

    /**
     * Check if user is blocking another user
     * GET /api/users/{id}/is-blocking
     */
    #[Route('/{id}/is-blocking', name: 'is_blocking', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_USER')]
    public function isBlocking(int $id): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $isBlocking = $currentUser->isBlockingUser($user);

        return $this->json(['isBlocking' => $isBlocking]);
    }
}
