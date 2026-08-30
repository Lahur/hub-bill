import { Injectable, OnModuleInit } from '@nestjs/common';
import { Registry, Histogram, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();

  readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [this.registry],
  });

  onModuleInit() {
    collectDefaultMetrics({ register: this.registry });
  }
}
