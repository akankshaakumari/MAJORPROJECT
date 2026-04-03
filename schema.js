const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.allow("", null),
        lat: Joi.number().allow('', null).optional(),
        lng: Joi.number().allow('', null).optional(),
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
});

module.exports.roommateSchema = Joi.object({
    roommate: Joi.object({
        city: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().min(Joi.ref('startDate')).required(),
        myGender: Joi.string().valid("Male", "Female", "Other", "Prefer not to say").required(),
        prefGender: Joi.string().valid("Male", "Female", "Any").required(),
        budget: Joi.number().min(0).required(),
        bio: Joi.string().max(500).required()
    }).required()
});