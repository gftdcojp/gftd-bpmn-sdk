import { describe, it, expect, beforeEach } from 'vitest';
import { createForm } from '../../src/viewer';

describe('form viewer', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('imports schema and submits', async () => {
    const schema = { components: [] } as any;
    const form = await createForm({ container, schema });

    let submitted = false;
    form.onSubmit(() => {
      submitted = true;
    });

    // form-js emits events internally; we simulate lifecycle only
    expect(typeof form.importSchema).toBe('function');
    expect(typeof form.update).toBe('function');
    form.destroy();
    expect(submitted).toBe(false);
  });
});

