# MongoDB Setup Guide

## Quick Fix for Connection Error

If you're seeing `MongooseServerSelectionError: connect ECONNREFUSED`, MongoDB is not running.

### Option 1: Start MongoDB Service (Recommended for Local Development)

Since MongoDB is installed via Homebrew on your system, try these methods:

**Quick Start (Recommended):**
```bash
# Run the startup script
./START_MONGODB.sh
```

**Manual Start Methods:**

```bash
# Method A: Start MongoDB as a service (runs in background)
brew services start mongodb-community

# Method B: Start MongoDB directly (runs until terminal closes)
mongod --dbpath /opt/homebrew/var/mongodb

# Method C: Start with config file
mongod --config /opt/homebrew/etc/mongod.conf
```

**If brew services fails:**
```bash
# Clean up and restart service
brew services stop mongodb-community
rm ~/Library/LaunchAgents/homebrew.mxcl.mongodb-community.plist
brew services start mongodb-community
```

**Check if MongoDB is running:**
```bash
# Check service status
brew services list | grep mongodb

# Or check if port is listening
lsof -i :27017

# Or try connecting
mongosh
```

**To stop MongoDB:**
```bash
brew services stop mongodb-community
# Or if started directly, use Ctrl+C or:
pkill mongod
```

### Option 2: Use MongoDB Atlas (Cloud - No Local Setup)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a free cluster
4. Get your connection string
5. Update your `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vet-chatbot?retryWrites=true&w=majority
```

**Note**: Replace `username`, `password`, and `cluster` with your actual Atlas credentials.

### Verify MongoDB is Running

After starting MongoDB, verify the connection:

```bash
# Check if MongoDB is listening on port 27017
lsof -i :27017

# Or try connecting with MongoDB shell
mongosh
```

If you see `MongoDB shell version` or connection info, MongoDB is running correctly.

### Troubleshooting

**MongoDB service won't start:**
```bash
# Check logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log

# Check if port 27017 is already in use
lsof -i :27017
```

**Permission errors:**
```bash
# Make sure data directory exists and has correct permissions
sudo mkdir -p /opt/homebrew/var/mongodb
sudo chown $(whoami) /opt/homebrew/var/mongodb
```

**After starting MongoDB, restart your backend server:**
```bash
cd backend
npm start
```

You should see: `✅ Connected to MongoDB`

