import { userInfo } from "os";

const EventEmitter = require("events");

class Question {
  constructor(qd, id, title, type, options = {}) {
    this.qd = qd;
    let reply_to = qd.room.user.id;
    this.question = { id, title, type, options, reply_to };

    this.answers = {};
  }
  ask() {
    this.qd.room.text_room.send("question", {
      action: "ask",
      question: this.question,
    });
  }
  close(opts = {}) {
    this.qd.room.text_room.send("question", {
      action: "close",
      question_id: this.question.id,
      opts,
    });
    this.qd.active_question = null;
  }
  update_answer(from, answer) {
    this.answers[from] = answer;
    console.warn("updated", this.answers);
    this.qd.emit("update_answer");
  }
  answerStats() {
    return Object.values(this.answers).reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
  }
}
class Answer {
  constructor(qd, question) {
    this.qd = qd;
    this.question = question;
  }
  answer(answer) {
    this.qd.room.text_room.send_to("question", this.question.reply_to, {
      action: "answer",
      answer,
      question_id: this.question.id,
    });
  }
}

class QuestionData extends EventEmitter {
  constructor(room) {
    super();
    this.room = room;
    this.room.on("question_data_received", ({ from, payload }) => {
      if (from !== "" + room.user.id && payload.action) {
        console.warn(
          "recd",
          from,
          payload,
          this.active_question && this.active_question.question
        );
        let action = payload.action;

        //sent to respondents
        if (action === "ask") {
          this.active_answer = new Answer(this, payload.question);
          this.emit("ask", this.active_answer);
        }
        if (
          action === "close" &&
          this.active_answer &&
          payload.question_id === this.active_answer.question.id
        ) {
          this.emit("close", payload.question_id);
          this.active_answer = null;
        }

        //recd an answer from the respondent
        if (
          action === "answer" &&
          this.active_question &&
          this.active_question.question.id === payload.question_id
        ) {
          this.active_question.update_answer(from, payload.answer);
        }
      }
    });
  }
  create(id, title, type, options = {}) {
    this.active_question = new Question(this, id, title, type, options);
    return this.active_question;
  }
}

export default QuestionData;
