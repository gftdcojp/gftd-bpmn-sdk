import { assertClient } from "./ssr";
import { Form as JsForm } from "@bpmn-io/form-js";
import type { FormHandle, ViewerOptions, FormSchema, FormData, SubmitHandler } from "./types";
import * as S from "@effect/schema/Schema";

const SchemaTuple = S.tupleFromSelf(S.record(S.string, S.unknown), S.optional(S.record(S.string, S.unknown)));

export async function createForm(options: ViewerOptions): Promise<FormHandle> {
  assertClient();

  const form = new JsForm({ container: options.container });

  await form.importSchema(options.schema as FormSchema, options.data as FormData);

  const handle: FormHandle = {
    importSchema: async (schema, data) => {
      // runtime validation (best-effort)
      S.parse(SchemaTuple)([schema, data]);
      await form.importSchema(schema as FormSchema, data as FormData);
    },
    update: (data) => {
      form.setData(data);
    },
    onSubmit: (cb: SubmitHandler) => {
      form.on("submit", (event: any) => cb({ data: event.data, errors: event.errors ?? [] }));
    },
    destroy: () => {
      form.destroy();
    },
  };

  return handle;
}

