'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { useEffect, useRef, useState } from 'react';
import { Copy, Download } from 'lucide-react';
import type mermaidAPI from 'mermaid';

// Default template
const DEFAULT_CODE = `graph TB
    subgraph "Client Layer"
        Web[Web Application<br/>React + TypeScript]
        Mobile[Mobile App<br/>React Native]
    end

    subgraph "API Layer"
        Gateway[API Gateway<br/>Kong/Nginx]
        Auth[Auth Service<br/>OAuth 2.0]
    end

    subgraph "Application Layer"
        API[REST API<br/>Node.js + Express]
        GraphQL[GraphQL API<br/>Apollo Server]
        Workers[Background Workers<br/>Bull Queue]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Primary Database)]
        Cache[(Redis<br/>Cache Layer)]
        S3[S3 Bucket<br/>File Storage]
    end

    subgraph "External Services"
        Email[Email Service<br/>SendGrid]
        Analytics[Analytics<br/>Mixpanel]
    end

    Web -->|HTTPS| Gateway
    Mobile -->|HTTPS| Gateway
    Gateway --> Auth
    Gateway --> API
    Gateway --> GraphQL

    API --> DB
    API --> Cache
    GraphQL --> DB
    GraphQL --> Cache

    API --> Workers
    Workers --> DB
    Workers --> Email

    API --> S3
    API --> Analytics

    style Web fill:#61DAFB,stroke:#000,stroke-width:2px,color:#000
    style Mobile fill:#61DAFB,stroke:#000,stroke-width:2px,color:#000
    style Gateway fill:#FF6C37,stroke:#000,stroke-width:2px
    style Auth fill:#6DB33F,stroke:#000,stroke-width:2px
    style API fill:#68A063,stroke:#000,stroke-width:2px
    style GraphQL fill:#E10098,stroke:#000,stroke-width:2px
    style Workers fill:#D00000,stroke:#000,stroke-width:2px
    style DB fill:#336791,stroke:#000,stroke-width:2px
    style Cache fill:#DC382D,stroke:#000,stroke-width:2px
    style S3 fill:#FF9900,stroke:#000,stroke-width:2px
    style Email fill:#3498DB,stroke:#000,stroke-width:2px
    style Analytics fill:#7A49A5,stroke:#000,stroke-width:2px`;

export default function CodeDiagramEditor() {
  const { project, setArchitectureMermaidCode } = useProjectStore();
  const [code, setCode] = useState(project?.architectureMermaidCode || DEFAULT_CODE);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<typeof mermaidAPI | null>(null);

  // Initialize mermaid
  useEffect(() => {
    const loadMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaidRef.current = mermaid;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
        });

        setMermaidLoaded(true);
      } catch (err) {
        console.error('Failed to load mermaid:', err);
        setError('Failed to load diagram library');
      }
    };

    loadMermaid();
  }, []);

  // Render diagram
  useEffect(() => {
    const renderDiagram = async () => {
      if (!code || !diagramRef.current || !mermaidLoaded || !mermaidRef.current) return;

      try {
        setError(null);
        diagramRef.current.innerHTML = '';

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaidRef.current.render(id, code);
        diagramRef.current.innerHTML = svg;

        setArchitectureMermaidCode(code);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    const debounce = setTimeout(renderDiagram, 500);
    return () => clearTimeout(debounce);
  }, [code, setArchitectureMermaidCode, mermaidLoaded]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = diagramRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadTemplate = (template: string) => {
    const templates: Record<string, string> = {
      microservices: `graph TB
    subgraph "Frontend"
        UI[Web UI<br/>React]
    end

    subgraph "Backend Services"
        Gateway[API Gateway]
        Auth[Auth Service]
        User[User Service]
        Order[Order Service]
        Payment[Payment Service]
    end

    subgraph "Data Stores"
        UserDB[(User DB)]
        OrderDB[(Order DB)]
        PaymentDB[(Payment DB)]
    end

    UI --> Gateway
    Gateway --> Auth
    Gateway --> User
    Gateway --> Order
    Gateway --> Payment

    User --> UserDB
    Order --> OrderDB
    Payment --> PaymentDB

    style UI fill:#61DAFB,stroke:#000,stroke-width:2px
    style Gateway fill:#FF6C37,stroke:#000,stroke-width:2px
    style Auth fill:#6DB33F,stroke:#000,stroke-width:2px`,

      aws: `graph TB
    subgraph "AWS Cloud"
        subgraph "VPC"
            subgraph "Public Subnet"
                ALB[Application Load Balancer]
            end

            subgraph "Private Subnet"
                EC2[EC2 Instances<br/>Auto Scaling Group]
                Lambda[Lambda Functions]
            end
        end

        RDS[(RDS PostgreSQL<br/>Multi-AZ)]
        S3[S3 Bucket<br/>Static Assets]
        CloudFront[CloudFront CDN]
        Route53[Route 53<br/>DNS]
    end

    Users[Users] --> Route53
    Route53 --> CloudFront
    CloudFront --> ALB
    CloudFront --> S3
    ALB --> EC2
    EC2 --> RDS
    EC2 --> S3
    Lambda --> RDS

    style ALB fill:#FF9900,stroke:#000,stroke-width:2px
    style EC2 fill:#FF9900,stroke:#000,stroke-width:2px
    style Lambda fill:#FF9900,stroke:#000,stroke-width:2px
    style RDS fill:#527FFF,stroke:#000,stroke-width:2px
    style S3 fill:#569A31,stroke:#000,stroke-width:2px
    style CloudFront fill:#8C4FFF,stroke:#000,stroke-width:2px`,
    };

    setCode(templates[template] || DEFAULT_CODE);
  };

  return (
    <div className="h-full flex">
      {/* Left: Code Editor */}
      <div className="w-1/2 flex flex-col bg-gray-900 border-r border-gray-700">
        {/* Toolbar */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">Mermaid Code</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCode(DEFAULT_CODE)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
              >
                Full Stack
              </button>
              <button
                onClick={() => loadTemplate('microservices')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
              >
                Microservices
              </button>
              <button
                onClick={() => loadTemplate('aws')}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-medium transition-colors"
              >
                AWS
              </button>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
          >
            <Copy className="w-3 h-3" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Code Editor */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 w-full p-6 font-mono text-sm resize-none focus:outline-none bg-gray-900 text-gray-100"
          style={{
            lineHeight: '1.6',
            tabSize: 4,
          }}
          spellCheck={false}
          placeholder="Enter your Mermaid diagram code here..."
        />

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-gray-400 text-xs flex items-center justify-between">
          <a
            href="https://mermaid.js.org/intro/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            📚 Mermaid Documentation →
          </a>
          <span>Live preview updates as you type</span>
        </div>
      </div>

      {/* Right: Diagram Preview */}
      <div className="w-1/2 flex flex-col bg-gray-950">
        {/* Toolbar */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <span className="text-white font-semibold">Live Preview</span>
          <div className="flex items-center gap-2">
            {error && <span className="text-xs text-red-400 font-medium">Syntax Error</span>}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              Export SVG
            </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
          {!mermaidLoaded ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-400">Loading renderer...</p>
            </div>
          ) : error ? (
            <div className="max-w-md p-6 bg-red-900/20 border border-red-600 rounded-lg">
              <h3 className="text-red-400 font-semibold mb-2">Syntax Error</h3>
              <p className="text-red-300 text-sm">{error}</p>
              <p className="text-red-400 text-xs mt-3">Check your Mermaid syntax and try again.</p>
            </div>
          ) : (
            <div
              ref={diagramRef}
              className="mermaid-container max-w-full"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
