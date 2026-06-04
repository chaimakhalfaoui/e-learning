export default function corsMiddleware(req, res, next) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://isetso-frontend-972224594125.s3-website-us-east-1.amazonaws.com'
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
}
