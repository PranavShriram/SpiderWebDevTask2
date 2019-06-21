var mongoose = require('mongoose');
var Expense = require('./allExpenses')
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username:String,
    salt:String,
    hash:String,
    allExpenses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Expense'
        }
    ],
    friendRequestsRecieved:[String],
    friendRequestsSent:[String],
    friends:[{username:String,amountBalance:Number}],
    totalAmountBalance:{type:Number,default:0}
});

var User = mongoose.model('User',userSchema);

module.exports = User;