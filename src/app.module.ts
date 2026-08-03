import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsModule } from './metrics/metrics.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [ReportsModule, MetricsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
