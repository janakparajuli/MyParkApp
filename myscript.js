$access_key="bd628cc94539482fb9fd50afd7b06976";
//871cbf254c2d49dd9da20f9e88229e7c
let currentPark;
$.fn.highlight = function() {
  this.css({ "background-color": "rgb(245, 228, 181)" });
};
$("#refresh").highlight();
$("#refresh").animate({
  width: "7em",
  height: "1.5em"
});
let url, myLlat, myLng;
//park_url=https://nominatim.openstreetmap.org/search.php?q=parks&format=json&polygon_geojson=1&viewbox=
$(document).on("click", "#refresh", function() {
  //Prevent the usual navigation behaviour
  event.preventDefault();
  //debugger;
  // get the API result via jQuery.ajax
  $.mobile.loading("show", {
    text: "Loading List of Parks",
    textVisible: true
  });
  $.ajax({
    //Get location
    url: navigator.geolocation.getCurrentPosition(getLocation),
    //on success
    success: function(data){
      $distance=$('#slider-1')[0].value;
      myLon=lng;myLat=lat;
      console.log(`My myLon myLat is ${myLon} and ${myLat}`);
      $viewbox=computeViewBox(myLon,myLat,$distance);

  $.ajax({
    type: "GET",
    url: `https://nominatim.openstreetmap.org/search.php?&format=json&polygon_geojson=1&viewbox=${$viewbox}&bounded=1`,
    data: {
       //format: "json",
       q: "parks"
     },
    //dataType: 'jsonp',
    success: function(data) {
      $.mobile.loading("hide");
      PopulateList(data);
      $("#parks_list").show();
    },
    fail: function() {
      $.mobile.loading("hide");
      alert("request failed");
    }
  });}
});
});

//Navigate to map_display
$(document).on("pagebeforeshow", "#home", function() {
  $("#parks_list").hide();
  $(document).on("click", "#to_map_display", function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    //store some data
    // currentPark = parks[e.target.children[0].id];
    currentPark = parks[e.currentTarget.children[0].id];
    //Change to map_display page
    $.mobile.changePage("#map_display");
  });
});
map = L.map("map", {
  zoom: 18,
  center: [41.43401555, 2.11618445]
  // center: [-0.0380158229338167,39.9927254 ] 2.11618445,41.43401555
});

L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ["a", "b", "c"]
}).addTo(map);

$(document).on("pagebeforeshow", "#map_display", function(e) {
  e.preventDefault();
  //$(document).ready(function() {
  $(function() {

    $.mobile.loading("show", {
      text: "Fetching API",
      textVisible: true
    });
    let url;

    if (typeof currentPark !== "undefined") {console.log('inside if'+currentPark);
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=${currentPark.osm_type[0].toUpperCase()}&osmid=${currentPark.osm_id}&format=json&polygon_geojson=1`;
    } else {console.log('inside else');
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=33884330&format=json&polygon_geojson=1`;
    }
    $.ajax({
      type: "GET",
      url: url,
      success: function(d) {
        console.log("This is d:" + d);
        $.mobile.loading("hide");
        map.invalidateSize();
        map.setView(d.centroid.coordinates.reverse());
        L.marker(d.centroid.coordinates.reverse())
          .bindPopup("Name:" + d.localname)
          .addTo(map);
        park = L.geoJSON(d.geometry);
        map.addLayer(park);
        park.on("click", function() {
          $.mobile.changePage("#park_details");
        });

      },
      fail: function(xhr, textStatus, errorThrown) {
        $.mobile.loading("hide");
        alert("request failed");
      }
    });
  });
});
//https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=33884330&class=leisure
$(document).on("pagebeforeshow", "#park_details", function(e) {
  e.preventDefault();
  if($('.CSSTableGenerator')!=null){$('.CSSTableGenerator').remove();}
  $(function() {
    $.mobile.loading("show", {
      text: "Fetching Details",
      textVisible: true
    });
   
    let url;
    if (typeof currentPark !== "undefined") {
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=${currentPark.osm_type[0].toUpperCase()}&osmid=${currentPark.osm_id}&format=json`;
      //debugger;
    } else {
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=123759217&format=json`;
    }
    $.ajax({
      type: "GET",
      url: url,
      success: function(d) {
        $.mobile.loading("hide");
        let data = [
          [
            "Name",
            "Park ID",
            "Type",
            "Last Updated",
            "Category",
            "Type",
            "Admin Level",
            "Address Tags",
            "Importance",
            "Post Code",
            "Extra Tags",
            "Rank",
            "Centre",
            "Linked Places"
          ], //headers
          [
            d.localname,
            d.osm_id,
            d.osm_type,
            d.indexed_date,
            d.category,
            d.type,
            d.admin_level,
            d.addresstags,
            d.calculated_importance,
            d.calculated_postcode,
            d.extratags,
            d.rank_search,
            d.centroid.coordinates[0]+', '+d.centroid.coordinates[1],
            d.linked_places
          ]
        ];
        var dataObj = {};
        for (let i = 0; i < data[0].length; i++) {
          // console.log(i);
          dataObj[data[0][i]] = data[1][i];
        }
        makeTable($("#detail"), dataObj);
        //parkDescription(d);
        // debugger;
        // $('#map').append($(d));
      },
      fail: function(xhr, textStatus, errorThrown) {
        $.mobile.loading("hide");
        alert("request failed");
      }
    });
  });
});

