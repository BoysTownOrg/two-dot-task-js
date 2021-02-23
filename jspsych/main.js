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

function startImageMultiAudioButtonResponseTrial(display_element, trial) {
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
  const buttonContainer = documentElement();
  buttonContainer.className = "jspsych-image-button-response-button";
  buttonContainer.style.display = "inline-block";
  buttonContainer.style.margin = `${pixelsString(8)} ${pixelsString(0)}`;
  adopt(grid, buttonContainer);
  buttonContainer.style.gridRow = 2;
  buttonContainer.style.gridColumn = 1;
  const button = document.createElement("button");
  button.className = "jspsych-btn";
  button.textContent = "Continue";
  adopt(buttonContainer, button);
  addClickEventListener(button, (e) => {
    jsPsych.finishTrial();
  });
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  const players = [];
  let playersReadyToPlay = 0;
  trial.stimulusUrl.forEach((url) => {
    const player = document.createElement("audio");
    const track = audioContext.createMediaElementSource(player);
    track.connect(audioContext.destination);
    player.src = url;
    players.push(player);
    player.oncanplay = (e) => {
      playersReadyToPlay += 1;
      if (playersReadyToPlay === trial.stimulusUrl.length)
        players.forEach((p) => {
          p.play();
        });
    };
  });
}

jsPsych.plugins["image-multi-audio-button-response"] = {
  trial(display_element, trial) {
    startImageMultiAudioButtonResponseTrial(display_element, trial);
  },
  info: {
    parameters: {},
  },
};

jsPsych.plugins["image-audio-button-response"] = {
  trial(display_element, trial) {
    startImageMultiAudioButtonResponseTrial(display_element, {
      stimulusUrl: [trial.stimulusUrl],
      imageUrl: trial.imageUrl,
    });
  },
  info: {
    parameters: {},
  },
};

jsPsych.plugins["image-audio-with-feedback-button-response"] = {
  trial(display_element, trial) {
    clear(display_element);
    const grid = documentElement();
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(1, 1fr)";
    grid.style.gridTemplateRows = "repeat(3, 1fr)";
    grid.style.gridGap = `${pixelsString(20)} ${pixelsString(20)}`;
    adopt(display_element, grid);
    const image = new Image();
    image.src = trial.imageUrl;
    image.style.gridRow = 1;
    image.style.gridColumn = 1;
    adopt(grid, image);
    const continueButtonContainer = documentElement();
    continueButtonContainer.className = "jspsych-image-button-response-button";
    continueButtonContainer.style.display = "inline-block";
    continueButtonContainer.style.margin = `${pixelsString(8)} ${pixelsString(
      0
    )}`;
    adopt(grid, continueButtonContainer);
    continueButtonContainer.style.gridRow = 3;
    continueButtonContainer.style.gridColumn = 1;
    const feedbackButtonContainer = documentElement();
    feedbackButtonContainer.className = "jspsych-image-button-response-button";
    feedbackButtonContainer.style.display = "inline-block";
    feedbackButtonContainer.style.margin = `${pixelsString(8)} ${pixelsString(
      0
    )}`;
    adopt(grid, feedbackButtonContainer);
    feedbackButtonContainer.style.gridRow = 2;
    feedbackButtonContainer.style.gridColumn = 1;
    const continueButton = document.createElement("button");
    continueButton.className = "jspsych-btn";
    continueButton.textContent = "Continue";
    adopt(continueButtonContainer, continueButton);
    addClickEventListener(continueButton, (e) => {
      jsPsych.finishTrial();
    });
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const player = document.createElement("audio");
    const track = audioContext.createMediaElementSource(player);
    track.connect(audioContext.destination);
    player.src = trial.stimulusUrl;
    player.play();
    const feedbackPlayer = document.createElement("audio");
    const feedbackTrack = audioContext.createMediaElementSource(feedbackPlayer);
    feedbackTrack.connect(audioContext.destination);
    feedbackPlayer.src = trial.feedbackUrl;
    const feedbackButton = document.createElement("button");
    feedbackButton.className = "jspsych-btn";
    feedbackButton.textContent = "Feedback";
    adopt(feedbackButtonContainer, feedbackButton);
    continueButton.style.gridRow = 1;
    continueButton.style.gridColumn = 1;
    addClickEventListener(feedbackButton, (e) => {
      feedbackPlayer.play();
    });
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
      stimulus_width: 500,
      choices: ["Continue"],
      prompt: "",
    },
    {
      type: "image-audio-button-response",
      stimulusUrl: "clock.wav",
      imageUrl: "clock.png",
    },
    {
      type: "image-multi-audio-button-response",
      stimulusUrl: ["binnip.wav", "clock.wav"],
      imageUrl: "binnip.png",
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
    {
      type: "image-button-response",
      stimulus: "dog1.png",
      stimulus_width: 500,
      choices: ["Continue"],
      prompt: "",
    },
    {
      type: "image-audio-with-feedback-button-response",
      stimulusUrl: "clock.wav",
      feedbackUrl: "2A spoiled child is a brat.wav",
      imageUrl: "clock.png",
    },
  ],
});
