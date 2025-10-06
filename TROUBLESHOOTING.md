# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### Port Conflicts

**Problem**: `Fatal error: Port 35729 is already in use by another process`

**Solutions**:
1. **Use alternative development server**:
   ```bash
   npm run dev-simple
   ```

2. **Kill existing processes**:
   ```bash
   # Windows
   netstat -ano | findstr :35729
   taskkill /PID <PID_NUMBER> /F
   
   # Or restart your computer
   ```

3. **Change LiveReload port in Gruntfile.js**:
   ```javascript
   livereload: 35731  // Use different port number
   ```

### SASS Compilation Issues

**Problem**: SASS deprecation warnings

**Solution**: The project has been updated to use modern SASS syntax:
- `darken()` → `color.adjust($color, $lightness: -10%)`
- Added `@use "sass:color";` import

### Build Errors

**Problem**: `Cannot find module` errors

**Solution**:
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### File Watching Not Working

**Problem**: Changes don't trigger rebuilds

**Solution**:
1. Check file paths in watch configuration
2. Use the simple server: `npm run dev-simple`
3. Manually rebuild: `npm run build`

### Browser Not Opening

**Problem**: Development server starts but browser doesn't open

**Solution**:
1. Manually navigate to `http://localhost:3000`
2. Check firewall settings
3. Try different port in Gruntfile.js

## Development Workflow

### Recommended Development Process:

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **If port conflicts occur**:
   ```bash
   npm run dev-simple
   ```

3. **Create new content**:
   ```bash
   npm run new-post "Article Title"
   ```

4. **Manual rebuild if needed**:
   ```bash
   npm run build
   ```

### File Structure Verification

Ensure your project structure matches:
```
week6-capstoneBlog/
├── src/
│   ├── content/          # Your .md files
│   ├── templates/        # .ejs files
│   └── assets/
│       ├── css/main.scss
│       ├── js/main.js
│       └── images/
├── docs/                 # Generated files
├── node_modules/         # Dependencies
├── Gruntfile.js
├── index.js
├── server.js
└── package.json
```

## Performance Tips

### Build Optimization:
- Images are automatically compressed
- CSS/JS are minified in production
- SASS is compiled with source maps for debugging

### Development Speed:
- Use `npm run dev-simple` for faster startup
- Only edit files in `src/` directory
- The `docs/` folder is auto-generated

## Browser Compatibility

The generated site works in:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Deployment Checklist

Before deploying:
1. ✅ Run `npm run build`
2. ✅ Check `docs/` folder exists
3. ✅ Verify all images load
4. ✅ Test responsive design
5. ✅ Check console for errors

## Getting Help

If issues persist:
1. Check the README.md for detailed instructions
2. Verify Node.js version (14+)
3. Ensure all dependencies are installed
4. Try the alternative server script