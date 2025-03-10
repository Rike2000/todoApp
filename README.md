# TodoApp

A simple and intuitive Todo application built with React Native and Expo. The app is configured to use Google Firebase as a database.


## Features

- Authentication using Firebase Authentication
- Add, edit, and delete lists and tasks
- Invite other users to see and edit your lists
- Users can pick a color to use as the background color of their tasks

## Preview

1. **Login Screen**
   ![Image](https://github.com/user-attachments/assets/43c97b97-4c81-461b-8623-d6298507d77c)

2. **Home Screen**
   ![Image](https://github.com/user-attachments/assets/e52c0160-7906-46ad-a940-5bd0f360b23a)

3. **List view**
   ![Image](https://github.com/user-attachments/assets/7821589b-0faf-452c-abf0-64ae032a2f95)

4. **Settings Screen**
   ![Image](https://github.com/user-attachments/assets/c7131461-2718-4ae5-ad97-2d8d8024f604)


## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Rike2000/todoApp.git

2. **Create firebaseConfig.js file into the src folder and use your firebase configuration**

   ```
   import { initializeApp } from "firebase/app";
   import { getAuth } from "firebase/auth";
   import { getFirestore } from "firebase/firestore";

    const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
    };
  

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    export { auth, db };
    ```

3. **Install dependencies**

   ```bash
   npm install

4. **Firestore Database Rules**
   Cloud firestore rules needed for the app to work properly:
   ```
      rules_version = '2';
      service cloud.firestore {
      match /databases/{database}/documents {
    
      // Users Collection: Allow users to read others' emails (to invite)
      match /users/{userId} {
         allow read: if request.auth != null;  // Allow any logged-in user to read user data
         allow update, delete: if request.auth.uid == userId;  // Only users can edit their own profile
         allow create: if request.auth.uid == userId;
      }

      // todoLists Collection: Users in "userIds" can modify/delete the list
      match /todoLists/{listId} {
         allow read, update, delete: if resource.data.userIds != null && request.auth.uid in resource.data.userIds;
         allow create: if request.auth.uid != null;
      }

      // tasks Collection: Users can modify tasks if they have access to the parent list
      match /tasks/{taskId} {
         allow read, update, delete: if request.auth != null;
         allow create: if request.auth != null;
      }
   }
   }
   ```
 

## Usage

1. **Start the development server**
   ```bash
   npm start

2. **Open the app**
     
   -  For web: Open http://localhost:8081 in your browser.
   -  For mobile:
      - Install the Expo Go app on your device.
      - Scan the QR code displayed in the terminal or browser after starting the development server.
