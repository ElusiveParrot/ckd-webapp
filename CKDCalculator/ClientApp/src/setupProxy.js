const { createProxyMiddleware } = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
  ? env.ASPNETCORE_URLS.split(';')[0]
  : 'http://localhost:43906';

const context = [
  '/api/login',
  '/api/register',
  '/api/user/info',
  '/api/user/logout',
  '/api/user/measure',
  '/api/guest/measure',
  '/api/user/measurements',
  '/api/admin/subordinates',
  '/api/admin/patients_measurements',
  '/api/admin/edit',
  '/api/admin/search',
  '/api/admin/csv_calculator',
  '/api/admin/assign_supervisor',
  '/api/admin/clinicians',
  '/api/admin/managers'
];

module.exports = function (app) {
  const appProxy = createProxyMiddleware(context, {
    target: target,
    secure: false,
    headers: {
      Connection: 'Keep-Alive',
    },
  });

  app.use(appProxy);
};
