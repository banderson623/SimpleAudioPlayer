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

CCAudio.AudioPlayerUI = Class.create({
  time_element:           null,
  time_element_observed:  false,
  
  track_control:          null,

  track_element:          null,
  handle_element:         null,
  track_element_observed: false,
  
  total_time_element:     null,
  track_control_updatable:true,
  can_update_time:        true,
  
  play_pause_element:      null,
  play_pause_element_observed: false,
  
  // This will hold the current and loaded
  // length.
  total_length:   0,
  loaded_length:  0,
    
  markers:              [],
  
  class_playing: 'state_playing',
  class_paused:  'state_paused',

  initialize:function(opts){
    opts = opts || new Object;
    this.time_element =       $(opts['time']) ||    ($(opts.time_element) || null);
    this.track_element =      $(opts.track) ||      ($(opts.track_element) || null);
    this.handle_element =     $(opts.handle) ||     ($(opts.handle_element) || null);
    
    this.play_pause_element = $(opts.play_pause) || ($(opts.play_pause_element) || null);
    // this.audio_engine =       $(opts.audio) ||      ($(opts.audio_engine) || null);
    
    this.total_time_element = $(opts.total_time) || ($(opts.total_time_element) || null);
    
    this.attachPlayPauseObservers();
    this.attachTimeElementObserver();
    // this.attachTrackObservers();
    this.attachLoadingObservers();
    this.attachTotalTimeObserver();  
  },
    
  setTimeElement: function(el){
    this.time_element = $(el) || null;
    this.attachTimeElementObserver();
  },

  attachTrackObservers: function(){
    if(this.handle_element != null && typeof(this.handle_element) != "undefined" &&
       this.track_element != null && typeof(this.track_element) != "undefined" )
       {  

          this.track_control = new Control.Slider(this.handle_element, this.track_element,{
            range: $R(0,(this.total_length)),
            increment: 0.1,
          });
          this.handle_element.observe('mouseup',function(e){
          // this.track_control.options.onSlide = (function(e){
            console.log('changed to', this.track_control.value,e)
            document.fire(CCAudio.Events.SEEK_TO,this.track_control.value);
            this.track_control_updatable = true;
            this.can_update_time = true;
          }.bind(this));

          // this.handle_element.observe('mouseover',function(e){
          //   this.track_control_updatable = false;
          // }.bind(this));

          this.handle_element.observe('mousedown',function(e){
            // When dragging this thing around lets update the time too
            this.track_control_updatable = false;
            // Request pause here...
          }.bind(this));
          
          
          // this.handle_element.observe('mousemove',function(e){
          //   this.time_element.update(parseInt(this.track_control.value).toTimeCode());
          //   console.log("trying to update to ",this.track_control.value, parseInt(this.track_control.value).toTimeCode())
          //   this.can_update_time = false;
          // }.bind(this));

          // this.handle_element.observe('mouseout',function(e){
          //   this.track_control_updatable = true;
          // }.bind(this));
          


          document.observe(CCAudio.Events.UI_TIME_UPDATE, function(e){
            if(this.track_control_updatable){
              this.track_control.setValue(parseFloat(e.memo));
            }
           }.bind(this));
                      
       }
  },

  attachLoadingObservers: function(){
    document.observe(CCAudio.Events.UPDATE_AVAILABLE_SECONDS, function(e){
      this.loaded_length = parseInt(e.memo);
      // CCAudio.debug(this.loaded_length +  " seconds available");
    }.bind(this));
    document.observe(CCAudio.Events.UPDATE_TOTAL_SECONDS, function(e){
      this.total_length = parseInt(e.memo);
      // CCAudio.debug(this.total_length + " total seconds");
      this.attachTrackObservers();
    }.bind(this));    
  },
  
  // Connect play/pause element to fire custom events.
  attachPlayPauseObservers: function(){
    if(!this.play_pause_element_observed && 
       this.play_pause_element != null && 
       typeof(this.play_pause_element) != "undefined"){
        this.play_pause_element.observe('click', function(e){
          document.fire(CCAudio.Events.TOGGLE);
          e.stop();
        })
                
        document.observe(CCAudio.Events.STATE_PAUSED, function(e){
          this.play_pause_element.removeClassName(this.class_playing);
          this.play_pause_element.addClassName(this.class_paused);
          
        }.bind(this));

        document.observe(CCAudio.Events.STATE_PLAYING, function(e){
          this.play_pause_element.addClassName(this.class_playing);
          this.play_pause_element.removeClassName(this.class_paused);
        }.bind(this));

        this.play_pause_element_observed = true;
    }
  },
  
  attachTimeElementObserver: function(){
    
    if(!this.time_element_observed && this.time_element != null &&  typeof(this.time_element) != "undefined"){
         document.observe(CCAudio.Events.UI_TIME_UPDATE, function(e){
           if(parseInt(e.memo) > 0 && this.can_update_time){
             this.time_element.update(parseInt(e.memo).toTimeCode());
           }
         }.bind(this));
            
         this.time_element_observed = true;
    }
  },
  
  attachTotalTimeObserver: function(){
    if(this.total_time_element != null &&  typeof(this.total_time_element) != "undefined"){
      document.observe(CCAudio.Events.UPDATE_TOTAL_SECONDS, function(e){
        var minutes = Math.round(this.total_length / 60);
        
        this.total_time_element.update(minutes + " Minute" + (minutes != 1 ? "s" : ""));
      }.bind(this));      
    }
  }
  
});
