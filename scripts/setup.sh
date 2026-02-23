#!/bin/bash
set -e

echo "🔧 Lynx Setup Wizard"
echo "===================="
echo ""

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "🔍 Checking system dependencies..."
echo ""

MISSING_DEPS=()

if ! command_exists node; then
    MISSING_DEPS+=("Node.js (v18+)")
fi

if ! command_exists npm; then
    MISSING_DEPS+=("npm")
fi

if ! command_exists python3; then
    MISSING_DEPS+=("Python 3.12+")
fi

if ! command_exists docker; then
    MISSING_DEPS+=("Docker")
fi

if ! command_exists docker compose; then
    MISSING_DEPS+=("Docker Compose")
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo "❌ Missing required dependencies:"
    for dep in "${MISSING_DEPS[@]}"; do
        echo "   - $dep"
    done
    echo ""
    echo "Please install the missing dependencies and run this script again."
    exit 1
fi

echo "✅ All system dependencies found!"
echo ""

echo "📦 Installing backend dependencies..."
cd backend

if command_exists poetry; then
    echo "   Installing via Poetry..."
    poetry install --no-root
else
    echo "   Installing via pip with venv..."
    if [ ! -d ".venv" ]; then
        echo "   Creating Python virtual environment..."
        python3 -m venv .venv
    fi
    source .venv/bin/activate
    pip install -q --upgrade pip
    pip install -q fastapi uvicorn sqlalchemy pygithub openai pydantic pydantic-settings \
        cryptography python-dotenv psycopg2-binary google-genai anthropic python-gitlab alembic
fi

cd ..
echo "✅ Backend dependencies installed"
echo ""

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"
echo ""

echo "🗄️  Setting up database..."
docker compose up -d db
sleep 5

cd backend

if command_exists poetry; then
    echo "   Running database migrations via Poetry..."
    poetry run alembic upgrade head
else
    echo "   Running database migrations..."
    source .venv/bin/activate
    alembic upgrade head
fi

cd ..
echo "✅ Database initialized"
echo ""

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env and add your GitHub/GitLab credentials"
echo "   2. Add your GitHub App private key to backend/github-app.private-key.pem"
echo "   3. Run './dev.sh' to start development servers"
echo ""
echo "📚 Documentation: https://github.com/tarek-gritli/lynx"
echo ""
