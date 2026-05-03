import Joi from "joi";

export const UserSpec = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).label("UserSpec");

export const UserCredentialsSpec = Joi.object()
  .keys({
    email: Joi.string().email().example("homer@simpson.com").required(),
    password: Joi.string().example("secret").required(),
  })
  .label("UserCredentials");

export const ExhibitionSpec = Joi.object({
  title: Joi.string().required(),
  artist: Joi.string().required(),
  // Matching your earlier change where duration is a String
  duration: Joi.string().allow("").optional(), 
  description: Joi.string().allow("").optional(),
  startDate: Joi.string().allow("").optional(),
  endDate: Joi.string().allow("").optional(),
}).label("ExhibitionSpec");

export const MuseumSpec = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(""),
  categoryId: Joi.string().required(),
  latitude: Joi.number().allow(null),
  longitude: Joi.number().allow(null),
}).label("MuseumSpec");

export const JwtAuth = Joi.object()
  .keys({
    success: Joi.boolean().example(true).required(),
    token: Joi.string().example("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...").required(),
  })
  .label("JwtAuth");
