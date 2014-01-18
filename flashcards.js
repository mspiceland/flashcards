var topNumber;
var bottomNumber;
var answer;
var finaltranscript;
var recognition;
var is_recognizing = false;
var starttime;
var timer;
var questions = 0;
var totalTime = 0;

$(document).ready(function onPageLoad() {

	console.log('page loaded');

	$('#nextButton').click(next);

	// set up speech recognition
	if (!('webkitSpeechRecognition' in window)) {
		upgrade();
	} else {
		recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onstart = function() { console.log('onstart');};
		recognition.onresult = function(event) { 
			if (is_recognizing === false)
				return;

			var interim_transcript = '';

			for (var i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					final_transcript += event.results[i][0].transcript;
				} else {
					interim_transcript += event.results[i][0].transcript;
				}
			}
			interim_transcript = replaceEquivalents(interim_transcript);
			final_transcript = capitalize(final_transcript);
			//final_span.innerHTML = linebreak(final_transcript);
			//interim_span.innerHTML = linebreak(interim_transcript);
			console.log(linebreak(interim_transcript));

			// check for the right answer
			if (answer == interim_transcript) {
				console.log('correct!');
				$('#resultMessage').removeClass().html('Correct!').addClass('green').addClass('bigNumber');
				stopRec();
				var soFar = (Date.now() - starttime)/1000;
				totalTime = totalTime + soFar;
				questions = questions + 1;
				var average = totalTime / questions;
				console.log(totalTime);
				console.log(questions);
				console.log('average ' + average);
				$('#questionsAnswered').html(questions);
				$('#averageTime').html(average.toFixed(1) + ' seconds');
				setTimeout(function() {
					$('#resultMessage').removeClass().html('');
					next();
				}, 3000);
			} else {
				$('#resultMessage').removeClass().html('Try Again (' + interim_transcript + ')').addClass('red').addClass('bigNumber');
			}
		};
		recognition.onerror = function(event) {
			console.log(event);
			$('#timer').html(event.error);
			if (event.error === 'no-speech') {
				//startRec();
			}
		};
		recognition.onend = function() { 
			console.log('onend');
			stopRec();
			//setTimeout(startRec, 500); <- inf loop
		};
	}
});

function runTimer() {
	var soFar = ((Date.now() - starttime)/1000).toFixed(1);	
	$('#timer').html(soFar + ' seconds');
}

function stopRec() {
	is_recognizing = false;
	clearInterval(timer);
	$('#nextButton').html(' Start ');
	recognition.stop();
}

function startRec() {
	// trigger voice transcript
	final_transcript = '';
  recognition.lang = 'en-US';
  is_recognizing = true;
	$('#nextButton').html(' Stop ');
  recognition.start();
  $('#flashcard').show();
}

function startTimer() {
	// start our timer
	starttime = Date.now();
	timer = setInterval(runTimer, 100);
}

function next() {
	console.log('next');
	if (is_recognizing) {
		stopRec();
		return;
	}
	topNumber = getRandomNumber(10);
	bottomNumber = getRandomNumber(10);
	answer = topNumber * bottomNumber;
	console.log('answer is ' + answer);
	$('#topNumber').html(topNumber);
	$('#bottomNumber').html(bottomNumber);

	startRec();
	startTimer();
}

function getRandomNumber(max) {
	return Math.floor((Math.random()*max)+1);	
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

var equivMap = {
	'att': '8',
	'for': '4',
	'A': '8',
	'sex': '6'
};
function replaceEquivalents(s) {
	s = s.replace(/\s+/g, ''); // strip whitespace
	Object.keys(equivMap).forEach(function(key) {
		//console.log('checking if |' + s + '| is ' + key);
		if (s == key) {
			s = equivMap[key];
			console.log('replaced with ' + s);
		}
	});
	return s;
}