// Load in the required modules, including the Cannon.js script package
const Scene = require('Scene');
const Time = require('Time')
const CANNON = require('cannon');
const Patches = require('Patches');
const TouchGestures = require('TouchGestures');
const Materials = require('Materials');
const Reactive = require('Reactive');
const D = require('Diagnostics');
const { deflate } = require('zlib');
const DiagnosticsModule = require('Diagnostics');
const { lookAt } = require('Reactive');




const Sphere = 'lookAtSphere';
const pivotSphere = 'pivot';
const targetName = 'Camera';





(async function () {  // Enables async/await in JS [part 1]

    // Reference Sphere object from Scene
    const sphere = await Scene.root.findFirst('Sphere');
    const cube = await Scene.root.findFirst('Cube')
    const camera = await Scene.root.findFirst('Camera');
    const tracker = await Scene.root.findFirst('planeTracker0');


        camera.worldTransform.position.pinLastValue();

    // Get The camera world Space Position
    const cameraPositionSignal = tracker.worldTransform.inverse().applyToPoint(camera.worldTransform.position);
    
    //Apply The rotation of the realtive transform between plateTracker0 and Camera world position
    sphere.transform.rotation = tracker.transform.lookAt(cameraPositionSignal).rotation;

    D.log( camera.worldTransform.position.pinLastValue());



    // Create a cannon world
    const world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.iterations = 10;

    // Set the gravity parameters of the cannon world
    // A value of -9.8 in the y axis approximately simulates real world gravity
    world.gravity.set(0, -9.8, 0);


    //Parameters for Contact between Objects
    const contactCube = new CANNON.Material();
    const contactSphere = new CANNON.Material()
    const contactGround = new CANNON.Material();


    
   const matContact = new CANNON.ContactMaterial(contactCube,contactSphere,   {
       friction : 1,
       restitution : 1,
       contactEquationStiffness: 1e8,
       contactEquationRelaxation: 3
    
    });



       world.addContactMaterial(matContact);


    //add World Contact Material
    const groundContact = new CANNON.ContactMaterial(contactGround, contactGround, {
        friction: 0.5,
        restitution : 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation:3,
        frictionEquationStiffness: 1e8,
        frictionEquationRelaxaction:3,

    }) 


     world.addContactMaterial(groundContact);

    // Define a set of properties for the sphere
    const radius = 1;
    const sphereProps = {
        mass: 100,
        position: new CANNON.Vec3(0, -5, 0),
        radius: radius,
        shape: new CANNON.Sphere(radius),
        velocity : new CANNON.Vec3(0 , 0, 0),
        material: contactSphere,
    }

    // Create a new body for the sphere with the previously defined set of properties
    const sphereBody = new CANNON.Body(sphereProps);

    // Add the sphere body to the cannon world
    world.addBody(sphereBody);


//Cube Properties
const cubeProp = {

    mass : 50,
    position : new CANNON.Vec3(0, 0, -3),
    shape : new CANNON.Box(new CANNON.Vec3(.2 ,.2,.2)),
    velocity : new CANNON.Vec3(0,0,0),
    material : contactCube,

}
const cubeBody = new CANNON.Body(cubeProp);    

//Add Cube to Cannon World
world.addBody(cubeBody);



   // find camera 
      //  const lookAtTransform = camera.transform.lookAt(sphereBody.transform);
      //  const lookAtRotation =  lookAtTransform.rotation;
        // create speed variable 

  //   D.watch("lookAt", lookAtRotation.x);




    //const camera = await Scene.root.findFirst("Camera");
    function moveBall() {

        // create speed variable 
        const speed = 5; 

        const localFoward = new CANNON.Vec3(0, 0, -.01); // get camera forward vector (direction the camera is facing)
        const worldForward = sphereProps.position;
        sphereBody.applyLocalForce(localFoward, worldForward);
        sphereBody.velocity = new CANNON.Vec3(0, 0, -5); // camera forward vector * 
        D.log("moving ball!");
     //   D.watch("lookAt", lookAtRotation.x);
    };


function moveCube() {
const speed = 5; 

        const localFoward = new CANNON.Vec3(0, 0, -.01); // get camera forward vector (direction the camera is facing)
        const worldForward = sphereProps.position;
        cubeBody.applyLocalForce(localFoward, worldForward);
        cubeBody.velocity = new CANNON.Vec3(0, 0, -5); // camera forward vector * 
      //  D.log("moving ball!");
};


    // Create a new body for the ground with the previously defined set of properties


        // Define a set of properties for the ground
        const groundProps = {
            mass: 0,
            position: new CANNON.Vec3(0, 0, 0),
            shape: new CANNON.Plane(),
            material : contactGround
        }
    
     const groundBody = new CANNON.Body(groundProps);
    // const groundShape = new CANNON.Plane();
    // groundBody.addShape(groundShape);

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

            //Cube position
            cube.transform.x = cubeBody.position.x;
            cube.transform.y = cubeBody.position.y;
            cube.transform.z = cubeBody.position.z;


            // Update the position of the sphere in our scene to the position of the cannon sphere body
            sphere.transform.x = sphereBody.position.x;
            sphere.transform.y = sphereBody.position.y;
            sphere.transform.z = sphereBody.position.z;
        }

        lastTime = time
    }, timeInterval);



//Throw Ball Gesture
TouchGestures.onTap(sphere).subscribe((gesture) => {
    moveBall();
//D.log('throw ball');
});





//Push Cube Gesture
TouchGestures.onTap(cube).subscribe((gesture) => {
    moveCube();
D.log('push cube');
});










})(); // Enables async/await in JS [part 2]