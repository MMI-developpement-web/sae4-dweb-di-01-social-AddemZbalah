<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260325143424 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE follow DROP FOREIGN KEY `FK_683444703CF8336F`');
        $this->addSql('ALTER TABLE follow DROP FOREIGN KEY `FK_68344470E8DDDA11`');
        $this->addSql('DROP INDEX IDX_68344470E8DDDA11 ON follow');
        $this->addSql('DROP INDEX IDX_683444703CF8336F ON follow');
        $this->addSql('ALTER TABLE follow ADD follower_id INT NOT NULL, ADD following_id INT NOT NULL, DROP follower_id_id, DROP following_id_id');
        $this->addSql('ALTER TABLE follow ADD CONSTRAINT FK_68344470AC24F853 FOREIGN KEY (follower_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE follow ADD CONSTRAINT FK_683444701816E3A3 FOREIGN KEY (following_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_68344470AC24F853 ON follow (follower_id)');
        $this->addSql('CREATE INDEX IDX_683444701816E3A3 ON follow (following_id)');
        $this->addSql('ALTER TABLE `like` CHANGE created_at created_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE `like` RENAME INDEX idx_ac6340eta76f1f1a TO IDX_AC6340B3A76ED395');
        $this->addSql('ALTER TABLE `like` RENAME INDEX idx_ac6340eta4b30d9 TO IDX_AC6340B34B89032C');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE follow DROP FOREIGN KEY FK_68344470AC24F853');
        $this->addSql('ALTER TABLE follow DROP FOREIGN KEY FK_683444701816E3A3');
        $this->addSql('DROP INDEX IDX_68344470AC24F853 ON follow');
        $this->addSql('DROP INDEX IDX_683444701816E3A3 ON follow');
        $this->addSql('ALTER TABLE follow ADD follower_id_id INT DEFAULT NULL, ADD following_id_id INT DEFAULT NULL, DROP follower_id, DROP following_id');
        $this->addSql('ALTER TABLE follow ADD CONSTRAINT `FK_683444703CF8336F` FOREIGN KEY (following_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE follow ADD CONSTRAINT `FK_68344470E8DDDA11` FOREIGN KEY (follower_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_68344470E8DDDA11 ON follow (follower_id_id)');
        $this->addSql('CREATE INDEX IDX_683444703CF8336F ON follow (following_id_id)');
        $this->addSql('ALTER TABLE `like` CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE `like` RENAME INDEX idx_ac6340b3a76ed395 TO IDX_AC6340ETA76F1F1A');
        $this->addSql('ALTER TABLE `like` RENAME INDEX idx_ac6340b34b89032c TO IDX_AC6340ETA4B30D9');
    }
}
