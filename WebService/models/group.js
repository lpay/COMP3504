/**
 * Created by mark on 1/14/16.
 *
 */


var mongoose = require('mongoose');
var moment = require('moment');

var defaultStart = moment.duration("09:00", "hh:mm:ss").asSeconds();
var defaultEnd = moment.duration("17:00", "hh:mm:ss").asSeconds();

var ObjectId = mongoose.Schema.ObjectId;

var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var availabilitySchema = new mongoose.Schema({
    day: { type: String, enum: weekdays },
    hours: [{
        start: Number,
        end: Number,
        available: { type: Boolean, default: true }
    }]
});

var groupSchema = new mongoose.Schema({

    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },

    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },

    contact: { title: String, first: String, last: String },
    phone: { type: String },
    email: { type: String },

    defaultAvailability: {
        type: [availabilitySchema],
        default: [
            {day: 'Monday', hours: [{start: defaultStart, end: defaultEnd }] },
            {day: 'Tuesday', hours: [{start: defaultStart, end: defaultEnd }] },
            {day: 'Wednesday', hours: [{start: defaultStart, end: defaultEnd }] },
            {day: 'Thursday', hours: [{start: defaultStart, end: defaultEnd }] },
            {day: 'Friday', hours: [{start: defaultStart, end: defaultEnd }] }
        ]
    },

    members: [{
        user: { type: ObjectId, ref: 'User' },
        role: { type: String, default: 'professional', enum: ['admin', 'professional'] },
        availability: [availabilitySchema],
        events: {
            type: [{
                client: { type: ObjectId, ref: 'User' },
                type: String,
                start: Number,
                end: Number
            }], select: false
        }
    }]
});
/*
groupSchema.methods.getTimeslots = function(startDate, endDate) {
    var group = this;

    return Group.findById(group, '+members.events')
        .then(group => {
            var timeslots = [];

            // TODO: lots of looping here, possible future performance issue?
            group.members.forEach(function(member) {

                var dayOfWeek = startDate.day();

                for (var i = 0; i < endDate.diff(startDate, 'days') + 1; i++) {
                    group.defaultAvailability.some(function(entry) {
                        if (entry.day === weekdays[dayOfWeek]) {
                            var hours = entry.hours || [];

                            if (member.availability.length) {
                                member.availability.some(function(entry) {
                                    if (entry.day === weekdays[dayOfWeek] && entry.hours.length) {
                                        hours = hours.concat(entry.hours);
                                        return true;
                                    }
                                });
                            }

                            // sort in reverse (we will also loop in reverse)
                            hours.sort(function(a, b) { return b.start - a.start });

                            var slot = {};

                            while (hours.length) {
                                var range = hours.pop();

                                if (slot.start) {

                                } else if (range.available) {
                                    slot.start = range.start;
                                }


                            }

                            return true;
                        }
                    });

                    dayOfWeek = dayOfWeek == 6 ? 0 : dayOfWeek + 1;
                }

                availability.forEach(function(slot) {
                    timeslots.push({
                        member: member.user,
                        slot: slot
                    })
                })
            });

            return timeslots;
        });
};
*/
groupSchema.methods.join = function(user, group) {

};

groupSchema.methods.isAdmin = function(user) {
    var group = this;

    return Group.find( {_id: group._id, 'members.user': user, 'members.role': 'admin' })
                .then(group => group ? true: false);
};

var Group = mongoose.model('Group', groupSchema);

module.exports = Group;