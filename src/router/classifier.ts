import type { Provider, TaskClassification } from '../types/index.js';
import type { ClassificationRule } from './types.js';

const CLASSIFICATION_RULES: ClassificationRule[] = [
  // Think lane rules
  {
    taskType: 'planning',
    lane: 'think',
    keywords: ['plan', 'design', 'architect', 'structure', 'how should'],
    weight: 0.9,
  },
  {
    taskType: 'code-review',
    lane: 'think',
    keywords: ['review', 'audit', 'check', 'vulnerability', 'security'],
    weight: 0.85,
  },
  {
    taskType: 'analysis',
    lane: 'think',
    keywords: ['debug', 'trace', 'analyze', 'investigate', 'why', 'root cause'],
    weight: 0.85,
  },
  {
    taskType: 'test-design',
    lane: 'think',
    keywords: ['test strategy', 'test design', 'what to test', 'coverage'],
    weight: 0.8,
  },
  {
    taskType: 'ui-ux-design',
    lane: 'think',
    keywords: ['ui', 'ux', 'layout', 'component design', 'wireframe'],
    weight: 0.8,
  },
  {
    taskType: 'requirements',
    lane: 'think',
    keywords: ['requirements', 'scope', 'what should', 'acceptance criteria'],
    weight: 0.85,
  },
  {
    taskType: 'ml-experiment-design',
    lane: 'think',
    keywords: ['experiment design', 'architecture selection', 'hyperparameter', 'model comparison'],
    weight: 0.8,
  },

  // Do lane rules
  {
    taskType: 'implementation',
    lane: 'do',
    keywords: ['implement', 'build', 'create', 'refactor', 'write code', 'add feature'],
    weight: 0.9,
  },
  {
    taskType: 'test-writing',
    lane: 'do',
    keywords: ['write test', 'fix build', 'fix lint', 'npm test'],
    weight: 0.85,
  },
  {
    taskType: 'git-operations',
    lane: 'do',
    keywords: ['commit', 'push', 'merge', 'rebase', 'tag', 'release'],
    weight: 0.85,
  },
  {
    taskType: 'documentation',
    lane: 'do',
    keywords: ['write docs', 'update readme', 'add comments'],
    weight: 0.8,
  },
  {
    taskType: 'ml-pipeline',
    lane: 'do',
    keywords: ['train', 'fine-tune', 'run pipeline', 'preprocess data'],
    weight: 0.85,
  },
  {
    taskType: 'quick-fix',
    lane: 'do',
    keywords: ['fix typo', 'rename', 'quick fix', 'simple change'],
    weight: 0.9,
  },
];

interface RuleMatch {
  rule: ClassificationRule;
  matchCount: number;
}

function matchRule(input: string, rule: ClassificationRule): RuleMatch {
  const lower = input.toLowerCase();
  let matchCount = 0;
  for (const keyword of rule.keywords) {
    if (lower.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  return { rule, matchCount };
}

export function classifyTask(
  input: string,
  _availableProviders: Provider[],
): TaskClassification {
  const matches: RuleMatch[] = [];

  for (const rule of CLASSIFICATION_RULES) {
    const match = matchRule(input, rule);
    if (match.matchCount > 0) {
      matches.push(match);
    }
  }

  if (matches.length === 0) {
    // Default to Think (Claude) when ambiguous — safer default
    return {
      input,
      lane: 'think',
      taskType: 'unknown',
      confidence: 0.3,
      reason: 'No keyword patterns matched; defaulting to Think lane for safety',
    };
  }

  // Sort by: matchCount descending, then weight descending
  matches.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return b.rule.weight - a.rule.weight;
  });

  const best = matches[0];
  const keywordRatio = best.matchCount / best.rule.keywords.length;
  const confidence = Math.min(best.rule.weight * (0.5 + 0.5 * keywordRatio), 1.0);

  // Check for conflicting lanes among top matches
  const hasConflict = matches.length > 1 && matches[1].matchCount === best.matchCount
    && matches[1].rule.lane !== best.rule.lane;

  if (hasConflict) {
    // Conflict between Think and Do — default to Think for safety
    return {
      input,
      lane: 'think',
      taskType: best.rule.taskType,
      confidence: confidence * 0.6,
      reason: `Conflicting signals between ${best.rule.taskType} (${best.rule.lane}) and ${matches[1].rule.taskType} (${matches[1].rule.lane}); defaulting to Think`,
    };
  }

  return {
    input,
    lane: best.rule.lane,
    taskType: best.rule.taskType,
    confidence,
    reason: `Matched ${best.matchCount}/${best.rule.keywords.length} keywords for ${best.rule.taskType}`,
  };
}
