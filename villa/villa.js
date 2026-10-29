console.warn( `
   ____
  /\\___\\
  | |""|     villa.js   
 ~^~^~^~^
`
);

const VR_MODE = (window.location.href.indexOf('.fmi.uni-sofia.')>2);
const PARAMS = new URLSearchParams(document.location.search);
const FLAT = PARAMS.has('2d') || PARAMS.has('2D');
const FAST = PARAMS.has('fast');

import * as THREE from "three";
import {mix,atan,Discard,normalLocal,normalWorld,transformNormalToView,float,If,Fn,time,mul,positionWorld,positionLocal, vec3, remap, remapClamp, mx_noise_float as perlin, mx_fractal_noise_float as fractal} from "three/tsl";
import {Man,Woman,Child,World,camera,cameraLight,controls,light,ground,scene,renderer} from "https://boytchev.github.io/disfigure/dist/disfigure.js";


var GROUND_SIZE = 20;

var MAX_ANISOTROPY, texture=[], textureFN;

var floorX1, floorY1, floorSX1, floorSY1;
var floorX2, floorY2, floorSX2, floorSY2;
var floorX3, floorY3, floorSX3, floorSY3;

var floors = new THREE.Group();

import {SimplexNoise} from "three/addons/math/SimplexNoise.js";
/*

import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {VRButton} from 'three/addons/webxr/VRButton.js';
import {pools,everybody} from 'disfigure';



var VRAvailable = false;
if ( VR_MODE && 'xr' in navigator ) {

	await navigator.xr.isSessionSupported( 'immersive-vr' )
			.then( supported => VRAvailable = supported );

}



// public

var renderer, scene, camera, light, contraLight, controls;



// not public


var move0, move1, controller0, controller1;
var v = new THREE.Vector3();


*/
var user = new THREE.Group();
// случайно цяло число

function random( a, b )
{
	var rnd = Math.abs( THREE.MathUtils.seededRandom( ) );
	return Math.floor( a + (b-a+1)*rnd );
}



function initScene( )
{
cameraLight.intensity = 0.25;
	/*
	var e = document.getElementsByTagName('canvas');
	if(e.length>0) e[0].remove();
	
	// WebGL + включване на сенки
	
	renderer = new THREE.WebGPURenderer( {antialias:true} );
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

	MAX_ANISOTROPY = 4//renderer.capabilities.getMaxAnisotropy();

	// сцена

	scene = new THREE.Scene();
	scene.background = new THREE.Color( FLAT?'white':'black' );
	scene.add( floors );
*/
	// камера и гледна точка

//	camera = new THREE.PerspectiveCamera( 60, 1, 0.01, 200 );
	if( FLAT ) {
		scene.background = new THREE.Color( 'white' );
	} else {
		camera.position.set( 5, 15, 10 );
		camera.lookAt( scene.position );
		if( controls ) controls.update();
	}
	
}



function initLights( )
{
	if( FLAT ) return;
	
	controls.zoomSpeed = 6;
	
	// основна светлина

//	light = new THREE.DirectionalLight( 'white', 3 );
	light.decay = 0;
	light.position.set( 2, 4, 3 );
//	light.target = scene;
//	light.castShadow = true;
/*	
	light.shadow.mapSize.width = 1024*4;
	light.shadow.mapSize.height = 1024*4; 
*/
	light.shadow.camera.near = 0; 
	light.shadow.camera.far = 20; 
	
	light.shadow.camera.left = -20; 
	light.shadow.camera.right = 20; 
	light.shadow.camera.top = -20; 
	light.shadow.camera.bottom = 20; 
	light.shadow.normalBias = 0.04; 
	light.shadow.bias = -0.0004; 
	light.shadow.intensity = 1; 

	light.shadow.radius = 2;
	light.shadow.blurSamples = 4;
	//scene.add( light );
//	scene.add( new THREE.DirectionalLightHelper(light) );



}


/*
function initControls()
{
	if( VRAvailable ) return;
	
	// интерактивно въртене

	if( !FLAT ) {
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
	}
	
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
*/


function initTextures( FN )
{
	// картинка на квадратчета
	var N = 256;
	var canvas = document.createElement( 'CANVAS' );
		canvas.width = N;
		canvas.height = N;

	var context = canvas.getContext( '2d' );

	context.fillStyle = 'white';
	context.fillRect(0,0,N,N);
	
	context.beginPath()
	for( var i=1; i<5; i++ ) {
		var j = i/5*N;
		context.moveTo(-10,j);
		context.lineTo(N+10,j);
		context.moveTo(j,-10);
		context.lineTo(j,N+10);
	}
	context.strokeStyle = FLAT?'#afdfff':'gray';
	context.lineWidth = 3;
	context.stroke();

	context.strokeStyle = FLAT?'#afdfff':'black';
	context.lineWidth = FLAT?8:4;
	context.strokeRect(1,1,N,N);
	
	var tile = new THREE.CanvasTexture( canvas );
	
	
//	tile.minFilter = THREE.NearestFilter;
//	tile.maxFilter = THREE.NearestFilter;

//	const TILE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAGUExURcPDw/////joICQAAAASSURBVAjXY2AAgfr///8PTgIAnnZsBQ0uHE0AAAAASUVORK5CYII=';
	
	for( var i=0; i<3; i++ )
	{
		texture[i] = tile.clone();//new THREE.TextureLoader().load( TILE );
		texture[i].wrapS = THREE.RepeatWrapping;
		texture[i].wrapT = THREE.RepeatWrapping;
		texture[i].anisotropy = 8;//MAX_ANISOTROPY;
	}
		
	var canvas = document.createElement( 'CANVAS' );
		canvas.width = 512;
		canvas.height = 64;

	var context = canvas.getContext( '2d' );
		context.font = "60px Arial";
		context.strokeStyle = 'black';

		if( FLAT )
		{
			context.fillStyle = 'white';
			context.fillRect(0,0,512,64);
		}
		
		context.textAlign = 'center';
		context.fillStyle = FLAT?'#098ac9':'black';
		context.fillText( FN, 256, 56 );

	textureFN = new THREE.CanvasTexture( canvas );
	textureFN.anisotropy = 8;

}



function createFloors()
{
	var geometry = new THREE.PlaneGeometry( 1, 1 );

	function floor( x, y, sx, sy, i ) 
	{
		texture[i].repeat.set( (FLAT?1:1)*sx, (FLAT?1:1)*sy );

		if( FLAT ) {
			var material = new THREE.MeshBasicMaterial( {
				color: 'white',
				map: texture[i],
			} );
		} else {
			var material = new THREE.MeshLambertMaterial( {
				color: 'white',
				// roughness: 0.5,
				// metalness: 0,
				map: texture[i],
			} );
		}

		var mesh = new THREE.Mesh( geometry, material );
			mesh.position.set( x, 0, y );
			mesh.scale.set( sx, sy );
			mesh.receiveShadow = true;
			mesh.rotation.x = -Math.PI/2;

		floors.add( mesh );

		if( FLAT ) {
			var material = new THREE.MeshBasicMaterial( {color:0xafdfff,depthWrite:false} );
			var mesh = new THREE.Mesh( geometry, material );
				mesh.position.set( x, 0, y );
				mesh.scale.set( sx+0.1, sy+0.1 );
				mesh.rotation.x = -Math.PI/2;
				mesh.renderOrder = -1;

			floors.add( mesh );
			
		}
		
	} // floor

	floor( floorX1, floorY1, floorSX1, floorSY1, 0 );
	floor( floorX2, floorY2, floorSX2, floorSY2, 1 );
	floor( floorX3, floorY3, floorSX3, floorSY3, 2 );
	
}



