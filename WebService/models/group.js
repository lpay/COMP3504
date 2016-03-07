/**
 * Created by mark on 1/14/16.
 *
 */


var mongoose = require('mongoose');
var moment = require('moment');

var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var defaultStart = moment.duration("09:00", "hh:mm:ss").asSeconds();
var defaultEnd = moment.duration("17:00", "hh:mm:ss").asSeconds();

var ObjectId = mongoose.Schema.ObjectId;


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

    tags: [],

    defaultAvailability: {
        type: [availabilitySchema],
        default: [
            {day: 'Sunday', hours: []},
            {day: 'Monday', hours: [{start: defaultStart, end: defaultEnd }] },
            {day: 'Tuesday', hours: [{start: defaultStart, end: defaultEnd }] },
            {day: 'Wednesday', hours: [{start: defaultStart, end: defaultEnd }] },
            {day: 'Thursday', hours: [{start: defaultStart, end: defaultEnd }] },
            {day: 'Friday', hours: [{start: defaultStart, end: defaultEnd }] },
            {day: 'Saturday', hours: []}
        ]
    },

    defaultInterval: { type: Number, required: true, default: 15 },

    members: [{
        user: { type: ObjectId, ref: 'User' },
        role: { type: String, default: 'professional', enum: ['admin', 'professional'] },
        availability: [availabilitySchema],
        events: {
            type: [{
                client: { type: ObjectId, ref: 'User' },
                available: { type: Boolean, default: false },
                type: String,
                start: Date,
                end: Date
            }], select: false
        }
    }]
});

groupSchema.methods.generateTimeslots = function(startDate, endDate) {
    var group = this;

    return Group.findById(group, '+members.events')
        .then(group => {

            var minTime = 45;
            var interval = group.defaultInterval || 15;

            // round seconds up
            startDate.add(1, 'minutes').seconds(0).milliseconds(0);

            // round up to the nearest interval
            startDate.add(interval - (startDate.minute() % interval), 'minutes');

            var timeslots = [];

            var groupAvailability = {
                'Sunday': [],
                'Monday': [],
                'Tuesday': [],
                'Wednesday': [],
                'Thursday': [],
                'Friday': [],
                'Saturday': []
            };

            // group availability
            group.defaultAvailability.forEach(function(entry) {
                entry.hours.forEach(function(hours) {
                    groupAvailability[entry.day].push({ start: hours.start, end: hours.end, available: hours.available, rank: 0});
                })
            });

            group.members.forEach(function(member) {
                var availability = JSON.parse(JSON.stringify(groupAvailability));


                // member availability
                member.availability.forEach(function(entry) {
                    entry.hours.forEach(function(hours) {
                        availability[entry.day].push({ start: hours.start, end: hours.end, available: hours.available, rank: 1});
                    });
                });

                // sort by: rank (desc), timespan, start, end
                Object.keys(availability).forEach(function(day) {
                    availability[day].sort(function(a, b) {
                        if (a.rank != b.rank)
                            return b.rank - a.rank;

                        if (a.end - a.start != b.end - b.start)
                            return ((a.end - a.start) - (b.end - b.start));

                        if (a.start != b.start)
                            return a.start - b.start;

                        if (a.end != b.end)
                            return a.end - b.end;

                        return 0;
                    });
                });

                for (var date = startDate; date < endDate; date.add(interval, 'minutes')) {

                    // calculate timeslot start & end in seconds
                    var start = (date.hour() * 60 + date.minute()) * 60;
                    var end = start + (minTime * 60);
                    var available = false;

                    // check for conflicting events
                    if (member.events.some(event => {
                            return !event.available && (
                                    date.diff(event.start) >= 0 &&
                                    date.diff(event.end) <= 0
                                ) || (
                                    moment(date).add(end, 'seconds').diff(event.start) >= 0 &&
                                    moment(date).add(end, 'seconds').diff(event.end) <= 0
                            );
                        })) continue;

                    // check availability
                    var hours = availability[weekdays[startDate.day()]];

                    hours.some(hours => {
                        var hasStart = (start >= hours.start && start <= hours.end);
                        var hasEnd = (end >= hours.start && end <= hours.end);

                        if (start < hours.start && end > hours.end && !hours.available)
                            return true;

                        if ((hasStart || hasEnd) && !hours.available)
                            return true;

                        if (hasStart && hasEnd) {
                            available = hours.available;
                            return true;
                        }
                    });

                    if (available) {
                        timeslots.push({
                            group: group._id,
                            member: member._id,
                            start: moment(date).toDate()
                        });
                    }
                }
            });

            return timeslots;
        });
};

groupSchema.methods.join = function(user, group) {

};

groupSchema.methods.isAdmin = function(user) {
    var group = this;

    return Group.find( {_id: group._id, 'members.user': user, 'members.role': 'admin' })
                .then(group => group ? true: false);
};

var Group = mongoose.model('Group', groupSchema);

module.exports = Group;