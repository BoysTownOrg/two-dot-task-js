import {
  Choice,
  createTaskModel,
  createTaskModelWithoutFeedback,
} from "../lib/TaskModel.js";
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

function buttonGroupElement() {
  const group = divElement();
  group.style.position = "absolute";
  group.style.bottom = "5%";
  group.style.right = "5%";
  return group;
}

function buttonContainerElement() {
  const buttonContainer = divElement();
  buttonContainer.className = "jspsych-image-button-response-button";
  buttonContainer.style.display = "inline-block";
  buttonContainer.style.margin = `${pixelsString(0)} ${pixelsString(8)}`;
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

function audioBufferSource(jsPsych, url) {
  const audioContext = jsPsych.pluginAPI.audioContext();
  return jsPsych.pluginAPI.getAudioBuffer(url).then((buffer) => {
    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(audioContext.destination);
    return bufferSource;
  });
}

function hideCursor(ui) {
  ui.parent.style.cursor = "none";
}

function showCursor(ui) {
  ui.parent.style.cursor = "";
}

function colorFirstDotBlue(ui) {
  ui.firstDot.style.backgroundColor = "blue";
}

function colorFirstDotRed(ui) {
  ui.firstDot.style.backgroundColor = "red";
}

function colorFirstDotBlack(ui) {
  ui.firstDot.style.backgroundColor = "black";
}

function colorSecondDotBlue(ui) {
  ui.secondDot.style.backgroundColor = "blue";
}

function colorSecondDotRed(ui) {
  ui.secondDot.style.backgroundColor = "red";
}

function colorSecondDotBlack(ui) {
  ui.secondDot.style.backgroundColor = "black";
}

function showContinueButton(ui) {
  ui.continueButton.style.visibility = "visible";
  ui.repeatButton.style.visibility = "visible";
}

function finish(ui, result) {
  ui.jsPsych.finishTrial({ ...result, repeat: false });
}

function attach(ui, observer) {
  ui.observer = observer;
}

function imageFromUrlAndHeight(imageUrl, imageHeight) {
  const image = new Image();
  image.src = imageUrl;
  image.style.height = pixelsString(imageHeight);
  image.style.width = "auto";
  return image;
}

function addTwoDotUI(ui, jsPsych, parent, imageUrl, imageHeight) {
  const image = imageFromUrlAndHeight(imageUrl, imageHeight);
  adopt(parent, image);
  const twoDotGrid = divElement();
  twoDotGrid.style.display = "grid";
  twoDotGrid.style.gridTemplateColumns = `1fr ${pixelsString(
    250
  )} ${pixelsString(250)} 1fr`;
  twoDotGrid.style.gridGap = `${pixelsString(120)}`;
  ui.firstDot = circleElementWithColor("black");
  ui.firstDot.style.gridColumn = 2;
  adopt(twoDotGrid, ui.firstDot);
  addClickEventListener(ui.firstDot, () => {
    ui.observer.notifyThatFirstDotHasBeenTouched();
  });
  ui.secondDot = circleElementWithColor("black");
  ui.secondDot.style.gridColumn = 3;
  addClickEventListener(ui.secondDot, () => {
    ui.observer.notifyThatSecondDotHasBeenTouched();
  });
  adopt(twoDotGrid, ui.secondDot);
  adopt(parent, twoDotGrid);
  const belowTwoDots = buttonGroupElement();
  adopt(parent, belowTwoDots);
  const continueButtonContainer = buttonContainerElement();
  ui.continueButton = buttonElement();
  adopt(continueButtonContainer, ui.continueButton);
  ui.continueButton.textContent = "Continue";
  ui.continueButton.style.visibility = "hidden";
  addClickEventListener(ui.continueButton, () => {
    ui.observer.notifyThatContinueButtonHasBeenTouched();
  });
  const repeatButtonContainer = buttonContainerElement();
  ui.repeatButton = buttonElement();
  adopt(repeatButtonContainer, ui.repeatButton);
  ui.repeatButton.textContent = "Repeat";
  ui.repeatButton.style.visibility = "hidden";
  adopt(belowTwoDots, repeatButtonContainer);
  adopt(belowTwoDots, continueButtonContainer);
  addClickEventListener(ui.repeatButton, () => {
    jsPsych.finishTrial({ repeat: true });
  });
}

class TaskUI {
  constructor(jsPsych, parent, imageUrl, imageHeight) {
    this.parent = parent;
    this.jsPsych = jsPsych;
    addTwoDotUI(this, jsPsych, parent, imageUrl, imageHeight);
  }

  hideCursor() {
    hideCursor(this);
  }

  showCursor() {
    showCursor(this);
  }

  colorFirstDotBlue() {
    colorFirstDotBlue(this);
  }

  colorFirstDotRed() {
    colorFirstDotRed(this);
  }

  colorFirstDotBlack() {
    colorFirstDotBlack(this);
  }

  colorSecondDotBlue() {
    colorSecondDotBlue(this);
  }

  colorSecondDotRed() {
    colorSecondDotRed(this);
  }

  colorSecondDotBlack() {
    colorSecondDotBlack(this);
  }

  showContinueButton() {
    showContinueButton(this);
  }

  finish(result) {
    finish(this, result);
  }

  attach(observer) {
    attach(this, observer);
  }
}

function videoWithImageGrid() {
  const gridLayout = document.createElement("div");
  gridLayout.style.display = "grid";
  gridLayout.style.gridTemplateColumns = "1fr 1fr";
  gridLayout.style.justifyItems = "center";
  gridLayout.style.alignItems = "center";
  return gridLayout;
}

class TaskWithVideoUI {
  constructor(jsPsych, parent, videoElement, imageUrl, imageHeight) {
    this.parent = parent;
    this.jsPsych = jsPsych;
    const gridLayout = videoWithImageGrid();
    adopt(parent, gridLayout);
    const rightHandSide = document.createElement("div");
    rightHandSide.style.gridColumn = 2;
    rightHandSide.style.gridRow = 1;
    adopt(gridLayout, rightHandSide);
    addTwoDotUI(this, jsPsych, rightHandSide, imageUrl, imageHeight);
    videoElement.style.gridRow = 1;
    videoElement.style.gridColumn = 1;
    videoElement.style.width = "45vw";
    adopt(gridLayout, videoElement);
  }

  hideCursor() {
    hideCursor(this);
  }

  showCursor() {
    showCursor(this);
  }

  colorFirstDotBlue() {
    colorFirstDotBlue(this);
  }

  colorFirstDotRed() {
    colorFirstDotRed(this);
  }

  colorFirstDotBlack() {
    colorFirstDotBlack(this);
  }

  colorSecondDotBlue() {
    colorSecondDotBlue(this);
  }

  colorSecondDotRed() {
    colorSecondDotRed(this);
  }

  colorSecondDotBlack() {
    colorSecondDotBlack(this);
  }

  showContinueButton() {
    showContinueButton(this);
  }

  finish(result) {
    finish(this, result);
  }

  attach(observer) {
    attach(this, observer);
  }
}

function notifyThatPlaybackTimeHasUpdated(observer) {
  observer.notifyThatPlaybackTimeHasUpdated();
}

class WebAudioPlayer {
  constructor(jsPsych, stimulusUrl, feedbackUrl) {
    this.jsPsych = jsPsych;
    this.stimulusUrl = stimulusUrl;
    this.feedbackUrl = feedbackUrl;
    this.audioContext = jsPsych.pluginAPI.audioContext();
  }

  playFeedback() {
    audioBufferSource(this.jsPsych, this.feedbackUrl).then((feedbackSource) => {
      feedbackSource.onended = () => {
        this.observer.notifyThatFeedbackHasEnded();
      };
      feedbackSource.start();
    });
  }

  playStimulus() {
    audioBufferSource(this.jsPsych, this.stimulusUrl).then((stimulusSource) => {
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

class WebVideoPlayer {
  constructor(jsPsych, videoElement, stimulusUrl, feedbackUrl) {
    this.jsPsych = jsPsych;
    this.stimulusUrl = stimulusUrl;
    this.feedbackUrl = feedbackUrl;
    this.videoElement = videoElement;
  }

  playFeedback() {
    this.videoElement.src = this.jsPsych.pluginAPI.getVideoBuffer(
      this.feedbackUrl
    );
    this.videoElement.onended = () => {
      this.observer.notifyThatFeedbackHasEnded();
    };
    this.videoElement.play();
  }

  playStimulus() {
    this.videoElement.src = this.jsPsych.pluginAPI.getVideoBuffer(
      this.stimulusUrl
    );
    this.videoElement.ontimeupdate = () => {
      notifyThatPlaybackTimeHasUpdated(this.observer);
    };
    this.videoElement.onended = () => {
      this.observer.notifyThatPlaybackHasEnded();
    };
    this.videoElement.play();
  }

  currentTimeSeconds() {
    return this.videoElement.currentTime;
  }

  attach(observer) {
    this.observer = observer;
  }
}

function twoDotCommonParameters(jspsych) {
  return {
    imageUrl: {
      type: jspsych.ParameterType.IMAGE,
      pretty_name: "Image URL",
      default: "",
      description: "The image",
    },
    imageHeight: {
      type: jspsych.ParameterType.INT,
      pretty_name: "Image height",
      default: null,
      description: "The image height in pixels",
    },
    firstChoiceOnsetTimeSeconds: {
      type: jspsych.ParameterType.FLOAT,
      pretty_name: "First choice onset time",
      default: 0,
      description: "The first choice onset time in seconds",
    },
    firstChoiceOffsetTimeSeconds: {
      type: jspsych.ParameterType.FLOAT,
      pretty_name: "First choice offset time",
      default: 0,
      description: "The first choice offset time in seconds",
    },
    secondChoiceOnsetTimeSeconds: {
      type: jspsych.ParameterType.FLOAT,
      pretty_name: "Second choice onset time",
      default: 0,
      description: "The second choice onset time in seconds",
    },
    secondChoiceOffsetTimeSeconds: {
      type: jspsych.ParameterType.FLOAT,
      pretty_name: "Second choice offset time",
      default: 0,
      description: "The second choice offset time in seconds",
    },
    firstWord: {
      type: jspsych.ParameterType.STRING,
      pretty_name: "First word",
      default: "",
      description: "The word represented by the first choice",
    },
    secondWord: {
      type: jspsych.ParameterType.STRING,
      pretty_name: "Second word",
      default: "",
      description: "The word represented by the second choice",
    },
    correctWord: {
      type: jspsych.ParameterType.STRING,
      pretty_name: "Correct word",
      default: "",
      description: "The correct word",
    },
  };
}

function choiceTimesSeconds(trial) {
  return new Map([
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
  ]);
}

function words(trial) {
  return new Map([
    [Choice.first, trial.firstWord],
    [Choice.second, trial.secondWord],
  ]);
}

function startController(taskUI, model) {
  const controller = new TaskController(taskUI, model);
  model.start();
}

// "jspsych" is "jsPsychModule", NOT the "jsPsych" instance
export function twoDot(jspsych) {
  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      clear(display_element);
      const taskUI = new TaskUI(
        this.jsPsych,
        display_element,
        trial.imageUrl,
        trial.imageHeight
      );
      startController(
        taskUI,
        createTaskModel(
          new WebAudioPlayer(
            this.jsPsych,
            trial.stimulusUrl,
            trial.feedbackUrl
          ),
          new TaskPresenter(taskUI),
          choiceTimesSeconds(trial),
          words(trial),
          trial.correctWord
        )
      );
    }
  }

  Plugin.info = {
    name: "two-dot",
    description: "",
    parameters: {
      stimulusUrl: {
        type: jspsych.ParameterType.AUDIO,
        pretty_name: "Stimulus URL",
        default: "",
        description: "The stimulus audio",
      },
      feedbackUrl: {
        type: jspsych.ParameterType.AUDIO,
        pretty_name: "Feedback URL",
        default: "",
        description: "The feedback audio",
      },
      ...twoDotCommonParameters(jspsych),
    },
  };
  return Plugin;
}

export function twoDotWithVideo(jspsych) {
  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      clear(display_element);
      const videoElement = document.createElement("video");
      const taskUI = new TaskWithVideoUI(
        this.jsPsych,
        display_element,
        videoElement,
        trial.imageUrl,
        trial.imageHeight
      );
      startController(
        taskUI,
        createTaskModel(
          new WebVideoPlayer(
            this.jsPsych,
            videoElement,
            trial.stimulusUrl,
            trial.feedbackUrl
          ),
          new TaskPresenter(taskUI),
          choiceTimesSeconds(trial),
          words(trial),
          trial.correctWord
        )
      );
    }
  }

  Plugin.info = {
    name: "two-dot-with-video",
    description: "",
    parameters: {
      stimulusUrl: {
        type: jspsych.ParameterType.VIDEO,
        pretty_name: "Stimulus URL",
        default: "",
        description: "The stimulus video",
      },
      feedbackUrl: {
        type: jspsych.ParameterType.VIDEO,
        pretty_name: "Feedback URL",
        default: "",
        description: "The feedback video",
      },
      ...twoDotCommonParameters(jspsych),
    },
  };
  return Plugin;
}

// "jspsych" is "jsPsychModule", NOT the "jsPsych" instance
export function twoDotWithoutFeedback(jspsych) {
  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      clear(display_element);
      const taskUI = new TaskUI(
        this.jsPsych,
        display_element,
        trial.imageUrl,
        trial.imageHeight
      );
      startController(
        taskUI,
        createTaskModelWithoutFeedback(
          new WebAudioPlayer(this.jsPsych, trial.stimulusUrl, ""),
          new TaskPresenter(taskUI),
          choiceTimesSeconds(trial),
          words(trial),
          trial.correctWord
        )
      );
    }
  }

  Plugin.info = {
    name: "two-dot-without-feedback",
    description: "",
    parameters: {
      stimulusUrl: {
        type: jspsych.ParameterType.AUDIO,
        pretty_name: "Stimulus URL",
        default: "",
        description: "The stimulus audio",
      },
      ...twoDotCommonParameters(jspsych),
    },
  };
  return Plugin;
}

