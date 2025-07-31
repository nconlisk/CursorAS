# 🔧 Among Us Task Simulator - Troubleshooting Guide

## 🚨 Quick Diagnosis

### Step 1: Try Simple Version
If buttons aren't working, try the simple version first:
```
yoursite.com/simple-index.html
```
This version uses basic onclick handlers and should work immediately.

### Step 2: Use Debug Version
For detailed diagnostics:
```
yoursite.com/debug-index.html
```
This shows real-time status of scripts, TaskManager, and button functionality.

### Step 3: Check Browser Console
1. Open F12 Developer Tools
2. Look for red error messages
3. Common issues: 404 errors for JS files, MIME type problems

## 🖥️ Server Requirements

### ✅ You ONLY Need:
- Static file serving (basic nginx/Apache)
- MIME type support for JS/CSS files
- No special modules or server-side languages

### ❌ You DON'T Need:
- PHP, Python, Node.js
- Databases
- WebSocket support
- SSL certificates (optional)
- Special nginx modules

## 🔧 Common Issues & Solutions

### Issue 1: Buttons Not Working
**Symptoms:** Clicking task buttons does nothing

**Solutions:**
1. **Try simple-index.html** - Uses basic onclick handlers
2. **Check file permissions:** `chmod 644 js/*.js styles/*.css *.html`
3. **Clear browser cache** and try incognito mode
4. **Check console errors** in F12 Developer Tools

### Issue 2: JavaScript Errors
**Symptoms:** Console shows red error messages

**Common Causes:**
- 404 errors for JS files
- MIME type issues
- Script loading order problems

**Solutions:**
1. **Verify file paths** - Ensure js/main.js and js/multiplayer.js exist
2. **Check MIME types** in nginx config
3. **Use debug-index.html** to identify specific issues

### Issue 3: Progress Not Saving
**Symptoms:** Completed tasks reset when page refreshes

**Solutions:**
1. **Check localStorage support** - Some browsers block it
2. **Try incognito mode** to test
3. **Use simple-index.html** which has fallback handling

### Issue 4: Mobile Touch Issues
**Symptoms:** Buttons don't respond on mobile devices

**Solutions:**
1. **Add touch feedback** - Already included in main.js
2. **Check viewport meta tag** - Should be present
3. **Test with simple-index.html**

## 🛠️ nginx Configuration

### Basic Configuration
```nginx
server {
    listen 80;
    server_name yoursite.com;
    root /path/to/amongus-tasks;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Fix MIME types for JavaScript
    location ~* \.js$ {
        add_header Content-Type application/javascript;
    }

    # Fix MIME types for CSS
    location ~* \.css$ {
        add_header Content-Type text/css;
    }
}
```

### Minimal Configuration
```nginx
server {
    listen 80;
    root /path/to/amongus-tasks;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 📁 File Structure Requirements

```
amongus-tasks/
├── index.html              # Main page
├── debug-index.html        # Debug version
├── simple-index.html       # Simple fallback
├── standalone-demo.html    # Self-contained demo
├── js/
│   ├── main.js            # Core functionality
│   └── multiplayer.js     # Multiplayer features
├── styles/
│   └── main.css           # Styling
└── tasks/                 # Individual task pages
    ├── fix-wiring.html
    ├── calibrate-distributor.html
    └── ... (other task files)
```

## 🧪 Testing Checklist

### Browser Compatibility
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (limited support)

### Mobile Testing
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Touch interactions
- ✅ Responsive design

### Server Testing
- ✅ Basic nginx
- ✅ Apache
- ✅ Python SimpleHTTPServer
- ✅ Node.js http-server

## 🚀 Deployment Steps

### 1. Upload Files
```bash
# Upload all files to your web server
scp -r amongus-tasks/ user@yourserver:/var/www/html/
```

### 2. Set Permissions
```bash
chmod 644 *.html js/*.js styles/*.css
chmod 755 js/ styles/ tasks/
```

### 3. Test Basic Functionality
```bash
# Test with simple version first
curl -I http://yoursite.com/simple-index.html
```

### 4. Verify JavaScript Loading
```bash
# Check if JS files are accessible
curl -I http://yoursite.com/js/main.js
curl -I http://yoursite.com/js/multiplayer.js
```

## 🔍 Debug Tools

### Debug Panel (debug-index.html)
- Real-time script loading status
- TaskManager availability check
- Button functionality testing
- Error detection and reporting

### Browser Developer Tools
1. **Console tab** - Check for JavaScript errors
2. **Network tab** - Verify file loading
3. **Application tab** - Check localStorage
4. **Elements tab** - Inspect button event handlers

### Simple Version (simple-index.html)
- Basic onclick handlers
- No complex dependencies
- Guaranteed functionality
- Fallback error handling

## 📱 Expected Behavior

### When Working Correctly:
- ✅ Clicking task buttons navigates to task pages
- ✅ Reset button clears progress
- ✅ No console errors in F12
- ✅ Progress saves between sessions
- ✅ Touch interactions work on mobile
- ✅ Responsive design on all screen sizes

### Button States:
- **Normal:** Blue gradient background
- **Completed:** Green with checkmark
- **Hover:** Slight glow effect
- **Active:** Pressed state feedback

## 🆘 Emergency Solutions

### If Nothing Works:
1. **Use standalone-demo.html** - Completely self-contained
2. **Try simple-index.html** - Basic functionality only
3. **Check file permissions** - Ensure 644 for files, 755 for directories
4. **Test with different browser** - Try incognito/private mode
5. **Verify server configuration** - Basic static file serving only

### Quick Fix Commands:
```bash
# Fix permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# Test with Python server
python3 -m http.server 8000

# Test with Node.js server
npx http-server -p 8000
```

## 📞 Support Information

### Version Information:
- **Main Version:** index.html (with multiplayer)
- **Debug Version:** debug-index.html (with diagnostics)
- **Simple Version:** simple-index.html (basic functionality)
- **Standalone:** standalone-demo.html (self-contained)

### File Dependencies:
- **Required:** js/main.js, styles/main.css
- **Optional:** js/multiplayer.js (for multiplayer features)
- **Tasks:** tasks/*.html (individual task pages)

### Browser Requirements:
- **JavaScript:** Enabled
- **localStorage:** Supported
- **CSS3:** Supported
- **Touch Events:** Supported (mobile)

---

**🎮 The app requires zero server-side dependencies - just basic static file serving!**

**Try the simple version first - it's bulletproof and works with any web server configuration!**