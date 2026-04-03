<?php

namespace App\Repository;

use App\Entity\Post;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Post>
 */
class PostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Post::class);
    }

    /**
     * @return Post[] Returns an array of Post objects
     */
    public function findLatest(int $limit, int $offset, ?int $authorId = null): array
    {
        $qb = $this->createQueryBuilder('p')
            ->orderBy('p.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        if ($authorId !== null) {
            $qb->andWhere('p.author = :authorId')
               ->setParameter('authorId', $authorId);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Find posts from followed users
     * @param User[] $followingUsers Array of users to get posts from
     */
    public function findFeed(array $followingUsers, int $limit, int $offset): array
    {
        if (empty($followingUsers)) {
            return [];
        }

        return $this->createQueryBuilder('p')
            ->andWhere('p.author IN (:authors)')
            ->setParameter('authors', $followingUsers)
            ->orderBy('p.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getResult();
    }

    /**
     * Count posts from followed users
     * @param User[] $followingUsers Array of users to get posts from
     */
    public function countFeed(array $followingUsers): int
    {
        if (empty($followingUsers)) {
            return 0;
        }

        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->andWhere('p.author IN (:authors)')
            ->setParameter('authors', $followingUsers)
            ->getQuery()
            ->getSingleScalarResult();
    }
}

//    /**
//     * @return Post[] Returns an array of Post objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('p.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Post
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }

