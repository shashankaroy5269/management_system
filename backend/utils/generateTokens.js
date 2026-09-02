import jwt from 'jsonwebtoken';

/**
 * Generate short-lived Access Token for API request authorization
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET || 'production_super_secret_jwt_access_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  );
};

/**
 * Generate long-lived Refresh Token for regenerating access tokens
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id
    },
    process.env.JWT_REFRESH_SECRET || 'production_super_secret_jwt_refresh_key_2026',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};

/**
 * Helper to build auth response payload with optional secure cookie setup
 */
export const sendTokenResponse = (user, statusCode, res, message = 'Authentication successful') => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Cookie options for production security (HTTP-only)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      status: user.status
    }
  });
};
