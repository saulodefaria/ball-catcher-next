declare module "inferencejs" {
  export class InferenceEngine {
    startWorker(modelId: string, numThreads: number, apiKey: string): Promise<string>;
    infer(workerId: string, image: CVImage): Promise<any[]>;
  }

  export class CVImage {
    constructor(source: HTMLVideoElement | null);
  }
}
