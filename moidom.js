console.warn( `
  __________
 / / / / / /\\
/_/_/_/_/_/  \\
|    _    |  |
|[] | | []|[]|
|___|_|___|__| 

`
);


import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";


// WebGL + включване на сенки

var renderer = new THREE.WebGLRenderer( {antialias:true} );
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
	renderer.setAnimationLoop( animate );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.VSMShadowMap;
	
	document.body.appendChild( renderer.domElement );
	document.body.style.margin = 0;
	document.body.style.overflow = 'hidden';

const MAX_ANISOTROPY = renderer.capabilities.getMaxAnisotropy();


// сцена

var scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );


// камера и гледна точка

var camera = new THREE.PerspectiveCamera( 60, 1, 0.01, 200 );
	camera.position.set( 30, 60, 60 );
	camera.lookAt( scene.position );


// основна светлина

var light = new THREE.SpotLight( 'white', 1 );
	light.decay = 0;
	light.position.set( 20, 80, 30 );
	light.target = scene;
	light.angle = 0.4;
	light.penumbra = 1;
	light.castShadow = true;
	light.shadow.mapSize.width = 1024; 
	light.shadow.mapSize.height = 1024; 
	light.shadow.camera.near = 50; 
	light.shadow.camera.far = 200; 
	light.shadow.camera.left = -50; 
	light.shadow.camera.right = 50; 
	light.shadow.camera.top = -50; 
	light.shadow.camera.bottom = 50; 
	light.shadow.bias = -0.0001; 
	light.shadow.radius = 2;

	scene.add( light );


var contraLight = new THREE.SpotLight( 'white', 2 );
	contraLight.decay = 0;
	contraLight.position.set( -10, 80, -40 );
	contraLight.target = scene;
	contraLight.angle = 0.4;
	contraLight.penumbra = 1;

	scene.add( contraLight );


// допълнителна светлина

var topLight = new THREE.SpotLight( 'white', 1 );
	topLight.decay = 0;
	topLight.position.set( 0, 50, 0 );
	topLight.target = scene;
	topLight.angle = Math.PI/20/1;
	topLight.penumbra = 1;

	scene.add( topLight );


// обща светлина

var ambLight = new THREE.AmbientLight( 'white', 0.2 );

	scene.add( ambLight );


// основи а къщата

var base = new THREE.Group();
scene.add( base );


// интерактивно въртене

var controls = new OrbitControls( camera, renderer.domElement );
	controls.maxPolarAngle = Math.PI * 0.45;
	controls.minDistance = 2;
	controls.maxDistance = 30;
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.rotateSpeed = 0.3;
	controls.panSpeed = 0.7;
	controls.screenSpacePanning = false;
	controls.target.set( 0, 0, 0 );
	controls.update();
	

	
// промяна на размера на прозореца, вкл. и завъртане на смартфон
			
window.addEventListener( 'resize', onWindowResize, false );
onWindowResize();

function onWindowResize( event )
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight, true );
}			


// главен анимационен цикъл

function animate( time )
{
	controls.update( time );
	renderer.render( scene, camera );
}


// картинка на квадратчета

var tiles = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAGUExURcPDw/////joICQAAAASSURBVAjXY2AAgfr///8PTgIAnnZsBQ0uHE0AAAAASUVORK5CYII=';


// земя 60х60 метра

function ground() 
{
	var geometry = new THREE.PlaneGeometry( 100, 100 );

	var texture = new THREE.TextureLoader().load( tiles );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 100, 100 );
		texture.anisotropy = MAX_ANISOTROPY;

	var material = new THREE.MeshStandardMaterial( {
		color: 'forestgreen',
		roughness: 1,
		metalness: 0,
		map: texture,
		polygonOffset: true,
		polygonOffsetFactor: 4,
		polygonOffsetUnits: 4,
	} );
	
	var mesh = new THREE.Mesh( geometry, material );
		mesh.position.y = -0.02;
		mesh.receiveShadow = true;
		mesh.rotation.x = -Math.PI/2;

	scene.add( mesh );
}

ground();


// случайно цяло число
function random( a, b )
{
	var rnd = Math.abs( THREE.MathUtils.seededRandom( ) );
	return Math.floor( a + (b-a+1)*rnd );
}


var texture = [];
texture[0] = new THREE.TextureLoader().load( tiles );
texture[0].wrapS = THREE.RepeatWrapping;
texture[0].wrapT = THREE.RepeatWrapping;
texture[0].anisotropy = MAX_ANISOTROPY;

texture[1] = new THREE.TextureLoader().load( tiles );
texture[1].wrapS = THREE.RepeatWrapping;
texture[1].wrapT = THREE.RepeatWrapping;
texture[1].anisotropy = MAX_ANISOTROPY;

var material2 = new THREE.MeshBasicMaterial( {
	color: 'black',
	polygonOffset: true,
	polygonOffsetFactor: 2,
	polygonOffsetUnits: 2,
} );

var geometry = new THREE.PlaneGeometry( 1, 1 );

// под на къщата (използва FN)
function floor( x, y, sx, sy, i ) 
{
	if( sx%2 ) x += 0.5;
	if( sy%2 ) y += 0.5;
	
	texture[i].repeat.set( 5*sx, 5*sy );

	var material = new THREE.MeshStandardMaterial( {
		color: 'gainsboro',
		roughness: 0.6,
		metalness: 0.1,
		map: texture[i],
		bumpMap: texture[i],
		bumpScale: -0.02,
	} );

	var mesh1 = new THREE.Mesh( geometry, material );
		mesh1.position.set( x, -0.01, y );
		mesh1.scale.set( sx, sy );
		mesh1.receiveShadow = true;
		mesh1.rotation.x = -Math.PI/2;

	base.add( mesh1 );
	
	var mesh2 = new THREE.Mesh( geometry, material2 );
		mesh2.position.set( x, -0.02, y );
		mesh2.scale.set( sx+0.4, sy+0.4 );
		mesh2.rotation.x = -Math.PI/2;

	base.add( mesh2 );
}


function moidom( FN = Date.now() )
{
	FN += '';
	
	base.clear();

	// фиксиране на генератора на случайни числа
	if( FN == '9MI0899999' )
		THREE.MathUtils.seededRandom( 41027 );
	else
	{	
		var seed = 0;

		for( var i=0; i<FN.length; i++ )
			seed = (seed<<1)+Math.round(i*Math.cos(i+FN.charCodeAt(i)))*FN.charCodeAt(i);

		THREE.MathUtils.seededRandom( seed );
	}


	// генериране на пода на къщата

	floor( random(-2,2), random(-2,2), random(10,14), random(6,8), 0 );
	floor( random(-2,2), random(-2,2), random(6,8), random(10,14), 1 );

}



export { moidom, scene, renderer, camera };