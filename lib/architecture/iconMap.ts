// Central icon + style resolver for architecture nodes.
// Maps a free-text service name / type to a real Iconify brand logo (or a clean
// generic glyph) plus an accent colour and a short type badge — this is what gives
// the diagram its "eraser.io" look. Brand logos come from the Iconify `logos:` set;
// generic glyphs come from the `lucide:` set, so everything renders through one
// <Icon /> component.

export interface IconSpec {
  /** Iconify icon id, e.g. "logos:postgresql" or "lucide:server" */
  icon: string;
  /** Short uppercase badge shown above the node name */
  label: string;
  /** Accent colour for the left bar, badge and icon tint */
  accent: string;
  /** True when `icon` is a full-colour brand logo (skip accent tinting) */
  brand: boolean;
}

type Category =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'cache'
  | 'storage'
  | 'queue'
  | 'network'
  | 'security'
  | 'analytics'
  | 'ai'
  | 'external'
  | 'generic';

// Muted, desaturated accents tuned so nodes read as soft pastels (or calm bold
// fills) rather than neon. Feeds the colour-mode theme in lib/architecture/theme.ts.
const CAT_ACCENT: Record<Category, string> = {
  frontend: '#4F7CC4', // muted blue
  backend: '#7B6FD0', // muted indigo/violet
  database: '#3F9E6E', // muted emerald
  cache: '#D9695F', // muted coral/red
  storage: '#9B7ED0', // muted purple
  queue: '#C99A3F', // muted amber
  network: '#4A93C7', // muted sky
  security: '#C56FA0', // muted pink
  analytics: '#9A6FC0', // muted purple
  ai: '#3FA89A', // muted teal
  external: '#CF8A4A', // muted orange
  generic: '#7B8595', // slate
};

const CAT_LABEL: Record<Category, string> = {
  frontend: 'CLIENT',
  backend: 'SERVICE',
  database: 'DATABASE',
  cache: 'CACHE',
  storage: 'STORAGE',
  queue: 'QUEUE',
  network: 'NETWORK',
  security: 'SECURITY',
  analytics: 'ANALYTICS',
  ai: 'AI / ML',
  external: 'EXTERNAL',
  generic: 'SERVICE',
};

interface Entry {
  /** All lookup keys / aliases (normalised) that resolve to this entry */
  keys: string[];
  icon: string;
  category: Category;
  /** Override the category badge label (optional) */
  label?: string;
  /** Override the category accent (optional) */
  accent?: string;
  /** Whether `icon` is a full-colour brand logo (default: true for logos:* entries) */
  brand?: boolean;
}

