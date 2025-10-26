# PDF Portal

A full-stack PDF transformation platform built with .NET 8 and React. Vendors can upload PDFs, which are transformed into standardized government format PDFs using configurable templates, with preview and approval workflows.

## 🏗️ Architecture

This project follows Clean Architecture principles with clear separation of concerns:

- **Backend**: ASP.NET Core 8 Web API with Clean Architecture
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL with Entity Framework Core
- **PDF Processing**: iText7 library with swappable interfaces
- **Authentication**: JWT Bearer tokens

## 📁 Project Structure

```
pdfportal/
├── backend/
│   ├── src/
│   │   ├── PdfPortal.Api/              # Controllers, startup, configuration
│   │   ├── PdfPortal.Application/      # Business logic, use cases, DTOs
│   │   ├── PdfPortal.Domain/           # Entities, value objects, enums
│   │   └── PdfPortal.Infrastructure/   # EF Core, PDF services, JWT auth
│   └── tests/
│       └── PdfPortal.Tests/            # Unit tests
├── frontend/
│   └── src/                            # React + TypeScript + Tailwind app
└── docker-compose.yml                  # PostgreSQL database
```

## 🚀 Quick Start

### Prerequisites

- .NET 8 SDK
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd pdfportal
```

### 2. Start Database

```bash
docker-compose up -d
```

Wait for PostgreSQL to be ready (check with `docker-compose ps`).

### 3. Backend Setup

```bash
cd backend

# Restore packages
dotnet restore

# Update database (creates tables automatically)
cd src/PdfPortal.Api
dotnet ef database update

# Run the API
dotnet run
```

The API will be available at `https://localhost:5000` (or `http://localhost:5000` if HTTPS is disabled).

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## 🔧 Configuration

### Backend Configuration

Edit `backend/src/PdfPortal.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=pdfportal;Username=postgres;Password=postgres"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "PdfPortal",
    "Audience": "PdfPortalUsers",
    "ExpiryMinutes": 60
  }
}
```

### Frontend Configuration

The frontend automatically proxies API requests to `http://localhost:5000`. To change this, update `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Change this URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

## 📊 Database Schema

### Core Entities

- **User**: Authentication and authorization
- **TemplateRuleSet**: PDF transformation rules and templates
- **DocumentOriginal**: Uploaded PDF files
- **DocumentProcessed**: Transformed and approved PDFs

### Key Relationships

- Users can upload multiple documents
- Templates are created by Admin users
- Documents are processed using specific templates
- Processed documents contain extracted JSON data

## 🔐 Authentication & Authorization

### User Roles

- **Admin**: Can create/edit/delete templates, manage all documents
- **Vendor**: Can upload documents, preview transformations, approve/reject
- **Client**: Can view approved documents and extracted data

### JWT Token

The API uses JWT tokens for authentication. Include the token in requests:

```bash
curl -H "Authorization: Bearer <your-token>" https://localhost:5000/api/auth/me
```

## 📄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Documents
- `POST /api/document/upload` - Upload PDF document
- `GET /api/document/my-documents` - Get user's documents
- `GET /api/document/preview/{id}` - Preview transformed document
- `POST /api/document/approve` - Approve/reject document
- `GET /api/document/{id}/download` - Download document

### Templates (Admin only)
- `GET /api/template` - Get all templates
- `POST /api/template` - Create template
- `PUT /api/template/{id}` - Update template
- `DELETE /api/template/{id}` - Delete template

## 🎨 Frontend Features

### Dashboard
- Document statistics and overview
- Recent documents table
- Quick upload functionality

### Document Management
- Drag-and-drop PDF upload
- Document status tracking
- Preview and download capabilities
- Approval workflow

### Template Management (Admin)
- Create/edit/delete transformation templates
- JSON-based rule definitions
- Template activation/deactivation

## 🔧 Development

### Backend Development

```bash
cd backend

# Run tests
dotnet test

# Add new migration
cd src/PdfPortal.Api
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Generate API documentation
dotnet run --launch-profile Swagger
```

### Frontend Development

```bash
cd frontend

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐳 Docker Support

### Database Only (Development)

```bash
docker-compose up -d postgres
```

### Full Stack (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  postgres:
    # ... existing postgres config
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=pdfportal;Username=postgres;Password=postgres
    depends_on:
      - postgres
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
dotnet test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📝 PDF Processing

The system uses iText7 for PDF processing with a swappable interface:

```csharp
public interface IPdfProcessingService
{
    Task<string> ProcessPdfAsync(string inputPdfPath, string templateJsonDefinition);
    Task<Dictionary<string, object>> ExtractDataFromPdfAsync(string pdfPath);
    Task<bool> ValidatePdfAsync(string pdfPath);
}
```

### Template JSON Format

Templates define transformation rules in JSON:

```json
{
  "header": "Document Header Text",
  "fields": [
    {
      "name": "field1",
      "type": "text",
      "position": { "x": 100, "y": 200 },
      "required": true
    }
  ],
  "formatting": {
    "fontSize": 12,
    "fontFamily": "Arial"
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running: `docker-compose ps`
   - Check connection string in `appsettings.json`
   - Verify database exists: `docker-compose exec postgres psql -U postgres -c "\l"`

2. **Frontend Can't Connect to API**
   - Ensure backend is running on port 5000
   - Check CORS configuration in `Program.cs`
   - Verify proxy settings in `vite.config.ts`

3. **JWT Token Issues**
   - Check token expiration (default: 60 minutes)
   - Verify JWT secret key configuration
   - Ensure token is included in Authorization header

4. **PDF Upload Fails**
   - Check file size limits
   - Ensure file is valid PDF
   - Verify upload directory permissions

### Logs

Backend logs are available in the console. For more detailed logging, update `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section above
2. Review the API documentation at `https://localhost:5000/swagger`
3. Open an issue in the repository
4. Contact the development team

---

**Happy PDF Processing! 🚀**
