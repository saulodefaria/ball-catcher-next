declare module "inferencejs" {
  export class InferenceEngine {
    startWorker(modelId: string, numThreads: number, apiKey: string): Promise<string>;
    stopWorker(workerId: string): Promise<boolean>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    infer(workerId: string, image: CVImage): Promise<any[]>;
  }

  export class CVImage {
    constructor(source: HTMLVideoElement | null);
  }
}
