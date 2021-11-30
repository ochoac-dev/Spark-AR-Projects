const Scene = require('Scene');
const Materials = require('Materials');
const Time = require ('Time');
const Objects = require('Objects');
const Animation = require('Animation');
const Patches = require ('Patches');
const Textures = require('Textures');


const FaceTracking = require('FaceTracking');



(async function () {  // Enables async/await in JS [part 1]
const Eyeball = Scene.root.find('Eyeball');
const Eyeball0 = Scene.root.find('Eyeball0');
                            
//Create Driver (Time & Value)
//const parameters = {
//durationMilliseconds : 100,
//loopcount: Infinity,
//mirror: true


//};
//const Eyedriver = Animation.timeDriver(parameters);
//driver.start();


//sampler example
//const Eyesampler = Animation.samplers.eachInBounce(1.0,1.2);

//create animation (Combine Driver + sampler)
//const Animation = Animation.animate(Eyedriver,Eyesampler);

// Apply Animation
//object.transform.scaleX = animation;
//object.tansform.scaleY = animation;
//object.transform.scaleZ = animation;


    
const EyeRight = await Scene.root.find('EyeRight');
const EyeLeft = await Scene.root.find('EyeLeft');
    
const face = FaceTracking.face(0);

   // const Eye = await Scene.root.find(Eyeball);
    //const Eyeb = await Scene.root.find(Eyeball0);

const mouthOpenness = FaceTracking.face(0).mouth.openenness;
    
const mouthOpennessDriver = Animation.valueDriver(mouthOpenness,0.1, 0.5);

const linearSampler = Animation.samplers.linear(0,2.0);
const scaleAnimation = Animation.animate(mouthOpennessDriver,linearSampler);

EyeRight.transform.scaleX = animation;
EyeRight.tansform.scaleY = animation;
EyeRight.transform.scaleZ = animation;

//Eyeball0.transform.scaleX = animation;
//Eyeball0.tansform.scaleY = animation;
//Eyeball0.transform.scaleZ = animation;

//driver.start();

})(); // Enables async/await in JS [part 2]