import { generateBookingReference } from './booking-reference.util';

describe('generateBookingReference', () => {
  it('generates a reference in the expected format', () => {
    const reference = generateBookingReference();

    expect(reference).toMatch(/^BK-[0-9A-Z]+-[0-9A-Z]{4}$/);
  });

  it('generates unique references across repeated calls', () => {
    const references = new Set<string>();

    for (let index = 0; index < 2000; index += 1) {
      references.add(generateBookingReference());
    }

    expect(references.size).toBe(2000);
  });
});