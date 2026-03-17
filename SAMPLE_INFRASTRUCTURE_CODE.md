# Sample Infrastructure Codes for Testing

Copy and paste these into your Infrastructure Code editor to test grouping and layouts.

---

## 1. Payment Request Platform (Like Your Reference Image)

```yaml
# Payment Request Platform - High Level Architecture
# Horizontal swimlanes showing different layers

groups:
  # Main architectural layers (horizontal swimlanes)
  - id: api-layer
    name: API LAYER
    color: "#fbbf24"
    position: { x: 50, y: 50 }
    size: { width: 1400, height: 120 }

  - id: security-layer
    name: SECURITY LAYER
    color: "#60a5fa"
    position: { x: 50, y: 200 }
    size: { width: 600, height: 120 }

  - id: backend-layer
    name: BACKEND
    color: "#a78bfa"
    position: { x: 700, y: 200 }
    size: { width: 750, height: 120 }

  # Database layer
  - id: postgresql
    name: POSTGRESQL
    color: "#34d399"
    position: { x: 1050, y: 350 }
    size: { width: 400, height: 120 }

  # Service groups (vertical sections)
  - id: customer
    name: CUSTOMER
    color: "#ec4899"
    position: { x: 1050, y: 500 }
    size: { width: 180, height: 150 }

  - id: franchisor
    name: FRANCHISOR
    color: "#8b5cf6"
    position: { x: 1270, y: 500 }
    size: { width: 180, height: 150 }

  - id: payments-platform
    name: PAYMENTS PLATFORM
    color: "#f87171"
    position: { x: 1050, y: 680 }
    size: { width: 400, height: 150 }

nodes:
  # API Layer Components
  - id: supplier-portal
    label: Supplier Portal
    type: server
    icon: globe
    group: api-layer
    position: { x: 80, y: 70 }

  - id: web-ui
    label: Web UI
    type: server
    icon: globe
    group: api-layer
    position: { x: 280, y: 70 }

  - id: api-gateway
    label: API Gateway
    type: api-gateway
    icon: api-gateway
    group: api-layer
    position: { x: 480, y: 70 }

  - id: mobile-app
    label: Mobile App
    type: server
    icon: globe
    group: api-layer
    position: { x: 680, y: 70 }

  - id: backend-service
    label: Backend Service
    type: server
    icon: server
    group: api-layer
    position: { x: 880, y: 70 }

  # Security Layer
  - id: security-layer-node
    label: Security Layer
    type: server
    icon: server
    group: security-layer
    position: { x: 180, y: 220 }

  - id: aws-api-gateway
    label: AWS API Gateway
    type: api-gateway
    icon: api-gateway
    group: security-layer
    position: { x: 380, y: 220 }

  - id: aws-waf
    label: AWS WAF / DDOS
    type: server
    icon: server
    group: security-layer
    position: { x: 480, y: 220 }

  # Backend Services
  - id: kafka-event-bus
    label: Kafka Event Bus
    type: queue
    icon: queue
    group: backend-layer
    position: { x: 730, y: 220 }

  - id: node-fastify
    label: Node.js / Fastify
    type: server
    icon: server
    group: backend-layer
    position: { x: 930, y: 220 }

  - id: enriched-data
    label: Enriched Data
    type: database
    icon: database
    group: backend-layer
    position: { x: 1130, y: 220 }

  # Database layer
  - id: file-storage
    label: File Storage
    type: s3
    icon: s3
    group: postgresql
    position: { x: 1080, y: 370 }

  - id: aws-s3
    label: AWS S3
    type: s3
    icon: s3
    group: postgresql
    position: { x: 1280, y: 370 }

  # Customer Services
  - id: parex-ocr
    label: Parex OCR Engine
    type: server
    icon: server
    group: customer
    position: { x: 1080, y: 520 }

  - id: document-processor
    label: Document Processor
    type: server
    icon: worker
    group: customer
    position: { x: 1080, y: 600 }

  # Franchisor Services
  - id: franchisor-service
    label: Franchisor Service
    type: server
    icon: server
    group: franchisor
    position: { x: 1300, y: 560 }

  # Payments
  - id: integration-api
    label: Integration API
    type: api-gateway
    icon: api-gateway
    group: payments-platform
    position: { x: 1080, y: 700 }

  - id: payment-processor
    label: Payment Request Processor
    type: server
    icon: server
    group: payments-platform
    position: { x: 1280, y: 700 }

connections:
  # Flow from API layer to Security
  - from: api-gateway
    to: security-layer-node
    animated: true

  # Security to Backend
  - from: aws-api-gateway
    to: kafka-event-bus
    animated: true

  # Backend connections
  - from: kafka-event-bus
    to: node-fastify
    animated: true

  - from: node-fastify
    to: enriched-data
    animated: true

  # Database connections
  - from: enriched-data
    to: file-storage

  - from: file-storage
    to: aws-s3

  # Service connections
  - from: node-fastify
    to: parex-ocr

  - from: parex-ocr
    to: document-processor

  - from: node-fastify
    to: franchisor-service

  - from: node-fastify
    to: integration-api

  - from: integration-api
    to: payment-processor
```