// "jspsych" is "jsPsychModule", NOT the "jsPsych" instance
export function twoDotWithVideoWithoutFeedback(jspsych) {
  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      clear(display_element);
      const videoElement = document.createElement("video");
      const taskUI = new TaskWithVideoUI(
        this.jsPsych,
        display_element,
        videoElement,
        trial.imageUrl,
        trial.imageHeight
      );
      startController(
        taskUI,
        createTaskModelWithoutFeedback(
          new WebVideoPlayer(this.jsPsych, videoElement, trial.stimulusUrl, ""),
          new TaskPresenter(taskUI),
          choiceTimesSeconds(trial),
          words(trial),
          trial.correctWord
        )
      );
    }
  }

  Plugin.info = {
    name: "two-dot-with-video-without-feedback",
    description: "",
    parameters: {
      stimulusUrl: {
        type: jspsych.ParameterType.VIDEO,
        pretty_name: "Stimulus URL",
        default: "",
        description: "The stimulus video",
      },
      ...twoDotCommonParameters(jspsych),
    },
  };
  return Plugin;
}

function initializeRepeatableTrial(
  jsPsych,
  buttonGroup,
  continueButton,
  repeatButton
) {
  const continueButtonContainer = buttonContainerElement();
  adopt(continueButtonContainer, continueButton);
  continueButton.textContent = "Continue";
  continueButton.style.visibility = "hidden";
  const repeatButtonContainer = buttonContainerElement();
  adopt(repeatButtonContainer, repeatButton);
  repeatButton.textContent = "Repeat";
  repeatButton.style.visibility = "hidden";
  adopt(buttonGroup, repeatButtonContainer);
  adopt(buttonGroup, continueButtonContainer);
  addClickEventListener(continueButton, () =>
    jsPsych.finishTrial({ repeat: false })
  );
  addClickEventListener(repeatButton, () =>
    jsPsych.finishTrial({ repeat: true })
  );
}

