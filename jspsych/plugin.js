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
  constructor(parent) {
    this.parent = parent;
    const grid = documentElement();
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(2, 1fr)";
    grid.style.gridTemplateRows = "repeat(2, 1fr)";
    grid.style.gridGap = `${pixelsString(20)} ${pixelsString(20)}`;
    adopt(parent, grid);
    this.firstDot = circleElementWithColor("black");
    this.firstDot.style.gridRow = 1;
    this.firstDot.style.gridColumn = 0;
    adopt(grid, this.firstDot);
    addClickEventListener(this.firstDot, (e) => {
      this.observer.notifyThatFirstDotHasBeenTouched();
    });
    this.secondDot = circleElementWithColor("black");
    this.secondDot.style.gridRow = 1;
    this.secondDot.style.gridColumn = 0;
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

class TBDAudioPlayer {
  constructor(stimulusUrl) {
    this.player = document.createElement("audio");
    this.player.src = stimulusUrl;
    this.player.ontimeupdate = (event) => {
      this.observer.notifyThatPlaybackTimeHasUpdated();
    };
    this.player.onended = (event) => {
      this.observer.notifyThatStimulusPlaybackHasEnded();
    };
  }

  playFeedback() {}

  playStimulus() {
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
      const audioPlayer = new TBDAudioPlayer(trial.stimulusUrl);
      new TaskController(
        new TaskUI(display_element),
        new TaskModel(
          audioPlayer,
          new TaskPresenter(),
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
