import { newE2EPage } from '@stencil/core/testing';

describe('parallel-coordinates', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<parallel-coordinates></parallel-coordinates>');

    const element = await page.find('parallel-coordinates');
    expect(element).toHaveClass('hydrated');
  });
});
