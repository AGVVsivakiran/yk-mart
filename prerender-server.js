/**
 * Pre-render Server for Social Media Crawlers (WhatsApp, Facebook, Twitter)
 * 
 * This server intercepts requests from social media bots/crawlers
 * and returns HTML with proper Open Graph meta tags containing
 * product-specific information (image, title, description, price).
 * 
 * For regular users, it serves the normal React app.
 * 
 * DEPLOYMENT:
 * 1. Install express: npm install express node-fetch
 * 2. Run: node prerender-server.js
 * 3. Point your domain to this server (port 4000 by default)
 * 4. This server will proxy non-bot requests to your React build folder.
 * 
 * Alternatively, configure your web server (IIS/Nginx/Apache) to 
 * detect bot user-agents and redirect them to this service.
 */

const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 4000;

const BASE_URL = 'https://ykmart.in/webservices';
const SITE_URL = 'https://ykmart.in';

// List of known bot/crawler user agents
const BOT_USER_AGENTS = [
    'facebookexternalhit',
    'Facebot',
    'WhatsApp',
    'Twitterbot',
    'LinkedInBot',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'Pinterest',
    'Googlebot',
    'bingbot',
    'LinkPreview',
    'Chrome-Lighthouse',
    'SkypeUriPreview',
];

function isBot(userAgent) {
    if (!userAgent) return false;
    return BOT_USER_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

// Utility to ensure URLs use production domain instead of localhost
const fixImageUrl = (url) => {
    if (!url) return 'https://ykmart.in/logo.png';
    let formatted = url.toString();
    // Handle localhost or local IP from API results
    if (formatted.includes('localhost') || formatted.includes('127.0.0.1')) {
        formatted = formatted.replace(/http:\/\/localhost:7070/g, "https://ykmart.in/webservices");
        formatted = formatted.replace(/http:\/\/127\.0\.0\.1:7070/g, "https://ykmart.in/webservices");
    }

    // Ensure absolute URL
    if (!formatted.startsWith('http')) {
        const cleanPath = formatted.startsWith('/') ? formatted.substring(1) : formatted;
        formatted = `${BASE_URL}/${cleanPath}`;
    }
    return formatted;
};

// Fetch product details from your API
async function fetchProductByName(productName) {
    return new Promise((resolve, reject) => {
        // Try to decode and clean the name for DB query
        let nameWithSpaces;
        try {
            nameWithSpaces = decodeURIComponent(productName)
                .replace(/-/g, ' ')
                .replace(/%2F|\/+/g, ' ')
                .replace(/%26|&/g, ' & ')
                .replace(/\s+/g, ' ')
                .trim();
        } catch (e) {
            nameWithSpaces = productName.replace(/-/g, ' ');
        }

        const boundary = '----FormBoundary' + Date.now();
        const body = `--${boundary}\r\nContent-Disposition: form-data; name="ProductName"\r\n\r\n${nameWithSpaces}\r\n--${boundary}--\r\n`;

        const options = {
            hostname: 'ykmart.in',
            path: '/webservices/api/Products/GetAllCategoryWiseProductsBasedOnProductName',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(body),
            },
            timeout: 5000 // Add timeout to prevent hanging bots
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (Array.isArray(result) && result.length > 0) {
                        resolve(result[0]);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null); // Return null instead of crashing
                }
            });
        });

        req.on('error', (e) => {
            console.error('API Request Error:', e);
            resolve(null);
        });
        req.on('timeout', () => {
            req.destroy();
            resolve(null);
        });

        req.write(body);
        req.end();
    });
}

function stripHtml(html) {
    if (!html) return '';
    try {
        const decoded = decodeURIComponent(html);
        return decoded.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    } catch {
        return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    }
}

// Generate prerendered HTML with OG meta tags for bots
function generateBotHtml(product, productName) {
    const title = product
        ? `${product.productname} - ${product.CategoryName || 'YK Mart'}`
        : 'YK Mart | Premium Organic Agri Products & Natural Farming';

    const price = product ? (product.Price1 || '0') : '';
    const categoryName = product && product.CategoryName ? product.CategoryName : 'Organic Product';

    // Build a clean, structured description like the example
    const rawDesc = product && product.ProductInfo ? stripHtml(product.ProductInfo) : '';
    const cleanDesc = rawDesc.substring(0, 160).trim();

    const description = product
        ? `Order ${product.productname} on YK Mart. Price: ₹${price}. Premium quality ${categoryName}. ${cleanDesc}...`
        : 'YK Mart delivers certified organic botanical products from medicinal plants to address farming and wellness naturally.';

    const image = fixImageUrl(product ? product.Image : null);
    const url = `${SITE_URL}/product/${encodeURIComponent(productName)}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="index, follow" />

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="product" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${product ? product.productname : 'YK Mart'}" />
  <meta property="og:site_name" content="YK Mart" />
  <meta property="og:locale" content="en_IN" />
  
  <!-- Product Specific OG -->
  <meta property="product:price:amount" content="${price}" />
  <meta property="product:price:currency" content="INR" />
  <meta property="product:condition" content="new" />
  <meta property="product:availability" content="instock" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@ykmart" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />

  <link rel="canonical" href="${url}" />
</head>
<body>
  <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto;">
    <h1>${product ? product.productname : 'YK Mart'}</h1>
    <p><strong>Price: ₹${price}</strong></p>
    <p>${description}</p>
    ${product ? `<img src="${image}" alt="${product.productname}" style="width: 100%; height: auto; border-radius: 8px;" />` : ''}
    <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background: #2d8a4e; color: white; text-decoration: none; border-radius: 5px;">View Product on YK Mart</a></p>
  </div>
</body>
</html>`;
}

// Handle product pages for bots
app.get('/product/:productName', async (req, res) => {
    const userAgent = req.headers['user-agent'] || '';

    if (isBot(userAgent)) {
        try {
            const product = await fetchProductByName(req.params.productName);
            const html = generateBotHtml(product, req.params.productName);
            res.set('Content-Type', 'text/html');
            return res.send(html);
        } catch (error) {
            console.error('Error fetching product for bot:', error);
            const html = generateBotHtml(null, req.params.productName);
            res.set('Content-Type', 'text/html');
            return res.send(html);
        }
    }

    // For regular users, serve the React app
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all: serve React app for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Pre-render server running on port ${PORT}`);
    console.log(`Bot requests to /product/* will receive OG meta tags`);
    console.log(`Regular users will receive the React SPA`);
});
