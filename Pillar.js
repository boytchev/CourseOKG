
import * as THREE from "three";
import {LatheUVGeometry} from "https://cdn.jsdelivr.net/npm/3d-assets@latest/src/assets-utils.js";

class Pillar extends THREE.Mesh {
	
	constructor( x, y, z, material ) {

		var geometry = new LatheUVGeometry( [
				[Math.max(1+y/2,10),0],
				[3,0,10,0,true,20],
				[0.5,y-5,10],
				[3,y-1,10],
				[1,y,10],
				[0,y],
			], 32 );
					
		super( geometry, material );	
		
		this.position.set(x,0,z);
		this.castShadow = true;
		this.receiveShadow = true;
	}
}

export { Pillar }