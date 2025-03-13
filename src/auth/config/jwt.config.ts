import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET,
    accessTokenExpiresIn: Number(
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? '3600',
    ),
    refreshTokenExpiresIn: Number(
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? '14400',
    ),
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
  };
});
