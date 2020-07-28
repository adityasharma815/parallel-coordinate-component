import { newSpecPage } from '@stencil/core/testing';
import { ParallelCoordinates } from './parallel-coordinates';

describe('parallel-coordinates', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ParallelCoordinates],
      html: `<parallel-coordinates></parallel-coordinates>`,
    });
    expect(page.root).toEqualHtml(`
      <parallel-coordinates>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </parallel-coordinates>
    `);
  });
});
