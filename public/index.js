'use strict';

// initial app state
const APP = {
    JWT_TOKEN: {},
    lastAssignments: []
}

//Reloads page to the sign-up screen
const sendSignUp = () => {
    window.location.href = "sign-up.html";
};

//Reloads page to the login screen
const sendLogin = () => {
    window.location.href = "login.html";
};

//Mobile responsive navigation bar
const navDropDown = () => {
    let x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
};

//To sign up for an account
const signUpForm = () => {
    //First, a POST request with values the user inputs
    $.ajax({
        type: "POST",
        url: '/api/users',
        data: JSON.stringify({
            username: $("#username").val(),
            password: $("#password").val(),
            firstName: $("#firstName").val(),
            lastName: $("#lastName").val(),
            isAdmin: $('input[name=isAdmin]:checked').val(),
            // Assignments will be added by an admin user later
            Assignments: [{
                assignmentName: '',
                assignmentDate: '',
            }]
        }),
        // if there is a successful sign up, switch pages to login.html
        success: function success(response) {
            console.log(response) //JWT
            window.location.href = "login.html";
        },
        //if there is an error, show the error on the sign up form
        error: function error(err) {
            $('.js-errorsUser').html(`Username ${err.responseJSON.message}!`);
            $('.js-errorsPass').html(`Password ${err.responseJSON.message}!`);

            if (err.responseJSON.location === "username") {
                $('.js-errorsPass').hide();
                $('.js-errorsUser').show();
            } else if (err.responseJSON.location === "password") {
                $('.js-errorsUser').hide();
                $('.js-errorsPass').show();
            }
        },
        contentType: 'application/json'
    });
    return false;
};

