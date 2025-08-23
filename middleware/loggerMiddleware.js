const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  console.log(`→ ${req.method} ${req.url}`, new Date().toISOString());
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`← ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  res.on('close', () => {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      console.log(`✗ ${req.method} ${req.url} - Connection closed (${duration}ms)`);
    }
  });
  
  next();
};

module.exports = loggerMiddleware;
