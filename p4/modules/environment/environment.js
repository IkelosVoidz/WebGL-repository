import { examplePlane, exampleCube } from '../primitives/primitives.js';
import { setTranslation, setRotation, setScaling, multiplyAll, transform } from '../mat-utils.js';
import { Perl } from '../primitives/materials.js';

//Function to create the walls of the environment
export function createWall(location, Zscale, name, rotAngle = 0.0, axis = [0.0, 0.0, 1.0]) {
  var wall = { ...examplePlane };

  var modelMatrix = mat4.create();
  var t1, t2;
  var r;
  var s1, s3;

  t2 = setTranslation(location);
  r = setRotation(rotAngle, axis);
  s1 = setScaling([1.25, 1.0, 3.0]);
  s3 = setScaling(Zscale);

  var matrices = [];
  matrices.push(t2);
  matrices.push(s1);
  matrices.push(s3);
  matrices.push(r);

  wall.modelMatrix = multiplyAll(matrices);
  wall.material = { ...Perl };
  wall.name = name;
  wall.file = './textures/concrete.jpg';

  wall.procedural = 0;
  return wall;
}

//Function create the stands where the obejcts will be on top of
export function createStand(location, material, name) {
  var stand = { ...exampleCube };

  stand.material = { ...material };
  stand.file = './textures/stand.jpg';
  stand.name = name;
  transform(stand, location, [0.0, 0.0, 0.0], [0.4, 1.1, 0.4]);
  stand.procedural = 1;

  return stand;
}

//Function to create .json files which store vertices and indices
export function createCustom3DModel(model, location, scale, material, name, rotation = [0.0, 0.0, 0.0]) {
  var obj = { ...model };

  obj.material = { ...material };
  obj.file = './textures/stand.jpg';
  obj.name = name;
  transform(obj, location, rotation, scale);
  obj.procedural = 0;

  return obj;
}
