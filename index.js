//FUNCTIONS THAT ACTIVATE ON BUTTON PRESS

//When geolocation button is pressed, run functions to get location.
function watchButton() {
    $("#submit-button").on("click", event => {
        event.preventDefault();
        hideOldData();
        getLocationFromAPI();
    });
}

//When backup "enter info" button is pressed, run functions to get location.
function watchForm() {
    $(".place-name").submit(event => {
        event.preventDefault();
        const locationName = $("#city-name").val() + "+" + $("#state-name").val();
        getLocationFromInput(locationName);
        hideOldData();
    })
};



//FUNCTIONS THAT GET LATITUDE AND LONGITUDE FROM INPUT

//Get location from Google geolocation API. If this fails, run getLocationFromBrowser function.
//If successful, run displayresults.
function getLocationFromAPI() {
    fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAbOJBsHu8NRJnwsjAK_UONAWnDd2eh6LA&considerIp=true")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                console.log("Google geolocation API failed, attempting browser geolocation");
            };

        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            console.log("Google geolocation API failed, attempting browser geolocation");
            getLocationFromBrowser();
        });
}

//Set latitude and longitude values for current location, and plug these into Census and Foursquare APIs.
function displayResults(responseJson) {
    console.log(responseJson);
    let latitude = responseJson.results[0].geometry.location.lat;
    let longitude = responseJson.results[0].geometry.location.lng;
    console.log(latitude, longitude);
    getFourSquareData(latitude, longitude);
    getLocationName(latitude, longitude);
}

//If this didn't work, console log error and see if browser can get location. If so, attempt this.
//Otherwise, display error telling user to input location manually.
function getLocationFromBrowser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showCoordinates);
    } else {
        console.log("Browser geolocation failed, displaying error message");
        displayError();
    }
}

//Get location from browser and run getLocationName function. 
//If successful, plug longitude and latitude into FourSquare and Census functions.
//Otherwise, display error telling user to input location manually.
function showCoordinates(position) {
    if (typeof position.coords.latitude != "number") {
        console.log("Browser geolocation failed, displaying error message");
        $(".display-error").append("Geolocation for this device has failed. Make sure your browser has permission to access your location, or try inputting your location's name below!")
    }
    else {
        console.log(position.coords.latitude, position.coords.longitude)
        getLocationName(position.coords.latitude, position.coords.longitude)
        getFourSquareData(position.coords.latitude, position.coords.longitude);
    };
}

