# Campus LnF – 13th Hour

A **database-driven digital Lost & Found system** designed for campus environments.
This project centralizes lost and found item reporting, enables secure ownership verification, and automates item matching using relational database principles.

Built as part of **CSE 4508 – Relational Database Management Systems**.

---

## Problem Statement

Traditional campus lost-and-found systems are:

* Inconsistent and fragmented
* Lacking verification mechanisms
* Inefficient at matching lost items with found ones
* Prone to fake or unresolved claims

As a result, many items remain unclaimed despite being found.

---

## Solution Overview

**Campus LnF** provides a centralized, secure, and automated platform that:

* Allows users to report lost and found items digitally
* Uses structured data to match items accurately
* Tracks claims and return requests with full history
* Ensures data integrity, privacy, and verification through a relational database

---

## Core Features

* Centralized lost & found database
* Secure user authentication
* Lost item reports and found item reports
* Claim and return request workflows
* Image-based evidence support
* Category- and location-based search
* Automated matching using stored procedures and triggers
* Status tracking (`active`, `completed`, `expired`)
* User notifications

---

## Database Design Highlights

* Fully normalized relational schema
* Clear separation of **User** and **Authentication**
* Many-to-many relationships for images and tags
* ENUM-based state management
* Referential integrity via foreign keys
* Stored procedures for business logic
* Triggers for automation and consistency

---

## Running the Code

Run `npm install` to install the dependencies.

Run `npm run dev` to start the development server, then ctrl+click on the local host link.

---

## 📄 License

This project is developed for academic purposes under **CSE 4508**.
