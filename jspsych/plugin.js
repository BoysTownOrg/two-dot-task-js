import {
  TaskModel,
  Choice,
  TaskModelWithoutFeedback,
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

class TaskUI {
  constructor(jsPsych, parent, imageUrl, imageHeight) {
    this.parent = parent;
    this.jsPsych = jsPsych;
    const image = new Image();
    image.src = imageUrl;
    image.style.height = pixelsString(imageHeight);
    image.style.width = "auto";
    adopt(parent, image);
    const twoDotGrid = divElement();
    twoDotGrid.style.display = "grid";
    twoDotGrid.style.gridTemplateColumns = `1fr ${pixelsString(
      250
    )} ${pixelsString(250)} 1fr`;
    twoDotGrid.style.gridGap = `${pixelsString(120)}`;
    this.firstDot = circleElementWithColor("black");
    this.firstDot.style.gridColumn = 2;
    adopt(twoDotGrid, this.firstDot);
    addClickEventListener(this.firstDot, () => {
      this.observer.notifyThatFirstDotHasBeenTouched();
    });
    this.secondDot = circleElementWithColor("black");
    this.secondDot.style.gridColumn = 3;
    addClickEventListener(this.secondDot, () => {
      this.observer.notifyThatSecondDotHasBeenTouched();
    });
    adopt(twoDotGrid, this.secondDot);
    adopt(parent, twoDotGrid);
    const belowTwoDots = buttonGroupElement();
    adopt(parent, belowTwoDots);
    const continueButtonContainer = buttonContainerElement();
    this.continueButton = buttonElement();
    adopt(continueButtonContainer, this.continueButton);
    this.continueButton.textContent = "Continue";
    this.continueButton.style.visibility = "hidden";
    addClickEventListener(this.continueButton, () => {
      this.observer.notifyThatContinueButtonHasBeenTouched();
    });
    const repeatButtonContainer = buttonContainerElement();
    this.repeatButton = buttonElement();
    adopt(repeatButtonContainer, this.repeatButton);
    this.repeatButton.textContent = "Repeat";
    this.repeatButton.style.visibility = "hidden";
    adopt(belowTwoDots, repeatButtonContainer);
    adopt(belowTwoDots, continueButtonContainer);
    addClickEventListener(this.repeatButton, () => {
      jsPsych.finishTrial({ repeat: true });
    });
  }

  hideCursor() {
    this.parent.style.cursor = "none";
  }

  showCursor() {
    this.parent.style.cursor = "";
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
    this.repeatButton.style.visibility = "visible";
  }

  finish(result) {
    this.jsPsych.finishTrial({ ...result, repeat: false });
  }

  attach(observer) {
    this.observer = observer;
  }
}

class TaskWithVideoUI {
  constructor(
    jsPsych,
    parent,
    videoElement,
    imageUrl,
    imageHeight,
    videoHeight
  ) {
    this.parent = parent;
    this.jsPsych = jsPsych;
    const gridLayout = document.createElement("div");
    gridLayout.style.display = "grid";
    gridLayout.style.gridTemplateColumns = "1fr 1fr";
    adopt(parent, gridLayout);
    const rightHandSide = document.createElement("div");
    rightHandSide.style.gridColumn = 2;
    rightHandSide.style.gridRow = 1;
    adopt(gridLayout, rightHandSide);
    const image = new Image();
    image.src = imageUrl;
    image.style.height = pixelsString(imageHeight);
    image.style.width = "auto";
    adopt(rightHandSide, image);
    const twoDotGrid = divElement();
    twoDotGrid.style.display = "grid";
    twoDotGrid.style.gridTemplateColumns = `1fr ${pixelsString(
      250
    )} ${pixelsString(250)} 1fr`;
    twoDotGrid.style.gridGap = `${pixelsString(120)}`;
    this.firstDot = circleElementWithColor("black");
    this.firstDot.style.gridColumn = 2;
    adopt(twoDotGrid, this.firstDot);
    addClickEventListener(this.firstDot, () => {
      this.observer.notifyThatFirstDotHasBeenTouched();
    });
    this.secondDot = circleElementWithColor("black");
    this.secondDot.style.gridColumn = 3;
    addClickEventListener(this.secondDot, () => {
      this.observer.notifyThatSecondDotHasBeenTouched();
    });
    adopt(twoDotGrid, this.secondDot);
    adopt(rightHandSide, twoDotGrid);
    const belowTwoDots = buttonGroupElement();
    adopt(rightHandSide, belowTwoDots);
    const continueButtonContainer = buttonContainerElement();
    this.continueButton = buttonElement();
    adopt(continueButtonContainer, this.continueButton);
    this.continueButton.textContent = "Continue";
    this.continueButton.style.visibility = "hidden";
    addClickEventListener(this.continueButton, () => {
      this.observer.notifyThatContinueButtonHasBeenTouched();
    });
    const repeatButtonContainer = buttonContainerElement();
    this.repeatButton = buttonElement();
    adopt(repeatButtonContainer, this.repeatButton);
    this.repeatButton.textContent = "Repeat";
    this.repeatButton.style.visibility = "hidden";
    adopt(belowTwoDots, repeatButtonContainer);
    adopt(belowTwoDots, continueButtonContainer);
    addClickEventListener(this.repeatButton, () => {
      jsPsych.finishTrial({ repeat: true });
    });
    videoElement.style.gridRow = 1;
    videoElement.style.gridColumn = 1;
    videoElement.height = videoHeight;
    adopt(gridLayout, videoElement);
  }

  hideCursor() {
    this.parent.style.cursor = "none";
  }

  showCursor() {
    this.parent.style.cursor = "";
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
    this.repeatButton.style.visibility = "visible";
  }

  finish(result) {
    this.jsPsych.finishTrial({ ...result, repeat: false });
  }

  attach(observer) {
    this.observer = observer;
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
      const model = new TaskModel(
        new WebAudioPlayer(this.jsPsych, trial.stimulusUrl, trial.feedbackUrl),
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
        trial.imageHeight,
        trial.videoHeight
      );
      const model = new TaskModel(
        new WebVideoPlayer(
          this.jsPsych,
          videoElement,
          trial.stimulusUrl,
          trial.feedbackUrl
        ),
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
    }
  }

  Plugin.info = {
    name: "two-dot",
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
      videoHeight: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Video height",
        default: null,
        description: "The video height in pixels",
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
      const model = new TaskModelWithoutFeedback(
        new WebAudioPlayer(this.jsPsych, trial.stimulusUrl, ""),
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
    },
  };
  return Plugin;
}

// "jspsych" is "jsPsychModule", NOT the "jsPsych" instance
export function imageAudioButtonResponse(jspsych) {
  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement, trial) {
      clear(displayElement);
      const image = new Image();
      image.src = trial.imageUrl;
      image.style.height = pixelsString(trial.imageHeight);
      image.style.width = "auto";
      adopt(displayElement, image);
      const buttonGroup = buttonGroupElement();
      adopt(displayElement, buttonGroup);
      const continueButtonContainer = buttonContainerElement();
      const continueButton = buttonElement();
      adopt(continueButtonContainer, continueButton);
      continueButton.textContent = "Continue";
      continueButton.style.visibility = "hidden";
      const repeatButtonContainer = buttonContainerElement();
      const repeatButton = buttonElement();
      adopt(repeatButtonContainer, repeatButton);
      repeatButton.textContent = "Repeat";
      repeatButton.style.visibility = "hidden";
      adopt(buttonGroup, repeatButtonContainer);
      adopt(buttonGroup, continueButtonContainer);
      addClickEventListener(continueButton, () =>
        this.jsPsych.finishTrial({ repeat: false })
      );
      addClickEventListener(repeatButton, () =>
        this.jsPsych.finishTrial({ repeat: true })
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

export function imageVideoButtonResponse(jspsych) {
  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement, trial) {
      clear(displayElement);
      const gridLayout = document.createElement("div");
      gridLayout.style.display = "grid";
      gridLayout.style.gridTemplateColumns = "1fr 1fr";
      adopt(displayElement, gridLayout);
      const image = new Image();
      image.src = trial.imageUrl;
      image.style.height = pixelsString(trial.imageHeight);
      image.style.width = "auto";
      image.style.gridRow = 1;
      image.style.gridColumn = 2;
      adopt(gridLayout, image);
      const buttonGroup = buttonGroupElement();
      adopt(displayElement, buttonGroup);
      const continueButtonContainer = buttonContainerElement();
      const continueButton = buttonElement();
      adopt(continueButtonContainer, continueButton);
      continueButton.textContent = "Continue";
      continueButton.style.visibility = "hidden";
      const repeatButtonContainer = buttonContainerElement();
      const repeatButton = buttonElement();
      adopt(repeatButtonContainer, repeatButton);
      repeatButton.textContent = "Repeat";
      repeatButton.style.visibility = "hidden";
      adopt(buttonGroup, repeatButtonContainer);
      adopt(buttonGroup, continueButtonContainer);
      addClickEventListener(continueButton, () =>
        this.jsPsych.finishTrial({ repeat: false })
      );
      addClickEventListener(repeatButton, () =>
        this.jsPsych.finishTrial({ repeat: true })
      );
      const videoElement = document.createElement("video");
      videoElement.height = trial.videoHeight;
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
      videoHeight: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Video height",
        default: null,
        description: "The video height in pixels",
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
