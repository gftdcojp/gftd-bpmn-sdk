// Merkle DAG: bpmn_compiler
// BPMN 2.0 IR → XML Compiler using bpmn-moddle

// Mock implementation for now - TODO: Implement full moddle integration
// import * as BpmnModdle from 'bpmn-moddle';
// import * as moddleXml from 'moddle-xml';
import type {
  BpmnIR,
  DefinitionsIR,
  ProcessIR,
  FlowElementIR,
  EventIR,
  TaskIR,
  GatewayIR,
  SubProcessIR,
  SequenceFlowIR,
  EventDefinitionIR,
} from '@gftd/bpmn-sdk/core';

// BPMN Compiler - Converts IR to BPMN 2.0 XML
export class BpmnCompiler {
  private moddle: BpmnModdle;

  constructor() {
    this.moddle = new BpmnModdle();
  }

  /**
   * Compile BPMN IR to BPMN 2.0 XML string
   */
  async compileToXml(ir: BpmnIR): Promise<string> {
    // TODO: Implement full BPMN XML compilation
    // For now, return a minimal valid BPMN XML for testing
    const processId = ir.definitions.processes[0]?.id || 'Process_1';
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${processId}" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_1</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`;
    return xml;
  }

  /**
   * Create BPMN Definitions element from IR
   */
  private async createDefinitions(definitionsIR: DefinitionsIR): Promise<any> {
    const definitions = this.moddle.create('bpmn:Definitions', {
      id: definitionsIR.id,
      name: definitionsIR.name,
      targetNamespace: definitionsIR.targetNamespace,
      exporter: 'gftd-bpmn-sdk',
      exporterVersion: definitionsIR.version || '1.0',
    });

    // Create root elements
    definitions.rootElements = [];

    // Add processes
    for (const processIR of definitionsIR.processes) {
      const process = await this.createProcess(processIR);
      definitions.rootElements.push(process);
    }

    // Add collaborations if any
    if (definitionsIR.collaborations) {
      for (const collaborationIR of definitionsIR.collaborations) {
        const collaboration = await this.createCollaboration(collaborationIR);
        definitions.rootElements.push(collaboration);
      }
    }

    // Add messages
    if (definitionsIR.messages) {
      definitions.rootElements.push(...definitionsIR.messages);
    }

    // Add signals
    if (definitionsIR.signals) {
      definitions.rootElements.push(...definitionsIR.signals);
    }

    // Add errors
    if (definitionsIR.errors) {
      definitions.rootElements.push(...definitionsIR.errors);
    }

    // Add escalations
    if (definitionsIR.escalations) {
      definitions.rootElements.push(...definitionsIR.escalations);
    }

    return definitions;
  }

  /**
   * Create BPMN Process element from IR
   */
  private async createProcess(processIR: ProcessIR): Promise<any> {
    const process = this.moddle.create('bpmn:Process', {
      id: processIR.id,
      name: processIR.name,
      isExecutable: processIR.isExecutable,
    });

    // Add flow elements
    process.flowElements = [];
    for (const elementIR of processIR.flowElements) {
      const element = await this.createFlowElement(elementIR);
      process.flowElements.push(element);
    }

    // Add sequence flows
    for (const flowIR of processIR.sequenceFlows) {
      const flow = this.createSequenceFlow(flowIR);
      process.flowElements.push(flow);
    }

    // Add lane sets if any
    if (processIR.laneSets) {
      process.laneSets = processIR.laneSets.map(laneSet => this.createLaneSet(laneSet));
    }

    return process;
  }

  /**
   * Create flow element from IR
   */
  private async createFlowElement(elementIR: FlowElementIR): Promise<any> {
    switch (elementIR.type) {
      case 'event':
        return this.createEvent(elementIR as EventIR);
      case 'task':
        return this.createTask(elementIR as TaskIR);
      case 'gateway':
        return this.createGateway(elementIR as GatewayIR);
      case 'subprocess':
        return await this.createSubProcess(elementIR as SubProcessIR);
      case 'dataObject':
        return this.createDataObject(elementIR);
      default:
        throw new Error(`Unknown flow element type: ${(elementIR as any).type}`);
    }
  }

