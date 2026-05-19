import promClient from 'prom-client';

// Créer un registre
export const register = new promClient.Registry();

// Métriques par défaut (CPU, mémoire, etc.)
promClient.collectDefaultMetrics({ register });

// Métriques personnalisées
export const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Durée des requêtes HTTP en secondes',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

export const errorCounter = new promClient.Counter({
    name: 'app_errors_total',
    help: 'Nombre total d\'erreurs'
});

export const activiteCounter = new promClient.Counter({
    name: 'activite_created_total',
    help: 'Nombre total d\'activités créées'
});

// Enregistrer les métriques
register.registerMetric(httpRequestDuration);
register.registerMetric(errorCounter);
register.registerMetric(activiteCounter);
