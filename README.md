# CAN 2025 – FanOps Multicloud Platform

## Vision
A multi-cloud cloud platform for managing CAN 2025 matches in real-time. It handles fan flow, ticket security, attendance forecasting, and smart sponsorship.

## Project Structure
-   **`/M1-flow-azure`**: Smart Stadium Flow Controller (Azure + AWS ML).
-   **`/M2-security-aws`**: Secure Gates (AWS).
-   **`/M3-forecast-gcp`**: Attendance Forecast (GCP).
-   **`/M4-sponsor-gcp`**: Sponsor Smart Matching (GCP).
-   **`/frontend`**: React/Next.js Web Application.
-   **`/docs`**: [Project Documentation](./docs/).

## Documentation
-   [Global Architecture](./docs/architecture.md)
-   [M1 Documentation](./M1-flow-azure/README.md)

## Quick Start (M1)
1.  Go to `M1-flow-azure`.
2.  Install requirements: `pip install -r requirements.txt`.
3.  Run locally: `func start`.
