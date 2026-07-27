export function corsMiddleware(req: any, res: any, next?: () => void) {
  res.setHeader('X-Platform', 'UpFrica');
  res.setHeader('X-Domain', 'UpFrica.africa');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Platform, X-Domain');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (next) {
    next();
  }
}
