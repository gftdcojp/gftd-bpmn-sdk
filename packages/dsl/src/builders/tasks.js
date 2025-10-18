// Merkle DAG: dsl_task_builders
// DSL Task Builders - Service/User/Manual/Script/BusinessRule/Send/Receive/CallActivity
// Base Task Builder
export class BaseTaskBuilder {
    context;
    task;
    constructor(context, task) {
        this.context = context;
        this.task = task;
    }
}
// Service Task Builder
export class ServiceTaskBuilder extends BaseTaskBuilder {
    implementation(impl) {
        this.task.implementation = impl;
        return this;
    }
    topic(topic) {
        this.task.topic = topic;
        return this;
    }
    operation(operationRef) {
        this.task.operationRef = operationRef;
        return this;
    }
    javaClass(className) {
        this.task.class = className;
        return this;
    }
    delegateExpression(expression) {
        this.task.delegateExpression = expression;
        return this;
    }
    expression(expression) {
        this.task.expression = expression;
        return this;
    }
    resultVariable(variable) {
        this.task.resultVariable = variable;
        return this;
    }
}
// User Task Builder
export class UserTaskBuilder extends BaseTaskBuilder {
    assignee(assignee) {
        this.task.assignee = assignee;
        return this;
    }
    candidateUsers(users) {
        this.task.candidateUsers = users;
        return this;
    }
    candidateGroups(groups) {
        this.task.candidateGroups = groups;
        return this;
    }
    formKey(formKey) {
        this.task.formKey = formKey;
        return this;
    }
}
// Manual Task Builder
export class ManualTaskBuilder extends BaseTaskBuilder {
}
// Script Task Builder
export class ScriptTaskBuilder extends BaseTaskBuilder {
    script(script) {
        this.task.script = script;
        return this;
    }
    scriptFormat(format) {
        // Note: scriptFormat is not in current TaskIR, might need to add
        return this;
    }
    resultVariable(variable) {
        this.task.resultVariable = variable;
        return this;
    }
}
// Business Rule Task Builder
export class BusinessRuleTaskBuilder extends BaseTaskBuilder {
    decisionRef(decisionRef) {
        this.task.decisionRef = decisionRef;
        return this;
    }
    resultVariable(variable) {
        this.task.resultVariable = variable;
        return this;
    }
}
// Send Task Builder
export class SendTaskBuilder extends BaseTaskBuilder {
    message(messageRef) {
        this.task.messageRef = messageRef;
        return this;
    }
    operation(operationRef) {
        this.task.operationRef = operationRef;
        return this;
    }
}
// Receive Task Builder
export class ReceiveTaskBuilder extends BaseTaskBuilder {
    message(messageRef) {
        this.task.messageRef = messageRef;
        return this;
    }
    operation(operationRef) {
        this.task.operationRef = operationRef;
        return this;
    }
    instantiate(instantiate = true) {
        this.task.instantiate = instantiate;
        return this;
    }
}
// Call Activity Builder
export class CallActivityBuilder extends BaseTaskBuilder {
    calledElement(processId) {
        this.task.calledElement = processId;
        return this;
    }
}
//# sourceMappingURL=tasks.js.map