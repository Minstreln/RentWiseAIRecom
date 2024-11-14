## Property Rental Recommendation API

## Project Overview

This project is a backend feature for a rental property recommendation system, designed to suggest personalized rental properties to users based on their household income and location preferences. It provides an API that integrates with a mock database to offer affordable property recommendations that fit within the user's budget, while ensuring data security and privacy best practices.

## The objective of this project is to demonstrate the ability to design and implement a secure, scalable backend system that:

Accepts user input for household income and location preferences.
Processes the input to determine affordable rental properties.
Returns a list of recommended properties that fit within the user's budget.
Ensures data security and follows best practices for handling sensitive information.

## Features

Personalized Property Recommendations: Based on household income and location preferences.
Affordability Calculation: Filters properties where the monthly rent does not exceed one-third of the user's household income.
Location & Property Type Filtering: Allows users to specify preferred neighborhoods and property types.
Security Features: Includes authentication, authorization, and data encryption best practices.
Rate Limiting: Prevents abuse of the API endpoint.

## Tech Stack

Backend Framework: Node.js with Express.js
Database: MongoDB
Authentication: JWT (JSON Web Tokens)
Validation: Express validator (for input validation)
Rate Limiting: express-rate-limit

## Security & Best Practices

Authentication: JWT is used to ensure that only authenticated users can access the API.
Authorization: Users can only request recommendations for their own account.
Data Encryption: All sensitive data is encrypted using HTTPS for secure communication and MongoDB's built-in encryption for data at rest.
Input Validation: The project uses Joi for validating user input to prevent SQL injection, XSS, and other security vulnerabilities.
Rate Limiting: The API is rate-limited using express-rate-limit to prevent abuse.

## Installation Instructions

## Prerequisites

1. Node.js (v20.11.1) and npm
2. MongoDB (Local or Cloud instance)
3. Postman or any API client (for testing)

## Steps to Install

1. Clone this repository: git clone git@github.com:Minstreln/RentWiseAIRecom.git
2. Install dependencies: cd RentWiseAIRecom & npm install
3. Start the server using: npm start & The server should now be running on http://127.0.0.1:5000.
4. To run the unit and integration test use: npm test
5. There is data already on the database, but the sample data can be found in the folder MockDatabaseData.

## Usage

1. Authentication: Ensure that the user is authenticated by signing in using this endpoint http://127.0.0.1:5000/api/users/signin.

2. Test the API: Use Postman or an API client to send requests to the http://127.0.0.1:5000/api/recommendations endpoint.
