var mongoose = require('mongoose');
var User = require('./models/user');
var Expense = require('./models/personalExpenses');
mongoose.connect('mongodb://localhost:27017/rightSplit', {useNewUrlParser: true});


 async function seed()
{  
   try
   { 
    // var exp = await Expense.create({
    //     Date:Date.now(),
    //     Reason:"Food",
    //     Amount:"500"
    // });
    // //console.log(exp._id);
    // var foundUser = await User.findOne({username:"Pranav"});
    // foundUser.personalExpenses.push(exp);
    // var chUser = await foundUser.save();
    // console.log(chUser);
    // User.findOne({username:"Pranav"}).populate('personalExpenses').exec(function(err,user)
    // {
    //     console.log(user);
    // });
      User.findOne({username:"Pranav"},(req,user) => {
          user.personalExpenses = [];
          user.save((err,savedUser) => {
            console.log(savedUser);
          });
      })
   }
   catch(err)
   {
       console.log(err);
   } 
 }    

 seed();