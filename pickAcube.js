
// Jackson Cromer
var canvas;
var gl;

var numVertices  = 36;

var cubeVertices = [];
var cubeColor = [];

/* Scale and speed */
var scale1 = 0.2;
var speed = 0.2;

//x y z positions, 8 outside squares in a circle
var xp = [0.75, 0.5303, 0.0,  -0.5303, -0.75, -0.5303, 0.0, 0.5303];
var yp = [0.0, 0.5303, 0.75, 0.5303, 0.0, -0.5303, -0.75, -0.5303];
var zp = [0, 0, 0, 0, 0, 0, 0, 0]

/* true/false for axis rotation */
var x_tf = [1, 0, 0, 0, -1, 0, 0, 1];
var y_tf = [0, 1, 1, 1, 0, -1, -1, -1];
var z_tf = [0, 1, 0, -1, 0, 1, 0, -1];
var axis_index = 0;

/* center cube rotating? */
var center_rotate = false;

var axis = 0;
var theta = [0, 0.5303, 0.0,  -0.5303, -0.75, -0.5303, 0.0, 0.5303];

/* matricies */
var mvMatrix, pMatrix;
var mvMatrix2;
var modelView, projection;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    createCube();
	
	// push the origin and make it black
	var origin = vec4(0.0, 0.0, 0.0, 1.0);
	cubeVertices.push(origin); 
	cubeColor.push(vertexColors[0]);
	console.log("Black point is origin");
	console.log("Canvas is [-1,1] x [-1, 1]");
	

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColor), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    modelView = gl.getUniformLocation( program, "modelView" );
	
	// Event Listeners

    /* Scale slider */
    var slider = document.getElementById("myRange");
    slider.oninput = function() {
        scale1 = ((slider.value)/100);
        };

    /* Speed slider*/
    var slider2 = document.getElementById("myRange2");
    slider2.oninput = function() {
        speed = ((slider2.value)/100);
        };
	
	/* Reset */	
	document.getElementById("Reset").onclick = function(){
        center_rotate = false;
		};
	
    /* Clicking on the outer cube circle */    
    canvas.addEventListener("click", function(){

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
		
		var screenx = event.clientX - canvas.offsetLeft;
		var screeny = event.clientY - canvas.offsetTop;
		  
		var posX = 2*screenx/canvas.width-1;
		var posY = 2*(canvas.height-screeny)/canvas.height-1; 

        for(var ii = 0; ii <8; ii++)
        {
            if( posX > xp[ii]-0.3 && posY > yp[ii]-0.3 &&
                posX < xp[ii]+0.3 && posY < yp[ii]+0.3)
            {
                axis_index = ii;
                center_rotate = true;
            }   
        }
    } );
       
    render();
}


function render() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        theta[axis] += speed;

        /*  Center Cube     */
        mvMatrix = mult(scalem(scale1, scale1, scale1), translate(-0.5, -0.5, 0.5));
        if(center_rotate)
        {
            mvMatrix= mult( rotate(theta[axis], x_tf[axis_index], y_tf[axis_index], z_tf[axis_index]), mvMatrix);
        }

        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix)); 
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
        
        /*  Outer Cube Circle   */
        for(var i=0; i < 8; i++)
        {
            mvMatrix = mult(scalem(scale1, scale1, scale1), translate(-0.5, -0.5, 0.5));
            mvMatrix= mult( rotate(theta[axis], x_tf[i], y_tf[i], z_tf[i]), mvMatrix);
            mvMatrix = mult(translate(xp[i], yp[i], zp[i]), mvMatrix);

            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix)); 
            gl.drawArrays( gl.TRIANGLES, 0, numVertices );
        };
		
        requestAnimFrame(render);
    }
