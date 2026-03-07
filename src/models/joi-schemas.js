import Joi from "joi";

export const UserSpec = {
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};

export const UserCredentialsSpec = Joi.object()
  .keys({
    email: Joi.string().email().example("homer@simpson.com").required(),
    password: Joi.string().example("secret").required(),
  })
  .label("UserCredentials");

export const ExhibitionSpec = {
  title: Joi.string().required(),
  artist: Joi.string().required(),
  duration: Joi.number().allow("").optional(),
};

export const MuseumSpec = {
  title: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  latitude: Joi.number().allow("").optional(),
  longitude: Joi.number().allow("").optional(),
};

export const JwtAuth = Joi.object()
  .keys({
    success: Joi.boolean().example(true).required(),
    token: Joi.string().example("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...").required(),
  })
  .label("JwtAuth");