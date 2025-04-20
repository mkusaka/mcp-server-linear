import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createIssueTool, updateIssueTool, deleteIssueTool } from '../../src/tools/issues.js';
import { resetLinearClient } from '../../src/utils/linear.js';

describe('Tool Handlers', () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = 'test-api-key';
    resetLinearClient();
    
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('createIssueTool', () => {
    it('should attempt to create a new issue', async () => {
      const result = await createIssueTool({
        title: 'Test Issue',
        description: 'Test Description',
        teamId: 'test-team-id'
      }, { auth: { apiKey: 'test-api-key' } } as any);

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      expect(typeof result.content[0].text).toBe('string');
    });
  });

  describe('updateIssueTool', () => {
    it('should attempt to update an existing issue', async () => {
      const result = await updateIssueTool({
        issueId: 'mock-issue-id',
        title: 'Updated Test Issue',
        description: 'Updated Test Description'
      }, { auth: { apiKey: 'test-api-key' } } as any);

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      expect(typeof result.content[0].text).toBe('string');
    });
  });

  describe('deleteIssueTool', () => {
    it('should attempt to delete an existing issue', async () => {
      const result = await deleteIssueTool({
        issueId: 'mock-issue-id'
      }, { auth: { apiKey: 'test-api-key' } } as any);

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      expect(typeof result.content[0].text).toBe('string');
    });
  });
});
