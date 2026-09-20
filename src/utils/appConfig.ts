/**
 * Application URL and Deployment Configuration
 */

export const getAppBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:')) {
    return window.location.origin;
  }
  return 'https://ais-pre-3osndkjdcp4aqnuupngz67-256556031096.asia-southeast1.run.app';
};

export const APP_PUBLIC_URL = 'https://ais-pre-3osndkjdcp4aqnuupngz67-256556031096.asia-southeast1.run.app';
