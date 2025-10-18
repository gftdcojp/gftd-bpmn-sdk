import { describe, it, expect } from 'vitest';
import * as Core from './index';

// Test core exports
describe('@gftd/bpmn-sdk/core', () => {
  it('should export core types', () => {
    expect(Core.BpmnIR).toBeDefined();
    expect(Core.ElementType).toBeDefined();
    expect(Core.ProcessIR).toBeDefined();
    expect(Core.FlowElementIR).toBeDefined();
    expect(Core.SequenceFlowIR).toBeDefined();
  });

  it('should export IR types', () => {
    expect(Core.DefinitionsIR).toBeDefined();
    expect(Core.EventIR).toBeDefined();
    expect(Core.TaskIR).toBeDefined();
    expect(Core.GatewayIR).toBeDefined();
  });

  it('should create valid IR structure', () => {
    const ir: Core.BpmnIR = {
      definitions: {
        id: 'test-definitions',
        name: 'Test Definitions',
        targetNamespace: 'http://example.com',
        processes: [{
          id: 'test-process',
          isExecutable: true,
          flowElements: [],
          sequenceFlows: []
        }],
        version: '1.0.0'
      }
    };

    expect(ir.definitions.id).toBe('test-definitions');
    expect(ir.definitions.processes).toHaveLength(1);
    expect(ir.definitions.processes[0].id).toBe('test-process');
  });
});

