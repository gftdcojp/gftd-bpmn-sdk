// Merkle DAG: bpmn_runtime_engine
// BPMN Runtime using bpmn-engine

import { Engine } from 'bpmn-engine';
import type { BpmnIR } from '@gftd/bpmn-sdk/core';
import { compileToXml } from '@gftd/bpmn-sdk/compiler';

// Runtime execution context
export interface ExecutionContext {
  processId: string;
  instanceId: string;
  variables: Record<string, any>;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  currentActivities: string[];
  startTime: Date;
  endTime?: Date;
}

// Runtime event types
export type RuntimeEvent =
  | { type: 'start'; processId: string; instanceId: string; variables: Record<string, any> }
  | { type: 'end'; processId: string; instanceId: string; output: any }
  | { type: 'activity.start'; processId: string; instanceId: string; activityId: string; activityType: string }
  | { type: 'activity.end'; processId: string; instanceId: string; activityId: string; activityType: string }
  | { type: 'activity.wait'; processId: string; instanceId: string; activityId: string; activityType: string }
  | { type: 'activity.throw'; processId: string; instanceId: string; activityId: string; activityType: string; message?: any }
  | { type: 'timer'; processId: string; instanceId: string; timerId: string; delay: number }
  | { type: 'signal'; processId: string; instanceId: string; signalId: string; payload?: any }
  | { type: 'message'; processId: string; instanceId: string; messageId: string; payload?: any }
  | { type: 'error'; processId: string; instanceId: string; error: Error; activityId?: string };

// BPMN Runtime Engine
export class BpmnRuntime {
  private engines = new Map<string, Engine>();
  private eventListeners = new Set<(event: RuntimeEvent) => void>();