// Brand + service catalogue. Order matters only for readability; lookup is by key.
const CATALOG: Entry[] = [
  // ── Frontend / clients ────────────────────────────────────────────────
  { keys: ['react', 'reactjs', 'react-native'], icon: 'logos:react', category: 'frontend', label: 'FRONTEND' },
  { keys: ['nextjs', 'next'], icon: 'logos:nextjs-icon', category: 'frontend', label: 'FRONTEND' },
  { keys: ['vue', 'vuejs'], icon: 'logos:vue', category: 'frontend', label: 'FRONTEND' },
  { keys: ['angular'], icon: 'logos:angular-icon', category: 'frontend', label: 'FRONTEND' },
  { keys: ['svelte'], icon: 'logos:svelte-icon', category: 'frontend', label: 'FRONTEND' },
  { keys: ['flutter'], icon: 'logos:flutter', category: 'frontend', label: 'MOBILE' },
  { keys: ['ios', 'swift', 'apple'], icon: 'logos:swift', category: 'frontend', label: 'MOBILE' },
  { keys: ['android', 'kotlin'], icon: 'logos:android-icon', category: 'frontend', label: 'MOBILE' },
  { keys: ['web', 'webapp', 'website', 'browser', 'spa', 'dashboard', 'webclient'], icon: 'lucide:globe', category: 'frontend', label: 'WEB', brand: false },
  { keys: ['mobile', 'mobileapp', 'phone', 'app'], icon: 'lucide:smartphone', category: 'frontend', label: 'MOBILE', brand: false },
  { keys: ['admin', 'adminpanel', 'backoffice', 'cms'], icon: 'lucide:monitor', category: 'frontend', label: 'ADMIN', brand: false },
  { keys: ['user', 'users', 'client', 'customer', 'actor'], icon: 'lucide:users', category: 'frontend', label: 'USERS', brand: false },

  // ── Backend / runtimes ────────────────────────────────────────────────
  { keys: ['node', 'nodejs', 'express', 'nestjs'], icon: 'logos:nodejs-icon', category: 'backend' },
  { keys: ['python', 'django', 'flask', 'fastapi'], icon: 'logos:python', category: 'backend' },
  { keys: ['go', 'golang'], icon: 'logos:go', category: 'backend' },
  { keys: ['java', 'spring', 'springboot'], icon: 'logos:java', category: 'backend' },
  { keys: ['ruby', 'rails'], icon: 'logos:ruby', category: 'backend' },
  { keys: ['php', 'laravel'], icon: 'logos:php', category: 'backend' },
  { keys: ['rust'], icon: 'logos:rust', category: 'backend' },
  { keys: ['dotnet', 'csharp', 'aspnet'], icon: 'logos:dotnet', category: 'backend' },
  { keys: ['graphql', 'apollo'], icon: 'logos:graphql', category: 'backend', label: 'GRAPHQL' },
  { keys: ['server', 'backend', 'monolith', 'app-server', 'appserver'], icon: 'lucide:server', category: 'backend', label: 'SERVICE', brand: false },
  { keys: ['service', 'microservice', 'svc'], icon: 'lucide:box', category: 'backend', label: 'SERVICE', brand: false },
  { keys: ['worker', 'job', 'cron', 'scheduler', 'consumer'], icon: 'lucide:cpu', category: 'backend', label: 'WORKER', brand: false },
  { keys: ['function', 'serverless', 'faas'], icon: 'lucide:zap', category: 'backend', label: 'FUNCTION', brand: false },

  // ── Databases ─────────────────────────────────────────────────────────
  { keys: ['postgres', 'postgresql', 'pg', 'postgre'], icon: 'logos:postgresql', category: 'database' },
  { keys: ['mysql', 'mariadb'], icon: 'logos:mysql', category: 'database' },
  { keys: ['mongo', 'mongodb'], icon: 'logos:mongodb-icon', category: 'database' },
  { keys: ['sqlite'], icon: 'logos:sqlite', category: 'database' },
  { keys: ['elasticsearch', 'elastic', 'opensearch'], icon: 'logos:elasticsearch', category: 'database', label: 'SEARCH' },
  { keys: ['cassandra'], icon: 'logos:cassandra', category: 'database' },
  { keys: ['dynamodb', 'dynamo'], icon: 'logos:aws-dynamodb', category: 'database' },
  { keys: ['cockroachdb', 'cockroach'], icon: 'lucide:database', category: 'database', brand: false },
  { keys: ['supabase'], icon: 'logos:supabase-icon', category: 'database' },
  { keys: ['firebase', 'firestore'], icon: 'logos:firebase', category: 'database' },
  { keys: ['neo4j', 'graphdb'], icon: 'logos:neo4j', category: 'database', label: 'GRAPH DB' },
  { keys: ['rds'], icon: 'logos:aws-rds', category: 'database' },
  { keys: ['database', 'db', 'sql', 'datastore', 'rdbms'], icon: 'lucide:database', category: 'database', brand: false },

  // ── Cache ─────────────────────────────────────────────────────────────
  { keys: ['redis'], icon: 'logos:redis', category: 'cache' },
  { keys: ['memcached', 'memcache'], icon: 'lucide:zap', category: 'cache', brand: false },
  { keys: ['elasticache'], icon: 'logos:aws-elasticache', category: 'cache' },
  { keys: ['cache'], icon: 'lucide:zap', category: 'cache', brand: false },

  // ── Storage ───────────────────────────────────────────────────────────
  { keys: ['s3', 'awss3', 'bucket', 'objectstorage'], icon: 'logos:aws-s3', category: 'storage' },
  { keys: ['gcs', 'cloudstorage'], icon: 'logos:google-cloud', category: 'storage' },
  { keys: ['blobstorage', 'azureblob'], icon: 'logos:microsoft-azure', category: 'storage' },
  { keys: ['storage', 'filestore', 'files', 'disk', 'volume'], icon: 'lucide:hard-drive', category: 'storage', brand: false },

  // ── Queue / messaging / streaming ─────────────────────────────────────
  { keys: ['kafka'], icon: 'logos:kafka-icon', category: 'queue', label: 'STREAM' },
  { keys: ['rabbitmq', 'rabbit', 'amqp'], icon: 'logos:rabbitmq-icon', category: 'queue' },
  { keys: ['sqs'], icon: 'logos:aws-sqs', category: 'queue' },
  { keys: ['sns', 'pubsub'], icon: 'logos:aws-sns', category: 'queue', label: 'PUB/SUB' },
  { keys: ['nats'], icon: 'logos:nats-icon', category: 'queue' },
  { keys: ['queue', 'messagequeue', 'broker', 'eventbus', 'mq'], icon: 'lucide:layers', category: 'queue', brand: false },

  // ── Network / gateway / edge ──────────────────────────────────────────
  { keys: ['apigateway', 'gateway', 'api', 'apigw'], icon: 'lucide:webhook', category: 'network', label: 'API GATEWAY', brand: false },
  { keys: ['awsapigateway'], icon: 'logos:aws-api-gateway', category: 'network', label: 'API GATEWAY' },
  { keys: ['loadbalancer', 'lb', 'alb', 'elb', 'nlb'], icon: 'lucide:network', category: 'network', label: 'LOAD BALANCER', brand: false },
  { keys: ['nginx'], icon: 'logos:nginx', category: 'network', label: 'PROXY' },
  { keys: ['cloudfront', 'cdn', 'edge'], icon: 'lucide:globe', category: 'network', label: 'CDN', brand: false },
  { keys: ['cloudflare'], icon: 'logos:cloudflare-icon', category: 'network', label: 'CDN' },
  { keys: ['route53', 'dns'], icon: 'lucide:milestone', category: 'network', label: 'DNS', brand: false },
  { keys: ['vpc', 'subnet', 'vpn', 'network'], icon: 'lucide:network', category: 'network', brand: false },

  // ── Security / auth ───────────────────────────────────────────────────
  { keys: ['auth', 'authentication', 'authservice', 'identity', 'iam'], icon: 'lucide:lock', category: 'security', label: 'AUTH', brand: false },
  { keys: ['auth0'], icon: 'logos:auth0-icon', category: 'security', label: 'AUTH' },
  { keys: ['cognito'], icon: 'logos:aws-cognito', category: 'security', label: 'AUTH' },
  { keys: ['clerk'], icon: 'lucide:fingerprint', category: 'security', label: 'AUTH', brand: false },
  { keys: ['keycloak'], icon: 'simple-icons:keycloak', category: 'security', label: 'AUTH', brand: false },
  { keys: ['firewall', 'waf', 'security', 'shield'], icon: 'lucide:shield', category: 'security', brand: false },
  { keys: ['vault', 'secrets', 'kms'], icon: 'lucide:key-round', category: 'security', label: 'SECRETS', brand: false },

  // ── Analytics / monitoring ────────────────────────────────────────────
  { keys: ['analytics', 'bi', 'reporting', 'metrics'], icon: 'lucide:bar-chart-3', category: 'analytics', brand: false },
  { keys: ['grafana'], icon: 'logos:grafana', category: 'analytics', label: 'DASHBOARD' },
  { keys: ['prometheus'], icon: 'logos:prometheus', category: 'analytics', label: 'METRICS' },
  { keys: ['datadog'], icon: 'logos:datadog', category: 'analytics', label: 'MONITOR' },
  { keys: ['sentry'], icon: 'logos:sentry-icon', category: 'analytics', label: 'MONITOR' },
  { keys: ['snowflake'], icon: 'logos:snowflake-icon', category: 'analytics', label: 'WAREHOUSE' },
  { keys: ['bigquery'], icon: 'logos:google-cloud', category: 'analytics', label: 'WAREHOUSE' },
  { keys: ['spark', 'databricks'], icon: 'logos:apache-spark', category: 'analytics', label: 'DATA' },
  { keys: ['monitoring', 'observability', 'logs', 'logging'], icon: 'lucide:activity', category: 'analytics', label: 'MONITOR', brand: false },

  // ── AI / ML ───────────────────────────────────────────────────────────
  { keys: ['openai', 'gpt', 'chatgpt'], icon: 'logos:openai-icon', category: 'ai' },
  { keys: ['anthropic', 'claude'], icon: 'logos:anthropic-icon', category: 'ai' },
  { keys: ['huggingface', 'hf'], icon: 'logos:hugging-face-icon', category: 'ai' },
  { keys: ['langchain'], icon: 'simple-icons:langchain', category: 'ai', brand: false },
  { keys: ['pinecone', 'vectordb', 'weaviate', 'qdrant', 'chroma'], icon: 'lucide:brain', category: 'ai', label: 'VECTOR DB', brand: false },
  { keys: ['tensorflow'], icon: 'logos:tensorflow', category: 'ai', label: 'ML' },
  { keys: ['pytorch'], icon: 'logos:pytorch-icon', category: 'ai', label: 'ML' },
  { keys: ['llm', 'ai', 'ml', 'model', 'inference', 'aiservice'], icon: 'lucide:sparkles', category: 'ai', brand: false },

  // ── Infra / platform ──────────────────────────────────────────────────
  { keys: ['docker', 'container'], icon: 'logos:docker-icon', category: 'backend', label: 'CONTAINER' },
  { keys: ['kubernetes', 'k8s', 'eks', 'gke', 'aks'], icon: 'logos:kubernetes', category: 'backend', label: 'CLUSTER' },
  { keys: ['terraform'], icon: 'logos:terraform-icon', category: 'backend', label: 'IAC' },
  { keys: ['ec2', 'compute', 'vm', 'instance'], icon: 'logos:aws-ec2', category: 'backend', label: 'COMPUTE' },
  { keys: ['lambda'], icon: 'logos:aws-lambda', category: 'backend', label: 'FUNCTION' },
  { keys: ['aws', 'amazon'], icon: 'logos:aws', category: 'external', label: 'AWS' },
  { keys: ['gcp', 'googlecloud', 'google'], icon: 'logos:google-cloud', category: 'external', label: 'GCP' },
  { keys: ['azure', 'microsoft'], icon: 'logos:microsoft-azure', category: 'external', label: 'AZURE' },
  { keys: ['vercel'], icon: 'logos:vercel-icon', category: 'external' },

  // ── External / 3rd-party ──────────────────────────────────────────────
  { keys: ['stripe', 'payment', 'payments', 'billing'], icon: 'logos:stripe', category: 'external', label: 'PAYMENTS' },
  { keys: ['razorpay'], icon: 'lucide:credit-card', category: 'external', label: 'PAYMENTS', brand: false },
  { keys: ['twilio'], icon: 'logos:twilio-icon', category: 'external', label: 'SMS / VOICE' },
  { keys: ['livekit', 'webrtc'], icon: 'lucide:radio', category: 'external', label: 'REALTIME', brand: false },
  { keys: ['sendgrid', 'email', 'mail', 'smtp', 'ses'], icon: 'lucide:mail', category: 'external', label: 'EMAIL', brand: false },
  { keys: ['notification', 'push', 'fcm'], icon: 'lucide:bell', category: 'external', label: 'NOTIFY', brand: false },
  { keys: ['websocket', 'ws', 'socket', 'realtime'], icon: 'lucide:cable', category: 'network', label: 'REALTIME', brand: false },
  { keys: ['thirdparty', 'external', 'integration', 'apiexternal'], icon: 'lucide:plug', category: 'external', brand: false },

  // ── Bare glyph-name aliases (legacy `icon:` hints used across the app) ──
  // These only resolve when nothing more specific (service/label) matched.
  { keys: ['globe'], icon: 'lucide:globe', category: 'frontend', label: 'WEB', brand: false },
  { keys: ['monitor'], icon: 'lucide:monitor', category: 'frontend', label: 'ADMIN', brand: false },
  { keys: ['cloud'], icon: 'lucide:cloud', category: 'network', label: 'CLOUD', brand: false },
  { keys: ['lock'], icon: 'lucide:lock', category: 'security', label: 'AUTH', brand: false },
  { keys: ['shield'], icon: 'lucide:shield', category: 'security', brand: false },
  { keys: ['bell'], icon: 'lucide:bell', category: 'external', label: 'NOTIFY', brand: false },
  { keys: ['mail'], icon: 'lucide:mail', category: 'external', label: 'EMAIL', brand: false },
  { keys: ['key'], icon: 'lucide:key-round', category: 'security', label: 'SECRETS', brand: false },
  { keys: ['cpu'], icon: 'lucide:cpu', category: 'backend', label: 'WORKER', brand: false },
  { keys: ['zap'], icon: 'lucide:zap', category: 'backend', label: 'FUNCTION', brand: false },
  { keys: ['harddrive'], icon: 'lucide:hard-drive', category: 'storage', brand: false },
  { keys: ['network'], icon: 'lucide:network', category: 'network', brand: false },
  { keys: ['activity'], icon: 'lucide:activity', category: 'analytics', label: 'MONITOR', brand: false },
  { keys: ['barchart', 'barchart3'], icon: 'lucide:bar-chart-3', category: 'analytics', brand: false },
  { keys: ['creditcard'], icon: 'lucide:credit-card', category: 'external', label: 'PAYMENTS', brand: false },
  { keys: ['workflow'], icon: 'lucide:workflow', category: 'queue', brand: false },
  { keys: ['settings'], icon: 'lucide:settings', category: 'generic', brand: false },
  { keys: ['box'], icon: 'lucide:box', category: 'backend', label: 'SERVICE', brand: false },
];

