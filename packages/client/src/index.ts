// Re-export the initDevTools function and types for programmatic usage
export { initDevTools } from './client';

export interface DevToolsConfig {
  position: string;
}

export interface ComponentInfo {
  name: string;
  count: number;
  instances: Element[];
  attributes: Set<string>;
}
