import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface StyleGuideExample {
  question: string;
  answer: string;
}

interface StyleGuideData {
  name: string;
  description: string;
  characteristics: string[];
  tone: string[];
  examples: StyleGuideExample[];
  language: string;
  isDefault: boolean;
}

interface StyleGuidesJSON {
  styleGuides: StyleGuideData[];
}

async function main() {
  console.log('🌱 Starting style guides seeding...');

  // Read the JSON data file
  const dataPath = path.join(process.cwd(), 'data', 'style-guide.json');
  const jsonData = fs.readFileSync(dataPath, 'utf-8');
  const data: StyleGuidesJSON = JSON.parse(jsonData);

  console.log(`📖 Found ${data.styleGuides.length} style guides to seed`);

  // Clear existing data (optional - remove if you want to keep existing data)
  console.log('🗑️  Clearing existing style guide examples...');
  await prisma.styleGuideExample.deleteMany({});
  
  console.log('🗑️  Clearing existing style guides...');
  await prisma.styleGuide.deleteMany({});

  // Insert style guides with examples
  for (const styleGuide of data.styleGuides) {
    console.log(`\n✨ Creating style guide: ${styleGuide.name}`);
    
    const created = await prisma.styleGuide.create({
      data: {
        name: styleGuide.name,
        description: styleGuide.description,
        characteristics: styleGuide.characteristics,
        tone: styleGuide.tone,
        language: styleGuide.language,
        isDefault: styleGuide.isDefault,
        examples: {
          create: styleGuide.examples.map(example => ({
            question: example.question,
            answer: example.answer,
          })),
        },
      },
      include: {
        examples: true,
      },
    });

    console.log(`   ✅ Created style guide with ID: ${created.id}`);
    console.log(`   ✅ Created ${created.examples.length} examples`);
  }

  console.log('\n🎉 Seeding completed successfully!');

  // Verify the data
  const count = await prisma.styleGuide.count();
  const examplesCount = await prisma.styleGuideExample.count();
  console.log(`\n📊 Total style guides in database: ${count}`);
  console.log(`📊 Total examples in database: ${examplesCount}`);

  // Show the default style guide
  const defaultStyleGuide = await prisma.styleGuide.findFirst({
    where: { isDefault: true },
    include: { examples: true },
  });

  if (defaultStyleGuide) {
    console.log(`\n🎯 Default style guide: ${defaultStyleGuide.name}`);
    console.log(`   Characteristics: ${defaultStyleGuide.characteristics.length}`);
    console.log(`   Tone elements: ${defaultStyleGuide.tone.length}`);
    console.log(`   Examples: ${defaultStyleGuide.examples.length}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
