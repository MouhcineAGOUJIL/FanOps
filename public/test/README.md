# Test Sample Data

This folder contains standalone JSON files that mirror the data used by the FanOps UI. You can temporarily copy these objects into API mocks, Zustand store defaults, or service responses when you need to preview the interface with realistic values.

Files:
- `operations-suite.sample.json` – operations views (dashboard, gate monitoring, ticket validation, forecast, sponsors)
- `fan-experience.sample.json` – fan facing dashboards and promotions

To preview them in the UI, create a `.env.local` file and set:

```
VITE_USE_TEST_DATA=true
```

When this flag is enabled, the app automatically fetches the JSON files on boot and hydrates the Zustand store. Turning the flag off (or deleting this folder) simply falls back to live/mock services.
