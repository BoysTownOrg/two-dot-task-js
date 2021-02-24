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
  constructor(parent, imageUrl) {
    this.parent = parent;
    const grid = utility.grid(3, 3);
    utility.adopt(parent, grid);
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      image.height = image.naturalHeight / 4;
      image.width = image.naturalWidth / 4;
    };
    image.style.gridRow = 1;
    image.style.gridColumn = "1 / 4";
    utility.adopt(grid, image);
    this.firstDot = circleElementWithColor("black");
    this.firstDot.style.gridRow = 2;
    this.firstDot.style.gridColumn = 1;
    utility.adopt(grid, this.firstDot);
    utility.addClickEventListener(this.firstDot, (e) => {
      this.observer.notifyThatFirstDotHasBeenTouched();
    });
    this.secondDot = circleElementWithColor("black");
    this.secondDot.style.gridRow = 2;
    this.secondDot.style.gridColumn = 3;
    utility.adopt(grid, this.secondDot);
    utility.addClickEventListener(this.secondDot, (e) => {
      this.observer.notifyThatSecondDotHasBeenTouched();
    });
    const buttonContainer = utility.divElement();
    buttonContainer.className = "jspsych-image-button-response-button";
    buttonContainer.style.display = "inline-block";
    buttonContainer.style.margin = `${utility.pixelsString(
      8
    )} ${utility.pixelsString(0)}`;
    utility.adopt(grid, buttonContainer);
    buttonContainer.style.gridRow = 3;
    buttonContainer.style.gridColumn = 2;
    const button = document.createElement("button");
    button.className = "jspsych-btn";
    button.textContent = "Continue";
    utility.adopt(buttonContainer, button);
    utility.addClickEventListener(button, (e) => {
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

  attach(observer) {
    this.observer = observer;
  }
}

class WebAudioPlayer {
  constructor(stimulusUrl, feedbackUrl) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    this.player = document.createElement("audio");
    this.player.ontimeupdate = (event) => {
      this.observer.notifyThatPlaybackTimeHasUpdated();
    };
    this.player.onended = (event) => {
      this.observer.notifyThatPlaybackHasEnded();
    };
    const track = audioContext.createMediaElementSource(this.player);
    track.connect(audioContext.destination);
    this.stimulusUrl = stimulusUrl;
    this.feedbackUrl = feedbackUrl;
  }

  playFeedback() {
    this.player.src = this.feedbackUrl;
    this.player.play();
  }

  playStimulus() {
    this.player.src = this.stimulusUrl;
    this.player.play();
  }

  currentTimeSeconds() {
    return this.player.currentTime;
  }

  attach(observer) {
    this.observer = observer;
  }
}

export function plugin() {
  return {
    trial(display_element, trial) {
      utility.clear(display_element);
      const taskUI = new TaskUI(display_element, trial.imageUrl);
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
      new TaskController(taskUI, model);
      model.start();
    },
    info: {
      parameters: {},
    },
  };
}
