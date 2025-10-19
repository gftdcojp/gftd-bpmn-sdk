import { assertClient } from "./ssr";
import { FormEditor as JsFormEditor } from "@bpmn-io/form-js";
import type { EditorOptions, FormEditorHandle } from "./types";
import * as S from "@effect/schema/Schema";

export async function createFormEditor(options: EditorOptions): Promise<FormEditorHandle> {
  assertClient();

  const _schemaCheck = S.parse(S.record(S.string, S.unknown))(options.schema);

  const editor = new JsFormEditor({ container: options.container });
  await editor.importSchema(options.schema as any);

  const handle: FormEditorHandle = {
    importSchema: async (schema) => {
      S.parse(S.record(S.string, S.unknown))(schema);
      await editor.importSchema(schema as any);
    },
    destroy: () => {
      editor.destroy();
    },
  };

  return handle;
}

