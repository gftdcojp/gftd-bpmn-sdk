import { assertClient } from "./ssr";
import DmnJS from "dmn-js";
import type { CreateDmnViewerOptions, DmnViewerHandle } from "./types";

export async function createDmnViewer(options: CreateDmnViewerOptions): Promise<DmnViewerHandle> {
  assertClient();

  const viewer = new (DmnJS as any)({ container: options.container });

  const handle: DmnViewerHandle = {
    importXML: async (xml: string) => {
      await viewer.importXML(xml);
    },
    destroy: () => {
      viewer.destroy();
    },
  };

  return handle;
}

