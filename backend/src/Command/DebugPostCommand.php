<?php
namespace App\Command;

use App\Repository\PostRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Serializer\SerializerInterface;

#[AsCommand(name: 'debug:posts')]
class DebugPostCommand extends Command
{
    public function __construct(
        private PostRepository $postRepository,
        private SerializerInterface $serializer
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $posts = $this->postRepository->findBy([], ['id' => 'DESC'], 1);
        $json = $this->serializer->serialize($posts, 'json', ['groups' => 'default']);
        $output->writeln($json);
        return Command::SUCCESS;
    }
}
