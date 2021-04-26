import { plugin as twoDotPlugin } from "./plugin.js";
import * as utility from "./utility.js";

function concatenatePaths(a, b) {
  return `${a}${b}`;
}

const standardImageHeightPixels = 500;

function main() {
  const twoDotPluginId = "two-dot";
  jsPsych.plugins[twoDotPluginId] = twoDotPlugin(twoDotPluginId);

  const imageAudioButtonResponsePluginId = "image-audio-button-response";
  jsPsych.plugins[imageAudioButtonResponsePluginId] = (() => {
    jsPsych.pluginAPI.registerPreload(
      imageAudioButtonResponsePluginId,
      "stimulusUrl",
      "audio"
    );
    jsPsych.pluginAPI.registerPreload(
      imageAudioButtonResponsePluginId,
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
  })();

  const imageAudioWithFeedbackPluginId =
    "image-audio-with-feedback-button-response";
  jsPsych.plugins[imageAudioWithFeedbackPluginId] = (() => {
    jsPsych.pluginAPI.registerPreload(
      imageAudioWithFeedbackPluginId,
      "stimulusUrl",
      "audio"
    );
    jsPsych.pluginAPI.registerPreload(
      imageAudioWithFeedbackPluginId,
      "feedbackUrl",
      "audio"
    );
    jsPsych.pluginAPI.registerPreload(
      imageAudioWithFeedbackPluginId,
      "imageUrl",
      "image"
    );

    return {
      info: {
        name: imageAudioWithFeedbackPluginId,
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
          type: imageAudioButtonResponsePluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_Repetition_BUTTON.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Button.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioButtonResponsePluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_Repetition_BABY.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Baby.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioButtonResponsePluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_Repetition_ROOSTER.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Rooster.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioButtonResponsePluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Repetition_TOPIN.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Topin.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioButtonResponsePluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Repetition_NEDIG.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Nedig.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioButtonResponsePluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Repetition_KINIT.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Kinit.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog1.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog2.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: twoDotPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_TwoDot_BABY_CHEETAH.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_TwoDot_FreeRecall_CuedRecall_BABY.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Baby.png"
          ),
          imageHeight: standardImageHeightPixels,
          firstChoiceOnsetTimeSeconds: 2.53,
          firstChoiceOffsetTimeSeconds: 3,
          secondChoiceOnsetTimeSeconds: 3.96,
          secondChoiceOffsetTimeSeconds: 4.41,
        },
        {
          type: twoDotPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_TwoDot_PIZZA_ROOSTER.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_TwoDot_FreeRecall_CuedRecall_ROOSTER.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Rooster.png"
          ),
          imageHeight: standardImageHeightPixels,
          firstChoiceOnsetTimeSeconds: 2.73,
          firstChoiceOffsetTimeSeconds: 3.25,
          secondChoiceOnsetTimeSeconds: 4.47,
          secondChoiceOffsetTimeSeconds: 4.97,
        },
        {
          type: twoDotPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_TOPIN_KINIT.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_FreeRecall_CuedRecall_TOPIN.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Topin.png"
          ),
          imageHeight: standardImageHeightPixels,
          firstChoiceOnsetTimeSeconds: 2.9,
          firstChoiceOffsetTimeSeconds: 3.41,
          secondChoiceOnsetTimeSeconds: 5.45,
          secondChoiceOffsetTimeSeconds: 6.04,
        },
        {
          type: twoDotPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_KINIT_NEDIG.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_FreeRecall_CuedRecall_KINIT.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Kinit.png"
          ),
          imageHeight: standardImageHeightPixels,
          firstChoiceOnsetTimeSeconds: 3.16,
          firstChoiceOffsetTimeSeconds: 3.75,
          secondChoiceOnsetTimeSeconds: 5.58,
          secondChoiceOffsetTimeSeconds: 6.17,
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog2.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog3.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: imageAudioButtonResponsePluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Repetition_TOPIN.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Topin.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioButtonResponsePluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Repetition_NEDIG.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Nedig.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioButtonResponsePluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Repetition_KINIT.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Kinit.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog3.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog4.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: twoDotPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_TOPIN_NEDIG.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_FreeRecall_CuedRecall_TOPIN.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Topin.png"
          ),
          imageHeight: standardImageHeightPixels,
          firstChoiceOnsetTimeSeconds: 3.47,
          firstChoiceOffsetTimeSeconds: 4,
          secondChoiceOnsetTimeSeconds: 5.96,
          secondChoiceOffsetTimeSeconds: 6.57,
        },
        {
          type: twoDotPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_NEDIG_KINIT.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_FreeRecall_CuedRecall_NEDIG.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Nedig.png"
          ),
          imageHeight: standardImageHeightPixels,
          firstChoiceOnsetTimeSeconds: 3.04,
          firstChoiceOffsetTimeSeconds: 3.64,
          secondChoiceOnsetTimeSeconds: 5.34,
          secondChoiceOffsetTimeSeconds: 5.89,
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog4.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog5.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: imageAudioWithFeedbackPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "FreeRecall_WHAT.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_TwoDot_FreeRecall_CuedRecall_BABY.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Baby.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioWithFeedbackPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "FreeRecall_WHAT.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_TwoDot_FreeRecall_CuedRecall_ROOSTER.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Rooster.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioWithFeedbackPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "FreeRecall_WHAT.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_FreeRecall_CuedRecall_TOPIN.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Topin.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioWithFeedbackPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "FreeRecall_WHAT.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_FreeRecall_CuedRecall_NEDIG.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Nedig.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioWithFeedbackPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "FreeRecall_WHAT.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_FreeRecall_CuedRecall_KINIT.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Kinit.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog5.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog6.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: imageAudioWithFeedbackPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_CuedRecall_BAY.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_TwoDot_FreeRecall_CuedRecall_BABY.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Baby.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioWithFeedbackPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_CuedRecall_ROO.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Day1_TwoDot_FreeRecall_CuedRecall_ROOSTER.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Rooster.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioWithFeedbackPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "CuedRecall_TO.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_FreeRecall_CuedRecall_TOPIN.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Topin.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioWithFeedbackPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "CuedRecall_NE.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_FreeRecall_CuedRecall_NEDIG.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Nedig.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: imageAudioWithFeedbackPluginId,
          stimulusUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "CuedRecall_KI.wav"
          ),
          feedbackUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "TwoDot_FreeRecall_CuedRecall_KINIT.wav"
          ),
          imageUrl: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "Kinit.png"
          ),
          imageHeight: standardImageHeightPixels,
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog6.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
        {
          type: "image-button-response",
          stimulus: concatenatePaths(
            wordLearningInNoiseResourcePath,
            "dog7.png"
          ),
          stimulus_height: standardImageHeightPixels,
          choices: ["Continue"],
          prompt: "",
        },
      ],
    });
  });
  page.append(condition);
  page.append(startButton);
  document.body.append(page);
}

main();
