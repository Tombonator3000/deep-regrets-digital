# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/48af93e3-33a6-418b-b8ce-172095dc4d1a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/48af93e3-33a6-418b-b8ce-172095dc4d1a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project supports **dual hosting** - you can deploy it both via Lovable and GitHub Pages.

### Deploy via Lovable

Simply open [Lovable](https://lovable.dev/projects/48af93e3-33a6-418b-b8ce-172095dc4d1a) and click on Share -> Publish.

### Deploy via GitHub Pages

The project is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

**Live URL**: `https://tombonator3000.github.io/deep-regrets-digital/`

#### How it works:

1. The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys on push to `main`
2. The build uses the `GITHUB_PAGES` environment variable to set the correct base path
3. You can also manually trigger deployment from the Actions tab on GitHub

#### First-time setup:

To enable GitHub Pages for this repository:

1. Go to your repository on GitHub
2. Click on **Settings** > **Pages**
3. Under "Build and deployment":
   - Source: Select **GitHub Actions**
4. The site will be available at `https://tombonator3000.github.io/deep-regrets-digital/`

### Benefits of dual hosting:

✅ **Independence from Lovable** - Not dependent on a single platform
✅ **Backup** - If Lovable has downtime, GitHub Pages still works
✅ **Redundancy** - Multiple deployment options
✅ **Flexibility** - Choose which platform to use

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