//Only for admin users - Adds an item to a specific student user's dashboard
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
                        success: function createList(userObj) {
                            $('.showAssignment').empty()
                            for (let j = 0; j < userObj.Assignments.length; j++) {
                                $('.showAssignment').append(`
                            <li>
                            <span>Username: ${userObj.username} Assignment: ${userObj.Assignments[j].assignmentName} Date: ${userObj.Assignments[j].assignmentDate}</span>
                            <button class="assignment-item-update">
                            <span class="button-label">update</span>
                            </button>
                            <button class="assignment-item-delete">
                            <span class="button-label">delete</span>
                            </button><br></li>`);
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

//For all form submissions
$(function () {

    console.log('APP STARTS', new Date().toLocaleTimeString())
    restoreLoginToken()

    $('body').submit(function (ev) {
        ev.preventDefault();
        const target = $(ev.target)

        //Sign up form submission    
        if (target.attr('name') === 'signup') {
            signUpForm();
        }
        if (target.attr('name') === 'login') {
            loginForm();
        }
        //Adding list item
        if (target.attr('name') === 'js-assignment-list-form') {
            console.log('You clicked ADD item!')
            handleAddItem()
        }
        //Deleting list item
        if (target.attr('name') === 'list-items') {
            console.log('You clicked LIST item!')
        }
    })
});

//To save the JWT token as a cookie 
const saveLoginToken = () => {
    Cookies.set('APP_TOKEN', JSON.stringify(APP.JWT_TOKEN));
};

//To restore the login when page is reloaded to stay logged in.
const restoreLoginToken = () => {
    const savedTokenJSONStr = Cookies.get('APP_TOKEN')
    if (savedTokenJSONStr) {
        APP.JWT_TOKEN = JSON.parse(savedTokenJSONStr);
        console.log('LOGIN RESTORED, APP IS NOW', APP);
    }
};


//For Login form
const loginForm = () => {
    //POST username and password in exchange for a JWT token
    $.ajax({
        type: "POST",
        url: '/api/auth/login',
        data: JSON.stringify({
            username: $("#username").val(),
            password: $("#password").val(),
        }),
        contentType: 'application/json',
        success: function success(response) {
            // response is the JWT of the logged in user
            APP.JWT_TOKEN = response;
            saveLoginToken();
            console.log(response);
            // GET list of all users to find out if they are an admin
            // DRY
            $.ajax({
                type: "GET",
                url: `/api/users/`,
                success: function successful(jsonRes) {
                    for (let i = 0; i < jsonRes.length; i++) {
                        if (jsonRes[i].username === ($('#username').val()) && jsonRes[i].isAdmin === true) {
                            $.ajax({
                                type: "GET",
                                url: '/api/protected',
                                headers: {
                                    Authorization: `Bearer ${APP.JWT_TOKEN.authToken}`
                                },
                                success: function loadAuthorized(success){
                                    window.location.href = "teacher-dash.html";
                                },
                                error: function unauthorized(error){
                                    console.log(error);
                                }
                            })
                           /* console.log('you are a teacher');
                            console.log(jsonRes);
                            loadDashboardTeacher();
                            $('.Greeting').html(`Hello ${jsonRes.firstName}!`).show().delay(4900).fadeOut();
                            $('.teacherDash').html('Teacher Dashboard').hide().delay(5000).fadeIn();
                            */
                        } else if (jsonRes[i].username === ($('#username').val()) && jsonRes[i].isAdmin === false) {
                           /* console.log('You are a student');
                            loadDashboardStudent();
                            $('.Greeting').html(`Hello ${jsonRes.firstName}!`).show().delay(5000).fadeOut();
                            */
                        }
                    }
                },
                error: function error(err) {
                    console.log(err)
                },
                contentType: 'application/json'
            });
            return false;
        }
    })
};

/*$(function () {
    $('form[name=login]').submit(function (e) {
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: '/api/auth/login',
            data: JSON.stringify({
                username: $("#username").val(),
                password: $("#password").val(),
            }),
            success: success,
            error: error,
            contentType: 'application/json'
        });
        return false;
    });


    function success(JWT_TOKEN) {
        console.log(JWT_TOKEN); //authtoken
        $.ajax({
            type: "GET",
            url: `/api/users/`,
            success: successful,

            //need to only get the data user is calling for 

        })
        function successful(success) {
            console.log(success); // json response
            for (let i = 0; i < success.length; i++) {
                if (success[i].username === ($('#username').val())) {
                    $.ajax({
                        type: "GET",
                        url: '/api/users/' + success[i].id,
                        success: function doSomething(success) {
                            if (success.isAdmin === true) {
                                $.ajax({
                                    type: "GET",
                                    url: '/api/protected',
                                    headers: {
                                        Authorization: `Bearer ${JWT_TOKEN.authToken}`
                                    },
                                    success: function work(successy) {
                                        loadDashboardTeacher();
                                        $('.Greeting').html(`Hello ${success.firstName}!`).show().delay(4900).fadeOut();
                                        $('.teacherDash').html('Teacher Dashboard').hide().delay(5000).fadeIn();
                                        $.ajax({
                                            type: "GET",
                                            url: '/api/users',
                                            success: function assignments(successfully) {
                                                $('.Assignments').html(`${success.Assignments}`)
                                                console.log(success.Assignments)
                                            }
                                        })
                                    },

                                })
                            } else {
                                $.ajax({
                                    type: "GET",
                                    url: '/api/protected',
                                    headers: {
                                        Authorization: `Bearer ${response.authToken}`
                                    },
                                    success: function work(successo) {

                                        loadDashboardStudent();
                                        $('.Greeting').html(`Hello ${success.firstName}!`).show().delay(5000).fadeOut();
                                    },

                                })
                            }
                        }

                    })
                }
            }
        }


    }
    function error(err) {

        if (err.status == '401') {
            $('.js-errorIncorrect').html('Username or Password incorrect');
        }
    }
})
*/


// If logged in as an admin, this will appear
function loadDashboardTeacher() {
    const dashboard = `
    <h2 class="Greeting"></h2>
    <div class="row">
        <div class="col-12">
            <h2 class="teacherDash"></h2>
        </div>
    </div>
    <form class="assignmentForm" name="js-assignment-list-form">
        <label for="assignment-list-entry">Username</label>
        <input type="text" id="username" class="forDashboard" name="assignment-list-entry">
            
        <label for="assignment-list-entry">Assignment Name</label>
        <input type="text" class="forDashboard" id="js-assignment-name" name="assignment-entry" placeholder="Assignment #1">
          
        <label for="assignment-list-entry">Date</label>
        <input type="date" class="forDashboard forDates" id="js-assignment-date" name="assignment-list-entry">

        <button type="submit" class="submitAssignment">Add item</button>
    </form>
       
    <ul class="assignmentList">
      <li class="showAssignment"></li>
    </ul>
  </div>`

    $('.formRemove-js').remove();
    $('.dashboard-js').html(dashboard);

}

//if logged in as a student, this will appear
function loadDashboardStudent() {
    const dashboard = `
    <h3 class="Greeting"></h3>
    <p>Student login</p>
    
    <p>Assignments</p>
    <h4 class="Assignments1"></h4>
    `
    $('.formRemove-js').remove();
    $('.dashboard-js').html(dashboard);
}