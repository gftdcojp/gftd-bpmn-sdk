import { assertClient } from "./ssr";
import { FormPlayground as JsFormPlayground } from "@bpmn-io/form-js";
import type { PlaygroundOptions, FormPlaygroundHandle } from "./types";
import * as S from "@effect/schema/Schema";

export async function createFormPlayground(options: PlaygroundOptions): Promise<FormPlaygroundHandle> {
  assertClient();

  // validate inputs
  S.parse(S.record(S.string, S.unknown))(options.schema);

  const playground = new JsFormPlayground({
    container: options.container,
    schema: options.schema as any,
    data: options.data as any,
  });

  const handle: FormPlaygroundHandle = {
    importSchema: async (schema, data) => {
      S.parse(S.record(S.string, S.unknown))(schema);
      await playground.importSchema(schema as any, data as any);
    },
    destroy: () => {
      playground.destroy();
    },
  };

  return handle;
}

