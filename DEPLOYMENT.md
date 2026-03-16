# 🚀 Deployment Guide - Side Income Planner

## Quick Start Checklist

- [ ] Replicate API key ready
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] Custom domain configured (optional)
- [ ] Tested the application

---

## Step 1: Get Your Replicate API Key

1. Go to [https://replicate.com](https://replicate.com)
2. Sign up or log in
3. Go to [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
4. Click "Create token"
5. Give it a name (e.g., "side-income-planner")
6. Copy the API key (starts with `r8_`)
7. **Keep it safe** - you'll need it for deployment

---

## Step 2: Push Code to GitHub

### If you haven't created a GitHub repository yet:

```bash
# Navigate to your project folder
cd "c:\Users\luoha\Desktop\code\side income planner"

# Initialize Git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Side Income Planner with Replicate API"

# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/side-income-planner.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Create GitHub repository:
1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `side-income-planner`
3. Description: `AI-powered side income planning tool`
4. Make it **Public** (free hosting) or **Private**
5. Click "Create repository"
6. Copy the repository URL
7. Use it in the command above

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Website (Recommended for beginners)

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. **Click "Continue with GitHub"** (this is the easiest method)
4. Authorize Vercel to access your GitHub
5. On the dashboard, click "Add New" → "Project"
6. Find and select `side-income-planner` from your GitHub repositories
7. Configure the project:

   **Configure Project**:
   - **Name**: `side-income-planner` (or any name you prefer)
   - **Framework Preset**: **Other** (or leave blank)
   - **Root Directory**: `./`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

8. **Environment Variables** (IMPORTANT!):
   Click "Add New" for each variable:

   | Name | Value |
   |------|-------|
   | `REPLICATE_API_KEY` | `r8_your_actual_api_key_here` |
   | `RATE_LIMIT_PER_IP` | `3` |
   | `RATE_LIMIT_GLOBAL` | `100` |

9. Click "Deploy"
10. Wait for deployment to complete (1-2 minutes)
11. You'll get a URL like: `https://side-income-planner.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from your project folder
cd "c:\Users\luoha\Desktop\code\side income planner"
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? Your username
# - Link to existing project? N
# - Project name: side-income-planner
# - Directory: ./
# - Settings? N (default is fine)

# Add environment variables
vercel env add REPLICATE_API_KEY
# Paste your API key when prompted

vercel env add RATE_LIMIT_PER_IP
# Enter: 3

vercel env add RATE_LIMIT_GLOBAL
# Enter: 100

# Deploy to production
vercel --prod
```

---

## Step 4: Configure Custom Domain (Optional)

### Add your domain in Vercel:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter: `sideincomeplanner.site`
5. Click "Add"

### Configure DNS records:

**If you bought your domain from:**

**Namecheap/GoDaddy/etc:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: Automatic
```

**Or use A record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Automatic
```

**Cloudflare (if you're using Cloudflare):**
- Turn off "Proxy status" (orange cloud → gray cloud)
- Or just add the CNAME record above

### Wait for DNS propagation:
- Can take anywhere from 5 minutes to 24 hours
- Usually completes within 1-2 hours
- Check status at: [https://dnschecker.org/](https://dnschecker.org/)

---

## Step 5: Test Your Deployment

### 1. Test the frontend:
- Visit your URL: `https://sideincomeplanner.site` (or your Vercel URL)
- Check if the page loads correctly
- Verify the logo and styling look good

### 2. Test the API:
- Complete the 5-step form
- Click "Generate My Blueprint"
- Wait 30-90 seconds (Llama 2 takes time)
- Check if the blueprint appears

### 3. Test rate limiting:
- Try generating another blueprint immediately
- You should get a rate limit error
- Wait or use a different IP to test again

### 4. Test saving:
- Click "Save to Browser"
- Refresh the page
- Check if your saved plan appears

---

## Step 6: Monitor and Maintain

### Check Vercel Analytics:
1. Go to your Vercel project
2. Click "Analytics" tab
3. Monitor:
   - Number of visitors
   - API function invocations
   - Error rates

### Check Replicate Usage:
1. Go to [https://replicate.com/account/billing](https://replicate.com/account/billing)
2. Monitor your usage
3. Check monthly costs

### Update environment variables if needed:
- Go to Vercel project → Settings → Environment Variables
- Edit and save
- **Redeploy** for changes to take effect

---

## Troubleshooting

### Problem: "REPLICATE_API_KEY is not configured"
**Solution**:
1. Go to Vercel project → Settings → Environment Variables
2. Add `REPLICATE_API_KEY` with your actual key
3. Click "Save"
4. Trigger a new deployment (push a new commit or click "Redploy")

### Problem: API returns error
**Solution**:
1. Check your Replicate API key is valid
2. Check you have credits in your Replicate account
3. Check Vercel Function Logs (in Vercel dashboard)
4. Make sure you're using the correct API key format (`r8_...`)

### Problem: Very slow response
**Solution**:
- This is normal for Llama 2 70B
- First request can take 60-90 seconds
- Subsequent requests may be faster (model is cached)
- The loading screen tells users to wait

### Problem: Domain not working
**Solution**:
1. Check DNS records are correct
2. Wait longer for DNS propagation
3. Use "DNS Checker" to verify propagation
4. Try accessing via the Vercel URL directly

### Problem: High costs
**Solution**:
1. Lower `RATE_LIMIT_GLOBAL` (e.g., 50 instead of 100)
2. Lower `RATE_LIMIT_PER_IP` (e.g., 2 instead of 3)
3. Monitor usage in Replicate dashboard
4. Consider using a smaller model (contact me for help)

---

## Cost Management Tips

1. **Start with conservative limits**:
   - `RATE_LIMIT_GLOBAL`: 50/day
   - `RATE_LIMIT_PER_IP`: 2/hour

2. **Monitor for the first week**:
   - Check daily usage
   - Adjust limits based on demand

3. **Expected costs**:
   - 50 requests/day: ~$0.50-1.50/month
   - 100 requests/day: ~$1-3/month
   - 200 requests/day: ~$2-6/month

4. **Set up billing alerts**:
   - In Replicate account settings
   - Get notified when you hit a threshold

---

## Security Checklist

- ✅ API key is in environment variables (not in code)
- ✅ `.env` file is in `.gitignore`
- ✅ Rate limiting is enabled
- ✅ CORS is configured (automatic with Vercel)
- ✅ No sensitive data in logs
- ✅ Error messages don't expose internals

---

## Next Steps

After successful deployment:

1. **Share with friends** - Get feedback
2. **Monitor usage** - Check Vercel and Replicate dashboards daily
3. **Collect feedback** - Add a feedback form or email
4. **Iterate** - Make improvements based on usage
5. **Promote** - Share on social media, forums, etc.

---

## Need Help?

If you encounter issues:

1. **Check the logs**: Vercel → Functions → Logs
2. **Read the error message**: It usually tells you what's wrong
3. **Check Replicate status**: [https://status.replicate.com/](https://status.replicate.com/)
4. **Review this guide**: Make sure you followed all steps

---

## Congratulations! 🎉

Your Side Income Planner is now live!

**Your URLs:**
- **Website**: `https://sideincomeplanner.site`
- **Vercel Dashboard**: `https://vercel.com/your-username/side-income-planner`
- **GitHub**: `https://github.com/your-username/side-income-planner`

**Quick Access Links:**
- [Vercel Project Settings](https://vercel.com/dashboard)
- [Replicate Billing](https://replicate.com/account/billing)
- [Replicate API Tokens](https://replicate.com/account/api-tokens)

---

**Last updated**: 2025-01-15
**Version**: 1.0.0 (MVP)
