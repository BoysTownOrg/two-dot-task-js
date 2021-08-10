import { TaskModel, Choice } from "../lib/TaskModel.js";
import { TaskController } from "../lib/TaskController.js";
import { TaskPresenter } from "../lib/TaskPresenter.js";

function addEventListener(element, event, f) {
  element.addEventListener(event, f);
}

function addClickEventListener(element, f) {
  addEventListener(element, "click", f);
}

function createElement(what) {
  return document.createElement(what);
}

function divElement() {
  return createElement("div");
}

function pixelsString(a) {
  return `${a}px`;
}

function adopt(parent, child) {
  parent.append(child);
}

function clear(parent) {
  // https://stackoverflow.com/a/3955238
  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
}

function gridTemplate(n) {
  return `repeat(${n}, 1fr)`;
}

function gridElement(rows, columns) {
  const grid_ = divElement();
  grid_.style.display = "grid";
  grid_.style.gridTemplateRows = gridTemplate(rows);
  grid_.style.gridTemplateColumns = gridTemplate(columns);
  grid_.style.gridGap = `${pixelsString(20)} ${pixelsString(20)}`;
  return grid_;
}

function buttonContainerElement() {
  const buttonContainer = divElement();
  buttonContainer.className = "jspsych-image-button-response-button";
  buttonContainer.style.display = "inline-block";
  buttonContainer.style.margin = `${pixelsString(8)} ${pixelsString(0)}`;
  return buttonContainer;
}

function buttonElement() {
  const button = createElement("button");
  button.className = "jspsych-btn";
  return button;
}

function circleElementWithColor(color) {
  const circle = divElement();
  const diameterPixels = 100;
  circle.style.height = pixelsString(diameterPixels);
  circle.style.width = pixelsString(diameterPixels);
  const borderWidthPixels = 2;
  circle.style.borderRadius = pixelsString(
    diameterPixels / 2 + borderWidthPixels
  );
  circle.style.border = `${pixelsString(borderWidthPixels)} solid black`;
  circle.style.margin = "auto";
  circle.style.backgroundColor = color;
  return circle;
}

function audioBufferSource(url) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  return jsPsych.pluginAPI.getAudioBuffer(url).then((buffer) => {
    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(audioContext.destination);
    return bufferSource;
  });
}

class TaskUI {
  constructor(parent, imageUrl, imageHeight) {
    this.parent = parent;
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      image.height = imageHeight;
      image.width = (image.naturalWidth * imageHeight) / image.naturalHeight;
    };
    adopt(parent, image);
    const twoDotGrid = divElement();
    twoDotGrid.style.display = "grid";
    twoDotGrid.style.gridTemplateColumns = `1fr ${pixelsString(
      250
    )} ${pixelsString(250)} 1fr`;
    twoDotGrid.style.gridGap = `${pixelsString(120)}`;
    this.firstDot = circleElementWithColor("black");
    this.firstDot.style.gridRow = 1;
    this.firstDot.style.gridColumn = 2;
    adopt(twoDotGrid, this.firstDot);
    addClickEventListener(this.firstDot, () => {
      this.observer.notifyThatFirstDotHasBeenTouched();
    });
    this.secondDot = circleElementWithColor("black");
    this.secondDot.style.gridRow = 1;
    this.secondDot.style.gridColumn = 3;
    addClickEventListener(this.secondDot, () => {
      this.observer.notifyThatSecondDotHasBeenTouched();
    });
    adopt(twoDotGrid, this.secondDot);
    adopt(parent, twoDotGrid);
    const belowTwoDots = divElement();
    const buttonContainer = buttonContainerElement();
    buttonContainer.style.gridRow = 2;
    buttonContainer.style.gridColumn = 2;
    this.continueButton = buttonElement();
    this.continueButton.textContent = "Continue";
    this.continueButton.style.visibility = "hidden";
    addClickEventListener(this.continueButton, () => {
      this.observer.notifyThatContinueButtonHasBeenTouched();
    });
    adopt(buttonContainer, this.continueButton);
    adopt(belowTwoDots, buttonContainer);
    adopt(parent, belowTwoDots);
  }

  colorFirstDotBlue() {
    this.firstDot.style.backgroundColor = "blue";
  }

  colorFirstDotRed() {
    this.firstDot.style.backgroundColor = "red";
  }

  colorFirstDotBlack() {
    this.firstDot.style.backgroundColor = "black";
  }

  colorSecondDotBlue() {
    this.secondDot.style.backgroundColor = "blue";
  }

  colorSecondDotRed() {
    this.secondDot.style.backgroundColor = "red";
  }

  colorSecondDotBlack() {
    this.secondDot.style.backgroundColor = "black";
  }

  showContinueButton() {
    this.continueButton.style.visibility = "visible";
  }

  finish(result) {
    jsPsych.finishTrial(result);
  }

  attach(observer) {
    this.observer = observer;
  }
}

