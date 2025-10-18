// Vitest setup file
import { expect, vi } from 'vitest';

// Extend expect with custom matchers for BPMN testing
expect.extend({
  toBeValidBpmnProcess(received) {
    const pass = received && typeof received === 'object' && 'definitions' in received;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid BPMN process`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid BPMN process`,
        pass: false,
      };
    }
  },

  toHaveValidTasks(received) {
    const pass = received &&
                 Array.isArray(received.flowElements) &&
                 received.flowElements.some(el => el.type === 'task');
    if (pass) {
      return {
        message: () => `expected process not to have valid tasks`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected process to have valid tasks`,
        pass: false,
      };
    }
  },

  toBeCompletedTask(received) {
    const pass = received &&
                 typeof received === 'object' &&
                 received.status === 'completed';
    if (pass) {
      return {
        message: () => `expected task not to be completed`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected task to be completed`,
        pass: false,
      };
    }
  },
});

// Mock external dependencies
vi.mock('bpmn-engine', () => ({
  Engine: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
    getState: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
  })),
}));

vi.mock('bpmn-moddle', () => ({
  default: vi.fn(),
}));

vi.mock('moddle-xml', () => ({
  toXML: vi.fn().mockResolvedValue('<xml>test</xml>'),
  fromXML: vi.fn().mockResolvedValue({}),
}));

// Global test utilities
global.testUtils = {
  createMockProcess: () => ({
    id: 'test-process',
    definitions: {
      processes: [{
        id: 'test-process',
        flowElements: [],
        sequenceFlows: [],
      }],
    },
  }),

  createMockEngine: () => ({
    execute: vi.fn(),
    getState: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
  }),
};
