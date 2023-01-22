const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const validateUser = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: passwordComplexity().required(),
        role: Joi.string().valid('admin','user')
    });
    return schema.validate(user);
};

const validateUpdateUser = (user) => {
    const schema = Joi.object({
        email: Joi.string().email(),
        role: Joi.string().valid('admin','user')
    });
    return schema.validate(user);
};

module.exports = {validateUser, validateUpdateUser};