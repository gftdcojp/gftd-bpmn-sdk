"use strict";
// Merkle DAG: dsl_subprocess_builders
// DSL SubProcess Builders - Embedded/Event/Transaction/AdHoc
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFlowBuilder = exports.ParticipantBuilder = exports.CollaborationBuilder = exports.LaneBuilder = exports.LaneSetBuilder = exports.AdHocSubprocessBuilder = exports.TransactionSubprocessBuilder = exports.EventSubprocessBuilder = exports.EmbeddedSubprocessBuilder = exports.BaseSubprocessBuilder = void 0;
const bpmn_dsl_1 = require("../bpmn-dsl");
// Base SubProcess Builder
class BaseSubprocessBuilder {
    context;
    subProcess;
    constructor(context, subProcess) {
        this.context = context;
        this.subProcess = subProcess;
    }
    // Add flow elements to subprocess (similar to process builder)
    startEvent(name) {
        // Create a nested process builder for subprocess content
        const nestedProcessId = this.context.generateId('NestedProcess');
        const nestedBuilder = new bpmn_dsl_1.ProcessBuilder(this.context, nestedProcessId, name || 'SubProcess', false // Subprocesses are not executable by themselves
        );
        // The nested builder will add elements to the subprocess
        return nestedBuilder;
    }
}
exports.BaseSubprocessBuilder = BaseSubprocessBuilder;
// Embedded SubProcess Builder
class EmbeddedSubprocessBuilder extends BaseSubprocessBuilder {
}
exports.EmbeddedSubprocessBuilder = EmbeddedSubprocessBuilder;
// Event SubProcess Builder
class EventSubprocessBuilder extends BaseSubprocessBuilder {
    constructor(context, subProcess) {
        super(context, subProcess);
        this.subProcess.triggeredByEvent = true;
    }
}
exports.EventSubprocessBuilder = EventSubprocessBuilder;
// Transaction SubProcess Builder
class TransactionSubprocessBuilder extends BaseSubprocessBuilder {
    compensate() {
        this.subProcess.method = '##compensate';
        return this;
    }
    image() {
        this.subProcess.method = '##image';
        return this;
    }
    store() {
        this.subProcess.method = '##store';
        return this;
    }
}
exports.TransactionSubprocessBuilder = TransactionSubprocessBuilder;
// Ad-hoc SubProcess Builder
class AdHocSubprocessBuilder extends BaseSubprocessBuilder {
    completionCondition(condition) {
        this.subProcess.completionCondition = condition;
        return this;
    }
    parallel() {
        this.subProcess.ordering = 'Parallel';
        return this;
    }
    sequential() {
        this.subProcess.ordering = 'Sequential';
        return this;
    }
    cancelRemainingInstances(cancel = true) {
        this.subProcess.cancelRemainingInstances = cancel;
        return this;
    }
}
exports.AdHocSubprocessBuilder = AdHocSubprocessBuilder;
// Lane Set Builder
class LaneSetBuilder {
    context;
    laneSet;
    constructor(context, laneSet) {
        this.context = context;
        this.laneSet = laneSet;
    }
    lane(name) {
        const laneId = this.context.generateId('Lane');
        const lane = {
            id: laneId,
            name,
            flowNodeRefs: [],
        };
        this.laneSet.lanes.push(lane);
        return new LaneBuilder(this.context, lane);
    }
}
exports.LaneSetBuilder = LaneSetBuilder;
// Lane Builder
class LaneBuilder {
    context;
    lane;
    constructor(context, lane) {
        this.context = context;
        this.lane = lane;
    }
    flowNodeRefs(...refs) {
        this.lane.flowNodeRefs.push(...refs);
        return this;
    }
}
exports.LaneBuilder = LaneBuilder;
// Collaboration Builder (for multi-pool processes)
class CollaborationBuilder {
    context;
    collaborationName;
    participants = [];
    messageFlows = [];
    constructor(context, name) {
        this.context = context;
        this.collaborationName = name;
    }
    participant(name) {
        const participantId = this.context.generateId('Participant');
        const participant = {
            id: participantId,
            name,
        };
        this.participants.push(participant);
        return new ParticipantBuilder(this.context, participant);
    }
    messageFlow(sourceRef, targetRef, name) {
        const flowId = this.context.generateId('MessageFlow');
        const flow = {
            id: flowId,
            name,
            sourceRef,
            targetRef,
        };
        this.messageFlows.push(flow);
        return new MessageFlowBuilder(this.context, flow);
    }
}
exports.CollaborationBuilder = CollaborationBuilder;
// Participant Builder
class ParticipantBuilder {
    context;
    participant;
    constructor(context, participant) {
        this.context = context;
        this.participant = participant;
    }
    processRef(processId) {
        this.participant.processRef = processId;
        return this;
    }
}
exports.ParticipantBuilder = ParticipantBuilder;
// Message Flow Builder
class MessageFlowBuilder {
    context;
    flow;
    constructor(context, flow) {
        this.context = context;
        this.flow = flow;
    }
    messageRef(messageRef) {
        this.flow.messageRef = messageRef;
        return this;
    }
}
exports.MessageFlowBuilder = MessageFlowBuilder;
//# sourceMappingURL=subprocess.js.map