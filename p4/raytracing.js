// Inicialitzem el RayTracing
export function updateRaytracing(Scene, Screen, camera) {
 
  // Calculem els eixos de la camera
  camera.calculateAxis();

  // Calculem els increments i P0 (GLOBALS)
  var incX = calcularIncrementX(camera, Screen);
  var incY = calcularIncrementY(camera, Screen);
  var P0 = calcularP0(incX, incY, camera, Screen);

  // Executem RayTracing
  rayTracing(Scene, Screen, incX, incY, P0, camera);
  Screen.context.putImageData(Screen.buffer, 0, 0);
}

// Calcular increment de X
function calcularIncrementX(Cam, Scr) {

  const { fov , X } = Cam.getCameraValues();

  var rati = Scr.height / Scr.width;

  var theta = (fov * Math.PI) / 180;
  var w = 2 * Math.tan(theta / 2); // Calculem w' = 2*tg(theta/2)
  var h = w * rati; // Calculem h' = w'*rati

  var aux = w / Scr.width; // w'/W
  var incX = vec3.scale(X, aux); // Calculem increment de X (X * 2*tg(theta/2)/W)

  return incX;
}

// Calcular increment de Y
function calcularIncrementY(Cam, Scr) {

  const { fov , Y } = Cam.getCameraValues();
  var rati = Scr.height / Scr.width;

  var theta = (fov * Math.PI) / 180;
  var w = 2 * Math.tan(theta / 2); // Calculem w' = 2*tg(theta/2)
  var h = w * rati; // Calculem h' = w'*rati

  var aux = (rati * w) / Scr.height; // rati*w'/H
  var incY = vec3.scale(Y, aux); // Calculem increment de Y (Y * 2*tg(theta/2)/W)

  return incY;
}

// Calcular P0
function calcularP0(incX, incY, Cam, Scr) {

  const { position , Z } = Cam.getCameraValues();
  var P = vec3.subtract(position, Z); // Calculem P (O - Z)
  var aux = vec3.scale(incX, (Scr.width - 1) / 2); // Increment de X * (W-1)/2
  var aux2 = vec3.scale(incY, (Scr.height - 1) / 2); // Increment de Y * (H-1)/2
  var aux3 = vec3.subtract(P, aux); // P - Increment de X * (W-1)/2
  var P0 = vec3.add(aux3, aux2); // Calculem P0 (P - Increment de X * (W-1)/2 + Increment de Y * (H-1)/2)

  return P0;
}



function plot(x, y, color, Screen) {
  var index = (x + y * Screen.buffer.width) * 4;
  Screen.buffer.data[index + 0] = color[0] * 255;
  Screen.buffer.data[index + 1] = color[1] * 255;
  Screen.buffer.data[index + 2] = color[2] * 255;
  Screen.buffer.data[index + 3] = 255;
  return index;
}

///////////////////////////////////
///// MAIN ALGORITHM //////////////
///////////////////////////////////
// Pintar cada pixel
function rayTracing(Scene, Screen, incX, incY, P0, camera) {
  const { position } = camera.getCameraValues();
  for (let x = 0; x < Screen.width; x++) {
    for (let y = 0; y < Screen.height; y++) {
      let rDirection = computeRay(incX, incY, P0, position, x, y);

      //We set default color
      let color = [0.3, 0.4, 1];
      //We calculate the intersection with all objects
      color = IntersectScene(Scene, rDirection, position, 0);
      plot(x, y, color, Screen);
    }
  }
  console.log('Done');
}

//The object type where we save all hit information
var hitInfo = {
  t: 0,
  normal: 0,
  point: 0,
  surfaceId: '',
  type: '',
  material: 0,
  specular: false,
  specularCoeff: null
};

//Function to intersect whole scene
function IntersectScene(scene, ray, origin, depth) {
  //We get the first hit information
  var hit = computeFirstHit(scene, ray, origin);
  //Check if it's not undefined neither null
  if (hit) {
    if (hit.t !== null) {
      //Compute light
      var light = computeLight(scene, hit, ray, depth);
      //Check if surface we hit is specular and if we can proceed (necessary to stop recursivity)
      if (hit.specular && depth < scene.Bounces) {
        //Compute reflected ray
        var d1 = computeReflectionDirection(hit, ray); //The new ray will be the vector d1 and origin hit.point
        //Get a little bit modified origin point in order to have correct specular behaviour (avoid "self-specularity")
        var newHitPoint = vec3.add(hit.point, vec3.multiply(vec3.fromValues(0.01, 0.01, 0.01), d1));
        //Re-intersect whole scene with new vector and ray
        var color = IntersectScene(scene, d1, newHitPoint, depth + 1);
        //Convert into vec3 from gl-matrix
        var colorVec3 = vec3.fromValues(color[0], color[1], color[2]);
        //We add new specular property to light
        light = vec3.add(
          light,
          vec3.multiply(vec3.fromValues(hit.specularCoeff, hit.specularCoeff, hit.specularCoeff), colorVec3)
        );
      }
      return [light[0], light[1], light[2]];
    }
  }
  return [0.3, 0.4, 1.0];
}

