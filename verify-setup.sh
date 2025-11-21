#!/bin/bash

# Legosphere Drafter - Setup Verification Script
# This script helps verify that your environment is properly configured

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Legosphere Drafter - Setup Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "✓ Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}OK${NC} ($NODE_VERSION)"
else
    echo -e "${RED}FAILED${NC}"
    echo "  Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check npm
echo -n "✓ Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}OK${NC} ($NPM_VERSION)"
else
    echo -e "${RED}FAILED${NC}"
    echo "  npm is not installed."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Frontend Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check frontend .env
echo -n "✓ Checking frontend .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}MISSING${NC}"
    echo "  Please create a .env file in the root directory."
    echo "  Copy .env.example and fill in your credentials."
    exit 1
fi

# Check VITE_GEMINI_API_KEY
echo -n "✓ Checking VITE_GEMINI_API_KEY... "
if grep -q "VITE_GEMINI_API_KEY=AIza" .env; then
    echo -e "${GREEN}SET${NC}"
else
    echo -e "${YELLOW}WARNING${NC}"
    echo "  VITE_GEMINI_API_KEY may not be set correctly."
    echo "  It should start with 'AIza' and be 39 characters long."
fi

# Check VITE_SUPABASE_URL
echo -n "✓ Checking VITE_SUPABASE_URL... "
if grep -q "VITE_SUPABASE_URL=https://" .env; then
    echo -e "${GREEN}SET${NC}"
else
    echo -e "${YELLOW}WARNING${NC}"
    echo "  VITE_SUPABASE_URL may not be set correctly."
fi

# Check VITE_SUPABASE_ANON_KEY
echo -n "✓ Checking VITE_SUPABASE_ANON_KEY... "
if grep -q "VITE_SUPABASE_ANON_KEY=eyJ" .env; then
    echo -e "${GREEN}SET${NC}"
else
    echo -e "${YELLOW}WARNING${NC}"
    echo "  VITE_SUPABASE_ANON_KEY may not be set correctly."
fi

# Check frontend node_modules
echo -n "✓ Checking frontend dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}INSTALLED${NC}"
else
    echo -e "${YELLOW}NOT INSTALLED${NC}"
    echo "  Run 'npm install' to install frontend dependencies."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Backend Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check server .env
echo -n "✓ Checking server/.env file... "
if [ -f "server/.env" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}MISSING${NC}"
    echo "  Please create a server/.env file."
    echo "  Copy server/.env.example and fill in your credentials."
    exit 1
fi

# Check GEMINI_API_KEY
echo -n "✓ Checking GEMINI_API_KEY... "
if grep -q "GEMINI_API_KEY=AIza" server/.env; then
    echo -e "${GREEN}SET${NC}"
else
    echo -e "${YELLOW}WARNING${NC}"
    echo "  GEMINI_API_KEY may not be set correctly in server/.env"
fi

# Check DATABASE_URL
echo -n "✓ Checking DATABASE_URL... "
if grep -q "DATABASE_URL=postgresql://" server/.env; then
    if grep -q "\[YOUR-PASSWORD\]" server/.env || grep -q "\[PASSWORD\]" server/.env; then
        echo -e "${YELLOW}PLACEHOLDER${NC}"
        echo "  DATABASE_URL contains placeholder. Replace with actual password."
    else
        echo -e "${GREEN}SET${NC}"
    fi
else
    echo -e "${YELLOW}WARNING${NC}"
    echo "  DATABASE_URL may not be set correctly."
fi

# Check server node_modules
echo -n "✓ Checking server dependencies... "
if [ -d "server/node_modules" ]; then
    echo -e "${GREEN}INSTALLED${NC}"
else
    echo -e "${YELLOW}NOT INSTALLED${NC}"
    echo "  Run 'cd server && npm install' to install backend dependencies."
fi

# Check Prisma Client
echo -n "✓ Checking Prisma Client... "
if [ -d "server/node_modules/@prisma/client" ]; then
    echo -e "${GREEN}GENERATED${NC}"
else
    echo -e "${YELLOW}NOT GENERATED${NC}"
    echo "  Run 'cd server && npx prisma generate' to generate Prisma Client."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your setup appears to be configured."
echo ""
echo "Next steps:"
echo "  1. Start the backend:  cd server && npm run dev"
echo "  2. Start the frontend: npm run dev"
echo "  3. Open http://localhost:5173 in your browser"
echo ""
echo "For troubleshooting, see:"
echo "  - README.md (main setup guide)"
echo "  - server/README.md (backend-specific guide)"
echo "  - TROUBLESHOOTING.md (common issues and solutions)"
echo ""
