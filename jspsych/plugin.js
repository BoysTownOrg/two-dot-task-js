import { TaskModel, Choice } from "../lib/TaskModel.js";
import { TaskController } from "../lib/TaskController.js";
import { TaskPresenter } from "../lib/TaskPresenter.js";
import * as utility from "./utility.js";

function circleElementWithColor(color) {
  const circle = utility.divElement();
  const diameterPixels = 100;
  circle.style.height = utility.pixelsString(diameterPixels);
  circle.style.width = utility.pixelsString(diameterPixels);
  const borderWidthPixels = 2;
  circle.style.borderRadius = utility.pixelsString(
    diameterPixels / 2 + borderWidthPixels
  );
  circle.style.border = `${utility.pixelsString(
    borderWidthPixels
  )} solid black`;
  circle.style.margin = "auto";
  circle.style.backgroundColor = color;
  return circle;
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
    utility.adopt(parent, image);
    const twoDotGrid = utility.divElement();
    twoDotGrid.style.display = "grid";
    twoDotGrid.style.gridTemplateColumns = `1fr ${utility.pixelsString(
      125
    )} ${utility.pixelsString(125)} 1fr`;
    twoDotGrid.style.gridGap = `${utility.pixelsString(120)}`;
    this.firstDot = circleElementWithColor("black");
    this.firstDot.style.gridRow = 1;
    this.firstDot.style.gridColumn = 2;
    utility.adopt(twoDotGrid, this.firstDot);
    utility.addClickEventListener(this.firstDot, () => {
      this.observer.notifyThatFirstDotHasBeenTouched();
    });
    this.secondDot = circleElementWithColor("black");
    this.secondDot.style.gridRow = 1;
    this.secondDot.style.gridColumn = 3;
    utility.addClickEventListener(this.secondDot, () => {
      this.observer.notifyThatSecondDotHasBeenTouched();
    });
    utility.adopt(twoDotGrid, this.secondDot);
    utility.adopt(parent, twoDotGrid);
    const belowTwoDots = utility.divElement();
    const buttonContainer = utility.buttonContainerElement();
    buttonContainer.style.gridRow = 2;
    buttonContainer.style.gridColumn = 2;
    this.continueButton = utility.buttonElement();
    this.continueButton.textContent = "Continue";
    this.continueButton.style.visibility = "hidden";
    utility.addClickEventListener(this.continueButton, () => {
      jsPsych.finishTrial();
    });
    utility.adopt(buttonContainer, this.continueButton);
    utility.adopt(belowTwoDots, buttonContainer);
    utility.adopt(parent, belowTwoDots);
  }

  colorFirstDotRed() {
    this.firstDot.style.backgroundColor = "red";
  }

  colorFirstDotBlack() {
    this.firstDot.style.backgroundColor = "black";
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

  attach(observer) {
    this.observer = observer;
  }
}

class WebAudioPlayer {
  constructor(stimulusUrl, feedbackUrl) {
    this.player = utility.audioPlayer(stimulusUrl);
    this.stimulusUrl = stimulusUrl;
    this.feedbackUrl = feedbackUrl;
  }

  playFeedback() {
    this.player.src = this.feedbackUrl;
    this.player.ontimeupdate = () => {};
    this.player.onended = () => {
      this.observer.notifyThatFeedbackHasEnded();
    };
    this.player.play();
  }

  playStimulus() {
    this.player.src = this.stimulusUrl;
    this.player.ontimeupdate = () => {
      this.observer.notifyThatPlaybackTimeHasUpdated();
    };
    this.player.onended = () => {
      this.observer.notifyThatPlaybackHasEnded();
    };
    this.player.play();
  }

  currentTimeSeconds() {
    return this.player.currentTime;
  }

  attach(observer) {
    this.observer = observer;
  }
}

