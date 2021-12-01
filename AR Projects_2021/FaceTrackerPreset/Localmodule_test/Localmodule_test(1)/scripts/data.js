//==========================================================================
// The following example demonstrates how to detect the device language and
// log a greeting in that language.
//==========================================================================
 
// Load in the required modules
const Diagnostics = require('Diagnostics');
const Locale = require('Locale');
const Materials = require('Materials');
const Scene = require('Scene');
const Textures = require('Textures');
const Animation = require('Animation');
const Plane = require ('Plane')
const Patches = require('Patches');

// Subscribe to the 'language' signal and log its value
Locale.language.monitor({ fireOnInitialValue: true }).subscribe(function(e) {
    Diagnostics.log("My language is '" + e.newValue + "'.");
    
var  locale = "ES";
var locale = "US";
var locale = "FR";
});




// Subscribe to the 'region' signal, and log its value
Locale.region.monitor({ fireOnInitialValue: true }).subscribe(function(e) {
    Diagnostics.log("My region is '" + e.newValue + "'.");
});


// Use a set of conditionals to determine which ISO 639-1 language identifier
// is returned and log a greeting in the correct language

// If device language is English, log 'Hello'
Locale.language.eq("en").onOn({
  fireOnInitialValue: true
}).subscribe(function(_) {
  Diagnostics.log("Hello");
   });



// If device language is Spanish, log 'Hola'
Locale.language.eq("es").onOn({
  fireOnInitialValue: true
}).subscribe(function(_) {
  Diagnostics.log("Hola");
});

// If device language is French, log 'Bonjour'
Locale.language.eq("fr").onOn({
  fireOnInitialValue: true
}).subscribe(function(_) {
  Diagnostics.log("Bonjour");
});

Locale.language.eq("in").onOn({
  fireOnInitialValue: true
}).subscribe(function(_) {
  Diagnostics.log("namaskaar");
});


// If device language is Russian, log 'Zdravstvuyte'
Locale.language.eq("zh").onOn({
  fireOnInitialValue: true
}).subscribe(function(_) {
  Diagnostics.log("Nín hǎo");
});



{

   (async function() { 
        
    
var plane = await Scene.root.findFirst('ES');

var plane = await Scene.root.findFirst('EN');
       
var plane = await Scene.root.findFirst('FR');
       
    
    switch(Locale() .getLocale){
            
        case  "ES"  :
          Materials.root.findFirst.Textures = "spanish";
            
            break;
            
        case "US" : 
            Materials.root.findFirst.Textures = "english";
            
            break;
            
        case "FR" :
            
            Materials.root.findFirst.Textures = "french";
          }})
    


   }
        



    
            
    

