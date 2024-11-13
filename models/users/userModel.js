const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please enter your full name'],
        trim: true,
        maxLength: [100, 'Your full name can not be more than 100 characters!']
    },
    email: {
        type: String,
        required: [true, 'Enter your email address'],
        unique: [true, 'This email address already exists on our server!'],
        lowercase: true,
        validate: [validator.isEmail, 'Enter a valid Email address!'],
        index: true,
    },
    household_income: {
        type: Number,
        required: [true, 'Please enter your household income'],
    },
    role: {
        type: String,
        enum: ['Landlord', 'Tenant', 'Agent'],
    },
    password: {
        type: String,
        required: [true, 'Please enter a password!'],
        trim: true,
        minlength: [8, 'Your password cannot be less than 8 characters!'],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        trim: true,
        minlength: [8, 'Your password cannot be less than 8 characters!'],
        validate: {
            validator: function (el) {
            return el === this.password;
            },
            message: 'Password do not match',
        },
    },
    createdAt: {
        type: Date
    },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// userSchema.pre(/^find/, function (next) {
//     this.find({ active: { $ne: false } });
//     next();
//   });
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hashSync(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User =  mongoose.model('User', userSchema);

module.exports = User;
