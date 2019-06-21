# SpiderWebDevTask2
## RightSplit
A wallet manager for spider inductions

## Steps for installation 
1. Clone the repository locally

2. Install nodejs from [Nodejs official website](https://nodejs.org/en/)

3. Open the terminal in the folder where you have cloned the project.

4. Now run the following commands 
```
   npm cache clean
   npm install
```

5. Now, you should be able to see the node modules folder with all dependencies installed.

6. Install the mongodb community edition from here [Mongodb official documentation](https://docs.mongodb.com/manual/administration/install-community/)

7. Ensure that mongo service has started and is listening on port 27017

8. Now , run the following command back in the terminal at the project folder
`node index.js`

9. Navigate to http://localhost:3000/register and you should be able to view the register page

## Application User Manual

1. Register yourself by opening http://localhost:3000/register route.

2. Once you have registered, http://localhost:3000/dashboard/allExpenses is opened automatically where you can add your expenses using the new expense button.

3. In the new expense form , if the split user is left empty, then the expense is considered as a personal expense.

4. In order to split expenses, the users between the split is done must be friends.

5. To send a friend request use the form on the sidebar.Key in the username and click send.

6. Once the friend request is accepted by the other user we are good to go.

7. Expenses can now be split and the expenses split with a particular user can be viewed by clicking the username in the friends list.

8. To **Edit** expenses , click on a particular expense and the full expense details appear.Click the update button to edit the expense.

9. To **Delete** an expense click the trash icon.


