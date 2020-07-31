// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* ==========================================================================
   USER SIGN-IN
   ========================================================================== */
function onSignIn(googleUser) {
    let id_token = googleUser.getAuthResponse().id_token;
    let profile = googleUser.getBasicProfile();
    fetch(`/login?id_token=${id_token}`)
        .then((response) => response.json())
        .then((data) => {
            localStorage.setItem("user", data.sub);
            localStorage.setItem("loggedIn", true);
            addUserContent(profile.getName(), profile.getImageUrl());
            toggleAccountMenu();
        }).catch((error) => {
            console.log(error);
        });
}

//Add user information to signed in UI
function addUserContent(name, image) {
    document.getElementById("user-name").innerText = name;
    document.getElementById("profile-pic").src = image;
}

//Replaces the sign-in button with signed in UI
function toggleAccountMenu() {
    document.getElementById("account-menu").classList.toggle("show");
    document.getElementById("sign-in").classList.toggle("hide");
}

//Logs out of the account
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
  localStorage.setItem("user", 0);
  toggleAccountMenu();
}

//Redirects to search page
function backToHome() {
    window.location.replace("index.html");
}

//Redirects to user's account information page
function toAccount() {
    window.location.replace("account-info.html");
}

//Redirects to past searches page
function toSearches() {
    window.location.replace("past-searches.html");
}

function toggleShow() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    let dropdown = document.getElementById("myDropdown");
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
  }
}

/*
    FUNCTIONS RELATED TO THE ACCOUNTS PAGE
*/

function accountFunctions() {
    getNumSearches();
    getLastVisited();
    getFavFood();
    getNumReviews();
}

