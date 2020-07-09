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

let responseJson;

function query() {
    const errorEl = document.getElementById("error");
    fetch(`/query`, { method: 'GET' })
        .then(response => response.json())
        .then((response) => {
            responseJson = response; // Debug
            if (response.status === "OK") {
                errorEl.innerText = response.pick;
                resultsPage(response.pick);
            } else if (response.status === "INVALID_REQUEST")
                throw 'Invalid request';
            else if (response.status === "ZERO_RESULTS")
                throw 'No results';
            else if (response.status === "NO_REROLLS")
                throw 'No re-rolls left';
            else
                throw 'Unforeseen error';
        })
        .catch((error) => {
            errorEl.classList.remove('success-banner');
            errorEl.classList.remove('hidden');
            errorEl.classList.add('error-banner');
            errorEl.innerText = error;
        });
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

$('#randomize-form').submit(function(event) {
    const errorEl = document.getElementById("error");
    errorEl.classList.add('hidden');

    event.preventDefault();
    let url = form.attr('action');
    let lat = localStorage.getItem("lat");
    let lng = localStorage.getItem("lng");
    let queryStr = $(this).serialize() + `&lat=${lat}&lng=${lng}`;

    $.ajax({
        type: "POST",
        url: url,
        data: queryStr,
        success: function(response) {
            query();
        }
    });
});

$('#randomize-form').submit(function(e) {
    e.preventDefault();
    let url = $(this).attr('action');
    let lat = localStorage.getItem("lat");
    let lng = localStorage.getItem("lng");
    let datum = $(this).serialize()+`&lat=${lat}&lng=${lng}`;

    $.ajax({
        type: "POST",
        url: url,
        data: datum,
        success: function(response) {
            query();
        }
    });
});

$("input, textarea").blur(function() {
    if ($(this).val() != "") {
        $(this).addClass("active");
    } else {
        $(this).removeClass("active");
    }
})

function resultsPage(pick) {
    fetch(`../results.html`)
        .then(html => html.text())
        .then((html) => {
            document.getElementsByTagName('body')[0].innerHTML = html;
            const pickEl = document.getElementById("pick");
            pickEl.innerText = pick;
        });
}

function reroll() {
    const pickEl = document.getElementById("pick");
    fetch(`/query`, { method: 'GET' })
        .then(response => response.json())
        .then((response) => {
            responseJson = response; // Debug
            if (response.status === "OK") {
                pickEl.innerText = response.pick;
            } else if (response.status === "INVALID_REQUEST")
                throw 'Invalid request';
            else if (response.status === "ZERO_RESULTS")
                throw 'No results';
            else if (response.status === "NO_REROLLS")
                throw 'No re-rolls left';
            else
                throw 'Unforeseen error';
        })
        .catch((error) => {
            pickEl.innerText = error;
        });
}
