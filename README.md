# Smart Office System using IoT
Smart office is an IoT based access management system that allows users to gain access to rooms in an organization using a virtual key.

## Table of contents
* [Design](#design)
* [Implementation](#implementation)
  * [Front-end](#front-end)
  * [Back-end](#back-end)
* [Demo](#demo)

## Design

The design as shown utilizes a client-server architecture where the client communicates with the door lock through a broker. The design consists of three components, client web application, authentication server and the IoT cloud platform. 
<br>
<p align='center'>
  <img src='https://i.gyazo.com/49fbe36b50d73063b270e13492040179.png'>
</p>
<b>Process flow:</b>
  <li> The user initiates a request at the web application to unlock the door. </li>
  <li> The web app attempts to authenticate the request made by the user through the authentication server. </li>
  <li> If successful, the web app sends the request to the IoT cloud platform. </li>
  <li> The cloud platform will identify the door lock in question and send a state update request directly to the door lock. </li>
  <li> Consequently, the door lock will unlock and the IoT cloud will update the client and authentication server accordingly.</li>

## Implementation 
Deployed at: http://www.keylessoffice.ca

### Front-end

Client interface consists of user and admin portals (with admin available at http://www.keylessoffice.ca/admin). 
Tools used:
* React.js for developing dynamic user interfaces.
* Axios.js as an HTTP client to create requests to the back-end.
* Bootstrap for responsive and mobile-friendly styling. 

### Back-end

Back-end consists of two entities, the authentication server and the Arduino Cloud IoT platform. 
Tools used:
* Node.js as a back-end JavaScript runtime environment.
* Express.js as a back end web application framework for Node.js.
* MongoDB for a NoSQL database hosted on cloud. 
* Mongoose as a MongoDB object modeling tool.
* Arduino Cloud IoT to connect and manage door locks through their API.

## Demo
User portal: http://www.keylessoffice.ca

Test account:
* Email: smart.office.test@gmail.com
* Password: usertest