function createGround() 
{
	if( FLAT ) {
		ground.visible = false;
		return;
	}
	
	var simplex = new SimplexNoise( { random: THREE.MathUtils.seededRandom } );

	var geometry = new THREE.PlaneGeometry( GROUND_SIZE+20, GROUND_SIZE+20, (GROUND_SIZE+20)*5, (GROUND_SIZE+20)*5 );

	var pos = geometry.getAttribute( 'position' ),
		uv = geometry.getAttribute( 'uv' ),
		v = new THREE.Vector3(),
		eps = 0.1;
	
	for( var i=0; i<pos.count; i++ )
	{
		v.fromBufferAttribute( pos, i );
		v.z = 3*simplex.noise( v.x/20, v.y/20 ) + 0.3*simplex.noise( v.x/4, v.y/4 );
		if( !FAST )
			v.z +=  0.3*simplex.noise( v.x/2, v.y/2 )**3;

		if( (Math.abs(v.x-floorX1)<=floorSX1/2+eps && Math.abs(v.y+floorY1)<=floorSY1/2+eps) 
		 || (Math.abs(v.x-floorX2)<=floorSX2/2+eps && Math.abs(v.y+floorY2)<=floorSY2/2+eps)
		 || (Math.abs(v.x-floorX3)<=floorSX3/2+eps && Math.abs(v.y+floorY3)<=floorSY3/2+eps) )
		  v.z = 0;
		 
		//if( floorSX3==2 && Math.abs(v.x-floorX3)<=floorSX3/2+eps ) v.z = 0;
		//if( floorSY3==2 && Math.abs(v.y+floorY3)<=floorSY3/2+eps ) v.z = 0;
			
		var kx = THREE.MathUtils.smootherstep(THREE.MathUtils.clamp(THREE.MathUtils.mapLinear( Math.abs(v.x), GROUND_SIZE/2, (GROUND_SIZE+20)/2, 1, 0 ), 0, 1), 0, 1);
		var ky = THREE.MathUtils.smootherstep(THREE.MathUtils.clamp(THREE.MathUtils.mapLinear( Math.abs(v.y), GROUND_SIZE/2, (GROUND_SIZE+20)/2, 1, 0 ), 0, 1), 0, 1);
		var k = (kx*ky)**0.5;
		v.z = v.z*k + (-0)*(1-k);
//		if( k<1 ) {
//			var kk = THREE.MathUtils.mapLinear( k, 0, 1, 5, 1 );
//			v.x = v.x+(v.x-floorX3)*kk;
//			v.y = v.y+(v.y+floorY3)*kk;
//		}

//		v.z = Math.max(v.z,-1.9);
		
		pos.setXYZ( i, ...v );
	}
	
	for( var i=0; i<uv.count; i++ )
	{
		v.fromBufferAttribute( pos, i );
		var tu = (v.x+(GROUND_SIZE+20)/2*2)/(GROUND_SIZE+20)/2;
		var tv = (v.y+(GROUND_SIZE+20)/2*2)/(GROUND_SIZE+20)/2;
		uv.setXY( i, tu, tv );
	}
	
	geometry.computeVertexNormals();
	ground.material.needsUpdate = true;

	var terrain = Fn( ()=> {
		var y = remap(positionWorld.y,-2.5,2,0,1);

		var color = remap(
						fractal(positionWorld.mul(0.35),4),
						-1,
						1,
						vec3(perlin(positionWorld.mul(0.25/5)).add(0.25),1.5,0),
						vec3(0,0,0))
					.mul(y.smoothstep(0,1)).toVar();
					
		var p = perlin(positionWorld.zxy.mul(20)).toVar();
		color.addAssign( p.smoothstep(0.3,1).mul(y.smoothstep(0.2,0.5),0.25) );
		color.subAssign( p.negate().smoothstep(0.3,1).mul(y.smoothstep(0.2,0.5),0.25) );
		
		var q = perlin(positionWorld.mul(0.1)).mul(100);
		var dy = perlin(positionWorld.mul(1).add(vec3(0,time.div(2),0))).mul(0.03);
		
		If( y.lessThan(dy.add(0.2)), ()=>{
			color.assign( color.div(2).add(color.zxy).mul(2).add(vec3(-0.2,0,0.2)) );
		} )
		.ElseIf( y.lessThan(dy.add(0.22)), ()=>{
			color.assign( color.add(color.zxy).mul(2).add(vec3(-0.2,0.1,0.4)) );
		} );

		If( positionLocal.length().greaterThan(GROUND_SIZE-0.5), ()=>{
			var k = atan(positionLocal.x,positionLocal.y).mul(100).sin().add(1).step(1).toVar();
			color.assign( vec3(k.mul(2.5),k,0) );
		} );


		
		return color;

	});
	
	// var routerrain = Fn( ()=> {
		// var y = remap(positionWorld.y,-3,3,0,1);
		// var r = float(1).toVar();
		// If( y.lessThan(0.2), ()=>{ r.assign(0.1)} );
		// return r;

	// });
	
	var opaterrain = Fn( ()=> {
		If( positionLocal.length().greaterThan(GROUND_SIZE), ()=>{Discard();} );
		return 1;

	});
	
	if( FAST ) {
		var material = new THREE.MeshStandardMaterial( {
			color: 'mediumseagreen',
			roughness: 0.7,
			metalness: 0,
			polygonOffset: true,
			polygonOffsetFactor: 5,
			polygonOffsetUnits: 5,
			side: THREE.DoubleSide,
			//map: ground.material.map,
			//transparent: true,
			//wireframe: true,
		} );
		ground.material.map.center.set(1/2,1/2);
		ground.material.map.repeat.set(2,2);
	} else {
		var material = new THREE.MeshStandardNodeMaterial( {
//			roughnessNode: routerrain(),
			roughness: 1,
			metalness: 0,
			polygonOffset: true,
			polygonOffsetFactor: 5,
			polygonOffsetUnits: 5,
			side: THREE.DoubleSide,
			transparent: true,
			colorNode: terrain(),
			opacityNode: opaterrain(),
			// normalNode: norterrain(),
		} );
	}

	ground.geometry = geometry;
	ground.material = material;
	ground.castShadow = true;
}



