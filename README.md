# Admin Dashboard

A web interface that enables interaction with level's database through editing, uploading, viewing, and player/team management. Live [here](http://www.levelbaseball.com).

## Project Overview

#### Back-End

The back-end consists of a [Cloud Firestore](https://firebase.google.com/docs/firestore) database hosted on the [Firebase](https://firebase.google.com) platform. Firebase effortlessly handles our authentication and storage needs, and Firestore provides a no-SQL database that is ideal for scalability. The api keys are public on the front-end, but that does not matter since a user would need an authenticated account for calls to be successful. On top of that security layer, each user is given a specific scope of data it can access in firebase (see "rules" tab on database page).

Data is stored in a chain of collections and documents. For example, the collection called "teams" stores documents of teams, within each are several attributes and anoter collection of "players."

Firebase has incredible functionality, allowing for easy development of ML, data / user analytics, and more. In the future, look into leveraging these features.

#### Front-End

The front-end, built with HTML, CSS, and JS + jQuery, allows for a well organized, responsive UI. JS acts as the "hub", as it can access and change all other languages and files on the fly. This is important for generating dynamic elements, tracking user activity, and obtaining user input.

Connecting to firebase works as follows. Google has firebase packages I have already linked in all html files, so the pre-written functions are ready to go. Both querying and uploading data are fairly self explanatory when following the [Firebase Documentation](https://firebase.google.com/docs).

In pages with heavy data management, such as the video or creator page, the UI constantly reflects a maintained JS object stored in a variable. **Whenever these objects change, the UI reflects that change, and vice versa.** This is essential for data organization, especially before uploading to Firebase.

#### Database Structure

The database follows a logical, hierarchy structure. Refer to the database itself to see which properties are stored, where, and how.

#### Significant Missing features

- Admin sign-up page. However, login for players and admins are the same.
- Add players and coaches to teams after sign up.
- Edit moments after initial upload.
- User logout

## Coach / Admin Side

#### /login

Email and Password is sent to firebase, which may return a user if the information is correct. Then, the front-end queries the player's profile doc to see if their "role" is set to "player" or "coach", then redirects to the respective page.

#### /myteams

When a user is authenticated (or logged out), Firebase leaves behind a cookie. This means when a new tab is opened, the user is authenticated in that tab too. The page queries the user's doc. If "role" is not coach or the request is denied by failure to pass the security rules, the page redirects to /login. Otherwise, the coach's list of teams are returned and then shown on the screen. Coaches can also create teams, which will create a new doc for that team and add the team name to the coach's profile.

### /teams

All pages in this directory need to have a url Parameter "name", which represents the team name. If this is not true, pages will automatically redirect to login.

- #### /

  Fetches that team's players from the team doc. Players are displayed on the screen. When "remove" is pressed, the JS removes that player's doc from the team's "players" collection. Relatively simple page.

- #### /video

  Queries the "moment" collection for moments where "teamName" equals the teamName, given by the url Param. Results are rendered into a table with algorithms in place to expand, collapse, sort, and filter cells. Rendering video thumbnails requires getting a download Url token from Firebase for every image instance, which is very time consuming. **In the future, consider storing thumbnails on a platform that does not require getting a unique download Url.**

  The current round and pitch of the moment are stored in the roundNum and pitchNum global variables. These are intially set through url Params and can be changed anywhere in the JS. These values are directly changed when navigating between rounds and pitches, as all algorithms use it to show or hide content. For example, based on these values, arrows to navigate forward or back pitches or rounds are disabled.

  Video playback consists of the entire round video playing, looping between the pitch start and end points. If no pitches were logged to the round, then the entire clip plays.

- #### /creator

  The most complicated page of the whole build. The page first queries the team's player collection to obtain its list of players. The UI resembles a table, though is realy just a series of divs within a flexbox layout.

  all data in this page is stored in the **masterData** object, an array of round objects that store metadata, videos, pitches, etc. Whenever a piece of data is changed, even by one character, masterData is updated to reflect that change.

  Users can give the following input

  - player, chosen from list of players
  - type, chosen from "Hitter", "Fielder", "Pitcher", and "Runner"
  - notes, pure text
  - videos, file input

  Whenever the first field if the right-most cell is changed, a cell is rendered to the right of that. This allows the user to keep logging new rounds.

  When videos are uploaded, their thumbnail is generated.

  When a video is pressed, an overlay appears. This is the interface used to log pitches. The timeline constists of many Video elements whose "currentTime" attribute is set to its position along the timeline. **This is very slow, and I would consider migrating to another method in the future.**

  Pressing on the timeline will mark that position, allowing you to mark an endpoint. If marking a start point was the last action, then the next must be an end point, and vice versa. When an endpoint is set, the pitch will automatically generate. When selected, stats can be added. These stats correlate to the player "type" set by the coach.

  When send is clicked, masterData is parsed, automatically combining rounds with the same player and type to form moments. The data is reformatted before being sent to the Firstore Database with its video and thumbnail file counterparts being uploaded to Firebase Storage.

  Content Upload takes a very long time, especially with multiple rounds of high-duration videos. **In the future, consider making a panel that shows the user the current stage of upload.** Currently, there is only an alert when the entire upload is successful.
