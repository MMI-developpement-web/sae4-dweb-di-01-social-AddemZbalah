<?php

namespace App\Controller\Api;

use App\Dto\Payload\RegisterPayload;
use App\Service\TokenManager;
use App\Service\UserRegistrationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RegisterController extends AbstractController
{
    public function __construct(
        private UserRegistrationService $registrationService,
        private ValidatorInterface $validator,
        private TokenManager $tokenManager
    ) {}

    #[Route('/api/register', name: 'api.register', methods: ['POST'], format: 'json')]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent() ?: '{}', true);

        $payload = new RegisterPayload();
        $payload->email = $data['email'] ?? '';
        $payload->username = $data['username'] ?? '';
        $payload->password = $data['password'] ?? '';

        $errors = $this->validator->validate($payload);
        if (count($errors) > 0) {
            $err = [];
            foreach ($errors as $e) {
                $err[$e->getPropertyPath()] = $e->getMessage();
            }
            return $this->json(['errors' => $err], 400);
        }

        try {
            $user = $this->registrationService->register($payload);
        } catch (\RuntimeException $e) {
            return $this->json(['errors' => ['general' => $e->getMessage()]], 400);
        }

        // Generate confirmation token but do not send email for now — return it in response
        $rawToken = $this->tokenManager->generateForUser($user);

        return $this->json([
            'message' => 'Utilisateur créé. Confirmez l\'email.',
            'confirmation_token' => $rawToken,
        ], 201);
    }
}