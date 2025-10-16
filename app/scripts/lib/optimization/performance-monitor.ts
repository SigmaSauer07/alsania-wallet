/**
 * Performance Monitoring System for Alsania Wallet
 * Tracks and optimizes wallet performance
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly maxMetrics = 100; // Keep last 100 metrics per type

  /**
   * Measure execution time of a function
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>,
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric({ name, duration, timestamp: Date.now(), metadata });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric({
        name: `${name}_error`,
        duration,
        timestamp: Date.now(),
        metadata: { ...metadata, error: String(error) },
      });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>,
  ): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric({ name, duration, timestamp: Date.now(), metadata });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric({
        name: `${name}_error`,
        duration,
        timestamp: Date.now(),
        metadata: { ...metadata, error: String(error) },
      });
      throw error;
    }
  }

  /**
   * Record a metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    const metrics = this.metrics.get(metric.name) || [];
    metrics.push(metric);

    // Keep only last N metrics
    if (metrics.length > this.maxMetrics) {
      metrics.shift();
    }

    this.metrics.set(metric.name, metrics);
  }

  /**
   * Get average duration for a metric
   */
  getAverage(name: string): number {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return 0;
    }

    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }

  /**
   * Get all metrics for a name
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, any> = {};

    this.metrics.forEach((metrics, name) => {
      const durations = metrics.map((m) => m.duration);
      summary[name] = {
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        count: durations.length,
      };
    });

    return summary;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Report slow operations (> threshold ms)
   */
  getSlowOperations(threshold: number = 1000): PerformanceMetric[] {
    const slow: PerformanceMetric[] = [];

    this.metrics.forEach((metrics) => {
      metrics.forEach((metric) => {
        if (metric.duration > threshold) {
          slow.push(metric);
        }
      });
    });

    return slow.sort((a, b) => b.duration - a.duration);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring method performance
 */
export function measurePerformance(metricName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measure(
        name,
        () => originalMethod.apply(this, args),
      );
    };

    return descriptor;
  };
}
