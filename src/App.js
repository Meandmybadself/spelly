import "./styles.css";
import { useState, useEffect, useCallback, useRef } from "react";
import shuffle from "lodash.shuffle";
import KeyboardEventHandler from "react-keyboard-event-handler";

const initialWordList = [
  "are",
  "bed",
  "big",
  "box",
  "boy",
  "bus",
  "cat",
  "did",
  "dog",
  "fall",
  "fin",
  "fox",
  "girl",
  "had",
  "hen",
  "hat",
  "hot",
  "like",
  "love",
  "off",
  "play",
  "red",
  "run",
  "the",
  "top",
  "vet",
  "yes",
  "you"
];

export default function App() {
  const startingString = "type here";
  const [text, setText] = useState(startingString);
  const [words, setWords] = useState();
  const [word, setWord] = useState("");
  const inputEl = useRef(null);

  const say = (str) => {
    const msg = new SpeechSynthesisUtterance();
    msg.text = str;
    msg.rate = 0.7;
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
    (key, e) => {
      key = key.toLowerCase();
      if (text === startingString) {
        setText(key);
      } else {
        setText(`${text}${key}`);
      }
      say(key);
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

  return (
    <div className="App">
      <div id="modeBtn" onClick={() => toggleMode()}>
        {word && "Say Words"}
        {!word && "Spell Words"}
      </div>
      <textarea
        ref={inputEl}
        className="main"
        spellCheck="false"
        autoComplete="new-password"
        value={text}
        rows={1}
      />
      <KeyboardEventHandler
        handleKeys={["alphabetic"]}
        handleFocusableElements
        onKeyEvent={(key, e) => handleKeypress(key, e)}
      />

      <KeyboardEventHandler
        handleKeys={["esc"]}
        handleFocusableElements
        onKeyEvent={() => setText("")}
      />

      <KeyboardEventHandler
        handleKeys={["enter", "return"]}
        handleFocusableElements
        onKeyEvent={() => {
          if (word) {
            if (word.toLowerCase().trim() === text.toLowerCase().trim()) {
              say("Correct!");
              nextWord(true);
            } else {
              say(`Wrong. Try again. Spell ${word}.`);
            }
          } else {
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
    </div>
  );
}
