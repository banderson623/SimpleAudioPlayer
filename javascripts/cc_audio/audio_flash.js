//= require <cc_audio>
//= require <audio_base>

// With dependency this should not ever happen
if(typeof('CCAudio') == "undefined"){
  var CCAudio = {AudioFlash:null, Audio:null}
}


CCAudio.AudioFlash = Class.create(CCAudio.Audio, {
  klass:          'AudioFlash'
});