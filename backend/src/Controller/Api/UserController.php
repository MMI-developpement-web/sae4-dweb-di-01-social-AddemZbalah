<?php

namespace App\Controller\Api;

use App\Entity\Follow;
use App\Entity\User;
use App\Repository\FollowRepository;
use App\Repository\UserRepository;
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
    ) {
    }

    #[Route('/{id}/follow', name: 'follow', methods: ['POST'])]
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

    #[Route('/{id}/unfollow', name: 'unfollow', methods: ['DELETE'])]
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

    #[Route('/{id}/is-following', name: 'is_following', methods: ['GET'])]
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

    #[Route('/{id}/followers', name: 'followers', methods: ['GET'])]
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

    #[Route('/{id}/following', name: 'following', methods: ['GET'])]
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
}
