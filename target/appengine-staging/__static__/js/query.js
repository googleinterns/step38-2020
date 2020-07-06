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

const apiKey = 'AIzaSyDbEPugXWcqo1q6b-X_pd09a0Zaj3trDOw';
let searchResults;
let queryArr;

function loadPage() {
    window.location.replace("results.html");
}

function query() {
    const lat = -33.8670522;
    const long = 151.1957362;
    // const lat = 39.109635;
    // const long = -108.542347;
    const radius = document.getElementById('distance').value;
    const type = 'restaurant';
    const keyword = document.getElementById('searchTerms').value;
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 'location=' + lat + ',' + long + '&radius=' + radius + '&type=' + type + '&keyword=' + keyword + '&key=' + apiKey;
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    saveSearch(url, radius, keyword);
    fetch(proxyurl + url)
        .then(response => response.json())
        .then((response) => {
            console.log(response);
            let restaurantResults = response.results;
            weightedRestaurant = weightRestaurants(restaurantResults);
            console.log(weightedRestaurant);
        })
        .catch((error) => {
            console.log(error);
            console.log("Can’t access " + url + " response. Blocked by browser?")
        });
}


// retrieves the user's current location, if allowed -> not sure how to store this/return lat, lng vals for query function
function getLocation() {
    let location = document.getElementById("location-container");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        console.log(pos);
        let address = convertLocation(pos);
        console.log(address);
        location.innerText = address;
        });
    } else {
    // Browser doesn't support Geolocation
    pos = {lat: -34.397, lng: 150.644};
    let address = convertLocation(pos);
    console.log(address);
    location.innerText = address;
  }
}

// convert lat/lng format to human-readable address --> my goal was to call this in the above function and store the human-readable
// address in the location-container spot (so it was in the spot as the sydney australia address)
function convertLocation(location) {
    let lat = location.lat;
    let long = location.lng;
    const url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + long + '&result_type=street_address&key=' + apiKey;
    const proxyurl = "https://cors-anywhere.herokuapp.com/";

    fetch(proxyurl + url)
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

function saveSearch(url, radius, keyword){
    let userID = 0;
    if(localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}&radius=${radius}&keywords=${keyword}&url=${url}`, {
        method: 'POST'
    });
}

function getSearches(){
    let userID = 0;
    if(localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}`, {method: 'GET'}).then(response => response.json()).then(data => console.log(data));
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

function weightRestaurants(restaurants) {
    let requestedPrice = document.getElementById('price').value;
    let requestedRating = document.getElementById('rating').value;
    let requestedType = document.getElementById('type').innerText;

    let restaurantMap = new Map();
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

        console.log(requestedRating);
        if (requestedRating == 0 || requestedRating == ratingLevel) {
            score += 4;
        } else if (Math.abs(requestedRating-ratingLevel) <= 1) {
            score += 3;
        } else if (Math.abs(requestedRating-ratingLevel) <= 2) {
            score += 2;
        } else if (Math.abs(requestedRating.ratingLevel) <= 3) {
            score += 1;
        }
        console.log(score);

        // not sure below is helpful/accurate - might want to eliminate b/c will prob get taken care of w $$$
        if (requestedType == "No preference" || 
        (requestedType == "Fast Food" && restaurant.types.contains("meal_takeaway")) || 
        (requestedType == "Dine-in" && !restaurant.types.contains("meal_takeaway"))) {
            score += 2;
        }

        restaurantMap.set(restaurant, score);
        total += score;
    }
    console.log(restaurantMap);
    let selected = Math.floor(Math.random() * total);
    let prevScore = 0;
    for (i = 0; i < restaurants.length; i++) {
        prevScore = restaurantMap.get(restaurants[i-1]);
        let curScore = restaurantMap.get(restaurants[i]);
        if (prevScore <= selected && selected < prevScore + curScore) {
            return restaurants[i];
        }
        prevScore = prevScore + curScore;
    }
}

