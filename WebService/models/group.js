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
    day: {type: String, enum: weekdays},
    hours: [{
        start: Number,
        end: Number,
        available: {type: Boolean, default: true}
    }]
});

var memberSchema = new mongoose.Schema({

    user: {type: ObjectId, ref: 'User'},

    role: {type: String, default: 'member', enum: ['admin', 'member'], required: true},

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

    appointmentTypes: {
        type: [{name: String, length: Number}]
    },

    events: {
        type: [{
            client: {type: ObjectId, ref: 'User'},
            available: {type: Boolean, default: false},
            title: String,
            start: Date,
            end: Date,
            notes: String
        }]
    }
});

var groupSchema = new mongoose.Schema({

    // Group Information
    name: {type: String, required: true, unique: true},

    address: {type: String, required: true},
    city: {type: String, required: true},
    province: {type: String, required: true},
    postalCode: {type: String, required: true},

    contact: String,
    phone: String,
    email: String,

    tags: {type: String, lowercase: true},

    // Settings

    requiredApproval: {type: Boolean, default: true},

    // Defaults (overridable for each member)
    defaultAppointmentTypes: {
        type: [{name: String, length: Number}],
        // for some reason the default is causing a validation error - moved to POST /groups
        //default: [{name: 'Standard', length: 2700}],
        required: true
    },

    defaultInterval: {type: Number, default: 15, required: true},

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
    members: [memberSchema],

    // Pending members
    pending: [{type: ObjectId, ref: 'User'}]
});

availabilitySchema.pre('save', function(next) {
    var availability = this;
    var hours = availability.hours;

    hours.sort(function(a, b) {
        // sort by timespan
        if (a.end - a.start != b.end - b.start)
            return ((a.end - a.start) - (b.end - b.start));

        // sort by start
        if (a.start != b.start)
            return a.start - b.start;

        // sort by end
        if (a.end != b.end)
            return a.end - b.end;
    });

    // group similar hours
    for (var i = hours.length - 1; i > 0; i--) {
        var prev = hours[i - 1];
        var curr = hours[i];

        if (prev.available == curr.available && prev.end >= curr.start) {
            if (curr.start < prev.start) {
                prev.start = curr.start;
            } else {
                prev.end = curr.end;
            }

            hours.splice(i, 1);
        }

        // TODO: check other for bizarre things a user might do when editing availability
    }

    next();
});

groupSchema.methods.generateTimeslots = function(startDate, endDate, appointmentType, limit) {
    console.time('generateTimeslots');

    var group = this;

    var interval = group.defaultInterval || 15; // default 15 minutes

    // round up to the nearest interval
    var remainder = startDate.diff(startDate.clone().startOf('day'), 'minutes') % interval;

    if (remainder > 0)
        startDate.add(interval - remainder, 'minutes');

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

    // organize available timeslots by member
    var members = [];
    var totalTimeslots = 0;

    // serialize (for a deep copy)
    groupAvailability = JSON.stringify(groupAvailability);

    group.members.forEach(function(member) {
        var timeslots = [];

        interval = member.interval || interval;

        // deserialize
        var availability = JSON.parse(groupAvailability);

        // member availability
        member.availability.forEach(function (day) {
            day.hours.forEach(function (hours) {
                availability[day.day].push({start: hours.start, end: hours.end, available: hours.available, rank: 1});
            });
        });

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
        });

        var appointmentTypes;

        if (appointmentType)
            appointmentTypes = [appointmentType];
        else if (member.appointmentTypes.length > 0)
            appointmentTypes = member.appointmentTypes;
        else if (group.defaultAppointmentTypes.length > 0)
            appointmentTypes = group.defaultAppointmentTypes;

        if (!appointmentTypes)
            return;
        
        // generate timeslots
        for (var date = startDate.clone(); date < endDate; date.add(interval, 'minutes')) {

            (function() {

                // calculate timeslot start in seconds
                var start = (date.hour() * 60 + date.minute()) * 60;

                var checkAvailability = function(duration) {

                    // calculate timeslot end in seconds
                    var end = start + duration;

                    // check for conflicting events
                    if (member.events.some(event => {
                            // skip available events
                            if (event.available)
                                return false;

                            var startDate = date.clone();
                            var endDate = moment(date).add(end, 'seconds');

                            // return true if the timeslot would overlap the event,
                            // or if the event contains the timeslot start or end
                            return (startDate.diff(event.start) <= 0 && endDate.diff(event.end) >= 0) ||
                                (startDate.diff(event.start) >= 0 && startDate.diff(event.end) <= 0 ||
                                endDate.diff(event.start) >=0 && endDate.diff(event.end) <= 0);

                        })) return false;

                    // check availability
                    var available = false;
                    var hours = availability[startDate.format('dddd')];

                    hours.some(hours => {
                        // timeslot would completely overlap an unavailable time
                        if (start <= hours.start && end >= hours.end && !hours.available)
                            return true;

                        var hasStart = (start >= hours.start && start <= hours.end);
                        var hasEnd = (end >= hours.start && end <= hours.end);

                        // timeslot would start or end in an unavailable time
                        if ((hasStart || hasEnd) && !hours.available)
                            return true;

                        if (hasStart && hasEnd) {
                            available = hours.available;
                            return true;
                        }
                    });

                    return available;
                };

                appointmentTypes.forEach(function (appointmentType) {
                    if (checkAvailability(appointmentType.length)) {
                        timeslots.push({
                            start: date.clone(),
                            end: date.clone().add(appointmentType.length, 'seconds'),
                            title: appointmentType.name
                        });
                    }
                });

            })();

            if (limit && --limit == 0)
                break;
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

    console.timeEnd('generateTimeslots');

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