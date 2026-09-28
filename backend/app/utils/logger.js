import fs from 'fs';

const logger = (message) => {
  const log = `${new Date().toISOString()} : ${message}\n`;
  try {
    fs.appendFileSync('logs.txt', log);
  } catch (err) {
    console.error('Logger file write error:', err.message);
  }
};

export default logger;
