import React, { useState, useEffect } from "react";
import { QuestionData } from "janus-api";
import { Button, Layer } from "grommet";

const Mcq = ({ question, onAnswer }) => {
  return (
    <div>
      <div>{question.title}</div>
      {question.options.choices.map((choice) => (
        <Button label={choice.display} onClick={() => onAnswer(choice.code)} />
      ))}
    </div>
  );
};

const AnswerWidgets = {
  mcq: Mcq,
};
const Answer = ({ room }) => {
  let [currentAnswer, setCurrentAnswer] = useState(null);
  let [questionData] = useState(new QuestionData(room));
  let AnswerWidget;

  useEffect(() => {
    const askQuestion = (answer) => {
      console.warn("need to answer", answer);
      answer.question.type = answer.question.type || "yesno";
      if (answer.question.type === "yesno") {
        answer.question.type = "mcq";
        answer.question.options.choices = [
          { code: "yes", display: "yes" },
          { code: "no", display: "no" },
        ];
      }
      setCurrentAnswer(answer);
    };
    questionData.on("ask", askQuestion);
    return () => {
      questionData.removeListener("ask", askQuestion);
    };
  }, []);

  if (currentAnswer) {
    AnswerWidget = AnswerWidgets[currentAnswer.question.type];
  }
  return (
    currentAnswer &&
    AnswerWidget && (
      <Layer modal={true}>
        <AnswerWidget
          question={currentAnswer.question}
          onAnswer={(answer) => {
            currentAnswer.answer(answer);
            setCurrentAnswer(null);
          }}
        />
      </Layer>
    )
  );
};

const Ask = ({ room }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [questionData, setQuestionData] = useState(null);

  useEffect(() => {
    let qd = new QuestionData(room);
    setQuestionData(qd);
    qd.on("update_answer", () => {
      console.warn("new answers", qd.active_question);
      setAnswers(qd.active_question.answerStats());
    });
  }, []);

  return (
    <div>
      <Button
        label="Ask : did you understand?"
        onClick={() => {
          let q = questionData.create(1, "Did you understand?", "yesno");
          q.ask();
          setCurrentQuestion(q);
        }}
      />
      {currentQuestion && <div>{JSON.stringify(answers)}</div>}
    </div>
  );
};
export { Ask, Answer };
