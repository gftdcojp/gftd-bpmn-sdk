import { describe, it, expect, beforeEach } from 'vitest';
import { createFormEditor } from '../../src/editor';

describe('form editor', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('imports schema', async () => {
    const schema = { components: [] } as any;
    const editor = await createFormEditor({ container, schema });
    expect(typeof editor.importSchema).toBe('function');
    editor.destroy();
  });
});