  /**
   * Create BPMN Event element from IR
   */
  private createEvent(eventIR: EventIR): any {
    const eventTypeMap = {
      start: 'bpmn:StartEvent',
      end: 'bpmn:EndEvent',
      intermediate: 'bpmn:IntermediateCatchEvent',
      boundary: 'bpmn:BoundaryEvent',
    };

    const event = this.moddle.create(eventTypeMap[eventIR.eventType], {
      id: eventIR.id,
      name: eventIR.name,
    });

    // Add event definitions
    if (eventIR.eventDefinitions) {
      event.eventDefinitions = eventIR.eventDefinitions.map(def => this.createEventDefinition(def));
    }

    // Boundary event specific properties
    if (eventIR.eventType === 'boundary') {
      event.attachedToRef = this.moddle.create('bpmn:Activity', { id: eventIR.attachedToRef });
      event.cancelActivity = eventIR.cancelActivity ?? true;
    }

    return event;
  }

  /**
   * Create event definition from IR
   */
  private createEventDefinition(defIR: EventDefinitionIR): any {
    switch (defIR.type) {
      case 'message':
        return this.moddle.create('bpmn:MessageEventDefinition', {
          messageRef: defIR.messageRef ? this.moddle.create('bpmn:Message', { id: defIR.messageRef }) : undefined,
        });
      case 'timer':
        return this.moddle.create('bpmn:TimerEventDefinition', {
          timeDate: defIR.timeDate,
          timeCycle: defIR.timeCycle,
          timeDuration: defIR.timeDuration,
        });
      case 'signal':
        return this.moddle.create('bpmn:SignalEventDefinition', {
          signalRef: defIR.signalRef ? this.moddle.create('bpmn:Signal', { id: defIR.signalRef }) : undefined,
        });
      case 'error':
        return this.moddle.create('bpmn:ErrorEventDefinition', {
          errorRef: defIR.errorRef ? this.moddle.create('bpmn:Error', { id: defIR.errorRef }) : undefined,
        });
      case 'escalation':
        return this.moddle.create('bpmn:EscalationEventDefinition', {
          escalationRef: defIR.escalationRef ? this.moddle.create('bpmn:Escalation', { id: defIR.escalationRef }) : undefined,
        });
      case 'compensation':
        return this.moddle.create('bpmn:CompensationEventDefinition', {
          activityRef: defIR.activityRef,
          waitForCompletion: defIR.waitForCompletion,
        });
      case 'conditional':
        return this.moddle.create('bpmn:ConditionalEventDefinition', {
          condition: this.moddle.create('bpmn:FormalExpression', { body: defIR.condition }),
        });
      case 'link':
        return this.moddle.create('bpmn:LinkEventDefinition', {
          name: defIR.name,
        });
      case 'terminate':
        return this.moddle.create('bpmn:TerminateEventDefinition');
      case 'cancel':
        return this.moddle.create('bpmn:CancelEventDefinition');
      case 'multiple':
        return this.moddle.create('bpmn:MultipleEventDefinition');
      case 'parallelMultiple':
        return this.moddle.create('bpmn:ParallelMultipleEventDefinition');
      default:
        throw new Error(`Unknown event definition type: ${(defIR as any).type}`);
    }
  }

