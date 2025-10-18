# @gftd/bpmn-sdk

**全網羅 BPMN 2.0 SDK with TypeScript DSL and bpmn-engine Runtime Integration**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![BPMN 2.0](https://img.shields.io/badge/BPMN-2.0-orange.svg)](https://www.omg.org/spec/BPMN/2.0/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![E2E Tests](https://img.shields.io/badge/E2E-Passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-Apache--2.0-green.svg)](LICENSE)

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
const simpleProcess = flow('SimpleProcess', f => f
  .process('SimpleProcess', p => p
    .startEvent('StartEvent')
    .userTask('ReviewTask')
    .serviceTask('ProcessTask')
    .exclusiveGateway('DecisionPoint')
    .endEvent('EndEvent')
  )
);

// Deploy and execute
const { runtime, context } = await deployAndStart(simpleProcess, {
  variables: { userId: 'user1' },
  businessKey: 'PROC-001'
});

console.log(`✅ Process completed: ${context.instanceId}`);
console.log(`📊 Status: ${context.status}`);
console.log(`⏱️  Duration: ${context.endTime!.getTime() - context.startTime.getTime()}ms`);
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

// 詳細な検証レポート
console.log(`Errors: ${result.errors.length}`);
console.log(`Warnings: ${result.warnings.length}`);
console.log(`Complexity Score: ${result.statistics.complexityScore}`);
```

### Human Task Management
```typescript
import { HumanTaskManager } from '@gftd/bpmn-sdk/human';

const taskManager = new HumanTaskManager(runtime);

// タスクの作成
const task = await taskManager.createTask(
  'process_123',
  'instance_456',
  'review_activity',
  {
    name: 'Review Invoice',
    assignee: 'accountant@example.com',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24時間後
    slaDefinition: { duration: 4 * 60 * 60 * 1000 } // 4時間SLA
  }
);

// タスクの請求と完了
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

// ランタイムに監視をアタッチ
monitor.attachToRuntime(runtime);

// パフォーマンス監視
const snapshot = await monitor.getPerformanceSnapshot();
console.log(`Active instances: ${snapshot.metrics.activeInstances}`);
console.log(`Average duration: ${snapshot.metrics.averageDuration}ms`);

// ヘルスチェック
const health = await monitor.getHealthStatus();
console.log(`System health: ${health.status}`);
```

### Testing Framework
```typescript
import { bpmnPropertyTest, bpmnScenarioTest } from '@gftd/bpmn-sdk/testing';

// プロパティベーステスト
const propertyResult = await bpmnPropertyTest(
  runtime,
  invoiceProcess,
  'noDeadEnds',
  { maxTestCases: 50 }
);
console.log(`Property test passed: ${propertyResult.success}`);

// シナリオテスト
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

# Run E2E tests (✅ Working)
pnpm --filter e2e-minimal start

# Run specific package tests
pnpm --filter @gftd/bpmn-sdk/core test
```

**E2E Test Results:**
- ✅ DSL → IR conversion
- ✅ IR → BPMN XML compilation
- ✅ Process deployment and execution with `bpmn-engine`
- ✅ Runtime event monitoring
- 🔄 Round-trip XML → IR (implemented, needs refinement)

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
