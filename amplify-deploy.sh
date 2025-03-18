#!/bin/bash

# Hata kontrolü
set -e

# Renkli çıktılar için
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}MHYS Destek Sistemi Deployment Script${NC}"
echo -e "${YELLOW}AWS Amplify Deployment Hazırlanıyor...${NC}"

# Versiyon numarasını package.json'dan al ve bir arttır
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Mevcut versiyon: ${CURRENT_VERSION}${NC}"

# Versiyon numarasını parçalara ayır (x.y.z)
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Patch numarasını bir arttır
PATCH=$((PATCH + 1))
NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
echo -e "${GREEN}Yeni versiyon: ${NEW_VERSION}${NC}"

# package.json dosyasını güncelle
sed -i '' "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${NEW_VERSION}\"/" package.json
echo -e "${GREEN}package.json güncellendi${NC}"

# Uygulama inşa et
echo -e "${YELLOW}Uygulama inşa ediliyor...${NC}"
npm run build
echo -e "${GREEN}Uygulama başarıyla inşa edildi${NC}"

# Git değişiklikleri
echo -e "${YELLOW}Git değişiklikleri hazırlanıyor...${NC}"
git add .
git commit -m "v${NEW_VERSION}: AWS Amplify Deployment"

# GitHub'a gönder
echo -e "${YELLOW}GitHub'a push yapılıyor...${NC}"
git push origin main

echo -e "${GREEN}Deployment tamamlandı!${NC}"
echo -e "${BLUE}AWS Amplify otomatik olarak yeni build'i algılayıp deploy edecek.${NC}" 