// "jspsych" is "jsPsychModule", NOT the "jsPsych" instance
export function imageAudioButtonResponse(jspsych) {
  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement, trial) {
      clear(displayElement);
      const image = imageFromUrlAndHeight(trial.imageUrl, trial.imageHeight);
      adopt(displayElement, image);
      const buttonGroup = buttonGroupElement();
      adopt(displayElement, buttonGroup);
      const continueButton = buttonElement();
      const repeatButton = buttonElement();
      initializeRepeatableTrial(
        this.jsPsych,
        buttonGroup,
        continueButton,
        repeatButton
      );
      audioBufferSource(this.jsPsych, trial.stimulusUrl).then(
        (stimulusSource) => {
          stimulusSource.onended = () => {
            continueButton.style.visibility = "visible";
            repeatButton.style.visibility = "visible";
          };
          stimulusSource.start();
        }
      );
    }
  }
  Plugin.info = {
    name: "image-audio-button-response",
    parameters: {
      stimulusUrl: {
        type: jspsych.ParameterType.AUDIO,
        pretty_name: "Stimulus URL",
        default: "",
        description: "The stimulus audio",
      },
      imageUrl: {
        type: jspsych.ParameterType.IMAGE,
        pretty_name: "Image URL",
        default: "",
        description: "The image",
      },
      imageHeight: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Image height",
        default: null,
        description: "The image height in pixels",
      },
    },
  };
  return Plugin;
}

