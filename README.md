# @gftd/bpmn-sdk

**Complete BPMN 2.0 SDK with TypeScript DSL and bpmn-engine Runtime Integration**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![BPMN 2.0](https://img.shields.io/badge/BPMN-2.0-orange.svg)](https://www.omg.org/spec/BPMN/2.0/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![E2E Tests](https://img.shields.io/badge/E2E-Passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-Apache--2.0-green.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![PNPM](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-blue.svg)](https://pnpm.io/)

**Complete solution for enterprise BPMN workflow development**

- ✅ **Complete BPMN 2.0 Support**: Comprehensive coverage of events, gateways, tasks, and subprocesses
- ✅ **Type-Safe DSL**: Declarative process modeling with TypeScript
- ✅ **Runtime Integration**: Seamless integration with bpmn-engine
- ✅ **Static Validation**: Reachability analysis and structural verification
- ✅ **Human Task Management**: SLA management, escalation, and workflow integration
- ✅ **Property Testing**: Automated test generation and validation
- ✅ **Operational Monitoring**: OpenTelemetry integration and observability

## 🎯 Overview

`@gftd/bpmn-sdk` is a comprehensive TypeScript SDK for enterprise BPMN workflow development.

### Key Features

- **🎨 Complete BPMN 2.0 Support**: Type-safe representation of all BPMN 2.0 elements
- **⚡ TypeScript DSL**: Declarative process modeling with full IDE support
- **🚀 Runtime Integration**: Seamless integration with `bpmn-engine`
- **🔄 Bidirectional Conversion**: XML ↔ TypeScript round-trip conversion
- **✅ Static Validation**: Reachability analysis and structural verification
- **👥 Human Task Management**: SLA management, escalation, and workflow integration
- **🧪 Property Testing**: Automated test generation and formal validation
- **📊 Operational Monitoring**: OpenTelemetry integration and observability
- **🏢 Enterprise Ready**: Extensibility, auditing, and security

### Design Philosophy

- **SOLID Principles**: Single responsibility, dependency inversion, open-closed principle
- **Type Safety First**: Reliability through compile-time verification
- **Declarative DSL**: Separation of business logic from execution logic
- **Composable**: Modular design for flexible combinations
- **Operations-Oriented**: Designed with monitoring, testing, and maintenance in mind

## 📦 Architecture

```
@gftd/bpmn-sdk/
├── ✅ core/           # BPMN 2.0 types & IR (Internal Representation)
├── ✅ dsl/            # TypeScript DSL for declarative modeling
├── ✅ compiler/       # IR → BPMN 2.0 XML (bpmn-moddle based)
├── ✅ importer/       # BPMN XML → IR (reverse compilation)
├── ✅ runtime/        # bpmn-engine integration & execution
├── ✅ human/          # Human task management & SLA
├── ✅ validation/     # Static validation & reachability analysis
├── ✅ testing/        # Property-based testing framework
├── ✅ ops/            # OpenTelemetry monitoring & operations
└── ✅ examples/       # Usage examples & E2E tests
```

**✅ Implemented | 🔄 Planned | 📋 Future**

### Package Details

| Package | Description | Dependencies |
|---------|-------------|--------------|
| **core** | BPMN 2.0 type definitions and internal representation (IR) | None |
| **dsl** | Declarative process modeling with TypeScript | core |
| **compiler** | IR → BPMN XML conversion (using bpmn-moddle) | core |
| **importer** | BPMN XML → IR conversion (reverse compilation) | core |
| **runtime** | bpmn-engine integration and execution control | core, compiler |
| **human** | Human task management (SLA, escalation) | core, runtime |
| **validation** | Static validation (reachability analysis, structural checks) | core |
| **testing** | Property-based testing framework | core, runtime, validation |
| **ops** | OpenTelemetry monitoring and operations | core, runtime |

## 🚀 Quick Start

### Installation

```bash
# pnpm is recommended
pnpm add @gftd/bpmn-sdk

# or npm
npm install @gftd/bpmn-sdk

# or yarn
yarn add @gftd/bpmn-sdk
```

### Basic Usage

```typescript
import { flow } from '@gftd/bpmn-sdk/dsl';
import { deployAndStart } from '@gftd/bpmn-sdk/runtime';

// Define process with TypeScript DSL
const invoiceProcess = flow('InvoiceApproval', f => f
  .process('InvoiceApproval', p => p
    // Start event
    .startEvent('StartEvent')

    // User task (manual approval)
    .userTask('ReviewInvoice')

    // XOR gateway (conditional branching)
    .exclusiveGateway('AmountCheck')

    // Service tasks (automatic processing)
    .serviceTask('AutoApprove')
    .serviceTask('ProcessInvoice')

    // End event
    .endEvent('EndEvent')

    // Sequence flows
    .sequenceFlow('StartEvent', 'ReviewInvoice')
    .sequenceFlow('ReviewInvoice', 'AmountCheck')
    .sequenceFlow('AmountCheck', 'AutoApprove')
      .condition('${amount <= 1000}')
    .sequenceFlow('AmountCheck', 'ProcessInvoice')
      .condition('${amount > 1000}')
    .sequenceFlow('AutoApprove', 'ProcessInvoice')
    .sequenceFlow('ProcessInvoice', 'EndEvent')
  )
);

// Deploy and execute
const { runtime, context } = await deployAndStart(invoiceProcess, {
  variables: {
    amount: 500,
    invoiceId: 'INV-001',
    requester: 'john.doe@example.com'
  },
  businessKey: 'PROC-001'
});

console.log(`✅ Process completed: ${context.instanceId}`);
console.log(`📊 Status: ${context.status}`);
console.log(`⏱️  Duration: ${context.endTime!.getTime() - context.startTime.getTime()}ms`);
```

### Advanced Usage

```typescript
import { validateProcess } from '@gftd/bpmn-sdk/validation';
import { HumanTaskManager } from '@gftd/bpmn-sdk/human';
import { BpmnMonitor } from '@gftd/bpmn-sdk/ops';

// Static validation
const validation = await validateProcess(invoiceProcess);
if (!validation.valid) {
  console.error('Process validation failed:', validation.errors);
  process.exit(1);
}

// Human task management
const taskManager = new HumanTaskManager(runtime);

// Monitoring system
const monitor = new BpmnMonitor({
  serviceName: 'invoice-service',
  metrics: { enabled: true },
  alerts: { enabled: true }
});

monitor.attachToRuntime(runtime);

// Event monitoring during process execution
runtime.onEvent((event) => {
  console.log(`📢 Event: ${event.type}`, {
    processId: event.processId,
    instanceId: event.instanceId,
    activityId: event.activityId
  });
});
```

## 📋 BPMN 2.0 Coverage

### 🎯 Events - Complete Support

#### Start Events
- **None Start Event**: Unconditional start
- **Message Start Event**: Message reception start
- **Timer Start Event**: Schedule/time-based start
- **Signal Start Event**: Signal reception start
- **Error Start Event**: Error handling start
- **Escalation Start Event**: Escalation handling start
- **Compensation Start Event**: Compensation handling start
- **Conditional Start Event**: Condition expression evaluation start
- **Multiple Start Event**: Multiple trigger start
- **Parallel Multiple Start Event**: Parallel multiple trigger start

#### Intermediate Events
- **Catch Events**: Message/timer/signal/error/escalation/conditional/link
- **Throw Events**: Message/signal/escalation/compensation/link
- **Boundary Events**: Interrupting/non-interrupting (all event types supported)

#### End Events
- **None End Event**: Normal termination
- **Message End Event**: Message sending termination
- **Signal End Event**: Signal sending termination
- **Error End Event**: Error termination
- **Escalation End Event**: Escalation termination
- **Compensation End Event**: Compensation trigger termination
- **Terminate End Event**: Immediate termination
- **Cancel End Event**: Transaction cancellation termination

### ⚙️ Tasks & Activities - Complete Support

#### Main Task Types
- **Service Task**: External service calls, Java delegates, expression evaluation
- **User Task**: Form-based human tasks, assignments, escalations
- **Manual Task**: Unmodeled human activities
- **Script Task**: Embedded script execution
- **Business Rule Task**: DMN integration, decision service invocation
- **Send Task**: Message sending
- **Receive Task**: Message receiving
- **Call Activity**: Reusable subprocess invocation

#### Advanced Features
- **Loop Characteristics**: Standard/multi-instance loops
- **Input/Output Specifications**: Data input/output definitions
- **Data Associations**: Data mapping
- **Resources**: Assignee/group assignments
- **Properties**: Custom properties

### 🚪 Gateways - Complete Support

- **Exclusive Gateway (XOR)**: Single path selection, default path
- **Inclusive Gateway (OR)**: Multiple path selection, default path
- **Parallel Gateway (AND)**: Synchronization, fork/join
- **Event-based Gateway**: First-event-wins routing
- **Complex Gateway**: Custom routing logic
- **Condition Expressions**: Expression language support (FEEL, JavaScript, etc.)

### 🔄 Subprocesses - Complete Support

- **Embedded Subprocess**: Inline subprocess definition
- **Reusable Subprocess**: Reusable subprocess
- **Event Subprocess**: Event-triggered subprocess
- **Transaction Subprocess**: ACID transaction boundaries
- **Ad-hoc Subprocess**: Unstructured activity sets

#### Subprocess Features
- **Start Events**: Own start events
- **Boundary Events**: Event handling at subprocess boundaries
- **Compensation**: Compensation handlers
- **Multi-instance**: Multiple instance execution

### 📊 Artifacts & Data

- **Data Objects**: Process data modeling, state management
- **Data Stores**: Global data storage
- **Message Flows**: Inter-pool communication
- **Associations**: Documentation linking
- **Groups**: Visual grouping
- **Text Annotations**: Documentation notes
- **Lanes & Pools**: Organizational/role separation

### 🔗 Connecting Elements

- **Sequence Flows**: Control flow, condition expressions
- **Message Flows**: Message exchange
- **Associations**: Associations
- **Data Associations**: Data flow
- **Conversations**: Conversation definitions

## 🔧 Advanced Features

### Static Validation
```typescript
import { validateProcess } from '@gftd/bpmn-sdk/validation';

const result = validateProcess(invoiceProcess);
// → { valid: true } or { valid: false, errors: [...] }

// Detailed validation report
console.log(`Errors: ${result.errors.length}`);
console.log(`Warnings: ${result.warnings.length}`);
console.log(`Complexity Score: ${result.statistics.complexityScore}`);
```

### Human Task Management
```typescript
import { HumanTaskManager } from '@gftd/bpmn-sdk/human';

const taskManager = new HumanTaskManager(runtime);

// Create a task
const task = await taskManager.createTask(
  'process_123',
  'instance_456',
  'review_activity',
  {
    name: 'Review Invoice',
    assignee: 'accountant@example.com',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours later
    slaDefinition: { duration: 4 * 60 * 60 * 1000 } // 4 hour SLA
  }
);

// Claim and complete the task
await taskManager.claimTask(task.id, 'accountant@example.com');
await taskManager.completeTask(task.id, 'accountant@example.com', {
  decision: 'approved',
  comments: 'Invoice approved for payment'
});
```

### Monitoring & Observability
```typescript
import { BpmnMonitor } from '@gftd/bpmn-sdk/ops';

const monitor = new BpmnMonitor({
  serviceName: 'bpmn-service',
  metrics: { enabled: true, interval: 60000 },
  otel: { endpoint: 'http://jaeger:14268/api/traces' }
});

// Attach monitoring to runtime
monitor.attachToRuntime(runtime);

// Performance monitoring
const snapshot = await monitor.getPerformanceSnapshot();
console.log(`Active instances: ${snapshot.metrics.activeInstances}`);
console.log(`Average duration: ${snapshot.metrics.averageDuration}ms`);

// Health check
const health = await monitor.getHealthStatus();
console.log(`System health: ${health.status}`);
```

### Testing Framework
```typescript
import { bpmnPropertyTest, bpmnScenarioTest } from '@gftd/bpmn-sdk/testing';

// Property-based testing
const propertyResult = await bpmnPropertyTest(
  runtime,
  invoiceProcess,
  'noDeadEnds',
  { maxTestCases: 50 }
);
console.log(`Property test passed: ${propertyResult.success}`);

// Scenario testing
const scenarioResult = await bpmnScenarioTest(
  runtime,
  invoiceProcess,
  {
    id: 'approval_flow',
    description: 'Complete approval workflow',
    inputs: { amount: 500 },
    expectedPath: ['StartEvent', 'ReviewTask', 'ServiceTask', 'EndEvent'],
    expectedOutputs: { approved: true }
  }
);
console.log(`Scenario test passed: ${scenarioResult.success}`);
```

## 📚 Tutorials

### Tutorial: Invoice Approval Process

This tutorial guides you through creating a complete invoice approval workflow.

#### Step 1: Process Modeling

```typescript
import { flow } from '@gftd/bpmn-sdk/dsl';

const invoiceApprovalProcess = flow('InvoiceApprovalWorkflow', f => f
  .process('InvoiceApprovalWorkflow', p => p
    // Start: Invoice received
    .startEvent('InvoiceReceived')
      .message('invoiceMessage')

    // Initial validation
    .serviceTask('ValidateInvoice')
      .implementation('validateInvoiceService')

    // Amount check
    .exclusiveGateway('AmountCheck')

    // Low amount: Auto approval
    .serviceTask('AutoApprove')
      .implementation('autoApprovalService')

    // High amount: Manager approval
    .userTask('ManagerApproval')
      .name('Manager Approval')
      .assignee('${managerId}')
      .dueDate('${approvalDeadline}')

    // Final processing
    .serviceTask('ProcessPayment')
      .implementation('paymentService')

    // End
    .endEvent('ProcessComplete')

    // Flow definitions
    .sequenceFlow('InvoiceReceived', 'ValidateInvoice')
    .sequenceFlow('ValidateInvoice', 'AmountCheck')

    // Conditional branching
    .sequenceFlow('AmountCheck', 'AutoApprove')
      .condition('${amount <= 1000}')

    .sequenceFlow('AmountCheck', 'ManagerApproval')
      .condition('${amount > 1000}')

    // Convergence
    .sequenceFlow('AutoApprove', 'ProcessPayment')
    .sequenceFlow('ManagerApproval', 'ProcessPayment')
    .sequenceFlow('ProcessPayment', 'ProcessComplete')
  )
);
```

#### Step 2: Static Validation

```typescript
import { validateProcess } from '@gftd/bpmn-sdk/validation';

const validation = await validateProcess(invoiceApprovalProcess);

if (!validation.valid) {
  console.error('Validation errors:');
  validation.errors.forEach(error => {
    console.error(`- ${error.type}: ${error.message}`);
  });
  process.exit(1);
}

console.log('✅ Process validation successful');
```

#### Step 3: Human Task Management Setup

```typescript
import { HumanTaskManager } from '@gftd/bpmn-sdk/human';

const taskManager = new HumanTaskManager(runtime);

// SLA configuration
const slaDefinition = {
  duration: 24 * 60 * 60 * 1000, // 24 hours
  businessHours: {
    timezone: 'Asia/Tokyo',
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  }
};

// Escalation configuration
const escalationActions = [{
  type: 'reassign' as const,
  trigger: 'warning' as const,
  delay: 60 * 60 * 1000, // 1 hour later
  targetUsers: ['supervisor@example.com'],
  message: 'Approval task has exceeded 1 hour'
}];
```

#### Step 4: Monitoring System Setup

```typescript
import { BpmnMonitor } from '@gftd/bpmn-sdk/ops';

const monitor = new BpmnMonitor({
  serviceName: 'invoice-approval-service',
  metrics: {
    enabled: true,
    interval: 30000 // 30 seconds
  },
  alerts: {
    enabled: true,
    thresholds: {
      maxProcessInstances: 100,
      maxErrorRate: 0.05,
      maxAverageDuration: 7 * 24 * 60 * 60 * 1000, // 1 week
      slaBreachRate: 0.1
    }
  }
});

monitor.attachToRuntime(runtime);
```

#### Step 5: Process Execution

```typescript
import { deployAndStart } from '@gftd/bpmn-sdk/runtime';

// Deploy process
const { runtime, context } = await deployAndStart(invoiceApprovalProcess, {
  variables: {
    amount: 2500,
    invoiceId: 'INV-2024-001',
    managerId: 'manager@example.com',
    approvalDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  businessKey: 'INV-2024-001'
});

console.log(`Process started: ${context.instanceId}`);

// Event monitoring
runtime.onEvent((event) => {
  console.log(`Event: ${event.type}`, {
    activity: event.activityId,
    status: event.type
  });

  // Human task creation event
  if (event.type === 'activity.wait' && event.activityType === 'userTask') {
    console.log('Waiting for human task:', event.activityId);
  }
});
```

#### Step 6: Task Operations

```typescript
// Find and claim tasks
const pendingTasks = taskManager.getTasksForUser('manager@example.com');

if (pendingTasks.length > 0) {
  const approvalTask = pendingTasks[0];

  // Claim task
  await taskManager.claimTask(approvalTask.id, 'manager@example.com');

  // Complete approval
  await taskManager.completeTask(approvalTask.id, 'manager@example.com', {
    approved: true,
    approvalDate: new Date(),
    comments: 'Approved. Please proceed with payment processing.'
  });

  console.log('Task completed');
}
```

### Tutorial: Property-based Testing

```typescript
import { bpmnPropertyTest, bpmnScenarioTest } from '@gftd/bpmn-sdk/testing';

// Property testing
const deadEndTest = await bpmnPropertyTest(runtime, invoiceProcess, 'noDeadEnds', {
  maxTestCases: 50
});

console.log(`Dead End Test: ${deadEndTest.success ? '✅' : '❌'}`);

// Scenario testing
const scenarios = [
  {
    id: 'low_amount_flow',
    description: 'Low amount invoice auto-approval flow',
    inputs: { amount: 500 },
    expectedPath: ['InvoiceReceived', 'ValidateInvoice', 'AmountCheck', 'AutoApprove', 'ProcessPayment', 'ProcessComplete']
  },
  {
    id: 'high_amount_flow',
    description: 'High amount invoice manual approval flow',
    inputs: { amount: 5000 },
    expectedPath: ['InvoiceReceived', 'ValidateInvoice', 'AmountCheck', 'ManagerApproval', 'ProcessPayment', 'ProcessComplete']
  }
];

for (const scenario of scenarios) {
  const result = await bpmnScenarioTest(runtime, invoiceProcess, scenario);
  console.log(`${scenario.id}: ${result.success ? '✅' : '❌'}`);
}
```

## 🏗️ Development

### Prerequisites
- Node.js 18+
- pnpm 9+

### Setup
```bash
git clone https://github.com/gftdcojp/gftd-bpmn-sdk.git
cd gftd-bpmn-sdk
pnpm install
pnpm build
```

### Testing
```bash
# Run all tests
pnpm test

# Run E2E integration tests
pnpm --filter e2e-integration start

# Run package-specific tests
pnpm --filter @gftd/bpmn-sdk/core test
pnpm --filter @gftd/bpmn-sdk/validation test
pnpm --filter @gftd/bpmn-sdk/human test
```

### API Documentation Generation
```bash
# Generate TypeDoc API documentation
pnpm docs

# Start documentation server
pnpm docs:serve
```

**E2E Integration Test Results:**
- ✅ DSL → IR conversion
- ✅ IR → BPMN XML compilation
- ✅ Process deployment and execution (`bpmn-engine`)
- ✅ Runtime event monitoring
- ✅ Human task management
- ✅ Static validation integration
- ✅ Property-based testing
- ✅ OpenTelemetry monitoring
- 🔄 XML → IR round-trip (needs some adjustment)

### Building
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @gftd/bpmn-sdk/dsl build
```

## 📚 Examples

Practical usage examples are provided in the `examples/` directory:

### 🧪 Integration Tests
- **`e2e-integration/`**: Full component integration tests
  - Complete E2E workflow execution
  - Verification of inter-component collaboration
  - Comprehensive Jest-based test suite

### 💼 Business Process Examples
- **`e2e-minimal/`**: Basic process execution
  - Simple Start → Task → End flow
  - BPMN SDK basic functionality demo

- **`order-processing/`**: Order processing workflow
  - Complex business process
  - Conditional branching (XOR gateway)
  - Human task management
  - Error handling (boundary events)
  - SLA management and escalation
  - Inventory checking and payment processing
  - Shipping management

### 🚀 How to Run

```bash
# Run integration tests
pnpm --filter e2e-integration start

# Run order processing demo
pnpm --filter order-processing start

# Run basic example
pnpm --filter e2e-minimal start
```

### 📖 Learning Path

1. **Basics**: Learn BPMN SDK fundamentals with `e2e-minimal`
2. **Integration**: Understand full component collaboration with `e2e-integration`
3. **Practice**: Implement real business processes with `order-processing`

Each example includes detailed comments and explanations for immediate implementation.

## 🔍 API Reference

### DSL API

#### Flow Definition
```typescript
flow(name: string, builder: FlowBuilder): BpmnIR
```

#### Process Building
```typescript
.process(id, builder) → ProcessBuilder
.startEvent(name?) → StartEventBuilder
.userTask(name?) → UserTaskBuilder
.serviceTask(name?) → ServiceTaskBuilder
.exclusiveGateway(name?) → ExclusiveGatewayBuilder
// ... and more
```

#### Event Definitions
```typescript
.message(messageRef?)
.timer({ timeDate?, timeCycle?, timeDuration? })
.signal(signalRef?)
.error(errorRef?)
// ... and more
```

### Runtime API

#### Process Execution
```typescript
deployAndStart(ir, options) → { runtime, context }
runtime.startInstance(processId, options) → ExecutionContext
runtime.signal(processId, instanceId, signalId, payload?)
runtime.sendMessage(processId, instanceId, messageId, payload?)
```

#### Event Handling
```typescript
runtime.onEvent(listener: (event: RuntimeEvent) => void)
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run `pnpm test` and `pnpm lint`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [bpmn-engine](https://github.com/paed01/bpmn-engine) for the runtime engine
- [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle) for BPMN XML handling
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/) for the standard

## 📞 Support

- Issues: [GitHub Issues](https://github.com/gftdcojp/gftd-bpmn-sdk/issues)
- Discussions: [GitHub Discussions](https://github.com/gftdcojp/gftd-bpmn-sdk/discussions)

---

**Built with ❤️ for enterprise BPMN workflows**
