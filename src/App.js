import "./styles.css";
import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import shuffle from "lodash.shuffle";
import KeyboardEventHandler from "react-keyboard-event-handler";
import Confetti from "react-confetti";

const firstNames = [
  "abigail",
  "aiden",
  "alex",
  "alexander",
  "alexandra",
  "allie",
  "amelia",
  "ari",
  "aria",
  "arlo",
  "asher",
  "ashley",
  "ava",
  "avery",
  "beckett",
  "benjamin",
  "brooks",
  "bryce",
  "caden",
  "charlie",
  "charlotte",
  "chase",
  "chris",
  "christina",
  "christine",
  "daniel",
  "elijah",
  "elizabeth",
  "ella",
  "emelia",
  "emily",
  "emma",
  "ethan",
  "evelyn",
  "fern",
  "gemma",
  "gianna",
  "grayson",
  "harper",
  "henry",
  "isabella",
  "isaiah",
  "jackson",
  "jacob",
  "jaden",
  "james",
  "jeremiah",
  "joe",
  "joseph",
  "josiah",
  "jules",
  "layla",
  "liam",
  "logan",
  "lucas",
  "lucy",
  "madison",
  "marian",
  "mason",
  "mason",
  "matt",
  "matthew",
  "mel",
  "mia",
  "michael",
  "noah",
  "oliver",
  "olivia",
  "quinn",
  "rachel",
  "riley",
  "scarlett",
  "skye",
  "sofia",
  "sophia",
  "sophia",
  "victoria",
  "william",
  "wren"
];
const initialWordList = [
  "bad",
  "bar",
  "bat",
  "bed",
  "beg",
  "bet",
  "big",
  "bit",
  "box",
  "boy",
  "bus",
  "cad",
  "cab",
  "can",
  "cap",
  "cat",
  "cop",
  "dad",
  "did",
  "dog",
  "fall",
  "fin",
  "fox",
  "had",
  "hen",
  "hat",
  "hit",
  "hot",
  "love",
  "mom",
  "pad",
  "run",
  "the",
  "tap",
  "tip",
  "top",
  "vet",
  "yes",
  "you"
];

export default function App() {
  const startingString = "type here";
  const [text, setText] = useState(startingString);
  const [confettiVisibility, setConfettiVisibility] = useState(false);
  const [words, setWords] = useState();
  const [word, setWord] = useState("");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const inputEl = useRef(null);

  const say = (str) => {
    const msg = new SpeechSynthesisUtterance();
    msg.text = str;
    msg.rate = 0.7;
    if (selectedVoice) {
      msg.voice = selectedVoice;
    }
    window.speechSynthesis.speak(msg);
  };

  const nextWord = useCallback(
    (afterSuccess) => {
      if (words.length) {
        const tempWords = [...words];
        const newWord = tempWords.pop();
        setWord(newWord);
        setWords(tempWords);
        if (afterSuccess) {
          say(`Now, spell ${newWord}`);
        } else {
          say(`Spell ${newWord}`);
        }
        setText("");
      } else {
        console.log("out of words.");
      }
    },
    [words, setWords, setText]
  );

  const toggleMode = useCallback(() => {
    if (word) {
      // We've currently got a word. Remove it.
      setWord();
    } else {
      nextWord();
    }
    inputEl.current.focus();
  }, [word, setWord, nextWord]);

  const handleKeypress = useCallback(
    (key) => {
      key = key.toLowerCase();
      if (text === startingString) {
        setText(key);
      } else {
        if (key === "space") {
          key = " ";
        }
        setText(`${text}${key}`);
      }
      if (key.trim().length === 1) {
        say(key);
      }
    },
    [text, setText]
  );

  useEffect(() => {
    // words
    setWords(shuffle(initialWordList));
  }, []);

  useEffect(() => {
    inputEl.current.focus();
    inputEl.current.addEventListener("blur", () => inputEl.current.focus());
  }, [inputEl]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices().filter(v => v.lang === 'en-US');
      setAvailableVoices(voices);
      // Set default to first English voice or first available voice
      const defaultVoice = voices.find(v => v.lang === 'en-US') || voices[0];
      setSelectedVoice(defaultVoice);
    };
    
    loadVoices();
    // Voices load asynchronously in some browsers
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  return (
    <Fragment>
      <header>
        <div id="modeBtn" onClick={() => toggleMode()}>
          {word && "Say Words"}
          {!word && "Spell Words"}
        </div>
        <h1>Spelly</h1>
        <select 
          value={selectedVoice?.name || ''} 
          onChange={(e) => {
            const voice = availableVoices.find(v => v.name === e.target.value);
            setSelectedVoice(voice);
          }}
          className="voiceSelector"
        >
          {availableVoices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name.replace(/\(+[^\)]+\)+/g, '').trim()}
            </option>
          ))}
        </select>
      </header>
      <main className="App">
        <textarea
          ref={inputEl}
          className="main"
          spellCheck="false"
          autoComplete="new-password"
          value={text}
          rows={1}
          onClick={() => document.getElementById('root').requestFullscreen()}
        />
        <p>
          <span>Type a letter to hear it.</span>
          <br />
          <span>
            Hit <span className="green">Return</span> to hear the word.
          </span>
        </p>
        <Confetti numberOfPieces={confettiVisibility ? 500 : 0} />
        <KeyboardEventHandler
          handleKeys={["alphabetic", "numeric", "space"]}
          handleFocusableElements
          onKeyEvent={(key, e) => handleKeypress(key, e)}
        />

        <KeyboardEventHandler
          handleKeys={["esc"]}
          handleFocusableElements
          onKeyEvent={() => {
            window.speechSynthesis.cancel();
            setText("");
          }}
        />

        <KeyboardEventHandler
          handleKeys={["enter", "return"]}
          handleFocusableElements
          onKeyEvent={() => {
            if (word) {
              if (word.toLowerCase().trim() === text.toLowerCase().trim()) {
                say("Correct!");
                setConfettiVisibility(true);
                setTimeout(() => setConfettiVisibility(false), 2000);
                nextWord(true);
              } else {
                say(`Wrong. Try again. Spell ${word}.`);
              }
            } else {
              if (firstNames.includes(text.toLowerCase().trim())) {
                if (!confettiVisibility) {
                  setConfettiVisibility(true);
                  setTimeout(() => setConfettiVisibility(false), 5000);
                }
              }
              say(text);
            }
          }}
        />

        <KeyboardEventHandler
          handleKeys={["del", "delete", "backspace"]}
          handleFocusableElements
          onKeyEvent={() => {
            if (text === startingString) {
              setText("");
            } else {
              setText(text.slice(0, -1));
            }
          }}
        />
      </main>
      <footer>
        <a href="https://github.com/meandmybadself/spelly">Source</a>
        &nbsp;
        &nbsp;
        <a href="https://codesandbox.io/s/gracious-ellis-mumux?file=/src/App.js">
          Sandbox
        </a>
        &nbsp;
        &nbsp;
        <a href="https://meandmybadself.com">Me & My Bad Self</a>
      </footer>
    </Fragment>
  );
}
