import { transports as _transports, createLogger, format as _format } from 'winston';
import 'winston-daily-rotate-file';

const transport = new _transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = createLogger({
  level: 'info',
  format: _format.combine(
    _format.timestamp(),
    _format.json()
  ),
  transports: [
    new _transports.Console(),
    transport
  ]
});

export default logger;