export function plugin(name) {
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
      },
    },
    trial(display_element, trial) {
      utility.clear(display_element);
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
        ])
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
      utility.clear(displayElement);
      const grid = utility.gridElement(2, 1);
      utility.adopt(displayElement, grid);
      const image = new Image();
      image.src = trial.imageUrl;
      image.onload = () => {
        image.height = trial.imageHeight;
        image.width =
          (image.naturalWidth * trial.imageHeight) / image.naturalHeight;
      };
      image.style.gridRow = 1;
      image.style.gridColumn = 1;
      utility.adopt(grid, image);
      const buttonContainer = utility.buttonContainerElement();
      utility.adopt(grid, buttonContainer);
      buttonContainer.style.gridRow = 2;
      buttonContainer.style.gridColumn = 1;
      const continueButton = utility.buttonElement();
      continueButton.textContent = "Continue";
      continueButton.style.visibility = "hidden";
      utility.adopt(buttonContainer, continueButton);
      utility.addClickEventListener(continueButton, () =>
        jsPsych.finishTrial()
      );
      const stimulusPlayer = utility.audioPlayer(trial.stimulusUrl);
      stimulusPlayer.onended = () => {
        continueButton.style.visibility = "visible";
      };
      stimulusPlayer.play();
    },
  };
}

export function imageAudioWithFeedback(id) {
  jsPsych.pluginAPI.registerPreload(id, "stimulusUrl", "audio");
  jsPsych.pluginAPI.registerPreload(id, "feedbackUrl", "audio");
  jsPsych.pluginAPI.registerPreload(id, "imageUrl", "image");

  return {
    info: {
      name: id,
      description: "",
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
      },
    },
    trial(displayElement, trial) {
      utility.clear(displayElement);
      const image = new Image();
      image.src = trial.imageUrl;
      image.onload = () => {
        image.height = trial.imageHeight;
        image.width =
          (image.naturalWidth * trial.imageHeight) / image.naturalHeight;
      };
      utility.adopt(displayElement, image);
      const belowImage = utility.divElement();
      const buttonContainer = utility.buttonContainerElement();
      const grid = utility.gridElement(2, 1);
      const continueButton = utility.buttonElement();
      continueButton.style.gridRow = 2;
      continueButton.style.gridColumn = 1;
      utility.adopt(grid, continueButton);
      const feedbackButton = utility.buttonElement();
      feedbackButton.style.gridRow = 1;
      feedbackButton.style.gridColumn = 1;
      utility.adopt(grid, feedbackButton);
      utility.adopt(buttonContainer, grid);
      utility.adopt(belowImage, buttonContainer);
      utility.adopt(displayElement, belowImage);
      continueButton.textContent = "Continue";
      continueButton.style.visibility = "hidden";
      utility.addClickEventListener(continueButton, () =>
        jsPsych.finishTrial()
      );
      const stimulusPlayer = utility.audioPlayer(trial.stimulusUrl);
      const feedbackPlayer = utility.audioPlayer(trial.feedbackUrl);
      feedbackButton.textContent = "Feedback";
      feedbackButton.style.visibility = "hidden";
      utility.addClickEventListener(feedbackButton, () =>
        feedbackPlayer.play()
      );
      stimulusPlayer.onended = () => {
        feedbackButton.style.visibility = "visible";
      };
      feedbackPlayer.onended = () => {
        continueButton.style.visibility = "visible";
      };
      stimulusPlayer.play();
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
      },
    },
    trial(displayElement, trial) {
      utility.clear(displayElement);
      const text = utility.divElement();
      text.textContent = trial.text;
      utility.adopt(displayElement, text);
      const timeContainer = document.createElement("h1");
      const time = document.createElement("time");
      time.textContent = "00:00:00";
      utility.adopt(timeContainer, time);
      utility.adopt(displayElement, timeContainer);
      const buttonContainer = utility.buttonContainerElement();
      const continueButton = utility.buttonElement();
      utility.adopt(buttonContainer, continueButton);
      utility.adopt(displayElement, buttonContainer);
      continueButton.textContent = "Continue";
      utility.addClickEventListener(continueButton, () =>
        jsPsych.finishTrial()
      );

      // modified from https://jsfiddle.net/Daniel_Hug/pvk6p/
      let seconds = 0;
      let minutes = 0;
      let hours = 0;

      function updateTime() {
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
        jsPsych.pluginAPI.setTimeout(updateTime, 1000);
      }

      jsPsych.pluginAPI.setTimeout(updateTime, 1000);
    },
  };
}
