/**
 * Created by mark on 1/14/16.
 *
 */


var mongoose = require('mongoose');
var moment = require('moment');

var APIError = require('../errors/APIError');

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
    name: { type: String, required: true, unique: true },

    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },

    contact: String,
    phone: String,
    email: String,

    tags: { type: String, lowercase: true },

    // Defaults (overridable for each member)
    defaultAppointments: {
        type: [{name: String, min: Number, max: Number}]
    },

    defaultAvailability: {
        type: [availabilitySchema],
        default: [
            {day: 'Sunday', hours: []},
            {day: 'Monday', hours: [{start: defaultStart, end: defaultEnd}]},
            {day: 'Tuesday', hours: [{start: defaultStart, end: defaultEnd}]},
            {day: 'Wednesday', hours: [{start: defaultStart, end: defaultEnd}]},
            {day: 'Thursday', hours: [{start: defaultStart, end: defaultEnd}]},
            {day: 'Friday', hours: [{start: defaultStart, end: defaultEnd}]},
            {day: 'Saturday', hours: []}
        ],
        required: true
    },

    // Members
    members: [{
        user: { type: ObjectId, ref: 'User' },
        role: { type: String, default: 'professional', enum: ['admin', 'professional'], required: true },
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
        appointments: {
            type: [{name: String, min: Number, max: Number}]
        },
        events: {
            type: [{
                client: { type: ObjectId, ref: 'User' },
                available: { type: Boolean, default: false },
                type: String,
                start: Date,
                end: Date
            }]
        }
    }]
});

groupSchema.methods.generateTimeslots = function(startDate, endDate, interval, time) {
    var group = this;

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

    // get min appointment time
    var min = 2700; // 45 mins (default)
    group.defaultAppointments.forEach(function(entry) {
        if (entry.min < min)
            min = entry.min;
    });

    // organize available timeslots by member
    var members = [];
    var totalTimeslots = 0;

    // serialize (for a deep copy)
    groupAvailability = JSON.stringify(groupAvailability);

    group.members.forEach(function(member) {
        var timeslots = [];

        // deserialize
        var availability = JSON.parse(groupAvailability);

        // member availability
        member.availability.forEach(function (day) {
            day.hours.forEach(function (hours) {
                availability[day.day].push({start: hours.start, end: hours.end, available: hours.available, rank: 1});
            });
        });

        var stop = false;

        while (!stop) {
            stop = true;

            Object.keys(availability).forEach(function (day) {

                // sort
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

                /*
                // group
                for (var i = availability[day].length; i > 0; i--) {
                    var prev = availability[day][i - 1];
                    var curr = availability[day][i];

                    if (curr.start == prev.end) {
                        if (curr.rank >)
                    }
                }
                */
            });
        }

        for (var date = startDate.clone(); date < endDate; date.add(interval, 'minutes')) {

            // calculate timeslot start & end in seconds
            var start = (date.hour() * 60 + date.minute()) * 60;

            // min time
            var minTime = start + min;

            // max time
            var maxTime = 0;

            // check for conflicting events
            /*
            if (member.events.some(event => {
                    return !event.available && (
                            date.diff(event.start) >= 0 &&
                            date.diff(event.end) <= 0
                        ) || (
                            moment(date).add(end, 'seconds').diff(event.start) >= 0 &&
                            moment(date).add(end, 'seconds').diff(event.end) <= 0
                        );
                })) continue;
            */

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
                        maxTime = hours.end - start;

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
    };
};

groupSchema.methods.join = function(user, group) {

};

groupSchema.methods.isAdmin = function(user) {
    var group = this;

    return group.members.some(function(member) {
        if (user._id.equals(member.user) && member.role === 'admin')
            return true;
    });
};

var Group = mongoose.model('Group', groupSchema);

module.exports = Group;