// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export type GameBoard = {
  currentTurn: number;
  gameOver: boolean;
  nextPassage: string;
  nextPassageSummary: string[];
  storySummary: string[];
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

  //update the storySummary
  previousGameBoard.storySummary = [
    ...previousGameBoard.storySummary,
    ...previousGameBoard.nextPassageSummary,
  ];

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
    nextPassageSummary: a summary of the next passage of the story,
    currentTurn: the current turn (which increments by one each turn), 
    userActions: a list of 2 new actions that the user could take, 
    storySummary: a summary of the story so far,
    gameOver: a boolean that indicates whether or not the game has ended. 
  }

  The nextPassage variable should be written in the style of Edgar Allen Poe. It should be a robust description of the setting and the possible clues available to the user. It should set a slightly scary and unsettling mood.

  The nextPassageSummary variable should be a short summary of the next passage.  It should be a list with a single bullet point describing what happens in the next passage.

  The userActions variable should be a list of 2 new actions that a user can take.  Each action is an object with the following structure: {action: "action name", result: "result of action"}.  The result can either be "Game Continues" or "Game Over".  If the result is "Game Over", then the game is over and the user loses.  If the result is "Game Continues", then the game continues and the user can take another action.  If the action consists of the user doing something dangerous (like climbing through a window, or fighting a ghost), there should be a 50% chance the user will die and the game will end.

  The storySummary variable is an array of bullet points describing the major events of the story so far.  This variable is just for the story creator so that it can keep track of the story and make sure that it is coherent.  After each turn the story summary should append a summary of the currentTurn to the storySummary array.

  Broad Story Idea: The main character lost in a haunted castle, and they are trying to escape before they are murdered by the ghosts that live inside it.  They start in the dungeon and need to solve a series of short puzzles to advance through the castle and escape.  Their are 4 primary actions that the user needs to identify and act on to escape: 1. climb up an empty fireplace to escape the dungeon and get to the ground floor 2. identify a hidden staircase to get to the castle tower 3. pull a hidden lever to reveal secret ladder that leads to the tower roof and finally 4. climb down a makeshift ladder from the tower to escape.

  Current Turn: ${previousGameBoard.currentTurn + 1}

  storySummary: ${previousGameBoard.storySummary}

  Last Story Passage: ${previousGameBoard.nextPassage}

  User Choice: ${userChoice}

  RESPONSE:
  `;
};
