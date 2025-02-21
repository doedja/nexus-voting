declare interface NexusZkVM {
  prove(
    wasmPath: string,
    publicInputs: (number | Uint8Array)[],
    privateInputs: (number | Uint8Array | boolean[] | Uint8Array[])[],
  ): Promise<Uint8Array>;

  verify(
    wasmPath: string,
    proof: Uint8Array,
    publicInputs: (number | Uint8Array)[],
  ): Promise<boolean>;
}

declare interface Nexus {
  zkvm: NexusZkVM;
}

declare global {
  interface Window {
    nexus?: Nexus;
  }
} 