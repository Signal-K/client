import React from "react";
import axios from "axios";


export default function SendPlanetsssDataToFlask () {

// Define the data to send
const dataToSend = {
    planetName: "Earth",
    userName: "John Doe",
    planetData: "Some data about Earth"
  };
  
  // Send a POST request to the Flask app
  fetch('/receive_data', { // http://localhost:5000
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    
    body: JSON.stringify(dataToSend)
  })
    .then(response => response.json())
    .then(data => {
      console.log(data.message); // Should print "Data received successfully"
    })
    .catch(error => {
      console.error(error);
    });
  
}