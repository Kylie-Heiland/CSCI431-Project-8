"use strict";

var shadedMovingPyramid = function() {

var canvas;
var gl;

var numPositions = 12;

var positionsArray = [];
var normalsArray = [];
var colorsArray = [];
var texCoordsArray = []; //Proj 7

var vertices = [
        vec4(0.5, -0.2722, 0.2886, 1.0),
		vec4(0.0, -0.2772, -0.5773, 1.0),
		vec4(-0.5, -0.2722, 0.2886, 1.0),
		vec4(0.0, 0.5443, 0.0, 1.0)
    ];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelViewMatrix, projectionMatrix;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = vec3(0, 0, 0);

var thetaLoc;

var flag = false; //Proj 7 has set to true.....?

function triple(a, b, c)
{

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     normal = vec3(normal);

	var vertexColors = [
		vec4(1.0, 0.0, 0.0, 1.0), // red
		vec4(1.0, 1.0, 1.0, 1.0), // white
		vec4(0.0, 0.0, 1.0, 1.0), // blue
		vec4(0.0, 1.0, 1.0, 1.0), // green
    ];
	
	//Proj 7
	var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];
		 
	var indices = [a, b, c];

    for ( var i = 0; i < indices.length; ++i ) {
        positionsArray.push( vertices[indices[i]] );
        colorsArray.push( vertexColors[indices[i]] );
        normalsArray.push(normal);
		texCoordsArray.push(texCoord[i]); //Proj 7
    }
}


function colorPyramid()
{
    triple(0, 1, 3); 
	triple(1, 2, 0); 
    triple(2, 0, 3);  
    triple(3, 1, 2); 
}


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0); //Change back to 1.0 1.0 1.0

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorPyramid();

	var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
	
	var vColor = gl.getAttribLocation( program, "uColor" ); //vColor is actually colorLoc in Proj 7
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

	//Proj 7
	var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
	//Proj 7
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0); //changes 2 to 4
    gl.enableVertexAttribArray(texCoordLoc);

	
    thetaLoc = gl.getUniformLocation(program, "theta");

	// Initialize event handlers

    document.getElementById("xDirection").onchange = function(event) {

    if(event.target.value == 0)
		{
			gl.viewport(0, 0, 400, 400);
		}
		else if(event.target.value == 1)
		{
			gl.viewport(0, 0, canvas.width, canvas.height);
		}
		else
		{
			gl.viewport(0, 0, 600, 600);
		}
    };
	
	document.onkeydown = function(e) {
		switch(e.keyCode) {
          case 37: //Left arrow = pyramid gets smaller/goes to the left once.
			gl.viewport(0, 0, 400, 400);
			break;
		case 38: //Up arrow = pyramid goes to original position.
            gl.viewport(0, 0, canvas.width, canvas.height);
			break;
		case 39: //Right arrow = pyramid gets bigger/goes to the right once.
            gl.viewport(0, 0, 600, 600);
			break;
		case 40: //Down arrow = pyramid goes to original position.
            gl.viewport(0, 0, canvas.width, canvas.height);
			break;
        }
    };
	
    viewerPos = vec3(0.0, 0.0, -20.0);

    projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),
       ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"),
       diffuseProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"),
       specularProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),
       lightPosition );

    gl.uniform1f(gl.getUniformLocation(program,
       "uShininess"), materialShininess);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"),
       false, flatten(projectionMatrix));
	   
	//Proj 7   
	 configureTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.uniform1i(gl.getUniformLocation( program, "uTex0"), 0);

    gl.activeTexture(gl.TEXTURE1 );
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.uniform1i(gl.getUniformLocation( program, "uTex1"), 1);
	//End of Proj 7
    render();
}

//Proj 7
var texSize = 256;
var numChecks = 8;



var texture1, texture2;
var t1, t2;

var c;



var image1 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchx = Math.floor(i/(texSize/numChecks));
            var patchy = Math.floor(j/(texSize/numChecks));
            if(patchx%2 ^ patchy%2) c = 255;
            else c = 0;
            //c = 255*(((i & 0x8) == 0) ^ ((j & 0x8)  == 0))
            image1[4*i*texSize+4*j] = c;
            image1[4*i*texSize+4*j+1] = c;
            image1[4*i*texSize+4*j+2] = c;
            image1[4*i*texSize+4*j+3] = 255;
        }
    }

var image2 = new Uint8Array(4*texSize*texSize);

    // Create a checkerboard pattern
    for (var i = 0; i < texSize; i++) {
        for (var j = 0; j <texSize; j++) {
            image2[4*i*texSize+4*j] = 127+127*Math.sin(0.1*i*j);
            image2[4*i*texSize+4*j+1] = 127+127*Math.sin(0.1*i*j);
            image2[4*i*texSize+4*j+2] = 127+127*Math.sin(0.1*i*j);
            image2[4*i*texSize+4*j+3] = 255;
           }
    }

function configureTexture() {
    texture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}
//End of proj 7

var render = function(){

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 2.0;

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

	gl.uniform3fv(thetaLoc, theta); //Proj 7
    gl.uniformMatrix4fv(gl.getUniformLocation(program,
            "uModelViewMatrix"), false, flatten(modelViewMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);


    requestAnimationFrame(render);
}

}

shadedMovingPyramid();