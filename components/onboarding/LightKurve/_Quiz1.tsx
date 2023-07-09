import { useSession } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import Login from "../../../pages/login";

enum QuizStatus {
    NotStarted,
    InProgress,
    Completed
}

interface QuizImage {
    imageUrl: string;
    isPlanet: boolean;
}

const quizImages: QuizImage[] = [
    {
        // imageUrl: 'Quiz/image1.png',
        imageUrl: 'https://file.notion.so/f/s/5044406f-a71e-4b3c-83ce-4b78886b113b/Capture2.png?id=d0586e06-1251-4906-90d6-160b85603a0e&table=block&spaceId=215717d6-87ba-4724-a957-c84891dfbb82&expirationTimestamp=1692259200000&signature=sPtXmNUXFgRSCyC7klA0MhWgtXkrI2nDENjW0rs5ITU&downloadName=Capture2.PNG.png',
        isPlanet: false,
    },
    {
        imageUrl: 'Quiz/image2.png',
        isPlanet: true,
    },
    {
        imageUrl: 'Quiz/image3.png',
        isPlanet: false,
    },
    {
        imageUrl: 'Quiz/image4.png',
        isPlanet: true,
    },
];

const LightkurveQuiz: React.FC = () => {
    const session = useSession();

    const [quizStatus, setQuizStatus] = useState(QuizStatus.NotStarted);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);

    if (!session) { return( <Login /> ); };

    const startQuiz = () => {
        setQuizStatus(QuizStatus.InProgress);
    };

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setCorrectAnswers(correctAnswers + 1);
        };

        if (currentQuestion < quizImages.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setQuizStatus(QuizStatus.Completed);
        };
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
        const currentImage = quizImages[currentQuestion];

        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <img
                    src={currentImage.imageUrl}
                    alt="QuizImage"
                    className="max-w-lg max-h-96 mb-4"
                />
                <div className="flex space-x-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleAnswer(currentImage.isPlanet)}
                    >
                        Planet
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleAnswer(!currentImage.isPlanet)}
                    >
                        Not a planet
                    </button>
                </div>
            </div>
        );
    };

    if (quizStatus === QuizStatus.Completed) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-2xl">
                    You got {correctAnswers} out of {quizImages.length}
                </p>
            </div>
        );
    };

    return null;
}

export default LightkurveQuiz;