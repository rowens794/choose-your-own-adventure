// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export type GameBoard = {
  currentTurn: number;
  gameOver: boolean;
  nextPassage: string;
  userActions: {
    action: string;
    result: "Game Continues" | "Game Over";
  }[];
};

type Data = {
  data: GameBoard;
};

type RequestBody = {
  userChoice: string;
  previousGameBoard: GameBoard;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let body: RequestBody = req.body;
  let { userChoice, previousGameBoard } = body;

  const prompt = buildPrompt(userChoice, previousGameBoard);
  const response = await makeRequest(prompt);
  res.status(200).json({ data: response });
}

const makeRequest = async (prompt: string): Promise<GameBoard> => {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPEN_AI_TOKEN}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    };

    fetch("https://api.openai.com/v1/chat/completions", requestOptions)
      .then((response) => {
        return response.json();
      })
      .then(async (data) => {
        //convert json string to object
        let string = data.choices[0].message.content;

        //remove black space from beginning of string and end of string
        string = string.trim();

        const obj = JSON.parse(string);
        resolve(obj);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};

const buildPrompt = (userChoice: string, previousGameBoard: GameBoard) => {
  return `
  We are playing a choose-your-own-adventure story game.  Below I have given you some details about the game.

  Game Rules: Try to escape within 20 turns to win.  If a spirit catches you, it kills you, and you lose.  

  Game Operations: After a user chooses an action, you need to return a json object with the following structure: 
  {
    nextPassage: the next passage of the story, 
    currentTurn: the current turn (which increments by one each turn), 
    userActions: a list of 2 new actions that the user could take, 
    gameOver: a boolean that indicates whether or not the game has ended. 
  }

  The nextPassage variable should be written in the style of Edgar Allen Poe. It should be a robust description of the setting and the possible clues available to the user. It should set a slightly scary and unsettling mood.

  The userActions variable should be a list of 2 new actions that a user can take.  Each action is an object with the following structure: {action: "action name", result: "result of action"}.  The result can either be "Game Continues" or "Game Over".  If the result is "Game Over", then the game is over and the user loses.  If the result is "Game Continues", then the game continues and the user can take another action.

  Broad Story Idea: We are lost in a haunted castle, and we are trying to escape before we are murdered by the spirits that live inside it.  We start in the dungeon and need to solve short puzzles to figure out how to escape.

  Current Turn: ${previousGameBoard.currentTurn + 1}

  Last Story Passage: ${previousGameBoard.nextPassage}

  User Choice: ${userChoice}

  RESPONSE:
  `;
};
