import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a test game case
  const gameCase = await prisma.gameCase.create({
    data: {
      title: 'The Vanishing Diamond',
      description: 'A priceless diamond has disappeared from the mansion\'s vault. Suspicion falls on the guests during a high-society party.',
      difficulty: 'medium',
      points: 150,
      timeLimit: 45,
      locations: {
        create: [
          {
            name: 'Grand Ballroom',
            description: 'The main party area with crystal chandeliers and marble floors.',
            image: '/locations/ballroom.jpg',
          },
          {
            name: 'Library',
            description: 'A quiet room filled with antique books and leather chairs.',
            image: '/locations/library.jpg',
          },
          {
            name: 'Vault',
            description: 'A secure room with steel walls and combination locks.',
            image: '/locations/vault.jpg',
          },
          {
            name: 'Conservatory',
            description: 'A glass-enclosed room with exotic plants and a fountain.',
            image: '/locations/conservatory.jpg',
          },
        ],
      },
      suspects: {
        create: [
          {
            name: 'Lady Penelope',
            description: 'The wealthy hostess known for her extravagant parties.',
            motive: 'Financial troubles from gambling debts.',
            alibi: 'Claims to have been in the conservatory admiring orchids.',
            image: '/suspects/lady-penelope.jpg',
          },
          {
            name: 'Professor Archibald',
            description: 'A renowned historian and gem expert.',
            motive: 'Wanted the diamond for his private collection.',
            alibi: 'Was giving a lecture in the library about gemology.',
            image: '/suspects/professor-archibald.jpg',
          },
          {
            name: 'Butler Jenkins',
            description: 'The loyal butler with access to all rooms.',
            motive: 'Seeking revenge for being underpaid for years.',
            alibi: 'Serving drinks in the ballroom all evening.',
            image: '/suspects/butler-jenkins.jpg',
          },
          {
            name: 'Madame Zora',
            description: 'A mysterious fortune teller invited for entertainment.',
            motive: 'Believes the diamond has mystical powers.',
            alibi: 'Reading tarot cards in a secluded corner.',
            image: '/suspects/madame-zora.jpg',
          },
        ],
      },
    },
  });

  // Create clues for each location
  const locations = await prisma.location.findMany({
    where: { gameCaseId: gameCase.id },
  });

  const ballroom = locations.find(l => l.name === 'Grand Ballroom');
  const library = locations.find(l => l.name === 'Library');
  const vault = locations.find(l => l.name === 'Vault');
  const conservatory = locations.find(l => l.name === 'Conservatory');

  await prisma.clue.createMany({
    data: [
      {
        title: 'Broken Glass',
        description: 'A shattered glass found near the vault door with traces of lipstick.',
        type: 'evidence',
        locationId: vault?.id,
        gameCaseId: gameCase.id,
        order: 1,
      },
      {
        title: 'Gambling IOU',
        description: 'A handwritten IOU for a large sum found in Lady Penelope\'s purse.',
        type: 'motive',
        locationId: ballroom?.id,
        gameCaseId: gameCase.id,
        order: 2,
      },
      {
        title: 'Gemology Book',
        description: 'A book about diamond cutting open on Professor Archibald\'s desk.',
        type: 'evidence',
        locationId: library?.id,
        gameCaseId: gameCase.id,
        order: 3,
      },
      {
        title: 'Pay Stub',
        description: 'Butler Jenkins\' recent pay stub showing significantly reduced wages.',
        type: 'motive',
        locationId: ballroom?.id,
        gameCaseId: gameCase.id,
        order: 4,
      },
      {
        title: 'Tarot Card',
        description: 'The \'Tower\' card found in Madame Zora\'s room, predicting theft.',
        type: 'evidence',
        locationId: conservatory?.id,
        gameCaseId: gameCase.id,
        order: 5,
      },
      {
        title: 'Conservatory Key',
        description: 'A duplicate key to the conservatory found in Butler Jenkins\' pocket.',
        type: 'alibi',
        locationId: conservatory?.id,
        gameCaseId: gameCase.id,
        order: 6,
      },
    ],
  });

  // Create the correct solution
  const butler = await prisma.suspect.findFirst({
    where: { gameCaseId: gameCase.id, name: 'Butler Jenkins' },
  });

  if (butler) {
    await prisma.solution.create({
      data: {
        suspectId: butler.id,
        method: 'Used his master key to access the vault during the party distraction.',
        motive: 'Revenge for years of unfair wages, planned to sell the diamond and retire.',
        gameCaseId: gameCase.id,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
