//= require <cc_audio>
//= require <audio_base>

// With dependency this should not ever happen
if(typeof('CCAudio') == "undefined"){
  var CCAudio = {AudioPlayer:null}
}

// This controls all the user interface components involved with the
// player component
//
// UI Elements: Timecode
//              Current Position (progress)
//              Markers
//              Play/Pause

CCAudio.AudioPlayer = Class.create({  
  initialize:function(){
    
  }
});