# Result-Publishing-System-APIs
Backend for Result Publishing system

## Problem Statement
In India, examination scores and results of the students are displayed publicly on the bulletin boards that causes unnecessary pressure on students. In the United States, the release of such information is regulated by the Family Educational Rights and Privacy Act (FERPA).
  
## Solution
Developed a secured online platform which will allow the teachers to upload the grades of the student in an encrypted format. The students, on the other hand, can check only their grades using his private key. It aims to maintain the confidentiality of student grades using cryptography.

## Features
* Authentication
  - Log In 
    - For Student
    - Admin Credentials open the Admin Console
  - Sign Up via OTP and Email API
  - Password Hashing via Bcrypt
* Student
  - Upload Private Key
  - View Result
* Admin
  - Upload Result via CSV File
  
    
## Technologies Used
* Node.js
* MongoDB
* Express.js
* Node.js RSA library

## Setup
Run ``` npm install ``` to install all the packages and dependencies.

