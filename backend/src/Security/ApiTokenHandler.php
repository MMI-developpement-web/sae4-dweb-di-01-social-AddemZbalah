<?php

namespace App\Security;

use App\Repository\TokenRepository;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

class ApiTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(private TokenRepository $tokenRepository) {}

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        $token = $this->tokenRepository->findOneBy(['value' => $accessToken]);

        if (null === $token || $token->getExpiresAt() < new \DateTime()) {
            throw new BadCredentialsException('Token invalide ou expiré');
        }

        // Renvoie l'identifiant de l'utilisateur (mail) à Symfony
        return new UserBadge($token->getUserId()->getMail()); 
    }
}