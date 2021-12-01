/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

import { time } from 'console';
import { STATUS_CODES } from 'http';
import { onLongPress } from 'TouchGestures';

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//
// Spark AR Studio extension for VS Code - https://fb.me/spark-vscode-plugin
//
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in modules
const Scene = require('Scene');
const TG = require('TouchGestures');
const R = require("Reactive");
const Time = require("Time");
const CANNON = require('cannon')
const Materials = require('Materials');
const Patches = require('Patches');



// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');


(async function () {  // Enables async/await in JS [part 1]

 



  const ball = await   Scene.root.findFirst('Sphere');
//const floor = await Scene.root.findFirst('plane0');



// World Create
  const world = new CANNON.World();

    world.gravity.set(0, -9.8, 0); // world gravity

    world.broadphase = new CANNON.NaiveBroadphase(); // detech colliding objects
  
    world.solver.iterations = 5; // Collision detection sampling rate

    const timeStep = 1.0 / 60.0 // Seconds
    const maxSubSteps = 3;
    const timeInterval = 30;
    let lastTime;



// Ball Parameters

  const radius = 1;

  const ballProp = {

      mass : 1,
      position: new CANNON.Vec3(20, 1, 5),
      radius : radius,
      shape: new CANNON.Sphere(radius),
      material : ball,
      valocity: new CANNON.Vec3(0,0,0),
  }

  const ballBody = new CANNON.Body(ballProp);

 

 //ballProp.gravity.set(0, 0, 0);

 world.addBody(ballBody);



// Ground Parameters
    // Define a set of properties for the ground
    const groundProps = {
      mass: 0,
      position: new CANNON.Vec3(0, -ballProp.radius, 0),
      shape: new CANNON.Plane(),
  }

  // Create a new body for the ground with the previously defined set of properties
  const groundBody = new CANNON.Body(groundProps);

  // Rotate the ground so that it is flat and faces upwards
  const angle = -Math.PI / 2;
  const xAxis = new CANNON.Vec3(1, 0, 0);
  groundBody.quaternion.setFromAxisAngle(xAxis, angle);

  // Add the ground body to the cannon world
  world.addBody(groundBody);



  //   const floorProp = {
  //     mass: 0,
  //     position: new CANNON.Vec3 (0,-ballProp,0),
  //     shape: new CANNON.Plane(),
  //     material : floor,
  //     velocity  : new CANNON.Vec3(0,0,0),


  //   }
  //   const floorBody = new CANNON.Body(floorProp);

  //  // floorBody.gravity.set(0,0,0);

  //   const angle = Math.PI / 2;
  //   const xAxis = new CANNON.Vec3(1,1,1);
  //   floorBody.quaternion.setFromAxisAngle(xAxis,angle);

  //    world.addBody(floorBody);

     Time.setInterval(function (time) {
      if (lastTime !== undefined) {
          let dt = (time - lastTime) / 1000;

          // Set the step parameters
          world.step(timeStep, dt, maxSubSteps)

          // Update the position of the sphere in our scene to the position of the cannon sphere body

          var ballVal1 = Patches.getScalarValue("BallX").pinLastValue();
          var ballVal2 = Patches.getScalarValue("BallY").pinLastValue();
          var ballVal3 = Patches.getScalarValue("BallZ").pinLastValue();



          ballBody.position.x = ballVal1;
          ballBody.position.y = ballVal2;
          ballBody.position.z = ballVal3;
      }

      lastTime = time
  },  timeInterval);





 
  


























/// Moving the ball (Not done)
// function updateBall(){

//   world.step(timeStep);
  
//   // ball.transform.x = ballBody.position.x;
//   // ball.transform.y = ballBody.position.y;
//   // ball.transform.z = ballBody.position.z;


//   ballBody.quaternion.copy(ballBody.quaternion);


// };




	//const screenPosition = await Patches.outputs.getScalar('ScreenP');
//onLongPress(options?: SceneObjectBase | {normalizeCoordinates?: false | true, object?: SceneObjectBase}): EventSource<LongPressGesture>

// TG.onLongPress().subscribe((gesture) => {

//   const location =  gesture.location

 
// const screenPosition = Patches.outputs.getScalar("screenP");
 //gesture.location.getScalarSignal();


    // ball.transform.x = ballBody.position.x;
    // ball.transform.y = ballBody.position.y;
    // ball.transform.z = ballBody.position.z;
  
    

//  updateBall();
 
//Diagnostics.log(location);

//   gesture.state.monitor().subscribe((state) => {
//       if (state.newValue == "ENDED") {




// Diagnostics.log("ended");
  
//         }      

//       });

// });






  

 


    






  
  









})(); // Enables async/await in JS [part 2]