// Build a fast lookup index from every key to its entry.
const INDEX = new Map<string, Entry>();
for (const entry of CATALOG) {
  for (const key of entry.keys) {
    if (!INDEX.has(key)) INDEX.set(key, entry);
  }
}

/** Normalise free text to a comparable key: lowercase, strip non-alphanumerics. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toSpec(entry: Entry): IconSpec {
  const accent = entry.accent ?? CAT_ACCENT[entry.category];
  const label = entry.label ?? CAT_LABEL[entry.category];
  const brand = entry.brand ?? entry.icon.startsWith('logos:');
  return { icon: entry.icon, label, accent, brand };
}

const FALLBACK: IconSpec = {
  icon: 'lucide:box',
  label: 'SERVICE',
  accent: CAT_ACCENT.generic,
  brand: false,
};

/**
 * Resolve a node's service/type/label to an icon + style.
 * Tries, in order: exact key match → substring/keyword match against the
 * combined text → generic fallback. This makes the LLM's free-text service
 * names robust to spelling and phrasing.
 */
export function resolveIcon(opts: { service?: string; type?: string; label?: string }): IconSpec {
  // Priority: explicit service key → human label (often specific, e.g.
  // "PostgreSQL") → node type (often generic, e.g. "server").
  const candidates = [opts.service, opts.label, opts.type].filter(Boolean) as string[];

  // 1) Exact normalised match on any candidate.
  for (const c of candidates) {
    const hit = INDEX.get(normalize(c));
    if (hit) return toSpec(hit);
  }

  // 2) Keyword / substring match. Longer keys first to prefer specific matches
  //    (e.g. "apigateway" before "api", "postgresql" before "sql").
  const haystacks = candidates.map(normalize);
  const sortedKeys = [...INDEX.keys()].sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (key.length < 3) continue; // avoid spurious 2-char hits
    for (const h of haystacks) {
      if (h.includes(key)) return toSpec(INDEX.get(key)!);
    }
  }

  // 3) Fallback.
  return FALLBACK;
}

