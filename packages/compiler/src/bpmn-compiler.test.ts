import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BpmnCompiler } from './bpmn-compiler';

describe.skip('@gftd/bpmn-sdk/compiler', () => {
  let compiler: BpmnCompiler;

  beforeEach(() => {
    compiler = new BpmnCompiler();
  });

  describe('BpmnCompiler', () => {
    it('should instantiate correctly', () => {
      expect(compiler).toBeDefined();
      expect(compiler).toBeInstanceOf(BpmnCompiler);
    });

    describe('compileToXml()', () => {
      it('should compile simple process to XML', async () => {
        const ir = {
          definitions: {
            id: 'Definitions_1',
            targetNamespace: 'http://bpmn.io/schema/bpmn',
            processes: [{
              id: 'Process_1',
              isExecutable: true,
              flowElements: [
                {
                  id: 'StartEvent_1',
                  type: 'event',
                  eventType: 'start',
                  name: 'Start Event'
                },
                {
                  id: 'EndEvent_1',
                  type: 'event',
                  eventType: 'end',
                  name: 'End Event'
                }
              ],
              sequenceFlows: [{
                id: 'Flow_1',
                sourceRef: 'StartEvent_1',
                targetRef: 'EndEvent_1'
              }]
            }]
          }
        };

        const result = await compiler.compileToXml(ir as any);

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('<definitions');
        expect(result).toContain('targetNamespace');
        expect(result).toContain('<process');
        expect(result).toContain('<startEvent');
        expect(result).toContain('<endEvent');
        expect(result).toContain('<sequenceFlow');
      });

      it('should handle complex process with all elements', async () => {
        const ir = {
          definitions: {
            id: 'Definitions_1',
            targetNamespace: 'http://bpmn.io/schema/bpmn',
            processes: [{
              id: 'Process_1',
              isExecutable: true,
              flowElements: [
                {
                  id: 'StartEvent_1',
                  type: 'event',
                  eventType: 'start',
                  name: 'Start'
                },
                {
                  id: 'UserTask_1',
                  type: 'task',
                  taskType: 'user',
                  name: 'User Task'
                },
                {
                  id: 'ServiceTask_1',
                  type: 'task',
                  taskType: 'service',
                  name: 'Service Task'
                },
                {
                  id: 'ExclusiveGateway_1',
                  type: 'gateway',
                  gatewayType: 'exclusive',
                  name: 'Gateway'
                },
                {
                  id: 'EndEvent_1',
                  type: 'event',
                  eventType: 'end',
                  name: 'End'
                }
              ],
              sequenceFlows: [
                { id: 'Flow_1', sourceRef: 'StartEvent_1', targetRef: 'UserTask_1' },
                { id: 'Flow_2', sourceRef: 'UserTask_1', targetRef: 'ExclusiveGateway_1' },
                { id: 'Flow_3', sourceRef: 'ExclusiveGateway_1', targetRef: 'ServiceTask_1', conditionExpression: '${approved}' },
                { id: 'Flow_4', sourceRef: 'ServiceTask_1', targetRef: 'EndEvent_1' }
              ]
            }]
          }
        };

        const result = await compiler.compileToXml(ir as any);

        expect(result).toContain('<userTask');
        expect(result).toContain('<serviceTask');
        expect(result).toContain('<exclusiveGateway');
        expect(result).toContain('<conditionExpression');
      });

      it('should handle subprocesses', async () => {
        const ir = {
          definitions: {
            id: 'Definitions_1',
            targetNamespace: 'http://bpmn.io/schema/bpmn',
            processes: [{
              id: 'Process_1',
              isExecutable: true,
              flowElements: [
                {
                  id: 'SubProcess_1',
                  type: 'subprocess',
                  subProcessType: 'embedded',
                  name: 'Sub Process',
                  flowElements: [
                    {
                      id: 'StartEvent_1',
                      type: 'event',
                      eventType: 'start'
                    },
                    {
                      id: 'EndEvent_1',
                      type: 'event',
                      eventType: 'end'
                    }
                  ],
                  sequenceFlows: [{
                    id: 'Flow_1',
                    sourceRef: 'StartEvent_1',
                    targetRef: 'EndEvent_1'
                  }]
                }
              ],
              sequenceFlows: []
            }]
          }
        };

        const result = await compiler.compileToXml(ir as any);

        expect(result).toContain('<subProcess');
        expect(result).toContain('<startEvent');
        expect(result).toContain('<endEvent');
      });

      it('should handle event definitions', async () => {
        const ir = {
          definitions: {
            id: 'Definitions_1',
            targetNamespace: 'http://bpmn.io/schema/bpmn',
            processes: [{
              id: 'Process_1',
              isExecutable: true,
              flowElements: [
                {
                  id: 'StartEvent_1',
                  type: 'event',
                  eventType: 'start',
                  eventDefinitions: [{
                    type: 'message',
                    messageRef: 'Message_1'
                  }]
                },
                {
                  id: 'EndEvent_1',
                  type: 'event',
                  eventType: 'end'
                }
              ],
              sequenceFlows: [{
                id: 'Flow_1',
                sourceRef: 'StartEvent_1',
                targetRef: 'EndEvent_1'
              }]
            }]
          }
        };

        const result = await compiler.compileToXml(ir as any);

        expect(result).toContain('<messageEventDefinition');
      });

      it('should handle multiple processes', async () => {
        const ir = {
          definitions: {
            id: 'Definitions_1',
            targetNamespace: 'http://bpmn.io/schema/bpmn',
            processes: [
              {
                id: 'Process_1',
                isExecutable: true,
                flowElements: [{
                  id: 'StartEvent_1',
                  type: 'event',
                  eventType: 'start'
                }],
                sequenceFlows: []
              },
              {
                id: 'Process_2',
                isExecutable: false,
                flowElements: [{
                  id: 'StartEvent_2',
                  type: 'event',
                  eventType: 'start'
                }],
                sequenceFlows: []
              }
            ]
          }
        };

        const result = await compiler.compileToXml(ir as any);

        expect(result).toContain('<process id="Process_1"');
        expect(result).toContain('<process id="Process_2"');
        expect(result).toContain('isExecutable="true"');
        expect(result).toContain('isExecutable="false"');
      });
    });
  });
});
