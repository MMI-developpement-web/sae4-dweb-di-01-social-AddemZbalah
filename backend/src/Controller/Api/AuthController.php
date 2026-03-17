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

        if (!$user || !$hasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Identifiants invalides'], 401);
        }

        $token = $tokenManager->generateForUser($user);

        return $this->json(['token' => $token]);
    }
}