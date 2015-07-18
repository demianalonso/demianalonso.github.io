"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 7;

var RotationAngle = 45;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -0.75, -0.75 ),
        vec2(  0,  0.75 ),
        vec2(  0.75, -0.75 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide, RotationAngle);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};


function rotate(vertex, angleDegree) {
  var d = Math.sqrt( Math.pow(vertex[0], 2) + Math.pow(vertex[1], 2) )
  var angle = d * radians(angleDegree);

  var x = vertex[0] * Math.cos(angle) - vertex[1] * Math.sin(angle);
  var y = vertex[0] * Math.sin(angle) + vertex[1] * Math.cos(angle);
  return vec2(x, y);
}

function triangle( a, b, c, rotationAngle )
{
    points.push( rotate(a, rotationAngle), rotate(b, rotationAngle), rotate(c, rotationAngle) );
}

function divideTriangle( a, b, c, count, rotationAngle )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c, rotationAngle );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count, rotationAngle );
        divideTriangle( c, ac, bc, count, rotationAngle );
        divideTriangle( b, bc, ab, count, rotationAngle );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
