export const OMI_DEFAULTS = {
  minOmcVersion: '4.10.0',
  minOmxVersion: '0.11.0',
  schemaVersion: '1.0',
  stateDir: '.omi',
  defaultLane: 'think' as const,
  fallbackProvider: 'claude' as const,
  hybridWorkflows: ['autopilot', 'ralph', 'ultrawork', 'team', 'ultraqa'] as const,
  thinkSkills: ['plan', 'deep-interview', 'ralplan', 'trace', 'security-review', 'code-review', 'sciomc', 'external-context', 'visual-verdict', 'ai-slop-cleaner'] as const,
  doSkills: ['build-fix', 'tdd', 'web-clone', 'ecomode', 'deepinit'] as const,
};
