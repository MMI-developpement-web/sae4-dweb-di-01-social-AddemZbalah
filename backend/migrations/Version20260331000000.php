<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260331000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add is_censored column to reply table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE reply ADD is_censored TINYINT(1) NOT NULL DEFAULT 0');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE reply DROP COLUMN is_censored');
    }
}