  /**
   * Create BPMN Task element from IR
   */
  private createTask(taskIR: TaskIR): any {
    const taskTypeMap = {
      service: 'bpmn:ServiceTask',
      user: 'bpmn:UserTask',
      manual: 'bpmn:ManualTask',
      script: 'bpmn:ScriptTask',
      businessRule: 'bpmn:BusinessRuleTask',
      send: 'bpmn:SendTask',
      receive: 'bpmn:ReceiveTask',
      callActivity: 'bpmn:CallActivity',
    };

    const task = this.moddle.create(taskTypeMap[taskIR.taskType], {
      id: taskIR.id,
      name: taskIR.name,
    });

    // Task-specific properties
    if (taskIR.implementation) task.implementation = taskIR.implementation;
    if (taskIR.topic) task.topic = taskIR.topic;
    if (taskIR.operationRef) task.operationRef = this.moddle.create('bpmn:Operation', { id: taskIR.operationRef });
    if (taskIR.class) task.class = taskIR.class;
    if (taskIR.delegateExpression) task.delegateExpression = taskIR.delegateExpression;
    if (taskIR.expression) task.expression = taskIR.expression;
    if (taskIR.resultVariable) task.resultVariable = taskIR.resultVariable;
    if (taskIR.assignee) task.assignee = taskIR.assignee;
    if (taskIR.candidateUsers) task.candidateUsers = taskIR.candidateUsers;
    if (taskIR.candidateGroups) task.candidateGroups = taskIR.candidateGroups;
    if (taskIR.formKey) task.formKey = taskIR.formKey;
    if (taskIR.script) task.script = taskIR.script;
    if (taskIR.decisionRef) task.decisionRef = taskIR.decisionRef;
    if (taskIR.messageRef) task.messageRef = this.moddle.create('bpmn:Message', { id: taskIR.messageRef });
    if (taskIR.calledElement) task.calledElement = taskIR.calledElement;
    if (taskIR.instantiate !== undefined) task.instantiate = taskIR.instantiate;

    return task;
  }

  /**
   * Create BPMN Gateway element from IR
   */
  private createGateway(gatewayIR: GatewayIR): any {
    const gatewayTypeMap = {
      exclusive: 'bpmn:ExclusiveGateway',
      inclusive: 'bpmn:InclusiveGateway',
      parallel: 'bpmn:ParallelGateway',
      eventBased: 'bpmn:EventBasedGateway',
      complex: 'bpmn:ComplexGateway',
    };

    const gateway = this.moddle.create(gatewayTypeMap[gatewayIR.gatewayType], {
      id: gatewayIR.id,
      name: gatewayIR.name,
    });

    // Gateway-specific properties
    if (gatewayIR.default) gateway.default = this.moddle.create('bpmn:SequenceFlow', { id: gatewayIR.default });
    if (gatewayIR.instantiate !== undefined) gateway.instantiate = gatewayIR.instantiate;
    if (gatewayIR.eventGatewayType) gateway.eventGatewayType = gatewayIR.eventGatewayType;
    if (gatewayIR.activationCondition) {
      gateway.activationCondition = this.moddle.create('bpmn:FormalExpression', {
        body: gatewayIR.activationCondition
      });
    }

    return gateway;
  }

  /**
   * Create BPMN SubProcess element from IR
   */
  private async createSubProcess(subProcessIR: SubProcessIR): Promise<any> {
    const subProcessTypeMap = {
      embedded: 'bpmn:SubProcess',
      event: 'bpmn:SubProcess',
      transaction: 'bpmn:Transaction',
      adHoc: 'bpmn:AdHocSubProcess',
    };

    const subProcess = this.moddle.create(subProcessTypeMap[subProcessIR.subProcessType], {
      id: subProcessIR.id,
      name: subProcessIR.name,
      triggeredByEvent: subProcessIR.triggeredByEvent,
    });

    // Add flow elements
    subProcess.flowElements = [];
    for (const elementIR of subProcessIR.flowElements) {
      const element = await this.createFlowElement(elementIR);
      subProcess.flowElements.push(element);
    }

    // Add sequence flows
    for (const flowIR of subProcessIR.sequenceFlows) {
      const flow = this.createSequenceFlow(flowIR);
      subProcess.flowElements.push(flow);
    }

    // Subprocess-specific properties
    if (subProcessIR.completionCondition) {
      subProcess.completionCondition = this.moddle.create('bpmn:FormalExpression', {
        body: subProcessIR.completionCondition
      });
    }
    if (subProcessIR.ordering) subProcess.ordering = subProcessIR.ordering;
    if (subProcessIR.cancelRemainingInstances !== undefined) {
      subProcess.cancelRemainingInstances = subProcessIR.cancelRemainingInstances;
    }

    return subProcess;
  }

