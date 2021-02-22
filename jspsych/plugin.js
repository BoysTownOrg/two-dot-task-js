import { TaskModel, Choice } from "../lib/TaskModel.js";
import { TaskController } from "../lib/TaskController.js";
import { TaskPresenter } from "../lib/TaskPresenter.js";

function addEventListener(element, event, f) {
  element.addEventListener(event, f);
}

function addClickEventListener(element, f) {
  addEventListener(element, "click", f);
}

function documentElement() {
  return document.createElement("div");
}

function pixelsString(a) {
  return `${a}px`;
}

function circleElementWithColor(color) {
  const circle = documentElement();
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

function adopt(parent, child) {
  parent.append(child);
}

function clear(parent) {
  // https://stackoverflow.com/a/3955238
  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
}

class TaskUI {
  constructor(parent, imageUrl) {
    this.parent = parent;
    const grid = documentElement();
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(2, 1fr)";
    grid.style.gridTemplateRows = "repeat(2, 1fr)";
    grid.style.gridGap = `${pixelsString(20)} ${pixelsString(20)}`;
    adopt(parent, grid);
    const image = new Image();
    image.src = imageUrl;
    window.addEventListener("load", (event) => {
      image.height = image.naturalHeight / 4;
      image.width = image.naturalWidth / 4;
    });
    image.style.gridRow = 1;
    image.style.gridColumn = "1 / 3";
    adopt(grid, image);
    this.firstDot = circleElementWithColor("black");
    this.firstDot.style.gridRow = 2;
    this.firstDot.style.gridColumn = 1;
    adopt(grid, this.firstDot);
    addClickEventListener(this.firstDot, (e) => {
      this.observer.notifyThatFirstDotHasBeenTouched();
    });
    this.secondDot = circleElementWithColor("black");
    this.secondDot.style.gridRow = 2;
    this.secondDot.style.gridColumn = 2;
    adopt(grid, this.secondDot);
    addClickEventListener(this.secondDot, (e) => {
      this.observer.notifyThatSecondDotHasBeenTouched();
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
      this.observer.notifyThatStimulusPlaybackHasEnded();
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
      clear(display_element);
      const taskUI = new TaskUI(display_element, trial.imageUrl);
      const audioPlayer = new WebAudioPlayer(
        trial.stimulusUrl,
        trial.feedbackUrl
      );
      new TaskController(
        taskUI,
        new TaskModel(
          audioPlayer,
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
        )
      );
      audioPlayer.playStimulus();
    },
    info: {
      parameters: {},
    },
  };
}
