import * as S from "@effect/schema/Schema";

// Minimal shape aligned with form-js schema
export const FormSchema = S.record(S.string, S.unknown);
export type FormSchema = S.To<typeof FormSchema>;

export const FormData = S.record(S.string, S.unknown);
export type FormData = S.To<typeof FormData>;

export interface CreateBaseOptions {
  container: HTMLElement;
}

export interface ViewerOptions extends CreateBaseOptions {
  schema: FormSchema;
  data?: FormData;
}

export interface EditorOptions extends CreateBaseOptions {
  schema: FormSchema;
}

export interface PlaygroundOptions extends CreateBaseOptions {
  schema: FormSchema;
  data?: FormData;
}

export type SubmitHandler = (event: { data: FormData; errors: unknown[] }) => void;

export interface FormHandle {
  importSchema: (schema: FormSchema, data?: FormData) => Promise<void>;
  update: (data: FormData) => void;
  onSubmit: (cb: SubmitHandler) => void;
  destroy: () => void;
}

export interface FormEditorHandle {
  importSchema: (schema: FormSchema) => Promise<void>;
  destroy: () => void;
}

export interface FormPlaygroundHandle {
  importSchema: (schema: FormSchema, data?: FormData) => Promise<void>;
  destroy: () => void;
}

