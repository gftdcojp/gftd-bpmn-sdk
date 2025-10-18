// Merkle DAG: bpmn_dsl_builder
// BPMN 2.0 TypeScript DSL - 宣言的モデリング

import type {
  BpmnIR,
  DefinitionsIR,
  ProcessIR,
  EventIR,
  TaskIR,
  GatewayIR,
  SubProcessIR,
  SequenceFlowIR,
  EventDefinitionIR,
  LaneSetIR,
} from '@gftd/bpmn-sdk/core';

// Mutable versions for building
export interface MutableEventIR extends Omit<EventIR, 'eventDefinitions'> {
  eventDefinitions?: EventDefinitionIR[];
}

export interface MutableTaskIR extends Omit<TaskIR, 'name'> {
  name?: string;
}

export interface MutableGatewayIR extends Omit<GatewayIR, 'name'> {
  name?: string;
}

export interface MutableSubProcessIR extends Omit<SubProcessIR, 'name'> {
  name?: string;
}

export interface MutableSequenceFlowIR extends Omit<SequenceFlowIR, 'name'> {
  name?: string;
}


// Import builders
import {
  StartEventBuilder,
  EndEventBuilder,
  IntermediateCatchEventBuilder,
  BoundaryEventBuilder,
  ServiceTaskBuilder,
  UserTaskBuilder,
  ManualTaskBuilder,
  ScriptTaskBuilder,
  BusinessRuleTaskBuilder,
  SendTaskBuilder,
  ReceiveTaskBuilder,
  CallActivityBuilder,
  ExclusiveGatewayBuilder,
  InclusiveGatewayBuilder,
  ParallelGatewayBuilder,
  EventBasedGatewayBuilder,
  ComplexGatewayBuilder,
  EmbeddedSubprocessBuilder,
  SequenceFlowBuilder,
} from './builders';
import { LaneSetBuilder } from './builders/subprocess';

// DSL Context - ビルド中の状態管理
export class DslContext {
  private idCounter = 0;
  private elements = new Map<string, any>();
  private sequenceFlows: SequenceFlowIR[] = [];

  generateId(prefix: string = 'id'): string {
    return `${prefix}_${++this.idCounter}`;
  }

  addElement(id: string, element: any): void {
    this.elements.set(id, element);
  }

  getElement(id: string): any {
    return this.elements.get(id);
  }

  addSequenceFlow(flow: SequenceFlowIR): void {
    this.sequenceFlows.push(flow);
  }

  getSequenceFlows(): SequenceFlowIR[] {
    return [...this.sequenceFlows];
  }

  getElements(): any[] {
    return Array.from(this.elements.values());
  }
}

// Flow Builder - メインエントリーポイント
export function flow(name: string, builder: (f: FlowBuilder) => FlowBuilderResult): BpmnIR {
  const context = new DslContext();
  const flowBuilder = new FlowBuilder(context, name);
  const result = builder(flowBuilder);

  return {
    definitions: {
      id: context.generateId('Definitions'),
      name,
      targetNamespace: 'http://www.gftd.co.jp/bpmn',
      processes: [result.process],
      version: '1.0',
    },
  };
}

// Flow Builder Result
export interface FlowBuilderResult {
  process: ProcessIR;
}

// Collaboration Builder (simplified for now)
export class CollaborationBuilder {
  constructor(private context: DslContext, private name: string) {}

  // Placeholder implementation
  build(): any {
    return { type: 'collaboration', name: this.name };
  }
}


// Flow Builder - プロセス構築のメインクラス
export class FlowBuilder {
  private context: DslContext;
  private processName: string;
  private elements: any[] = [];
  private laneSets: LaneSetIR[] = [];

  constructor(context: DslContext, processName: string) {
    this.context = context;
    this.processName = processName;
  }

  // Process configuration
  process(config: { id?: string; isExecutable?: boolean } = {}): ProcessBuilder {
    const processId = config.id || this.context.generateId('Process');
    return new ProcessBuilder(this.context, processId, this.processName, config.isExecutable ?? true);
  }

  // Collaboration (multi-pool)
  collaboration(name: string): CollaborationBuilder {
    return new CollaborationBuilder(this.context, name);
  }
}

// Process Builder
export class ProcessBuilder {
  private context: DslContext;
  private processId: string;
  private processName: string;
  private isExecutable: boolean;
  private elements: any[] = [];
  private laneSets: LaneSetIR[] = [];

