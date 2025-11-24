# 📐 M1 Architecture - Draw.io Quick Guide

This document provides exact instructions to recreate the M1 system architecture in Draw.io.

---

## 🎨 **Canvas Setup**

1. **Create new diagram** (Blank)
2. **Page Size**: A3 Landscape
3. **Grid**: ON (10px)
4. **Background**: Light gray (#F5F5F5)

---

## **Layer 1: Frontend (Top)**

### Rectangle 1: "Frontend Applications"
- **Size**: 600x150px
- **Fill**: #E3F2FD (Light Blue)
- **Border**: 2px, #2196F3
- **Text**: "Frontend Applications" (Bold, 16px)

### Inside Rectangle 1, add 3 sub-boxes:
1. "React Dashboard\nlocalhost:5173" (150x80px, #BBDEFB)
2. "Ngrok\n...ngrok-free.dev" (150x80px, #BBDEFB)
3. "AWS Amplify\n...amplifyapp.com" (150x80px, #BBDEFB)

### Arrow Down ↓ (Blue, 3px, Dashed)
Text on arrow: "HTTPS REST API"

---

## **Layer 2: Azure Function App**

### Cloud Shape: "Azure Function App"
- **Shape**: Cloud (from General shapes)
- **Size**: 700x200px
- **Fill**: Gradient (#4285F4 → #1565C0)
- **Text**: "func-m1-fanops-comehdi\nPython 3.9 | France Central" (White, Bold)

### Inside Cloud, add 6 function boxes:

#### HTTP Triggers (Green rectangles):
1. **flow_ingest** (150x100px, #C8E6C9)
   - Label: "POST /flow/ingest"
   - Icon: ↓ (down arrow)
   
2. **flow_status** (150x100px, #C8E6C9)
   - Label: "GET /flow/status"
   - Icon: ⚡ (lightning)
   
3. **ai_insights** (150x100px, #C8E6C9)
   - Label: "GET /ai-insights"
   - Icon: 🧠 (brain)
   
4. **investigation** (150x100px, #C8E6C9)
   - Label: "GET /investigation/{id}"
   - Icon: 🔍 (magnifying glass)

#### Background Triggers (Yellow rectangles):
5. **process_queue** (150x100px, #FFF9C4)
   - Label: "Queue Trigger"
   - Icon: ⏱ (timer)
   
6. **agent_orchestrator** (150x100px, #FFE0B2)
   - Label: "Timer: Every 2 min"
   - Icon: 🤖 (robot)

---

## **Layer 3: Core Services (Middle)**

### Group: "AI/ML Services" (Dashed border, Green)

#### Hexagon 1: "ML Inference"
- **Shape**: Hexagon
- **Size**: 200x150px
- **Fill**: #A5D6A7
- **Text**: "ONNX Runtime\nLightGBM Model\nR²=0.9948"

#### Hexagon 2: "Anomaly Detection"
- **Shape**: Hexagon  
- **Size**: 200x150px
- **Fill**: #FFAB91
- **Text**: "AWS SageMaker\n(MOCK Mode)"

#### Hexagon 3: "AI Agent"
- **Shape**: Hexagon
- **Size**: 200x150px
- **Fill**: #CE93D8
- **Text**: "OpenAI GPT-3.5\nFunction Calling"

#### Hexagon 4: "RCA Engine"
- **Shape**: Hexagon
- **Size**: 200x150px
- **Fill**: #EF9A9A
- **Text**: "Root Cause Analysis\nBayesian Reasoning"

---

## **Layer 4: Storage (Bottom)**

### Group: "Azure Storage" (Dashed border, Cyan)

#### Cylinder 1: "gatestatus Table"
- **Shape**: Cylinder (Database)
- **Fill**: #80DEEA
- **Text**: "Gates Status\nML Predictions"

#### Cylinder 2: "aidecisions Table"
- **Shape**: Cylinder
- **Fill**: #80DEEA
- **Text**: "Agent Decisions\nReasoning"

#### Cylinder 3: "investigationlogs Table"
- **Shape**: Cylinder
- **Fill**: #80DEEA
- **Text**: "RCA Results\nHypotheses"

#### Queue Shape: "gates-inflow Queue"
- **Shape**: Queue (from AWS shapes)
- **Fill**: #BA68C8
- **Text**: "Async Buffer"

#### Folder: "Blob Storage"
- **Shape**: Folder
- **Fill**: #FFB74D
- **Text**: "ONNX Models\nConfigs"

---

## **Layer 5: External APIs (Right Side)**

### Cloud 1: "OpenAI API"
- **Shape**: Cloud
- **Fill**: #81C784
- **Text**: "GPT-3.5-Turbo\n$0.004/decision"

### Cloud 2: "AWS SageMaker"
- **Shape**: Cloud
- **Fill**: #FF8A65
- **Text**: "Anomaly Detection\neu-north-1"

---

## **Arrows & Data Flows**

### Flow 1: Ingestion (Blue solid arrows, 3px)
```
Frontend → flow_ingest → Queue → process_queue → ML Inference → gatestatus
```

### Flow 2: Status Query (Green solid arrows, 3px)
```
Frontend → flow_status → Read gatestatus → (if anomaly) → RCA Engine → investigationlogs → Return
```

### Flow 3: Agent Loop (Purple dashed arrows, 2px)
```
Timer → agent_orchestrator → OpenAI API → aidecisions Table
```

### Flow 4: RCA (Red dotted arrows, 2px)
```
Anomaly → RCA → OpenAI API → Hypothesis Testing → Bayesian → Mitigation → investigationlogs
```

---

## **Legend Box (Bottom Right)**

Create a legend box:
- **HTTP Trigger**: Green rectangle
- **Timer Trigger**: Yellow rectangle
- **Database**: Cyan cylinder
- **AI Service**: Colored hexagon
- **External API**: Cloud shape

---

## **Labels & Annotations**

Add text boxes for:
1. "Auto-scales to 200 instances" (near Azure Cloud)
2. "R²=0.9948 accuracy" (near ML hexagon)
3. "15-min cache" (near RCA hexagon)
4. "CORS: localhost, ngrok, amplify" (near Azure Cloud)

---

## **Final Touches**

1. **Align** all components using Draw.io alignment tools
2. **Group** related components (Ctrl+G)
3. **Add shadows** to major components (Format→Shadow)
4. **Export** as PNG (4x resolution for clarity)

---

**Estimated Time**: 20-30 minutes

**Result**: Professional cloud architecture diagram showing complete M1 system with all integrations, storage, and AI components.
