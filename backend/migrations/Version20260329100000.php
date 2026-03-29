<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add isReadOnly, isPrivate to User, isPinned and retweetOf to Post
 */
final class Version20260329100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add isReadOnly, isPrivate to User, isPinned and retweetOf to Post';
    }

    public function up(Schema $schema): void
    {
        // Add fields to user table
        $this->addSql('ALTER TABLE `user` ADD is_read_only TINYINT DEFAULT 0 NOT NULL, ADD is_private TINYINT DEFAULT 0 NOT NULL');
        
        // Add fields to post table and foreign key for retweet
        $this->addSql('ALTER TABLE post ADD is_pinned TINYINT DEFAULT 0 NOT NULL, ADD retweet_of_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D42E46919 FOREIGN KEY (retweet_of_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_5A8A6C8D42E46919 ON post (retweet_of_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D42E46919');
        $this->addSql('DROP INDEX IDX_5A8A6C8D42E46919 ON post');
        $this->addSql('ALTER TABLE post DROP is_pinned, DROP retweet_of_id');
        $this->addSql('ALTER TABLE `user` DROP is_read_only, DROP is_private');
    }
}
