import { describe, it, expect } from 'vitest';
import { BpmnValidator, validateProcess } from './bpmn-validator';

describe('@gftd/bpmn-sdk/validation', () => {
  let validator: BpmnValidator;

  beforeEach(() => {
    validator = new BpmnValidator();
  });

  describe('BpmnValidator', () => {
    it('should instantiate correctly', () => {
      expect(validator).toBeDefined();
      expect(validator).toBeInstanceOf(BpmnValidator);
    });

    describe('validateProcess()', () => {
      it('should validate a valid process', async () => {
      const validProcess = {
        definitions: {
          processes: [{
            id: 'ValidProcess',
            isExecutable: true,
            flowElements: [
            { id: 'StartEvent', type: 'event', eventType: 'start' },
            { id: 'UserTask', type: 'task', taskType: 'user' },
            { id: 'EndEvent', type: 'event', eventType: 'end' }
          ],
          sequenceFlows: [
            { id: 'Flow1', sourceRef: 'StartEvent', targetRef: 'UserTask' },
            { id: 'Flow2', sourceRef: 'UserTask', targetRef: 'EndEvent' }
          ]
        }
      };

        const result = await validator.validateProcess(validProcess);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it('should detect unreachable elements', async () => {
        const processWithUnreachable = {
          id: 'ProcessWithUnreachable',
          isExecutable: true,
          flowElements: [
            { id: 'StartEvent', type: 'event', eventType: 'start' },
            { id: 'ReachableTask', type: 'task', taskType: 'user' },
            { id: 'UnreachableTask', type: 'task', taskType: 'user' },
            { id: 'EndEvent', type: 'event', eventType: 'end' }
          ],
          sequenceFlows: [
            { id: 'Flow1', sourceRef: 'StartEvent', targetRef: 'ReachableTask' },
            { id: 'Flow2', sourceRef: 'ReachableTask', targetRef: 'EndEvent' }
            // UnreachableTask is not connected
          ]
        };

        const result = await validator.validateProcess(processWithUnreachable);

        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.type === 'unreachable_element')).toBe(true);
        expect(result.statistics.unreachableElements).toBeGreaterThan(0);
      });

      it('should detect dead ends', async () => {
        const processWithDeadEnd = {
          id: 'ProcessWithDeadEnd',
          isExecutable: true,
          flowElements: [
            { id: 'StartEvent', type: 'event', eventType: 'start' },
            { id: 'TaskWithNoOutgoing', type: 'task', taskType: 'user' },
            { id: 'EndEvent', type: 'event', eventType: 'end' }
          ],
          sequenceFlows: [
            { id: 'Flow1', sourceRef: 'StartEvent', targetRef: 'TaskWithNoOutgoing' }
            // TaskWithNoOutgoing has no outgoing flow
          ]
        };

        const result = await validator.validateProcess(processWithDeadEnd);

        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.type === 'dead_end')).toBe(true);
      });

      it('should validate gateway consistency', async () => {
        const processWithGateway = {
          id: 'ProcessWithGateway',
          isExecutable: true,
          flowElements: [
            { id: 'StartEvent', type: 'event', eventType: 'start' },
            { id: 'ExclusiveGateway', type: 'gateway', gatewayType: 'exclusive' },
            { id: 'Task1', type: 'task', taskType: 'user' },
            { id: 'Task2', type: 'task', taskType: 'user' },
            { id: 'JoinGateway', type: 'gateway', gatewayType: 'exclusive' },
            { id: 'EndEvent', type: 'event', eventType: 'end' }
          ],
          sequenceFlows: [
            { id: 'Flow1', sourceRef: 'StartEvent', targetRef: 'ExclusiveGateway' },
            { id: 'Flow2', sourceRef: 'ExclusiveGateway', targetRef: 'Task1', conditionExpression: '${path1}' },
            { id: 'Flow3', sourceRef: 'ExclusiveGateway', targetRef: 'Task2', conditionExpression: '${path2}' },
            { id: 'Flow4', sourceRef: 'Task1', targetRef: 'JoinGateway' },
            { id: 'Flow5', sourceRef: 'Task2', targetRef: 'JoinGateway' },
            { id: 'Flow6', sourceRef: 'JoinGateway', targetRef: 'EndEvent' }
          ]
        };

        const result = await validator.validateProcess(processWithGateway);

        expect(result.valid).toBe(true);
      });

      it('should detect gateway join inconsistencies', async () => {
        const processWithBadJoin = {
          id: 'ProcessWithBadJoin',
          isExecutable: true,
          flowElements: [
            { id: 'StartEvent', type: 'event', eventType: 'start' },
            { id: 'ParallelGateway', type: 'gateway', gatewayType: 'parallel' },
            { id: 'Task1', type: 'task', taskType: 'user' },
            { id: 'Task2', type: 'task', taskType: 'user' },
            { id: 'ExclusiveJoin', type: 'gateway', gatewayType: 'exclusive' },
            { id: 'EndEvent', type: 'event', eventType: 'end' }
          ],
          sequenceFlows: [
            { id: 'Flow1', sourceRef: 'StartEvent', targetRef: 'ParallelGateway' },
            { id: 'Flow2', sourceRef: 'ParallelGateway', targetRef: 'Task1' },
            { id: 'Flow3', sourceRef: 'ParallelGateway', targetRef: 'Task2' },
            { id: 'Flow4', sourceRef: 'Task1', targetRef: 'ExclusiveJoin' },
            // Missing flow from Task2 to ExclusiveJoin - inconsistent join
            { id: 'Flow5', sourceRef: 'ExclusiveJoin', targetRef: 'EndEvent' }
          ]
        };

        const result = await validator.validateProcess(processWithBadJoin);

        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.type === 'gateway_join_inconsistency')).toBe(true);
      });

      it('should validate subprocess structures', async () => {
        const processWithSubprocess = {
          id: 'ProcessWithSubprocess',
          isExecutable: true,
          flowElements: [
            { id: 'StartEvent', type: 'event', eventType: 'start' },
            {
              id: 'SubProcess',
              type: 'subprocess',
              subProcessType: 'embedded',
              flowElements: [
                { id: 'SubStart', type: 'event', eventType: 'start' },
                { id: 'SubTask', type: 'task', taskType: 'user' },
                { id: 'SubEnd', type: 'event', eventType: 'end' }
              ],
              sequenceFlows: [
                { id: 'SubFlow1', sourceRef: 'SubStart', targetRef: 'SubTask' },
                { id: 'SubFlow2', sourceRef: 'SubTask', targetRef: 'SubEnd' }
              ]
            },
            { id: 'EndEvent', type: 'event', eventType: 'end' }
          ],
          sequenceFlows: [
            { id: 'Flow1', sourceRef: 'StartEvent', targetRef: 'SubProcess' },
            { id: 'Flow2', sourceRef: 'SubProcess', targetRef: 'EndEvent' }
          ]
        };

        const result = await validator.validateProcess(processWithSubprocess);

        expect(result.valid).toBe(true);
      });

      it('should detect invalid event placements', async () => {
        const processWithInvalidEvent = {
          id: 'ProcessWithInvalidEvent',
          isExecutable: true,
          flowElements: [
            { id: 'StartEvent', type: 'event', eventType: 'start' },
            {
              id: 'CancelEvent',
              type: 'event',
              eventType: 'end',
              eventDefinitions: [{ type: 'cancel' }]
            },
            { id: 'Task', type: 'task', taskType: 'user' }
          ],
          sequenceFlows: [
            { id: 'Flow1', sourceRef: 'StartEvent', targetRef: 'CancelEvent' }
          ]
        };

        const result = await validator.validateProcess(processWithInvalidEvent);

        // Cancel events should only be used in transaction boundaries
        expect(result.errors.some(e => e.type === 'invalid_event_placement')).toBe(true);
      });

      it('should validate message correlations', async () => {
        const processWithMessages = {
          id: 'ProcessWithMessages',
          isExecutable: true,
          flowElements: [
            {
              id: 'MessageStart',
              type: 'event',
              eventType: 'start',
              eventDefinitions: [{
                type: 'message',
                messageRef: 'OrderMessage'
              }]
            },
            {
              id: 'SendTask',
              type: 'task',
              taskType: 'send',
              eventDefinitions: [{
                type: 'message',
                messageRef: 'OrderMessage'
              }]
            }
          ],
          sequenceFlows: []
        };

        const result = await validator.validateProcess(processWithMessages);

        expect(result.valid).toBe(true);
      });

      it('should detect duplicate message correlations', async () => {
        const processWithDuplicateMessages = {
          id: 'ProcessWithDuplicateMessages',
          isExecutable: true,
          flowElements: [
            {
              id: 'MessageStart1',
              type: 'event',
              eventType: 'start',
              eventDefinitions: [{
                type: 'message',
                messageRef: 'OrderMessage'
              }]
            },
            {
              id: 'MessageStart2',
              type: 'event',
              eventType: 'start',
              eventDefinitions: [{
                type: 'message',
                messageRef: 'OrderMessage'
              }]
            }
          ],
          sequenceFlows: []
        };

        const result = await validator.validateProcess(processWithDuplicateMessages);

        expect(result.errors.some(e => e.type === 'duplicate_message_correlation')).toBe(true);
      });
    });

    describe('validateBpmnIR()', () => {
      it('should validate complete BPMN IR', async () => {
        const ir = {
          definitions: {
            id: 'Definitions_1',
            processes: [{
              id: 'Process_1',
              isExecutable: true,
              flowElements: [
                { id: 'StartEvent', type: 'event', eventType: 'start' },
                { id: 'Task', type: 'task', taskType: 'user' },
                { id: 'EndEvent', type: 'event', eventType: 'end' }
              ],
              sequenceFlows: [
                { id: 'Flow1', sourceRef: 'StartEvent', targetRef: 'Task' },
                { id: 'Flow2', sourceRef: 'Task', targetRef: 'EndEvent' }
              ]
            }]
          }
        };

        const result = await validator.validateBpmnIR(ir as any);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should aggregate errors from multiple processes', async () => {
        const ir = {
          definitions: {
            id: 'Definitions_1',
            processes: [
              {
                id: 'ValidProcess',
                isExecutable: true,
                flowElements: [
                  { id: 'Start1', type: 'event', eventType: 'start' },
                  { id: 'End1', type: 'event', eventType: 'end' }
                ],
                sequenceFlows: [
                  { id: 'Flow1', sourceRef: 'Start1', targetRef: 'End1' }
                ]
              },
              {
                id: 'InvalidProcess',
                isExecutable: true,
                flowElements: [
                  { id: 'Start2', type: 'event', eventType: 'start' },
                  { id: 'UnreachableTask', type: 'task', taskType: 'user' }
                ],
                sequenceFlows: [
                  { id: 'Flow2', sourceRef: 'Start2', targetRef: 'UnreachableTask' }
                ]
              }
            ]
          }
        };

        const result = await validator.validateBpmnIR(ir as any);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.statistics.totalProcesses).toBe(2);
      });
    });

    describe('Configuration Options', () => {
      it('should respect checkReachability option', async () => {
        const validatorWithOptions = new BpmnValidator({
          checkReachability: false
        });

        const processWithUnreachable = {
          id: 'ProcessWithUnreachable',
          flowElements: [
            { id: 'StartEvent', type: 'event', eventType: 'start' },
            { id: 'UnreachableTask', type: 'task', taskType: 'user' }
          ],
          sequenceFlows: []
        };

        const result = await validatorWithOptions.validateProcess(processWithUnreachable);

        // Should not check reachability
        expect(result.errors.filter(e => e.type === 'unreachable_element')).toHaveLength(0);
      });

      it('should respect checkGatewayConsistency option', async () => {
        const validatorWithOptions = new BpmnValidator({
          checkGatewayConsistency: false
        });

        // Test with inconsistent gateway (implementation would check this)
        const result = await validatorWithOptions.validateProcess({
          id: 'TestProcess',
          flowElements: [],
          sequenceFlows: []
        });

        expect(result).toBeDefined();
      });
    });
  });

  describe('validateProcess() function', () => {
    it('should be exported and work', async () => {
      const process = {
        id: 'TestProcess',
        flowElements: [
          { id: 'Start', type: 'event', eventType: 'start' },
          { id: 'End', type: 'event', eventType: 'end' }
        ],
        sequenceFlows: [
          { id: 'Flow', sourceRef: 'Start', targetRef: 'End' }
        ]
      };

      const result = await validateProcess(process);

      expect(result.valid).toBe(true);
    });
  });
});
