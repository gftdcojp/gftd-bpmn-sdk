// Merkle DAG: dsl_event_builders
// DSL Event Builders - Start/End/Intermediate/Boundary Events
// Base Event Builder
export class BaseEventBuilder {
    context;
    event;
    constructor(context, event) {
        this.context = context;
        this.event = event;
    }
    // Common event configurations
    message(messageRef) {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'message',
            messageRef,
        });
        return this;
    }
    signal(signalRef) {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'signal',
            signalRef,
        });
        return this;
    }
    error(errorRef) {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'error',
            errorRef,
        });
        return this;
    }
    timer(config) {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'timer',
            ...config,
        });
        return this;
    }
    compensation(activityRef, waitForCompletion) {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'compensation',
            activityRef,
            waitForCompletion,
        });
        return this;
    }
    conditional(condition) {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'conditional',
            condition,
        });
        return this;
    }
    link(name) {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'link',
            name,
        });
        return this;
    }
    terminate() {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'terminate',
        });
        return this;
    }
    cancel() {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'cancel',
        });
        return this;
    }
    escalation(escalationRef) {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'escalation',
            escalationRef,
        });
        return this;
    }
    multiple() {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'multiple',
        });
        return this;
    }
    parallelMultiple() {
        this.event.eventDefinitions = this.event.eventDefinitions || [];
        this.event.eventDefinitions.push({
            type: 'parallelMultiple',
        });
        return this;
    }
}
// Start Event Builder
export class StartEventBuilder extends BaseEventBuilder {
}
// End Event Builder
export class EndEventBuilder extends BaseEventBuilder {
}
// Intermediate Catch Event Builder
export class IntermediateCatchEventBuilder extends BaseEventBuilder {
}
// Boundary Event Builder
export class BoundaryEventBuilder extends BaseEventBuilder {
    nonInterrupting() {
        // Mutable cast for building
        this.event.cancelActivity = false;
        return this;
    }
    interrupting() {
        // Mutable cast for building
        this.event.cancelActivity = true;
        return this;
    }
}
//# sourceMappingURL=events.js.map