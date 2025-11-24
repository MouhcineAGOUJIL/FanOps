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
        enableCorsCorrelation: true,   // Correlate requests with backend
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
    }
});

// Only load if connection string is present
if (import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING) {
    appInsights.loadAppInsights();
    console.log('🛡️ Azure Sentinel Telemetry: Active');
} else {
    console.log('⚠️ Azure Sentinel Telemetry: Disabled (Missing Connection String)');
}

export const logEvent = (name, properties = {}) => {
    if (appInsights.appInsights.isInitialized()) {
        appInsights.trackEvent({ name }, properties);
    }
};

export const logError = (error, severityLevel = 3) => {
    if (appInsights.appInsights.isInitialized()) {
        appInsights.trackException({ error, severityLevel });
    }
};

export const logMetric = (name, average, properties = {}) => {
    if (appInsights.appInsights.isInitialized()) {
        appInsights.trackMetric({ name, average }, properties);
    }
};

export default appInsights;
