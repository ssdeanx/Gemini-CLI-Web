import { transports, createLogger, format } from 'winston';
import 'winston-daily-rotate-file';
import * as fs from 'fs';

const logPath = process.env.LOG_PATH || 'logs/application-%DATE%.log';
const logDir = logPath.split('/')[0];

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const transport = new transports.DailyRotateFile({
  filename: logPath,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    transport
  ]
});

export default logger;
