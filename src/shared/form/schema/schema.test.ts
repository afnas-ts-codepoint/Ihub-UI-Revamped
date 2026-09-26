import { beforeAll, describe, expect, it } from 'vitest';
import { requiredText } from './requiredText';
import { configureYupLocale } from './yupLocale';
beforeAll(() => {
  configureYupLocale(() => 'Required localized');
});
describe('shared Yup schema helpers', () => {
  it('trims and requires text with the configured locale', async () => {
    await expect(requiredText().validate('   ')).rejects.toThrow(
      'Required localized',
    );
    await expect(requiredText().validate('  Area  ')).resolves.toBe('Area');
  });
});
