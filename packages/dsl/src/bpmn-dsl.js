"use strict";
// Merkle DAG: bpmn_dsl_builder
// BPMN 2.0 TypeScript DSL - 宣言的モデリング
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessBuilder = exports.FlowBuilder = exports.CollaborationBuilder = exports.DslContext = void 0;
exports.flow = flow;
// Import builders
const builders_1 = require("./builders");
const subprocess_1 = require("./builders/subprocess");
// DSL Context - ビルド中の状態管理
class DslContext {
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
exports.DslContext = DslContext;
// Flow Builder - メインエントリーポイント
function flow(name, builder) {
    const context = new DslContext();
    const flowBuilder = new FlowBuilder(context, name);
    builder(flowBuilder);
    const result = flowBuilder.build();
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
class CollaborationBuilder {
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
exports.CollaborationBuilder = CollaborationBuilder;
// Flow Builder - プロセス構築のメインクラス
class FlowBuilder {
    context;
    processName;
    elements = [];
    laneSets = [];
    _processBuilder;
    constructor(context, processName) {
        this.context = context;
        this.processName = processName;
    }
    process(idOrConfig, callback) {
        let config = {};
        let actualCallback;
        if (typeof idOrConfig === 'function') {
            // process(callback)
            actualCallback = idOrConfig;
        }
        else if (typeof idOrConfig === 'string') {
            // process(id, callback)
            config.id = idOrConfig;
            actualCallback = callback;
        }
        else if (idOrConfig && typeof idOrConfig === 'object') {
            // process(config, callback)
            config = idOrConfig;
            actualCallback = callback;
        }
        else {
            throw new Error('Invalid arguments for process method');
        }
        const processId = config.id || this.context.generateId('Process');
        const processBuilder = new ProcessBuilder(this.context, processId, this.processName, config.isExecutable ?? true);
        // Store reference to the process builder for building
        this._processBuilder = processBuilder;
        // Call the callback with the process builder if provided
        if (actualCallback) {
            actualCallback(processBuilder);
        }
    }
    // Collaboration (multi-pool)
    collaboration(name) {
        return new CollaborationBuilder(this.context, name);
    }
    // Build the flow
    build() {
        if (this._processBuilder) {
            return this._processBuilder.build();
        }
        return {
            process: {
                id: this.processName,
                isExecutable: true,
                flowElements: this.context.getElements(),
                sequenceFlows: this.context.getSequenceFlows(),
                laneSets: this.laneSets.length > 0 ? this.laneSets : undefined,
            }
        };
    }
}
exports.FlowBuilder = FlowBuilder;
// Process Builder
class ProcessBuilder {
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
        return new subprocess_1.LaneSetBuilder(this.context, laneSet);
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
        return new builders_1.StartEventBuilder(this.context, event);
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
        return new builders_1.EndEventBuilder(this.context, event);
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
        return new builders_1.IntermediateCatchEventBuilder(this.context, event);
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
        return new builders_1.BoundaryEventBuilder(this.context, event);
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
        return new builders_1.ServiceTaskBuilder(this.context, task);
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
        return new builders_1.UserTaskBuilder(this.context, task);
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
        return new builders_1.ManualTaskBuilder(this.context, task);
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
        return new builders_1.ScriptTaskBuilder(this.context, task);
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
        return new builders_1.BusinessRuleTaskBuilder(this.context, task);
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
        return new builders_1.SendTaskBuilder(this.context, task);
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
        return new builders_1.ReceiveTaskBuilder(this.context, task);
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
        return new builders_1.CallActivityBuilder(this.context, task);
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
        return new builders_1.ExclusiveGatewayBuilder(this.context, gateway);
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
        return new builders_1.InclusiveGatewayBuilder(this.context, gateway);
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
        return new builders_1.ParallelGatewayBuilder(this.context, gateway);
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
        return new builders_1.EventBasedGatewayBuilder(this.context, gateway);
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
        return new builders_1.ComplexGatewayBuilder(this.context, gateway);
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
        return new builders_1.EmbeddedSubprocessBuilder(this.context, subProcess);
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
        return new builders_1.SequenceFlowBuilder(this.context, flow);
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
exports.ProcessBuilder = ProcessBuilder;
//# sourceMappingURL=bpmn-dsl.js.map