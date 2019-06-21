var express = require('express'),
    app = express(),
    port = 3000,
    ejs = require('ejs'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    User = require('./models/user'),
    Expense = require('./models/allExpenses'),
    crypto = require('crypto'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    flash = require('connect-flash'),
    Settlement = require('./models/settle') ;// import alert from 'alert-node';
var sortMethod = "Date"

mongoose.connect('mongodb://localhost:27017/rightSplit', {useNewUrlParser: true});

app.set("view engine","ejs");    

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
app.use(flash());
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'))


//=======================================
//USER DEFINED FUNCTIONS
//=======================================
async function settle(withUser,byUser,res)
{
    try
    {
        var foundWithUser = await User.findOne({username:withUser});
    }
    catch(err)
    {
        console.log(err);
    }
    try
    {
        var foundByUser = await User.findOne({username:byUser});
    }
    catch(err)
    {
        console.log(err);
    }
    try{

        for(var i = 0;i < foundWithUser.friends.length;i++)
        {
          if(foundWithUser.friends[i].username == foundByUser.username)  
           {
               foundWithUser.totalAmountBalance = foundWithUser.totalAmountBalance - foundWithUser.friends[i].amountBalance;
               var createdSettlement = await Settlement.create({Date:Date.now(),AmountSettled:foundWithUser.friends[i].amountBalance,Payer:foundByUser.username,Payee:foundWithUser.username}) 
               foundWithUser.friends[i].amountBalance = 0;
               break;
           }  
        }
        var savedwithUser = await foundWithUser.save();
    }
    catch(err)
    {
        console.log(err);
    }
    try
    {
        for(var i = 0;i < foundByUser.friends.length;i++)
        {
          if(foundByUser.friends[i].username == foundWithUser.username)  
           {
               foundByUser.totalAmountBalance = foundByUser.totalAmountBalance - foundByUser.friends[i].amountBalance;
               foundByUser.friends[i].amountBalance = 0;
               break;
           }  
        }
        var savedbyUser = await foundByUser.save();
        res.redirect("/dashboard/allExpenses")
    }
    catch(err)
    {
        console.log(err);
    }
}


async function findExpenses(currentUser,resServer,chosenOption,updateId,flashMessage)
{ 
    var settlementLog = await Settlement.find({}); 
     await User.findOne({ username:currentUser })
    .populate('allExpenses')
    .exec((error, populatedUser) => {
        console.log(sortMethod)
        if(sortMethod == "Date")
        {
            var sortedExpenses = populatedUser.allExpenses.sort((a,b) => a.Date < b.Date);
        }
        else if(sortMethod == "Amount")
        {
            var sortedExpenses = populatedUser.allExpenses.sort((a,b) => a.Amount < b.Amount);
        }

        console.log(sortedExpenses);
        resServer.render("dashboard",{option:chosenOption,user:populatedUser,allExpenses:sortedExpenses,updateId:updateId,message:flashMessage,settlementLog:settlementLog})

    })
}

async function addallExpense(currentUser,newExpense,resServer,req)
{ 
    var flagFound = 0;
    try
    {  
      if(splitTo != "")
      {  
        var splitTo = await User.findOne({username:newExpense.Split.User});
        if(!splitTo)
        {
            req.flash("info","Split username does not exist");
            resServer.redirect("/dashboard/allExpenses");
        }
      }  
       var foundUser  = await User.findOne({username:currentUser});
       var newExpenseCreated = await Expense.create(newExpense);
       foundUser.allExpenses.push(newExpenseCreated);


      
       if(splitTo)
        {   
            for(var i = 0;i < foundUser.friends.length;i++)
            {
                if(foundUser.friends[i].username == newExpense.Split.User)
                {    
                    foundUser.friends[i].amountBalance = foundUser.friends[i].amountBalance + newExpense.Split.AmountSplit;
                    foundUser.totalAmountBalance = foundUser.totalAmountBalance + newExpense.Split.AmountSplit;
                    flagFound = 1;
                    break;
                }
            }
            if(flagFound == 0)
            {
                req.flash("info","The split user is not your friend.");
                resServer.redirect("/dashboard/allExpenses");
            }
     
            for(var i = 0;i < splitTo.friends.length;i++)
            {
                if(splitTo.friends[i].username == currentUser)
                {
                    // splitTo.friends[i].amountBalance = String(parseInt(splitTo.friends[i].amountBalance) - parseInt(newExpense.Split.AmountSplit));
                    // splitTo.totalAmountBalance =  String((splitTo.totalAmountBalance == ""?0:parseInt(splitTo.totalAmountBalance))- parseInt(newExpense.Split.AmountSplit));
                     splitTo.friends[i].amountBalance = splitTo.friends[i].amountBalance - newExpense.Split.AmountSplit;
                     splitTo.totalAmountBalance =  splitTo.totalAmountBalance- newExpense.Split.AmountSplit;
                }
            }
     
            splitTo.allExpenses.push(newExpenseCreated);
            var savedUser1 = await splitTo.save();
        }   
       var savedUser = await foundUser.save();
       resServer.redirect("/dashboard/allExpenses");
    }
    catch(err)
    {
        console.log(err);
    }  
}

function generateSalt(length)
{
    return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex') 
    .slice(0,length);   
}

function hashSaltPassword(password)
{
  
    var salt = generateSalt(16);
    const cipher = crypto.createCipher('aes192', salt);  
    var encrypted = cipher.update(password, 'utf8', 'hex');  
    encrypted += cipher.final('hex');
     return {
         salt:salt,
         passwordHash:encrypted
     };
}

function decryptHash(salt,hash)
{
    const decipher = crypto.createDecipher('aes192', salt);  
    var decrypted = decipher.update(hash, 'hex', 'utf8');  
    decrypted += decipher.final('utf8');   
    return decrypted;   
}
async function acceptFriendRequest(sendingUser,recievingUser,res)
{
    try
    {
        var user1 = await User.findOne({username:sendingUser});
    }
    catch(err)
    {
        console.log(err);
    }
    try
    {
         for(var i = 0;i < user1.friendRequestsSent.length;i++)
         {
             if(user1.friendRequestsSent[i] == recievingUser)
              user1.friendRequestsSent.splice(i,1);
         }
         user1.friends.push({username:recievingUser,amountBalance:0});
         var savedUser1 = await user1.save();
    }
    catch(err)
    {
        console.log(err);
    }
    try
    {
        var user2 = await User.findOne({username:recievingUser});

    }
    catch(err)
    {
        console.log(err);
    }
    try
    {
        for(var i = 0;i < user2.friendRequestsRecieved.length;i++)
         {
             if(user2.friendRequestsRecieved[i] == sendingUser)
              user2.friendRequestsRecieved.splice(i,1);
         }
         user2.friends.push({username:sendingUser,amountBalance:0});
         var savedUser2 = await user2.save();
         res.redirect("/dashboard/allExpenses");

    }
    catch(err)
    {
        console.log(err);
    }
}
async function processFriendRequest(user,sessionUser,res,req)
{
    try
    {
     var recievingUser = await User.findOne({username:user});
    }
    catch(err)
    {
        console.log(err);
    }  
    try
    {    
        if(recievingUser)
        {
            recievingUser.friendRequestsRecieved.push(sessionUser);
            await recievingUser.save();
        }
        else
        {
            req.flash("info","Username does not exist");
            res.redirect("/dashboard/allExpenses");
        }
        
    }
    catch(err)
    {
        console.log(err);
    }  
    try
    {    
        if(recievingUser)
        {
            var requestingUser = await User.findOne({username:sessionUser});
            requestingUser.friendRequestsSent.push(user);
            await requestingUser.save();
            res.redirect("/dashboard/allExpenses");
        }    
    }
    catch(err)
    {
        console.log(err);
    }  
}
//=======================================
//LOGIN AND REGISTER ROUTES
//=======================================

app.get("/",(req,res) => {
    res.redirect("/login");
})

app.get("/register",(req,res)=>{
    res.render("register",{message:req.flash('info')});
});   

app.post("/register",(req,res)=>{
      
    
    var generatedSaltAndHash = hashSaltPassword(req.body.password);
    
    var user = {username:req.body.username,salt:generatedSaltAndHash.salt,hash:generatedSaltAndHash.passwordHash};
   
    User.find({username:req.body.username},(err,foundUsers) => {

        if(foundUsers.length > 0)
        {
            req.flash("info","Username already taken");
            res.redirect("/register");
        }
        else
        {
            User.create(user,(err,userCreated)=>{
                if(err)
                 console.log(err);
                else
                {  
                    req.session.user = userCreated.username;
                   res.redirect("/dashboard/allExpenses")
                } 
           });
        }
    })

    
})

app.get("/login",(req,res)=>{
    res.render("login",{message:req.flash('info')});
});  
app.post("/logout",(req,res) => 
{
    req.session.user = "";
    res.redirect("/login");

});
app.post("/login",(req,res)=>{
    
    User.find({username:req.body.username}).then((user)=>{
     if(user.length == 0)
     {   
          console.log(user);

          req.flash('info', 'Incorrect username')

          res.redirect("/login");
     }   
     else
     {
      var passwordOfUser = decryptHash(user[0].salt,user[0].hash);
        if(req.body.password === passwordOfUser)
        {   

            req.session.user = user[0].username;

            res.redirect('/dashboard/allExpenses');
        }
        else
        {
            req.flash('info', 'Incorrect credentials')
            res.redirect("/login");
        }
    }  
   }).catch((err)=>{
       console.log(err)
   });
});

//=======================================
//Managing Dashboard routes
//=======================================


//Post route for sort method
app.post("/sort/:method/:option",checkAuthenticity,(req,res) => {
   sortMethod = req.params.method;
   res.redirect("/dashboard/"+ req.params.option);
});

//General get route
app.get('/dashboard/:option',checkAuthenticity,(req,res)=>{
  

   findExpenses(req.session.user,res,req.params.option,-1,req.flash('info'));
})


app.post('/dashboard/allExpenses',checkAuthenticity,(req,res)=>{
    
    var newExpense = {Date:Date.now(),Reason:req.body.Reason,Description:req.body.Description,Amount:req.body.Amount,Payer:req.session.user,Split:{
       User: req.body.SplitUser,
       AmountSplit:req.body.SplitAmount
    }};

    addallExpense(req.session.user,newExpense,res,req);
})
app.get('/dashboard/allExpenses/:id/edit/:user',checkAuthenticity,(req,res) => {
    
    findExpenses(req.session.user,res,req.params.user,req.params.id,req.body.sortMethod?"Date":req.body.sortMethod,req.flash('info'));
});
app.put('/dashboard/allExpenses/:id',checkAuthenticity,(req,res) => {
      
    var updatedExpense = {Reason:req.body.Reason,Description:req.body.Description,Amount:req.body.Amount,Split:{User:req.body.User,AmountSplit:req.body.AmountSplit}};
 
    Expense.findOneAndUpdate({_id:req.params.id},{$set:updatedExpense},function(err,updated)
    {
        if(err) 
         console.log(err);
        else
        { // console.log(updated);
            res.redirect("/dashboard/allExpenses");
        } 
    });

});
app.delete('/dashboard/allExpenses/:id',checkAuthenticity,(req,res) => {
   Expense.findByIdAndRemove(req.params.id,(err,deletedExpense)=>{
      // console.log(deletedExpense);

       User.findOne({username:req.session.user},(err1,user) => {
        if(err1) console.log(err1);
        for(var i = 0;i < user.allExpenses.length;i++)
        {   
            if(user.allExpenses[i] == req.params.id)
            {
                 user.allExpenses.splice(i,1);
                 break;
            }
        }
        user.save((err2,savedUser) => {
            if(err2) console.log(err2);

          res.redirect("/dashboard/allExpenses");

        });
       });
        
   })
});

//=======================================
//Settle request Routes
//=======================================
app.post("/settle/:option",checkAuthenticity,(req,res) => {
    settle(req.params.option,req.session.user,res);
});
//=======================================
//Friend request Routes
//=======================================

app.post("/acceptFriendRequest/:user",checkAuthenticity,(req,res) => {
      acceptFriendRequest(req.params.user,req.session.user,res);
});

app.post("/newFriendRequest",checkAuthenticity,(req,res) => {
    console.log(req.body.username);


    processFriendRequest(req.body.username,req.session.user,res,req);
   
});
//=======================================
//Middleware
//=======================================
function checkAuthenticity(req,res,next){
    if(req.session.user && req.session.user != "")
      next();
    else
     res.redirect("/login");  
}


app.listen(port,() =>
{
     console.log("Right Split server has started.")
});  



