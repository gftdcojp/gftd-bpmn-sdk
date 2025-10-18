// Merkle DAG: dsl_gateway_builders
// DSL Gateway Builders - Exclusive/Inclusive/Parallel/EventBased/Complex

import type { GatewayIR, SequenceFlowIR } from '@gftd/bpmn-sdk/core';
import type { DslContext } from '../bpmn-dsl';

// Base Gateway Builder
export class BaseGatewayBuilder {
  protected context: DslContext;
  protected gateway: GatewayIR;

  constructor(context: DslContext, gateway: GatewayIR) {
    this.context = context;
    this.gateway = gateway;
  }

  default(flowId: string): this {
    this.gateway.default = flowId;
    return this;
  }
}

// Exclusive Gateway Builder (XOR)
export class ExclusiveGatewayBuilder extends BaseGatewayBuilder {
  // Exclusive gateways use default for default flow
}

// Inclusive Gateway Builder (OR)
export class InclusiveGatewayBuilder extends BaseGatewayBuilder {
  // Inclusive gateways use default for default flow
}

// Parallel Gateway Builder (AND)
export class ParallelGatewayBuilder extends BaseGatewayBuilder {
  // Parallel gateways don't have default flows
}

// Event-based Gateway Builder
export class EventBasedGatewayBuilder extends BaseGatewayBuilder {
  instantiate(instantiate: boolean = true): this {
    this.gateway.instantiate = instantiate;
    return this;
  }

  exclusive(): this {
    this.gateway.eventGatewayType = 'Exclusive';
    return this;
  }

  parallel(): this {
    this.gateway.eventGatewayType = 'Parallel';
    return this;
  }
}

// Complex Gateway Builder
export class ComplexGatewayBuilder extends BaseGatewayBuilder {
  activationCondition(condition: string): this {
    this.gateway.activationCondition = condition;
    return this;
  }
}

// Sequence Flow Builder for conditional flows
export class SequenceFlowBuilder {
  private context: DslContext;
  private flow: SequenceFlowIR;

  constructor(context: DslContext, flow: SequenceFlowIR) {
    this.context = context;
    this.flow = flow;
  }

  condition(expression: string): this {
    this.flow.conditionExpression = expression;
    return this;
  }

  immediate(immediate: boolean = true): this {
    this.flow.isImmediate = immediate;
    return this;
  }
}
