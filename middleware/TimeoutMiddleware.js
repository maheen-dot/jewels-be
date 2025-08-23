const timeoutMiddleware = (timeout = 50000) => {
  return (req, res, next) => {
    res.setTimeout(timeout, () => {
      console.log(`Request timeout: ${req.method} ${req.url}`);
      if (!res.headersSent) {
        res.status(504).json({ 
          success: false, 
          message: 'Request timeout' 
        });
      }
    });
    next();
  };
};

module.exports = timeoutMiddleware;