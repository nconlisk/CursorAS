# 🚀 Simple Deployment Guide for Existing nginx Server

## ✅ **Good News: Minimal Configuration Required!**

The Among Us Task Simulator is designed to work with **any standard nginx setup** with minimal configuration changes.

## 🔧 **What You Need to Do:**

### **1. Upload Files**
Copy the project files to your web server directory:
```bash
# Upload these files to your server:
├── index.html
├── styles/
├── js/
├── tasks/
└── standalone-demo.html (optional)
```

### **2. Add ONE nginx Location Block**

Add this to your existing nginx server block:

```nginx
# Option A: Deploy at a subdirectory (recommended)
location /amongus/ {
    alias /path/to/your/amongus-tasks/;
    try_files $uri $uri/ /amongus/index.html;
    index index.html;
}

# Option B: Deploy at root (if you want it as the main site)
location / {
    try_files $uri $uri/ /index.html;
}
```

### **3. Reload nginx**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🎯 **That's It! No Special Requirements**

### **✅ What Works Out of the Box:**
- **Relative paths** - All links use relative paths like `styles/main.css`
- **Standard HTTP** - No special protocols or headers required
- **Static files** - Pure HTML/CSS/JavaScript, no server-side processing
- **Local storage** - Progress saving works client-side
- **Touch events** - Full mobile/tablet support

### **❌ What's NOT Required:**
- Special nginx modules
- PHP, Python, or other server-side languages
- Database connections
- WebSocket support
- SSL certificates (though recommended)
- Custom mime types
- Special proxy configurations

## 🚀 **Deployment Options:**

### **Option 1: Subdirectory Deployment (Safest)**
```
https://yoursite.com/amongus/
```
- Add location block for `/amongus/`
- No conflicts with existing site
- Easy to manage

### **Option 2: Root Deployment**
```
https://yoursite.com/
```
- Replace existing root location
- Among Us becomes main site

### **Option 3: Subdomain**
```
https://amongus.yoursite.com/
```
- Create new server block
- Point to Among Us files
- Completely separate

## 📁 **File Structure on Server:**

```
/var/www/amongus-tasks/
├── index.html              # Main hub page
├── styles/
│   ├── main.css           # Core styling
│   ├── wiring.css         # Task-specific styles
│   └── ...
├── js/
│   ├── main.js            # Core functionality
│   ├── wiring.js          # Task logic
│   └── ...
├── tasks/
│   ├── fix-wiring.html    # Individual task pages
│   ├── swipe-card.html
│   └── ...
└── standalone-demo.html   # Single-file demo
```

## 🔧 **Optional Performance Enhancements:**

Add these to your nginx config for better performance (optional):

```nginx
# Static file caching
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip compression (if not already enabled)
gzip on;
gzip_types text/css application/javascript text/javascript;
```

## 🎮 **Testing Your Deployment:**

1. **Open in browser:** `https://yoursite.com/amongus/`
2. **Test on mobile:** Check touch interactions work
3. **Complete a task:** Try the Fix Wiring task
4. **Check progress:** Verify completion tracking works
5. **Test reset:** Use the reset button

## 🚨 **Troubleshooting:**

### **404 Errors on task pages:**
- Check file permissions: `chmod 644 tasks/*.html`
- Verify `try_files` directive is correct

### **CSS/JS not loading:**
- Check file permissions: `chmod 644 styles/* js/*`
- Verify relative paths are correct

### **Touch not working:**
- Ensure viewport meta tag is present (already included)
- Test on actual touch device, not desktop browser

## 🎉 **You're Ready!**

The Among Us Task Simulator will work perfectly with your existing nginx setup. The app is designed to be **deployment-friendly** and requires no special server configuration beyond basic static file serving.

**🔴 Ready to deploy your real-life Among Us experience!** 🚀