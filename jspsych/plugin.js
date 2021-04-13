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
    const grid = utility.gridElement(2, 3);
    utility.adopt(parent, grid);
    this.firstDot = circleElementWithColor("black");
    this.firstDot.style.gridRow = 1;
    this.firstDot.style.gridColumn = 1;
    utility.adopt(grid, this.firstDot);
    utility.addClickEventListener(this.firstDot, () => {
      this.observer.notifyThatFirstDotHasBeenTouched();
    });
    this.secondDot = circleElementWithColor("black");
    this.secondDot.style.gridRow = 1;
    this.secondDot.style.gridColumn = 3;
    utility.adopt(grid, this.secondDot);
    utility.addClickEventListener(this.secondDot, () => {
      this.observer.notifyThatSecondDotHasBeenTouched();
    });
    const buttonContainer = utility.buttonContainerElement();
    utility.adopt(grid, buttonContainer);
    buttonContainer.style.gridRow = 2;
    buttonContainer.style.gridColumn = 2;
    this.continueButton = utility.buttonElement();
    this.continueButton.textContent = "Continue";
    this.continueButton.style.visibility = "hidden";
    utility.adopt(buttonContainer, this.continueButton);
    utility.addClickEventListener(this.continueButton, () => {
      jsPsych.finishTrial();
    });
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
