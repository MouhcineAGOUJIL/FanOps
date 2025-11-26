import { ApplicationInsights } from '@microsoft/applicationinsights-web';

/**
 * Azure Application Insights Telemetry Service
 * Connects the Frontend to Azure Sentinel via App Insights
 */

// Default config - Replace connectionString with your actual value from Azure Portal
const appInsights = new ApplicationInsights({
    config: {
        connectionString: import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING || '',
        enableAutoRouteTracking: true, // Track page views automatically
        enableCorsCorrelation: false,   // Disable to prevent CORS issues with AWS API Gateway
        enableRequestHeaderTracking: false,
        enableResponseHeaderTracking: false,
    }
});

// Only load if connection string is present
const connString = import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING;
if (connString) {
    appInsights.loadAppInsights();
    console.log(`🛡️ Azure Sentinel Telemetry: Active (Key starts with: ${connString.substring(0, 10)}...)`);

    // Send a test event immediately
    appInsights.trackEvent({ name: 'Sentinel_Integration_Test_Event', properties: { timestamp: new Date().toISOString() } });
    console.log('📨 Sent test event: Sentinel_Integration_Test_Event');
} else {
    console.error('⚠️ Azure Sentinel Telemetry: Disabled. VITE_APP_INSIGHTS_CONNECTION_STRING is missing!');
    console.log('Current Env Vars:', import.meta.env);
}

export const logEvent = (name, properties = {}) => {
    if (appInsights.appInsights.isInitialized()) {
        appInsights.trackEvent({ name, properties });
    }
};

export const logError = (error, severityLevel = 3) => {
    if (appInsights.appInsights.isInitialized()) {
        appInsights.trackException({ exception: error, severityLevel });
    }
};

export const logMetric = (name, average, properties = {}) => {
    if (appInsights.appInsights.isInitialized()) {
        appInsights.trackMetric({ name, average, properties });
    }
};

export default appInsights;
