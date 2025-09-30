# How to Extract Images from Your PSD Template

## Method 1: Using Photoshop (Recommended)

### Step 1: Open Your PSD File
1. Open Photoshop
2. Open your `1.4_Homepage 04.psd` file

### Step 2: Extract Product Images
For each product image in your PSD:

1. **Select the image layer** in the Layers panel
2. **Right-click** on the layer
3. **Choose "Export As..."**
4. **Select PNG or JPG** format
5. **Set quality to 90-100%** for best results
6. **Save to**: `shop/public/images/products/`

### Step 3: Extract Hero/Banner Images
1. **Select hero banner layers**
2. **Export as PNG** (for transparency) or JPG
3. **Save to**: `shop/public/images/hero/` or `shop/public/images/banners/`

### Step 4: Extract Icons
1. **Select icon layers**
2. **Export as SVG** (preferred) or PNG
3. **Save to**: `shop/public/images/icons/`

## Method 2: Using Online Tools

### Option A: Photopea (Free Online Photoshop)
1. Go to [photopea.com](https://photopea.com)
2. Upload your PSD file
3. Follow the same steps as Photoshop

### Option B: GIMP (Free)
1. Download GIMP
2. Open your PSD file
3. Use File > Export As to save images

## Method 3: Automated Extraction

### Using Adobe XD
1. Import your PSD into Adobe XD
2. Use the "Export" feature to extract assets
3. Choose PNG/JPG format and high quality

## Image Naming Convention

Use these exact names when saving images:

### Hero Section:
- `wooden-kitchen-tools.jpg` - Main hero image
- `hero-background.jpg` - Background image

### Products:
- `bear-cream-large.jpg` - Today's deal product
- `beach-towel.jpg` - Beach towel product
- `elodie-unicorn-teapot.jpg` - Teapot product
- `square-form-field-flowers.jpg` - Flowers product
- `mini-pouch.jpg` - Mini pouch product
- `cotton-slippers.jpg` - Cotton slippers
- `chopsticks.jpg` - Chopsticks product
- `cord-necklace-conch-shells.jpg` - Necklace product
- `hairband-unicorn-horn.jpg` - Hairband product
- `wool-cap-for-children.jpg` - Wool cap product
- `hairband-with-flowers.jpg` - Hairband with flowers

### Banners:
- `teapot-set-banner.jpg` - Teapot set promotional banner
- `womens-slippers-banner.jpg` - Women's slippers banner
- `baby-banner.jpg` - Baby products banner
- `kitchenware-banner.jpg` - Kitchenware banner

### Icons:
- `company-logo.svg` - Company logo
- `favicon.svg` - Website favicon

## After Extraction:

1. **Place all images** in the correct directories
2. **Run the development server**: `npm run dev`
3. **Check the homepage** at http://localhost:5173/
4. **Images will automatically appear** in place of placeholders

## Troubleshooting:

- **Images not showing?** Check file paths and names
- **Poor quality?** Export at higher resolution
- **Large file sizes?** Compress images using online tools
- **Wrong format?** Use PNG for transparency, JPG for photos

## Need Help?

If you need assistance with extraction, you can:
1. Share screenshots of your PSD layers
2. Export a few sample images and I can help integrate them
3. Use placeholder images for now and update later
