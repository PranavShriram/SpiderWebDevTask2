var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var settleSchema = new Schema({
  Date:String,
  AmountSettled:Number,
  Payer:String,
  Payee:String
});

var Settlement = mongoose.model('Settlement',settleSchema);

module.exports = Settlement;