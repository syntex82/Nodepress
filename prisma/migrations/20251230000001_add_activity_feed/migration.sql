-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('POST_PUBLISHED', 'POST_LIKED', 'POST_COMMENTED', 'COURSE_ENROLLED', 'COURSE_COMPLETED', 'CERTIFICATE_EARNED', 'BADGE_EARNED', 'PROFILE_UPDATED', 'NEW_FOLLOWER', 'STARTED_FOLLOWING');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "imageUrl" TEXT,
    "metadata" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_targetType_targetId_idx" ON "Activity"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Activity_isPublic_idx" ON "Activity"("isPublic");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

