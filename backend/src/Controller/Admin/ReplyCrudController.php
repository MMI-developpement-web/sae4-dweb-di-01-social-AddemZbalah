<?php

namespace App\Controller\Admin;

use App\Entity\Reply;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;

class ReplyCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Reply::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            TextEditorField::new('textContent', 'Contenu'),
            DateTimeField::new('createdAt', 'Créé le')->hideOnIndex()->hideOnDetail()->hideOnForm(),
            AssociationField::new('author', 'Auteur'),
            AssociationField::new('commentOf', 'En réponse à')->hideOnForm(),
            BooleanField::new('censored', 'Réponse censurée'),
        ];
    }
}
