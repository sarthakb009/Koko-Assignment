# MongoDB Atlas Setup Instructions

## ✅ Connection String Configured

I've created a `.env` file in the `backend/` directory with your MongoDB Atlas connection string.

## 🔑 Important: Set Your Password

**You need to replace `<db_password>` with your actual MongoDB Atlas password.**

### Steps:

1. **Open the `.env` file:**
   ```bash
   cd backend
   nano .env
   # or use your preferred editor
   ```

2. **Replace `<db_password>` with your actual password:**
   ```env
   MONGODB_URI=mongodb+srv://sarthakft9_db_user:YOUR_ACTUAL_PASSWORD@cluster0.m8muzle.mongodb.net/vet-chatbot?retryWrites=true&w=majority
   ```

3. **If you don't remember your password:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Click on "Database Access" in the left sidebar
   - Find the user `sarthakft9_db_user`
   - Click "Edit" → "Edit Password"
   - Set a new password (remember to update it in `.env`)

4. **Network Access Setup:**
   Make sure your IP address is whitelisted in MongoDB Atlas:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, you can temporarily add `0.0.0.0/0` (allow all IPs)
   - **Note:** For production, only allow specific IPs

5. **Verify Connection:**
   After updating the password, restart your server:
   ```bash
   cd backend
   npm start
   ```

   You should see: `✅ Connected to MongoDB`

## 🔒 Security Note

- Never commit the `.env` file to git (it's already in `.gitignore`)
- Keep your MongoDB password secure
- In production, use environment variables set by your hosting platform

## 📝 Next Steps

1. Update the `.env` file with your password
2. Set your `GEMINI_API_KEY` (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))
3. Restart the backend server
4. Test the connection!

