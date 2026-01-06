# Notes / Assumptions

## 1. Assumptions & Simplifications

### a. Key assumptions made during implementation

- Despite having two bounded contexts, the application is implemented as a **modular monolith** and focuses on **CQRS, business rules, and good design practices**.
- CQRS is treated as a **general architectural approach**, adapted to the size and complexity of the task, without requiring a full implementation with message queues, retry policies, or event buses.
- Both **Product** and **Order** have simplified structures and contain only the fields required to fulfill the task requirements.
- Logic related to changing product stock focuses on **business rules and validation**, not on transaction management or concurrency handling.
- Customer location is treated as an additional field provided during order creation.
- Discounts are calculated **per product**, not globally for the entire order.

### b. Elements that were intentionally omitted and the reasoning behind them

- Authentication was omitted, as the task did not require any security mechanism.
- Due to the use of **lowdb**, database-level mechanisms such as transactions were intentionally omitted.
- Price calculations do not assume multiple currencies or advanced financial requirements; instead, they rely on **decimal.js** to avoid floating-point rounding issues.
- Repository interfaces and DI tokens were not introduced. While they would make it easier to swap the persistence layer in the future, this was considered unnecessary overhead for the scope of this task.

### c. Interpretation of ambiguous parts of the task

**Discount rules**

- Discounts are calculated per product.
- Discounts cannot be combined; the **highest applicable percentage discount** is applied.

**Customer / location model**

- There are no dedicated Customer or Location entities.
- Location is provided directly in the order creation request, which simplifies manual testing and reduces unnecessary complexity.

## 2. Technical Decisions

### a. Justification for: database choice, project structure, CQRS implementation approach

#### Database

- **lowdb** was chosen to meet the task requirements, keep persistence simple, and avoid spending time on database configuration rather than business logic.

#### Project structure

The project consists of three main directories:

- **infra** – configuration of the technical layer (Express, dependency injection, database setup)
- **shared** – shared components used across modules
- **modules** – business bounded contexts (`product`, `order`)

Each module contains:

- **interface** – routes and controllers
- **application** – commands and queries
- **domain** – entities and domain services
- **infrastructure** – repositories and mappers
- **tests** – integration tests and factories

This structure allows modules to be **easily extracted into separate microservices** in the future.

### b. Brief explanation of command / query separation

- CQRS is implemented at the **application layer**.
- **Commands** mutate state and return `void`.
- **Queries** return data without side effects, using DTOs for read use cases.
- Commands and queries also act as **handlers**, responsible for orchestration:
  - invoking domain services
  - fetching data
  - executing business operations on entities

Full event sourcing or message-based CQRS was intentionally avoided to keep complexity reasonable.

## 3. Business Logic

### a. How the discount system works (priority, order of application)

- Discount calculation was identified as a good candidate for the **Strategy pattern**.
- Two types of discounts are implemented (location pricing is considered as a separate system)
  - Volume-based discounts
  - Seasonal discounts
- `DiscountCalculatorService` evaluates all available strategies and selects the **highest applicable discount**.

### b. How stock consistency is ensured (no negative stock)

- At the request validation level, only **positive quantities** are allowed.
- Stock consistency is enforced in the **Product entity**.
- Operations such as `reserve`, `sell`, and `restock` validate:
  - quantity must be positive
  - stock cannot go below zero
- Orders are rejected if any product has insufficient stock.

### c. Key edge cases that were taken into account

- Ordering non-existent products
- Missing quantities for selected products
- Zero or negative quantities
- Insufficient stock for any order item
- Overlapping discounts from different rules

## 4. Testing

### a. What is covered by tests and why

**Unit tests**

- Commands
- Domain services
- Discount strategies

These tests verify business requirements and ensure correct command orchestration.

**Integration tests**

- REST endpoints
- Full request → response flows, including:
  - request validation
  - business logic
  - database interaction

### b. What is not covered, but would be required in a production system

- Concurrency and race-condition scenarios
- Database-level transaction handling
- Security-related testing (authentication and permissions)

## Trade-offs & Alternatives

### 1. One concrete design decision you made that you would change if you had more time

- Using a real database with transactional support instead of `lowdb`, especially for operations such as:
  - `productRepository.updateMany`
  - `orderRepository.save`

### 2. One alternative solution you seriously considered but rejected

- Implementing stock management logic directly inside `CreateOrderCommand` instead of extracting it into `ProductStockService`.

This would result in duplicated logic across:

- `CreateOrderCommand`
- `SellProductCommand`
- `RestockProductCommand`

It would also cause the Order module to contain product-specific domain rules.

### 3. Why the chosen solution was selected over the alternative, including its downsides

- Clear separation of responsibilities
- Business rules are explicit and easy to test
- Discount logic is easy to extend without modifying existing code
- Commands remain orchestration-focused
