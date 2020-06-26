const mongoose = require('mongoose');

const LogsSchema = new mongoose.Schema({
    chipId: { // equivalent to title
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'negative',
        enum: ['negative', 'positive']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    scannedAt: {
        type: Date,
        default: Date.now
    },
    leftAt: {
        type: Date
    }
})

module.exports = mongoose.model('Logs', LogsSchema)