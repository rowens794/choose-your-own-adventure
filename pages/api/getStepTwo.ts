import { OpenAI } from "langchain/llms";
import type { NextApiRequest, NextApiResponse } from "next";

export type GameBoard = {
  currentTurn: number;
  gameOver: boolean;
  nextPassage: string;
  nextPassageSummary: string[];
  userActions: string[];
  gameStatus: "playing" | "captured" | "victory";
};

type Data = {
  data: GameBoard;
};

type RequestBody = {
  userChoice: string;
  previousGameBoard: GameBoard;
  storySummary: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let body: RequestBody = req.body;
  let { userChoice, previousGameBoard, storySummary } = body;

  //update the storySummary
  let startTime = Date.now();
  const response = await makeRequest(
    userChoice,
    previousGameBoard,
    storySummary
  );
  console.log("Time to make request: ", Date.now() - startTime);
  res.status(200).json({ data: response });
}

const makeRequest = async (
  userChoice: string,
  previousGameBoard: GameBoard,
  storySummary: string
): Promise<GameBoard> => {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPEN_AI_TOKEN}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          {
            role: "user",
            content: buildPrompt(userChoice, storySummary, previousGameBoard),
          },
        ],
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

const buildSystemPrompt = () => {
  return `
    You are a storyteller for a children's text-based choose-your-own-adventure game.  You use fun and wildly descriptive language to build a world that children can easily envision in their minds eye.

    Story Premise:  The main character is lost in a haunted mansion, and they are trying to escape before they are captured by the ghosts that live inside it.  

    The mansion has three floors with the following layout: 
    Basement: Wine Celler, Storage, Furnace Room
    First Floor: Entry Way, Dining Room, Kitchen, Salon, Billiards Room
    Second Floor: Master Suite, Bathroom, Guest Bedroom, Observatory

    Game Play:
    The player awakens in a room in the basement and must figure out how to escape the mansion.  In each story, it will not be obvious how a player is to advance through the game, but in each case, they must find and collect three keys hidden throughout the mansion to unlock the front door and exit.

    The keys are color-coded: black, silver, and golden, and must all be collected before the player can exit.  They will be stored in INVENTORY.

    The player must avoid getting captured by ghosts as they search the home for the keys and the exit.

    Your Response:
    Your response should always be structured as a json object structured as follows:
    {
    nextPassage: the next passage of the story, 
    nextPassageSummary: a summary of the next passage of the story,
    userActions: a list of 2 new actions that the user could take, 
    inventory: a list of the keys collected,
    gameStatus: an indicator that takes one of three values: "playing" if the game is to continue on, "captured" if a ghost has captured the player, or "victory" if the player has escaped from the mansion.
    }

    It is vital that you never respond with any other content except for the json object.  Otherwise the program will break.

    The nextPassage variable should be written in the style of Edgar Allen Poe. It should be a robust description of the setting and the possible clues available to the user. It should set a slightly scary and unsettling mood.

    The nextPassageSummary variable should be a short summary of the next passage.  It should be a list with a single bullet point describing what happens in the next passage.

    The userActions variable should be a list of 2 new actions that a user can take. The userAction variable should be a json array with two strings describing the actions a user can take.  Each string should be less than 8 words. 

    After each turn, you should evaluate the status of the game.
`;
};

const buildPrompt = (
  userChoice: string,
  storySummary: string,
  previousGameBoard: GameBoard
) => {
  return `
    Current Turn: ${previousGameBoard.currentTurn + 1}
    storySummary: ${storySummary}
    Last Story Passage: ${previousGameBoard.nextPassage}
    User Choice: ${userChoice}
  `;
};
