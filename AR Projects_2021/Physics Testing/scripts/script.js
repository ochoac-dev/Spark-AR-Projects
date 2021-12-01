// Load in the required modules, including the Cannon.js script package
const Scene = require('Scene');
const Time = require('Time')
const CANNON = require('cannon');
const Materials = require('Materials');

(async function () {  // Enables async/await in JS [part 1]

    // Reference Sphere object from Scene
    const Ball = await Scene.root.findFirst('Sphere');
    const Ball1 = await Scene.root.findFirst('Sphere0');
    const Ball2 = await Scene.root.findFirst('Sphere1');
    //const Ball3 = await Scene.root.findFirst('Sphere2');

    // Create a cannon world
    const world = new CANNON.World();

	
    // Set the gravity parameters of the cannon world
    // A value of -9.8 in the y axis approximately simulates real world gravity
    world.gravity.set(0, -9.8, 0);

    // Define a set of properties for the sphere
    const radius = 1;
    const sphereProps0 = {
        mass: 1,
        position: new CANNON.Vec3(0, 10, 0),
        radius: radius,
        shape: new CANNON.Sphere(radius),
    }
    const radius1 = 1;
    const sphereProps1 = {
        mass: 1,
        position: new CANNON.Vec3(0, 10, 0),
        radius: radius,
        shape: new CANNON.Sphere(radius1),
    }
	    const radius2 = 1;
    const sphereProps2 = {
        mass: 1,
        position: new CANNON.Vec3(0, 10, 0),
        radius: radius,
        shape: new CANNON.Sphere(radius2),
    }
//	    const radius = 1;
//    const sphereProps_4 = {
//        mass: 1,
//        position: new CANNON.Vec3(0, 10, 0),
//        radius: radius,
//        shape: new CANNON.Sphere_4(radius),
//    }
    // Create a new body for the sphere with the previously defined set of properties
    const BallBody = new CANNON.Body(sphereProps0);
    const Ball1Body = new CANNON.Body(sphereProps1);
	const Ball2Body = new CANNON.Body(sphereProps2);
	
	
    // Add the sphere body to the cannon world
	
    world.addBody(BallBody);
	world.addBody(Ball1Body);
	world.addBody(Ball2Body);

    // Define a set of properties for the ground
    const groundProps0 = {
        mass: 0,
        position: new CANNON.Vec3(0, -sphereProps0.radius, 0),
        shape: new CANNON.Plane(),
    }
	 const groundProps1 = {
        mass: 0,
        position: new CANNON.Vec3(0, -sphereProps1.radius, 0),
        shape: new CANNON.Plane(),
   }
	 const groundProps2 = {
        mass: 0,
        position: new CANNON.Vec3(0, -sphereProps2.radius, 0),
        shape: new CANNON.Plane(),
   }

    // Create a new body for the ground with the previously defined set of properties
    const groundBody = new CANNON.Body(groundProps0 , groundProps1);
	
	const groundBody1 = new CANNON.Body( groundProps2);
	
//  const groundBody1 = new CANNON.Body1(groundProps1);
//	
//	  const groundBody2 = new CANNON.Body2(groundProps2);
	
    // Rotate the ground so that it is flat and faces upwards
	
    const angle = -Math.PI / 2;
    const xAxis = new CANNON.Vec3(1, -.02, 0);
	
	  const angle2 = -Math.PI / 2;
    const xAxis2 = new CANNON.Vec3(1, .02, 0);
	
    groundBody.quaternion.setFromAxisAngle(xAxis, angle);
	
    groundBody1.quaternion.setFromAxisAngle(xAxis2, angle2);
	

//	
//	 groundBody2.quaternion.setFromAxisAngle(xAxis, angle);
	
    // Add the ground body to the cannon world
    world.addBody(groundBody);

	world.addBody(groundBody1);
//	
//	world.addBody(groundBody2);
    // Define parameters for use when configuring the time step for cannon
    // The time step advances the physics simulation forward in time
	
    const fixedTimeStep = 1.0 / 60.0;
    const maxSubSteps = 1;
    const timeInterval = 30;
    let lastTime;

    // Create a time interval loop for cannon
    Time.setInterval(function (time) {
        if (lastTime !== undefined) {
            let dt = (time - lastTime) / 500;

            // Set the step parameters
            world.step(fixedTimeStep, dt, maxSubSteps)

            // Update the position of the sphere in our scene to the position of the cannon sphere body
			
            Ball.transform.x = BallBody.position.x;
			Ball.transform.y = BallBody.position.y;
			Ball.transform.z = BallBody.position.z;
          
			Ball1.transform.x = Ball1Body.position.x;
			Ball1.transform.y = Ball1Body.position.y;
			Ball1.transform.z = Ball1Body.position.z;
			
			Ball2.transform.x = Ball2Body.position.x;
			Ball2.transform.y = Ball2Body.position.y;
			Ball2.transform.z = Ball2Body.position.z;
        }

        lastTime = time
    }, timeInterval);

})(); // Enables async/await in JS [part 2]