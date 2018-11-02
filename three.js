var t_value; // global parameter 't'
var control_points; // array of all control points
var variable_lines; // array of all lines
var time_interval = 50; // time interval of animation

var svgDoc; // used for referencing document in init()
var offsetX; // used to manage offset while dragging
var offsetY;
var selectedPoint = 0; // used to distinguish which point is being dragged

function init(evt) {
    // initialize the parameter value
    t_value = 0;

    // reference the document
    if ( window.svgDocument == null ) {
        svgDoc = evt.target.ownerDocument;
    }

    // Initial referencing to all the control handles
    control_points = [
      [
        svgDoc.getElementById('control_point00'),
        svgDoc.getElementById('control_point01'),
        svgDoc.getElementById('control_point02'),
        svgDoc.getElementById('control_point03')
      ],
      [
        svgDoc.getElementById('variable_point10'),
        svgDoc.getElementById('variable_point11'),
        svgDoc.getElementById('variable_point12')
      ],
      [
        svgDoc.getElementById('variable_point20'),
        svgDoc.getElementById('variable_point21')
      ],
      [
        svgDoc.getElementById('variable_point30')
      ]
    ];

    variable_lines = [
      [
        svgDoc.getElementById('variableLine_00_01'),
        svgDoc.getElementById('variableLine_01_02'),
        svgDoc.getElementById('variableLine_02_03')
      ],
      [
        svgDoc.getElementById('variableLine_10_11'),
        svgDoc.getElementById('variableLine_11_12')
      ],
      [
        svgDoc.getElementById('variableLine_20_21')
      ]
    ];

    domain_points = [
        svgDoc.getElementById('left_domain_point'), // fixed
        svgDoc.getElementById('variable_domain_point'), // variable
        svgDoc.getElementById('right_domain_point') // fixed
    ];

    // Load initial values of points
    set_point_coords(control_points[0][0], [100,300]); // first control point
    set_point_coords(control_points[0][1], [150,150]); // second control point
    set_point_coords(control_points[0][2], [530,70]); // third
    set_point_coords(control_points[0][3], [600,350]); // fourth
};

// main function
setInterval(function(){
    // Increment value of 't'
    t_value = (t_value <= 1.0)? (t_value + 0.01) : (0);
    // compute current state (t-value, c-array)
    compute_current_state(t_value);

}, time_interval);


function compute_current_state(t){
    // Given the parameter value 't'
    // we compute the location of all
    // control points and line.

    // 1. Locate DOMAIN POINT
    left_coord = getPosition(domain_points[0]);
    right_coord = getPosition(domain_points[2]);
    position = interpolate(t, left_coord, right_coord);
    // manage offset
    position = manage_offset(position, 430, 20);
    set_point_coords(domain_points[1], position);

    // 2. Locate each CONTROL POINT
    for (i = 1; i < control_points.length; i++){
        for (j = 0; j < control_points[i].length; j++) {
            left_coord = getPosition(control_points[i-1][j]);
            right_coord = getPosition(control_points[i-1][j+1]);
            position = interpolate(t, left_coord, right_coord);

            // manage offset
            position = manage_offset(position, 20, 130);

            set_point_coords(control_points[i][j], position);
        }
    }

    // 3. Locate each POLY LINE
    for (i = 0; i < variable_lines.length; i++){
        for (j = 0; j < variable_lines[i].length; j++) {
            left_coord = getPosition(control_points[i][j]);
            right_coord = getPosition(control_points[i][j+1]);

            // manage offset
            left_coord = manage_offset(left_coord, 20, 130);
            right_coord = manage_offset(right_coord, 20, 130);

            set_line_coords(variable_lines[i][j], left_coord, right_coord);
        }
    }
};


// dragging functionality
function selectElement(evt, point){
    selectedPoint = point;
    control_point = evt.target.parentNode;
    var coords = control_point.getAttributeNS(null, "transform");
    coords = coords.slice(10, coords.length-1).split(",");

    offsetX = parseInt(coords[0]) - evt.clientX ;
    offsetY = parseInt(coords[1]) - evt.clientY;
};

function drag(evt){
    if (selectedPoint != 0){
        var x = evt.clientX + offsetX;
        var y = evt.clientY + offsetY;

        control_point.setAttributeNS(null, "transform", "translate(" + x + "," + y + ")");
    }
};

function deselect(){
    selectedPoint = 0;
};


// utiliy functions
function getPosition(element) {
    var position = element.getBoundingClientRect();
    return [(position.left + position.right)/2, (position.top + position.bottom)/2];
};

function interpolate(t, left_coord, right_coord){
    x = (1-t)*left_coord[0] + (t)*right_coord[0];
    y = (1-t)*left_coord[1] + (t)*right_coord[1];
    return [x, y];
};

function manage_offset(coord, offset_X, offset_Y){
    x = coord[0]; y = coord[1];

    // manage offset
    x -= offset_X; y -= offset_Y;

    return [x, y];
};

function set_line_coords(line, left_coord, right_coord){
    line.setAttributeNS(null, "x1", left_coord[0]);
    line.setAttributeNS(null, "x2", right_coord[0]);
    line.setAttributeNS(null, "y1", left_coord[1]);
    line.setAttributeNS(null, "y2", right_coord[1]);
};

function set_point_coords(point, coord){
    point.setAttributeNS(null, "transform", "translate(" + coord[0] + "," + coord[1] + ")");
};

function showCoords(event) {
    var x = event.clientX;
    var y = event.clientY;
    var coords = "showCoords > X coords: " + x + ", Y coords: " + y;
    console.log(coords);
};
