const toDoColumn = document.getElementById('to_do');
const inProgressColumn = document.getElementById('in_progress');
const doneColumn = document.getElementById('done');
const popUp = document.getElementById('pop-up');
const removingValidation = document.getElementById('removingValidation');
const cancelingValidation = document.getElementById('cancelingValidation');
const columns = document.querySelectorAll('.column');
const addTaskButton = document.getElementById('addTaskButton');
var currentlyFocusedElement;

let Task = function() {
    this.title = 'New Title';
    this.description = '';
    this.status = 'to do';
    this.comments = new Map();

    function addComment(timestamp, text) {
        comments.set(timestamp, text);
    }

    function removeComment(timestamp) {
        comments.remove(timestamp);
    }
}
let taskCollection = new Map();
let nextTaskNumber = 1;
let currentTask = 0;
let updatesNotSaved = false;

function addTask() {
    taskCollection.set(nextTaskNumber, new Task());
    createTaskCardUnderColumn(nextTaskNumber, toDoColumn);
    document.getElementById(`editButton(${nextTaskNumber})`).focus();
    nextTaskNumber++;
}

function createTaskCardUnderColumn(taskNumber, column) {
    if (document.getElementById(taskNumber) != null) document.getElementById(taskNumber).remove();
    const taskCard = document.createElement('div');
    taskCard.classList.add('taskCard');
    taskCard.setAttribute('id', taskNumber)
    if (column === toDoColumn) toDoColumn.appendChild(taskCard);
    else if (column === inProgressColumn) inProgressColumn.appendChild(taskCard);
    else if (column === doneColumn) doneColumn.appendChild(taskCard);
    populateTaskCardWithData(taskNumber);
}

function populateTaskCardWithData(taskNumber) {
    const taskCard = document.getElementById(taskNumber);
    taskCard.innerHTML = `${taskCollection.get(taskNumber).title} <button id ="editButton(${taskNumber})" onclick = "editTask(${taskNumber})">...</button>
    <button onclick = "validateTaskRemoving(${taskNumber})">-</button>
    <br>
    ${taskCollection.get(taskNumber).description}`;
}

function editTask(taskNumber) {
    showEditPopUp(taskNumber)
    currentTask = taskNumber;
}

function removeTask(taskNumber) {
    taskCollection.delete(taskNumber);
    document.getElementById(taskNumber).remove();
    cancelEditing();
}

function showEditPopUp(taskNumber) {
    columns.forEach(column => column.classList.add('inactive'));
    popUp.classList.add('active');
    populateEditFields(taskNumber);
    currentlyFocusedElement = document.activeElement;
    trapKeyboard(popUp);
}

function hideEditPopUp() {
    popUp.classList.remove('active');
    popUp.classList.remove('inactive');
    columns.forEach(column => column.classList.remove('inactive'));
}

function populateEditFields(taskNumber) {
    const title = document.getElementById('title');
    const description = document.getElementById('description');
    const status = document.getElementById('status');
    description.value = taskCollection.get(taskNumber).description;
    title.value = taskCollection.get(taskNumber).title;
    addOptionsToStatusSelection(taskNumber);
    status.value = taskCollection.get(taskNumber).status;
    // hideComments();
}

function addOptionsToStatusSelection(taskNumber) {
    let availableOptions = new Set();
    switch (taskCollection.get(taskNumber).status) {
        case 'in progress':
            availableOptions = ['in progress', 'done'];
            break;
        case 'done':
            availableOptions = ['done', 'to do'];
            break;
        default:
            availableOptions = ['to do', 'in progress'];
            break;
    }
    const selectStatusButton = document.getElementById('status');
    selectStatusButton.innerHTML = '';
    availableOptions.forEach(function (option) {
            const opt = document.createElement('option');
            opt.value = option;
            opt.id = option;
            opt.innerText = capitalizeFirstLetter(option);
            selectStatusButton.appendChild(opt);
        })
}

function capitalizeFirstLetter(s) {
    return s[0].toUpperCase() + s.slice(1);
}

function cancelEditing() {
    if (!updatesNotSaved){
        hideEditPopUp();
        hideValidationPopUp()
        currentTask = 0;
    } else {
        validateEditCanceling();
    }

}

function validateEditCanceling() {
    popUp.classList.remove('active');
    popUp.classList.add('inactive');
    cancelingValidation.classList.add('active');
    currentlyFocusedElement = document.activeElement;
    trapKeyboard(cancelingValidation);
}

function returnToEditing() {
    cancelingValidation.classList.remove('active');
    popUp.classList.remove('inactive');
    popUp.classList.add('active');
    trapKeyboard(popUp);
}

function confirmCancelation() {
    cancelingValidation.classList.remove('active');
    popUp.classList.remove('inactive');
    updatesNotSaved = false;
    currentlyFocusedElement = document.getElementById(`editButton(${currentTask})`);
    cancelEditing();
}

