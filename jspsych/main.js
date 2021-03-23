import { plugin as twoDotPlugin } from "./plugin.js";
import * as utility from "./utility.js";

function main() {
  const twoDotPluginId = "two-dot";
  jsPsych.plugins[twoDotPluginId] = twoDotPlugin();

  jsPsych.plugins["image-audio-button-response"] = (() => {
    jsPsych.pluginAPI.registerPreload(
      "image-audio-button-response",
      "stimulusUrl",
      "audio"
    );
    jsPsych.pluginAPI.registerPreload(
      "image-audio-button-response",
      "imageUrl",
      "image"
    );

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
          imageWidth: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: "Image width",
            default: null,
            description: "The image width in pixels",
          },
        },
      },
      trial(display_element, trial) {
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
        utility.addClickEventListener(button, () => jsPsych.finishTrial());
        const stimulusPlayer = utility.audioPlayer(trial.stimulusUrl);
        stimulusPlayer.onended = () => {
          button.style.visibility = "visible";
        };
        stimulusPlayer.play();
      },
    };
  })();

  jsPsych.plugins["image-audio-with-feedback-button-response"] = (() => {
    jsPsych.pluginAPI.registerPreload(
      "image-audio-with-feedback-button-response",
      "stimulusUrl",
      "audio"
    );
    jsPsych.pluginAPI.registerPreload(
      "image-audio-with-feedback-button-response",
      "feedbackUrl",
      "audio"
    );
    jsPsych.pluginAPI.registerPreload(
      "image-audio-with-feedback-button-response",
      "imageUrl",
      "image"
    );

    return {
      info: {
        name: "image-audio-with-feedback-button-response",
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
        },
      },
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
        continueButton.style.visibility = "hidden";
        utility.adopt(continueButtonContainer, continueButton);
        utility.addClickEventListener(continueButton, () =>
          jsPsych.finishTrial()
        );
        const player = utility.audioPlayer(trial.stimulusUrl);
        player.play();
        const feedbackPlayer = utility.audioPlayer(trial.feedbackUrl);
        const feedbackButton = utility.buttonElement();
        feedbackButton.textContent = "Feedback";
        feedbackButton.style.visibility = "hidden";
        utility.adopt(feedbackButtonContainer, feedbackButton);
        continueButton.style.gridRow = 1;
        continueButton.style.gridColumn = 1;
        utility.addClickEventListener(feedbackButton, () =>
          feedbackPlayer.play()
        );
        player.onended = () => {
          continueButton.style.visibility = "visible";
          feedbackButton.style.visibility = "visible";
        };
      },
    };
  })();

  const page = document.createElement("div");
  const condition = document.createElement("div");
  const conditionLabel = document.createElement("label");
  conditionLabel.textContent = "Condition: ";
  const conditionSelect = document.createElement("select");
  const conditionA = document.createElement("option");
  conditionA.textContent = "A";
  const conditionB = document.createElement("option");
  conditionB.textContent = "B";
  const conditionC = document.createElement("option");
  conditionC.textContent = "C";
  conditionSelect.append(conditionA);
  conditionSelect.append(conditionB);
  conditionSelect.append(conditionC);
  condition.append(conditionLabel);
  condition.append(conditionSelect);
  const startButton = document.createElement("button");
  startButton.textContent = "Start";
  startButton.addEventListener("click", () => {
    document.body.removeChild(page);
    jsPsych.init({
      timeline: [
        {
          type: "preload",
          auto_preload: true,
        },
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
          imageWidth: 300,
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
  });
  page.append(condition);
  page.append(startButton);
  document.body.append(page);
}

main();
