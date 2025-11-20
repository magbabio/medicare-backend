# Medicare Backend: Appointment Management System API

This is the backend service for a full-stack medical appointment management platform, demonstrating robust handling of complex business logic, user authentication, and resource management.

### Features 

This project proves proficiency in building a secure and consistent Full-Stack Node.js API:

* **Complex Scheduling Logic:** Implements an advanced algorithm (`getAvailableDaysForDoctor`) to calculate dynamic availability, considering doctor schedules, assigned cubicles, and existing appointments.
* **Secure Authentication (JWT):** Utilizes **`jsonwebtoken`** for sign-in and token creation (`login`) and **`bcryptjs`** for password hashing, ensuring secure user sessions.
* **Atomic Transactions:** Implements Sequelize Transactions during user creation (e.g., creating `User` and `Doctor` simultaneously) to guarantee data integrity.
* **Data Integrity & Consistency:** Extensive use of Soft Delete (`deletedAt` field and `restore()`) across all core entities (`Doctor`, `Cubicle`, `Specialty`), a critical practice for production systems.
* **Database Management:** Demonstrates proficiency with Sequelize (ORM) including complex SQL Joins (via `include`) and dynamic `WHERE` clauses for filtering appointments by status or patient/doctor ID.
* **Modular Architecture:** Logic is cleanly separated by domain (`appointment`, `cubicle`, `doctor`, `specialty`), promoting maintainability and adherence to the Separation of Concerns principle.

### Stack and Dependencies

| Category | Technology | Role |
| :--- | :--- | :--- |
| **Language** | JavaScript (ES6+) | Backend Core |
| **Framework** | **Node.js (Express)** | RESTful API Endpoints |
| **Database** | **PostgreSQL** | Primary data storage |
| **ORM** | Sequelize | Object-Relational Mapping (Migrations & Models) |
| **Security** | **JWT** (`jsonwebtoken`), **bcryptjs** | Authentication and Password Hashing |

### Future Improvements 

This project was developed in 2024 and provided essential experience in handling complex business requirements. Moving forward, the key areas for professional improvement would be:

1.  **Transition to TypeScript:** Implementing static typing would catch errors early and improve code maintainability and scalability.
2.  **Architectural Refinement:** Adopting a framework like NestJS would impose a stricter architecture (like Dependency Injection and Services), centralizing and testing complex logic (e.g., `getAvailableDaysForDoctor`) more effectively.
3.  **Error Handling:** Implementing centralized error handling middleware instead of repeating `try...catch` blocks in every controller to follow DRY (Don't Repeat Yourself) principles.

### Associated Repositories

* **Frontend Repository:** `https://github.com/magbabio/medicare-frontend`
