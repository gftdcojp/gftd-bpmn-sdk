// Merkle DAG: bpmn_dsl_builder
// BPMN 2.0 TypeScript DSL - 宣言的モデリング
// Import builders
import { StartEventBuilder, EndEventBuilder, IntermediateCatchEventBuilder, BoundaryEventBuilder, ServiceTaskBuilder, UserTaskBuilder, ManualTaskBuilder, ScriptTaskBuilder, BusinessRuleTaskBuilder, SendTaskBuilder, ReceiveTaskBuilder, CallActivityBuilder, ExclusiveGatewayBuilder, InclusiveGatewayBuilder, ParallelGatewayBuilder, EventBasedGatewayBuilder, ComplexGatewayBuilder, EmbeddedSubprocessBuilder, SequenceFlowBuilder, } from './builders';
import { LaneSetBuilder } from './builders/subprocess';
// DSL Context - ビルド中の状態管理
export class DslContext {
    idCounter = 0;
    elements = new Map();
    sequenceFlows = [];
    generateId(prefix = 'id') {
        return `${prefix}_${++this.idCounter}`;
    }
    addElement(id, element) {
        this.elements.set(id, element);
    }
    getElement(id) {
        return this.elements.get(id);
    }
    addSequenceFlow(flow) {
        this.sequenceFlows.push(flow);
    }
    getSequenceFlows() {
        return [...this.sequenceFlows];
    }
    getElements() {
        return Array.from(this.elements.values());
    }
}
// Flow Builder - メインエントリーポイント
export function flow(name, builder) {
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
// Collaboration Builder (simplified for now)
export class CollaborationBuilder {
    context;
    name;
    constructor(context, name) {
        this.context = context;
        this.name = name;
    }
    // Placeholder implementation
    build() {
        return { type: 'collaboration', name: this.name };
    }
}
// Flow Builder - プロセス構築のメインクラス
export class FlowBuilder {
    context;
    processName;
    elements = [];
    laneSets = [];
    constructor(context, processName) {
        this.context = context;
        this.processName = processName;
    }
    // Process configuration
    process(config = {}) {
        const processId = config.id || this.context.generateId('Process');
        return new ProcessBuilder(this.context, processId, this.processName, config.isExecutable ?? true);
    }
    // Collaboration (multi-pool)
    collaboration(name) {
        return new CollaborationBuilder(this.context, name);
    }
}
// Process Builder
export class ProcessBuilder {
    context;
    processId;
    processName;
    isExecutable;
    elements = [];
    laneSets = [];
    constructor(context, processId, processName, isExecutable) {
        this.context = context;
        this.processId = processId;
        this.processName = processName;
        this.isExecutable = isExecutable;
    }
    // Lane sets
    laneSet(name) {
        const laneSetId = this.context.generateId('LaneSet');
        const laneSet = {
            id: laneSetId,
            name,
            lanes: [],
        };
        this.laneSets.push(laneSet);
        return new LaneSetBuilder(this.context, laneSet);
    }
    // Events
    startEvent(name) {
        const eventId = this.context.generateId('StartEvent');
        const event = {
            type: 'event',
            eventType: 'start',
            id: eventId,
            name,
        };
        this.elements.push(event);
        this.context.addElement(eventId, event);
        return new StartEventBuilder(this.context, event);
    }
    endEvent(name) {
        const eventId = this.context.generateId('EndEvent');
        const event = {
            type: 'event',
            eventType: 'end',
            id: eventId,
            name,
        };
        this.elements.push(event);
        this.context.addElement(eventId, event);
        return new EndEventBuilder(this.context, event);
    }
    intermediateCatchEvent(name) {
        const eventId = this.context.generateId('IntermediateCatchEvent');
        const event = {
            type: 'event',
            eventType: 'intermediate',
            id: eventId,
            name,
        };
        this.elements.push(event);
        this.context.addElement(eventId, event);
        return new IntermediateCatchEventBuilder(this.context, event);
    }
    boundaryEvent(attachedToRef, name) {
        const eventId = this.context.generateId('BoundaryEvent');
        const event = {
            type: 'event',
            eventType: 'boundary',
            id: eventId,
            name,
            attachedToRef,
            cancelActivity: true, // Default to interrupting
        };
        this.elements.push(event);
        this.context.addElement(eventId, event);
        return new BoundaryEventBuilder(this.context, event);
    }
    // Tasks
    serviceTask(name) {
        const taskId = this.context.generateId('ServiceTask');
        const task = {
            type: 'task',
            taskType: 'service',
            id: taskId,
            name,
        };
        this.elements.push(task);
        this.context.addElement(taskId, task);
        return new ServiceTaskBuilder(this.context, task);
    }
    userTask(name) {
        const taskId = this.context.generateId('UserTask');
        const task = {
            type: 'task',
            taskType: 'user',
            id: taskId,
            name,
        };
        this.elements.push(task);
        this.context.addElement(taskId, task);
        return new UserTaskBuilder(this.context, task);
    }
    manualTask(name) {
        const taskId = this.context.generateId('ManualTask');
        const task = {
            type: 'task',
            taskType: 'manual',
            id: taskId,
            name,
        };
        this.elements.push(task);
        this.context.addElement(taskId, task);
        return new ManualTaskBuilder(this.context, task);
    }
    scriptTask(name) {
        const taskId = this.context.generateId('ScriptTask');
        const task = {
            type: 'task',
            taskType: 'script',
            id: taskId,
            name,
        };
        this.elements.push(task);
        this.context.addElement(taskId, task);
        return new ScriptTaskBuilder(this.context, task);
    }
    businessRuleTask(name) {
        const taskId = this.context.generateId('BusinessRuleTask');
        const task = {
            type: 'task',
            taskType: 'businessRule',
            id: taskId,
            name,
        };
        this.elements.push(task);
        this.context.addElement(taskId, task);
        return new BusinessRuleTaskBuilder(this.context, task);
    }
    sendTask(name) {
        const taskId = this.context.generateId('SendTask');
        const task = {
            type: 'task',
            taskType: 'send',
            id: taskId,
            name,
        };
        this.elements.push(task);
        this.context.addElement(taskId, task);
        return new SendTaskBuilder(this.context, task);
    }
    receiveTask(name) {
        const taskId = this.context.generateId('ReceiveTask');
        const task = {
            type: 'task',
            taskType: 'receive',
            id: taskId,
            name,
        };
        this.elements.push(task);
        this.context.addElement(taskId, task);
        return new ReceiveTaskBuilder(this.context, task);
    }
    callActivity(name) {
        const taskId = this.context.generateId('CallActivity');
        const task = {
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
    exclusiveGateway(name) {
        const gatewayId = this.context.generateId('ExclusiveGateway');
        const gateway = {
            type: 'gateway',
            gatewayType: 'exclusive',
            id: gatewayId,
            name,
        };
        this.elements.push(gateway);
        this.context.addElement(gatewayId, gateway);
        return new ExclusiveGatewayBuilder(this.context, gateway);
    }
    inclusiveGateway(name) {
        const gatewayId = this.context.generateId('InclusiveGateway');
        const gateway = {
            type: 'gateway',
            gatewayType: 'inclusive',
            id: gatewayId,
            name,
        };
        this.elements.push(gateway);
        this.context.addElement(gatewayId, gateway);
        return new InclusiveGatewayBuilder(this.context, gateway);
    }
    parallelGateway(name) {
        const gatewayId = this.context.generateId('ParallelGateway');
        const gateway = {
            type: 'gateway',
            gatewayType: 'parallel',
            id: gatewayId,
            name,
        };
        this.elements.push(gateway);
        this.context.addElement(gatewayId, gateway);
        return new ParallelGatewayBuilder(this.context, gateway);
    }
    eventBasedGateway(name) {
        const gatewayId = this.context.generateId('EventBasedGateway');
        const gateway = {
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
    complexGateway(name) {
        const gatewayId = this.context.generateId('ComplexGateway');
        const gateway = {
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
    embeddedSubprocess(name) {
        const subProcessId = this.context.generateId('SubProcess');
        const subProcess = {
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
    sequenceFlow(sourceRef, targetRef, name) {
        const flowId = this.context.generateId('SequenceFlow');
        const flow = {
            id: flowId,
            name,
            sourceRef,
            targetRef,
        };
        this.context.addSequenceFlow(flow);
        return new SequenceFlowBuilder(this.context, flow);
    }
    // Build process
    build() {
        const process = {
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
//# sourceMappingURL=bpmn-dsl.js.map