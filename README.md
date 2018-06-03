## About

This project is a full stack Reddit clone built with the SERN stack for illustrative purposes. What does SERN stand for?

* **SQL**: using Sequelize and MySQL for relational databases.
* **Express**: the backbone of the back-end, Express supports a RESTful API with which the app retrieves and modifies data.
* **React**: the backone of the front-end, this is the presentational part of the application, exploiting its extended flexibility with state management control modules such as Redux (also used extensively in this project).
* **Node**: of course, none of this would be possible without the Node enviroment.

This project demonstrates how to:

* Build a RESTful API with multiple endpoints and securing routes with private tokens.
* Authenticating users using JSON Web tokens, a modern alternative to sessions for React.
* Pagination of results for comments, posts, and subreddits.
* Recursive methods to build deeply nested tree of data (in relation to comments for each post, just like Reddit) and *"smart-loading"* i.e., loading only a few results to reduce overhead and load more results on user demand.
* Responsive web design using modern web techniques with Bulma.
* Utilizing the Redux store for state management in complex applications and reducing "spaghetti-code".
* Websockets implementation with sockets.io for real-time messaging.

This is my own personalized version of Reddit with some of its major features such as:

* Subreddits (creating and moderating)
* Moderators (can add and remove rules, suspend and unsuspend users for their respective sub)
* Users (can login, register, view their profile, can be banned from a sub, meaning they can't participate nor vote in it)
* Private messages (inbox, outbox, and new messages, with mobile & desktop designs and real time inbox updating thanks to web sockets)
* Posts (a post with a link, text)
* Voting (upvotes and downvotes for each post and each comment, allowing posts and comments to be sorted by their "score", using Reddit's own algorithm, the lower bound of Wilson score confidence interval for a Bernoulli parameter)

## Install

This project is built with create-react-app and ExpressJS so requires minimal work to get it running. To start the development server for the client/front end:

``` cd client
``` yarn install (or npm install)
``` yarn start
``` 

To start the development server for the server/back end:

``` cd server
``` yarn install (or npm install)
``` nodemon app.js
```

**NOTE**: For the websockets to work, for live messaging, you need to edit the endpoint address specified in client/modules/Sockets.js towards the IP hosting your web server!

Make sure that your configuration files in /config/ are properly configured for your SQL database connection details an your own unique JWT key for authentication.
