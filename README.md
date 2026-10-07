# Cloud-Based Library Management System

A responsive Library Management System built with HTML, CSS and JavaScript.

## Features

- Dashboard with total books, available books, issued books and members
- Add / edit / delete books
- Search books by title, author, ISBN, category or ID
- Filter books by category
- Add / edit / delete members
- Issue books to members
- Return issued books
- Automatic available-copy updates
- Due-date and overdue detection
- Transaction search and status filtering
- Category-based report
- Responsive design for desktop and mobile
- Data persistence using browser localStorage
- Demo data included

## How to run

1. Extract the ZIP file.
2. Open `index.html` in Google Chrome, Microsoft Edge or Firefox.
3. The application works directly in the browser.
4. All changes are saved in browser localStorage.

## Project structure

Cloud_Library_Management_System/
- index.html
- style.css
- app.js
- README.md

## Cloud deployment

For a cloud-hosted version, this frontend can be deployed to services such as Firebase Hosting, GitHub Pages, Netlify or Vercel. For a true multi-user cloud database, the localStorage layer in `app.js` can be replaced with Firebase Firestore or another backend database.

## Academic project modules

1. Admin Dashboard
2. Book Management
3. Member Management
4. Issue / Return Management
5. Search and Filter
6. Reports
7. Local cloud-ready data architecture
