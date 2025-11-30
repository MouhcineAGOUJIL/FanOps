# 📚 M1 Documentation Index

Complete documentation for the M1 Smart Stadium Flow Controller microservice.

---

## 🎯 **Start Here**

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](./README.md) | Main overview, quick start, API reference | Developers, Evaluators |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete system architecture & design | Technical Team, Professors |
| [DRAWIO_GUIDE.md](./DRAWIO_GUIDE.md) | Step-by-step diagram creation | Documentation Team |

---

## 🚀 **Deployment & Setup**

| Document | Purpose |
|----------|---------|
| [EXECUTION_GUIDE.md](./EXECUTION_GUIDE.md) | Local development + Azure deployment |
| [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md) | Azure Portal step-by-step guide |
| [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) | 5-minute presentation walkthrough |

---

## 🔧 **Integration & Testing**

| Document | Purpose |
|----------|---------|
| [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md) | API testing with Postman |
| [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) | React frontend integration guide |
| [../docs/integration_contracts.md](../docs/integration_contracts.md) | API contracts for M2/M3/M4 |
| [../docs/M1_INTEGRATION.md](../docs/M1_INTEGRATION.md) | Quick integration guide for other teams |

---

## 🐛 **Troubleshooting**

| Document | Purpose |
|----------|---------|
| [FIX_CORS.md](./FIX_CORS.md) | CORS configuration guide |
| [CORS_SETUP_FOR_COLLABORATOR.md](./CORS_SETUP_FOR_COLLABORATOR.md) | Adding collaborator origins |
| [FIX_POST_CORS.md](./FIX_POST_CORS.md) | POST method CORS issues |
| [ENABLE_UNIVERSAL_ACCESS.md](./ENABLE_UNIVERSAL_ACCESS.md) | Wildcard CORS (development) |

---

## 📂 **Project Structure**

```
M1-flow-azure/
├── 📄 Core Documentation
│   ├── README.md                       # Main documentation
│   ├── ARCHITECTURE.md                 # System architecture (NEW)
│   ├── DRAWIO_GUIDE.md                 # Diagram creation guide (NEW)
│   ├── DOCS_INDEX.md                   # This file (NEW)
│   ├── EXECUTION_GUIDE.md              # Deployment guide
│   ├── DEMO_SCRIPT.md                  # Presentation script
│   └── CLOUD_DEPLOYMENT.md             # Azure portal guide
│
├── 🧠 AI Engine
│   ├── agent/
│   │   ├── orchestration_agent.py      # GPT-powered decision agent
│   │   ├── function_definitions.py     # OpenAI function schemas
│   │   ├── function_executor.py        # Function implementations
│   │   └── decision_logger.py          # Audit trail
│   └── root_cause/
│       ├── anomaly_investigator.py     # RCA orchestrator
│       ├── hypothesis_generator.py     # GPT hypothesis generation
│       ├── hypothesis_tester.py        # Evidence collection
│       └── mitigation_recommender.py   # Action planning
│
├── 🌐 HTTP Handlers
│   ├── flow_ingest.py                  # POST /api/flow/ingest
│   ├── flow_status.py                  # GET /api/flow/status
│   ├── ai_insights.py                  # GET /api/flow/ai-insights
│   ├── investigation.py                # GET /api/flow/investigation/{id}
│   ├── process_queue.py                # Queue processor
│   └── agent_orchestrator.py           # Timer trigger (2 min)
│
├── 🔧 Configuration
│   ├── config/
│   │   ├── prompts/agent_system_prompt.txt
│   │   ├── mitigation_playbook.json
│   │   └── settings.py
│   ├── .env                            # Environment variables
│   ├── local.settings.json             # Local Azure Functions config
│   └── host.json                       # Functions runtime config
│
├── 🤖 ML/AI Shared Services
│   ├── shared/ml/
│   │   ├── models/wait_time_model.onnx     # Trained model (R²=0.9948)
│   │   ├── onnx_inference.py               # ONNX Runtime
│   │   └── aws_anomaly_client.py           # SageMaker client
│   ├── shared/openai_client.py             # OpenAI wrapper
│   ├── shared/storage_client.py            # Azure Storage
│   └── shared/models.py                    # Pydantic schemas
│
├── 📊 Scripts & Tools
│   ├── scripts/generate_data.py        # Synthetic data (50k samples)
│   ├── scripts/train_model.py          # Train LightGBM → ONNX
│   └── simulation/crowd_sim.py         # SimPy simulation
│
├── 🧪 Tests
│   ├── tests/test_agent.py             # Agent testing
│   ├── tests/test_rca.py               # RCA testing
│   └── tests/locustfile.py             # Load testing (100 req/s)
│
└── 🔗 Integration Files
    ├── M1-FanOps-Collection.json       # Postman collection
    └── requirements.txt                 # Python dependencies
```

---

## 🎓 **For Professors/Evaluators**

**Key Technical Innovations:**
1. **Multi-Model AI Stack**: ONNX (prediction) + GPT (reasoning) + SageMaker (anomaly)
2. **Autonomous AI Agent**: Function calling with chain-of-thought reasoning
3. **Bayesian RCA**: Evidence-based diagnosis with uncertainty quantification
4. **Hybrid Cloud**: Azure (Functions, Storage) + AWS (SageMaker) + OpenAI

**Demonstrated Learning:**
- ✅ Serverless architecture (Azure Functions)
- ✅ ML engineering (train → ONNX → deploy)
- ✅ AI agent design (GPT function calling)
- ✅ Multi-cloud integration
- ✅ Production engineering (caching, fallbacks, logging)

**Presentation Documents:**
1. [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) - 5-minute walkthrough
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical deep-dive
3. [DRAWIO_GUIDE.md](./DRAWIO_GUIDE.md) - Visual architecture

---

## 📈 **Performance Metrics**

- **ML Accuracy**: R² = 0.9948 (99.48%)
- **Latency**: <200ms (core), <5s (agent), <10s (RCA)
- **Throughput**: 100+ requests/second
- **Cost**: ~$10-30/month (OpenAI GPT-3.5)
- **Scalability**: Auto-scales to 200 instances

---

## 🔗 **Production Endpoints**

**Base URL**: `https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net`

- `POST /api/flow/ingest` - Ingest gate data
- `GET /api/flow/status` - Get gate status + ML predictions
- `GET /api/flow/ai-insights` - Query AI agent decisions
- `GET /api/flow/investigation/{id}` - Get RCA results

**CORS Enabled For:**
- localhost:5173
- ngrok (https://unabsolved-bullishly-curtis.ngrok-free.dev)
- AWS Amplify (https://main.dgkr7h0ph8j37.amplifyapp.com)

---

## 📞 **Support & Contact**

For integration support or questions:
1. Check [integration_contracts.md](../docs/integration_contracts.md)
2. Review [M1_INTEGRATION.md](../docs/M1_INTEGRATION.md)
3. Test with [Postman collection](./M1-FanOps-Collection.json)

---

**Last Updated**: November 24, 2025  
**Version**: 1.0 (Production)  
**Status**: ✅ Fully Operational
