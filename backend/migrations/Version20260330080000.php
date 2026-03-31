<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add replies collection to User entity
 */
final class Version20260330080000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add replies relationship to User entity';
    }

    public function up(Schema $schema): void
    {
        // The foreign key for author_id should already exist in the reply table
        // This migration is mainly for documentation purposes
        // If the column doesn't exist, uncomment the line below:
        // $this->addSql('ALTER TABLE reply ADD author_id INT NOT NULL');
        // $this->addSql('ALTER TABLE reply ADD CONSTRAINT FK_FDA8C6E7F675F31B FOREIGN KEY (author_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // Reverse operations if needed
    }
}
