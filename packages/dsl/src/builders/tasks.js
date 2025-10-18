"use strict";
// Merkle DAG: dsl_task_builders
// DSL Task Builders - Service/User/Manual/Script/BusinessRule/Send/Receive/CallActivity
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallActivityBuilder = exports.ReceiveTaskBuilder = exports.SendTaskBuilder = exports.BusinessRuleTaskBuilder = exports.ScriptTaskBuilder = exports.ManualTaskBuilder = exports.UserTaskBuilder = exports.ServiceTaskBuilder = exports.BaseTaskBuilder = void 0;
// Base Task Builder
class BaseTaskBuilder {
    context;
    task;
    constructor(context, task) {
        this.context = context;
        this.task = task;
    }
}
exports.BaseTaskBuilder = BaseTaskBuilder;
// Service Task Builder
class ServiceTaskBuilder extends BaseTaskBuilder {
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
exports.ServiceTaskBuilder = ServiceTaskBuilder;
// User Task Builder
class UserTaskBuilder extends BaseTaskBuilder {
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
exports.UserTaskBuilder = UserTaskBuilder;
// Manual Task Builder
class ManualTaskBuilder extends BaseTaskBuilder {
}
exports.ManualTaskBuilder = ManualTaskBuilder;
// Script Task Builder
class ScriptTaskBuilder extends BaseTaskBuilder {
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
exports.ScriptTaskBuilder = ScriptTaskBuilder;
// Business Rule Task Builder
class BusinessRuleTaskBuilder extends BaseTaskBuilder {
    decisionRef(decisionRef) {
        this.task.decisionRef = decisionRef;
        return this;
    }
    resultVariable(variable) {
        this.task.resultVariable = variable;
        return this;
    }
}
exports.BusinessRuleTaskBuilder = BusinessRuleTaskBuilder;
// Send Task Builder
class SendTaskBuilder extends BaseTaskBuilder {
    message(messageRef) {
        this.task.messageRef = messageRef;
        return this;
    }
    operation(operationRef) {
        this.task.operationRef = operationRef;
        return this;
    }
}
exports.SendTaskBuilder = SendTaskBuilder;
// Receive Task Builder
class ReceiveTaskBuilder extends BaseTaskBuilder {
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
exports.ReceiveTaskBuilder = ReceiveTaskBuilder;
// Call Activity Builder
class CallActivityBuilder extends BaseTaskBuilder {
    calledElement(processId) {
        this.task.calledElement = processId;
        return this;
    }
}
exports.CallActivityBuilder = CallActivityBuilder;
//# sourceMappingURL=tasks.js.map