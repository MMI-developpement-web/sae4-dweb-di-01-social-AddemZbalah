<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Restructure Like entity from ManyToMany to ManyToOne
 */
final class Version20260325143000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Restructure Like entity from ManyToMany to ManyToOne relations';
    }

    public function up(Schema $schema): void
    {
        // Drop old many-to-many junction tables
        $this->addSql('DROP TABLE IF EXISTS like_post');
        $this->addSql('DROP TABLE IF EXISTS like_user');

        // Recreate like table with proper foreign keys
        $this->addSql('DROP TABLE IF EXISTS `like`');
        $this->addSql('CREATE TABLE `like` (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            post_id INT NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            UNIQUE KEY unique_user_post_like (user_id, post_id),
            INDEX IDX_AC6340ETA76F1F1A (user_id),
            INDEX IDX_AC6340ETA4B30D9 (post_id),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // Add foreign keys
        $this->addSql('ALTER TABLE `like` ADD CONSTRAINT FK_AC6340ETA76F1F1A FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE `like` ADD CONSTRAINT FK_AC6340ETA4B30D9 FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // Drop the new table
        $this->addSql('ALTER TABLE `like` DROP FOREIGN KEY FK_AC6340ETA76F1F1A');
        $this->addSql('ALTER TABLE `like` DROP FOREIGN KEY FK_AC6340ETA4B30D9');
        $this->addSql('DROP TABLE `like`');

        // Recreate old many-to-many tables (simplified, without historical data)
        $this->addSql('CREATE TABLE like_post (like_id INT NOT NULL, post_id INT NOT NULL, PRIMARY KEY(like_id, post_id), INDEX IDX_42D0956EEF69BF2 (like_id), INDEX IDX_42D0956E4B30D9 (post_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE like_user (like_id INT NOT NULL, user_id INT NOT NULL, PRIMARY KEY(like_id, user_id), INDEX IDX_FED7264BEF69BF2 (like_id), INDEX IDX_FED7264BA76F1F1A (user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
    }
}
