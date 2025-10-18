// Merkle DAG: dsl_gateway_builders
// DSL Gateway Builders - Exclusive/Inclusive/Parallel/EventBased/Complex
// Base Gateway Builder
export class BaseGatewayBuilder {
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
// Exclusive Gateway Builder (XOR)
export class ExclusiveGatewayBuilder extends BaseGatewayBuilder {
}
// Inclusive Gateway Builder (OR)
export class InclusiveGatewayBuilder extends BaseGatewayBuilder {
}
// Parallel Gateway Builder (AND)
export class ParallelGatewayBuilder extends BaseGatewayBuilder {
}
// Event-based Gateway Builder
export class EventBasedGatewayBuilder extends BaseGatewayBuilder {
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
// Complex Gateway Builder
export class ComplexGatewayBuilder extends BaseGatewayBuilder {
    activationCondition(condition) {
        this.gateway.activationCondition = condition;
        return this;
    }
}
// Sequence Flow Builder for conditional flows
export class SequenceFlowBuilder {
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
//# sourceMappingURL=gateways.js.map