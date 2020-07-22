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

package com.google.sps.data;

import java.util.ArrayList;

public class Search {
    // private String user;
    // private String date;
    private String keywords;
    // private String lat;
    // private String lng;
    // private String radius;
    // private long id;
    // private Feedback feedback;
    private String restaurantName;

    public Search(String keywords, String restaurantName){
    // public Search(String user, String date, String keywords, String lat, String lng, String radius, long id, Feedback feedback, String name){
        // this.user = user;
        // this.date = date;
        this.keywords = keywords;
        // this.lat = lat;
        // this.lng = lng;
        // this.radius = radius;
        // this.id = id;
        this.restaurantName = restaurantName;
        // this.feedback = feedback;
    }

    // public String user() {
    //     return this.user;
    // }

    // public String date() {
    //     return this.date;
    // }

    public String getKeywords() {
        return this.keywords;
    }

    // public String lat() {
    //     return this.lat;
    // }

    // public String lng() {
    //     return this.lng;
    // }

    // public String radius() {
    //     return this.radius;
    // }

    // public long id() {
    //     return this.id;
    // }

    public String getRestaurantName() {
        return this.restaurantName;
    }

    // public Feedback feedback() {
    //     return this.feedback;
    // }
}