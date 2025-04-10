# Create images directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "public/images"

# Download logos
Invoke-WebRequest -Uri "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" -OutFile "public/images/google-logo.png"
Invoke-WebRequest -Uri "https://www.amazon.com/favicon.ico" -OutFile "public/images/amazon-logo.png"
Invoke-WebRequest -Uri "https://www.ebay.com/favicon.ico" -OutFile "public/images/ebay-logo.png"
Invoke-WebRequest -Uri "https://www.aliexpress.com/favicon.ico" -OutFile "public/images/aliexpress-logo.png"
Invoke-WebRequest -Uri "https://www.sephora.com/favicon.ico" -OutFile "public/images/sephora-logo.png"

Write-Host "Logos downloaded successfully!" 