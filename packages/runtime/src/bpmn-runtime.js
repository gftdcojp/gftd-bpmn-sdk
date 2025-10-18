// Merkle DAG: bpmn_runtime_engine
// BPMN Runtime using bpmn-engine
import { Engine } from 'bpmn-engine';
import { compileToXml } from '@gftd/bpmn-sdk/compiler';
// BPMN Runtime Engine
export class BpmnRuntime {
    engines = new Map();
    eventListeners = new Set();
    /**
     * Deploy BPMN process from IR
     */
    async deployProcess(ir, processId) {
        const xml = await compileToXml(ir);
        const targetProcessId = processId || ir.definitions.processes[0]?.id;
        if (!targetProcessId) {
            throw new Error('No process ID found in BPMN IR');
        }
        // Simplified engine creation
        const engine = Engine({ source: xml });
        this.engines.set(targetProcessId, engine);
        this.emitEvent({
            type: 'start',
            processId: targetProcessId,
            instanceId: '',
            variables: {},
        });
        return targetProcessId;
    }
    /**
     * Start process instance
     */
    async startInstance(processId, options = {}) {
        const engine = this.engines.get(processId);
        if (!engine) {
            throw new Error(`Process ${processId} not found. Call deployProcess first.`);
        }
        const instanceId = options.instanceId || this.generateInstanceId();
        const variables = options.variables || {};
        // Simplified execution
        const execution = await engine.execute({
            variables,
        });
        const context = {
            processId,
            instanceId,
            variables,
            status: 'running',
            currentActivities: [],
            startTime: new Date(),
        };
        // Simplified event setup
        execution.once('end', () => {
            context.status = 'completed';
            context.endTime = new Date();
            this.emitEvent({
                type: 'end',
                processId,
                instanceId,
                output: execution.output,
            });
        });
        return context;
    }
    /**
     * Send signal to process instance (placeholder)
     */
    async signal(processId, instanceId, signalId, payload) {
        // Placeholder implementation
        console.log(`Signal ${signalId} sent to ${processId}:${instanceId}`);
        this.emitEvent({
            type: 'signal',
            processId,
            instanceId,
            signalId,
            payload,
        });
    }
    /**
     * Send message to process instance (placeholder)
     */
    async sendMessage(processId, instanceId, messageId, payload) {
        // Placeholder implementation
        console.log(`Message ${messageId} sent to ${processId}:${instanceId}`);
        this.emitEvent({
            type: 'message',
            processId,
            instanceId,
            messageId,
            payload,
        });
    }
    /**
     * Get execution context (placeholder)
     */
    async getExecutionContext(processId, instanceId) {
        // Placeholder implementation
        return {
            processId,
            instanceId,
            variables: {},
            status: 'running',
            currentActivities: [],
            startTime: new Date(),
        };
    }
    /**
     * Stop process instance (placeholder)
     */
    async stopInstance(processId, instanceId) {
        // Placeholder implementation
        console.log(`Stopped instance ${processId}:${instanceId}`);
    }
    /**
     * Resume stopped process instance (placeholder)
     */
    async resumeInstance(processId, instanceId) {
        // Placeholder implementation
        console.log(`Resumed instance ${processId}:${instanceId}`);
    }
    /**
     * Add event listener
     */
    onEvent(listener) {
        this.eventListeners.add(listener);
    }
    /**
     * Remove event listener
     */
    offEvent(listener) {
        this.eventListeners.delete(listener);
    }
    /**
     * Emit runtime event
     */
    emitEvent(event) {
        for (const listener of this.eventListeners) {
            try {
                listener(event);
            }
            catch (error) {
                console.error('Event listener error:', error);
            }
        }
    }
    /**
     * Generate unique instance ID
     */
    generateInstanceId() {
        return `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
// Convenience functions
export async function deployAndStart(ir, options = {}) {
    const runtime = new BpmnRuntime();
    const deployedProcessId = await runtime.deployProcess(ir, options.processId);
    const context = await runtime.startInstance(deployedProcessId, options);
    return { runtime, context };
}
//# sourceMappingURL=bpmn-runtime.js.map