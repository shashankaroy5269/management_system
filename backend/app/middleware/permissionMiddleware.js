import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import StatusCode from '../utils/statusCode.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const roles = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/role.json'), 'utf-8')
);

const checkPermission = (permission) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role || !roles[role] || !roles[role].includes(permission)) {
      logger(`Unauthorized Access: ${req.user?.email || 'Unknown'} tried ${permission}`);
      return res.status(StatusCode.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

export default checkPermission;
