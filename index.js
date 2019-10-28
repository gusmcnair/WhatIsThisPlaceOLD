function watchButton () {
    $("button").on("click", event => {
        event.preventDefault();
        getLocation();
    });
}

function getLocation() {
    fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAbOJBsHu8NRJnwsjAK_UONAWnDd2eh6LA&considerIp=true")
        .then(response => {
            if(response.ok) {
                return response.json();
            } else console.log(response)
            })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            $(".census-info").append("No dice, chief.")
        });
}


function responseJson(responseJson){
    $(".census-info").append(responseJson)
}

watchButton()