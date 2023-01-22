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

const validateEmail = (userEmail) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
    });
    return schema.validate({email: userEmail});
};

const validatePassword = (userPassword) => {
    const schema = Joi.object({
        password: passwordComplexity().required(),
    });
    return schema.validate({password: userPassword});
};

module.exports = {validateUser, validateUpdateUser, validateEmail, validatePassword};