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
function query() {
    let lat = localStorage.getItem("lat");
    let lon = localStorage.getItem("lng");
    const radius = document.getElementById('distance').value;
    const type = 'restaurant';
    const searchTerms = document.getElementById('searchTerms').value;
    const errorEl = document.getElementById("error");
    saveSearch(lat, lon, radius, searchTerms);
    errorEl.classList.add('hidden');
    fetch(`/query`, { method: 'GET' })
        .then(response => response.json())
        .then((response) => {
            if (response.status === "OK") {
                let queryArr = response.results;
                console.log(queryArr);
                errorEl.classList.remove('error-banner');
                errorEl.classList.remove('hidden');
                errorEl.classList.add('success-banner');
                errorEl.innerText = "Success!";
                // test(JSON.stringify(response));
            } else if (response.status === "INVALID_REQUEST")
                throw 'Invalid request'
            else if (response.status === "ZERO_RESULTS")
                throw 'No results'
            else
                throw 'Unforeseen error'
        })
        .catch((error) => {
            errorEl.classList.remove('success-banner');
            errorEl.classList.remove('hidden');
            errorEl.classList.add('error-banner');
            errorEl.innerText = error;
        });
}

$('#randomize-form').submit(function(e) {
    e.preventDefault();
    var form = $(this);
    var url = form.attr('action');

    $.ajax({
        type: "POST",
        url: url,
        data: form.serialize(),
        success: function(response) {
            query();
        }
    });
});

function loadPage() {
    window.location.replace("results.html");
}

// retrieves the user's current location, if allowed -> not sure how to store this/return lat, lng vals for query function
function getLocation() {
    let location = document.getElementById("location-container");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
            };
            localStorage.setItem("lat", pos.lat);
            localStorage.setItem("lng", pos.lng);
            convertLocation(pos).then((address)=>{
                console.log(address);
                location.innerText = address;
            });
        });
    } else {
    // Browser doesn't support Geolocation
        let pos = {lat: -34.397, lng: 150.644};
        localStorage.setItem("lat", pos.lat);
        localStorage.setItem("lng", pos.lng);
        convertLocation(pos).then((address)=>{
            console.log(address);
            location.innerText = address;
        });
    }
}

// convert lat/lng format to human-readable address --> my goal was to call this in the above function and store the human-readable
// address in the location-container spot (so it was in the spot as the sydney australia address)
function convertLocation(location) {
    let lat = location.lat;
    let long = location.lng;
    return fetch(`/convert?lat=${lat}&lng=${long}`)
        .then(response => response.json())
        .then(response => {
            console.log(response.results[0].formatted_address);
            return response.results[0].formatted_address;
        })
        .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"));
}

function onSignIn(googleUser) {
  let id_token = googleUser.getAuthResponse().id_token;
  let profile = googleUser.getBasicProfile();
  fetch(`/login?id_token=${id_token}`).then(response => response.json()).then((data) => {
      localStorage.setItem("user", data.id);
      localStorage.setItem("loggedIn", true);
      addUserContent(profile.getName(), profile.getImageUrl());
      toggleAccountMenu();
    });
}

function addUserContent(name, image){
    document.getElementById("user-name").innerText = name;
    document.getElementById("profile-pic").src = image;
}

function toggleAccountMenu() {
    document.getElementById("account-menu").classList.toggle('show');
    document.getElementById("sign-in").classList.toggle('hide');
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
  localStorage.setItem("user", 0);
  toggleAccountMenu();
}

