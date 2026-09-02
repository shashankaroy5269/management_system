import { execSync } from 'child_process';
import fs from 'fs';

try {
  if (fs.existsSync('./frontend')) {
    console.log('Detected root directory. Building frontend...');
    execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  } else {
    console.log('Detected frontend directory. Building directly...');
    execSync('npm run build', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Build execution failed:', error);
  process.exit(1);
}
