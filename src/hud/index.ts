import { getRoutingData, formatRoutingDisplay } from './routing-indicator.js';

export { getRoutingData, formatRoutingDisplay } from './routing-indicator.js';
export type { HudRoutingData } from './routing-indicator.js';

export function getHudStatus(projectRoot?: string): string {
  const data = getRoutingData(projectRoot);
  return formatRoutingDisplay(data);
}
