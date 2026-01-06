# Coffee Mug Recruitment Task

A TypeScript-based RESTful API for an e-commerce inventory management system

> **IMPORTANT:** All changes are included in the PR from `feature/inventory-system`

## 🚀 Features

- **Product Management**: Create, list, restock, and sell products
- **Order Processing**: Create orders with automatic stock reservation and pricing calculation
- **Type-Safe API**: Full TypeScript support with Zod schema validation
- **Security**: Helmet, CORS, and rate limiting protection
- **Dependency Injection**: Clean architecture using TSyringe
- **Structured Logging**: Request/response logging with Pino
- **Testing**: Comprehensive test suite with Vitest

## 📋 Prerequisites

- Node.js (LTS)
- npm

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=3000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
CORS_ORIGIN=http://localhost:3000
DB_FILE_NAME=db.json
```

### Environment Variables

| Variable               | Description                                            | Default         |
| ---------------------- | ------------------------------------------------------ | --------------- |
| `NODE_ENV`             | Environment mode (`development`, `production`, `test`) | -               |
| `PORT`                 | Server port number                                     | 3000            |
| `RATE_LIMIT_MAX`       | Maximum requests per window                            | 100             |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds                      | 900000 (15 min) |
| `CORS_ORIGIN`          | Allowed CORS origins (comma-separated)                 | -               |
| `DB_FILE_NAME`         | Database file name                                     | db.json         |

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
# Build the project
npm run build

# Start the production server
npm start
```

## 🧪 Testing

```bash
# Run tests once
npm test

# Watch mode
npm run test:watch
```

## 🔍 Code Quality

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

## 📚 API Documentation

Base URL: `http://localhost:3000/api`

### Products

#### Create Product

```http
POST /api/products
Content-Type: application/json

{
  "name": "Coffee Mug",
  "description": "Ceramic coffee mug - 350ml",
  "price": 19.99,
  "stock": 100
}
```

#### Get All Products

```http
GET /api/products
```

#### Restock Product

```http
POST /api/products/:id/restock
Content-Type: application/json

{
  "quantity": 50
}
```

#### Sell Product

```http
POST /api/products/:id/sell
Content-Type: application/json

{
  "quantity": 5
}
```

### Orders

#### Create Order

```http
POST /api/orders
Content-Type: application/json

{
  "customerId": "customer-123",
  "customerLocation": "EU",
  "items": [
    {
      "id": "product-uuid",
      "quantity": 2
    }
  ]
}
```

## 🏗️ Architecture

The project follows **Domain-Driven Design (DDD)** and **Clean Architecture** principles:

```
src/
├── infra/              # Infrastructure layer
│   ├── db/            # Database configuration
│   ├── di/            # Dependency injection setup
│   └── http/          # HTTP server and middleware
├── modules/           # Bounded context modules
│   ├── order/
│   │   ├── application/    # Use cases/commands
│   │   ├── domain/         # Domain entities & services
│   │   ├── infrastructure/ # Repositories
│   │   └── interface/      # Controllers & routes
│   └── product/
│       ├── application/    # Use cases/commands
│       ├── domain/         # Domain entities & services
│       ├── infrastructure/ # Repositories
│       └── interface/      # Controllers & routes
└── shared/            # Shared utilities
    ├── config/        # Configuration
    ├── di/            # DI tokens
    ├── error/         # Error handling
    ├── http/          # HTTP utilities
    ├── logger/        # Logging
    └── types/         # Shared types
```

### Key Design Patterns

- **Domain-Driven Design (DDD)**: Business logic organized by domain
- **CQRS**: Separation of commands and queries
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: Loose coupling with TSyringe
- **Factory Pattern**: Entity creation
- **Service Layer**: Domain services for complex business logic

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: Request throttling
- **Input Validation**: Zod schema validation
- **Type Safety**: Full TypeScript coverage

## 🔧 Technology Stack

### Core

- **TypeScript**: Type-safe JavaScript
- **Node.js**: Runtime environment
- **Express**: Web framework

### Database

- **LowDB**: Simple JSON database

### Validation & Security

- **Zod**: Schema validation
- **Helmet**: Security headers
- **CORS**: Cross-origin protection
- **Express Rate Limit**: Rate limiting

### Logging

- **Pino**: Fast logging library
- **Pino-HTTP**: HTTP request logging

### Dependency Injection

- **TSyringe**: Dependency injection container

### Development

- **Vitest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **tsx**: TypeScript execution
- **tsc-alias**: Path alias resolution

### CI

- **Build** – Build the project
- **Lint** – Run code linting
- **Typecheck** – Perform TypeScript type checking
- **Tests** – Execute unit and integration tests