  constructor(context: DslContext, processId: string, processName: string, isExecutable: boolean) {
    this.context = context;
    this.processId = processId;
    this.processName = processName;
    this.isExecutable = isExecutable;
  }

  // Lane sets
  laneSet(name?: string): LaneSetBuilder {
    const laneSetId = this.context.generateId('LaneSet');
    const laneSet: LaneSetIR = {
      id: laneSetId,
      name,
      lanes: [],
    };
    this.laneSets.push(laneSet);
    return new LaneSetBuilder(this.context, laneSet);
  }

  // Events
  startEvent(name?: string): StartEventBuilder {
    const eventId = this.context.generateId('StartEvent');
    const event: MutableEventIR = {
      type: 'event',
      eventType: 'start',
      id: eventId,
      name,
    };
    this.elements.push(event as EventIR);
    this.context.addElement(eventId, event);
    return new StartEventBuilder(this.context, event as EventIR);
  }

  endEvent(name?: string): EndEventBuilder {
    const eventId = this.context.generateId('EndEvent');
    const event: MutableEventIR = {
      type: 'event',
      eventType: 'end',
      id: eventId,
      name,
    };
    this.elements.push(event as EventIR);
    this.context.addElement(eventId, event);
    return new EndEventBuilder(this.context, event as EventIR);
  }

  intermediateCatchEvent(name?: string): IntermediateCatchEventBuilder {
    const eventId = this.context.generateId('IntermediateCatchEvent');
    const event: MutableEventIR = {
      type: 'event',
      eventType: 'intermediate',
      id: eventId,
      name,
    };
    this.elements.push(event as EventIR);
    this.context.addElement(eventId, event);
    return new IntermediateCatchEventBuilder(this.context, event as EventIR);
  }

  boundaryEvent(attachedToRef: string, name?: string): BoundaryEventBuilder {
    const eventId = this.context.generateId('BoundaryEvent');
    const event: MutableEventIR = {
      type: 'event',
      eventType: 'boundary',
      id: eventId,
      name,
      attachedToRef,
      cancelActivity: true, // Default to interrupting
    };
    this.elements.push(event as EventIR);
    this.context.addElement(eventId, event);
    return new BoundaryEventBuilder(this.context, event as EventIR);
  }

  // Tasks
  serviceTask(name?: string): ServiceTaskBuilder {
    const taskId = this.context.generateId('ServiceTask');
    const task: MutableTaskIR = {
      type: 'task',
      taskType: 'service',
      id: taskId,
      name,
    };
    this.elements.push(task as TaskIR);
    this.context.addElement(taskId, task);
    return new ServiceTaskBuilder(this.context, task as TaskIR);
  }

  userTask(name?: string): UserTaskBuilder {
    const taskId = this.context.generateId('UserTask');
    const task: MutableTaskIR = {
      type: 'task',
      taskType: 'user',
      id: taskId,
      name,
    };
    this.elements.push(task as TaskIR);
    this.context.addElement(taskId, task);
    return new UserTaskBuilder(this.context, task as TaskIR);
  }

  manualTask(name?: string): ManualTaskBuilder {
    const taskId = this.context.generateId('ManualTask');
    const task: TaskIR = {
      type: 'task',
      taskType: 'manual',
      id: taskId,
      name,
    };
    this.elements.push(task);
    this.context.addElement(taskId, task);
    return new ManualTaskBuilder(this.context, task);
  }

  scriptTask(name?: string): ScriptTaskBuilder {
    const taskId = this.context.generateId('ScriptTask');
    const task: TaskIR = {
      type: 'task',
      taskType: 'script',
      id: taskId,
      name,
    };
    this.elements.push(task);
    this.context.addElement(taskId, task);
    return new ScriptTaskBuilder(this.context, task);
  }

  businessRuleTask(name?: string): BusinessRuleTaskBuilder {
    const taskId = this.context.generateId('BusinessRuleTask');
    const task: TaskIR = {
      type: 'task',
      taskType: 'businessRule',
      id: taskId,
      name,
    };
    this.elements.push(task);
    this.context.addElement(taskId, task);
    return new BusinessRuleTaskBuilder(this.context, task);
  }

  sendTask(name?: string): SendTaskBuilder {
    const taskId = this.context.generateId('SendTask');
    const task: TaskIR = {
      type: 'task',
      taskType: 'send',
      id: taskId,
      name,
    };
    this.elements.push(task);
    this.context.addElement(taskId, task);
    return new SendTaskBuilder(this.context, task);
  }

