Number.prototype.toDecimalPrecision = function(number_of_decimal_places) {
  var components = ("" + this).split('.')
  if (components[0] == undefined) components[0] = "0";
  if (components[1] == undefined) components[1] = "0";
  return components[0] + '.' + components[1].substr(0,number_of_decimal_places)
} 


Number.prototype.toTimeCode = function(){
  minutes = Math.floor(this/60.0);
  seconds = Math.round(this - (minutes * 60.0));
  
  hours = Math.floor(minutes/60.0);
  minutes = minutes - (hours * 60);

  if(seconds == 60) {
    minutes+=1;
    seconds = 0;
  }
  
  if(minutes == 60) {
    hours+=1;
    minutes = 0;
  }
  
  
  if(this == NaN || seconds==NaN){ seconds = 0;}
  if(this == NaN || minutes==NaN){ minutes = 0;}
  
  if((""+seconds).length == 1) seconds = "0"+seconds;
  if((""+minutes).length == 1) minutes = "0"+minutes;
  if((""+hours).length == 1)   hours = "0"+hours;
  if(parseInt(hours) > 0){
    return hours + ":" + minutes + ":" + seconds;
  }else{
    return minutes + ":" + seconds;
  }
  
}
