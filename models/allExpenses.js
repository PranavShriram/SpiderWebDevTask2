var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseSchema = new Schema({
   Date:String,
   Reason:String,
   Description:String,
   Amount:Number,
   Payer:String,
   Split:{
       User:String ,
       AmountSplit:Number
   }
});

var Expense = mongoose.model('Expense',expenseSchema);

module.exports = Expense;