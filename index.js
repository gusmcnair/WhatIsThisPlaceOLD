function watchButton () {
    $("#submit-button").on("click", event => {
        event.preventDefault();
        getLocation();
    });
}

function watchForm(){
    $(".place-name").submit(event => {
        event.preventDefault();
        const locationName = $("#city-name").val() + "+" + $("#state-name").val()
        getCoordinates(locationName);
        console.log(locationName);
    })};

function getLocation() {
    fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAbOJBsHu8NRJnwsjAK_UONAWnDd2eh6LA&considerIp=true")
        .then(response => {
            if(response.ok) {
                return response.json();
            } else console.log(response)
            })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            $(".init-form").hide();
            $(".location-name").fadeIn(1000);
        });
}

function getCoordinates(locationName) {
    console.log(fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=AIzaSyAbOJBsHu8NRJnwsjAK_UONAWnDd2eh6LA&considerIp=true`)    )
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=AIzaSyAbOJBsHu8NRJnwsjAK_UONAWnDd2eh6LA&considerIp=true`)
        .then(response => {
            if(response.ok) {
                return response.json();
            } else console.log("That didn't work.")
            })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            console.log("That didn't work, either.");
        })
        }


function displayResults(responseJson){
    $(".census-info").append(responseJson)
    console.log(responseJson);
}

watchButton()
watchForm();