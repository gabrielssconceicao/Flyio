import * as Joi from '@hapi/joi';

export const appEnvValidationSchema = () => {
  return Joi.object({
    NODE_ENV: Joi.string().required(),
    APP_PORT: Joi.number().default(3000),
    POSTGRES_USER:Joi.string().required(),
    POSTGRES_PASSWORD:Joi.string().required(),
    POSTGRES_DB:Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
    CLOUDINARY_CLOUD_NAME: Joi.string().required(),
    CLOUDINARY_API_KEY: Joi.string().required(),
    CLOUDINARY_API_SECRET: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
    JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
    JWT_TOKEN_AUDIENCE: Joi.string().required(),
    JWT_TOKEN_ISSUER: Joi.string().required(),
  });
};
