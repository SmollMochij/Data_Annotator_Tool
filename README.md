# Data Annotator

## Contents
- [Overview](#overview)
- [Features](#features)
- [Setup](#setup)
- [Acknowledgements](#acknowledgements)

## Overview
Data Annotator exists as a solution to three common problems concerning unstructured data annotation for training Machine Learning Models:
### 1. Named-Entity Recognition
Our tool facilitates uploading unstructured text files like articles, reports, book passages, and more. From there, users may create classes (ie NAME, COUNTRY, etc) and subsequently classify tokens from the text. Data Annotator makes creating, tracking, and altering classes and classifications with project teams a seamless process. 
### 2. Collaboration
The project management system allows project managers to create their personal team of annotators and assign them to their annotation projects. Annotators can mark files as "Done" once they have finished annotating.
### 3. Managing Annotated Data
Data Annotator maintains a live preview of each file's annotations as it is being worked on. The addition or removal of classes and entities is tracked and reflected, providing users with a clear impression of how their finished JSON file will look before exporting.

## Features
- User authentication via generated access codes for Project Managers and Annotators
- Annotation project creation and management
- Annotation interface that eases tokenisation and classification for Named Entity Recognition
- Automatically-generated JSON files containing annotated data to be exported and used in training machine learning algorithms

## Setup
### Prerequisites
- Access to the Firebase Project, which contains the Realtime Database and Authentication
- A compiler that can host a live preview of the website (suggested: Visual Studio Code with the HTML Live Preview extension)

### Steps
1. Clone this repository to a local directory
2. Install the HTML Live Preview extension on Visual Studio Code (VSCode)
3. Open Parma's Page/page.html and enter your email address to generate an access code which will be used to create your account
4. Open the landing.html page in VSCode and start a live preview
5. Copy the preview link into your web browser (preferred: a chromium-based browser)
6. Enter an email address and generate the access code
7. Navigate to landing.html > sign-in.html > create-account.html and enter the access code while creating a new account
8. You've now created a Project Manager account. From here, you can create a new project and invite annotators via email (access codes will be generated and used as before)
9. Upon creating a new project, upload some unstructured .txt files and click on one to be redirected to the annotation interface
10. Create classes, add/remove classifications, view the Project Manager's instructions, save changes, export to JSON, and mark the file as "Done" once you've finished annotating

## Acknowledgements
- [Firebase](https://firebase.google.com/)

---
R&D Project Sem 2, 2024
