// Load in the required modules, including the Cannon.js script package
const Scene = require('Scene');
const Time = require('Time')
const CANNON = require('cannon');

(async function () {  // Enables async/await in JS [part 1]

    // Reference Sphere object from Scene
    const sphere = await Scene.root.findFirst('dice_20');

    // Create a cannon world
    const world = new CANNON.World();

    // Set the gravity parameters of the cannon world
    // A value of -9.8 in the y axis approximately simulates real world gravity
    world.gravity.set(0, -9.8, 0);

    // Define a set of properties for the sphere
    const radius = 1;
    const sphereProps = {
        mass: 1,
        position: new CANNON.Vec3(0, 20, 0),
        radius: radius,
        shape: new CANNON.Sphere(radius),
    }

    // Create a new body for the sphere with the previously defined set of properties
    const sphereBody = new CANNON.Body(sphereProps);

    // Add the sphere body to the cannon world
    world.addBody(sphereBody);

    // Define a set of properties for the ground
    const groundProps = {
        mass: 0,
        position: new CANNON.Vec3(0, -sphereProps.radius, 0),
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

    // Define parameters for use when configuring the time step for cannon
    // The time step advances the physics simulation forward in time
    const fixedTimeStep = 1.0 / 60.0;
    const maxSubSteps = 3;
    const timeInterval = 30;
    let lastTime;

    // Create a time interval loop for cannon
    Time.setInterval(function (time) {
        if (lastTime !== undefined) {
            let dt = (time - lastTime) / 500;

            // Set the step parameters
            world.step(fixedTimeStep, dt, maxSubSteps)

            // Update the position of the sphere in our scene to the position of the cannon sphere body
            sphere.transform.x = sphereBody.position.x;
            sphere.transform.y = sphereBody.position.y;
            sphere.transform.z = sphereBody.position.z;
        }

        lastTime = time
    }, timeInterval);

})(); // Enables async/await in JS [part 2]