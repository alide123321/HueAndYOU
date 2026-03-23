export type SerializedGenerationSettingsV1 = {
  harmonyType: string;
  baseColorHex: string;
  numberOfColors: number;
  numberOfPalettes: number;
  filters: Record<string, unknown>;
  isLightMode: boolean;
  includeBgTextColors: boolean;
  opts: Record<string, unknown>;
};