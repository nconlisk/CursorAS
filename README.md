# 🚀 Among Us Task Simulator

A touch-optimized web application that replicates the iconic tasks from the popular game Among Us. Perfect for real-life gameplay sessions where participants interact with individual task panels to complete their missions.

![Among Us Task Simulator](https://img.shields.io/badge/Status-Ready%20for%20Deployment-brightgreen)
![Touch Optimized](https://img.shields.io/badge/Touch-Optimized-blue)
![Local Deployment](https://img.shields.io/badge/Deployment-Local%20Only-orange)

## 🎯 Features

### 🎮 Available Tasks

#### ⚡ Electrical Tasks
- **Fix Wiring** - Connect colored wires to their matching terminals
- **Calibrate Distributor** - Rotate dials to align with target indicators  
- **Divert Power** - Direct power flow through the correct channels

#### 🧭 Navigation Tasks
- **Chart Course** - Drag the ship to match the destination path
- **Stabilize Steering** - Balance the steering controls

#### 🔧 Engine Tasks
- **Align Engine Output** - Adjust engine parameters for optimal performance
- **Fuel Engines** - Complete the refueling sequence

#### 🛡️ Medical & Security Tasks
- **Submit Scan** - Complete the medical scanning procedure
- **Prime Shields** - Activate shield generators in sequence

#### 🧹 Maintenance Tasks
- **Clean O2 Filter** - Remove debris from the oxygen filtration system
- **Empty Garbage** - Dispose of waste materials properly
- **Swipe Card** - Authenticate using the card reader at the correct speed

### 🌟 Key Features
- **Touch-Optimized Interface** - Designed for tablets and mobile devices
- **Progress Tracking** - Visual progress bar and task completion status
- **Local Storage** - Saves completion status between sessions
- **Real-time Feedback** - Audio and visual feedback for task completion
- **Responsive Design** - Works on all screen sizes
- **No Internet Required** - Fully offline functionality

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

1. **Clone or download** this repository
2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```
3. **Access the application** at `http://localhost:8080`

### Option 2: Manual Nginx Setup

1. **Install nginx** on your system
2. **Copy files** to nginx web directory:
   ```bash
   sudo cp -r . /var/www/amongus-tasks/
   ```
3. **Configure nginx** using the provided `nginx.conf`
4. **Restart nginx** service

### Option 3: Simple HTTP Server (Development)

For quick testing:
```bash
# Python 3
python -m http.server 8080

# Node.js
npx http-server -p 8080

# PHP
php -S localhost:8080
```

## 📱 Device Setup Recommendations

### For Tablets (iPad, Android Tablets)
- Open in **full-screen mode** (add to home screen)
- **Disable auto-lock** to prevent interruptions
- Use **landscape orientation** for optimal experience

### For Mobile Phones
- Tasks are optimized for **portrait mode**
- **Disable zoom** (already configured in the app)
- Consider using **guided access mode** (iOS) or **kiosk mode** (Android)

### For Touch Monitors
- Set up **multiple browser windows** for different tasks
- Consider using **browser kiosk mode**
- Adjust **scaling** for optimal touch target sizes

## 🎲 Gameplay Ideas

### Real-Life Among Us Setup
1. **Station Setup** - Place tablets/devices at different "locations"
2. **Task Assignment** - Give players lists of tasks to complete
3. **Emergency Meetings** - Call meetings when suspicious activity occurs
4. **Voting** - Use the progress tracking to verify task completion

### Educational Applications
- **Team Building** - Use tasks for group problem-solving exercises
- **Technology Training** - Teach touch interface navigation
- **Game Development** - Study interaction design patterns

## 🛠️ Technical Details

### Project Structure
```
amongus-tasks/
├── index.html              # Main task selection page
├── styles/
│   ├── main.css            # Global styles and layout
│   ├── wiring.css          # Wiring task specific styles
│   ├── swipe-card.css      # Card swipe task styles
│   └── ...                 # Other task-specific styles
├── js/
│   ├── main.js             # Core application logic
│   ├── wiring.js           # Wiring task implementation
│   ├── swipe-card.js       # Card swipe task logic
│   └── ...                 # Other task implementations
├── tasks/                  # Individual task HTML pages
├── nginx.conf              # Nginx configuration
├── docker-compose.yml      # Docker deployment config
└── setup.sh               # Automated setup script
```

### Browser Support
- **Chrome/Chromium** 80+ (Recommended)
- **Safari** 13+ (iOS/macOS)
- **Firefox** 75+
- **Edge** 80+

### Performance Considerations
- **Optimized for 60fps** touch interactions
- **Minimal JavaScript** for fast loading
- **CSS animations** using hardware acceleration
- **Local storage** for persistent data

## 🔧 Customization

### Adding New Tasks
1. Create HTML file in `/tasks/` directory
2. Add corresponding CSS file in `/styles/`
3. Implement JavaScript logic extending `BaseTask` class
4. Update main page task list

### Styling Modifications
- Modify `/styles/main.css` for global changes
- Task-specific styles in individual CSS files
- Color scheme defined in CSS custom properties

### Configuration Options
- Task completion requirements
- Touch sensitivity settings
- Audio feedback preferences
- Progress tracking behavior

## 🐛 Troubleshooting

### Common Issues

**Tasks not loading properly**
- Check browser console for JavaScript errors
- Ensure all CSS and JS files are accessible
- Verify nginx configuration if using custom setup

**Touch interactions not working**
- Ensure device supports touch events
- Check for CSS `touch-action` conflicts
- Verify viewport meta tag configuration

**Progress not saving**
- Check browser localStorage availability
- Ensure scripts have proper permissions
- Clear browser cache and try again

**Performance issues**
- Check device specifications
- Close other browser tabs
- Reduce browser zoom level

### Docker Issues

**Container won't start**
```bash
# Check logs
docker-compose logs

# Rebuild container
docker-compose down
docker-compose up --build
```

**Port conflicts**
```bash
# Use different port
docker-compose down
# Edit docker-compose.yml port mapping
docker-compose up -d
```

## 📄 License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute for educational and entertainment purposes.

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional task implementations
- Mobile device optimizations
- Accessibility enhancements
- Performance improvements
- Bug fixes and testing

## 🎮 Enjoy Playing!

Have fun with your real-life Among Us experience! Remember: trust no one, complete your tasks, and watch out for suspicious behavior! 

*The fate of the crew is in your hands... 🔴*