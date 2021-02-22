import { plugin } from "./plugin.js";

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

function adopt(parent, child) {
  parent.append(child);
}

function clear(parent) {
  // https://stackoverflow.com/a/3955238
  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
}

jsPsych.plugins["image-audio-button-response"] = {
  trial(display_element, trial) {
    clear(display_element);
    const grid = documentElement();
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(1, 1fr)";
    grid.style.gridTemplateRows = "repeat(2, 1fr)";
    grid.style.gridGap = `${pixelsString(20)} ${pixelsString(20)}`;
    adopt(display_element, grid);
    const image = new Image();
    image.src = trial.imageUrl;
    image.style.gridRow = 1;
    image.style.gridColumn = 1;
    adopt(grid, image);
    const button = document.createElement("button");
    button.className = "jspsych-btn";
    button.textContent = "Continue";
    button.style.gridRow = 2;
    button.style.gridColumn = 1;
    adopt(grid, button);
    addClickEventListener(button, (e) => {
      jsPsych.finishTrial();
    });
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const player = document.createElement("audio");
    const track = audioContext.createMediaElementSource(player);
    track.connect(audioContext.destination);
    player.src = trial.stimulusUrl;
    player.play();
  },
  info: {
    parameters: {},
  },
};

const twoDotPluginId = "two-dot";
jsPsych.plugins[twoDotPluginId] = plugin();

jsPsych.init({
  timeline: [
    {
      type: "image-button-response",
      stimulus: "cat.png",
      choices: ["Continue"],
      prompt: "",
    },
    {
      type: "image-audio-button-response",
      stimulusUrl: "clock.wav",
      imageUrl: "clock.png",
    },
    {
      type: twoDotPluginId,
      stimulusUrl: "bird.wav",
      feedbackUrl: "2A spoiled child is a brat.wav",
      imageUrl: "bird.png",
      firstChoiceOnsetTimeSeconds: 2.9,
      firstChoiceOffsetTimeSeconds: 3.65,
      secondChoiceOnsetTimeSeconds: 4.4,
      secondChoiceOffsetTimeSeconds: 5.15,
    },
  ],
});
