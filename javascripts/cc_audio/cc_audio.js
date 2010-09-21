// The basic CCAudio base class,
// this is all name spaced
var CCAudio = {
  Audio: {},
  Player: {},
  Transport: {},
  Dom: {},
  Tests: {},
  
  Events: {
    PLAY:            'audio:request:play',
    PAUSE:           'audio:request:pause',
    TOGGLE:          'audio:request:toggle',
    SET_SOURCE:      'audio:request:source',
    SEEK_RELATIVE:   'audio:request:seekRelative',
    SEEK_TO:         'audio:request:seekTo',
    
    STATE_CHANGE:     'audio:state:change',
    STATE_PLAYING:    'audio:state:playing',
    STATE_PAUSED:     'audio:state:paused',
    
    UI_UPDATABLE:     'audio:ui:update',
    UI_TIME_UPDATE:   'audio:ui:time_update',
    
    UPDATE_TOTAL_SECONDS:     'audio:update:total_seconds',
    UPDATE_AVAILABLE_SECONDS: 'audio:update:available_seconds',
  },
  
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