Number.prototype.toDecimalPrecision = function(number_of_decimal_places) {
  var components = ("" + this).split('.')
  if (components[0] == undefined) components[0] = "0";
  if (components[1] == undefined) components[1] = "0";
  return components[0] + '.' + components[1].substr(0,number_of_decimal_places)
} 


Number.prototype.toTimeCode = function(){
  minutes = Math.floor(this/60.0);
  seconds = Math.round(this - (minutes * 60.0));
  if(seconds == 60) {
    minutes+=1;
    seconds = 0;
  }
  if((""+seconds).length == 1) seconds = "0"+seconds;
  return minutes + ":" + seconds;
  
}


document.observe("dom:loaded", function(){
  form_labelizer();
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
      el.observe('focus', function(){remove_default(this)});
      el.observe('blur',  function(){add_default(this);});
      el.observe('keydown', function(){do_search(this)});
      el.observe('keyup', function(){do_search(this)});
    }
    
    
    
  });
}

function do_search(field){
  // console.log("Field value '" + field.value + "'");
  
  var searchable = $$('div.recording .searchable');
  var recordings = $$('div.recording');
  var showing = [];
  // var searching = field.value.toLowerCase().split(' ');
  var search_string = field.value.toLowerCase();
  
  if(field.value.length <= 0){
    $$('div.recording').invoke('show');
  } else {
    
    // searching.each(function(search_string){
      // console.log('searching for ' + search_string);
      searchable.each(function(el){
        //console.log("searching in " + el.tagName + " contents: " + el.innerHTML);
        if(el.innerHTML.toLowerCase().include(search_string)){
          showing.push(el.up('div.recording'));
        }
      });  
    // });
    recordings.each(function(el){
      if(!showing.include(el)){el.hide();}
    });
  }
}


function update_current_time(value){
  $('current_time').update(value.toTimeCode());
  window.state.set('t',Math.round(value));
}


function mock_slider(){
  window.s = new Control.Slider('handle', 'track',{
    range: $R(0,(15.0 * 60.0)),
    increment: 1,
    // maximum: (15*60) - 100,
  });
  // s.options.maximum = 15 * 60;
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