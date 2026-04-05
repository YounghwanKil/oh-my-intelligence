import { describe, it, expect } from 'vitest';
import { classifyTask } from '../../src/router/classifier.js';
import type { Provider } from '../../src/types/index.js';

const providers: Provider[] = ['claude', 'codex'];

describe('classifyTask', () => {
  describe('Think lane classification', () => {
    it('classifies "plan the API architecture" as Think', () => {
      const result = classifyTask('plan the API architecture', providers);
      expect(result.lane).toBe('think');
    });

    it('classifies "review this PR for security issues" as Think', () => {
      const result = classifyTask('review this PR for security issues', providers);
      expect(result.lane).toBe('think');
    });

    it('classifies "debug why the login fails" as Think', () => {
      const result = classifyTask('debug why the login fails', providers);
      expect(result.lane).toBe('think');
    });

    it('classifies "design the database schema" as Think', () => {
      const result = classifyTask('design the database schema', providers);
      expect(result.lane).toBe('think');
    });

    it('classifies "experiment design for fine-tuning" as Think (ML design = Think)', () => {
      const result = classifyTask('experiment design for fine-tuning', providers);
      expect(result.lane).toBe('think');
    });
  });

  describe('Do lane classification', () => {
    it('classifies "implement the auth middleware" as Do', () => {
      const result = classifyTask('implement the auth middleware', providers);
      expect(result.lane).toBe('do');
    });

    it('classifies "write tests for the user model" as Do', () => {
      const result = classifyTask('write tests for the user model', providers);
      expect(result.lane).toBe('do');
    });

    it('classifies "fix build error" as Do', () => {
      const result = classifyTask('fix build error', providers);
      expect(result.lane).toBe('do');
    });

    it('classifies "commit and push the changes" as Do', () => {
      const result = classifyTask('commit and push the changes', providers);
      expect(result.lane).toBe('do');
    });

    it('classifies "train the model on this dataset" as Do (ML pipeline = Do)', () => {
      const result = classifyTask('train the model on this dataset', providers);
      expect(result.lane).toBe('do');
    });

    it('classifies "rename the variable" as Do (quick fix)', () => {
      const result = classifyTask('rename the variable', providers);
      expect(result.lane).toBe('do');
    });
  });

  describe('Edge cases', () => {
    it('classifies empty string as Think (default)', () => {
      const result = classifyTask('', providers);
      expect(result.lane).toBe('think');
      expect(result.taskType).toBe('unknown');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('classifies ambiguous input "hello" as Think (default when unsure)', () => {
      const result = classifyTask('hello', providers);
      expect(result.lane).toBe('think');
      expect(result.taskType).toBe('unknown');
    });

    it('classifies mixed "plan and implement the feature" and picks one with confidence', () => {
      const result = classifyTask('plan and implement the feature', providers);
      expect(result.lane).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(['think', 'do']).toContain(result.lane);
    });
  });

  describe('Result structure', () => {
    it('returns all required fields', () => {
      const result = classifyTask('implement the feature', providers);
      expect(result).toHaveProperty('input');
      expect(result).toHaveProperty('lane');
      expect(result).toHaveProperty('taskType');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('reason');
      expect(result.input).toBe('implement the feature');
    });
  });
});
