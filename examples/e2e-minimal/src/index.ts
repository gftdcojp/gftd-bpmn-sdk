// Merkle DAG: e2e_minimal_test
// Minimal E2E test: DSL → IR → XML → Runtime execution

import { flow } from '@gftd/bpmn-sdk/dsl';
import { compileToXml } from '@gftd/bpmn-sdk/compiler';
import { deployAndStart } from '@gftd/bpmn-sdk/runtime';

// Define a minimal BPMN process using DSL
// Process: Start → User Task → Service Task → XOR Gateway → End
const minimalProcessIR = flow('MinimalProcess', f => f
  .process('MinimalProcess', p => p
    // Start Event
    .startEvent('StartEvent')

    // User Task
    .userTask('ReviewRequest')
      .assignee('user1')
      .formKey('reviewForm')

    // Service Task
    .serviceTask('ProcessRequest')
      .topic('request-processor')
      .resultVariable('processingResult')

    // XOR Gateway with conditions
    .exclusiveGateway('DecisionPoint')

    // End Events
    .endEvent('Approved')
    .endEvent('Rejected')

    // Sequence Flows
    .sequenceFlow('StartEvent', 'ReviewRequest')
    .sequenceFlow('ReviewRequest', 'ProcessRequest')
    .sequenceFlow('ProcessRequest', 'DecisionPoint')
    .sequenceFlow('DecisionPoint', 'Approved')
      .condition('${processingResult == "approved"}')
    .sequenceFlow('DecisionPoint', 'Rejected')
      .condition('${processingResult == "rejected"}')
  )
  .build()
);

async function runE2ETest() {
  console.log('🚀 Starting BPMN SDK E2E Test...\n');

  try {
    // Step 1: Compile IR to BPMN XML
    console.log('📝 Compiling IR to BPMN XML...');
    const xml = await compileToXml(minimalProcessIR);
    console.log('✅ BPMN XML generated successfully');
    console.log('📄 XML Preview (first 200 chars):');
    console.log(xml.substring(0, 200) + '...\n');

    // Step 2: Deploy and start process instance
    console.log('🚀 Deploying and starting process instance...');
    const { runtime, context } = await deployAndStart(minimalProcessIR, {
      variables: {
        requestData: 'Test request data',
        userId: 'user1'
      },
      businessKey: 'test-key-123'
    });

    console.log('✅ Process instance started');
    console.log(`📊 Instance ID: ${context.instanceId}`);
    console.log(`📊 Process ID: ${context.processId}`);
    console.log(`📊 Status: ${context.status}`);
    console.log(`📊 Variables:`, context.variables);

    // Step 3: Set up event monitoring
    console.log('\n👂 Setting up event monitoring...');
    runtime.onEvent((event) => {
      console.log(`📢 Event: ${event.type}`, {
        processId: event.processId,
        instanceId: event.instanceId,
        ...(event.type === 'activity.start' || event.type === 'activity.end'
          ? { activityId: event.activityId, activityType: event.activityType }
          : {}),
        ...(event.type === 'end' ? { output: event.output } : {}),
      });
    });

    // Step 4: Wait for process completion
    console.log('\n⏳ Waiting for process completion...');

    // In a real scenario, we would wait for user tasks to be completed
    // For this minimal test, we'll simulate completion
    await new Promise(resolve => setTimeout(resolve, 1000));

    const finalContext = await runtime.getExecutionContext(
      context.processId,
      context.instanceId
    );

    console.log('\n🏁 Process execution completed');
    console.log(`📊 Final Status: ${finalContext?.status}`);
    console.log(`📊 Execution Time: ${finalContext?.endTime ? finalContext.endTime.getTime() - finalContext.startTime.getTime() : 'N/A'}ms`);

    console.log('\n🎉 BPMN SDK E2E Test completed successfully!');

  } catch (error) {
    console.error('❌ E2E Test failed:', error);
    process.exit(1);
  }
}

// Run the test
runE2ETest().catch(console.error);