/** Convenience list for the node palette (one representative entry per common service). */
export const PALETTE_SERVICES: { service: string; label: string }[] = [
  { service: 'web', label: 'Web App' },
  { service: 'mobile', label: 'Mobile App' },
  { service: 'apigateway', label: 'API Gateway' },
  { service: 'loadbalancer', label: 'Load Balancer' },
  { service: 'server', label: 'Service' },
  { service: 'lambda', label: 'Lambda' },
  { service: 'worker', label: 'Worker' },
  { service: 'postgres', label: 'PostgreSQL' },
  { service: 'mysql', label: 'MySQL' },
  { service: 'mongodb', label: 'MongoDB' },
  { service: 'redis', label: 'Redis' },
  { service: 's3', label: 'S3 Storage' },
  { service: 'kafka', label: 'Kafka' },
  { service: 'rabbitmq', label: 'RabbitMQ' },
  { service: 'queue', label: 'Queue' },
  { service: 'auth', label: 'Auth' },
  { service: 'firewall', label: 'Firewall' },
  { service: 'cloudfront', label: 'CDN' },
  { service: 'analytics', label: 'Analytics' },
  { service: 'openai', label: 'OpenAI' },
  { service: 'llm', label: 'AI Model' },
  { service: 'stripe', label: 'Payments' },
  { service: 'email', label: 'Email' },
  { service: 'docker', label: 'Container' },
  { service: 'kubernetes', label: 'Kubernetes' },
];