//Use Google geocoding to get location from text. If successful, plug this into displayresults function.
function getLocationFromInput(locationName) {
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=AIzaSyAbOJBsHu8NRJnwsjAK_UONAWnDd2eh6LA&considerIp=true`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else console.log("That didn't work.")
            })
            .then(responseJson => displayResults(responseJson))
            .catch(err => {
                displayTextError();
            })
    }

    function displayError(){
        $(".display-error").append("Geolocation for this device has failed. Try inputting your location's name below!")
    }

    function displayTextError(){
        $(".display-error").append("We couldn't find that place. Try searching again.")
    }


    //USING LATITUDE AND LONGITUDE, GET AND HANDLE CENSUS DATA

    //Use geocodio API to turn latitude and longitude info into current census track.
    function getLocationName(lat, long) {
        console.log(lat, long)
        fetch(`https://api.geocod.io/v1.4/reverse?q=${lat},${long}&fields=census2010&api_key=8cccc5825cc2d2dc042d3db2d00b2d5dcd85bcd`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else console.log("That didn't work.")
            })
            .then(responseJson => grabCensusData(responseJson))
            .catch(err => {
                console.log(err)
            })
    };

    //Take lat and long from geocodio and use Census API to get vital statistics for area.
    //If it's a city, town or village, get statistics for that place. For rural areas, use census tract.
    function grabCensusData(responseJson) {
        console.log(responseJson)
        if (responseJson.results[0].fields.census[2010].place !== null) {
            let stateId = (responseJson.results[0].fields.census[2010].place.fips).slice(0, 2);
            let placeId = (responseJson.results[0].fields.census[2010].place.fips).slice(2);
            fetch(`https://api.census.gov/data/2017/acs/acs5?get=B01003_001E,B02001_002E,B02001_003E,B02001_004E,B02001_005E,B02001_006E,B02001_007E,B02001_008E,B03001_003E,B06009_002E,B06009_003E,B06009_004E,B06009_005E,B06009_006E,B06011_001E,NAME&for=place:${placeId}&in=state:${stateId}&key=dbaa8376c3814b67ddc36b61de2290ee531ffe43`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else console.log("That didn't work")
                })
                .then(responseJson => censusDisplay(responseJson))
                .catch(err => {
                    console.log("That didn't work, either.")
                }
                )
        }
        else {
            let stateId = (responseJson.results[0].fields.census[2010].county_fips).slice(0, 2);
            let countyId = (responseJson.results[0].fields.census[2010].county_fips).slice(2);
            let tractId = responseJson.results[0].fields.census[2010].tract_code;
            console.log(stateId, countyId, tractId);
            fetch(`https://api.census.gov/data/2017/acs/acs5?get=B01003_001E,B02001_002E,B02001_003E,B02001_004E,B02001_005E,B02001_006E,B02001_007E,B02001_008E,B03001_003E,B06009_002E,B06009_003E,B06009_004E,B06009_005E,B06009_006E,B06011_001E,NAME&for=tract:${tractId}&in=county:${countyId}&in=state:${stateId}&key=dbaa8376c3814b67ddc36b61de2290ee531ffe43`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else console.log("That didn't work")
                })
                .then(responseJson => censusDisplay(responseJson))
                .catch(err => {
                    console.log(err)
                }
                )
        }
    }

    //Format, calculate and display census data.
    function censusDisplay(responseJson) {
        console.log(responseJson);
        let cityName = responseJson[1][15];
        let population = responseJson[1][0];
        let percentWhite = Math.round(responseJson[1][1] / responseJson[1][0] * 100);
        let percentBlack = Math.round(responseJson[1][2] / responseJson[1][0] * 100);
        let percentAsian = Math.round(responseJson[1][4] / responseJson[1][0] * 100)
        let percentLatino = Math.round(responseJson[1][8] / responseJson[1][0] * 100)
        let percentindigenous = Math.round(((responseJson[1][5] / responseJson[1][0]) * 100) + ((responseJson[1][3] / responseJson[1][0]) * 100))
        let percentOther = Math.round(((responseJson[1][6] / responseJson[1][0]) * 100) + ((responseJson[1][7] / responseJson[1][0]) * 100))
        let percentSomeCollege = Math.round(((responseJson[1][11] / responseJson[1][0]) * 100) + ((responseJson[1][12] / responseJson[1][0]) * 100) + ((responseJson[1][13] / responseJson[1][0]) * 100))
        let percentCollege = Math.round(((responseJson[1][12] / responseJson[1][0]) * 100) + ((responseJson[1][13] / responseJson[1][0]) * 100))
        let averageIncome = responseJson[1][14]
        $(".census-info").append(`<h2>This place is ${cityName}!</h2><p>${cityName} has a population of ${population}. Of these, ${percentWhite} percent are white, ${percentBlack} percent are black, ${percentAsian} percent are Asian, ${percentindigenous} percent are American Indian or indigenious, and ${percentOther} percent identify as something else or two or more races. ${percentLatino} percent identify as Hispanic or Latino, of any race. ${percentSomeCollege} percent have at least some college education, and ${percentCollege} percent have at least a bachelor's degree. The average income here is $${averageIncome} per year.</p>`);
        showPlaceInfo();
    }



    //USING LATITUDE AND LONGITUDE, GET AND HANDLE FOURSQUARE DATA

    //Get Foursquare data from Foursquare API.
    function getFourSquareData(lat, long) {
        fetch(`https://api.foursquare.com/v2/venues/explore?ll=${lat},${long}&limit=5&client_id=2PI2SJK2PFRDFWHY0LUGA4WPN513K2AJMXWYUYIEBMR1J1N2&client_secret=AYSYE5XZ11F0KRTCDFOCHUIUYWGEL5F5X0DJFF5LBWOKPYOQ&v=20191001`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else console.log("That didn't work")
            })
            .then(responseJson => displayFourSquare(responseJson))
            .catch(err => {
                console.log("Aw, shit.")
            })
    };

    //Format Foursquare data for display and put on page.
    function displayFourSquare(responseJson) {
        console.log(responseJson);
        for (i = 0; i < responseJson.response.groups[0].items.length; i++) {
            let venueAddress = responseJson.response.groups[0].items[i].venue.location.formattedAddress[0] + ", " + responseJson.response.groups[0].items[i].venue.location.formattedAddress[1]
            let venueType = responseJson.response.groups[0].items[i].venue.categories[0].name;
            let venueName = responseJson.response.groups[0].items[i].venue.name;
            $(".foursquare-venues").append(`<li><h3>${venueName}</h3>${venueType}<br>${venueAddress}</li>`)
        }
    }



    //DISPLAY/HIDE DATA

function showPlaceInfo() {
        $(".census-info").fadeIn(1000);
        $(".foursquare-info").fadeIn(1000);
        $(".instructions").empty();
        $(".instructions").append("Want to search for another place? Press the button below to get your location using GPS, or enter it manually below.");
    }


function hideOldData(){
    $(".census-info").hide();
    $(".foursquare-info").hide();
    $(".census-info").empty();
    $(".foursquare-venues").empty();
    $("#city-name").val("");
    $("#state-name").val("");
    $(".display-error").empty();
}



    watchButton();
    watchForm();