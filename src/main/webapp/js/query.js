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

/*
    RESTAURANT QUERY AND RE-ROLL
 */

function query() {
    const errorEl = document.getElementById("error");
    let lat = localStorage.getItem("lat");
    let lon = localStorage.getItem("lng");
    const radius = $("#radius").val();
    const searchTerms = document.getElementById("searchTerms").value;
    saveSearch(lat, lon, radius, searchTerms);
    fetch(`/query`, { method: "GET" })
        .then((response) => response.json())
        .then((response) => {
            if (response.status === "OK") {
                let choice = response.pick;
                errorEl.innerText = choice;
                resultsPage(choice);
            } else if (response.status === "INVALID_REQUEST") throw "Invalid request";
            else if (response.status === "ZERO_RESULTS") throw "No results";
            else if (response.status === "NO_REROLLS") throw "No re-rolls left";
            else throw "Unforeseen error";
        })
        .catch((error) => {
            errorEl.classList.remove("success-banner");
            errorEl.classList.remove("hidden");
            errorEl.classList.add("error-banner");
            errorEl.innerText = error;
        });
}

function reroll() {
    const pickEl = document.getElementById("pick");
    fetch(`/query`, { method: "GET" })
        .then((response) => response.json())
        .then((response) => {
            if (response.status === "OK") {
                pickEl.innerText = response.pick;
            } else if (response.status === "INVALID_REQUEST") throw "Invalid request";
            else if (response.status === "ZERO_RESULTS") throw "No results";
            else if (response.status === "NO_REROLLS") throw "No re-rolls left";
            else throw "Unforeseen error";
        })
        .catch((error) => {
            pickEl.innerText = error;
        });
}


/*
    USER'S LOCATION AND ADDRESS
 */

// Get user location as lat/lng
function getLocation() {
    if (navigator.geolocation) // Does browser support Geolocation?
    navigator.geolocation.getCurrentPosition(geoLocEnabled, geoLocFallback);
    else
        geoLocFallback();
}

// Geolocation is supported and enabled
function geoLocEnabled(position) {
    let locationEl = document.getElementById("location-container");
    let pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
    };
    localStorage.setItem("lat", pos.lat);
    localStorage.setItem("lng", pos.lng);
    convertLocation(pos).then((address) => {
        locationEl.innerText = address;
    });
}

// Use inaccurate IP-based geolocation instead
function geoLocFallback() {
    let locationEl = document.getElementById("location-container");
    let pos = { lat: 40.730610, lng: -73.935242 };
    localStorage.setItem("lat", pos.lat);
    localStorage.setItem("lng", pos.lng);
    convertLocation(pos).then((address) => {
        locationEl.innerText = address;
    });
}

// Convert lat/lng to human readable address
function convertLocation(location) {
    let lat = location.lat;
    let long = location.lng;
    return fetch(`/convert?lat=${lat}&lng=${long}`)
        .then((response) => response.json())
        .then((response) => {
            return response.results[0].formatted_address;
        })
        .catch((error) => console.log(error));
}


/*
    USER SIGN-IN
*/
function onSignIn(googleUser) {
    let id_token = googleUser.getAuthResponse().id_token;
    let profile = googleUser.getBasicProfile();
    fetch(`/login?id_token=${id_token}`)
        .then((response) => response.json())
        .then((data) => {
            localStorage.setItem("user", data.id);
            localStorage.setItem("loggedIn", true);
            addUserContent(profile.getName(), profile.getImageUrl());
            toggleAccountMenu();
        });
}

function addUserContent(name, image) {
    document.getElementById("user-name").innerText = name;
    document.getElementById("profile-pic").src = image;
}

function toggleAccountMenu() {
    document.getElementById("account-menu").classList.toggle("show");
    document.getElementById("sign-in").classList.toggle("hide");
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
        console.log("User signed out.");
    });
    localStorage.setItem("user", 0);
    toggleAccountMenu();
}

function toggleShow() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches(".dropbtn")) {
        let dropdown = document.getElementById("myDropdown");
        if (dropdown.classList.contains("show")) {
            dropdown.classList.remove("show");
        }
    }
};


/*
    SAVING SEARCHES
*/
function saveSearch(lat, lng, radius, keyword) {
    let userID = 0;
    if (localStorage.getItem("loggedIn")) {
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}&radius=${radius}&keywords=${keyword}&lat=${lat}&lng=${lng}`, {
        method: "POST",
    });
}

function getSearches() {
    let userID = 0;
    if (localStorage.getItem("loggedIn")) {
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}`, { method: "GET" })
        .then((response) => response.json())
        .then((searches) => {
            const searchesEl = document.getElementById("cards");
            searches.forEach((search) => {
                searchesEl.appendChild(createSearchElement(search));
            });
        });
}


/*
    HTML
 */

// AJAX POST for form
$("#randomize-form").submit(function(event) {
    const errorEl = document.getElementById("error");
    errorEl.classList.add("hidden");

    event.preventDefault();
    let url = $(this).attr("action");
    let lat = localStorage.getItem("lat");
    let lng = localStorage.getItem("lng");
    let queryStr = $(this).serialize() + `&lat=${lat}&lng=${lng}`;

    $.ajax({
        type: "POST",
        url: url,
        data: queryStr,
        success: function(response) {
            query();
        },
    });
});

// Form underline element
$("input, textarea").blur(function() {
    if ($(this).val() != "") {
        $(this).addClass("active");
    } else {
        $(this).removeClass("active");
    }
});

// TODO: make this seamless and non-jank
// Switch to results page
function resultsPage(pick) {
    fetch(`../results.html`)
        .then((html) => html.text())
        .then((html) => {
            document.getElementById("page-container").innerHTML = html;
            document.getElementById("pick").innerText = pick;
        });
}
