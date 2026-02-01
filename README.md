# Wayfinder
Welcome to the Wayfinder Project!

## How to run locally

### Step 1 - Clone the Repository

First, clone the repository to your local machine using Git:

```bash
git clone https://github.com/Munchken105/Wayfinder.git
```

You may or may not need to ```cd``` into your repo where you cloned it.

### Step 2 - From the root directory, run the commands:

```bash
cd backend
npm install
```

This will install the backend dependencies.

### Step 3 - Start the database

Ensure you have PostgreSQL installed on your local machine. To check, simply run this command on a terminal:

```bash
postgres --version
```

It should display something like: 

```postgres (PostgreSQL) 17.6```

where the number is the version of your installed PostgreSQL. This means that PostgreSQL is properly installed on your local machine.

If an error occurs, you do not have PostgreSQL installed. Download it at this [link](https://www.postgresql.org/download/) before going to the next step. Ensure you remember the password you set.

Afterward when it is properly installed, run:

```bash
npm run db:init
```

You may be prompted to type in your password. Enter in your password so the database can be hosted.

### Step 4 - Define environment variables

Make a .env file in the /backend directory with the following:

```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wayfinder

PORT=5000
```

Replace "your_password" with your own password that connects to the user "postgres" so that the database can run.

### Step 5 - Start the backend

```bash
npm run dev
```

This will start the development server for the backend.

### Step 6 - On a separate terminal and from the root directory, run the commands:

```bash
cd frontend
npm install
```

This will install the frontend dependencies.

### Step 7 - Start the frontend

```bash
npm run dev
```

This will start the development server for the frontend.

### Step 8 - Open a browser and visit [http://localhost:5173](http://localhost:5173) to open the frontend

This should connect to the backend automatically.

## Tailscale SSH

### Step 1 - Go to tailscale.com Login using the Wayfinder Gmail Account (Found on our private Doc)

### Step 2 Connect to tailnet

Open Terminal
```bash
tailscale up
```

### Step 3 - ssh
```bash
ssh wayfinder@2ndFloor
```
you are now sshed into the our 2ndFloor rasbery pi as more pi's come along ill update each pi with its own ssh instructions