function saveTask() {
    let task = taskCollection.get(currentTask);
    task.title = document.getElementById('title').value;
    task.description = document.getElementById('description').value;
    task.status = document.getElementById('status').value;
    let column = toDoColumn;
    switch (task.status) {
        case 'in progress':
            column = inProgressColumn;
            break;
        case 'done':
            column = doneColumn;
            break;
        default:
            column = toDoColumn;
            break;
    }
    populateEditFields(currentTask);
    createTaskCardUnderColumn(currentTask, column)
    showSavedNotification();
    updatesNotSaved = false;
}

function showSavedNotification() {
    const savedNotification = document.getElementById("savedNotification");
    savedNotification.innerText = "Saved successfully.";
    setTimeout(() => {savedNotification.innerText = ""}, 2000);
}

function updateStatus() {
    const currentStatus = taskCollection.get(currentTask).status;
    switch (currentStatus) {
        case 'to do':
            changeColumnAndSetNewStatus(toDoColumn, inProgressColumn, 'in progress');
            cancelEditing();
            break;
        case 'in progress':
            changeColumnAndSetNewStatus(inProgressColumn, doneColumn, 'done');
            cancelEditing();
            break;  
        default:
            changeColumnAndSetNewStatus(doneColumn, toDoColumn, 'to do');
            cancelEditing();
            break; 
    }

function changeColumnAndSetNewStatus(oldColumn, newColumn, newStatus) {
    taskCollection.get(currentTask).status = newStatus;
    oldColumn.removeChild(document.getElementById(currentTask));
    createTaskCardUnderColumn(currentTask, newColumn);
    }
}

function validateTaskRemoving(taskNumber) {
    currentTask = taskNumber;
    currentlyFocusedElement = document.activeElement;
    showValidationPopUp();
    trapKeyboard(removingValidation);
}

function trapKeyboard(popUpToTrap) {
    // find all focusable children
    var interactiveElementsToFocus = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable]';
    var focusableElements = popUpToTrap.querySelectorAll(interactiveElementsToFocus);
    // convert NodeList to Array
    focusableElements = Array.prototype.slice.call(focusableElements);
    const firstTabStop = focusableElements[0];
    const lastTabStop = focusableElements[focusableElements.length - 1];
    firstTabStop.focus();
    // listen for and trap the keyboard
    popUpToTrap.addEventListener('keydown', trapTabKey);
    function trapTabKey(e) {
        // check for TAB key press
        if (e.keyCode === 9) {
            // check if SHIFT is also clicked
            if (e.shiftKey) {
                if (document.activeElement === firstTabStop) {
                    e.preventDefault();
                    lastTabStop.focus();
                }
            // SHIFT is not clicked
            } else {
                if (document.activeElement === lastTabStop) {
                    e.preventDefault();
                    firstTabStop.focus();
                } 
            }
        }
        if (e.keyCode === 27) {
            if (popUpToTrap != cancelingValidation) {
                cancelEditing();
            } else {
                returnToEditing();
            }
        }
    }
}

function showValidationPopUp() {
    columns.forEach(column => column.classList.add('inactive'));
    removingValidation.classList.add('active');
    const yesButton = document.getElementById('confirmRemoving');
    yesButton.setAttribute('onclick', `removeTask(${currentTask})`);
}

function hideValidationPopUp() {
    removingValidation.classList.remove('active');
    columns.forEach(column => column.classList.remove('inactive'));
    retrieveFocus();
}

function retrieveFocus() {
    if (document.body.contains(currentlyFocusedElement)) {
        currentlyFocusedElement.focus();
    } else {
        addTaskButton.focus();
    }
}

function setChangeParameterToTrue() {
    updatesNotSaved = true;
}

// function showComments() {
//     document.getElementById('showCommentsButton').classList.add('inactive');
//     document.getElementById('hideCommentsButton').classList.add('active');
//     listAllComments(taskCollection.get(currentTask));
//     document.getElementById('comments').classList.add('active');
// }

function listAllComments(task) {
    task.comments.forEach(comment => {
        const singleComment = document.createElement('div');
        commentArea.innerHTML = `<p>${comment.key}</p><p>${comment.value}</p>`
        document.getElementById('comments').appendChild(singleComment);
    })
}

// function hideComments() {
//     document.getElementById('showCommentsButton').classList.remove('inactive');
//     document.getElementById('hideCommentsButton').classList.remove('active');
//     document.getElementById('comments').classList.remove('active');
// }

// function addComment() {
//     commentArea.innerHTML = '<label for="comment">Date</label>' +
//     '<textarea class="form-control" id="comment" rows="2" cols="50" pattern="[a-zA-Z0-9]+" onchange = "setChangeParameterToTrue()"></textarea>';
//     popUp.firstElementChild.appendChild(commentArea);
// }