//Define a function to create a table
function makeTable(container, dataObj) {
  var table = $("<table/>").addClass("CSSTableGenerator");

  $.each(dataObj, function(rowIndex, r) {
      var row = $("<tr/>");
      row.append($("<t" + (rowIndex == 0 ? "h" : "d") + "/>").text(rowIndex));
      row.append($("<t" + (rowIndex == 0 ? "h" : "d") + "/>").text(r));
    
    table.append(row);
  });
  return container.append(table);
}
//$key='b6907d289e10d714a6e88b30761fae22';
//Define a funciton to get location
function getLocation(position){
  lat=position.coords.latitude;
  lng=position.coords.longitude;
  return lat, lng;
}

//Define a function to compute the viewbox
function computeViewBox(y0,x0,d){
  $vb=[];
  $lngleft=0, $lattop=0, $lngright=0,$latdown=0;
  // Considering 1 deg equal to 111.32 km, 1m equals 0.00000898311 deg
  $factor= 0.00000898311; 
  //Compute the bounding box
  $lngleft=y0-(d*$factor);
  $lattop=x0+(d*$factor);
  $lngright=y0+(d*$factor);
  $latdown=x0-(d*$factor);

  // //Assign the bounding box to vb;
  $vb.push($lngleft, $lattop, $lngright,$latdown);
  console.log(`The bb is: ${$vb}`);
  return $vb;

}
//Populate List method
function PopulateList(data) {
  for (let i = 0; i < data.length; i++) {
    //console.log(data[i].display_name);
    parks = data;
    //debugger;
    //Remove Previous Stations
    $("#parks_list li").remove();
    //Add new stations to the list
    //console.log(stations);
    $.each(parks, function(index, park) {
      let park_name = park.display_name.split(",");
      distanceToPark(myLon,myLat, park.lon, park.lat);
      console.log(`This is lng: ${myLon}`);
      //debugger;
      $("#parks_list").append(
        `<li><a id="to_map_display" href="#">
          ${park_name[0]}
          <span id="${index}" class="ui-li-count"></span>
          <p><strong>${park_name[1]}</strong></p>
          <p><strong>${park_name[2]}</strong></p>
          </a></li>`
      );
    });
    //Refresh the list content
    $("#parks_list").listview("refresh");
  }
}
function distanceToPark(y0,x0,y1,x1){
  //var φ1 = lat1.toRadians(), φ2 = lat2.toRadians(), Δλ = (lon2-lon1).toRadians(), R = 6371e3; // gives d in metres
//var d = Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;

}
