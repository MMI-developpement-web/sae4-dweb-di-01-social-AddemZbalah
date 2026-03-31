<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260330092322 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE hashtag (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, count INT NOT NULL, UNIQUE INDEX UNIQ_5AB52A615E237E06 (name), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE hashtag_post (hashtag_id INT NOT NULL, post_id INT NOT NULL, INDEX IDX_EFB38414FB34EF56 (hashtag_id), INDEX IDX_EFB384144B89032C (post_id), PRIMARY KEY (hashtag_id, post_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE mention (id INT AUTO_INCREMENT NOT NULL, post_id INT NOT NULL, mentioned_user_id INT NOT NULL, INDEX IDX_E20259CD4B89032C (post_id), INDEX IDX_E20259CDE6655814 (mentioned_user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE post_hashtag (post_id INT NOT NULL, hashtag_id INT NOT NULL, INDEX IDX_675D9D524B89032C (post_id), INDEX IDX_675D9D52FB34EF56 (hashtag_id), PRIMARY KEY (post_id, hashtag_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE hashtag_post ADD CONSTRAINT FK_EFB38414FB34EF56 FOREIGN KEY (hashtag_id) REFERENCES hashtag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE hashtag_post ADD CONSTRAINT FK_EFB384144B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE mention ADD CONSTRAINT FK_E20259CD4B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE mention ADD CONSTRAINT FK_E20259CDE6655814 FOREIGN KEY (mentioned_user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE post_hashtag ADD CONSTRAINT FK_675D9D524B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_hashtag ADD CONSTRAINT FK_675D9D52FB34EF56 FOREIGN KEY (hashtag_id) REFERENCES hashtag (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE hashtag_post DROP FOREIGN KEY FK_EFB38414FB34EF56');
        $this->addSql('ALTER TABLE hashtag_post DROP FOREIGN KEY FK_EFB384144B89032C');
        $this->addSql('ALTER TABLE mention DROP FOREIGN KEY FK_E20259CD4B89032C');
        $this->addSql('ALTER TABLE mention DROP FOREIGN KEY FK_E20259CDE6655814');
        $this->addSql('ALTER TABLE post_hashtag DROP FOREIGN KEY FK_675D9D524B89032C');
        $this->addSql('ALTER TABLE post_hashtag DROP FOREIGN KEY FK_675D9D52FB34EF56');
        $this->addSql('DROP TABLE hashtag');
        $this->addSql('DROP TABLE hashtag_post');
        $this->addSql('DROP TABLE mention');
        $this->addSql('DROP TABLE post_hashtag');
    }
}
