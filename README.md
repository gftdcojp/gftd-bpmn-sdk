# @gftd/bpmn-sdk

**全網羅 BPMN 2.0 SDK with TypeScript DSL and bpmn-engine Runtime Integration**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![BPMN 2.0](https://img.shields.io/badge/BPMN-2.0-orange.svg)](https://www.omg.org/spec/BPMN/2.0/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Overview

`@gftd/bpmn-sdk` is a comprehensive TypeScript SDK for BPMN 2.0 that provides:

- **Complete BPMN 2.0 Coverage**: All BPMN 2.0 elements with type safety
- **TypeScript DSL**: Declarative process modeling with full IDE support
- **Runtime Integration**: Seamless execution with `bpmn-engine`
- **Round-trip Support**: XML ↔ TypeScript conversion
- **Enterprise Ready**: Validation, monitoring, and extensibility

## 📦 Architecture

```
@gftd/bpmn-sdk/
├── core/           # BPMN 2.0 types & IR (Internal Representation)
├── dsl/            # TypeScript DSL for declarative modeling
├── compiler/       # IR → BPMN 2.0 XML (bpmn-moddle based)
├── importer/       # BPMN XML → IR (reverse compilation)
├── runtime/        # bpmn-engine integration & execution
├── human/          # Human task management
├── validation/     # Static validation & verification
├── testing/        # Property-based testing framework
├── ops/            # Monitoring, versioning, & operations
└── examples/       # Usage examples & E2E tests
```

## 🚀 Quick Start

### Installation

```bash
pnpm add @gftd/bpmn-sdk
```

### Basic Usage

```typescript
import { flow } from '@gftd/bpmn-sdk/dsl';
import { deployAndStart } from '@gftd/bpmn-sdk/runtime';

// Define process with TypeScript DSL
const invoiceProcess = flow('InvoiceApproval', f => f
  .process('InvoiceProcess', p => p
    .startEvent('InvoiceReceived').message('invoiceMessage')
    .userTask('ReviewInvoice').assignee('accountant')
    .exclusiveGateway('AmountCheck')
      .when('${amount <= 1000}', b => b
        .serviceTask('AutoApprove').topic('invoice-service')
        .endEvent('Approved'))
      .otherwise(b => b
        .userTask('ManagerApproval').candidateGroups('managers')
        .endEvent('Processed'))
  )
);

// Deploy and execute
const { runtime, context } = await deployAndStart(invoiceProcess, {
  variables: { amount: 500 },
  businessKey: 'INV-2024-001'
});

console.log(`Process started: ${context.instanceId}`);
```

## 📋 BPMN 2.0 Coverage

### Events (Complete)
- **Start Events**: None, Message, Timer, Signal, Error, Escalation, Compensation, Conditional, Multiple, Parallel Multiple
- **End Events**: None, Message, Signal, Error, Escalation, Compensation, Cancel, Terminate, Multiple, Parallel Multiple
- **Intermediate Events**: Catch/Throw variants of all definitions above
- **Boundary Events**: Interrupting/Non-interrupting for all event types

### Tasks & Activities (Complete)
- **Service Tasks**: External service calls, Java delegates, expression evaluation
- **User Tasks**: Human tasks with forms, assignments, and escalations
- **Manual Tasks**: Unmodeled human activities
- **Script Tasks**: Embedded script execution
- **Business Rule Tasks**: DMN integration
- **Send/Receive Tasks**: Message exchange
- **Call Activities**: Reusable subprocess invocation

### Gateways (Complete)
- **Exclusive Gateway (XOR)**: Single path selection
- **Inclusive Gateway (OR)**: Multiple path selection
- **Parallel Gateway (AND)**: Synchronization
- **Event-based Gateway**: First-event-wins routing
- **Complex Gateway**: Custom routing logic

### Subprocesses (Complete)
- **Embedded Subprocess**: Inline subprocess definition
- **Event Subprocess**: Event-triggered subprocess
- **Transaction Subprocess**: ACID transaction boundaries
- **Ad-hoc Subprocess**: Unstructured activity sets

### Artifacts & Data
- **Data Objects**: Process data modeling
- **Message Flows**: Inter-pool communication
- **Associations**: Documentation linking
- **Groups**: Visual organization
- **Text Annotations**: Documentation

## 🔧 Advanced Features

### Static Validation
```typescript
import { validateProcess } from '@gftd/bpmn-sdk/validation';

const result = validateProcess(invoiceProcess);
// → { valid: true } or { valid: false, errors: [...] }
```

### Human Task Management
```typescript
import { HumanTaskManager } from '@gftd/bpmn-sdk/human';

const taskManager = new HumanTaskManager(runtime);
await taskManager.claim(taskId, 'user123');
await taskManager.complete(taskId, { decision: 'approved' });
```

### Monitoring & Observability
```typescript
import { BpmnMonitor } from '@gftd/bpmn-sdk/ops';

const monitor = new BpmnMonitor();
monitor.onEvent((event) => {
  // Send to OpenTelemetry, DataDog, etc.
});
```

### Testing Framework
```typescript
import { bpmnPropertyTest } from '@gftd/bpmn-sdk/testing';

// Property-based testing for process correctness
const testResult = await bpmnPropertyTest(invoiceProcess, {
  invariant: 'noDeadEnds',
  coverage: 'allPaths'
});
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

# Run E2E tests
pnpm --filter e2e-minimal start

# Run specific package tests
pnpm --filter @gftd/bpmn-sdk/core test
```

### Building
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @gftd/bpmn-sdk/dsl build
```

## 📚 Examples

Check out the `examples/` directory for comprehensive usage examples:

- `e2e-minimal/`: Basic process execution
- `advanced-routing/`: Complex gateway patterns
- `human-tasks/`: User task management
- `error-handling/`: Boundary events and compensation
- `subprocesses/`: Nested process structures

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
