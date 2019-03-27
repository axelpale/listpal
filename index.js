//
// Resources:
// - https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
// - https://stackoverflow.com/questions/33943150/webkitspeechgrammarlist-really-works
// - https://stackoverflow.com/questions/45574101/chrome-version-60-speechrecognition
// - https://stiltsoft.com/blog/2013/05/google-chrome-how-to-use-the-web-speech-api/

window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

var recognition = new window.SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 3;

var synth = window.speechSynthesis;
var voices = synth.getVoices();

var diagnostic = document.querySelector('.output');
var bg = document.querySelector('html');
var listBox = document.querySelector('#listBox')

var speak = (word) => {
  var utterThis = new SpeechSynthesisUtterance(word);
  utterThis.voice = voices[0]
  synth.speak(utterThis);
}

var hasAny = (list, words) => {
  return words.some(w => list.indexOf(w) !== -1)
}

var list = []

document.querySelector('#start-button').onclick = function() {
  console.log('Starting recognition...');

  var listRaw = listBox.value
  list = listRaw.split('\n')
    .map(w => w.trim())
    .filter(w => w != '')
    .map(w => w.replace(/\.,$/, ''))
  console.log('List analyzed:', list)

  speak('Hello. Say "o-kay" and I will speak the first line.')

  recognition.start();
  console.log('Listening...');
}

var listIndex = -1;

recognition.onresult = function(event) {
  // var word = event.results[0][0].transcript;
  var latestResult = event.results[event.results.length - 1]
  var words = Array.prototype.map.call(latestResult, alt => alt.transcript)

  // Clean up
  words = words.map(w => w.trim())

  diagnostic.textContent = 'Result received: ' + words.toString();
  console.log(words)
  //if (words.indexOf('okay') !== -1 || words.indexOf('next' !== -1)) {
  if (hasAny(words, ['okay', 'next'])) {
    listIndex += 1

    if (listIndex < list.length) {
      let listItem = list[listIndex]
      speak(listItem)
    } else {
      setTimeout(() => {
        speak('List has ended.')
      }, 500)

      recognition.stop();
      return;
    }
  } else if (hasAny(words, ['again', 'repeat'])) {
    if (listIndex >= 0) {
      let listItem = list[listIndex]
      speak(listItem)
    }
  } else if (hasAny(words, ['back'])) {
    listIndex = Math.max(0, listIndex - 1)
    speak(list[listIndex])
  } else if (hasAny(words, ['stop'])) {
    recognition.stop()
    speak('I stopped listening you.')
  }
}

recognition.onerror = function (err) {
  console.error(err)
}
