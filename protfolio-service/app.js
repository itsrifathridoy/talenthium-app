import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import httpProxy from 'http-proxy';
import indexRouter from './routes/index.js';
import kafkaConsumer from './kafka/consumer.js';


const app = express();
const proxy = httpProxy.createProxyServer({});

// Initialize Kafka consumer
kafkaConsumer.start().catch(error => {
  console.error('Failed to start Kafka consumer:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing Kafka consumer');
  await kafkaConsumer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing Kafka consumer');
  await kafkaConsumer.disconnect();
  process.exit(0);
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Reverse proxy middleware for subdomain routing
app.use((req, res, next) => {
  const hostname = req.hostname;
  const parts = hostname.split('.');
  
  if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
    const subdomain = parts[0];
    
    if (req.url === '/' || req.url === '') {
      req.url = `/protfolio/software-developer/${subdomain}`;
    }
    
    proxy.web(req, res, { 
      target: 'http://localhost:3000',
      changeOrigin: true
    });
    return;
  }
  next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
