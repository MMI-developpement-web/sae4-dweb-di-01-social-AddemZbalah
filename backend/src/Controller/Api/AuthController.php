<?php

namespace App\Controller\Api;

use App\Repository\UserRepository;
use App\Service\TokenManager;
use App\Repository\FollowRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request, 
        UserRepository $userRepository, 
        UserPasswordHasherInterface $hasher,
        TokenManager $tokenManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? $data['mail'] ?? '';
        $user = $userRepository->findOneBy(['mail' => $email]);
        
        if (!$user) {
            $user = $userRepository->findOneBy(['name' => $email]);
        }

        if (!$user || !$hasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Identifiants invalides'], 401);
        }

        // Check if user is blocked
        if ($user->getIsBlocked()) {
            return $this->json(['error' => 'Ce compte a été bloqué'], 403);
        }

        $token = $tokenManager->generateForUser($user);

        return $this->json(['token' => $token]);
    }

    #[Route('/api/user', name: 'api_user', methods: ['GET'])]
    public function user(Request $request, \App\Repository\TokenRepository $tokenRepository, FollowRepository $followRepository): JsonResponse
    {
        $authorizationHeader = $request->headers->get('Authorization');
        if (!$authorizationHeader || !preg_match('/Bearer\s+(.*)$/i', $authorizationHeader, $matches)) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $tokenValue = $matches[1];
        $token = $tokenRepository->findOneBy(['value' => $tokenValue]);

        if (!$token || $token->getExpiresAt() < new \DateTime()) {
            return $this->json(['error' => 'Token invalide ou expiré'], 401);
        }

        $user = $token->getUserId();

        return $this->json([
            'id' => $user->getId(),
            'name' => $user->getName(),
            'mail' => $user->getMail(),
            'bio' => $user->getBio(),
            'profilePhoto' => $user->getProfilePhoto(),
            'bannerImage' => $user->getBannerImage(),
            'location' => $user->getLocation(),
            'website' => $user->getWebsite(),
            'createdAt' => $user->getId() ? date('c', strtotime('2021-01-01')) : null,
            'followersCount' => count($user->getFollowers()),
            'followingCount' => count($user->getFollowing()),
        ]);
    }

    #[Route('/api/users/{id}', name: 'api_user_get', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getUserById(int $id, UserRepository $userRepository, FollowRepository $followRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        return $this->json([
            'id' => $user->getId(),
            'name' => $user->getName(),
            'mail' => $user->getMail(),
            'bio' => $user->getBio(),
            'profilePhoto' => $user->getProfilePhoto(),
            'bannerImage' => $user->getBannerImage(),
            'location' => $user->getLocation(),
            'website' => $user->getWebsite(),
            'createdAt' => $user->getId() ? date('c', strtotime('2021-01-01')) : null,
            'followersCount' => count($user->getFollowers()),
            'followingCount' => count($user->getFollowing()),
        ]);
    }

    #[Route('/api/user/update', name: 'api_user_update', methods: ['POST'])]
    public function updateUser(
        Request $request,
        \App\Repository\TokenRepository $tokenRepository,
        UserRepository $userRepository,
        \Doctrine\ORM\EntityManagerInterface $entityManager
    ): JsonResponse {
        $authorizationHeader = $request->headers->get('Authorization');
        if (!$authorizationHeader || !preg_match('/Bearer\s+(.*)$/i', $authorizationHeader, $matches)) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $tokenValue = $matches[1];
        $token = $tokenRepository->findOneBy(['value' => $tokenValue]);

        if (!$token || $token->getExpiresAt() < new \DateTime()) {
            return $this->json(['error' => 'Token invalide ou expiré'], 401);
        }

        $user = $token->getUserId();
        $data = json_decode($request->getContent(), true);

        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }
        if (isset($data['profilePhoto'])) {
            $user->setProfilePhoto($data['profilePhoto']);
        }
        if (isset($data['bannerImage'])) {
            $user->setBannerImage($data['bannerImage']);
        }
        if (isset($data['location'])) {
            $user->setLocation($data['location']);
        }
        if (isset($data['website'])) {
            $user->setWebsite($data['website']);
        }

        $entityManager->flush();

        return $this->json([
            'id' => $user->getId(),
            'name' => $user->getName(),
            'mail' => $user->getMail(),
            'bio' => $user->getBio(),
            'profilePhoto' => $user->getProfilePhoto(),
            'bannerImage' => $user->getBannerImage(),
            'location' => $user->getLocation(),
            'website' => $user->getWebsite(),
            'createdAt' => $user->getId() ? date('c', strtotime('2021-01-01')) : null,
            'followersCount' => count($user->getFollowers()),
            'followingCount' => count($user->getFollowing()),
        ]);
    }
}
