'use strict';

//Adding an assignment to list
const handleAddItem = () => {
    //First, GET the id of a user inputted
    $.ajax({
        type: "GET",
        url: '/api/users',
        success: function studentUsers(listUsers) {
            for (let i = 0; i < listUsers.length; i++) {
                if (listUsers[i].username === $("#username").val() && listUsers[i].isAdmin === false) {
                    // Then, POST an assignment of a specific user by id
                    $.ajax({
                        type: "POST",
                        url: '/api/users/' + listUsers[i].id,
                        data: JSON.stringify({
                            id: listUsers[i].id,
                            assignmentName: $("#js-assignment-name").val(),
                            assignmentDate: $("#js-assignment-date").val()
                        }),
                        headers: {
                            Authorization: `Bearer ${APP.LOGIN_INFO.authToken}`
                        },
                        success: function createList(userObj) {
                            $('.showAssignment').empty();
                         
                            $('.showAssignment').append(`<h3>${userObj.username}</h3>`);
                            for (let j = 0; j < userObj.Assignments.length; j++) {
                                $('.showAssignment').append(`
                            <li>
                            <span>Assignment: <b class="assignmentColor">${userObj.Assignments[j].assignmentName}</b> Due Date: <b class="assignmentColor">${userObj.Assignments[j].assignmentDate}</b></span>
                            <button class="assignment-item-update button-label">Edit</button>
                            <button class="assignment-item-delete button-label">Delete</button>
                            </li>`);
                            }
                        },
                        error: function error() {
                            console.log('An error has occured!');
                        },
                        contentType: 'application/json'
                    })
                }
            }
        }
    })
};

//loads the list of students for an admin login
const loadUsers = () => {
    $.ajax({
        type: "GET",
        url: '/api/users',
        success: function success(users) {
            const list = [];
            for (let i = 0; i < users.length; i++) {
                if (users[i].isAdmin === false) {  
                     list.push(`<option value="${users[i].username}">${users[i].username}</option>`);  
                } 
            }
            $(".showStudents-js").html(list); 
        }
    });
};

$(function () {
    loadUsers();

    $('body').submit(function (ev) {
        ev.preventDefault();
        const target = $(ev.target)
$('body').on('click', '.assignment-item-delete', ev =>{
    alert('yay');
})
        //Adding list item
        if (target.attr('name') === 'js-assignment-list-form') {
            console.log('You clicked ADD item!')
            handleAddItem()
        }
    });
});