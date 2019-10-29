const coordinates = "";

function watchButton() {
    $("#submit-button").on("click", event => {
        event.preventDefault();
        getLocation();
    });
}

function watchForm() {
    $(".place-name").submit(event => {
        event.preventDefault();
        const locationName = $("#city-name").val() + "+" + $("#state-name").val()
        getLocationFromText(locationName);
    })
};

function getLocation() {
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
            getCoordinates();
        });
}

function getCoordinates() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Browser geolocation failed, displaying error message");
        $(".display-error").append("Geolocation for this device has failed. Try inputting your location's name below!")
    }
}

function showPosition(position) {
    if (typeof position.coords.latitude != "number") { console.log("Browser geolocation failed, displaying error message");
    $(".display-error").append("Geolocation for this device has failed. Try inputting your location's name below!") }
    else { console.log(position.coords.latitude, position.coords.longitude) };
    //getCensusData(position.coords.latitude, position.coords.longitude)
    //getFourSquareData(position.coords.latitude, position.coords.longitude);
}


function displayResults(responseJson) {
    let latitude = responseJson.results[0].geometry.location.lat;
    let longitude = responseJson.results[0].geometry.location.lng;
    console.log(latitude, longitude);
    //getCensusData(latitude, longitude)
    //getFourSquareData(latitude, longitude);
}

function getLocationFromText(locationName) {
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=AIzaSyAbOJBsHu8NRJnwsjAK_UONAWnDd2eh6LA&considerIp=true`)
    .then(response => {
        if(response.ok) {
            return response.json();
        } else console.log("That didn't work.")
        })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
        console.log("That didn't work, either.")
            })}


function getCensusData(){};

function getFourSquareData(){};    
            
watchButton();

watchForm();