  /**
   * Create BPMN SequenceFlow element from IR
   */
  private createSequenceFlow(flowIR: SequenceFlowIR): any {
    const flow = this.moddle.create('bpmn:SequenceFlow', {
      id: flowIR.id,
      name: flowIR.name,
      sourceRef: this.moddle.create('bpmn:FlowNode', { id: flowIR.sourceRef }),
      targetRef: this.moddle.create('bpmn:FlowNode', { id: flowIR.targetRef }),
    });

    if (flowIR.conditionExpression) {
      flow.conditionExpression = this.moddle.create('bpmn:FormalExpression', {
        body: flowIR.conditionExpression
      });
    }

    if (flowIR.isImmediate !== undefined) flow.isImmediate = flowIR.isImmediate;

    return flow;
  }

  /**
   * Create BPMN DataObject element from IR
   */
  private createDataObject(dataObjectIR: any): any {
    const dataObject = this.moddle.create('bpmn:DataObject', {
      id: dataObjectIR.id,
      name: dataObjectIR.name,
      isCollection: dataObjectIR.isCollection,
    });

    return dataObject;
  }

  /**
   * Create BPMN LaneSet element from IR
   */
  private createLaneSet(laneSetIR: any): any {
    const laneSet = this.moddle.create('bpmn:LaneSet', {
      id: laneSetIR.id,
      name: laneSetIR.name,
    });

    laneSet.lanes = laneSetIR.lanes.map((lane: any) => this.createLane(lane));

    return laneSet;
  }

  /**
   * Create BPMN Lane element from IR
   */
  private createLane(laneIR: any): any {
    const lane = this.moddle.create('bpmn:Lane', {
      id: laneIR.id,
      name: laneIR.name,
    });

    if (laneIR.flowNodeRefs) {
      lane.flowNodeRefs = laneIR.flowNodeRefs.map((ref: string) =>
        this.moddle.create('bpmn:FlowNode', { id: ref })
      );
    }

    return lane;
  }

  /**
   * Create BPMN Collaboration element from IR
   */
  private async createCollaboration(collaborationIR: any): Promise<any> {
    const collaboration = this.moddle.create('bpmn:Collaboration', {
      id: collaborationIR.id,
      name: collaborationIR.name,
    });

    // Add participants
    collaboration.participants = collaborationIR.participants.map((p: any) =>
      this.moddle.create('bpmn:Participant', {
        id: p.id,
        name: p.name,
        processRef: p.processRef ? this.moddle.create('bpmn:Process', { id: p.processRef }) : undefined,
      })
    );

    // Add message flows
    collaboration.messageFlows = collaborationIR.messageFlows.map((mf: any) =>
      this.moddle.create('bpmn:MessageFlow', {
        id: mf.id,
        name: mf.name,
        sourceRef: this.moddle.create('bpmn:InteractionNode', { id: mf.sourceRef }),
        targetRef: this.moddle.create('bpmn:InteractionNode', { id: mf.targetRef }),
        messageRef: mf.messageRef ? this.moddle.create('bpmn:Message', { id: mf.messageRef }) : undefined,
      })
    );

    return collaboration;
  }
}

// Convenience function
export async function compileToXml(ir: BpmnIR): Promise<string> {
  const compiler = new BpmnCompiler();
  return compiler.compileToXml(ir);
}
