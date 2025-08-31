export const errorHandler = (err, req, res, next) => {
  // Centralized server-side logging with request context
  // eslint-disable-next-line no-console
  console.error('[API ERROR]', {
    method: req.method,
    url: req.originalUrl,
    message: err?.message,
    name: err?.name,
    code: err?.code,
    stack: err?.stack,
  })

  // Validation errors
  if (err?.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: Object.values(err.errors).map(v => v.message),
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    })
  }

  // Duplicate key
  if (err?.name === 'MongoServerError' && err?.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
      fields: Object.keys(err.keyPattern || {}),
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    })
  }

  const isProd = process.env.NODE_ENV === 'production'
  return res.status(500).json({
    success: false,
    message: isProd ? 'Server Error' : (err?.message || 'Server Error'),
    ...(isProd ? {} : { stack: err?.stack, name: err?.name, code: err?.code }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  })
}