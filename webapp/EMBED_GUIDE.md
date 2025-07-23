# Enterprise Calculator Embedding Guide

## Overview

This guide explains how to embed the Reniska booking calculator on customer websites using our enterprise-grade embedding system.

## Quick Start

### Basic Embed Code

```html
<iframe 
  src="https://staging-swed-de2a3.web.app/embed/calculator?companyId=YOUR_COMPANY_ID"
  width="100%" 
  height="800px" 
  frameborder="0"
  scrolling="no"
  allowfullscreen>
</iframe>
```

### Full-Screen Embed Code

```html
<iframe 
  src="https://staging-swed-de2a3.web.app/embed/calculator?companyId=YOUR_COMPANY_ID"
  width="100%" 
  height="100vh" 
  frameborder="0"
  scrolling="no"
  allowfullscreen
  style="border: none; width: 100%; height: 100vh;">
</iframe>
```

## URL Parameters

### Required Parameters

- `companyId` (string): Your unique company identifier

### Optional Parameters

- `form` (string): Specific form slug to use (defaults to 'default')

### Example URLs

```
# Basic embed
https://staging-swed-de2a3.web.app/embed/calculator?companyId=r7kAsnh-r1

# With specific form
https://staging-swed-de2a3.web.app/embed/calculator?companyId=r7kAsnh-r1&form=window-cleaning
```

## Advanced Features

### 1. Responsive Height Adjustment

The calculator automatically communicates its height to the parent window:

```javascript
// Listen for height updates from the calculator
window.addEventListener('message', function(event) {
  if (event.data.type === 'HEIGHT_UPDATE') {
    const iframe = document.getElementById('calculator-iframe');
    iframe.style.height = event.data.height + 'px';
  }
});
```

### 2. Full Implementation Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Cleaning Service</title>
    <style>
        .calculator-container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .calculator-iframe {
            width: 100%;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="calculator-container">
        <h1>Book Your Cleaning Service</h1>
        <iframe 
            id="calculator-iframe"
            class="calculator-iframe"
            src="https://staging-swed-de2a3.web.app/embed/calculator?companyId=r7kAsnh-r1"
            height="600px"
            frameborder="0"
            scrolling="no"
            allowfullscreen>
        </iframe>
    </div>

    <script>
        // Handle responsive height
        window.addEventListener('message', function(event) {
            if (event.data.type === 'HEIGHT_UPDATE') {
                const iframe = document.getElementById('calculator-iframe');
                iframe.style.height = event.data.height + 'px';
            }
        });

        // Request height updates
        function requestHeight() {
            const iframe = document.getElementById('calculator-iframe');
            iframe.contentWindow.postMessage({ type: 'GET_HEIGHT' }, '*');
        }

        // Request height on load and resize
        window.addEventListener('load', requestHeight);
        window.addEventListener('resize', requestHeight);
    </script>
</body>
</html>
```

## Security Features

### 1. Public Access Control

Only companies marked as `isPublic: true` in the database can be embedded.

### 2. CORS Protection

The embed system includes proper CORS headers and security measures.

### 3. Input Validation

All URL parameters are validated and sanitized.

## Styling Options

### 1. Custom CSS Integration

The calculator uses transparent backgrounds and minimal styling to integrate seamlessly:

```css
/* Your website's styling will show through */
.calculator-iframe {
    background: transparent;
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 2. Responsive Design

The calculator automatically adapts to different screen sizes and container widths.

## Troubleshooting

### Common Issues

1. **Calculator not loading**
   - Check if companyId is correct
   - Verify company is marked as public
   - Check browser console for errors

2. **Height not adjusting**
   - Ensure postMessage communication is working
   - Check if iframe has proper permissions

3. **Styling conflicts**
   - Use `!important` for critical styles
   - Ensure iframe has proper CSS isolation

### Debug Mode

Add `&debug=true` to the URL to see detailed error messages:

```
https://staging-swed-de2a3.web.app/embed/calculator?companyId=r7kAsnh-r1&debug=true
```

## Performance Optimization

### 1. Lazy Loading

```javascript
// Load calculator only when needed
function loadCalculator() {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://staging-swed-de2a3.web.app/embed/calculator?companyId=r7kAsnh-r1';
    document.getElementById('calculator-container').appendChild(iframe);
}

// Load on scroll or button click
document.getElementById('load-calculator').addEventListener('click', loadCalculator);
```

### 2. Preloading

```html
<!-- Preload the calculator for better performance -->
<link rel="preload" href="https://staging-swed-de2a3.web.app/embed/calculator?companyId=r7kAsnh-r1" as="document">
```

## Support

For technical support or questions about embedding:

1. Check the browser console for error messages
2. Verify your company ID and public status
3. Test with the debug parameter
4. Contact support with specific error details

## Best Practices

1. **Always use HTTPS** for production embeds
2. **Test on multiple devices** and browsers
3. **Monitor performance** and user experience
4. **Keep iframe height responsive** for better UX
5. **Use proper error handling** for failed loads
6. **Consider accessibility** with proper ARIA labels 