function saveSearch(lat, lng, radius, keyword){
    let userID = 0;
    if(localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}&radius=${radius}&keywords=${keyword}&lat=${lat}&lng=${lng}`, {
        method: 'POST'
    });
}

function getSearches(){
    let userID = 0;
    if(localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((searches) => {
        const searchesEl = document.getElementById('cards');
        searches.forEach((search) => {
            searchesEl.appendChild(createSearchElement(search));
        });
    });
}

function createSearchElement(search) {
    const cardElement = document.createElement('card-object');
    cardElement.className = 'card';

    const nameElement = document.createElement('p2');
    nameElement.innerText = search.name;

    const paramElement = document.createElement('p3');
    const tempParamElement = "Parameters: ";
    for (items in search.keywords) {
        tempParamElement += items;
        tempParamElement += ", ";
    }
    tempParamElement += radius;
    paramElement.innerText = tempParamElement;

    const feedbackElement = document.createElement('p3');
    // needs to create feedback element, submit feedback button if no feedback,
    // and submit w/ these parameters again button
    const tempFeedbackElement = "Feedback: ";
    const buttons = null;
    feedbackElement.innerText, buttons = getFeedback(tempFeedbackElement, buttons);
    //still working on adding buttons here

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

function getFeedback(tempFeedbackElement, buttons) {
    if (search.feedback = null) {
        tempFeedbackElement += "You haven't submitted feedback yet";
        buttons = true;
    } else {
        tempFeedbackElement += search.feedback;
        buttons = false;
    }
    return tempFeedbackElement, buttons;
}

function createBreak() {
    return document.createElement('/br');
}

function createSearchesButtons(buttons) {
    if (!buttons) {
        feedbackButton = document.createElement('feedback button');
        feedbackButton.innerText = "Submit Feedback";
        feedbackButton.addEventListener('click', () => {
            feedbackWindow();
        });
        const popupText = document.createElement('span');
        popupText.className = 'popuptext';
        popupText.id = 'searchPopup';

    }
    // should essentially do 'reroll' with these parameters
    searchButton = document.createElement('search button');
    searchButton.innerText = "Search with These Parameters Again";
    searchButton.addEventListener('click', () => {
        searchAgain();
    });
}


function feedbackWindow() {
    fetch("/form.html")
      .then((response) => response.text())
      .then((data) => {
          feedbackButton.innerHTML = data;
      })
    var popup = document.getElementById("formPopup");
    popup.classList.toggle("show");
}

//Directions to the selected restaurant
function initMap() {
  var directionsRenderer = new google.maps.DirectionsRenderer();
  var directionsService = new google.maps.DirectionsService();
  let lat = localStorage.getItem("lat")
  let lng = localStorage.getItem("lng")
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
    center: { lat: parseFloat(lat), lng: parseFloat(lng)}
  });
  directionsRenderer.setMap(map);
  directionsRenderer.setPanel(document.getElementById("directionsPanel"));
  calculateAndDisplayRoute(directionsService, directionsRenderer);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  let start = localStorage.getItem("lat") + "," + localStorage.getItem("lng");
  directionsService.route(
    {
      origin: start,
      destination: "1745 Plymouth Rd, Ann Arbor, MI 48105",
      travelMode: "DRIVING"
    },
    function(response, status) {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

function weighRestaurants(restaurants) {
    let requestedPrice = document.getElementById('price').value;
    let requestedRating = document.getElementById('rating').value;

    HashMap<String, Integer> restaurantMap;
        let total = 0; 
        for (restaurant in restaurants) {
            let score = 1;
            let priceLevel = restaurant.price_level;
            let ratingLevel = restaurant.rating;
            if (requestedPrice == 0 || requestedPrice == priceLevel) {
                score += 4;
            } else if (Math.abs(requestedPrice-priceLevel) <= 1) {
                score += 3;
            } else if (Math.abs(requestedPrice-priceLevel) <= 2) {
                score += 2;
            }

            if (requestedRating == 0 || requestedRating == ratingLevel) {
                score += 4;
            } else if (Math.abs(requestedRating-ratingLevel) <= 1) {
                score += 3;
            } else if (Math.abs(requestedRating-ratingLevel) <= 2) {
                score += 2;
            } else if (Math.abs(requestedRating-ratingLevel) <= 3) {
                score += 1;
            }

            restaurantMap.set(restaurant, score);
            total += score;
        }
        let selected = Math.floor(Math.random() * total);
        let curTotalScore = 0;
        // finds the correct restaurant by adding the next score of a restaurant to the 
        for (i = 0; i < restaurants.length; i++) {
            curTotalScore = restaurantMap.get(restaurants[i-1]);
            let curScore = restaurantMap.get(restaurants[i]);
            if (curTotalScore <= selected && selected < curTotalScore + curScore) {
                return restaurants[i];
            }
            curTotalScore += curScore;
        }
}