export function imageVideoPlaceholderButtonResponse(jspsych) {
  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement, trial) {
      clear(displayElement);
      const gridLayout = videoWithImageGrid();
      adopt(displayElement, gridLayout);
      const image = imageFromUrlAndHeight(trial.imageUrl, trial.imageHeight);
      image.style.gridRow = 1;
      image.style.gridColumn = 2;
      adopt(gridLayout, image);
      const buttonGroup = buttonGroupElement();
      adopt(displayElement, buttonGroup);
      const continueButton = buttonElement();
      const continueButtonContainer = buttonContainerElement();
      adopt(continueButtonContainer, continueButton);
      continueButton.textContent = "Continue";
      adopt(buttonGroup, continueButtonContainer);
      addClickEventListener(continueButton, () => this.jsPsych.finishTrial());
    }
  }
  Plugin.info = {
    name: "image-video-placeholder-button-response",
    parameters: {
      imageUrl: {
        type: jspsych.ParameterType.IMAGE,
        pretty_name: "Image URL",
        default: "",
        description: "The image",
      },
      imageHeight: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Image height",
        default: null,
        description: "The image height in pixels",
      },
    },
  };
  return Plugin;
}

export function imageVideoButtonResponse(jspsych) {
  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement, trial) {
      clear(displayElement);
      const gridLayout = videoWithImageGrid();
      adopt(displayElement, gridLayout);
      const image = imageFromUrlAndHeight(trial.imageUrl, trial.imageHeight);
      image.style.gridRow = 1;
      image.style.gridColumn = 2;
      adopt(gridLayout, image);
      const buttonGroup = buttonGroupElement();
      adopt(displayElement, buttonGroup);
      const continueButton = buttonElement();
      const repeatButton = buttonElement();
      initializeRepeatableTrial(
        this.jsPsych,
        buttonGroup,
        continueButton,
        repeatButton
      );
      const videoElement = document.createElement("video");
      videoElement.style.width = "45vw";
      videoElement.style.gridRow = 1;
      videoElement.style.gridColumn = 1;
      adopt(gridLayout, videoElement);
      videoElement.src = this.jsPsych.pluginAPI.getVideoBuffer(
        trial.stimulusUrl
      );
      videoElement.onended = () => {
        continueButton.style.visibility = "visible";
        repeatButton.style.visibility = "visible";
      };
      videoElement.play();
    }
  }
  Plugin.info = {
    name: "image-video-button-response",
    parameters: {
      stimulusUrl: {
        type: jspsych.ParameterType.VIDEO,
        pretty_name: "Stimulus URL",
        default: "",
        description: "The stimulus video",
      },
      imageUrl: {
        type: jspsych.ParameterType.IMAGE,
        pretty_name: "Image URL",
        default: "",
        description: "The image",
      },
      imageHeight: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Image height",
        default: null,
        description: "The image height in pixels",
      },
    },
  };
  return Plugin;
}

// "jspsych" is "jsPsychModule", NOT the "jsPsych" instance
export function stopwatch(jspsych) {
  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

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
      const buttonGroup = buttonGroupElement();
      const buttonContainer = buttonContainerElement();
      const continueButton = buttonElement();
      adopt(buttonContainer, continueButton);
      adopt(buttonGroup, buttonContainer);
      adopt(displayElement, buttonGroup);
      continueButton.textContent = "Continue";

      // modified from https://jsfiddle.net/Daniel_Hug/pvk6p/
      let totalSeconds = 0;
      let seconds = 0;
      let minutes = 0;
      let hours = 0;
      const jsPsych = this.jsPsych;

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
          const audioContext = jsPsych.pluginAPI.audioContext();
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
    }
  }
  Plugin.info = {
    name: "stopwatch",
    description: "",
    parameters: {
      text: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Displayed Text",
        default: "",
        description: "The text that is displayed",
      },
      alarmTimeSeconds: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Alarm time seconds",
        default: "",
        description: "The alarm time in seconds",
      },
    },
  };
  return Plugin;
}
