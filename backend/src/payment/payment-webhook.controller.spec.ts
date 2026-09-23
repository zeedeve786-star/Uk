import { BadRequestException } from '@nestjs/common';
import { PaymentWebhookController } from './payment-webhook.controller';

describe('PaymentWebhookController', () => {
  let controller: PaymentWebhookController;
  let paymentService: { handleStripeEvent: jest.Mock };
  let configService: { get: jest.Mock };
  let stripe: { webhooks: { constructEvent: jest.Mock } };

  beforeEach(() => {
    paymentService = { handleStripeEvent: jest.fn() };
    configService = { get: jest.fn().mockReturnValue('whsec_test') };
    stripe = { webhooks: { constructEvent: jest.fn() } };
    controller = new PaymentWebhookController(paymentService as any, configService as any, stripe as any);
  });

  it('processes a valid webhook with a verified signature', async () => {
    const event = { type: 'payment_intent.succeeded', data: { object: { id: 'pi_123' } } };
    stripe.webhooks.constructEvent.mockReturnValue(event);
    const req = { rawBody: Buffer.from('{}') } as any;

    const result = await controller.handleWebhook(req, 'valid-sig');

    expect(paymentService.handleStripeEvent).toHaveBeenCalledWith(event);
    expect(result).toEqual({ received: true });
  });

  it('rejects a request with an invalid signature and does not process the event', async () => {
    stripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('signature mismatch');
    });
    const req = { rawBody: Buffer.from('{}') } as any;

    await expect(controller.handleWebhook(req, 'bad-sig')).rejects.toThrow(BadRequestException);
    expect(paymentService.handleStripeEvent).not.toHaveBeenCalled();
  });

  it('rejects a request with no raw body available', async () => {
    const req = {} as any;
    await expect(controller.handleWebhook(req, 'sig')).rejects.toThrow(BadRequestException);
  });
});