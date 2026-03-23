export type SerializedPaletteV1 = {
  isDarkTheme: boolean;
  entries: Array<{
    hex: string;
    role: string | null;
  }>;
};