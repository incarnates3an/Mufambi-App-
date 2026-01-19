/**
 * Performance monitoring utilities
 */

// Mark a performance milestone
export const mark = (name: string) => {
  if ('performance' in window && performance.mark) {
    performance.mark(name);
  }
};

// Measure time between two marks
export const measure = (name: string, startMark: string, endMark: string) => {
  if ('performance' in window && performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        console.log(`⚡ ${name}: ${measure.duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.warn(`Performance measure failed for ${name}`, error);
    }
  }
};

// Report Web Vitals
export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          onPerfEntry({
            name: 'LCP',
            value: lastEntry.startTime,
            rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            onPerfEntry({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              rating: entry.processingStart - entry.startTime < 100 ? 'good' : entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor'
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              onPerfEntry({
                name: 'CLS',
                value: clsValue,
                rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
              });
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance monitoring not supported', error);
      }
    }
  }
};

// Log component render time
export const logRenderTime = (componentName: string, startTime: number) => {
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (renderTime > 16.67) { // Slower than 60fps
    console.warn(`🐢 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`✅ ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
  }
};

// Memory usage monitoring
export const logMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`
    });
  }
};

// Detect slow network
export const isSlowNetwork = (): boolean => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
  }
  return false;
};

// Prefetch resources
export const prefetchResource = (url: string, type: 'script' | 'style' | 'image' = 'script') => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
};

// Detect if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export default {
  mark,
  measure,
  reportWebVitals,
  logRenderTime,
  logMemoryUsage,
  isSlowNetwork,
  prefetchResource,
  prefersReducedMotion
};
