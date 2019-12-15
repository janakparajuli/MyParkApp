$access_key="bd628cc94539482fb9fd50afd7b06976";
//871cbf254c2d49dd9da20f9e88229e7c
let currentamenity;
$.fn.highlight = function() {
  this.css({ "background-color": "#7b7b7c;" });
};
$("#refresh").highlight();
$("#refresh").animate({
  width: "8em",
  height: "2.5em"
});
let url, myLat, myLon;
// const APIKEY='bd628cc94539482fb9fd50afd7b06976';
const APIKEY='871cbf254c2d49dd9da20f9e88229e7c';
//amenity_url=https://nominatim.openstreetmap.org/search.php?q=amenities&format=json&polygon_geojson=1&viewbox=
$(document).on("click", "#refresh", function() {
  //Prevent the usual navigation behaviour
  event.preventDefault();
  // get the API result via jQuery.ajax
  $.mobile.loading("show", {
    text: "Loading Amenities",
    textVisible: true
  });
  $.ajax({
    //Get location, ipgeolocation doesn't work on brave so include not supported messsage
    //url: navigator.geolocation.getCurrentPosition(getLocation),
    url:"https://api.ipgeolocation.io/ipgeo?apiKey=" + APIKEY+'&ip=93.176.158.114',
    //on success
    success: function(data){
      let search_url, slide_url, query_url,query_amenity='';
      $distance=$('#slider-1')[0].value;
      myLon=data.longitude;myLat=data.latitude;
      $viewbox=computeViewBox(myLon,myLat,$distance);
      //Access from search bar
      $amenity=$('#select-custom-2')[0].value;
      $amenity=parseInt($amenity);
      switch($amenity) {
        case 1:
          query_amenity='park';
          break;
        case 2:
          query_amenity='hospital';
          break;
        case 3:
          query_amenity='pub';
          break;
        case 4:
          query_amenity='hotel';
          break;
        case 5:
          query_amenity='school';
          break;
        default:
          query_amenity='amenity';
      }
      $place=$('#text-4')[0].value;

      search_url=`https://nominatim.openstreetmap.org/search.php?q=${query_amenity}+in+${$place}&format=json&polygon_geojson=1`;
      slide_url=`https://nominatim.openstreetmap.org/search.php?q=${query_amenity}&format=json&polygon_geojson=1&viewbox=${$viewbox}&bounded=1`;
      if($place!=""){
        query_url=search_url;
      }else{query_url=slide_url;
      }

  $.ajax({
    type: "GET",
    url: query_url,
    data: {
       //format: "json",
       //q: "amenities"
     },
    //dataType: 'jsonp',
    success: function(data) {
      $.mobile.loading("hide");
      PopulateList(data);
      $("#amenities_list").show();
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
  $("#amenities_list").hide();
  $(document).on("click", "#to_map_display", function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    //store some data
    // currentamenity = amenities[e.target.children[0].id];
    currentamenity = amenities[e.currentTarget.children[0].id];
    //Change to map_display page
    $.mobile.changePage("#map_display",{ transition: "pop"});
  });
});
let map, dir;
map = L.map("map", {
  zoom: 15,
  center: [41.43401555, 2.11618445]
  //center:[57.74, 11.94] //map quest
  // center: [-0.0380158229338167,39.9927254 ] 2.11618445,41.43401555
});

L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ["a", "b", "c"]
}).addTo(map);

routingControl = L.Routing.control({
  router: L.Routing.mapbox("pk.eyJ1IjoiamFuYWtwYXJhanVsaSIsImEiOiJjaWdtMWd2eWUwMjRvdXJrcjVhbTFvcmszIn0.jRIRtmgCm5waI7RXih3t5A"),
  waypoints: [
    //L.latLng(41.43401555, 2.11618445),
    L.latLng(41.43451555, 2.11658445)
  ],
  routeWhileDragging:true
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

    if (typeof currentamenity !== "undefined") {

      url = `https://nominatim.openstreetmap.org/details.php?osmtype=${currentamenity.osm_type[0].toUpperCase()}&osmid=${currentamenity.osm_id}&format=json&polygon_geojson=1`;
    } else {
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=33884330&format=json&polygon_geojson=1`;
    }
    $.ajax({
      type: "GET",
      url: url,
      success: function(d) {
        $.mobile.loading("hide");
        map.invalidateSize();
        amenityCoordinates=d.centroid.coordinates;
        backUpAmenityCoordinatesLonLat=amenityCoordinates;
        //amenityCoordinatesLon=d.centroid.coordinates.reverse();
        // map.setView(d.centroid.coordinates);
        map.setView(amenityCoordinates.reverse());
        markPoint=[myLat,myLon];
        let myPos=L.marker(markPoint).bindPopup("I am here").openPopup();
        myPos.addTo(map);
        let amenityPos=L.marker(d.centroid.coordinates).bindPopup(d.localname).openPopup();
        amenityPos.addTo(map);

        amenity = L.geoJSON(d.geometry);
        map.addLayer(amenity);

        amenity.on("click", function() {
          console.log(`the id is: ${this.id}`);
          $.mobile.changePage("#amenity_details",{ transition: "pop"});
        });
        //a = [L.latLng(myLat,myLon),L.latLng(d.centroid.coordinates)]
        //routingControl.setWaypoints(a)
        $("#dir-btn").on("click",function(){
          map.setView([myLat,myLon]);
          $waypoints=[L.latLng(myLat,myLon),L.latLng(amenityCoordinates)];
          routingControl.setWaypoints($waypoints);
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
$(document).on("pagebeforeshow", "#amenity_details", function(e) {
  e.preventDefault();
  if($('.amenity_table')!=null){$('.amenity_table').remove();}
  $(function() {
    $.mobile.loading("show", {
      text: "Fetching Details",
      textVisible: true
    });
   
    let url;
    if (typeof currentamenity !== "undefined") {
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=${currentamenity.osm_type[0].toUpperCase()}&osmid=${currentamenity.osm_id}&format=json`;

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
            "Amenity ID",
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
          dataObj[data[0][i]] = data[1][i];
        }
        makeTable($("#detail"), dataObj);
        //amenityDescription(d);
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
  let table = $("<table/>").addClass("amenity_table");

  $.each(dataObj, function(rowIndex, r) {
      let row = $("<tr/>");
      row.append($("<t" + (rowIndex == 0 ? "h" : "d") + "/>").text(rowIndex));
      row.append($("<t" + (rowIndex == 0 ? "h" : "d") + "/>").text(r));
    
    table.append(row);
  });
  let link= $(`<a href="#home" data-transition='flip' data-direction="" data-add-back-btn="true">Home</a>`);
  table.append(link);
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
  return $vb;
}
//Populate List method
function PopulateList(data) {
  for (let i = 0; i < data.length; i++) {
    amenities = data;
    //Remove Previous Stations
    $("#amenities_list li").remove();
    //Add new stations to the list
    $.each(amenities, function(index, amenity) {
      let amenity_name = amenity.display_name.split(",");
      let distance=distanceToamenity(myLon,myLat, amenity.lon, amenity.lat);
      $("#amenities_list").append(
        `<li><a id="to_map_display" href="#">
          ${amenity_name[0]}
          <span id="${index}" class="ui-li-count">${distance.toFixed(2)}km</span>
          <p><strong>${amenity_name[1]}</strong></p>
          <p><strong>${amenity_name[2]}</strong></p>
          </a></li>`
      );
    });
    //Refresh the list content
    $("#amenities_list").listview("refresh");
  }
}
function distanceToamenity(y1,x1,y2,x2){
  //var φ1 = lat1.toRadians(), φ2 = lat2.toRadians(), Δλ = (lon2-lon1).toRadians(), R = 6371e3; // gives d in metres
//var d = Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;
  const R=6371;
  let d;
  let phi1 = x1*(Math.PI/180);
  let phi2 = x2*(Math.PI/180);
  let lambda1 = y1*(Math.PI/180);
  let lambda2 = y2*(Math.PI/180);

  let dellambda = lambda2-lambda1;
  d=Math.acos( Math.sin(phi1)*Math.sin(phi2) + Math.cos(phi1)*Math.cos(phi2) * Math.cos(dellambda)) * R;
  return d;

}
