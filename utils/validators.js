const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const validateUser = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: passwordComplexity().required(),
        isAdmin: Joi.boolean()
    });
    return schema.validate(user);
};

module.exports = {validateUser};