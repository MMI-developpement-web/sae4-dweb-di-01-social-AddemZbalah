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
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                return $this->json(['error' => 'JSON invalide'], 400);
            }
            
            if (!isset($data['email'])) {
                return $this->json(['error' => 'Email requis'], 400);
            }
            
            if (!isset($data['password'])) {
                return $this->json(['error' => 'Mot de passe requis'], 400);
            }

            $email = trim($data['email']);
            $password = $data['password'];

            if (empty($email) || empty($password)) {
                return $this->json(['error' => 'Email et mot de passe requis'], 400);
            }

            // Chercher l'utilisateur par email
            $user = $userRepository->findOneBy(['mail' => $email]);
            
            // Si pas trouvé, chercher par nom d'utilisateur
            if (!$user) {
                $user = $userRepository->findOneBy(['name' => $email]);
            }

            // Vérifier l'utilisateur
            if (!$user) {
                return $this->json(['error' => 'Utilisateur non trouvé'], 401);
            }

            // Vérifier le mot de passe
            if (!$hasher->isPasswordValid($user, $password)) {
                return $this->json(['error' => 'Mot de passe incorrect'], 401);
            }

            // Vérifier si l'utilisateur est bloqué
            if ($user->getIsBlocked()) {
                return $this->json(['error' => 'Ce compte a été bloqué'], 403);
            }

            // Générer le token
            $token = $tokenManager->generateForUser($user);
            
            if (!$token) {
                return $this->json(['error' => 'Erreur lors de la génération du token'], 500);
            }

            return $this->json(['token' => $token, 'success' => true], 200);
        } catch (\Throwable $e) {
            error_log("Login error: " . get_class($e) . " - " . $e->getMessage() . " - " . $e->getFile() . ":" . $e->getLine());
            return $this->json(['error' => 'Erreur serveur - ' . $e->getMessage()], 500);
        }
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
