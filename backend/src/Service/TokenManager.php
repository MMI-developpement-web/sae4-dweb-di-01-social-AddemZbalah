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
        // Supprimer directement les anciens tokens via SQL pour éviter les conflits
        // La colonne dans la BDD s'appelle user_id_id car la propriété dans l'entité Token est $user_id
        $connection = $this->em->getConnection();
        $connection->executeStatement(
            'DELETE FROM token WHERE user_id_id = ?',
            [$user->getId()]
        );

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