function createFloorMap( )
{
	// FN
	
	var fn = new THREE.Mesh(
					new THREE.PlaneGeometry((FLAT?2:1)*2.6,(FLAT?2:1)*0.3),
					new THREE.MeshBasicMaterial({map:textureFN,transparent:true})
				);
	scene.add( fn );
	var attempt = 0;
do {
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

if( !FLAT ) {
	floorSY3 = GROUND_SIZE;
	floorY3 += GROUND_SIZE/4 * Math.sign(floorY3);
}

		if (floorX3<Math.min(floorX1-floorSX1/2,floorX2-floorSX2/2) ) floorX3 = Math.floor(Math.min(floorX1-floorSX1/3,floorX2-floorSX2/3));
		if (floorX3>Math.max(floorX1+floorSX1/2,floorX2+floorSX2/2) ) floorX3 = Math.floor(Math.max(floorX1+floorSX1/3,floorX2+floorSX2/3));

		user.rotation.set( 0, floorY3>0?0:Math.PI, 0 );
		user.position.set( floorX3, 0, 2*floorY3 );
		
		fn.rotation.set(-Math.PI/2,floorY3>0?0:FLAT?0:Math.PI,0,'YXZ');
		fn.position.set( floorX3, 0.01, 1.9*floorY3 );
	}
	else
	{
		floorY3 = random(-GROUND_SIZE/4,GROUND_SIZE/4);
		floorX3 = GROUND_SIZE/4*Math.sign(random(0,1)-0.5);
		floorSY3 = 2;
		floorSX3 = GROUND_SIZE/2;

if( !FLAT ) {
	floorSX3 = GROUND_SIZE;
	floorX3 += GROUND_SIZE/4 * Math.sign(floorX3);
}
		if (floorY3<Math.min(floorY1-floorSY1/2,floorY2-floorSY2/2) ) floorY3 = Math.floor(Math.min(floorY1-floorSY1/3,floorY2-floorSY2/3));
		if (floorY3>Math.max(floorY1+floorSY1/2,floorY2+floorSY2/2) ) floorY3 = Math.floor(Math.max(floorY1+floorSY1/3,floorY2+floorSY2/3));

		user.rotation.set( 0, floorX3>0?Math.PI/2:-Math.PI/2, 0 );
		user.position.set( 2*floorX3, 0, floorY3 );
		
		fn.rotation.set(-Math.PI/2,floorX3>0?Math.PI/2:-Math.PI/2,0,'YXZ');
		fn.position.set( 1.9*floorX3, 0.01, floorY3 );
	}
	
			
	if( floorSX1%2 ) floorX1 += 0.5;
	if( floorSX2%2 ) floorX2 += 0.5;
	if( floorSX3%2 ) floorX3 += 0.5;
	if( floorSY1%2 ) floorY1 += 0.5;
	if( floorSY2%2 ) floorY2 += 0.5;
	if( floorSY3%2 ) floorY3 += 0.5;

	if( FLAT )
	{
		var x = Math.min(floorX1-floorSX1/2,floorX2-floorSX2/2,floorX3-floorSX3/2)+Math.max(floorX1+floorSX1/2,floorX2+floorSX2/2,floorX3+floorSX3/2);
		var y = Math.min(floorY1-floorSY1/2,floorY2-floorSY2/2,floorY3-floorSY3/2)+Math.max(floorY1+floorSY1/2,floorY2+floorSY2/2,floorY3+floorSY3/2);
		camera.position.set( x/2, 36, y/2 );
		camera.lookAt( x/2, 0, y/2 );
	}
	
	function inside(x,center,span) {
		return (center-span/2)<=x && x<=(center+span/2);
	}
	function check(x,y) {
		x+=0.5;
		y+=0.5;
		return (
			(inside(x,floorX1,floorSX1) && inside(y,floorY1,floorSY1))
			|| (inside(x,floorX2,floorSX2) && inside(y,floorY2,floorSY2))
			|| (inside(x,floorX3,floorSX3) && inside(y,floorY3,floorSY3))?1:0
		);
	}
	var allc = 0;
	for(var x=-GROUND_SIZE-4; x<=GROUND_SIZE+4; x++)
	for(var y=-GROUND_SIZE-4; y<=GROUND_SIZE+4; y++)
	{
		var c = check(x,y)+check(x+1,y)+check(x,y+1)+check(x+1,y+1);
		if( c==1 || c==3 ) allc++;
	}

}
	while( allc<13 && fn=='9MI0899999');

attempt++
//console.log(allc,'@'+attempt);
}



function randomFN( )
{
	THREE.MathUtils.seededRandom( 4105752*Math.random() );
	return random(0,9)+'MI'+random(0,9)+random(0,9)+random(0,9)+random(0,9)+random(0,9)+random(0,9)+random(0,9);
}



function villa( FN = randomFN() )
{
	FN = (PARAMS.get('fn') || FN)+'';

	FN = FN.toUpperCase().replace(/[^A-Z0-9]/gm,"");
	
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
	
	new World( {controls:!FLAT});
	scene.add( floors );

	initScene();
	initLights();
	// initControls();
	initTextures( FN );
	// initVR();

	createFloorMap();
	createFloors();
	createGround();

}

/*

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
		controls?.update( time );
	}
	
	everybody.forEach( e=>{
		e.update();
	}	);
	
	renderer.render( scene, camera );
}



export { villa, renderer, scene, camera, light, contraLight, controls, VRButton };
*/

function man( height=1.7 ) {
	return new Man( height );
};

function woman( height=1.6 ) {
	return new Woman( height );
};

function child( height=1.3 ) {
	return new Child( height );
};


export {villa,man,woman,child,camera,cameraLight,controls,light,ground,scene,renderer};

