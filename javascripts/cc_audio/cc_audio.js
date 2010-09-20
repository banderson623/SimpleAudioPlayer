// The basic CCAudio base class,
// this is all name spaced
var CCAudio = {
  Audio: {},
  Player: {},
  Transport: {},
  Dom: {},
  Tests: {},
  
  debug: function(text){
    if(typeof('console') != 'undefined' && console != null &&
       typeof('console.log') != 'undefined' && console.log != null){
         console.log(text);
       }
  }
};


// Basic set of tests to use in sniffing out browser capabilities
CCAudio.Tests = {
  
  canUseAudioElement: function(){
    return this.canPlayType('audio/mpeg');
  },
  
  supportsAudioElement: function(){
    return !!(document.createElement('audio').canPlayType);
  },
  
  // applicable mime_types are audio/ogg or audio/mpeg or audio/wav
  canPlayType: function(mime_type){
    if(this.supportsAudioElement()){
      var audioElement = document.createElement('audio');
      var result = ("no" != audioElement.canPlayType(mime_type)) && ("" != audioElement.canPlayType(mime_type));
      return result;
    } else {
      return false;
    }
  }
}