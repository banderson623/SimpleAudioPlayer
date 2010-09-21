//= require <cc_audio>
//= require <prototype>

// With dependency this should not ever happen
if(typeof('CCAudio') == "undefined"){
  var CCAudio = {Audio:null}
}

CCAudio.Audio = Class.create({
    klass:          'AudioBase',
  
    states:         ['uninitialized','initialized','loading','paused','playing'],
    duration:       null,
    state:          null,
    percent_loaded: 0.0,
    audio_dom:      null,
    audio_container_dom: null,  
    
    periodic_ui_updater: null,
    
    // this gets changed when enough data is loaded to play
    // the audio
    can_play:       false,

    // Interface ----------------------
    doLoad:   function(){  CCAudio.debug("doLoad() implement this in " + this.getAudioClass());},
    doPlay:   function(){  CCAudio.debug("doPlay() implement this in " + this.getAudioClass());},
    doPause:  function(){  CCAudio.debug("doPause() implement this in " + this.getAudioClass());},
    doSeekTo: function(v){ CCAudio.debug("doSeekTo("+v+") implement this in " + this.getAudioClass());},

    doSetSource: function(){ CCAudio.debug("doSetSource() implement this in " + this.getAudioClass());},
    
    doGetAt:  function(){ CCAudio.debug("doGetAt() implement this in " + this.getAudioClass());},
    // doGetAt:  function(){ CCAudio.debug("doGetAt() implement this in " + this.getAudioClass());},
    
    doGetDuration: function(){CCAudio.debug("doGetDuration() implement this in " + this.getAudioClass());},
    doSetup:  function(){},

    // Final ----------------------------------

    initialize: function(audio_container_dom) {
      document.observe(CCAudio.Events.STATE_CHANGE, function(e){
        CCAudio.debug("Caught State Change: " + e.eventName + " >> ("+ e.memo + ")");
      });
      
      document.observe(CCAudio.Events.PLAY,function(){this.play();}.bind(this));
      document.observe(CCAudio.Events.PAUSE,function(){this.pause();}.bind(this));
      document.observe(CCAudio.Events.TOGGLE,function(){this.playOrPause();}.bind(this));
      document.observe(CCAudio.Events.SET_SOURCE,function(e){this.setSource(e.memo);}.bind(this));
      document.observe(CCAudio.Events.SEEK_RELATIVE,function(e){this.seekRelative(e.memo);}.bind(this));
      document.observe(CCAudio.Events.SEEK_TO,function(e){this.seekTo(e.memo);}.bind(this));
      this.disableControls();
      this.setState('uninitialized');
      // Initialize here
      this.audio_container_dom = audio_container_dom;
      
      this.doSetup();
      
      // Once this fires its really done
      document.observe('dom:loaded', function(){
        this.audio_container_dom = $(this.audio_container_dom);
        document.fire('audio:dom:loaded');
        this.setState('initialized');
      }.bind(this));
    },
    
    // When its time to swap out the audio for a different source...
    setSource: function(url){
      var was_playing = false;
      this.disableControls();

      if(this.isPlaying()){
        was_playing = true;
        this.pause();
      }
      CCAudio.debug("Changing source to: " + url);
      this.doSetSource(url);
      this.load();
      
      if(was_playing){
        // If it was playing wait for a playable state then play it.
        document.observe('audio:state:playable', function(){
          this.play();
        }.bind(this));
      }
    },
    
    getAudioClass: function(){
      return this.klass;
    },
    
    load: function(){
      if(this.setState('loading')){
        this.doLoad();
      }
    },
    
    // Starts Playing
    play: function() {
      if(this.setState('playing') && this.isPlayable()){
        document.fire('audio:state:start_playing');
      }
      this.doPlay();
    },
        
    // Stops Playing
    pause: function() {
      if(this.setState('paused')){
        document.fire('audio:state:stop_playing');
        this.doPause();
      }
    },
    
    // Toggles between play and pause
    playOrPause: function(){
      if(this.isPlaying()){
        this.pause();
      } else {
        this.play();
      }
    },
    
    getPercentLoaded: function(){
      return this.percent_loaded * 100;
    },
    
    getSecondsLoaded: function(){
      if(this.getDuration() == NaN){
        
      }
      return parseInt(this.percent_loaded * this.doGetDuration());
    },
    
    getPercentAt: function(){
      if(this.getDuration() == 0 || this.getAt() <= 0){
        return 0;
      } else {
        // console.log(this.getAt(), this.getDuration());
        return this.getAt() / this.getDuration();
      }
    },
    
    getAt: function() {
      if(this.getStateIs('playing') || this.getStateIs('paused')){
        return this.doGetAt();
      } else {
        return 0;
      }
    },
    
    getDuration: function(){
      return this.doGetDuration();
    },
    
    
    isPlayable: function(){
      return this.can_play;
    },
    
    isLoaded: function(){
      return this.percent_loaded >= 1.0;
    },
    
    isPlaying: function(){
      return this.getStateIs('playing');
    },
    
    getState: function(){
      return this.state;
    },
    
    getStateIs: function(some_state){
      return this.getState() == some_state;
    },
    
    seekTo: function(to_seconds){
      this.doSeekTo(to_seconds);
      this.updateAvailable("Seeked!");
    },
    
    seekRelative: function(relative_seconds){
      var time = parseInt(this.getAt()) + parseInt(relative_seconds);
      // if requesting negative time, just make it zero;
      return this.seekTo(time >= 0 ? time : 0);
    },
    
    setState: function(state){
      if(state != this.getState()){
        var previous_state = this.state;
        document.fire("audio:state:leaving:"+this.state);
        this.state = state;
        document.fire("audio:state:entering:"+this.state, "from " + previous_state);
        document.fire("audio:state:"+this.state);
        document.fire(CCAudio.Events.STATE_CHANGE, this.state);
        // console.log("fired -> " + "audio:state:"+this.state);
        this.updateAvailable("State changed to " + this.state);
        return true;
      }
      return false;
    },
    
    // Call this to generate an event that lets everyone know
    // UI might need to be refreshed...
    updateAvailable:function(reason){
      document.fire(CCAudio.Events.UI_UPDATABLE, reason);
      // Want to update the time as often as we can.
      document.fire(CCAudio.Events.UI_TIME_UPDATE, this.getAt());
    },
    
    disableControls: function(reason){
      document.fire('audio:ui:controls:disable',reason);
      this.updateAvailable();
    },
    
    enableControls: function(reason){
      document.fire('audio:ui:controls:enable',reason);
      this.updateAvailable();
    },
    
    // Time updater
    enableTimedUIUpdates: function(){
      this.periodic_ui_updater = new PeriodicalExecuter(function(pe) {
        if(this.isPlaying()){
          document.fire(CCAudio.Events.UI_TIME_UPDATE, this.getAt());
        }
      }.bind(this), 0.5);
      
    }
            
});
