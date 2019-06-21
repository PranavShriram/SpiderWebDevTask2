var displayNewExpenseForm = document.querySelector('.all-expenses-getPostform__button');
var form = document.querySelector('.all-expenses-post__form');
var cancelFormButton = document.querySelector('.all-expenses-post__form__cancelButton');
var container = document.querySelector('.container');
var descriptionArray = document.querySelectorAll('.all-expenses-description');
var rowArray = document.querySelectorAll('.row');


for(var i = 0;i < descriptionArray.length;i++)
{
    descriptionArray[i].classList.add('displayNothing');
}

displayNewExpenseForm.addEventListener("click",displayNewExpenseFormEventHandler);
cancelFormButton.addEventListener("click",disableFormHandler);

function displayNewExpenseFormEventHandler()
{
   form.style.display = "";
   container.classList.add('opacitySet')
}
function disableFormHandler()
{
    form.style.display = "none";
    container.classList.remove('opacitySet')

}

for(var i = 0;i < rowArray.length;i++)
{
    rowArray[i].addEventListener("click",displayDescription);
}

function displayDescription()
{    
    console.log(this);
    this.nextSibling.nextSibling.classList.toggle('displayNothing')
}


