//= require <cc_audio>
//= require <audio_base>

// With dependency this should not ever happen
if(typeof('CCAudio') == "undefined"){
  var CCAudio = {AudioFlash:null, Audio:null}
}


CCAudio.AudioFlash = Class.create(CCAudio.Audio, {
  klass:          'AudioFlash',
  PATH_TO_SWF:    'javascripts/vendor/niftyplaer.swf',
  
  doSetup: function(){
    
    this.can_play = false;
    document.observe('audio:dom:loaded', function(){
      this.constructFlashElement();
      // 
      // this.audio_dom.observe('canplay', function(){
      //   this.can_play = true;
      //   this.enableControls();
      //   document.fire('audio:state:playable', "Can start playing with " + this.percent_loaded.toDecimalPrecision(1) + "% is loaded");
      //   this.updateAvailable("Can start playing with " + this.percent_loaded.toDecimalPrecision(1) + "% is loaded");
      // }.bind(this));
      // 
      // this.audio_dom.observe('progress', function(e){
      //   document.fire(CCAudio.Events.UPDATE_TOTAL_SECONDS, this.doGetDuration());
      //   
      //   var audio = Event.element(e);
      //   this.percent_loaded = (audio.buffered.end(0) / audio.duration);
      //   this.updateAvailable('new load data')
      //   document.fire(CCAudio.Events.UPDATE_AVAILABLE_SECONDS, audio.buffered.end(0));
      //   if(this.percent_loaded >= 1.0){
      //     this.setState('loaded');
      //     document.fire(CCAudio.Events.UPDATE_TOTAL_SECONDS, this.doGetDuration());
      //   } 
      // }.bind(this));
    }.bind(this));
  },
  
  constructFlashElement: function(){
    
  }
});