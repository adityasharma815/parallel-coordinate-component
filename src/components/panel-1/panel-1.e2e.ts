import { newE2EPage } from '@stencil/core/testing';

describe('panel-1', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<panel-1></panel-1>');

    const element = await page.find('panel-1');
    expect(element).toHaveClass('hydrated');
  });
});
