var mongoose = require('mongoose');



var userSchema =  new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: Date,
    updated_at: Date,
    last_login: Date
});

userSchema.pre('save', function(next) {
    // update timestamps
    if (!this.created_at)
        this.created_at = new Date();
    else
        this.updated_at = new Date();

    next();
});

var User = mongoose.model('User', userSchema);

module.exports = User;