import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Flyway } from 'node-flyway';
import * as path from 'path';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function runMigrations() {
  const flyway = new Flyway({
    url: `jdbc:postgresql://${process.env.DB_HOST}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME}`,
    user: process.env.DB_USERNAME ?? '',
    password: process.env.DB_PASSWORD,
    migrationLocations: [
      `filesystem:${path.join(process.cwd(), 'db/migrations')}`,
    ],
  });

  const result = await flyway.migrate();
  if (!result.success) {
    throw new Error(
      `Flyway migration failed: ${result.error?.errorCode ?? 'unknown'} - ${result.error?.message ?? ''}`,
    );
  }
  logger.log(
    `Flyway applied ${result.flywayResponse?.migrationsExecuted ?? 0} migration(s)`,
  );
}

async function bootstrap() {
  if (process.env.DB_HOST) {
    await runMigrations();
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
