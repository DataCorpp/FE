# CPG Platform User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
   - [Registration](#registration)
   - [Login with Google](#login-with-google)
   - [Email Verification](#email-verification)
3. [Method 1: Active Search](#method-1-active-search)
   - [Product Search](#product-search)
   - [Manufacturer Search](#manufacturer-search)
   - [Filtering and Sorting](#filtering-and-sorting)
   - [Favorites](#favorites)
4. [Method 2: Passive Matching (Post Project)](#method-2-passive-matching-post-project)
   - [Step 1: Select Product Category](#step-1-select-product-category)
   - [Step 2: Define Project](#step-2-define-project)
   - [Step 3: Review Project](#step-3-review-project)
   - [Project Management](#project-management)

## Introduction

The CPG (Consumer Packaged Goods) Platform connects manufacturers, suppliers, and brands to streamline product development and production. This guide covers two main ways to use the platform:

1. **Active Search**: Browse products and manufacturers with filtering options
2. **Passive Matching**: Post your project requirements and receive matching manufacturer recommendations

## Getting Started

### Registration

To create an account manually:

1. Click " Sign Up\ on the homepage
2. Enter your name, email address, and password
3. Choose your role (manufacturer, brand, or retailer)
4. Click \Create Account\
5. You will receive a verification code via email

### Login with Google

For faster registration/login:

1. Click \Continue with Google\ on the login page
2. Grant necessary permissions in the Google authorization popup
3. If it is your first time, you will be redirected to profile setup
4. If you have an existing account with the same email, you will be logged in automatically

### Email Verification

For manual registration:

1. Check your email for the verification code
2. Enter the 6-digit code on the verification page
3. If you do not receive it, click \Resend Code\
4. Once verified, you will be directed to complete your profile

## Method 1: Active Search

Active Search allows you to browse through products and manufacturers with powerful filtering options.

### Product Search

To search for products:

1. Navigate to the \Products\ page from the main menu
2. Use the search bar to find specific products
3. Apply filters using the filter panel:
 - Categories
 - Unit types
 - Flavor profiles
 - Usage types
 - Manufacturers
 - Ingredients
 - Shelf life
 - Packaging size

### Manufacturer Search

To search for manufacturers:

1. Navigate to the \Manufacturers\ page from the main menu
2. Use the search bar to find specific manufacturers
3. Filter manufacturers by:
 - Industry
 - Location
 - Certifications
 - Established year

### Filtering and Sorting

Refine your search results with:

1. **Sorting options**:
 - Name (A-Z or Z-A)
 - Relevance (when searching)
 - Newest first
 - Price (low to high or high to low)

2. **View options**:
 - Grid view
 - List view

3. **Advanced options**:
 - Sustainable products only
 - Specific certifications
 - Region-specific manufacturers

### Favorites

Save items for later reference:

1. Click the heart icon on any product or manufacturer card
2. View all favorites by clicking \View Favorites\ or navigating to the favorites section
3. Remove items from favorites by clicking the heart icon again
4. Compare selected manufacturers by adding them to the compare list

## Method 2: Passive Matching (Post Project)

The Post Project workflow helps you connect with suitable manufacturers by defining your project requirements.

### Step 1: Select Product Category

1. Navigate to the \Post Project\ section
2. Choose the supplier type you are looking for:
 - Manufacturer (Available)
 - Packaging Supplier (Unavailable)
 - Ingredient Supplier (Unavailable)
 - Secondary Packager( Unavailable)
 - Packaging Services (Unavailable)
3. Select a product category by typing in the search field
4. Click \Next\ when you have selected your category

### Step 2: Define Project

Fill in your project details:

1. Provide a description of your project requirements
2. Specify production volume and units
3. Select your project status:
 - Research phase
 - Ready for production
 - Launched
4. Choose packaging types
5. Select desired manufacturing locations
6. Add special requirements:
 - Allergen considerations
 - Required certifications
 - Additional notes
7. Set privacy options for your project
8. Click \Next\ to continue

### Step 3: Review Project

1. Review all provided information
2. Make any necessary adjustments
3. Submit your project to receive manufacturer matches
4. You will be notified when manufacturers express interest

### Project Management

After submitting:

1. Track your project status in the dashboard
2. Review interested manufacturers
3. Contact manufacturers directly through the platform
4. Update project details as needed
5. Close the project when complete

---

This guide provides a basic overview of the CPG Platform. For more detailed information or assistance, please contact support through the help section.

### Adding or Editing Japanese Language in the Platform

To add or refine Japanese translations:

1. Open the file: `src/lib/i18n.ts`
2. Locate the `resources` object.
3. Find the `ja` key (for Japanese). If it does not exist, add it.
4. Add or edit translation keys/values under `ja.translation`.
5. Example:
   ```ts
   ja: {
     translation: {
       language: "言語",
       english: "英語",
       japanese: "日本語",
       // ... more translations
     }
   }
   ```
6. Save the file and reload the site to see your changes.