function getNumSearches() {
    let count = 0;
    let numSearchesEl = document.getElementById('num-searches');
    if (localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((searches) => {
        searches.forEach((search) => {
            count += 1;
        });
        numSearchesEl.innerText = count;
    });
}

function getLastVisited() {
    let lastVisitedEl = document.getElementById('last-visited');
    if (localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((searches) => {
        for (search of searches) {
            lastVisitedEl.innerText = search.name;
            break;
        }
    });
}

function getFavFood() {
    let foodHolder = document.getElementById('fav-food');
    fetch(`/fav-food?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((foods) => {
        if (foods.length == 0) {
            console.log("hello");
            let favFoodFormEl = document.createElement('form');
            favFoodFormEl.action = "/fav-food";
            favFoodFormEl.method = "POST";
            favFoodFormEl.id = "fav-food-form";

            let favFoodInputEl = document.createElement('textarea');
            favFoodInputEl.id = "food-selection";
            favFoodInputEl.placeholder = "or foods :)";

            let formInputHolderEl = document.createElement('div');
            formInputHolderEl.class = "input-group";

            let inputButtonEl = document.createElement('input');
            inputButtonEl.type = "submit";

            formInputHolderEl.appendChild(favFoodInputEl);
            favFoodFormEl.appendChild(formInputHolderEl);
            favFoodFormEl.appendChild(inputButtonEl);
            foodHolder.appendChild(favFoodFormEl);
        } else {
            for (food of foods) {
                let foodTextEl = document.createElement('p');
                foodTextEl.innerText = food;
                foodHolder.appendChild(foodTextEl);
                break;
            }
        }
    });
}

function getNumReviews() {
    let count = 0;
    let numFeedbackEl = document.getElementById('num-feedback');
    if (localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/feedback?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((feedbackList) => {
        feedbackList.forEach((feedback) => {
            count += 1;
        });
    numFeedbackEl.innerText = count;
    });
}

/* ==========================================================================
   RETRIEVING SEARCHES
   ========================================================================== */
//Retrieve searches associated with the current user
function getSearches(){
    let userID = 0;
    if (localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((searches) => {
        let searchesEl = document.getElementById('cards');
        searches.forEach((search) => {
            let searchCard = createSearchElement(search);
            searchesEl.appendChild(searchCard);
        });
    });
}

//Create the card containing the search's information
function createSearchElement(search) {
    const newCardEl = document.createElement('div');
    newCardEl.className = 'card card-2';
    const newCardBody = document.createElement('div');
    newCardBody.className = 'card-body';
    //creating the restaurant name element
    const nameElement = document.createElement('p2');
    nameElement.id = 'restaurant-name';
    nameElement.innerText = search.name;

    newCardBody.appendChild(nameElement);
    newCardBody.appendChild(document.createElement('br'));

    //creating the list of parameters
    const paramElement = document.createElement('p3');
    const tempParamElement = "Parameters: " + search.keywords;

    // tempParamElement += radius;
    paramElement.innerText = tempParamElement;
    newCardBody.appendChild(paramElement);

    newCardBody.appendChild(document.createElement('br'));

    //creating the feedback element
    const feedbackElement = document.createElement('p3');

    (async () => {
        let updatedFeedbackElements = await getFeedback(search);
        tempFeedbackElement = updatedFeedbackElements[0];
        buttons = updatedFeedbackElements[1];

        feedbackElement.innerText = tempFeedbackElement;
        newCardBody.appendChild(feedbackElement);
        newCardBody.appendChild(document.createElement('br'));
        newCardBodyWithButtons = createSearchesButtons(search, buttons, newCardBody);
        newCardEl.appendChild(newCardBodyWithButtons);
    })()

    return newCardEl;
}

// Create feedback button (if feedback is not already submitted) and and search again button
function createSearchesButtons(search, buttons, newCardBody) {
    let feedbackButton = null;
    let formEl = document.getElementById('searches-form');
    if (buttons) {
        let modal = document.getElementById('searchModal');
        let span = document.getElementsByClassName("close")[0];
        span.onclick = function() {
            let restaurantContainerEl = document.getElementById("restaurant-name-container");
            restaurantContainerEl.remove();
            let submitButtonEl = document.getElementById("submit-button");
            if (submitButtonEl != null) {
                submitButtonEl.remove();
            }
            modal.style.display = "none";
        }
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                let restaurantContainerEl = document.getElementById("restaurant-name-container");
                restaurantContainerEl.remove();
                let submitButtonEl = document.getElementById("submit-button");
                if (submitButtonEl != null) {
                    submitButtonEl.remove();
                }
                modal.style.display = "none";
            }
        }
        feedbackButton = document.createElement('button');
        feedbackButton.className = 'btn1 feedback';
        feedbackButton.innerText = "Submit Feedback";
        feedbackButton.addEventListener('click', () => {
            let restaurantNameEl = createRestaurantElement(search.name);
            formEl.appendChild(restaurantNameEl);
            modal.style.display = "block";
        });
        newCardBody.appendChild(feedbackButton);
    }
    let searchButton = document.createElement('button');
    searchButton.className = 'btn1 search';
    searchButton.innerText = "Search with These Parameters Again";
    newCardBody.appendChild(searchButton);
    searchButton.addEventListener('click', () => {
        reroll()});
    return newCardBody;
}

//Function to append restaurant name to modal form to force it to follow through to feedback
function createRestaurantElement(restaurantName) {
    let userID = 0;
    if (localStorage.getItem("loggedIn")) {
        userID = localStorage.getItem("user");
    }
    let userEl = document.createElement('input');
    userEl.className = "input--style-2";
    userEl.type = "text";
    userEl.id = "user-id";
    userEl.name = "user-id";
    userEl.value = userID;
    userEl.hidden = true;

    let inputGroupEl = document.createElement('div');
    inputGroupEl.className = "input-group";
    inputGroupEl.id = "restaurant-name-container";
    let inputContainer = document.createElement('input');
    inputContainer.className = "input--style-2";
    inputContainer.type = "text";
    inputContainer.id = "restaurant-name-fill";
    inputContainer.name = "restaurant-name-fill";
    inputContainer.value = restaurantName;
    inputContainer.innerText = restaurantName;
    inputGroupEl.appendChild(inputContainer);
    inputGroupEl.appendChild(userEl);

    let submitEl = document.createElement('input');
    submitEl.type = "submit";
    submitEl.id = "submit-button";
    inputGroupEl.appendChild(submitEl);
    return inputGroupEl;
}

async function fetchFeedback() {
    let userID = 0;
    if (localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    let response = await fetch(`/feedback?user=${userID}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        return data;
    });
    return response;
}

async function getFeedback(search) {
    let buttons = true;
    let tempFeedbackElement = "Feedback: You haven't submitted feedback yet";
    let fetchedFeedback = await fetchFeedback();
    fetchedFeedback.forEach((feedback) => {
        if (feedback.restaurantName == search.name) {
            thisRestaurantsFeedback = feedback.restaurantRating + "; " + feedback.notes;
            buttons = false;
            tempFeedbackElement = "Feedback: " + thisRestaurantsFeedback;
            return [tempFeedbackElement, buttons];
        }
    });
    return [tempFeedbackElement, buttons];
}

//Function to append restaurant name to modal form to force it to follow through to feedback
function createRestaurantElement(restaurantName) {
    let userID = 0;
    if (localStorage.getItem("loggedIn")) {
        userID = localStorage.getItem("user");
    }
    let userEl = document.createElement('input');
    userEl.className = "input--style-2";
    userEl.type = "text";
    userEl.id = "user-id";
    userEl.name = "user-id";
    userEl.value = userID;
    userEl.hidden = true;

    let inputGroupEl = document.createElement('div');
    inputGroupEl.className = "input-group";
    inputGroupEl.id = "restaurant-name-container";
    let inputContainer = document.createElement('input');
    inputContainer.className = "input--style-2";
    inputContainer.type = "text";
    inputContainer.id = "restaurant-name-fill";
    inputContainer.name = "restaurant-name-fill";
    inputContainer.value = restaurantName;
    inputContainer.innerText = restaurantName;
    inputGroupEl.appendChild(inputContainer);
    inputGroupEl.appendChild(userEl);

    let submitEl = document.createElement('input');
    submitEl.type = "submit";
    submitEl.id = "submit-button";
    inputGroupEl.appendChild(submitEl);
    return inputGroupEl;
}

async function fetchFeedback() {
    let userID = 0;
    if (localStorage.getItem("loggedIn")) {
        userID = localStorage.getItem("user");
    }
    let response = await fetch(`/feedback?user=${userID}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        return data;
    });
    return response;
}

async function getFeedback(search) {
    let buttons = true;
    let tempFeedbackElement = "Feedback: You haven't submitted feedback yet";
    let fetchedFeedback = await fetchFeedback();
    fetchedFeedback.forEach((feedback) => {
        if (feedback.restaurantName == search.name) {
            thisRestaurantsFeedback = feedback.restaurantRating + "; " + feedback.notes;
            buttons = false;
            tempFeedbackElement = "Feedback: " + thisRestaurantsFeedback;
        }
    });
    return [tempFeedbackElement, buttons];
}