  /**
   * Deploy BPMN process from IR
   */
  async deployProcess(ir: BpmnIR, processId?: string): Promise<string> {
    const xml = await compileToXml(ir);
    const targetProcessId = processId || ir.definitions.processes[0]?.id;

    if (!targetProcessId) {
      throw new Error('No process ID found in BPMN IR');
    }

    const engine = Engine.fromXML(xml);
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
  async startInstance(
    processId: string,
    options: {
      instanceId?: string;
      variables?: Record<string, any>;
      businessKey?: string;
    } = {}
  ): Promise<ExecutionContext> {
    const engine = this.engines.get(processId);
    if (!engine) {
      throw new Error(`Process ${processId} not found. Call deployProcess first.`);
    }

    const instanceId = options.instanceId || this.generateInstanceId();
    const variables = options.variables || {};

    const execution = await engine.execute({
      instanceId,
      variables,
      businessKey: options.businessKey,
    });

    const context: ExecutionContext = {
      processId,
      instanceId,
      variables,
      status: 'running',
      currentActivities: [],
      startTime: new Date(),
    };

    // Set up event listeners
    this.setupExecutionListeners(execution, context);

    // Wait for completion or first wait state
    await execution.waitFor('end');

    context.status = execution.completed ? 'completed' : 'running';
    context.endTime = new Date();

    return context;
  }

  /**
   * Send signal to process instance
   */
  async signal(
    processId: string,
    instanceId: string,
    signalId: string,
    payload?: any
  ): Promise<void> {
    const engine = this.engines.get(processId);
    if (!engine) {
      throw new Error(`Process ${processId} not found`);
    }

    const execution = await engine.getExecution(instanceId);
    if (!execution) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    await execution.signal(signalId, payload);

    this.emitEvent({
      type: 'signal',
      processId,
      instanceId,
      signalId,
      payload,
    });
  }

  /**
   * Send message to process instance
   */
  async sendMessage(
    processId: string,
    instanceId: string,
    messageId: string,
    payload?: any
  ): Promise<void> {
    const engine = this.engines.get(processId);
    if (!engine) {
      throw new Error(`Process ${processId} not found`);
    }

    const execution = await engine.getExecution(instanceId);
    if (!execution) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    await execution.sendMessage(messageId, payload);

    this.emitEvent({
      type: 'message',
      processId,
      instanceId,
      messageId,
      payload,
    });
  }

  /**
   * Get execution context
   */
  async getExecutionContext(processId: string, instanceId: string): Promise<ExecutionContext | null> {
    const engine = this.engines.get(processId);
    if (!engine) return null;

    const execution = await engine.getExecution(instanceId);
    if (!execution) return null;

    return {
      processId,
      instanceId,
      variables: execution.variables,
      status: execution.completed ? 'completed' : execution.stopped ? 'stopped' : 'running',
      currentActivities: execution.activity?.id ? [execution.activity.id] : [],
      startTime: execution.startedAt || new Date(),
      endTime: execution.completedAt,
    };
  }

  /**
   * Stop process instance
   */
  async stopInstance(processId: string, instanceId: string): Promise<void> {
    const engine = this.engines.get(processId);
    if (!engine) {
      throw new Error(`Process ${processId} not found`);
    }

    const execution = await engine.getExecution(instanceId);
    if (execution) {
      await execution.stop();
    }
  }

  /**
   * Resume stopped process instance
   */
  async resumeInstance(processId: string, instanceId: string): Promise<void> {
    const engine = this.engines.get(processId);
    if (!engine) {
      throw new Error(`Process ${processId} not found`);
    }

    const execution = await engine.getExecution(instanceId);
    if (execution) {
      await execution.resume();
    }
  }

  /**
   * Add event listener
   */
  onEvent(listener: (event: RuntimeEvent) => void): void {
    this.eventListeners.add(listener);
  }

  /**
   * Remove event listener
   */
  offEvent(listener: (event: RuntimeEvent) => void): void {
    this.eventListeners.delete(listener);
  }

  /**
   * Set up execution event listeners
   */
  private setupExecutionListeners(execution: any, context: ExecutionContext): void {
    execution.on('start', (element: any) => {
      this.emitEvent({
        type: 'activity.start',
        processId: context.processId,
        instanceId: context.instanceId,
        activityId: element.id,
        activityType: element.type,
      });
    });

    execution.on('end', (element: any) => {
      this.emitEvent({
        type: 'activity.end',
        processId: context.processId,
        instanceId: context.instanceId,
        activityId: element.id,
        activityType: element.type,
      });
    });

    execution.on('wait', (element: any) => {
      this.emitEvent({
        type: 'activity.wait',
        processId: context.processId,
        instanceId: context.instanceId,
        activityId: element.id,
        activityType: element.type,
      });
    });

    execution.on('throw', (element: any, error: any) => {
      this.emitEvent({
        type: 'activity.throw',
        processId: context.processId,
        instanceId: context.instanceId,
        activityId: element.id,
        activityType: element.type,
        message: error,
      });
    });

    execution.on('completed', (output: any) => {
      this.emitEvent({
        type: 'end',
        processId: context.processId,
        instanceId: context.instanceId,
        output,
      });
    });

    execution.on('error', (error: Error, element?: any) => {
      this.emitEvent({
        type: 'error',
        processId: context.processId,
        instanceId: context.instanceId,
        error,
        activityId: element?.id,
      });
    });
  }

  /**
   * Emit runtime event
   */
  private emitEvent(event: RuntimeEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    }
  }

  /**
   * Generate unique instance ID
   */
  private generateInstanceId(): string {
    return `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Convenience functions
export async function deployAndStart(
  ir: BpmnIR,
  options: {
    processId?: string;
    instanceId?: string;
    variables?: Record<string, any>;
    businessKey?: string;
  } = {}
): Promise<{ runtime: BpmnRuntime; context: ExecutionContext }> {
  const runtime = new BpmnRuntime();
  const deployedProcessId = await runtime.deployProcess(ir, options.processId);
  const context = await runtime.startInstance(deployedProcessId, options);

  return { runtime, context };
}
