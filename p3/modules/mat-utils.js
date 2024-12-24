//Functions that returns a 4X4 matrix which contains a translation acording to parameter "translation"
function setTranslation (translation) {
	var transMatrix = mat4.create();
	
	mat4.fromTranslation(transMatrix, translation);
	
	return transMatrix;
}

//Functions that returns a 4X4 matrix which contains a rotation acording to parameters "angle" and "rotation" (axis)
function setRotation (angle, rotation) {
	var rotMatrix = mat4.create();
	
	mat4.fromRotation(rotMatrix, angle, rotation);
	
	return rotMatrix;
}

//Functions that returns a 4X4 matrix which contains a scale acording to parameter "scaling"
function setScaling (scaling) {
	var scaleMatrix = mat4.create();
	
	mat4.fromScaling(scaleMatrix, scaling);
	
	return scaleMatrix;
}

//Function which multiplies all 4X4 matrices inside "matrices" array parameter. "matrices" will always have at least one matrix
//Order to multiply: 0...n-1
function multiplyAll (matrices) {
	var modelMatrix = mat4.create();
	
	if (matrices.length > 1){
		mat4.multiply(modelMatrix, matrices[0], matrices[1]);
		
		for (var i = 2; i < matrices.length; i++){
			mat4.multiply(modelMatrix, modelMatrix, matrices[i]);
		}
	}
	else{
		mat4.multiply(modelMatrix, modelMatrix, matrices[0]);
	}
	
	return modelMatrix;
}

//Function that creates the matrix which translates, rotates and scales the "model"
function transform (model, translation, rotation, scale){
	//Define variables
	var t, rx, ry, rz, s;
	
	//Get transformations
	t = setTranslation(translation);
	s = setScaling(scale);
	
	// Apply rotations only if the angle is provided
	var matrices = [t, s];
	if (rotation[0] !== 0.0) {
	  rx = setRotation(rotation[0], [1.0, 0.0, 0.0]);
	  matrices.push(rx);
	}
	if (rotation[1] !== 0.0) {
	  ry = setRotation(rotation[1], [0.0, 1.0, 0.0]);
	  matrices.push(ry);
	}
	if (rotation[2] !== 0.0) {
	  rz = setRotation(rotation[2], [0.0, 0.0, 1.0]);
	  matrices.push(rz);
	}
	
	//Multiply all of them
	model.modelMatrix = multiplyAll(matrices);
  }

export { setTranslation, setRotation, setScaling, multiplyAll, transform };
