# About the Project

**Pacific Sea Level Anomalies** is an interactive climate data visualization project that explores how sea levels have changed across the Pacific Island Countries and Territories (PICTs). The project uses data from the **Pacific Community (SPC) Climate Change Indicators Database** to show historical sea-level changes, compare trends across decades, examine the effects of El Niño–Southern Oscillation (ENSO), identify countries that are more vulnerable, and estimate future sea-level changes.

The project includes:

* A **React** frontend built with **Vite, Tailwind CSS, Framer Motion, Recharts, and D3.js** for interactive visualizations and storytelling.
* An **Express.js** backend API that processes and serves climate data from CSV files.
* **Hosting & Deployment** on **Netlify** and **Render** (Render powers the live web service and API server, while Netlify provides static frontend hosting and CDN distribution).

This document provides a list of all important project URLs, including local development links, production websites, API endpoints, and external data sources.

---

# Local Development URLs

| URL                                      | Description                                                                                                                                                                        |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http://localhost:5173/`                 | **Climate Story** – Main local development site for the interactive climate visualization.                                                                                         |
| `http://localhost:5173/behind-the-story` | **Behind the Story** – The author's personal approach, data exploration, and story design behind turning 30 years of climate data into an interactive visual narrative.          |
| `http://localhost:5173/methodology`      | **Methodology & Formulas** – Explains the calculations, formulas, trend analysis, and prediction methods used in the project. (Also available at `/calculations` and `/how-it-is-calculated`) |
| `http://localhost:5173/api-explorer`     | **API Explorer** – Test, explore, and interact with the available API endpoints. (Also available at `/explorer`)                                                                   |
| `http://localhost:5001/api`              | **Backend API** – Local Express.js server providing all API endpoints.                                                                                                             |

---

# Production URLs & Deployment

The project is hosted and deployed across **Netlify** and **Render**:
* **Render:** Hosts the live interactive web application and API service.
* **Netlify:** Configured for automated frontend deployment and static delivery (`netlify.toml`).

| URL                                                      | Description                                                                                                                               |
| :------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `https://pacific-sea-level-story.onrender.com/`                 | **Live Website (Render)** – Public version of the interactive climate data visualization.                                                 |
| `https://pacific-sea-level-story.onrender.com/behind-the-story` | **Live Behind the Story** – Read about the concept, creative direction, data exploration, and development journey behind the story.        |
| `https://pacific-sea-level-story.onrender.com/methodology`      | **Live Methodology & Formulas** – Learn about the project's calculations, trends, prediction models, and risk assessment methods.         |
| `https://pacific-sea-level-story.onrender.com/api-explorer`     | **Live API Explorer** – Explore and test API endpoints on the production server.                                                          |

---

# External Data Sources

| Source | Link | Description |
| :----- | :--- | :---------- |
| **Pacific Data Hub** | [Pacific Data Hub [Sea level anomalies]](https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SEA_LVL.&pd=,&to[TIME_PERIOD]=false) | Primary data source from the Pacific Community (SPC) Climate Change Indicators Database. |

---

## AI Disclosure

This project was mainly created and developed by the author through extensive data exploration, analysis, and experimentation. AI tools, including [Antigravity](https://antigravity.google/) and [Google Gemini](https://gemini.google.com/), were used only for limited code support, technical guidance, and design suggestions.

The main idea, data analysis, visual storytelling, data visualization, interaction design, creative direction, and most of the development were done independently by the author. The project involved continuous improvements, testing, and refinements throughout the development process.

The project source code and development history can be viewed on [GitHub](https://github.com/imakashram/pacific-sea-level-anomalies).

All AI-assisted suggestions and outputs were reviewed, modified, and refined by the author to match the original vision of the project.
