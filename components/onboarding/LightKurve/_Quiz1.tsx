import { useSession } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import Login from "../../../pages/login";

enum QuizStatus {
    NotStarted,
    InProgress,
    Completed
}

interface QuizQuestion {
    questionText: string;
    imageUrl: string;
    isCorrect: boolean;
}

const quizQuestions: QuizQuestion[] = [
    {
        questionText: '❓ - This light curve shows the brightness of a star monitored by NASA\'s TESS mission. \n Do you notice any dips that could indicate a transiting exoplanet?',
        imageUrl: 'https://file.notion.so/f/s/5044406f-a71e-4b3c-83ce-4b78886b113b/Capture2.png?id=d0586e06-1251-4906-90d6-160b85603a0e&table=block&spaceId=215717d6-87ba-4724-a957-c84891dfbb82&expirationTimestamp=1693137600000&signature=-PYuxmpWEbuCJIGoWuuFfy9t_owR88lTg582QjXTf6s&downloadName=Capture2.PNG.png',
        isCorrect: false,
    },
    {
        questionText: '❓ - Do you see a potential exoplanet transit in this light curve? Which parts indicate the transit?',
        imageUrl: 'https://file.notion.so/f/s/8381ba5c-9c2a-450b-a145-57d08cf7b23d/Capture3.png?id=3adaa43a-08d4-4091-ac7a-2842375df68b&table=block&spaceId=215717d6-87ba-4724-a957-c84891dfbb82&expirationTimestamp=1693137600000&signature=mH1uS2vldFLLANeu0XoQK2RKXepBMFisRBuFZPt-gNY&downloadName=Capture3.PNG.png',
        isCorrect: true,
    },
    {
        questionText: '❓ - This one is a bit tricky. Does it have a clear exoplanet transit or not?',
        imageUrl: 'https://file.notion.so/f/s/1f7d2232-5a59-46cd-8693-6e89c83421a2/Capture4.png?id=47d43c61-e3a4-49d0-8767-450fd96fc370&table=block&spaceId=215717d6-87ba-4724-a957-c84891dfbb82&expirationTimestamp=1693137600000&signature=fytAWZyiqUbnvKjaXiAk3Z3Ah3f90BbClWqdlOmLPCY&downloadName=Capture4.PNG.png',
        isCorrect: false,
    },
    {
        questionText: '❓ - What\'s your classification? Exoplanet or false positive?',
        imageUrl: 'https://file.notion.so/f/s/8543a5be-9a25-4917-b6e3-69baade7c2ae/Capture5.png?id=6a55bb37-dfec-493f-80c9-d17b6b052609&table=block&spaceId=215717d6-87ba-4724-a957-c84891dfbb82&expirationTimestamp=1693137600000&signature=kPf7MDdbM3mdy23DHgK1Cc4qZ8V88wftd2cyI-uN70A&downloadName=Capture5.PNG.png',
        isCorrect: true,
    }
]

/* const quizImages: QuizImage[] = [
     {
         // imageUrl: 'Quiz/image1.png',
         imageUrl: 'https://file.notion.so/f/s/5044406f-a71e-4b3c-83ce-4b78886b113b/Capture2.png?id=d0586e06-1251-4906-90d6-160b85603a0e&table=block&spaceId=215717d6-87ba-4724-a957-c84891dfbb82&expirationTimestamp=1692259200000&signature=sPtXmNUXFgRSCyC7klA0MhWgtXkrI2nDENjW0rs5ITU&downloadName=Capture2.PNG.png',
         isCorrect: false,
     }, */

const LightkurveQuiz: React.FC = () => {
    const session = useSession();

    const [quizStatus, setQuizStatus] = useState(QuizStatus.NotStarted);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);

  const startQuiz = () => {
    setQuizStatus(QuizStatus.InProgress);
  };

  const handleAnswer = () => {
    const currentQuestionObj = quizQuestions[currentQuestion];
    if (userAnswer === currentQuestionObj.isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizStatus(QuizStatus.Completed);
    }

    setUserAnswer(null);
  };

  if (quizStatus === QuizStatus.NotStarted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={startQuiz}
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (quizStatus === QuizStatus.InProgress) {
    const currentQuestionObj = quizQuestions[currentQuestion];

    return (
      <div className="flex flex-col justify-center items-center">
        <p className="text-lg mb-4">{currentQuestionObj.questionText}</p>
        <img
          src={currentQuestionObj.imageUrl}
          alt="Quiz"
          className="max-w-4xl max-h-200 mb-4"
        />
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={userAnswer === true}
              onChange={() => setUserAnswer(true)}
            />
            <span className="ml-2">YES</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={userAnswer === false}
              onChange={() => setUserAnswer(false)}
            />
            <span className="ml-2">NO</span>
          </label>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleAnswer}
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  if (quizStatus === QuizStatus.Completed) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl">
          Congratulations! You got {correctAnswers} out of {quizQuestions.length}{' '}
          correct.
        </p>
      </div>
    );
  }

  return null;
};

export default LightkurveQuiz;