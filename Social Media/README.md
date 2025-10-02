# Redemption Marketing

**Professional AI-Powered Social Media Content Generator**  
*Copyright © 2025 Redemption Road. All rights reserved.*

A sophisticated Python-based social media content generator built with CustomTkinter and powered by open-source AI models. Create professional marketing content, commercial videos, and music video concepts with advanced AI assistance.

## 🚀 Features

- **Advanced Content Generation**: Create engaging social media posts with hooks, captions, CTAs, and hashtags
- **Commercial Video Scripts**: Generate 20-90 second commercial video scripts with scene breakdowns
- **Music Video Concepts**: Create detailed music video concepts up to 5 minutes (300 seconds)
- **Marketing Video Production**: Professional marketing content with visual element suggestions
- **Analytics Dashboard**: AI-powered content performance analysis and insights
- **Content History Management**: Track and organize all generated content
- **Multi-Platform Support**: Instagram, Twitter/X, LinkedIn, Facebook, TikTok
- **Open Source AI**: Uses Hugging Face Transformers (no API costs required)
- **Professional UI**: Modern dark theme interface with Redemption Road branding

## 🎬 Video Content Capabilities

### Commercial Videos (20-90 seconds)
- Professional commercial scripts
- Scene-by-scene breakdowns
- Visual element specifications
- Brand integration guidelines
- Call-to-action optimization

### Music Videos (30-300 seconds)
- Creative concept development
- Genre-specific artistic direction
- Visual storytelling elements
- Synchronized scene planning
- Music integration suggestions

### Marketing Videos (20-90 seconds)
- Product demonstration scripts
- Brand storytelling frameworks
- Customer engagement strategies
- Conversion-optimized content

## 📄 License & Copyright

**STRICT COMMERCIAL LICENSE**

This software is the exclusive property of **Redemption Road** and is protected under strict copyright and licensing terms.

## Features

- **Content Generation**: Create engaging social media posts with hooks, captions, CTAs, and hashtags
- **Analytics Dashboard**: Analyze content performance and get AI-powered insights
- **Content History**: Track and manage all generated content
- **Multi-Platform Support**: Instagram, Twitter/X, LinkedIn, Facebook, TikTok
- **Dark Theme UI**: Modern interface with red/yellow color scheme

## Installation

1. **Prerequisites**: Python 3.8 or higher

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   
   Or on Windows, run:
   ```bash
   install.bat
   ```

3. **Setup API Key**:
   - Get your Replicate API key from [replicate.com](https://replicate.com)
   - Make sure it's in your `.env` file:
     ```
     Replicate=your_api_key_here
     ```

## Usage

Run the application:
```bash
python main.py
```

### Content Generation
1. Fill in the content settings form:
   - **Platform**: Choose your target platform
   - **Niche**: Your content category (required)
   - **Target Audience**: Description of your audience (required)
   - **Tone**: Professional, casual, humorous, etc.
   - **Content Type**: Educational, promotional, storytelling, etc.
   - **Keywords**: Optional relevant keywords

2. Click "Generate Content" to create AI-powered social media content

### Analytics
1. Generate some content first
2. Go to the Analytics tab
3. Click "Analyze Content" to get insights and recommendations

### History
- View all previously generated content
- Click on any item to view the full content
- Clear history when needed

## File Structure

```
├── main.py              # Main application entry point
├── models.py            # Data structures and models
├── utils.py             # Helper functions and utilities
├── api_service.py       # API integration with Replicate
├── content_settings.py  # Content settings form widget
├── content_display.py   # Generated content display widget
├── analytics_display.py # Analytics dashboard widget
├── history_display.py   # Content history widget
├── requirements.txt     # Python dependencies
├── .env                # Environment variables (API keys)
└── README.md           # This file
```

## Dependencies

- `customtkinter` - Modern UI framework
- `replicate` - AI model API client
- `torch` - PyTorch for AI processing
- `opencv-python` - Video processing capabilities
- `moviepy` - Video editing and manipulation
- `requests` - HTTP client for API calls
- `Pillow` - Image processing and manipulation
- `python-dotenv` - Environment variable management

## 📞 Support & Contact

**Redemption Road**
- **Licensing**: licensing@redemptionroad.com
- **Technical Support**: support@redemptionroad.com
- **Website**: www.redemptionroad.com

## ⚖️ Legal Notice

This software contains proprietary technology developed by Redemption Road. Any unauthorized use, reproduction, or distribution is strictly prohibited and may result in legal action.

**Trademark Notice**: "Redemption Marketing" and "Redemption Road" are registered trademarks of Redemption Road.

**Patent Pending**: Certain features and methodologies may be protected by pending patent applications.

---
*© 2025 Redemption Road. All rights reserved. Unauthorized copying, distribution, or use is strictly prohibited.*
- `aiohttp` - Async HTTP client
- `typing-extensions` - Type hints support

## Troubleshooting

**API Key Issues**:
- Ensure your `.env` file is in the same directory as `main.py`
- Check that your Replicate API key is valid
- Make sure the key is not wrapped in quotes in the `.env` file

**UI Issues**:
- Make sure you have CustomTkinter 5.2.0 or higher installed
- Try running with Python 3.9+ for best compatibility

**Content Generation Fails**:
- Check your internet connection
- Verify your API key has sufficient credits
- Check the console output for error messages

## Contributing

This is a modular application where each component is in its own file under 100 lines. To add new features:

1. Create new widget files following the existing pattern
2. Update `main.py` to integrate new components
3. Add any new dependencies to `requirements.txt`

## License

This project is for educational and commercial use.