# Pede-AI Frontend

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Introduction

**Pede-AI Frontend** is the client-side application for the Pede-AI project, built using Next.js. It connects to the Strapi backend to provide a seamless and dynamic user experience for ordering products. This frontend application offers a responsive and interactive interface for users to browse, select, and order products with ease.

## Features

- Responsive design for mobile and desktop
- Product listing and detailed view
- Integration with Strapi backend API
- SEO-friendly with Next.js server-side rendering

## Technology Stack

- **Frontend Framework:** Next.js (React)
- **State Management:** React Context API / Redux (optional)
- **Styling:** Tailwind CSS / shadcnui
- **API Client:** Fetch API
- **Hosting:** Vercel

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (>= 18.x.x)
- npm or yarn (stable)
- Access to the Pede-AI Strapi backend (API_KEY)

## Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/jorgejr568/pede-ai-frontend.git
   cd pede-ai-frontend
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

   or

   ```sh
   yarn install
   ```

3. **Start the development server:**

   ```sh
   npm run dev
   ```

   or

   ```sh
   yarn dev
   ```

   This will start the Next.js development server on `http://localhost:3000`.

## Usage

1. **Pages and Components:**

   - Customize and add pages in the `pages` directory.
   - Create reusable components in the `components` directory.

2. **Fetching Data:**

   Use Next.js data fetching methods (`getStaticProps`, `getServerSideProps`) to fetch data from the Strapi backend.

   Example:

   ```js
   export async function getStaticProps() {
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
     const products = await res.json();

     return {
       props: { products },
     };
   }
   ```

3. **Styling:**

   - Use Tailwind CSS for styling your components.

## Deployment

1. **Build the project:**

   ```sh
   npm run build
   ```

   or

   ```sh
   yarn build
   ```

2. **Start the server:**

   ```sh
   npm run start
   ```

   or

   ```sh
   yarn start
   ```

3. **Deploy to a hosting service:**

   Follow the specific instructions for your chosen hosting service (e.g., Vercel) to deploy your Next.js application.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

Please make sure your code adheres to the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

For any inquiries or feedback, please contact [jorgejuniordev@gmail.com](mailto:jorgejuniordev@gmail.com).

---

Thank you for using Pede-AI Frontend! We hope it provides a great user experience for your customers.
