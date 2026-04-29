#!/bin/bash


mkdir -p SPOMS
cd SPOMS

mkdir -p data
mkdir -p static/css
mkdir -p static/js
mkdir -p static/images
mkdir -p templates

# Create data files (empty JSON arrays initially)
echo "[]" > data/users.json
echo "[]" > data/suppliers.json
echo "[]" > data/purchase_orders.json
echo "[]" > data/payments.json

echo "Project structure created successfully!"