function notifyThatPlaybackTimeHasUpdated(observer) {
  observer.notifyThatPlaybackTimeHasUpdated();
}

class WebAudioPlayer {
  constructor(stimulusUrl, feedbackUrl) {
    this.stimulusUrl = stimulusUrl;
    this.feedbackUrl = feedbackUrl;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
  }

  playFeedback() {
    audioBufferSource(this.feedbackUrl).then((feedbackSource) => {
      feedbackSource.onended = () => {
        this.observer.notifyThatFeedbackHasEnded();
      };
      feedbackSource.start();
    });
  }

  playStimulus() {
    audioBufferSource(this.stimulusUrl).then((stimulusSource) => {
      const timerID = setInterval(
        notifyThatPlaybackTimeHasUpdated,
        100,
        this.observer
      );
      stimulusSource.onended = () => {
        clearInterval(timerID);
        this.observer.notifyThatPlaybackHasEnded();
      };
      stimulusSource.start();
      this.startTime = this.audioContext.currentTime;
    });
  }

  currentTimeSeconds() {
    return this.audioContext.currentTime - this.startTime;
  }

  attach(observer) {
    this.observer = observer;
  }
}

export function twoDot(name) {
  jsPsych.pluginAPI.registerPreload(name, "stimulusUrl", "audio");
  jsPsych.pluginAPI.registerPreload(name, "feedbackUrl", "audio");
  jsPsych.pluginAPI.registerPreload(name, "imageUrl", "image");

  return {
    name,
    description: "",
    info: {
      parameters: {
        stimulusUrl: {
          type: jsPsych.plugins.parameterType.AUDIO,
          pretty_name: "Stimulus URL",
          default: "",
          description: "The stimulus audio",
        },
        feedbackUrl: {
          type: jsPsych.plugins.parameterType.AUDIO,
          pretty_name: "Feedback URL",
          default: "",
          description: "The feedback audio",
        },
        imageUrl: {
          type: jsPsych.plugins.parameterType.IMAGE,
          pretty_name: "Image URL",
          default: "",
          description: "The image",
        },
        imageHeight: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: "Image height",
          default: null,
          description: "The image height in pixels",
        },
        firstChoiceOnsetTimeSeconds: {
          type: jsPsych.plugins.parameterType.FLOAT,
          pretty_name: "First choice onset time",
          default: 0,
          description: "The first choice onset time in seconds",
        },
        firstChoiceOffsetTimeSeconds: {
          type: jsPsych.plugins.parameterType.FLOAT,
          pretty_name: "First choice offset time",
          default: 0,
          description: "The first choice offset time in seconds",
        },
        secondChoiceOnsetTimeSeconds: {
          type: jsPsych.plugins.parameterType.FLOAT,
          pretty_name: "Second choice onset time",
          default: 0,
          description: "The second choice onset time in seconds",
        },
        secondChoiceOffsetTimeSeconds: {
          type: jsPsych.plugins.parameterType.FLOAT,
          pretty_name: "Second choice offset time",
          default: 0,
          description: "The second choice offset time in seconds",
        },
        firstWord: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: "First word",
          default: "",
          description: "The word represented by the first choice",
        },
        secondWord: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: "Second word",
          default: "",
          description: "The word represented by the second choice",
        },
        correctWord: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: "Correct word",
          default: "",
          description: "The correct word",
        },
      },
    },
    trial(display_element, trial) {
      clear(display_element);
      const taskUI = new TaskUI(
        display_element,
        trial.imageUrl,
        trial.imageHeight
      );
      const model = new TaskModel(
        new WebAudioPlayer(trial.stimulusUrl, trial.feedbackUrl),
        new TaskPresenter(taskUI),
        new Map([
          [
            Choice.first,
            {
              onset: trial.firstChoiceOnsetTimeSeconds,
              offset: trial.firstChoiceOffsetTimeSeconds,
            },
          ],
          [
            Choice.second,
            {
              onset: trial.secondChoiceOnsetTimeSeconds,
              offset: trial.secondChoiceOffsetTimeSeconds,
            },
          ],
        ]),
        new Map([
          [Choice.first, trial.firstWord],
          [Choice.second, trial.secondWord],
        ]),
        trial.correctWord
      );
      const controller = new TaskController(taskUI, model);
      model.start();
    },
  };
}

