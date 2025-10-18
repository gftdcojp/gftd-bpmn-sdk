# @gftd/bpmn-sdk

**完全網羅 BPMN 2.0 SDK with TypeScript DSL and bpmn-engine Runtime Integration**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![BPMN 2.0](https://img.shields.io/badge/BPMN-2.0-orange.svg)](https://www.omg.org/spec/BPMN/2.0/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![E2E Tests](https://img.shields.io/badge/E2E-Passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-Apache--2.0-green.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![PNPM](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-blue.svg)](https://pnpm.io/)

**企業向けBPMNワークフロー開発のための完全ソリューション**

- ✅ **完全BPMN 2.0対応**: イベント/ゲートウェイ/タスク/サブプロセスを網羅
- ✅ **型安全DSL**: TypeScriptによる宣言的プロセスモデリング
- ✅ **ランタイム統合**: bpmn-engineとのシームレス連携
- ✅ **静的検証**: 到達性分析と構造検証
- ✅ **人手タスク管理**: SLA/エスカレーション/ワークフロー統合
- ✅ **プロパティテスト**: 自動テスト生成と検証
- ✅ **運用監視**: OpenTelemetry統合とオブザーバビリティ

## 🎯 Overview

`@gftd/bpmn-sdk` は、企業向けBPMNワークフロー開発のための完全なTypeScript SDKです。

### 主要機能

- **🎨 完全BPMN 2.0対応**: すべてのBPMN 2.0要素を型安全に表現
- **⚡ TypeScript DSL**: 宣言的プロセスモデリング with 完全なIDEサポート
- **🚀 ランタイム統合**: `bpmn-engine`とのシームレスな実行連携
- **🔄 双方向変換**: XML ↔ TypeScript の往復変換
- **✅ 静的検証**: 到達性分析と構造検証
- **👥 人手タスク管理**: SLA/エスカレーション/ワークフロー統合
- **🧪 プロパティテスト**: 自動テスト生成と形式検証
- **📊 運用監視**: OpenTelemetry統合とオブザーバビリティ
- **🏢 企業対応**: 拡張性、監査、セキュリティ

### 設計哲学

- **SOLID原則**: 単一責任、依存性逆転、開放閉鎖
- **型安全第一**: コンパイル時検証による信頼性
- **宣言的DSL**: ビジネスロジックと実行ロジックの分離
- **コンポーザブル**: モジュラー設計による柔軟な組み合わせ
- **運用指向**: 監視・テスト・保守を考慮した設計

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

### パッケージ詳細

| パッケージ | 説明 | 依存関係 |
|-----------|------|----------|
| **core** | BPMN 2.0 の型定義と内部表現(IR) | なし |
| **dsl** | TypeScript による宣言的プロセスモデリング | core |
| **compiler** | IR → BPMN XML 変換 (bpmn-moddle使用) | core |
| **importer** | BPMN XML → IR 変換 (逆コンパイル) | core |
| **runtime** | bpmn-engine 統合と実行制御 | core, compiler |
| **human** | 人手タスク管理 (SLA, エスカレーション) | core, runtime |
| **validation** | 静的検証 (到達性分析, 構造チェック) | core |
| **testing** | プロパティベーステストフレームワーク | core, runtime, validation |
| **ops** | OpenTelemetry監視と運用機能 | core, runtime |

## 🚀 Quick Start

### インストール

```bash
# pnpm を推奨
pnpm add @gftd/bpmn-sdk

# または npm
npm install @gftd/bpmn-sdk

# または yarn
yarn add @gftd/bpmn-sdk
```

### 基本的な使用法

```typescript
import { flow } from '@gftd/bpmn-sdk/dsl';
import { deployAndStart } from '@gftd/bpmn-sdk/runtime';

// TypeScript DSL でプロセスを定義
const invoiceProcess = flow('InvoiceApproval', f => f
  .process('InvoiceApproval', p => p
    // 開始イベント
    .startEvent('StartEvent')

    // ユーザータスク (人手承認)
    .userTask('ReviewInvoice')

    // XORゲートウェイ (条件分岐)
    .exclusiveGateway('AmountCheck')

    // サービスタスク (自動処理)
    .serviceTask('AutoApprove')
    .serviceTask('ProcessInvoice')

    // 終了イベント
    .endEvent('EndEvent')

    // シーケンスフロー
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

// デプロイと実行
const { runtime, context } = await deployAndStart(invoiceProcess, {
  variables: {
    amount: 500,
    invoiceId: 'INV-001',
    requester: 'john.doe@example.com'
  },
  businessKey: 'PROC-001'
});

console.log(`✅ プロセス完了: ${context.instanceId}`);
console.log(`📊 ステータス: ${context.status}`);
console.log(`⏱️  実行時間: ${context.endTime!.getTime() - context.startTime.getTime()}ms`);
```

### 高度な使用法

```typescript
import { validateProcess } from '@gftd/bpmn-sdk/validation';
import { HumanTaskManager } from '@gftd/bpmn-sdk/human';
import { BpmnMonitor } from '@gftd/bpmn-sdk/ops';

// 静的検証
const validation = await validateProcess(invoiceProcess);
if (!validation.valid) {
  console.error('プロセス検証失敗:', validation.errors);
  process.exit(1);
}

// 人手タスク管理
const taskManager = new HumanTaskManager(runtime);

// 監視システム
const monitor = new BpmnMonitor({
  serviceName: 'invoice-service',
  metrics: { enabled: true },
  alerts: { enabled: true }
});

monitor.attachToRuntime(runtime);

// プロセス実行中のイベント監視
runtime.onEvent((event) => {
  console.log(`📢 イベント: ${event.type}`, {
    processId: event.processId,
    instanceId: event.instanceId,
    activityId: event.activityId
  });
});
```

## 📋 BPMN 2.0 対応範囲

### 🎯 イベント (Events) - 完全対応

#### 開始イベント (Start Events)
- **None Start Event**: 条件なし開始
- **Message Start Event**: メッセージ受信開始
- **Timer Start Event**: スケジュール/時間ベース開始
- **Signal Start Event**: シグナル受信開始
- **Error Start Event**: エラー処理開始
- **Escalation Start Event**: エスカレーション処理開始
- **Compensation Start Event**: 補償処理開始
- **Conditional Start Event**: 条件式評価開始
- **Multiple Start Event**: 複数トリガー開始
- **Parallel Multiple Start Event**: 並列複数トリガー開始

#### 中間イベント (Intermediate Events)
- **Catch Events**: メッセージ/タイマー/シグナル/エラー/エスカレーション/条件/リンク
- **Throw Events**: メッセージ/シグナル/エスカレーション/補償/リンク
- **Boundary Events**: 割り込み/非割り込み (全イベントタイプ対応)

#### 終了イベント (End Events)
- **None End Event**: 正常終了
- **Message End Event**: メッセージ送信終了
- **Signal End Event**: シグナル送信終了
- **Error End Event**: エラー終了
- **Escalation End Event**: エスカレーション終了
- **Compensation End Event**: 補償トリガー終了
- **Terminate End Event**: 即時終了
- **Cancel End Event**: トランザクション取消終了

### ⚙️ タスク & アクティビティ (Tasks & Activities) - 完全対応

#### 主要タスクタイプ
- **Service Task**: 外部サービス呼び出し、Javaデリゲート、式評価
- **User Task**: フォーム付き人手タスク、割り当て、エスカレーション
- **Manual Task**: 非モデル化人手活動
- **Script Task**: 埋め込みスクリプト実行
- **Business Rule Task**: DMN統合、デシジョンサービス呼び出し
- **Send Task**: メッセージ送信
- **Receive Task**: メッセージ受信
- **Call Activity**: 再利用可能サブプロセス呼び出し

#### 高度な機能
- **Loop Characteristics**: 標準/多重ループ
- **Input/Output Specifications**: データ入出力定義
- **Data Associations**: データマッピング
- **Resources**: 担当者/グループ割り当て
- **Properties**: カスタムプロパティ

### 🚪 ゲートウェイ (Gateways) - 完全対応

- **Exclusive Gateway (XOR)**: 単一経路選択、デフォルト経路
- **Inclusive Gateway (OR)**: 複数経路選択、デフォルト経路
- **Parallel Gateway (AND)**: 同期処理、フォーク/ジョイン
- **Event-based Gateway**: 先着イベント優先ルーティング
- **Complex Gateway**: カスタムルーティングロジック
- **条件式**: 式言語対応 (FEEL, JavaScript, etc.)

### 🔄 サブプロセス (Subprocesses) - 完全対応

- **Embedded Subprocess**: インラインサブプロセス定義
- **Reusable Subprocess**: 再利用可能サブプロセス
- **Event Subprocess**: イベントトリガーサブプロセス
- **Transaction Subprocess**: ACIDトランザクション境界
- **Ad-hoc Subprocess**: 非構造化活動セット

#### サブプロセス機能
- **Start Events**: 独自の開始イベント
- **Boundary Events**: サブプロセス境界でのイベント処理
- **Compensation**: 補償ハンドラー
- **Multi-instance**: 複数インスタンス実行

### 📊 アーティファクト & データ (Artifacts & Data)

- **Data Objects**: プロセスデータモデリング、状態管理
- **Data Stores**: グローバルデータ保存
- **Message Flows**: プール間通信
- **Associations**: ドキュメント関連付け
- **Groups**: 視覚的グループ化
- **Text Annotations**: ドキュメント注記
- **Lanes & Pools**: 組織/役割分離

### 🔗 接続要素 (Connecting Elements)

- **Sequence Flows**: 制御フロー、条件式
- **Message Flows**: メッセージ交換
- **Associations**: 関連付け
- **Data Associations**: データフロー
- **Conversations**: 会話定義

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

## 📚 Tutorials

### チュートリアル: 請求書承認プロセス

このチュートリアルでは、完全な請求書承認ワークフローを作成します。

#### ステップ 1: プロセスモデリング

```typescript
import { flow } from '@gftd/bpmn-sdk/dsl';

const invoiceApprovalProcess = flow('InvoiceApprovalWorkflow', f => f
  .process('InvoiceApprovalWorkflow', p => p
    // 開始: 請求書受信
    .startEvent('InvoiceReceived')
      .message('invoiceMessage')

    // 初期検証
    .serviceTask('ValidateInvoice')
      .implementation('validateInvoiceService')

    // 金額チェック
    .exclusiveGateway('AmountCheck')

    // 少額: 自動承認
    .serviceTask('AutoApprove')
      .implementation('autoApprovalService')

    // 多額: マネージャー承認
    .userTask('ManagerApproval')
      .name('マネージャー承認')
      .assignee('${managerId}')
      .dueDate('${approvalDeadline}')

    // 最終処理
    .serviceTask('ProcessPayment')
      .implementation('paymentService')

    // 終了
    .endEvent('ProcessComplete')

    // フロー定義
    .sequenceFlow('InvoiceReceived', 'ValidateInvoice')
    .sequenceFlow('ValidateInvoice', 'AmountCheck')

    // 条件分岐
    .sequenceFlow('AmountCheck', 'AutoApprove')
      .condition('${amount <= 1000}')

    .sequenceFlow('AmountCheck', 'ManagerApproval')
      .condition('${amount > 1000}')

    // 合流
    .sequenceFlow('AutoApprove', 'ProcessPayment')
    .sequenceFlow('ManagerApproval', 'ProcessPayment')
    .sequenceFlow('ProcessPayment', 'ProcessComplete')
  )
);
```

#### ステップ 2: 静的検証

```typescript
import { validateProcess } from '@gftd/bpmn-sdk/validation';

const validation = await validateProcess(invoiceApprovalProcess);

if (!validation.valid) {
  console.error('検証エラー:');
  validation.errors.forEach(error => {
    console.error(`- ${error.type}: ${error.message}`);
  });
  process.exit(1);
}

console.log('✅ プロセス検証成功');
```

#### ステップ 3: 人手タスク管理の設定

```typescript
import { HumanTaskManager } from '@gftd/bpmn-sdk/human';

const taskManager = new HumanTaskManager(runtime);

// SLA設定
const slaDefinition = {
  duration: 24 * 60 * 60 * 1000, // 24時間
  businessHours: {
    timezone: 'Asia/Tokyo',
    workingDays: [1, 2, 3, 4, 5], // 月-金
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  }
};

// エスカレーション設定
const escalationActions = [{
  type: 'reassign' as const,
  trigger: 'warning' as const,
  delay: 60 * 60 * 1000, // 1時間後
  targetUsers: ['supervisor@example.com'],
  message: '承認タスクが1時間を超えています'
}];
```

#### ステップ 4: 監視システムの設定

```typescript
import { BpmnMonitor } from '@gftd/bpmn-sdk/ops';

const monitor = new BpmnMonitor({
  serviceName: 'invoice-approval-service',
  metrics: {
    enabled: true,
    interval: 30000 // 30秒
  },
  alerts: {
    enabled: true,
    thresholds: {
      maxProcessInstances: 100,
      maxErrorRate: 0.05,
      maxAverageDuration: 7 * 24 * 60 * 60 * 1000, // 1週間
      slaBreachRate: 0.1
    }
  }
});

monitor.attachToRuntime(runtime);
```

#### ステップ 5: プロセス実行

```typescript
import { deployAndStart } from '@gftd/bpmn-sdk/runtime';

// プロセスデプロイ
const { runtime, context } = await deployAndStart(invoiceApprovalProcess, {
  variables: {
    amount: 2500,
    invoiceId: 'INV-2024-001',
    managerId: 'manager@example.com',
    approvalDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  businessKey: 'INV-2024-001'
});

console.log(`プロセス開始: ${context.instanceId}`);

// イベント監視
runtime.onEvent((event) => {
  console.log(`イベント: ${event.type}`, {
    activity: event.activityId,
    status: event.type
  });

  // 人手タスク作成イベント
  if (event.type === 'activity.wait' && event.activityType === 'userTask') {
    console.log('人手タスク待機中:', event.activityId);
  }
});
```

#### ステップ 6: タスク操作

```typescript
// タスクの検索と請求
const pendingTasks = taskManager.getTasksForUser('manager@example.com');

if (pendingTasks.length > 0) {
  const approvalTask = pendingTasks[0];

  // タスク請求
  await taskManager.claimTask(approvalTask.id, 'manager@example.com');

  // 承認処理
  await taskManager.completeTask(approvalTask.id, 'manager@example.com', {
    approved: true,
    approvalDate: new Date(),
    comments: '承認しました。支払処理へ進めてください。'
  });

  console.log('タスク完了');
}
```

### チュートリアル: プロパティベーステスト

```typescript
import { bpmnPropertyTest, bpmnScenarioTest } from '@gftd/bpmn-sdk/testing';

// プロパティテスト
const deadEndTest = await bpmnPropertyTest(runtime, invoiceProcess, 'noDeadEnds', {
  maxTestCases: 50
});

console.log(`Dead End Test: ${deadEndTest.success ? '✅' : '❌'}`);

// シナリオテスト
const scenarios = [
  {
    id: 'low_amount_flow',
    description: '少額請求書の自動承認フロー',
    inputs: { amount: 500 },
    expectedPath: ['InvoiceReceived', 'ValidateInvoice', 'AmountCheck', 'AutoApprove', 'ProcessPayment', 'ProcessComplete']
  },
  {
    id: 'high_amount_flow',
    description: '高額請求書の手動承認フロー',
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
# 全テスト実行
pnpm test

# E2E統合テスト実行
pnpm --filter e2e-integration start

# パッケージ別テスト実行
pnpm --filter @gftd/bpmn-sdk/core test
pnpm --filter @gftd/bpmn-sdk/validation test
pnpm --filter @gftd/bpmn-sdk/human test
```

### APIドキュメント生成
```bash
# TypeDoc APIドキュメント生成
pnpm docs

# ドキュメントサーバー起動
pnpm docs:serve
```

**E2E統合テスト結果:**
- ✅ DSL → IR変換
- ✅ IR → BPMN XMLコンパイル
- ✅ プロセスデプロイと実行 (`bpmn-engine`)
- ✅ ランタイムイベント監視
- ✅ 人手タスク管理
- ✅ 静的検証統合
- ✅ プロパティベーステスト
- ✅ OpenTelemetry監視
- 🔄 XML → IRラウンドトリップ (一部調整必要)

### Building
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @gftd/bpmn-sdk/dsl build
```

## 📚 Examples

実践的な使用例を `examples/` ディレクトリで提供しています：

### 🧪 統合テスト
- **`e2e-integration/`**: 全コンポーネント統合テスト
  - 完全なE2Eワークフロー実行
  - 各コンポーネント間の連携検証
  - Jestベースの包括的テストスイート

### 💼 ビジネスプロセス例
- **`e2e-minimal/`**: 基本的なプロセス実行
  - シンプルなStart → Task → Endフロー
  - BPMN SDKの基本機能デモ

- **`order-processing/`**: 注文処理ワークフロー
  - 複雑なビジネスプロセス
  - 条件分岐（XORゲートウェイ）
  - 人手タスク管理
  - エラーハンドリング（境界イベント）
  - SLA管理とエスカレーション
  - 在庫チェックと支払い処理
  - 配送管理

### 🚀 実行方法

```bash
# 統合テスト実行
pnpm --filter e2e-integration start

# 注文処理デモ実行
pnpm --filter order-processing start

# 基本例実行
pnpm --filter e2e-minimal start
```

### 📖 学習パス

1. **基本編**: `e2e-minimal` でBPMN SDKの基礎を学ぶ
2. **統合編**: `e2e-integration` で全コンポーネントの連携を理解
3. **実践編**: `order-processing` で実際のビジネスプロセスを実装

各例には詳細なコメントと説明が含まれており、すぐに実装を開始できます。

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
