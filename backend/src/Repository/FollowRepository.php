<?php

namespace App\Repository;

use App\Entity\Follow;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Follow>
 */
class FollowRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Follow::class);
    }

    /**
     * Check if follower is already following the following user
     */
    public function isFollowing(User $follower, User $following): bool
    {
        return null !== $this->findOneBy(['follower' => $follower, 'following' => $following]);
    }

    /**
     * Get a follow relationship
     */
    public function getFollow(User $follower, User $following): ?Follow
    {
        return $this->findOneBy(['follower' => $follower, 'following' => $following]);
    }

    /**
     * Get all users that a user is following
     * @return Follow[]
     */
    public function findFollowingByUser(User $user)
    {
        return $this->findBy(['follower' => $user]);
    }

    /**
     * Get all followers of a user
     * @return Follow[]
     */
    public function findFollowersByUser(User $user)
    {
        return $this->findBy(['following' => $user]);
    }
}