  receiveTask(name?: string): ReceiveTaskBuilder {
    const taskId = this.context.generateId('ReceiveTask');
    const task: TaskIR = {
      type: 'task',
      taskType: 'receive',
      id: taskId,
      name,
    };
    this.elements.push(task);
    this.context.addElement(taskId, task);
    return new ReceiveTaskBuilder(this.context, task);
  }

  callActivity(name?: string): CallActivityBuilder {
    const taskId = this.context.generateId('CallActivity');
    const task: TaskIR = {
      type: 'task',
      taskType: 'callActivity',
      id: taskId,
      name,
    };
    this.elements.push(task);
    this.context.addElement(taskId, task);
    return new CallActivityBuilder(this.context, task);
  }

  // Gateways
  exclusiveGateway(name?: string): ExclusiveGatewayBuilder {
    const gatewayId = this.context.generateId('ExclusiveGateway');
    const gateway: GatewayIR = {
      type: 'gateway',
      gatewayType: 'exclusive',
      id: gatewayId,
      name,
    };
    this.elements.push(gateway);
    this.context.addElement(gatewayId, gateway);
    return new ExclusiveGatewayBuilder(this.context, gateway);
  }

  inclusiveGateway(name?: string): InclusiveGatewayBuilder {
    const gatewayId = this.context.generateId('InclusiveGateway');
    const gateway: GatewayIR = {
      type: 'gateway',
      gatewayType: 'inclusive',
      id: gatewayId,
      name,
    };
    this.elements.push(gateway);
    this.context.addElement(gatewayId, gateway);
    return new InclusiveGatewayBuilder(this.context, gateway);
  }

  parallelGateway(name?: string): ParallelGatewayBuilder {
    const gatewayId = this.context.generateId('ParallelGateway');
    const gateway: GatewayIR = {
      type: 'gateway',
      gatewayType: 'parallel',
      id: gatewayId,
      name,
    };
    this.elements.push(gateway);
    this.context.addElement(gatewayId, gateway);
    return new ParallelGatewayBuilder(this.context, gateway);
  }

  eventBasedGateway(name?: string): EventBasedGatewayBuilder {
    const gatewayId = this.context.generateId('EventBasedGateway');
    const gateway: GatewayIR = {
      type: 'gateway',
      gatewayType: 'eventBased',
      id: gatewayId,
      name,
      instantiate: false,
      eventGatewayType: 'Exclusive',
    };
    this.elements.push(gateway);
    this.context.addElement(gatewayId, gateway);
    return new EventBasedGatewayBuilder(this.context, gateway);
  }

  complexGateway(name?: string): ComplexGatewayBuilder {
    const gatewayId = this.context.generateId('ComplexGateway');
    const gateway: GatewayIR = {
      type: 'gateway',
      gatewayType: 'complex',
      id: gatewayId,
      name,
    };
    this.elements.push(gateway);
    this.context.addElement(gatewayId, gateway);
    return new ComplexGatewayBuilder(this.context, gateway);
  }

  // Subprocesses
  embeddedSubprocess(name?: string): EmbeddedSubprocessBuilder {
    const subProcessId = this.context.generateId('SubProcess');
    const subProcess: SubProcessIR = {
      type: 'subprocess',
      subProcessType: 'embedded',
      id: subProcessId,
      name,
      flowElements: [],
      sequenceFlows: [],
    };
    this.elements.push(subProcess);
    this.context.addElement(subProcessId, subProcess);
    return new EmbeddedSubprocessBuilder(this.context, subProcess);
  }

  // Sequence flows
  sequenceFlow(sourceRef: string, targetRef: string, name?: string): SequenceFlowBuilder {
    const flowId = this.context.generateId('SequenceFlow');
    const flow: SequenceFlowIR = {
      id: flowId,
      name,
      sourceRef,
      targetRef,
    };
    this.context.addSequenceFlow(flow);
    return new SequenceFlowBuilder(this.context, flow);
  }

  // Build process
  build(): FlowBuilderResult {
    const process: ProcessIR = {
      id: this.processId,
      name: this.processName,
      isExecutable: this.isExecutable,
      flowElements: this.elements,
      sequenceFlows: this.context.getSequenceFlows(),
      laneSets: this.laneSets.length > 0 ? this.laneSets : undefined,
    };

    return { process };
  }
}