---

## 2. E-Commerce Microservices Architecture

```yaml
# E-Commerce Platform with Microservices
# Shows layered architecture with API Gateway, Services, and Data layers

groups:
  # Frontend Layer
  - id: frontend
    name: FRONTEND
    color: "#3b82f6"
    position: { x: 50, y: 50 }
    size: { width: 1200, height: 120 }

  # API Layer
  - id: api-layer
    name: API LAYER
    color: "#ec4899"
    position: { x: 50, y: 200 }
    size: { width: 400, height: 120 }

  # Services Layer
  - id: services
    name: BACKEND SERVICES
    color: "#8b5cf6"
    position: { x: 50, y: 350 }
    size: { width: 1200, height: 250 }

  # Data Layer
  - id: data-layer
    name: DATA LAYER
    color: "#10b981"
    position: { x: 50, y: 650 }
    size: { width: 1200, height: 150 }

  # External Services
  - id: external
    name: EXTERNAL SERVICES
    color: "#f97316"
    position: { x: 1300, y: 350 }
    size: { width: 250, height: 250 }

nodes:
  # Frontend
  - id: web-app
    label: Web App
    type: server
    icon: globe
    group: frontend
    position: { x: 100, y: 70 }

  - id: mobile-app
    label: Mobile App
    type: server
    icon: globe
    group: frontend
    position: { x: 300, y: 70 }

  - id: admin-panel
    label: Admin Panel
    type: server
    icon: globe
    group: frontend
    position: { x: 500, y: 70 }

  # API Layer
  - id: api-gateway
    label: API Gateway
    type: api-gateway
    icon: api-gateway
    group: api-layer
    position: { x: 150, y: 220 }

  - id: load-balancer
    label: Load Balancer
    type: load-balancer
    icon: load-balancer
    group: api-layer
    position: { x: 320, y: 220 }

  # Backend Services
  - id: auth-service
    label: Auth Service
    type: server
    icon: server
    group: services
    position: { x: 100, y: 390 }

  - id: user-service
    label: User Service
    type: server
    icon: server
    group: services
    position: { x: 280, y: 390 }

  - id: product-service
    label: Product Service
    type: server
    icon: server
    group: services
    position: { x: 460, y: 390 }

  - id: order-service
    label: Order Service
    type: server
    icon: server
    group: services
    position: { x: 640, y: 390 }

  - id: payment-service
    label: Payment Service
    type: server
    icon: server
    group: services
    position: { x: 820, y: 390 }

  - id: notification-service
    label: Notification Service
    type: server
    icon: server
    group: services
    position: { x: 1000, y: 390 }

  - id: search-service
    label: Search Service
    type: server
    icon: server
    group: services
    position: { x: 280, y: 510 }

  - id: inventory-service
    label: Inventory Service
    type: server
    icon: server
    group: services
    position: { x: 460, y: 510 }

  - id: shipping-service
    label: Shipping Service
    type: server
    icon: server
    group: services
    position: { x: 640, y: 510 }

  # Data Layer
  - id: postgresql
    label: PostgreSQL
    type: database
    icon: database
    group: data-layer
    position: { x: 100, y: 670 }

  - id: mongodb
    label: MongoDB
    type: database
    icon: database
    group: data-layer
    position: { x: 300, y: 670 }

  - id: redis
    label: Redis Cache
    type: redis
    icon: redis
    group: data-layer
    position: { x: 500, y: 670 }

  - id: elasticsearch
    label: Elasticsearch
    type: database
    icon: database
    group: data-layer
    position: { x: 700, y: 670 }

  - id: s3-storage
    label: S3 Storage
    type: s3
    icon: s3
    group: data-layer
    position: { x: 900, y: 670 }

  # External Services
  - id: stripe
    label: Stripe
    type: server
    icon: server
    group: external
    position: { x: 1330, y: 380 }

  - id: sendgrid
    label: SendGrid
    type: server
    icon: server
    group: external
    position: { x: 1330, y: 480 }

  - id: twilio
    label: Twilio
    type: server
    icon: server
    group: external
    position: { x: 1330, y: 560 }

connections:
  # Frontend to API
  - from: web-app
    to: api-gateway
    animated: true

  - from: mobile-app
    to: api-gateway
    animated: true

  - from: admin-panel
    to: api-gateway
    animated: true

  # API Gateway to Services
  - from: api-gateway
    to: load-balancer
    animated: true

  - from: load-balancer
    to: auth-service
    animated: true

  - from: load-balancer
    to: user-service
    animated: true

  - from: load-balancer
    to: product-service
    animated: true

  - from: load-balancer
    to: order-service
    animated: true

  # Services to Data
  - from: auth-service
    to: redis

  - from: user-service
    to: postgresql

  - from: product-service
    to: mongodb

  - from: order-service
    to: postgresql

  - from: payment-service
    to: postgresql

  - from: search-service
    to: elasticsearch

  - from: inventory-service
    to: mongodb

  - from: shipping-service
    to: postgresql

  # External integrations
  - from: payment-service
    to: stripe
    animated: true

  - from: notification-service
    to: sendgrid
    animated: true

  - from: notification-service
    to: twilio
    animated: true

  # Cache connections
  - from: product-service
    to: redis

  - from: order-service
    to: redis
```

