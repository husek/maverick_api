## Maverick API

**Requirements**
- Node >= 12
- Yarn >= 1 && < 2


**Instructions**

At ./env/ copy example.env and create your own .env with the same params and named after your env.
_Eg: development.env_

After you are done with it, add your own JWT Secret and point to a valid MongoDB URL (with password ofc);

````
$ yarn install && yarn build && yarn start
````

###Authentication
Certain routes are protect, in order to access those routes remember to include your JWT Token (acquired via login) to your request headers as follows:
`headers.authorization: "Bearer MY_LONG_TOKEN_GOES_HERE"`

###End-points
The base Endpoint for this API is /api/.

The Following endpoints are available using this suffix:

###Auth
All Auth Endpoints returns a user model with an attached token.

######Login
POST auth/login - { username: string, password: string }

######Register
POST auth/register - { username: string, password: string }
######Get Own User Info
GET /auth/me

###Deck
######Create Deck
POST deck/ - accepts deckCount on body to create multiple-sized shoe decks;

######List Decks
GET deck/

######Get Deck
GET deck/:deckId

######Delete Deck
DEL deck/:deckId

###Game
All Game Endpoints return a fresh GameState object.

######Create a Game
POST game/ - { title?: string, deckId: string }

######Delete a Game
DEL game/:gameId 

######List Games
GET game/

######Get Single Game
GET game/:gameId

######Get Player's Hand for a given game
GET game/:gameId/hand/:username

######Shuffle's game deck
POST game/:gameId/shuffle/

######Deal Card
POST game/:gameId/deal

######Join Game
POST game/:gameId/join - accepts { isBot: boolean } to add a Bot player to the room.

######Leave Game
POST game/:gameId/leave

