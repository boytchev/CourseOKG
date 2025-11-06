console.warn( `
   ____
  /\\___\\
  | |""|     villa.js   
 ~^~^~^~^
`
);


const VR_MODE = false;


import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {SimplexNoise} from "three/addons/math/SimplexNoise.js";
import {VRButton} from 'three/addons/webxr/VRButton.js';




var VRAvailable = false;
if ( VR_MODE && 'xr' in navigator ) {

	await navigator.xr.isSessionSupported( 'immersive-vr' )
			.then( supported => VRAvailable = supported );

}



// public

var renderer, scene, camera, light, contraLight, controls;



// not public

var GROUND_SIZE = 20;

var MAX_ANISOTROPY, texture=[];

var floorX1, floorY1, floorSX1, floorSY1;
var floorX2, floorY2, floorSX2, floorSY2;
var floorX3, floorY3, floorSX3, floorSY3;

var floors = new THREE.Group();

var move0, move1, controller0, controller1;
var v = new THREE.Vector3();
var user = new THREE.Group();



// случайно цяло число

function random( a, b )
{
	var rnd = Math.abs( THREE.MathUtils.seededRandom( ) );
	return Math.floor( a + (b-a+1)*rnd );
}



function initScene( )
{
	// WebGL + включване на сенки
	
	renderer = new THREE.WebGLRenderer( {antialias:true} );
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
	renderer.setAnimationLoop( animate );
	renderer.shadowMap.enabled = true;
	//renderer.shadowMap.type = THREE.VSMShadowMap;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	//renderer.shadowMap.type = THREE.BaseShadowMap;
	//renderer.shadowMap.type = THREE.PCFShadowMap;
	
	document.body.appendChild( renderer.domElement );
	document.body.style.margin = 0;
	document.body.style.overflow = 'hidden';

	MAX_ANISOTROPY = renderer.capabilities.getMaxAnisotropy();

	// сцена

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );
	scene.add( floors );

	// камера и гледна точка

	camera = new THREE.PerspectiveCamera( 60, 1, 0.01, 200 );
	camera.position.set( 5, 15, 10 );
	camera.lookAt( scene.position );
}



function initLights( )
{
	
	// основна светлина

	light = new THREE.DirectionalLight( 'white', 3 );
	light.decay = 0;
	light.position.set( 10, 40, 15 );
	light.target = scene;
//	light.angle = 0.25;
//	light.penumbra = 1;
	light.castShadow = true;
	light.shadow.mapSize.width = 1024*4;
	light.shadow.mapSize.height = 1024*4; 
	light.shadow.camera.near = 10; 
	light.shadow.camera.far = 50; 
	light.shadow.camera.left = -15; 
	light.shadow.camera.right = 15; 
	light.shadow.camera.top = -15; 
	light.shadow.camera.bottom = 15; 
	light.shadow.normalBias = 0.04; 
	light.shadow.intensity = 0.5; 
//	light.shadow.radius = 1;
//	light.shadow.blurSamples = 1;

	scene.add( light );


	// контра светлина
	
	contraLight = new THREE.DirectionalLight( 'white', 1.4 );
	contraLight.decay = 0;
	contraLight.position.set( -10, 10, -40 );
	contraLight.target = scene;

	scene.add( contraLight );

}



function initControls()
{
	if( VRAvailable ) return;
	
	// интерактивно въртене

	controls = new OrbitControls( camera, renderer.domElement );
	controls.maxPolarAngle = Math.PI * 0.45;
	controls.minDistance = 2;
	controls.maxDistance = 30;
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.rotateSpeed = 0.3;
	controls.zoomSpeed = 13;
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
}



function initTextures()
{
	// картинка на квадратчета

	const TILE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAGUExURcPDw/////joICQAAAASSURBVAjXY2AAgfr///8PTgIAnnZsBQ0uHE0AAAAASUVORK5CYII=';

	for( var i=0; i<3; i++ )
	{
		texture[i] = new THREE.TextureLoader().load( TILE );
		texture[i].wrapS = THREE.RepeatWrapping;
		texture[i].wrapT = THREE.RepeatWrapping;
		texture[i].anisotropy = MAX_ANISOTROPY;
	}
		
}



function createFloors()
{
	var geometry = new THREE.PlaneGeometry( 1, 1 );

	function floor( x, y, sx, sy, i ) 
	{
		texture[i].repeat.set( 5*sx, 5*sy );

		var material = new THREE.MeshPhysicalMaterial( {
			color: 'gainsboro',
			roughness: 1,
			metalness: 0.1,
			map: texture[i],
		} );

		var mesh = new THREE.Mesh( geometry, material );
			mesh.position.set( x, 0, y );
			mesh.scale.set( sx, sy );
			mesh.receiveShadow = true;
			mesh.rotation.x = -Math.PI/2;

		floors.add( mesh );
		
	} // floor

	floor( floorX1, floorY1, floorSX1, floorSY1, 0 );
	floor( floorX2, floorY2, floorSX2, floorSY2, 1 );
	floor( floorX3, floorY3, floorSX3, floorSY3, 2 );
}



