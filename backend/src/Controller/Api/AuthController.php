<?php

namespace App\Controller\Api;

use App\Repository\UserRepository;
use App\Service\TokenManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

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
        if (!$user) $user = $userRepository->findOneBy(['name' => $email]); if (!$user) { $user = $userRepository->findOneBy(['name' => $email]); }

        if (!$user || !$hasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Identifiants invalides'], 401);
        }

        $token = $tokenManager->generateForUser($user);

        return $this->json(['token' => $token]);
    }

    #[Route('/api/user', name: 'api_user', methods: ['GET'])]
    public function user(Request $request, \App\Repository\TokenRepository $tokenRepository): JsonResponse
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
        ]);
    }
}
use Doctrine\ORM\EntityManagerInterface;
