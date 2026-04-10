const registry = new Map();

export function registerHarmony(type, strategyClass) {
  registry.set(type, strategyClass);
}

export function getHarmony(type) {
  const Strategy = registry.get(type);
  if (!Strategy) {
    throw new Error(`Unsupported harmony type: ${type}`);
  }
  return new Strategy();
}
