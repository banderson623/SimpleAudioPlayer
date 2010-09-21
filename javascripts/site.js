document.observe("dom:loaded", function(){
  mock_slider();
  tagify();
  fake_play();
  fake_player_controls();
  set_play_location();
  
});


// Takes a precedeing or following <label> tag and 
// sets it to the default form value
function form_labelizer(){
  $$('form input','form select', 'form textarea').each(function(el){
    var label = null;
    if(el.previous().tagName == 'LABEL') {
      label = el.previous();
    } else if(el.next().tagName == 'LABEL') {
     // console.log('after');
     label =  el.next();
    }
    if(label != null){
      label.hide();
      el.default_value = label.innerHTML;
      
      var add_default = function(el){if (el.value == ''){  
                                      el.value = el.default_value;
                                      el.addClassName('default');          
                                    }};
                                          
      var remove_default = function(el){
                             if (el.default_value == el.value){  
                               el.value = ''; 
                               el.removeClassName('default');
                             }};
      
      add_default(el);
    }
    
    
    
  });
}

function update_current_time(value){
  $('current_time').update(value.toTimeCode());
  window.state.set('t',Math.round(value));
}


function mock_slider(){
  window.s = new Control.Slider('handle', 'track',{
    range: $R(0,(15.0 * 60.0)),
    increment: 1,
  });
  s.options.onSlide = update_current_time
  s.options.onChange = update_current_time
}

function set_play_location(){
  if(window.state.isSet('t')){
    window.s.setValue(new Number(window.state.get('t')));
  }
}

function  increment_time(){
  s.setValue(1 + s.value);
}

function tagify(){
  $$('#current_tags a', ".tags a").each(function(el){
      el.title = "Show only recordings with the tag: " + el.innerHTML + ".";
  });
}

function fake_play(){
  $$('.recording .controls a.play').each(function(el){
    el.observe('click', function(evnt){
      var delta =  $('player').positionedOffset().top - el.up('div.recording').positionedOffset().top + 25
      
      if(window.pe !== undefined){
        window.pe.stop();
        window.pe = null;
      }
      
      new Effect.Opacity($('player'), {
        to:0,
        duration: 0.15,
      });
      
      $$('.recording').each(function(recording){
         if(recording.getOpacity() < 1.0){
           new Effect.Opacity(recording, {to:100, duration:0.55});
         }
       })
      
      setTimeout(function(){
        s.setValue(0);         
      }, 175);
      start_playing();


      new Effect.Opacity(el.up('div.recording'), {
        to: 0.25,
        duration:0.5,
      });
      
      new Effect.Opacity($('player'), {
        to:100,
        from:0,
        duration: 1,
        delay:0.75
      });
      
      
      evnt.stop();
    });
  });
}

function start_playing(){
  var play_control_el = $('play');
  var pause_control_el = $('pause');
  var playing_indicator_el = $('playing');
  
  window.pe = new PeriodicalExecuter(increment_time, 1);
  play_control_el.hide();
  playing_indicator_el.appear();
  pause_control_el.show();
}

function fake_player_controls(){
  var play_control_el = $('play');
  var pause_control_el = $('pause');
  var playing_indicator_el = $('playing');
  playing_indicator_el.hide();
  pause_control_el.hide();
  
  $('play').observe('click', start_playing);
  
  $('pause').observe('click', function(){
    window.pe.stop();
    play_control_el.show();
    playing_indicator_el.fade({duration:0.25});
    pause_control_el.hide();
  })
  
}


var State = Class.create({
  // representation: new Hash(),
  
  initialize: function(){
    console.log('new');
    this.h = new Hash();
    this._parse();
  },
  
  set: function(key,val){
    this._parse();
    this.h.set(key,val);
    this._writeToLocation();
  },
  
  get: function(key){
    this._parse();
    return this.h.get(key);
  },
  
  isSet: function(key){
    return this.get(key) !== undefined
  },
  
  //private
  
  _writeToLocation: function(){
    document.location.hash = this.h.toQueryString();
  },
  
  _parse: function(){
    document.location.hash.replace(/#|#&/,'').split('&').each(function(keyval){
      keyval = keyval.split('=');
      this.h.set(keyval[0],keyval[1]);
    }.bind(this));
  }
})

var state = new State();