/**
 * LMS Module - Learning Management System
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { ConfigModule } from '@nestjs/config';

// Services
import { CoursesService } from './services/courses.service';
import { LessonsService } from './services/lessons.service';
import { ModulesService } from './services/modules.service';
import { QuizzesService } from './services/quizzes.service';
import { EnrollmentsService } from './services/enrollments.service';
import { ProgressService } from './services/progress.service';
import { CertificatesService } from './services/certificates.service';
import { CertificateGeneratorService } from './services/certificate-generator.service';
import { CoursePlaceholderService } from './services/course-placeholder.service';

// Controllers
import { CoursesController, PublicCoursesController } from './controllers/courses.controller';
import { LessonsController } from './controllers/lessons.controller';
import { ModulesController } from './controllers/modules.controller';
import { QuizzesController } from './controllers/quizzes.controller';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { LearningController } from './controllers/learning.controller';
import { CertificatesController } from './controllers/certificates.controller';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [
    CoursesController,
    PublicCoursesController,
    LessonsController,
    ModulesController,
    QuizzesController,
    EnrollmentsController,
    LearningController,
    CertificatesController,
  ],
  providers: [
    CoursesService,
    LessonsService,
    ModulesService,
    QuizzesService,
    EnrollmentsService,
    ProgressService,
    CertificatesService,
    CertificateGeneratorService,
    CoursePlaceholderService,
  ],
  exports: [
    CoursesService,
    LessonsService,
    ModulesService,
    QuizzesService,
    EnrollmentsService,
    ProgressService,
    CertificatesService,
    CoursePlaceholderService,
  ],
})
export class LmsModule {}
