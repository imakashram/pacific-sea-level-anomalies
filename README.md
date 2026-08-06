# About the Project

**Pacific Sea Level Anomalies** is an interactive climate data visualization project that explores how sea levels have changed across the Pacific Island Countries and Territories (PICTs). The project uses data from the **Pacific Community (SPC) Climate Change Indicators Database** to show historical sea-level changes, compare trends across decades, examine the effects of El Niño–Southern Oscillation (ENSO), identify countries that are more vulnerable, and estimate future sea-level changes.

The project includes:

* A **React** frontend built with **Vite, Tailwind CSS, Framer Motion, Recharts, and D3.js** for interactive visualizations and storytelling.
* An **Express.js** backend API that processes and serves climate data from CSV files.

This document provides a list of all important project URLs, including local development links, production websites, API endpoints, and external data sources.

---

# Local Development URLs

| URL                                  | Description                                                                                                                                                                        |
| :----------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http://localhost:5173/`             | **Climate Story** – Main local development site for the interactive climate visualization.                                                                                         |
| `http://localhost:5173/api-explorer` | **API Explorer** – Test, explore, and interact with the available API endpoints. (Also available at `/explorer`)                                                                   |
| `http://localhost:5173/methodology`  | **Methodology** – Explains the calculations, formulas, trend analysis, and prediction methods used in the project. (Also available at `/calculations` and `/how-it-is-calculated`) |
| `http://localhost:5001/api`          | **Backend API** – Local Express.js server providing all API endpoints.                                                                                                             |

---

# Production URLs

| URL                                                  | Description                                                                                                            |
| :--------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| `https://pacificocean.insightcrust.com/`             | **Live Website** – Public version of the interactive climate data visualization.                                       |
| `https://pacificocean.insightcrust.com/api-explorer` | **Live API Explorer** – Explore and test API endpoints on the production server.                                       |
| `https://pacificocean.insightcrust.com/methodology`  | **Live Methodology** – Learn about the project's calculations, trends, prediction models, and risk assessment methods. |
