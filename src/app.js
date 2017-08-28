///////////////////////////////////////////////////////////////
// Script is modified and developed by SEOKJU LEE @ KAIST /////
// Original code: leapLamp by Xavier Seignard /////////////////
///////////////////////////////////////////////////////////////

// app.js

function median(values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

var five = require('johnny-five'),
    webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437'),
    board = new five.Board(),
    LeapFrame = require('./lib/leapFrame'),
    Joint = require('./lib/joint'),
    frame;
    
var i=0;

thumbarr = []
indexarr = []
middlearr = []
ringarr = []
littlearr = []

board.on('ready', function() {

  var thumb = new Joint({
    // frame.deltaHandFingerThumb.y tracked range
    minPos: 0,
    maxPos: 50,
    pin: 8,
    range: [50,170]
  });
  var index = new Joint({
    // frame.deltaHandFingerIndex.y tracked range
    minPos: 0,
    maxPos: 50,
    pin: 9,
    range: [50,170]
  });
  var middle = new Joint({
    // frame.deltaHandFingerMiddle.y tracked range
    minPos: 0,
    maxPos: 50,
    pin: 10,
    range: [50,170]
  });
  var ring = new Joint({
    // frame.deltaHandFingerRing.y tracked range
    minPos: 0,
    maxPos: 50,
    pin: 11,
    range: [50,170]
  });
  var little = new Joint({
    // frame.deltaHandFingerLittle.y tracked range
    minPos: 0,
    maxPos: 50,
    pin: 12,
    range: [50,170]
  });

  var palm = new Joint({
	// frame.palmNormal.x traccked range
    minPos: -30,
    maxPos: 30,
    pin: 12,
    range: [50,150]
  });


  ws.on('message', function(data, flags) {
    // track only 10frame/s
    if (i%10 == 0) {
      frame = new LeapFrame(data);
      if(frame.valid) {	
        thumbarr.push(frame.deltaHandFingerThumb.y*2.0)
        
        ///
        if (thumbarr.length >= 2){
            sum = 0
            for( var y = 0; y < thumbarr.length; y++ ){
                sum += parseInt( thumbarr[y], 10 ); //don't forget to add the base
            }
            thumb.move(sum/thumbarr.length); //frame.deltaHandFingerThumb.y);	
            thumbarr = [];
            sum = 0
        }
        ////
        
        indexarr.push(frame.deltaHandFingerIndex.y*2.0);
        
        ///
        if (indexarr.length >= 2){
            sum = 0
            for( var y = 0; y < indexarr.length; y++ ){
                sum += parseInt( indexarr[y], 10 ); //don't forget to add the base
            }
            index.move(sum/indexarr.length); //frame.deltaHandFingerThumb.y);	
            indexarr = [];
            sum = 0
        }
        
        ///
        
        middlearr.push(frame.deltaHandFingerMiddle.y*2.0);
        
        if(middlearr.length >= 2){
            sum = 0
            for( var y = 0; y < middlearr.length; y++ ){
                sum += parseInt( middlearr[y], 10 ); //don't forget to add the base
            }
            middle.move(sum/middlearr.length); //frame.deltaHandFingerThumb.y);	
            middlearr = [];
            sum = 0
        }
        
		ringarr.push(-frame.deltaHandFingerRing.y*2.0+0.01*frame.deltaHandFingerRing.y)
		if(ringarr.length >= 2){
            sum = 0
            ring.move(median(ringarr));
            ringarr = [];
            sum = 0
        }
		
		littlearr.push(frame.deltaHandFingerLittle.y*2.0);
		if(littlearr.length >= 2){
            sum = 0
            little.move(median(littlearr));
            littlearr = [];
            sum = 0
        }

		//palm.move(frame.palmNormal.x * 50);		//angle normalization
      }
      i=0;
    }
  });
  
});
