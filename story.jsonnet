// Merkle DAG: gftd-bpmn-sdk process network story
// SOLID原則に基づく依存DAG最小化、エントロピー最小化
// 実行はトポロジカルソート、問題解決は逆トポロジカルソート

local utils = import 'internal/utils.libsonnet';

// Core Process Network Nodes
local nodes = {
  // Infrastructure Layer (Foundation)
  setup_monorepo: {
    id: 'setup_monorepo',
    type: 'infrastructure',
    description: 'モノレポ雛形作成 (pnpm workspaces + turborepo)',
    dependencies: [],
    outputs: ['package.json', 'pnpm-workspace.yaml', 'turbo.json'],
    status: 'pending',
  },

  setup_typescript: {
    id: 'setup_typescript',
    type: 'infrastructure',
    description: 'TypeScript + Biome設定',
    dependencies: ['setup_monorepo'],
    outputs: ['tsconfig.json', 'biome.json'],
    status: 'pending',
  },

  // Core Layer (BPMN 2.0 Foundation)
  core_types: {
    id: 'core_types',
    type: 'core',
    description: 'BPMN 2.0 要素の型定義 (完全網羅)',
    dependencies: ['setup_typescript'],
    outputs: ['packages/core/src/types/'],
    status: 'pending',
  },

  core_ir: {
    id: 'core_ir',
    description: '内部表現 (IR) とユーティリティ',
    dependencies: ['core_types'],
    outputs: ['packages/core/src/ir/'],
    status: 'pending',
  },

  // DSL Layer (TypeScript Builder)
  dsl_builder: {
    id: 'dsl_builder',
    description: '宣言DSLの実装 (flow/events/tasks/gateways/subprocess)',
    dependencies: ['core_ir'],
    outputs: ['packages/dsl/src/'],
    status: 'pending',
  },

  // Compiler Layer (IR ↔ BPMN XML)
  compiler_xml: {
    id: 'compiler_xml',
    description: 'IR → BPMN 2.0 XML (bpmn-moddle ベース)',
    dependencies: ['core_ir', 'dsl_builder'],
    outputs: ['packages/compiler/src/'],
    status: 'pending',
  },

  importer_xml: {
    id: 'importer_xml',
    description: 'BPMN XML → IR (逆変換)',
    dependencies: ['core_ir', 'compiler_xml'],
    outputs: ['packages/importer/src/'],
    status: 'pending',
  },

  // Runtime Layer (bpmn-engine integration)
  runtime_engine: {
    id: 'runtime_engine',
    description: 'bpmn-engine との統合 (deploy/start/signal/timer)',
    dependencies: ['compiler_xml'],
    outputs: ['packages/runtime/src/'],
    status: 'pending',
  },

  // Human Task Layer
  human_tasks: {
    id: 'human_tasks',
    description: 'ヒューマンタスクAPI (割当/SLA/操作)',
    dependencies: ['runtime_engine'],
    outputs: ['packages/human/src/'],
    status: 'pending',
  },

  // Validation Layer
  validation_static: {
    id: 'validation_static',
    description: '静的検証 (到達性/整合性/条件網羅)',
    dependencies: ['core_ir'],
    outputs: ['packages/validation/src/'],
    status: 'pending',
  },

  // Testing Layer
  testing_framework: {
    id: 'testing_framework',
    description: 'プロパティテスト/準同型チェック',
    dependencies: ['validation_static', 'runtime_engine'],
    outputs: ['packages/testing/src/'],
    status: 'pending',
  },

  // Ops Layer
  ops_monitoring: {
    id: 'ops_monitoring',
    description: 'OpenTelemetry統合/監査イベント',
    dependencies: ['runtime_engine'],
    outputs: ['packages/ops/src/'],
    status: 'pending',
  },

  // E2E Integration Test
  e2e_minimal: {
    id: 'e2e_minimal',
    description: '最小スコープE2E (Start/User/Service/XOR/Timer/BoundaryError/CallActivity)',
    dependencies: ['dsl_builder', 'compiler_xml', 'importer_xml', 'runtime_engine'],
    outputs: ['examples/e2e-minimal/'],
    status: 'pending',
  },

  // Documentation & Examples
  docs_readme: {
    id: 'docs_readme',
    description: 'READMEと基本ドキュメント',
    dependencies: ['e2e_minimal'],
    outputs: ['README.md', 'docs/'],
    status: 'pending',
  },
};

// Dependency DAG validation
local validateDag = function(nodes) {
  local getDeps = function(nodeId) std.set(nodes[nodeId].dependencies);
  local allDeps = std.set(std.flattenArrays([
    getDeps(nodeId) for nodeId in std.objectFields(nodes)
  ]));
  local allNodes = std.set(std.objectFields(nodes));

  // Check for missing dependencies
  local missing = std.setDiff(allDeps, allNodes);
  if std.length(missing) > 0 then
    error 'Missing dependency nodes: ' + std.join(', ', missing)
  else
    nodes
};

// Validate and export
validateDag(nodes)
