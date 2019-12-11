let currentPark;
$.fn.highlight=function(){
  this.css({'background-color':'rgb(245, 228, 181)'});};
$("#refresh").highlight();
$( "#refresh" ).animate({
  width: '5em',
  height: '1.5em',
 });

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
    url: "https://nominatim.openstreetmap.org/search?",
    data: {
      format: "json",
      q: "parks in castellon"
    },
    //dataType: 'jsonp',
    success: function(data) {console.log('done:'+data);
      // output the "capital" object inside "location"
      //alert("Latitude: " + data.latitude + " | Longitude: " + data.longitude);
      $.mobile.loading("hide");
      PopulateList(data);
      //debugger;
      //Populate List
    },
    fail: function() {
      $.mobile.loading("hide");
      alert("request failed");
    }
  });
});

//Navigate to map_display
$(document).on("pagebeforeshow", "#home", function() {
  //debugger;
  $(document).on("click", "#to_map_display", function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    //store some data
    currentPark = parks[e.target.children[0].id];
    //Change to map_display page
    $.mobile.changePage("#map_display");
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
$(document).on("pagebeforeshow", "#map_display", function(e) {
  e.preventDefault();
  // map = document.getElementById('map');
  // $map = $('#map');
  // f = $("<iframe src='https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=33884330'></iframe>")
  // $f = $("<iframe src='http://osm.org/way/33884330'></iframe>")
  // $map.append(f);

  $(document).ready(function() {
    console.log("document ready occurred!");
    console.log(currentPark);

    $.mobile.loading("show", {
      text: "Fetching API",
      textVisible: true
    });
    // debugger;
    let url;
    if (typeof currentPark !== "undefined") {
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=${currentPark.osm_type[0].toUpperCase()}&osmid=${currentPark.osm_id}&format=json&polygon_geojson=1`;
    } else {
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=33884330&format=json&polygon_geojson=1`;
    }
    $.ajax({
      type: "GET",
      url: url,
      success: function(d) {
        console.log('This is d:'+d);
        $.mobile.loading("hide");
        map.invalidateSize();
        L.marker(d.centroid.coordinates.reverse()).bindPopup('Name:'+d.localname).addTo(map);
        park = L.geoJSON(d.geometry);
        map.addLayer(park);
        park.on('click', function(){$.mobile.changePage("#park_details");});
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
//https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=33884330&class=leisure
$(document).on("pagebeforeshow", "#park_details", function(e) {
  e.preventDefault();
  $(document).ready(function() {
    $.mobile.loading("show", {
      text: "Fetching Details",
      textVisible: true
    });
    //DataTable
    // alert($('description_table'));
    // debugger;
    // $('#table_id').DataTable({
    // "ajax": "data.json"
    //  });

    let url;
    if (typeof currentPark !== "undefined") {
      alert("if");
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=${currentPark.osm_type[0].toUpperCase()}&osmid=${currentPark.osm_id}&format=json`;
      //debugger;
    } else {
      url = `https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=33884330&format=json`;
      alert("else");
    }
    $.ajax({
      type: "GET",
      url: url,
      success: function(d) {
        $.mobile.loading("hide");
        var data = [["Name", "Type", "Category", "Admin Level", "Address Tags","Importance","Indexed Data"], //headers
                [d.localname, d.type, d.category, d.admin_level, d.addresstags, d.importance, d.indexed_date]]
        makeTable($('#detail'), data);
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
function makeTable(container, data) {
  var table = $("<table/>").addClass('CSSTableGenerator');
  
  debugger;
  $.each(data, function(rowIndex, r) {
      var row = $("<tr/>");
      $.each(r, function(colIndex, c) { 
          row.append($("<t"+(rowIndex == 0 ?  "h" : "d")+"/>").text(c));
      });
      table.append(row);
  });
  return container.append(table);}

// //Define function to display park description
// function parkDescription(d){
//   $("#detail").append(
//     '<li><a id="to_park_details" href="#">' +
//           'Name:' +d.localname +
//           '<span id=" " class="ui-li-count">' +
//           '' +
//           "</span></a></li>"
//   );
//   //$('#description_table').dataTable().api();
//   //$('#description_table').DataTable();
//   //new $.fn.dataTable.Api( `#description_table` );
  
// }
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
        '<li><a id="to_map_display" href="#">' +
          park_name[0] +
          '<span id="' + index +'" class="ui-li-count">' +
          "" +
          "</span></a></li>"
      );
    });
    //Refresh the list content
    $("#parks_list").listview("refresh");
  }
}
