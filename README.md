# Side Income Planner 💡

A simple, AI-powered web application that helps users discover personalized side-income opportunities based on their skills, interests, and goals.

## Features

- **5-Step Guided Conversation** - Easy-to-follow question flow
- **AI-Powered Recommendations** - Uses Llama 2 70B to generate tailored side-income ideas
- **Complete Action Plans** - Get validation steps, action items, and sustainability strategies
- **Local Storage** - Save your generated blueprints in your browser
- **Rate Limiting** - Built-in protection against API abuse
- **Responsive Design** - Works on desktop and mobile devices
- **Privacy-Focused** - No account required, plans saved locally

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI**: Replicate API (Llama 2 70B Chat model)
- **Deployment**: Vercel (free tier)
- **Domain**: sideincomeplanner.site

## Project Structure

```
side-income-planner/
├── index.html              # Main HTML page
├── css/
│   └── main.css            # Styles
├── js/
│   └── app.js              # Frontend application logic
├── api/
│   └── generate-blueprint.js  # Backend API endpoint
├── vercel.json             # Vercel configuration
├── .env.example            # Environment variables template
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

1. **Replicate API Key** - Get one from [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. **GitHub Account** - For code hosting
3. **Vercel Account** - For deployment (can use GitHub login)
4. **Domain** (optional) - sideincomeplanner.site

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/side-income-planner.git
   cd side-income-planner
   ```

2. **Install dependencies** (optional, for Vercel CLI)
   ```bash
   npm install -g vercel
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Replicate API key:
   ```
   REPLICATE_API_KEY=r8_your_actual_api_key_here
   RATE_LIMIT_PER_IP=3
   RATE_LIMIT_GLOBAL=100
   ```

4. **Test locally using Vercel CLI**
   ```bash
   vercel dev
   ```

   The app will be available at `http://localhost:3000`

### Deployment to Vercel

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/side-income-planner.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables:
     - `REPLICATE_API_KEY`: Your Replicate API key
     - `RATE_LIMIT_PER_IP`: `3`
     - `RATE_LIMIT_GLOBAL`: `100`
   - Click "Deploy"

3. **Configure custom domain** (optional)
   - In Vercel project settings, go to "Domains"
   - Add `sideincomeplanner.site`
   - Update your DNS records:
     ```
     Type: CNAME
     Name: @
     Value: [your-vercel-domain].vercel.app
     ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REPLICATE_API_KEY` | Your Replicate API key | Required |
| `RATE_LIMIT_PER_IP` | Max requests per IP per hour | `3` |
| `RATE_LIMIT_GLOBAL` | Max global requests per day | `100` |

## Cost Estimates

Based on Replicate Llama 2 70B pricing:
- **Per request**: ~$0.0002-0.001 (depending on output length)
- **100 requests/day**: ~$0.02-0.10/day = $0.60-3/month
- **Vercel hosting**: Free (within usage limits)

**Total estimated cost**: $1-5/month

Note: Replicate charges per second of compute time and per token. Llama 2 70B is very cost-effective compared to GPT-3.5.

## Rate Limiting

To control costs and prevent abuse, the app implements two-tier rate limiting:

1. **Per-IP Limit**: 3 requests per hour per IP address
2. **Global Limit**: 100 requests per day across all users

When limits are exceeded, users see a friendly message explaining when they can try again.

## API Reference

### POST /api/generate-blueprint

Generate a personalized side-income blueprint.

**Request Body**:
```json
{
  "answers": {
    "step1": {
      "skills": "Writing, design",
      "interests": "Technology, fitness",
      "time": "10",
      "workType": "online"
    },
    "step2": {
      "income": "$1000",
      "timeline": "3 months"
    },
    "step3": {
      "enjoy": "Creative work, helping others",
      "avoid": "Cold calling, sales"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userContext": "...",
    "opportunityMap": [...],
    "ideaEvaluation": [...],
    "chosenOpportunity": "...",
    "quickValidationPlan": "...",
    "actionPlan": "...",
    "sustainabilitySystem": "...",
    "reflectionPrompts": [...],
    "closingEncouragement": "..."
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

## Troubleshooting

### Issue: "REPLICATE_API_KEY is not configured"
**Solution**: Make sure you've added the environment variable in Vercel project settings.

### Issue: Rate limit errors
**Solution**: Adjust `RATE_LIMIT_PER_IP` and `RATE_LIMIT_GLOBAL` in Vercel environment variables.

### Issue: High API costs
**Solution**:
- Lower the global rate limit
- Monitor usage in Replicate dashboard
- Consider using a smaller model if cost is a concern

### Issue: Model is slow to respond
**Solution**: Llama 2 70B can take 30-90 seconds to generate responses. This is normal. The app shows a loading screen during this time.

### Issue: CORS errors
**Solution**: Make sure frontend and backend are on the same domain (both deployed to Vercel).

## Security Considerations

- API key is stored in server-side environment variables (never exposed to client)
- Rate limiting prevents abuse and cost overruns
- User data is not stored on servers (only in browser localStorage)
- No authentication required (stateless application)

## Future Enhancements

- [ ] Multi-language support (Chinese, Spanish, etc.)
- [ ] User accounts and cloud storage
- [ ] Multiple AI model options (Claude, GPT-4)
- [ ] PDF export functionality
- [ ] Shareable blueprint links
- [ ] Progress tracking dashboard
- [ ] Email support and reminders

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you have questions or need help:
1. Check the Troubleshooting section above
2. Open an issue on GitHub
3. Contact through project discussions

## Acknowledgments

Built with ❤️ for aspiring side-hustlers everywhere.