function createGround() 
{

	var simplex = new SimplexNoise( { random: THREE.MathUtils.seededRandom } );

	var geometry = new THREE.PlaneGeometry( GROUND_SIZE, GROUND_SIZE, 120, 120 );

	var pos = geometry.getAttribute( 'position' ),
		v = new THREE.Vector3(),
		eps = 0.1;
	
	for( var i=0; i<pos.count; i++ )
	{
		v.fromBufferAttribute( pos, i );
		v.z = 3*simplex.noise( v.x/20, v.y/20 ) + 0.3*simplex.noise( v.x/4, v.y/4 );

		if( (Math.abs(v.x-floorX1)<=floorSX1/2+eps && Math.abs(v.y+floorY1)<=floorSY1/2+eps) 
		 || (Math.abs(v.x-floorX2)<=floorSX2/2+eps && Math.abs(v.y+floorY2)<=floorSY2/2+eps)
		 || (Math.abs(v.x-floorX3)<=floorSX3/2+eps && Math.abs(v.y+floorY3)<=floorSY3/2+eps) ) 
		  v.z = 0;

		if( v.x>=GROUND_SIZE/2 ) {v.x -= 0/GROUND_SIZE; v.z = -3};
		if( v.y>=GROUND_SIZE/2 ) {v.y -= 0/GROUND_SIZE; v.z = -3};
		if( v.x<=-GROUND_SIZE/2 ) {v.x += 0/GROUND_SIZE; v.z = -3};
		if( v.y<=-GROUND_SIZE/2 ) {v.y += 0/GROUND_SIZE; v.z = -3};
		
		pos.setXYZ( i, ...v );
	}
	
	geometry.computeVertexNormals();

	
	var material = new THREE.MeshStandardMaterial( {
		color: 'mediumseagreen',
		roughness: 1,
		metalness: 0,
		side: THREE.DoubleSide,
	} );
	
	var mesh = new THREE.Mesh( geometry, material );
		mesh.position.y = -0.02;
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		mesh.rotation.x = -Math.PI/2;

	scene.add( mesh );
}



function createFloorMap( )
{
	// генериране на пода на къщата

	floorX1 = random(-2,2);
	floorY1 = random(-2,2);
	floorSX1 = random(10,14);
	floorSY1 = random(6,8);

	floorX2 = random(-2,2);
	floorY2 = random(-2,2);
	floorSX2 = random(6,8);
	floorSY2 = random(10,14);
	
	if( random(0,1)>0.5 )
	{
		floorX3 = random(-GROUND_SIZE/4,GROUND_SIZE/4);
		floorY3 = GROUND_SIZE/4*Math.sign(random(0,1)-0.5);
		floorSX3 = 2;
		floorSY3 = GROUND_SIZE/2;
		user.position.set( floorX3, 0, 1.8*floorY3 );
		user.lookAt( floorX3, 0, floorY3 );
	}
	else
	{
		floorY3 = random(-GROUND_SIZE/4,GROUND_SIZE/4);
		floorX3 = GROUND_SIZE/4*Math.sign(random(0,1)-0.5);
		floorSY3 = 2;
		floorSX3 = GROUND_SIZE/2;
		user.position.set( 1.8*floorX3, 0, floorY3 );
		user.lookAt( floorX3, 0, floorY3 );
	}

	if( floorSX1%2 ) floorX1 += 0.5;
	if( floorSX2%2 ) floorX2 += 0.5;
	if( floorSX3%2 ) floorX3 += 0.5;
	if( floorSY1%2 ) floorY1 += 0.5;
	if( floorSY2%2 ) floorY2 += 0.5;
	if( floorSY3%2 ) floorY3 += 0.5;

}



function villa( FN = Date.now() )
{
	FN += '';
	
	floors.clear();

	// фиксиране на генератора на случайни числа
	if( FN == '9MI0899999' )
		THREE.MathUtils.seededRandom( 4105752 );
	else
	{	
		var seed = 0;

		for( var i=0; i<FN.length; i++ )
			seed = (seed<<1)+Math.round(i*Math.cos(i+FN.charCodeAt(i)))*FN.charCodeAt(i);

		THREE.MathUtils.seededRandom( seed );

	}

	initScene();
	initLights();
	initControls();
	initTextures();
	initVR();

	createFloorMap();
	createFloors();
	createGround();

}



function initVR()
{
	// поддръжка на VR
	if( VRAvailable )
	{
		document.body.appendChild( VRButton.createButton( renderer ) );
		renderer.xr.enabled = true;

		move0 = false; // дали е натиснат левият спусък
		move1 = false; // дали е натиснат десният спусък
		controller0 = renderer.xr.getController( 0 );
		controller1 = renderer.xr.getController( 1 );
			
		controller0.addEventListener( 'selectstart', function(){ move0 = true; } );
		controller0.addEventListener( 'selectend', function(){ move0 = false; } );

		controller1.addEventListener( 'selectstart', function(){ move1 = true; } );
		controller1.addEventListener( 'selectend', function(){ move1 = false; } );

		controller0.add( new THREE.ArrowHelper( new THREE.Vector3(0,0,-1), new THREE.Vector3(0,0,0), 1, 'red', 0.1, 0.04 ) );
		
		controller1.add( new THREE.ArrowHelper( new THREE.Vector3(0,0,-1), new THREE.Vector3(0,0,0), 1, 'red', 0.1, 0.04 ) );
		
		scene.add( controller0, controller1 );

					
		// подвижен потребител
		camera.position.set(0,0,0);
		camera.rotation.set(0,0,0);
		
		user.add( camera );
		user.add( controller0 );
		user.add( controller1 );
		user.rotation.set(0,0,0);

		scene.add( user );
	}
}


function animate( time )
{
	if( VRAvailable )
	{
		if( move0 || move1 )
		{
			if( move0 ) controller0.getWorldDirection( v );
			if( move1 ) controller1.getWorldDirection( v );
			v.normalize();
			user.position.addScaledVector( v, -0.1 );
		}
	}
	else
	{
		controls.update( time );
	}
	
	renderer.render( scene, camera );
}



export { villa, renderer, scene, camera, light, contraLight, controls, VRButton };