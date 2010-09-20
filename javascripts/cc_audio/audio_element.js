//= require <cc_audio>
//= require <audio_base>

// With dependency this should not ever happen
if(typeof('CCAudio') == "undefined"){
  var CCAudio = {AudioElement:null, Audio:null}
}


CCAudio.AudioElement = Class.create(CCAudio.Audio, {
  klass:          'AudioElement',
  
  doSetup: function(){
    
    this.can_play = false;
    document.observe('audio:dom:loaded', function(){
      this.constructAudioElement();
      
      this.audio_dom.observe('canplay', function(){
        this.can_play = true;
        this.enableControls();
        document.fire('audio:state:playable', "Can start playing with " + this.percent_loaded.toDecimalPrecision(1) + "% is loaded");
        this.updateAvailable("Can start playing with " + this.percent_loaded.toDecimalPrecision(1) + "% is loaded");
      }.bind(this));
      
      this.audio_dom.observe('progress', function(e){
        var audio = Event.element(e);
        this.percent_loaded = (audio.buffered.end(0) / audio.duration);
        this.updateAvailable('new load data')
        if(this.percent_loaded >= 1.0){
          this.setState('loaded');
        } 
      }.bind(this));
    }.bind(this));
  },
  
  constructAudioElement: function(){
    this.audio_dom = new Element('audio',{"type":"audio/mp3;"});
    this.audio_container_dom.update(this.audio_dom);
  },
  
  doPlay: function(){
    this.audio_dom.play();
  },
  
  doPause: function(){
    this.audio_dom.pause();
  },
  
  doLoad: function(){
    this.audio_dom.load();
  },
  
  doSeekTo: function(time){
    this.audio_dom.currentTime = time;
    CCAudio.debug("Changing current time to " + this.audio_dom.currentTime);
  },
  
  doGetAt: function(){
    return this.audio_dom.currentTime;
  },
  
  doGetDuration: function(){
    return this.audio_dom.duration;
  },
  
  // Responsible for changing the source of the element url
  doSetSource: function(url){
    this.setState('uninitialized');
    this.doSetup();
    this.audio_dom.src = url;
  }
  
});