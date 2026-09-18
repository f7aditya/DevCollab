import crypto from 'crypto';
import { AppError } from '../../../../core/errors/AppError';

export const GithubWebhookService = {
  /**
   * Verifies the GitHub webhook signature
   * @param payload Raw string payload from the request body
   * @param signature The X-Hub-Signature-256 header
   * @param secret The webhook secret configured for this integration
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      return false;
    }

    try {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = 'sha256=' + hmac.update(payload).digest('hex');
      
      // Use crypto.timingSafeEqual to prevent timing attacks
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch (err) {
      console.error('Webhook signature verification error', err);
      return false;
    }
  }
};