export function imageAudioButtonResponse(id) {
  jsPsych.pluginAPI.registerPreload(id, "stimulusUrl", "audio");
  jsPsych.pluginAPI.registerPreload(id, "imageUrl", "image");

  return {
    info: {
      parameters: {
        stimulusUrl: {
          type: jsPsych.plugins.parameterType.AUDIO,
          pretty_name: "Stimulus URL",
          default: "",
          description: "The stimulus audio",
        },
        imageUrl: {
          type: jsPsych.plugins.parameterType.IMAGE,
          pretty_name: "Image URL",
          default: "",
          description: "The image",
        },
        imageHeight: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: "Image height",
          default: null,
          description: "The image height in pixels",
        },
      },
    },
    trial(displayElement, trial) {
      clear(displayElement);
      const grid = gridElement(2, 1);
      adopt(displayElement, grid);
      const image = new Image();
      image.src = trial.imageUrl;
      image.onload = () => {
        image.height = trial.imageHeight;
        image.width =
          (image.naturalWidth * trial.imageHeight) / image.naturalHeight;
      };
      image.style.gridRow = 1;
      image.style.gridColumn = 1;
      adopt(grid, image);
      const buttonContainer = buttonContainerElement();
      adopt(grid, buttonContainer);
      buttonContainer.style.gridRow = 2;
      buttonContainer.style.gridColumn = 1;
      const continueButton = buttonElement();
      continueButton.textContent = "Continue";
      continueButton.style.visibility = "hidden";
      adopt(buttonContainer, continueButton);
      addClickEventListener(continueButton, () => jsPsych.finishTrial());
      audioBufferSource(trial.stimulusUrl).then((stimulusSource) => {
        stimulusSource.onended = () => {
          continueButton.style.visibility = "visible";
        };
        stimulusSource.start();
      });
    },
  };
}

export function stopwatch(id) {
  return {
    info: {
      name: id,
      description: "",
      parameters: {
        text: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: "Displayed Text",
          default: "",
          description: "The text that is displayed",
        },
        alarmTimeSeconds: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: "Alarm time seconds",
          default: "",
          description: "The alarm time in seconds",
        },
      },
    },
    trial(displayElement, trial) {
      clear(displayElement);
      const text = divElement();
      text.textContent = trial.text;
      adopt(displayElement, text);
      const timeContainer = document.createElement("h1");
      const time = document.createElement("time");
      time.textContent = "00:00:00";
      adopt(timeContainer, time);
      adopt(displayElement, timeContainer);
      const buttonContainer = buttonContainerElement();
      const continueButton = buttonElement();
      adopt(buttonContainer, continueButton);
      adopt(displayElement, buttonContainer);
      continueButton.textContent = "Continue";

      // modified from https://jsfiddle.net/Daniel_Hug/pvk6p/
      let totalSeconds = 0;
      let seconds = 0;
      let minutes = 0;
      let hours = 0;

      function updateTime() {
        totalSeconds += 1;
        seconds += 1;
        if (seconds >= 60) {
          seconds = 0;
          minutes += 1;
          if (minutes >= 60) {
            minutes = 0;
            hours += 1;
          }
        }
        time.textContent = `${
          hours ? (hours > 9 ? hours : `0${hours}`) : "00"
        }:${minutes ? (minutes > 9 ? minutes : `0${minutes}`) : "00"}:${
          seconds > 9 ? seconds : `0${seconds}`
        }`;
        if (totalSeconds >= trial.alarmTimeSeconds) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContext();
          const oscillator = audioContext.createOscillator();
          oscillator.type = "sine";
          oscillator.frequency.value = 1000;
          const gain = audioContext.createGain();
          gain.gain.value = 0;
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          gain.gain.setTargetAtTime(0.2, audioContext.currentTime, 0.05);
          gain.gain.setTargetAtTime(0, audioContext.currentTime + 0.25, 0.05);
        }
      }

      const timerID = setInterval(updateTime, 1000);
      addClickEventListener(continueButton, () => {
        clearInterval(timerID);
        jsPsych.finishTrial();
      });
    },
  };
}
