// Merkle DAG: dsl_task_builders
// DSL Task Builders - Service/User/Manual/Script/BusinessRule/Send/Receive/CallActivity

import type { TaskIR } from '@gftd/bpmn-sdk/core';
import type { DslContext } from '../bpmn-dsl';

// Base Task Builder
export class BaseTaskBuilder {
  protected context: DslContext;
  protected task: TaskIR;

  constructor(context: DslContext, task: TaskIR) {
    this.context = context;
    this.task = task;
  }
}

// Service Task Builder
export class ServiceTaskBuilder extends BaseTaskBuilder {
  implementation(impl: string): this {
    this.task.implementation = impl;
    return this;
  }

  topic(topic: string): this {
    this.task.topic = topic;
    return this;
  }

  operation(operationRef: string): this {
    this.task.operationRef = operationRef;
    return this;
  }

  javaClass(className: string): this {
    this.task.class = className;
    return this;
  }

  delegateExpression(expression: string): this {
    this.task.delegateExpression = expression;
    return this;
  }

  expression(expression: string): this {
    this.task.expression = expression;
    return this;
  }

  resultVariable(variable: string): this {
    this.task.resultVariable = variable;
    return this;
  }
}

// User Task Builder
export class UserTaskBuilder extends BaseTaskBuilder {
  assignee(assignee: string): this {
    this.task.assignee = assignee;
    return this;
  }

  candidateUsers(users: string): this {
    this.task.candidateUsers = users;
    return this;
  }

  candidateGroups(groups: string): this {
    this.task.candidateGroups = groups;
    return this;
  }

  formKey(formKey: string): this {
    this.task.formKey = formKey;
    return this;
  }
}

// Manual Task Builder
export class ManualTaskBuilder extends BaseTaskBuilder {
  // Manual tasks don't have special configurations beyond the base
}

// Script Task Builder
export class ScriptTaskBuilder extends BaseTaskBuilder {
  script(script: string): this {
    this.task.script = script;
    return this;
  }

  scriptFormat(format: string): this {
    // Note: scriptFormat is not in current TaskIR, might need to add
    return this;
  }

  resultVariable(variable: string): this {
    this.task.resultVariable = variable;
    return this;
  }
}

// Business Rule Task Builder
export class BusinessRuleTaskBuilder extends BaseTaskBuilder {
  decisionRef(decisionRef: string): this {
    this.task.decisionRef = decisionRef;
    return this;
  }

  resultVariable(variable: string): this {
    this.task.resultVariable = variable;
    return this;
  }
}

// Send Task Builder
export class SendTaskBuilder extends BaseTaskBuilder {
  message(messageRef: string): this {
    this.task.messageRef = messageRef;
    return this;
  }

  operation(operationRef: string): this {
    this.task.operationRef = operationRef;
    return this;
  }
}

// Receive Task Builder
export class ReceiveTaskBuilder extends BaseTaskBuilder {
  message(messageRef: string): this {
    this.task.messageRef = messageRef;
    return this;
  }

  operation(operationRef: string): this {
    this.task.operationRef = operationRef;
    return this;
  }

  instantiate(instantiate: boolean = true): this {
    this.task.instantiate = instantiate;
    return this;
  }
}

// Call Activity Builder
export class CallActivityBuilder extends BaseTaskBuilder {
  calledElement(processId: string): this {
    this.task.calledElement = processId;
    return this;
  }
}