//Function to compute light
function computeLight(scene, hit, ray, depth) {
  var matAmbient = vec3.fromValues(
    hit.material.mat_ambient[0],
    hit.material.mat_ambient[1],
    hit.material.mat_ambient[2]
  );
  var ambientComponent = vec3.multiply(vec3.fromValues(1.0, 1.0, 1.0), matAmbient);
  var res = ambientComponent;
  var i = 0;

  for (var light of scene.Lights) {

    if(!light.enabled) continue;

    var l = vec3.normalize(vec3.subtract(light.position, hit.point)); //Vector entre punt i llum
    var n = vec3.normalize(hit.normal);
    var partR = vec3.dot(n, l) * 2;
    var r = vec3.add(
      vec3.multiply(l, vec3.fromValues(-1, -1, -1)),
      vec3.multiply(vec3.fromValues(partR, partR, partR), n)
    );

    var matDiffuse = vec3.fromValues(
      hit.material.mat_diffuse[0],
      hit.material.mat_diffuse[1],
      hit.material.mat_diffuse[2]
    );
    var matSpecular = vec3.fromValues(
      hit.material.mat_specular[0],
      hit.material.mat_specular[1],
      hit.material.mat_specular[2]
    );

    var aux1 = Math.max(0, vec3.dot(n, l));
    var diffuseComponent = vec3.multiply(matDiffuse, vec3.fromValues(aux1, aux1, aux1));

    var ray2 = vec3.normalize(vec3.multiply(vec3.fromValues(-1, -1, -1), ray));
    var aux2 = Math.pow(Math.max(0, vec3.dot(ray2, vec3.normalize(r))), 1.5);
    var specularComponent = vec3.multiply(matSpecular, vec3.fromValues(aux2, aux2, aux2));

    var newHitPoint = vec3.add(hit.point, vec3.multiply(vec3.fromValues(0.01, 0.01, 0.01), l));
    var l2 = vec3.subtract(light.position, hit.point);
    var hit2 = computeShadowing(scene, vec3.normalize(l2), newHitPoint, hit.surfaceId);

    var vi = 1;
    if (hit2) {
      if (hit2.t !== null && hit2.t > 0 && hit2.t < vec3.length(l2)) {
        vi = 0.5;
      }
    }

    var aux3 = vec3.multiply(light.color, vec3.fromValues(vi, vi, vi));
    var aux4 = vec3.multiply(vec3.add(diffuseComponent, specularComponent), aux3);
    res = vec3.add(res, aux4);
  }

  return res;
}

//Function to compute the reflected ray
function computeReflectionDirection(hit, ray) {
  var n = vec3.normalize(hit.normal);

  var term1 = vec3.multiply(vec3.fromValues(2, 2, 2), n);
  var term2 = vec3.dot(ray, n);
  var term3 = vec3.multiply(term1, vec3.fromValues(term2, term2, term2));
  return vec3.normalize(vec3.subtract(ray, term3));
}

//Compute shadowing
function computeShadowing(scene, ray, center, surfaceId) {
  var hit = null;
  for (var primitive of scene.Shapes) {
    if (primitive.tipus === 'esfera' || primitive.tipus === 'triangle') {
      hit = intersect(primitive, ray, center, true);
      if (hit && hit.t !== null) {
        break;
      }
    }
  }
  return hit;
}

//Function to compute the first hit, the nearest shape we interact with
function computeFirstHit(scene, ray, centre) {
  var lowestT = null;
  //We iterate through all shapes
  for (var primitive of scene.Shapes) {
    //We intersect the whole scene
    var hit = intersect(primitive, ray, centre);
    //Check whether we have a hit or not
    if (hit !== null && hit.t !== null) {
      //Check if we haven't found any yet or it has a lower t than the suposed to be the lowest
      if (lowestT === null || hit.t < lowestT.t) {
        lowestT = hit;
      }
    }
  }
  return lowestT;
}

//Function that intersects a primitive acording to its type
function intersect(primitive, ray, centre) {
  switch (primitive.tipus) {
    case 'esfera':
      return QuadraticEquationSolver(primitive, centre, ray);
      break;
    case 'pla':
      return PlaneIntersection(primitive, centre, ray);
      break;
    case 'triangle':
      return TriangleIntersection(primitive, centre, ray);
      break;
  }
}

