"use strict";
// Merkle DAG: dsl_gateway_builders
// DSL Gateway Builders - Exclusive/Inclusive/Parallel/EventBased/Complex
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequenceFlowBuilder = exports.ComplexGatewayBuilder = exports.EventBasedGatewayBuilder = exports.ParallelGatewayBuilder = exports.InclusiveGatewayBuilder = exports.ExclusiveGatewayBuilder = exports.BaseGatewayBuilder = void 0;
// Base Gateway Builder
class BaseGatewayBuilder {
    context;
    gateway;
    constructor(context, gateway) {
        this.context = context;
        this.gateway = gateway;
    }
    default(flowId) {
        this.gateway.default = flowId;
        return this;
    }
}
exports.BaseGatewayBuilder = BaseGatewayBuilder;
// Exclusive Gateway Builder (XOR)
class ExclusiveGatewayBuilder extends BaseGatewayBuilder {
}
exports.ExclusiveGatewayBuilder = ExclusiveGatewayBuilder;
// Inclusive Gateway Builder (OR)
class InclusiveGatewayBuilder extends BaseGatewayBuilder {
}
exports.InclusiveGatewayBuilder = InclusiveGatewayBuilder;
// Parallel Gateway Builder (AND)
class ParallelGatewayBuilder extends BaseGatewayBuilder {
}
exports.ParallelGatewayBuilder = ParallelGatewayBuilder;
// Event-based Gateway Builder
class EventBasedGatewayBuilder extends BaseGatewayBuilder {
    instantiate(instantiate = true) {
        this.gateway.instantiate = instantiate;
        return this;
    }
    exclusive() {
        this.gateway.eventGatewayType = 'Exclusive';
        return this;
    }
    parallel() {
        this.gateway.eventGatewayType = 'Parallel';
        return this;
    }
}
exports.EventBasedGatewayBuilder = EventBasedGatewayBuilder;
// Complex Gateway Builder
class ComplexGatewayBuilder extends BaseGatewayBuilder {
    activationCondition(condition) {
        this.gateway.activationCondition = condition;
        return this;
    }
}
exports.ComplexGatewayBuilder = ComplexGatewayBuilder;
// Sequence Flow Builder for conditional flows
class SequenceFlowBuilder {
    context;
    flow;
    constructor(context, flow) {
        this.context = context;
        this.flow = flow;
    }
    condition(expression) {
        this.flow.conditionExpression = expression;
        return this;
    }
    immediate(immediate = true) {
        this.flow.isImmediate = immediate;
        return this;
    }
}
exports.SequenceFlowBuilder = SequenceFlowBuilder;
//# sourceMappingURL=gateways.js.map