---

## 3. AWS Cloud Infrastructure

```yaml
# AWS Cloud Infrastructure
# Shows VPC, subnets, and cloud resources

groups:
  # VPC
  - id: vpc
    name: VPC
    color: "#3b82f6"
    position: { x: 50, y: 50 }
    size: { width: 1300, height: 700 }

  # Public Subnet
  - id: public-subnet
    name: PUBLIC SUBNET
    color: "#10b981"
    position: { x: 100, y: 100 }
    size: { width: 600, height: 250 }

  # Private Subnet
  - id: private-subnet
    name: PRIVATE SUBNET
    color: "#f97316"
    position: { x: 100, y: 400 }
    size: { width: 600, height: 300 }

  # Database Subnet
  - id: db-subnet
    name: DATABASE SUBNET
    color: "#8b5cf6"
    position: { x: 750, y: 400 }
    size: { width: 550, height: 300 }

nodes:
  # Internet Gateway (outside VPC)
  - id: internet-gateway
    label: Internet Gateway
    type: api-gateway
    icon: globe
    position: { x: 400, y: 0 }

  # Public Subnet Resources
  - id: alb
    label: Application Load Balancer
    type: load-balancer
    icon: load-balancer
    group: public-subnet
    position: { x: 200, y: 150 }

  - id: nat-gateway
    label: NAT Gateway
    type: api-gateway
    icon: globe
    group: public-subnet
    position: { x: 450, y: 150 }

  - id: bastion
    label: Bastion Host
    type: ec2
    icon: server
    group: public-subnet
    position: { x: 200, y: 260 }

  # Private Subnet Resources
  - id: ec2-1
    label: EC2 Instance 1
    type: ec2
    icon: server
    group: private-subnet
    position: { x: 150, y: 450 }

  - id: ec2-2
    label: EC2 Instance 2
    type: ec2
    icon: server
    group: private-subnet
    position: { x: 350, y: 450 }

  - id: ec2-3
    label: EC2 Instance 3
    type: ec2
    icon: server
    group: private-subnet
    position: { x: 550, y: 450 }

  - id: lambda-1
    label: Lambda Function
    type: lambda
    icon: lambda
    group: private-subnet
    position: { x: 200, y: 580 }

  - id: lambda-2
    label: Lambda Worker
    type: lambda
    icon: lambda
    group: private-subnet
    position: { x: 400, y: 580 }

  # Database Subnet Resources
  - id: rds-primary
    label: RDS Primary
    type: database
    icon: database
    group: db-subnet
    position: { x: 800, y: 450 }

  - id: rds-replica
    label: RDS Read Replica
    type: database
    icon: database
    group: db-subnet
    position: { x: 1000, y: 450 }

  - id: elasticache
    label: ElastiCache
    type: redis
    icon: redis
    group: db-subnet
    position: { x: 800, y: 580 }

  - id: documentdb
    label: DocumentDB
    type: database
    icon: database
    group: db-subnet
    position: { x: 1000, y: 580 }

  # External AWS Services
  - id: s3
    label: S3 Bucket
    type: s3
    icon: s3
    position: { x: 100, y: 800 }

  - id: cloudfront
    label: CloudFront CDN
    type: cloud
    icon: cloud
    position: { x: 300, y: 800 }

  - id: route53
    label: Route 53
    type: globe
    icon: globe
    position: { x: 500, y: 800 }

connections:
  # Internet to Public
  - from: internet-gateway
    to: alb
    animated: true

  # Load Balancer to EC2
  - from: alb
    to: ec2-1
    animated: true

  - from: alb
    to: ec2-2
    animated: true

  - from: alb
    to: ec2-3
    animated: true

  # EC2 to Database
  - from: ec2-1
    to: rds-primary

  - from: ec2-2
    to: rds-primary

  - from: ec2-3
    to: rds-primary

  # Read replica
  - from: rds-primary
    to: rds-replica

  # Cache connections
  - from: ec2-1
    to: elasticache

  - from: lambda-1
    to: documentdb

  - from: lambda-2
    to: elasticache

  # NAT Gateway for outbound
  - from: ec2-1
    to: nat-gateway

  # External services
  - from: alb
    to: cloudfront

  - from: cloudfront
    to: s3

  - from: route53
    to: cloudfront
```

