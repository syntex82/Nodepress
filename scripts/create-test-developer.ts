/**
 * Create Test Developer Profile
 * Creates Michael Blenkinsop as a Senior Fullstack Developer
 */

import { PrismaClient, DeveloperCategory, DeveloperStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creating test developer profile...\n');

  // Find the admin user (Michael Blenkinsop)
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: 'micky', mode: 'insensitive' } },
        { email: { contains: 'michael', mode: 'insensitive' } },
        { name: { contains: 'Michael', mode: 'insensitive' } },
        { role: 'ADMIN' },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!user) {
    console.log('❌ No suitable user found. Please create a user first.');
    return;
  }

  console.log(`Found user: ${user.name} (${user.email})`);

  // Check if developer profile already exists
  const existing = await prisma.developer.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    console.log('⚠️  Developer profile already exists. Updating...');
    
    const updated = await prisma.developer.update({
      where: { userId: user.id },
      data: {
        displayName: 'Michael Blenkinsop',
        headline: 'Senior Fullstack Developer | React, Node.js, TypeScript Expert',
        bio: `I'm a passionate Senior Fullstack Developer with 10+ years of experience building scalable web applications. I specialize in React, Node.js, TypeScript, and modern cloud architectures.

I've led teams, architected systems serving millions of users, and mentored junior developers. I'm available for contract work, consulting, and full-time opportunities.

Let's build something amazing together!`,
        category: DeveloperCategory.FULLSTACK,
        skills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'GraphQL', 'REST APIs', 'Next.js', 'NestJS', 'Prisma'],
        languages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML', 'CSS'],
        frameworks: ['React', 'Next.js', 'NestJS', 'Express', 'Tailwind CSS', 'Prisma'],
        hourlyRate: 150,
        minimumBudget: 5000,
        yearsOfExperience: 10,
        availability: 'available',
        availableHours: 40,
        timezone: 'UTC',
        status: DeveloperStatus.ACTIVE,
        isVerified: true,
        isFeatured: true,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log(`✅ Developer profile updated: ${updated.displayName}`);
  } else {
    // Create new developer profile
    const developer = await prisma.developer.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        displayName: 'Michael Blenkinsop',
        slug: 'michael-blenkinsop',
        headline: 'Senior Fullstack Developer | React, Node.js, TypeScript Expert',
        bio: `I'm a passionate Senior Fullstack Developer with 10+ years of experience building scalable web applications. I specialize in React, Node.js, TypeScript, and modern cloud architectures.

I've led teams, architected systems serving millions of users, and mentored junior developers. I'm available for contract work, consulting, and full-time opportunities.

Let's build something amazing together!`,
        category: DeveloperCategory.FULLSTACK,
        skills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'GraphQL', 'REST APIs', 'Next.js', 'NestJS', 'Prisma'],
        languages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML', 'CSS'],
        frameworks: ['React', 'Next.js', 'NestJS', 'Express', 'Tailwind CSS', 'Prisma'],
        hourlyRate: 150,
        minimumBudget: 5000,
        yearsOfExperience: 10,
        availability: 'available',
        availableHours: 40,
        timezone: 'UTC',
        status: DeveloperStatus.ACTIVE,
        isVerified: true,
        isFeatured: true,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Developer profile created: ${developer.displayName}`);
    console.log(`   Slug: ${developer.slug}`);
    console.log(`   Rate: $${developer.hourlyRate}/hr`);
  }

  console.log('\n🎉 Done!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

