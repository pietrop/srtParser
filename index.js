/**
* got sick of seeing loads of over complicated srt modules on npm that kept breaking because they had loads of dependencies
* so decided to make my own. aiming for simple to the point approach.
* give srt. returns json. but can also return plain text of lines.
*/
var fs = require('fs');
//open srt file into and saves into a string

// console.log(srtFile)

function parseSrtContent(srtFile, cb){
  //TODO: could be refactor to move opening file outside of this function, to that to allow for use case when parsing an srt string. eg Spoken data returns an srt through the API. but not as a file, as a string/
  var srt = fs.readFileSync(srtFile).toString();
  //split srt string into array. where each element it's a line of the srt file.
  var srtArray = srt.split("\n")
  //define regex for recognising components of the srt file. number. timecodes, words in a line, empty space between lines
  //line counter regex
  var oneDigit = /^[0-9]+$/;
  //timecode regex
  // "00:00:06,500 --> 00:00:10,790" there seems to be some cases where the milliseconds have 2 digits
  var twoTimeCodes =  /\d{2}:\d{2}:\d{2},\d{2,3} --> \d{2}:\d{2}:\d{2},\d{2,3}/
  var words = /\w/;

  //setup data structure to save results as as array of line objects.
  var result = []
  // initialise first line object outside of the loop ensure persistency for the different attributes across file lines.
  var lineO = {};
  //iterate over lines array of the srt file. to identify components of srt lines.
  for (var i=0; i< srtArray.length; i++){
    //select new line at every iteration of the loop
    var line = srtArray[i];

    if(oneDigit.test(line)){
      lineO.id = line;

    }else if (twoTimeCodes.test(line)) {
      var timecodes = line.split(" --> ")
      lineO.startTime = timecodes[0]
      lineO.endTime = timecodes[1]

    }else if(words.test(line)){
      //if first line already exists
      if(lineO.text){
          //TODO : these two line breaks could be refactored as optional param libreak true of alse hand having it true by default.
          //`"\n"` adds a line break at the end/after the second one of two consecutive lines belonging to same timecode interval.
          lineO.text +=line+"\n";
          //also save
          result.push(lineO)
          lineO = {}
      //otherwise create/add first line
      }else{
        //`"\n"` adds a line break two consecutive lines belonging to same timecode interval.
          lineO.text =line+"\n";
      }//if else first line

    }//if
  }//for
// console.log(JSON.stringify(result))
  if(cb){cb(result)};

}//parseSrt


function parseSrtToText(srtF, cb){

  parseSrt(srtF, function(res){
    var result = "";
    for(var j=0; j<res.length; j++){
       result +=res[j].text;
     }
    cb(result)
  })
}

//parse srt file to json
module.exports.parseSrtToJson =  parseSrt;

//parses srt file to text string
module.exports.parseSrtToText = parseSrtToText;



//TEST
// var srtFile = './nroman_door_manual_transcription.srt'

// parseSrt(srtFile, function(res){
//   console.log(JSON.stringify(res))
// });

// parseSrtToText(srtFile, function(res){
//   console.log(res)
// });
