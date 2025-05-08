# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deploying to Firebase Hosting

This project is configured for static export and deployment to Firebase Hosting.

### Prerequisites

1.  **Install Firebase CLI**: If you don't have it installed globally, you can run:
    ```bash
    npm install -g firebase-tools
    ```
    Alternatively, `firebase-tools` is included in the project's `devDependencies`, so you can use `npx firebase` for commands.

2.  **Login to Firebase**:
    ```bash
    firebase login
    ```

3.  **Set up Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project or use an existing one.
    *   Copy your Firebase **Project ID**.

### Configuration

1.  **Update `.firebaserc`**:
    Open the `.firebaserc` file in the root of your project and replace `"YOUR_PROJECT_ID"` with your actual Firebase Project ID:
    ```json
    {
      "projects": {
        "default": "YOUR_PROJECT_ID"
      }
    }
    ```
    Alternatively, you can associate this local project with your Firebase project by running:
    ```bash
    firebase use --add
    ```
    Then select your project and give it an alias (e.g., `default`).

### Deployment

1.  **Build the Project**:
    This command will build your Next.js application and export it to the `out/` directory.
    ```bash
    npm run build
    ```

2.  **Deploy to Firebase Hosting**:
    This command will deploy the contents of the `out/` directory to Firebase Hosting.
    ```bash
    npm run deploy
    ```
    Or, if you prefer using npx for the locally installed `firebase-tools`:
    ```bash
    npx firebase deploy --only hosting
    ```

After deployment, Firebase CLI will provide you with the URL where your application is hosted.

### Note on Dynamic Routes
This project uses `output: 'export'` in `next.config.js` for static deployment.
Dynamic routes (like `/patients/[patientId]`) will be client-side rendered. If you need these pages to be pre-rendered at build time, you'll need to implement `generateStaticParams` in the respective page components. For API routes or more advanced server-side features, you might need to configure Firebase Hosting to work with Cloud Functions or Cloud Run, which is a more advanced setup.