//Function that solves the quadratic equations related to spheres so as to find the hit information
function QuadraticEquationSolver(sphere, CamCentre, v) {
  var a = vec3.dot(v, v);

  var SphereCentre = vec3.fromValues(sphere.centre[0], sphere.centre[1], sphere.centre[2]);
  var diff = vec3.subtract(CamCentre, SphereCentre);
  var mult = vec3.dot(v, diff);
  var b = mult * 2;

  var diff1 = vec3.subtract(CamCentre, SphereCentre);
  var diffTot = vec3.dot(diff1, diff1);
  var c = diffTot - Math.pow(sphere.radi, 2);

  var sqrtPart = Math.pow(b, 2) - 4 * a * c;
  if (sqrtPart < 0) return null;

  var t1 = (-b + Math.sqrt(sqrtPart)) / (2 * a);
  var t2 = (-b - Math.sqrt(sqrtPart)) / (2 * a);
  var t;

  if (t1 > 0 || t2 > 0) {
    if (t1 < t2 && t1 > 0) t = t1;
    else if (t2 > 0) t = t2;
    else {
      t = null;
    }
  }

  var point = null;
  var normal = null;
  if (t !== null) {
    point = vec3.add(CamCentre, vec3.multiply(vec3.fromValues(t, t, t), v));
    normal = vec3.divide(vec3.subtract(point, SphereCentre), vec3.fromValues(sphere.radi, sphere.radi, sphere.radi));
  }

  var h = { ...hitInfo };
  h.t = t;
  h.normal = normal;
  h.point = point;
  h.surfaceId = sphere.id;
  h.type = sphere.tipus;
  h.material = sphere.material;
  h.specular = sphere.specular;
  h.specularCoeff = sphere.specularCoeff;

  return h;
}

//Function to get hit information when we intersect a plane
function PlaneIntersection(primitive, centre, v) {
  var h = { ...hitInfo };

  var d = vec3.dot(primitive.normal, primitive.point) * -1;
  var numerator = -d - vec3.dot(primitive.normal, centre);
  var denominator = vec3.dot(primitive.normal, vec3.normalize(v));
  var t = numerator / denominator;
  var point = vec3.add(centre, vec3.multiply(vec3.fromValues(t, t, t), vec3.normalize(v)));

  if (t >= 0) h.t = t;
  else h.t = null;

  h.normal = primitive.normal;
  h.point = point;
  h.surfaceId = primitive.id;
  h.type = primitive.tipus;
  h.material = primitive.material;
  h.specular = primitive.specular;
  h.specularCoeff = primitive.specularCoeff;

  return h;
}

//Function to get hit information when we intersect a triangle
function TriangleIntersection(primitive, centre, ray) {
  var h = { ...hitInfo };

  var e1 = vec3.subtract(primitive.b, primitive.a);
  var e2 = vec3.subtract(primitive.c, primitive.a);

  var h = vec3.cross(ray, e2);
  var a = vec3.dot(e1, h);

  if (a > -0.00001 && a < 0.00001) return null;

  var f = 1 / a;
  var s = vec3.subtract(centre, primitive.a);
  var u = f * vec3.dot(s, h);

  if (u < 0.0 || u > 1.0) return null;

  var q = vec3.cross(s, e1);
  var v = f * vec3.dot(ray, q);

  if (v < 0 || v + u > 1.0) return null;

  var t = f * vec3.dot(e2, q);

  if (t < 0.00001) return null;

  var point = vec3.add(centre, vec3.multiply(vec3.fromValues(t, t, t), ray));

  h.t = Math.abs(t);
  h.normal = vec3.normalize(vec3.cross(e1, e2));
  h.point = point;
  h.surfaceId = primitive.id;
  h.type = primitive.tipus;
  h.material = primitive.material;
  h.specular = primitive.specular;
  h.specularCoeff = primitive.specularCoeff;

  return h;
}

// Computar el raig
function computeRay(incX, incY, P0, position, x, y) {
  // Calculem la direccio per a cada pixel
  var aux = vec3.scale(incX, x); // Increment de X * x
  var aux2 = vec3.scale(incY, y); // Increment de Y * y
  var aux3 = vec3.add(P0, aux); // P0 + Increment de X * x
  var aux4 = vec3.subtract(aux3, aux2); // P0 + Increment de X * x - Increment de Y * y
  var ray = vec3.subtract(aux4, position); // Obtenim raig (P0 + Increment de X * x - Increment de Y * y - O)
  var rayNorm = vec3.normalize(ray); // Normalitzem el raig

  return rayNorm;
}
