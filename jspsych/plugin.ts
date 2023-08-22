import {
  Choice,
  createTaskModel,
  createTaskModelWithDelayedFeedback,
  createTaskModelWithoutFeedback,
} from "../lib/TaskModel.js";
import { TaskController } from "../lib/TaskController.js";
import {
  createTaskPresenter,
  createTaskPresenterWithDeferredFinish,
  createTaskPresenterWithDelayedFinish,
} from "../lib/TaskPresenter.js";
import { runVisualRepetitionTrial } from "../lib/visual-repetition-trial.js";

import { JsPsych, JsPsychPlugin, ParameterType } from "jspsych";

function addClickEventListener(
  element: HTMLElement,
  f: (this: HTMLElement, ev: MouseEvent) => any,
) {
  element.addEventListener("click", f);
}

function divElement() {
  return document.createElement("div");
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
  const button = document.createElement("button");
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
    diameterPixels / 2 + borderWidthPixels,
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

class TaskUI {
  private parent;
  private jsPsych: JsPsych;
  private firstDot: HTMLElement;
  private secondDot: HTMLElement;
  private observer;
  private continueButton: HTMLButtonElement;
  private repeatButton: HTMLButtonElement;

  constructor(jsPsych, parent, imageUrl, imageHeight) {
    this.parent = parent;
    this.jsPsych = jsPsych;
    const image = new Image();
    image.src = imageUrl;
    image.style.height = pixelsString(imageHeight);
    image.style.width = "auto";
    adopt(parent, image);
    [this.firstDot, this.secondDot] = createTwoDotsInside(parent);
    addClickEventListener(this.firstDot, () => {
      this.observer.notifyThatFirstDotHasBeenTouched();
    });
    addClickEventListener(this.secondDot, () => {
      this.observer.notifyThatSecondDotHasBeenTouched();
    });
    const belowTwoDots = buttonGroupElement();
    adopt(parent, belowTwoDots);
    const continueButtonContainer = buttonContainerElement();
    this.continueButton = buttonElement();
    adopt(continueButtonContainer, this.continueButton);
    this.continueButton.textContent = "Continue";
    this.continueButton.style.visibility = "hidden";
    const repeatButtonContainer = buttonContainerElement();
    this.repeatButton = buttonElement();
    adopt(repeatButtonContainer, this.repeatButton);
    this.repeatButton.textContent = "Repeat";
    this.repeatButton.style.visibility = "hidden";
    adopt(belowTwoDots, repeatButtonContainer);
    adopt(belowTwoDots, continueButtonContainer);
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

  finish(result) {
    finish(this, result);
  }

  deferFinish(result) {
    this.continueButton.style.visibility = "visible";
    this.repeatButton.style.visibility = "visible";
    addClickEventListener(this.continueButton, () => {
      this.jsPsych.finishTrial({ ...result, repeat: false });
    });
    addClickEventListener(this.repeatButton, () => {
      this.jsPsych.finishTrial({ ...result, repeat: true });
    });
  }

  attach(observer) {
    attach(this, observer);
  }
}

function resizableCircleElementWithColor(color) {
  const circle = document.createElement("div");
  const circleDiameter = "17.5vh";
  circle.style.height = circleDiameter;
  circle.style.width = circleDiameter;
  circle.style.borderRadius = "50%";
  const borderWidthPixels = 2;
  circle.style.border = `${pixelsString(borderWidthPixels)} solid black`;
  circle.style.backgroundColor = color;
  return circle;
}

function centerElementAtPercentage(element, x, y) {
  element.style.bottom = `${x}%`;
  element.style.right = `${y}%`;
  element.style.transform = "translate(50%, 50%)";
}

function addVideoWithBackground(parent, videoElement) {
  const videoBackground = document.createElement("div");
  videoBackground.style.position = "fixed";
  videoBackground.style.top = "50%";
  videoBackground.style.left = "25%";
  videoBackground.style.transform = "translate(-50%, -50%)";
  videoBackground.style.backgroundColor = "black";
  const videoBackgroundViewportWidth = 50;
  videoBackground.style.width = `${videoBackgroundViewportWidth}vw`;
  videoBackground.style.height = `${
    (1080 * videoBackgroundViewportWidth) / 1920
  }vw`;
  adopt(parent, videoBackground);

  videoElement.style.position = "fixed";
  videoElement.style.top = "50%";
  videoElement.style.left = "50%";
  videoElement.style.transform = "translate(-50%, -50%)";
  videoElement.style.maxWidth = "100%";
  adopt(videoBackground, videoElement);
}

function centerRightImageFromUrl(url) {
  const image = new Image();
  image.decoding = "sync";
  image.src = url;
  image.style.position = "fixed";
  image.style.top = "50%";
  image.style.right = "25%";
  image.style.maxWidth = "50%";
  image.style.maxHeight = "40%";
  image.style.transform = "translate(50%, -50%)";
  return image;
}

function centerRightImage(trial) {
  return centerRightImageFromUrl(trial.imageUrl);
}

class TaskWithVideoUI {
  private parent: HTMLElement;
  private jsPsych: JsPsych;
  private firstDot: HTMLElement;
  private secondDot: HTMLElement;
  private observer;
  private continueButton: HTMLButtonElement;
  private repeatButton: HTMLButtonElement;

  constructor(jsPsych, parent, videoElement, imageUrl) {
    this.parent = parent;
    this.jsPsych = jsPsych;
    const dotBottomPercent = 20;
    const dotHorizontalMarginPercent = 12;
    this.firstDot = resizableCircleElementWithColor("black");
    this.firstDot.style.position = "fixed";
    centerElementAtPercentage(
      this.firstDot,
      dotBottomPercent,
      50 - dotHorizontalMarginPercent,
    );
    adopt(parent, this.firstDot);

    this.secondDot = resizableCircleElementWithColor("black");
    this.secondDot.style.position = "fixed";
    centerElementAtPercentage(
      this.secondDot,
      dotBottomPercent,
      dotHorizontalMarginPercent,
    );
    adopt(parent, this.secondDot);

    const image = centerRightImageFromUrl(imageUrl);
    adopt(parent, image);

    addClickEventListener(this.firstDot, () => {
      this.observer.notifyThatFirstDotHasBeenTouched();
    });
    addClickEventListener(this.secondDot, () => {
      this.observer.notifyThatSecondDotHasBeenTouched();
    });
    const endTrialButtons = buttonGroupElement();
    adopt(parent, endTrialButtons);
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
    adopt(endTrialButtons, repeatButtonContainer);
    adopt(endTrialButtons, continueButtonContainer);
    addClickEventListener(this.repeatButton, () => {
      jsPsych.finishTrial({ repeat: true });
    });
    addVideoWithBackground(parent, videoElement);
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

  finish(result) {
    finish(this, result);
  }

  finishWithDelaySeconds(result, t) {
    const milliseconds = t * 1000;
    this.jsPsych.pluginAPI.setTimeout(() => finish(this, result), milliseconds);
  }

  attach(observer) {
    attach(this, observer);
  }
}

function notifyThatPlaybackTimeHasUpdated(observer) {
  observer.notifyThatPlaybackTimeHasUpdated();
}

class WebAudioPlayer {
  private jsPsych: JsPsych;
  private stimulusUrl: string;
  private feedbackUrl: string;
  private audioContext;
  private observer;
  private startTime;

  constructor(jsPsych: JsPsych, stimulusUrl, feedbackUrl) {
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
        this.observer,
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

function playVideo(videoElement) {
  videoElement.style.visibility = "visible";
  videoElement.play();
}

function onVideoEnd(videoElement, f) {
  videoElement.onended = () => {
    videoElement.style.visibility = "hidden";
    f();
  };
}

class WebVideoPlayer {
  private jsPsych: JsPsych;
  private stimulusUrl: string;
  private feedbackUrl: string;
  private videoElement: HTMLVideoElement;
  private observer;

  constructor(jsPsych, videoElement, stimulusUrl, feedbackUrl) {
    this.jsPsych = jsPsych;
    this.stimulusUrl = stimulusUrl;
    this.feedbackUrl = feedbackUrl;
    this.videoElement = videoElement;
  }

  playFeedback() {
    this.videoElement.src = this.jsPsych.pluginAPI.getVideoBuffer(
      this.feedbackUrl,
    );
    onVideoEnd(this.videoElement, () => {
      this.observer.notifyThatFeedbackHasEnded();
    });
    playVideo(this.videoElement);
  }

  playFeedbackAfterSeconds(t) {
    const milliseconds = t * 1000;
    this.jsPsych.pluginAPI.setTimeout(() => {
      this.videoElement.src = this.jsPsych.pluginAPI.getVideoBuffer(
        this.feedbackUrl,
      );
      onVideoEnd(this.videoElement, () => {
        this.observer.notifyThatFeedbackHasEnded();
      });
      playVideo(this.videoElement);
    }, milliseconds);
  }

  playStimulus() {
    this.videoElement.src = this.jsPsych.pluginAPI.getVideoBuffer(
      this.stimulusUrl,
    );
    this.videoElement.ontimeupdate = () => {
      notifyThatPlaybackTimeHasUpdated(this.observer);
    };
    onVideoEnd(this.videoElement, () => {
      this.observer.notifyThatPlaybackHasEnded();
    });
    playVideo(this.videoElement);
  }

  currentTimeSeconds() {
    return this.videoElement.currentTime;
  }

  attach(observer) {
    this.observer = observer;
  }
}

function imageParameter() {
  return {
    imageUrl: {
      type: ParameterType.IMAGE,
      pretty_name: "Image URL",
      default: "",
      description: "The image",
    },
  };
}

function twoDotCommonParameters() {
  return {
    ...imageParameter(),
    firstChoiceOnsetTimeSeconds: {
      type: ParameterType.FLOAT,
      pretty_name: "First choice onset time",
      default: 0,
      description: "The first choice onset time in seconds",
    },
    firstChoiceOffsetTimeSeconds: {
      type: ParameterType.FLOAT,
      pretty_name: "First choice offset time",
      default: 0,
      description: "The first choice offset time in seconds",
    },
    secondChoiceOnsetTimeSeconds: {
      type: ParameterType.FLOAT,
      pretty_name: "Second choice onset time",
      default: 0,
      description: "The second choice onset time in seconds",
    },
    secondChoiceOffsetTimeSeconds: {
      type: ParameterType.FLOAT,
      pretty_name: "Second choice offset time",
      default: 0,
      description: "The second choice offset time in seconds",
    },
    firstWord: {
      type: ParameterType.STRING,
      pretty_name: "First word",
      default: "",
      description: "The word represented by the first choice",
    },
    secondWord: {
      type: ParameterType.STRING,
      pretty_name: "Second word",
      default: "",
      description: "The word represented by the second choice",
    },
    correctWord: {
      type: ParameterType.STRING,
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

export function twoDot() {
  const info = {
    name: "two-dot",
    description: "",
    parameters: {
      stimulusUrl: {
        type: ParameterType.AUDIO,
        pretty_name: "Stimulus URL",
        default: "",
        description: "The stimulus audio",
      },
      feedbackUrl: {
        type: ParameterType.AUDIO,
        pretty_name: "Feedback URL",
        default: "",
        description: "The feedback audio",
      },
      imageHeight: {
        type: ParameterType.INT,
        pretty_name: "Image height",
        default: null,
        description: "The image height in pixels",
      },
      ...twoDotCommonParameters(),
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      clear(display_element);
      const taskUI = new TaskUI(
        this.jsPsych,
        display_element,
        trial.imageUrl,
        trial.imageHeight,
      );
      startController(
        taskUI,
        createTaskModel(
          new WebAudioPlayer(
            this.jsPsych,
            trial.stimulusUrl,
            trial.feedbackUrl,
          ),
          createTaskPresenter(taskUI),
          choiceTimesSeconds(trial),
          words(trial),
          trial.correctWord,
        ),
      );
    }
  }

  Plugin.info = info;
  return Plugin;
}

export function twoDotPractice() {
  const info = {
    name: "two-dot",
    description: "",
    parameters: {
      stimulusUrl: {
        type: ParameterType.AUDIO,
        pretty_name: "Stimulus URL",
        default: "",
        description: "The stimulus audio",
      },
      feedbackUrl: {
        type: ParameterType.AUDIO,
        pretty_name: "Feedback URL",
        default: "",
        description: "The feedback audio",
      },
      imageHeight: {
        type: ParameterType.INT,
        pretty_name: "Image height",
        default: null,
        description: "The image height in pixels",
      },
      ...twoDotCommonParameters(),
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      clear(display_element);
      const taskUI = new TaskUI(
        this.jsPsych,
        display_element,
        trial.imageUrl,
        trial.imageHeight,
      );
      startController(
        taskUI,
        createTaskModel(
          new WebAudioPlayer(
            this.jsPsych,
            trial.stimulusUrl,
            trial.feedbackUrl,
          ),
          createTaskPresenterWithDeferredFinish(taskUI),
          choiceTimesSeconds(trial),
          words(trial),
          trial.correctWord,
        ),
      );
    }
  }

  Plugin.info = info;
  return Plugin;
}

function createTwoDotsInside(parent) {
  const twoDotGrid = divElement();
  twoDotGrid.style.gridTemplateColumns = `1fr ${pixelsString(
    250,
  )} ${pixelsString(250)} 1fr`;
  twoDotGrid.style.gridGap = `${pixelsString(120)}`;
  const firstDot = circleElementWithColor("black");
  firstDot.style.gridColumn = "2";
  const secondDot = circleElementWithColor("black");
  secondDot.style.gridColumn = "3";
  twoDotGrid.style.display = "grid";
  adopt(twoDotGrid, firstDot);
  adopt(twoDotGrid, secondDot);
  adopt(parent, twoDotGrid);
  return [firstDot, secondDot];
}

function createContinueButtonInside(parent) {
  const continueButtonContainer = buttonContainerElement();
  const continueButton = buttonElement();
  adopt(continueButtonContainer, continueButton);
  continueButton.textContent = "Continue";
  adopt(parent, continueButtonContainer);
  return continueButton;
}

export function twoDotLive() {
  const info = {
    name: "two-dot-practice",
    description: "",
    parameters: {
      imageHeight: {
        type: ParameterType.INT,
        pretty_name: "Image height",
        default: null,
        description: "The image height in pixels",
      },
      ...imageParameter(),
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      const parent = display_element;
      clear(parent);
      const image = imageFromUrlAndHeight(trial.imageUrl, trial.imageHeight);
      adopt(parent, image);
      createTwoDotsInside(parent);
      const belowTwoDots = buttonGroupElement();
      adopt(parent, belowTwoDots);
      const continueButton = createContinueButtonInside(belowTwoDots);
      addClickEventListener(continueButton, () => {
        this.jsPsych.finishTrial();
      });
    }
  }

  Plugin.info = info;
  return Plugin;
}

function videoStimulusParameter() {
  return {
    stimulusUrl: {
      type: ParameterType.VIDEO,
      pretty_name: "Stimulus URL",
      default: "",
      description: "The stimulus video",
    },
  };
}

export function twoDotWithVideo() {
  const info = {
    name: "two-dot-with-video",
    description: "",
    parameters: {
      ...videoStimulusParameter(),
      feedbackUrl: {
        type: ParameterType.VIDEO,
        pretty_name: "Feedback URL",
        default: "",
        description: "The feedback video",
      },
      ...twoDotCommonParameters(),
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

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
      );
      startController(
        taskUI,
        createTaskModelWithDelayedFeedback(
          new WebVideoPlayer(
            this.jsPsych,
            videoElement,
            trial.stimulusUrl,
            trial.feedbackUrl,
          ),
          createTaskPresenter(taskUI),
          choiceTimesSeconds(trial),
          words(trial),
          trial.correctWord,
          1,
        ),
      );
    }
  }

  Plugin.info = info;
  return Plugin;
}

export function twoDotWithoutFeedback() {
  const info = {
    name: "two-dot-without-feedback",
    description: "",
    parameters: {
      stimulusUrl: {
        type: ParameterType.AUDIO,
        pretty_name: "Stimulus URL",
        default: "",
        description: "The stimulus audio",
      },
      imageHeight: {
        type: ParameterType.INT,
        pretty_name: "Image height",
        default: null,
        description: "The image height in pixels",
      },
      ...twoDotCommonParameters(),
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      clear(display_element);
      const taskUI = new TaskUI(
        this.jsPsych,
        display_element,
        trial.imageUrl,
        trial.imageHeight,
      );
      startController(
        taskUI,
        createTaskModelWithoutFeedback(
          new WebAudioPlayer(this.jsPsych, trial.stimulusUrl, ""),
          createTaskPresenter(taskUI),
          choiceTimesSeconds(trial),
          words(trial),
          trial.correctWord,
        ),
      );
    }
  }

  Plugin.info = info;
  return Plugin;
}

export function twoDotWithVideoWithoutFeedback() {
  const info = {
    name: "two-dot-with-video-without-feedback",
    description: "",
    parameters: {
      ...videoStimulusParameter(),
      ...twoDotCommonParameters(),
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

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
      );
      startController(
        taskUI,
        createTaskModelWithoutFeedback(
          new WebVideoPlayer(this.jsPsych, videoElement, trial.stimulusUrl, ""),
          createTaskPresenterWithDelayedFinish(taskUI, 1),
          choiceTimesSeconds(trial),
          words(trial),
          trial.correctWord,
        ),
      );
    }
  }

  Plugin.info = info;
  return Plugin;
}

function initializeRepeatableTrial(
  jsPsych,
  buttonGroup,
  continueButton,
  repeatButton,
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
    jsPsych.finishTrial({ repeat: false }),
  );
  addClickEventListener(repeatButton, () =>
    jsPsych.finishTrial({ repeat: true }),
  );
}

export function imageAudioButtonResponse() {
  const info = {
    name: "image-audio-button-response",
    parameters: {
      stimulusUrl: {
        type: ParameterType.AUDIO,
        pretty_name: "Stimulus URL",
        default: "",
        description: "The stimulus audio",
      },
      ...imageParameter(),
      imageHeight: {
        type: ParameterType.INT,
        pretty_name: "Image height",
        default: null,
        description: "The image height in pixels",
      },
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

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
        repeatButton,
      );
      audioBufferSource(this.jsPsych, trial.stimulusUrl).then(
        (stimulusSource) => {
          stimulusSource.onended = () => {
            continueButton.style.visibility = "visible";
            repeatButton.style.visibility = "visible";
          };
          stimulusSource.start();
        },
      );
    }
  }
  Plugin.info = info;
  return Plugin;
}

export function imageVideoPlaceholderButtonResponse() {
  const info = {
    name: "image-video-placeholder-button-response",
    parameters: {
      ...imageParameter(),
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement, trial) {
      clear(displayElement);

      const image = centerRightImage(trial);
      adopt(displayElement, image);

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
  Plugin.info = info;
  return Plugin;
}

function videoElementThatShowsButtons(
  displayElement,
  continueButton,
  repeatButton,
) {
  const videoElement = document.createElement("video");
  addVideoWithBackground(displayElement, videoElement);
  onVideoEnd(videoElement, () => {
    continueButton.style.visibility = "visible";
    repeatButton.style.visibility = "visible";
  });
  return videoElement;
}

export function imageVideoButtonResponse() {
  const info = {
    name: "image-video-button-response",
    parameters: {
      ...videoStimulusParameter(),
      ...imageParameter(),
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement, trial) {
      clear(displayElement);

      const image = centerRightImage(trial);
      adopt(displayElement, image);

      const buttonGroup = buttonGroupElement();
      adopt(displayElement, buttonGroup);
      const continueButton = buttonElement();
      const repeatButton = buttonElement();
      initializeRepeatableTrial(
        this.jsPsych,
        buttonGroup,
        continueButton,
        repeatButton,
      );

      const videoElement = videoElementThatShowsButtons(
        displayElement,
        continueButton,
        repeatButton,
      );

      videoElement.src = this.jsPsych.pluginAPI.getVideoBuffer(
        trial.stimulusUrl,
      );
      playVideo(videoElement);
    }
  }
  Plugin.info = info;
  return Plugin;
}

export function imageVideoNoResponse() {
  const info = {
    name: "image-video-no-response",
    parameters: {
      ...videoStimulusParameter(),
      ...imageParameter(),
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement, trial) {
      clear(displayElement);

      const image = centerRightImage(trial);
      adopt(displayElement, image);

      const videoElement = document.createElement("video");
      addVideoWithBackground(displayElement, videoElement);
      onVideoEnd(videoElement, () => {
        this.jsPsych.finishTrial();
      });

      videoElement.src = this.jsPsych.pluginAPI.getVideoBuffer(
        trial.stimulusUrl,
      );
      playVideo(videoElement);
    }
  }
  Plugin.info = info;
  return Plugin;
}

class VisualRepetitionTrialImagePresenter {
  private imageElement: HTMLImageElement;

  constructor(imageElement) {
    this.imageElement = imageElement;
  }

  showImage() {
    this.imageElement.style.visibility = "visible";
  }
}

class VisualRepetitionTrialAudioPlayer {
  private videoElement: HTMLVideoElement;

  constructor(videoElement) {
    this.videoElement = videoElement;
  }

  currentTimeSeconds() {
    return this.videoElement.currentTime;
  }

  attachTimeUpdateHandler(handler) {
    this.videoElement.ontimeupdate = () => {
      handler();
    };
  }
}

export function visualRepetitionTrial() {
  const info = {
    name: "visual-repetition-trial",
    parameters: {
      ...videoStimulusParameter(),
      ...imageParameter(),
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement, trial) {
      clear(displayElement);

      const image = centerRightImage(trial);
      adopt(displayElement, image);
      image.style.visibility = "hidden";

      const buttonGroup = buttonGroupElement();
      adopt(displayElement, buttonGroup);
      const continueButton = buttonElement();
      const repeatButton = buttonElement();
      initializeRepeatableTrial(
        this.jsPsych,
        buttonGroup,
        continueButton,
        repeatButton,
      );

      const videoElement = videoElementThatShowsButtons(
        displayElement,
        continueButton,
        repeatButton,
      );

      videoElement.src = this.jsPsych.pluginAPI.getVideoBuffer(
        trial.stimulusUrl,
      );

      const player = new VisualRepetitionTrialAudioPlayer(videoElement);
      const presenter = new VisualRepetitionTrialImagePresenter(image);
      runVisualRepetitionTrial(player, presenter, 1.5);

      playVideo(videoElement);
    }
  }
  Plugin.info = info;
  return Plugin;
}

export function stopwatch() {
  const info = {
    name: "stopwatch",
    description: "",
    parameters: {
      text: {
        type: ParameterType.STRING,
        pretty_name: "Displayed Text",
        default: "",
        description: "The text that is displayed",
      },
      alarmTimeSeconds: {
        type: ParameterType.INT,
        pretty_name: "Alarm time seconds",
        default: "",
        description: "The alarm time in seconds",
      },
    },
  };

  class Plugin implements JsPsychPlugin<typeof info> {
    private jsPsych: JsPsych;
    static info;

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
  Plugin.info = info;
  return Plugin;
}
