import { useState } from "react";
import Head from "next/head";
import { GameBoard } from "../pages/api/getStep";

export default function Home() {
  const [gameBoard, setGameBoard] = useState<GameBoard | null>({
    nextPassage:
      "You don't know what happend.  You remember falling asleep in your bed, your mom tucking you in tighly under your covers.  But now you're far away from home, you can just feel it.  And this room is dark, an unfamiliar.",
    currentTurn: 0,
    userActions: [{ action: "Start Your Nightmare", result: "Game Continues" }],
    gameOver: false,
  });
  const [loading, setLoading] = useState(false);

  //make a request to the getStep endpoint
  const makeRequest = async (choice: string) => {
    //create a post request with the choice in the body
    setLoading(true);
    const response = await fetch("/api/getStep", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userChoice: choice,
        previousGameBoard: gameBoard,
      }),
    });
    const { data } = await response.json();
    setGameBoard(data);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className="bg-center bg-cover min-h-screen w-full relative z-20"
        style={{ minHeight: "-webkit-fill-available" }}
      >
        <div className="min-h-screen">
          <div className="p-8">
            <p className="text-white mt-8 text-lg leading-8 font-light">
              {gameBoard?.nextPassage}
            </p>
          </div>
          <div className="text-center w-full h-12 flex flex-col gap-4 p-8">
            {gameBoard?.userActions.map(({ action }) => (
              <>
                {loading ? (
                  <button
                    key={action}
                    className="bg-gray-700 text-white text-xl p-4"
                  >
                    {action}
                  </button>
                ) : (
                  <button
                    key={action}
                    className="bg-fuchsia-900 text-white text-xl p-4"
                    onClick={() => {
                      makeRequest(action);
                    }}
                  >
                    {action}
                  </button>
                )}
              </>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
