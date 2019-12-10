let currentPark;

$(document).on("click", "#refresh", function() {
  //Prevent the usual navigation behaviour
  event.preventDefault();
  //debugger;
  // get the API result via jQuery.ajax
  $.mobile.loading("show", { text: "Loading List of Parks", textVisible: true });
  $.ajax({
    url: "https://nominatim.openstreetmap.org/search?",
    data: { format: "json", q: "parks in castellon" },
    //dataType: 'jsonp',
    success: function(data) {
      // output the "capital" object inside "location"
      //alert("Latitude: " + data.latitude + " | Longitude: " + data.longitude);
      $.mobile.loading("hide");
      PopulateList(data);
      //debugger;
      //Populate List
    },fail:function(xhr,textStatus, errorThrown){
      $.mobile.loading("hide");
      alert('request failed');
  }
  });
});

//Navigate to details
$(document).on("pagebeforeshow", "#home", function() {
  //debugger;
  $(document).on("click", "#to_details", function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    //store some data
    currentPark = parks[e.target.children[0].id];
    //Change to details page
    $.mobile.changePage("#details");
  });
});
map = L.map("map", {
  zoom: 18,
  center: [39.9927254, -0.0380158229338167]
  // center: [-0.0380158229338167,39.9927254 ]
});
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ["a", "b", "c"]
}).addTo(map);

//http://openweathermap.org/img/wn/01n.png
//Read the station data to be rendered
$(document).on("pagebeforeshow", "#details", function(e) {
  e.preventDefault();
  // map = document.getElementById('map');
  // $map = $('#map');
  // f = $("<iframe src='https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=33884330'></iframe>")
  // $f = $("<iframe src='http://osm.org/way/33884330'></iframe>")

  // $map.append(f);
  
  $(document).ready(function() {
    console.log("document ready occurred!");
    console.log(currentPark);
    
    $.mobile.loading("show", { text: "Fetching API", textVisible: true });
    // debugger;
    let url;
    if(typeof(currentPark) !== 'undefined'){
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=${currentPark.osm_type[0].toUpperCase()}&osmid=${currentPark.osm_id}&format=json&polygon_geojson=1`;
      }
      else{
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=33884330&format=json&polygon_geojson=1`;
      }
    $.ajax({
      type: "GET",
      url: url,
      success: function(d) {
        $.mobile.loading("hide");
        map.invalidateSize();
        L.marker(d.centroid.coordinates.reverse()).addTo(map);
        park = L.geoJSON(d.geometry);
        map.addLayer(park);
        // debugger;
        // $('#map').append($(d));
      },
      fail:function(xhr,textStatus, errorThrown){
        $.mobile.loading("hide");
        alert('request failed');
      }
    });
  });
});

//$key='b6907d289e10d714a6e88b30761fae22';
//Populate List method
function PopulateList(data) {
  for (let i = 0; i < data.length; i++) {
    //console.log(data[i].display_name);
    parks = data;
    //Remove Previous Stations
    $("#parks_list li").remove();
    //Add new stations to the list
    //console.log(stations);
    $.each(parks, function(index, park) {
      let park_name = park.display_name.split(",");
      //console.log(park_name);
      //debugger;
      $("#parks_list").append(
        '<li><a id="to_details" href="#">' +
          park_name[0] +
          '<span id="' +
          index +
          '" class="ui-li-count">' +
          "" +
          "º</span></a></li>"
      );
    });
    //Refresh the list content
    $("#parks_list").listview("refresh");
    //console.log(query_url);
    //console.log(data);
  }
}
