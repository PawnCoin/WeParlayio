
#!/bin/bash

echo "🧹 WeParlay Project Cleanup Starting..."

# Remove obvious temporary files from attached_assets
echo "Removing temporary files..."
rm -f attached_assets/Pasted-*.txt
rm -f attached_assets/targeted_element_*.png
rm -f attached_assets/Screenshot*.png

# Remove duplicate/broken component files
echo "Removing duplicate component files..."
rm -f client/src/pages/EsportsHub-broken.tsx
rm -f client/src/pages/LiveBettingReal-fixed.tsx

# Remove excess logo files (keep only the best ones)
echo "Cleaning up logo files..."
cd attached_assets
# Keep only weparlaylogo4.png and weparlaylogo5.png
ls weparlaylogo* | grep -v "weparlaylogo[45].png" | xargs rm -f 2>/dev/null || true
cd ..

# Remove temporary config files
echo "Removing temporary config files..."
rm -f client/src/components/betting/betslip-styles.css 2>/dev/null || true

# Clean up any node_modules cache issues
echo "Clearing npm cache..."
npm cache clean --force

echo "✅ Cleanup complete!"
echo "📊 Project size reduced. Run 'du -sh .' to see current size."
