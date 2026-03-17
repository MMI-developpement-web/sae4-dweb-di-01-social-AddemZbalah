<?php

namespace App\Service;

use App\Entity\Token;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class TokenManager
{
    public function __construct(private EntityManagerInterface $em) {}

    public function generateForUser(User $user): string
    {
        $tokenValue = bin2hex(random_bytes(32)); // Token sécurisé de 64 caractères
        
        $token = new Token();
        $token->setValue($tokenValue);
        $token->setUserId($user);
        $token->setCreatedAt(new \DateTime());
        $token->setExpiresAt(new \DateTime('+30 days'));

        $this->em->persist($token);
        $this->em->flush();

        return $tokenValue;
    }
}