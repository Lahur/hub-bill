import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const stopTimer = this.metricsService.httpRequestDuration.startTimer();

    res.on('finish', () => {
      stopTimer({
        method: req.method,
        route: req.route?.path ?? req.path,
        status_code: res.statusCode,
      });
    });

    next();
  }
}