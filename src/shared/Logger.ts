import { Application } from 'express';
import morgan from 'morgan';
import { createStream } from 'rotating-file-stream';
import { environment } from '../config/env';

const accessLogStream = createStream(environment.requestLogFile, {
  interval: environment.requestLogRollingInterval,
  path: environment.logDir
});

const consoleAppender = morgan(environment.requestLogFormat);
const fileAppender = morgan(environment.requestLogFormat, {
  stream: accessLogStream
});

export const registerRequestLogger = (app: Application) => {
  app.use(consoleAppender);

  if (environment.nodeEnv === 'production') {
    app.use(fileAppender);
  }
}