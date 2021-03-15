import { plugin } from "./plugin.js";
import * as utility from "./utility.js";

function startImageAudioWithNoiseButtonResponseTrial(display_element, trial) {
  utility.clear(display_element);
  const grid = utility.gridElement(2, 1);
  utility.adopt(display_element, grid);
  const image = new Image();
  image.src = trial.imageUrl;
  image.onload = () => {
    image.width = trial.imageWidth;
    image.height =
      (image.naturalHeight * trial.imageWidth) / image.naturalWidth;
  };
  image.style.gridRow = 1;
  image.style.gridColumn = 1;
  utility.adopt(grid, image);
  const buttonContainer = utility.buttonContainerElement();
  utility.adopt(grid, buttonContainer);
  buttonContainer.style.gridRow = 2;
  buttonContainer.style.gridColumn = 1;
  const button = utility.buttonElement();
  button.textContent = "Continue";
  button.style.visibility = "hidden";
  utility.adopt(buttonContainer, button);
  utility.addClickEventListener(button, (e) => {
    jsPsych.finishTrial();
  });
  const stimulusPlayer = utility.audioPlayer(trial.stimulusUrl);
  const noisePlayer = utility.audioPlayer(trial.noiseUrl);
  noisePlayer.volume = 0.3;
  let playersReadyToPlay = 0;
  stimulusPlayer.onended = () => {
    noisePlayer.pause();
    button.style.visibility = "visible";
  };
  const players = [stimulusPlayer, noisePlayer];
  players.forEach(
    (player) =>
      (player.oncanplay = () => {
        playersReadyToPlay += 1;
        if (playersReadyToPlay === players.length)
          players.forEach((p) => p.play());
      })
  );
}

function startImageAudioButtonResponseTrial(display_element, trial) {
  utility.clear(display_element);
  const grid = utility.gridElement(2, 1);
  utility.adopt(display_element, grid);
  const image = new Image();
  image.src = trial.imageUrl;
  image.onload = () => {
    image.width = trial.imageWidth;
    image.height =
      (image.naturalHeight * trial.imageWidth) / image.naturalWidth;
  };
  image.style.gridRow = 1;
  image.style.gridColumn = 1;
  utility.adopt(grid, image);
  const buttonContainer = utility.buttonContainerElement();
  utility.adopt(grid, buttonContainer);
  buttonContainer.style.gridRow = 2;
  buttonContainer.style.gridColumn = 1;
  const button = utility.buttonElement();
  button.textContent = "Continue";
  button.style.visibility = "hidden";
  utility.adopt(buttonContainer, button);
  utility.addClickEventListener(button, (e) => {
    jsPsych.finishTrial();
  });
  const stimulusPlayer = utility.audioPlayer(trial.stimulusUrl);
  stimulusPlayer.onended = () => {
    button.style.visibility = "visible";
  };
  stimulusPlayer.play();
}

jsPsych.plugins["image-multi-audio-button-response"] = {
  trial(display_element, trial) {
    startImageAudioWithNoiseButtonResponseTrial(display_element, trial);
  },
  info: {
    parameters: {},
  },
};

jsPsych.plugins["image-audio-button-response"] = {
  trial(display_element, trial) {
    startImageAudioButtonResponseTrial(display_element, trial);
  },
  info: {
    parameters: {},
  },
};

jsPsych.plugins["image-audio-with-feedback-button-response"] = {
  trial(display_element, trial) {
    utility.clear(display_element);
    const grid = utility.gridElement(3, 1);
    utility.adopt(display_element, grid);
    const image = new Image();
    image.src = trial.imageUrl;
    image.style.gridRow = 1;
    image.style.gridColumn = 1;
    utility.adopt(grid, image);
    const continueButtonContainer = utility.buttonContainerElement();
    utility.adopt(grid, continueButtonContainer);
    continueButtonContainer.style.gridRow = 3;
    continueButtonContainer.style.gridColumn = 1;
    const feedbackButtonContainer = utility.buttonContainerElement();
    utility.adopt(grid, feedbackButtonContainer);
    feedbackButtonContainer.style.gridRow = 2;
    feedbackButtonContainer.style.gridColumn = 1;
    const continueButton = utility.buttonElement();
    continueButton.textContent = "Continue";
    utility.adopt(continueButtonContainer, continueButton);
    utility.addClickEventListener(continueButton, (e) => {
      jsPsych.finishTrial();
    });
    const player = utility.audioPlayer(trial.stimulusUrl);
    player.play();
    const feedbackPlayer = utility.audioPlayer(trial.feedbackUrl);
    const feedbackButton = utility.buttonElement();
    feedbackButton.textContent = "Feedback";
    utility.adopt(feedbackButtonContainer, feedbackButton);
    continueButton.style.gridRow = 1;
    continueButton.style.gridColumn = 1;
    utility.addClickEventListener(feedbackButton, (e) => {
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
      imageWidth: 500,
    },
    {
      type: "image-multi-audio-button-response",
      stimulusUrl: "binnip.wav",
      noiseUrl: "SSN_longB.wav",
      imageUrl: "binnip.png",
      imageWidth: 500,
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
