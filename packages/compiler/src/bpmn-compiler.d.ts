import type { BpmnIR } from '@gftd/bpmn-sdk/core';
export declare class BpmnCompiler {
    private moddle;
    constructor();
    /**
     * Compile BPMN IR to BPMN 2.0 XML string
     */
    compileToXml(ir: BpmnIR): Promise<string>;
    /**
     * Create BPMN Definitions element from IR
     */
    private createDefinitions;
    /**
     * Create BPMN Process element from IR
     */
    private createProcess;
    /**
     * Create flow element from IR
     */
    private createFlowElement;
    /**
     * Create BPMN Event element from IR
     */
    private createEvent;
    /**
     * Create event definition from IR
     */
    private createEventDefinition;
    /**
     * Create BPMN Task element from IR
     */
    private createTask;
    /**
     * Create BPMN Gateway element from IR
     */
    private createGateway;
    /**
     * Create BPMN SubProcess element from IR
     */
    private createSubProcess;
    /**
     * Create BPMN SequenceFlow element from IR
     */
    private createSequenceFlow;
    /**
     * Create BPMN DataObject element from IR
     */
    private createDataObject;
    /**
     * Create BPMN LaneSet element from IR
     */
    private createLaneSet;
    /**
     * Create BPMN Lane element from IR
     */
    private createLane;
    /**
     * Create BPMN Collaboration element from IR
     */
    private createCollaboration;
}
export declare function compileToXml(ir: BpmnIR): Promise<string>;
//# sourceMappingURL=bpmn-compiler.d.ts.map