---

## 4. Simple Three-Tier Architecture

```yaml
# Simple Three-Tier Web Application
# Perfect for testing basic grouping

groups:
  - id: presentation
    name: PRESENTATION TIER
    color: "#3b82f6"
    position: { x: 100, y: 50 }
    size: { width: 400, height: 200 }

  - id: application
    name: APPLICATION TIER
    color: "#8b5cf6"
    position: { x: 600, y: 50 }
    size: { width: 400, height: 200 }

  - id: data
    name: DATA TIER
    color: "#10b981"
    position: { x: 1100, y: 50 }
    size: { width: 300, height: 200 }

nodes:
  # Presentation
  - id: web-ui
    label: Web UI
    type: server
    icon: globe
    group: presentation
    position: { x: 200, y: 100 }

  - id: mobile-ui
    label: Mobile UI
    type: server
    icon: globe
    group: presentation
    position: { x: 350, y: 100 }

  # Application
  - id: api-server
    label: API Server
    type: server
    icon: server
    group: application
    position: { x: 700, y: 100 }

  - id: business-logic
    label: Business Logic
    type: worker
    icon: worker
    group: application
    position: { x: 850, y: 100 }

  # Data
  - id: database
    label: Database
    type: database
    icon: database
    group: data
    position: { x: 1200, y: 100 }

connections:
  - from: web-ui
    to: api-server
    animated: true

  - from: mobile-ui
    to: api-server
    animated: true

  - from: api-server
    to: business-logic

  - from: business-logic
    to: database
```

---

## How to Test

1. **Open** your Architecture > Infrastructure page
2. **Click** the "Code" button to show the code editor
3. **Copy** any of the sample codes above
4. **Paste** into the Infrastructure Code editor (replace existing code)
5. **Click** "Generate" button
6. **Drag** the resize handle (right edge of code panel) to adjust panel width
7. **Observe** the grouping and layout

## What to Look For

- ✅ Groups appear as colored boxes with labels
- ✅ Nodes are positioned inside their groups
- ✅ Connections flow between nodes
- ✅ You can drag nodes within groups
- ✅ Layout respects hierarchy
- ✅ Colors match the defined color scheme
