class Calculator {

	constructor(scene) {
		this.scene = scene;
		this.vectorSize = 3;
	}

	getSceneChildrenByName(name){
		for(let i = 0; i < this.scene.length; i++){
	    let children  = this.scene[i];
	    let childrenname = this.scene[i].name;
	    if(childrenname == name){
	       return children;
	    }
		}
		return undefined;
	}

	updateFacialPoints(facialpoints, pointsname){
		let scenechildren = this.getSceneChildrenByName(pointsname);
		let positions = scenechildren.geometry.attributes.position.array;
		let x,y;
		let index = 0;
		const z = 3;
		for (let i=0; i< facialpoints.data.features.length; i++) {
			let rect = facialpoints.data.features[i];
			positions[ index ++ ] = (((rect.x-2) * canvases.scale)-videoImage.width/2) / ratioPixels.x;
			positions[ index ++ ] = -(((rect.y-2) * canvases.scale)-videoImage.height/2) / ratioPixels.y;
			positions[ index ++ ] = z;
	  }

		return positions;
	}

	calculateEyesDistance(positions, facialpointssize){

		if(!facialpointssize)
			return;

		let scenechildren = this.getSceneChildrenByName("centerEyePoints");
		let test = 0;
		let eyesDistanceValue, pos;
		let eyePoints = [];
		//mineye1
		eyePoints[0] = 37;
		//maxeye1
		eyePoints[1] = 42;
		//mineye2
		eyePoints[2] = 43;
		//maxeye2
		eyePoints[3] = 48;
		eyePoints.sizeeye = (eyePoints[1] - eyePoints[0]) + 1;
		let sumPoints = [];
		sumPoints.xeye1 = sumPoints.yeye1 = sumPoints.xeye2 = sumPoints.yeye2 = 0;
		let indexEye1 = eyePoints[0];
		let indexEye2 = eyePoints[2];
		let centerEyePointsAvg = [];


		for( let i=0; i < eyePoints.sizeeye; i++){
			pos = (indexEye1 - 1) * vectorSize;
			sumPoints.xeye1 = sumPoints.xeye1 + positions[pos];
			sumPoints.yeye1 = sumPoints.yeye1 + positions[pos + 1];
			//console.log("Eye 1 point " +  indexEye1  + ": " +  positions[pos] + "," + positions[pos + 1]);
			indexEye1 ++;
		}


		for( let i=0; i < eyePoints.sizeeye; i++){
			pos = (indexEye2 - 1) * vectorSize;
			sumPoints.xeye2 = sumPoints.xeye2 + positions[pos];
			sumPoints.yeye2 = sumPoints.yeye2 + positions[pos + 1];
			//console.log("Eye 2 point " +  indexEye2  + ": " +  positions[pos] + "," + positions[pos + 1]);
			indexEye2 ++;
		}

		centerEyePointsAvg.xeye1 = sumPoints.xeye1 / eyePoints.sizeeye;
		centerEyePointsAvg.yeye1 = sumPoints.yeye1 / eyePoints.sizeeye;
		centerEyePointsAvg.xeye2 = sumPoints.xeye2 / eyePoints.sizeeye;
		centerEyePointsAvg.yeye2 = sumPoints.yeye2 / eyePoints.sizeeye;

		//console.log("Eye 1 center point: " +  centerEyePointsAvg.xeye1 + "," + centerEyePointsAvg.yeye1);
		//console.log("Eye 2 center point: " +  centerEyePointsAvg.xeye2 + "," + centerEyePointsAvg.yeye2);

		//debugger
		positions = scenechildren.geometry.attributes.position.array;
		let x,y;
		let index = 0;
		const z = 3;
		//for (let i=0; i< 6; i++) {
		positions[ 0 ] = centerEyePointsAvg.xeye1;
		positions[ 1 ] = centerEyePointsAvg.yeye1;
		positions[ 3 ] = centerEyePointsAvg.xeye2;
		positions[ 4 ] = centerEyePointsAvg.yeye2;
		positions[ 2 ] = positions[ 5 ] =  z;

	  //}
		//calculates points eyesDistance
		eyesDistanceValue = Math.hypot(centerEyePointsAvg.xeye2 - centerEyePointsAvg.xeye1, centerEyePointsAvg.yeye2 - centerEyePointsAvg.yeye1 );

		return eyesDistanceValue;
	}

}
