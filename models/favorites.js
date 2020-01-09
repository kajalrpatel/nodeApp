var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Favorite = new Schema({
    user :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    item : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }]
},{
    timestamps: true
});

module.exports = mongoose.model('Favorite', Favorite);