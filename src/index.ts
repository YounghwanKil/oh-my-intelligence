// Router
export { classifyTask } from './router/classifier.js';
export { getProvider, detectProviders, isProviderAvailable } from './router/provider-registry.js';
export { applyFallback, getDefaultFallbackSpec } from './router/fallback.js';
export { getLaneForPhase, getPhaseMapping, getNextPhase } from './router/hybrid-phases.js';
export type { ClassificationRule, ProviderCapability } from './router/types.js';

// State
export { initStateDir, writeState, readState, writeRoutingDecision, readRoutingDecision } from './state/unified-state.js';
export { writeProviderState, readProviderState, writeVersionWarning } from './state/provider-state.js';
export { initSession, getSessionState, updateSessionState } from './state/session.js';

// Interop
export { buildSkillRegistry } from './interop/skill-registry.js';
export type { SkillEntry } from './interop/skill-registry.js';
export { buildAgentRegistry } from './interop/agent-registry.js';
export type { AgentEntry } from './interop/agent-registry.js';
export { readOmcPromptState, readOmcSessionState, readOmcTeamState, isOmcStateAvailable } from './interop/omc-bridge.js';
export { readOmxState, readOmxTeamState, isOmxAvailable } from './interop/omx-bridge.js';

// Config
export { loadConfig, detectOmc, detectOmx, checkVersionCompatibility } from './config/loader.js';
export { OMI_DEFAULTS } from './config/defaults.js';

// HUD
export { getHudStatus, getRoutingData, formatRoutingDisplay } from './hud/index.js';
export type { HudRoutingData } from './hud/index.js';

// MCP
export { getOmiTools } from './mcp/omi-tools-server.js';
export type { OmiTool } from './mcp/omi-tools-server.js';

// Types
export * from './types/index.js';
