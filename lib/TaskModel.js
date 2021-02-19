export const Choice = Object.freeze({
  first: 1,
  second: 2,
});

export class TaskModel {
  constructor(audioPlayer) {
    this.audioPlayer = audioPlayer;
  }

  submit(submission) {
    this.audioPlayer.playFeedback();
  }
}
