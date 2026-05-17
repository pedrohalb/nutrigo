import { env } from './config/env';
import { app } from './server';
import { prisma } from './config/db';
import { startWorkers } from './queue/workers';

async function bootstrap() {
  await prisma.$connect();
  console.log('Database connected');

  startWorkers();
  console.log('Queue workers started');

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
