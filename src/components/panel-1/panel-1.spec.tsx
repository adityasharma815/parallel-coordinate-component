import { newSpecPage } from '@stencil/core/testing';
import { Panel1 } from './panel-1';

describe('panel-1', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [Panel1],
      html: `<panel-1></panel-1>`,
    });
    expect(page.root).toEqualHtml(`
      <panel-1>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </panel-1>
    `);
  });
});
