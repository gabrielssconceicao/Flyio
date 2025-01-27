import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET,
    jwtTtl: Number(process.env.JWT_TTL ?? '3600'),
  };
});
