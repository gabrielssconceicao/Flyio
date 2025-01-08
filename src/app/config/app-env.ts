import * as Joi from '@hapi/joi';
export default () => {
  return Joi.object({
    APP_PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
  });
};
