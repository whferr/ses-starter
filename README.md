# AWS SES Mailer - React/TypeScript Minimal Client

A clean, minimal, and high-quality AWS SES email client built with React and TypeScript. Designed for local use with JSON-based storage, making it perfect for developers who need a simple email marketing tool without external dependencies.

## ✨ Features

- **Local Templates**: JSON-based email templates with HTML/text content
- **Contact Management**: Local JSON contact storage with CSV import/export  
- **Immediate Sending**: Send emails instantly with rate limiting
- **Batch Processing**: Smart batching to respect AWS SES limits
- **AWS SES Integration**: Simple configuration for AWS credentials and region
- **Sender Profiles**: Multiple sender identities
- **Local Storage**: All data stored locally in JSON files

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom components
- **Email**: AWS SES SDK v3
- **Storage**: Local JSON files
- **Build**: React Scripts (TypeScript compilation)

## 📦 Installation & Setup

### Prerequisites

```bash
# Node.js 16+ required
node --version

# AWS CLI (optional, for SES setup)
aws --version
```

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# .env.local
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DEFAULT_FROM_EMAIL=your-email@domain.com
REACT_APP_DEFAULT_REPLY_TO_EMAIL=your-email@domain.com
```

## 🚀 Usage

1. **Configure AWS SES**: Go to Settings and enter your AWS credentials
2. **Add Contacts**: Import from CSV or add manually in the Contacts section
3. **Create Templates**: Design email templates with variables in the Templates section
4. **Send Campaigns**: Use the Campaigns section to send bulk emails with rate limiting

## 📊 Data Storage

All data is stored locally in JSON files:

- `public/data/contacts.json` - Contact information
- `public/data/templates.json` - Email templates
- `public/data/sender-profiles.json` - Sender identities
- `public/data/sent-emails.json` - Send history
- `public/data/settings.json` - App configuration

## 🛡️ Security

- Environment variables for AWS credentials
- No hardcoded secrets in code
- All data stored locally
- No external data transmission except AWS SES

## 📝 Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## 🎯 Development Phases

This project follows a phased development approach:

- ✅ **Phase 1**: Project setup, basic components, AWS SES client
- 🔄 **Phase 2**: Contact management, Template management, Settings
- ⏳ **Phase 3**: Campaign composer, Batch sending, Send history
- ⏳ **Phase 4**: UI/UX refinement, Testing, Documentation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub. 