/** Canonical service vocabulary handed to the LLM so generated names map to logos. */
export const SERVICE_VOCABULARY: string[] = [
  'web', 'mobile', 'admin', 'user',
  'react', 'nextjs', 'vue', 'angular', 'flutter',
  'node', 'python', 'go', 'java', 'ruby', 'php', 'rust', 'dotnet', 'graphql',
  'server', 'service', 'worker', 'function', 'lambda', 'ec2', 'docker', 'kubernetes',
  'postgres', 'mysql', 'mongodb', 'sqlite', 'elasticsearch', 'cassandra', 'dynamodb', 'rds', 'supabase', 'firebase', 'neo4j', 'database',
  'redis', 'memcached', 'elasticache', 'cache',
  's3', 'storage',
  'kafka', 'rabbitmq', 'sqs', 'sns', 'nats', 'queue',
  'apigateway', 'loadbalancer', 'nginx', 'cloudfront', 'cloudflare', 'route53', 'vpc',
  'auth', 'auth0', 'cognito', 'clerk', 'firewall', 'vault',
  'analytics', 'grafana', 'prometheus', 'datadog', 'sentry', 'snowflake', 'monitoring',
  'openai', 'anthropic', 'huggingface', 'langchain', 'pinecone', 'llm',
  'stripe', 'twilio', 'livekit', 'sendgrid', 'notification', 'websocket', 'external',
];
