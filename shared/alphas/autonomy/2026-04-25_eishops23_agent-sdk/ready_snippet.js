import { RendsClient } from '@rends/agent-sdk';

const client = new RendsClient({
  apiKey: 'ac_live_...',
  orgId: 'your-org-uuid',
  agentId: 'your-agent-uuid',
  mode: 'enforce',  // 'enforce' | 'monitor' | 'dry-run'
});

// Wrap any tool call with governance
const result = await client.govern(
  {
    actionType: 'database_query',
    actionName: 'select_users',
    resourceType: 'customer_records',
    inputSummary: 'SELECT * FROM users WHERE region = us-east-1',
    metadata: { dataClassification: 'pii' },
  },
  async (params) => db.query('SELECT * FROM users WHERE region = $1', ['us-east-1'])
);

// result.allowed = true/false
// result.status = 'pass' | 'warn' | 'block'
// result.result = query output (if allowed)
// result.check.violations = [] (if blocked, why)

// Flush telemetry before exit
await client.drain();
