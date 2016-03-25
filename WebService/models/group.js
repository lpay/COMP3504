/**
 * Created by mark on 1/14/16.
 *
 */


var mongoose = require('mongoose');
var moment = require('moment');

var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var defaultStart = moment.duration("09:00", "hh:mm").asSeconds();
var defaultEnd = moment.duration("17:00", "hh:mm").asSeconds();

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

    // Group Information
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },

    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },

    contact: { title: String, first: String, last: String },
    phone: { type: String },
    email: { type: String },

    tags: [String],

    // Member defaults
    defaultAppointments: {
        type: [{name: String, length: Number, interval: Number}],
        default: [{name: 'Basic', length: 45, interval: 15}]
    },

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

    // Group Members
    members: [{
        user: { type: ObjectId, ref: 'User', unique: true },
        role: { type: String, default: 'professional', enum: ['admin', 'professional'] },
        availability: {
            type: [availabilitySchema],
            default: [
                {day: 'Sunday', hours: []},
                {day: 'Monday', hours: []},
                {day: 'Tuesday', hours: []},
                {day: 'Wednesday', hours: []},
                {day: 'Thursday', hours: []},
                {day: 'Friday', hours: []},
                {day: 'Saturday', hours: []}
            ]
        },
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

groupSchema.methods.generateTimeslots = function(startDate, endDate, interval, time) {
    var group = this;

    return Group.findById(group, '+members.events')
        .populate('members.user')
        .then(group => {
            interval = interval || 15;
            time = time || 45;

            // round up to the nearest interval
            startDate.add(interval - (startDate.minute() % interval), 'minutes');

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

            // organize available timeslots by each member
            var members = [];
            var totalTimeslots = 0;

            group.members.forEach(function(member) {

                // deep copy
                // TODO: better way?
                var availability = JSON.parse(JSON.stringify(groupAvailability));

                // member availability
                member.availability.forEach(function (day) {
                    day.hours.forEach(function (hours) {
                        availability[entry.day].push({start: hours.start, end: hours.end, available: hours.available, rank: 1});
                    });
                });

                // sort hours
                Object.keys(availability).forEach(function (day) {
                    availability[day].sort(function (a, b) {
                        // sort by rank (desc)
                        if (a.rank != b.rank)
                            return b.rank - a.rank;

                        // sort by timespan
                        if (a.end - a.start != b.end - b.start)
                            return ((a.end - a.start) - (b.end - b.start));

                        // sort by start
                        if (a.start != b.start)
                            return a.start - b.start;

                        // sort by end
                        if (a.end != b.end)
                            return a.end - b.end;

                        return 0;
                    });
                });

                // group hours

                var timeslots = [];

                for (var date = startDate; date < endDate; date.add(interval, 'minutes')) {

                    // calculate timeslot start & end in seconds
                    var start = (date.hour() * 60 + date.minute()) * 60;

                    // min time
                    var minTime = start + (time * 60);

                    // max time
                    var maxTime = 0;

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
                        var hasEnd = (minTime >= hours.start && minTime <= hours.end);

                        // mininum timeslot would completely overlap an unavailable time
                        if (start <= hours.start && minTime >= hours.end && !hours.available)
                            return true;

                        // timeslot would start or end in an unavailable time
                        if ((hasStart || hasEnd) && !hours.available)
                            return true;

                        if (hasStart && hasEnd) {
                            if (hours.available)
                                maxTime = hours.end;

                            return true;
                        }
                    });

                    if (maxTime > 0) {
                        timeslots.push({
                            start: moment(date),
                            end: moment(date).add(maxTime, 'seconds')
                        });
                    }
                }

                if (timeslots.length > 0) {
                    members.push({
                        // expose minimal member information
                        _id: member.user._id,
                        name: member.user.name,
                        timeslots: timeslots
                    });

                    totalTimeslots += timeslots.length;
                }
            });

            return {
                startDate: startDate,
                endDate: endDate,
                members: members,
                totalTimeslots: totalTimeslots
            }
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