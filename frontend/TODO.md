# Abode Adviser Pro - Workflow Implementation TODO

## Overview
Implement the complete Smart Renter App workflow based on the provided scenario, including admin approval, visit scheduling, booking/payment, dashboard updates, reviews, and map search.

## Completed Tasks
- [x] Analyze existing codebase and workflow requirements
- [x] Create comprehensive implementation plan
- [x] Add approval status to Property model (pending/approved/rejected)
- [x] Add admin approval endpoints in property controller
- [x] Update booking controller to check approval status
- [x] Update getProperties to filter approved properties only

## Pending Tasks

### 1. Backend Enhancements
- [ ] Create Payment model for transactions (Razorpay integration)
- [ ] Update Booking model to include payment references
- [ ] Create payment controller with Razorpay integration
- [ ] Update booking controller for payment flow
- [ ] Add review submission after tenancy completion

### 2. Admin System
- [ ] Create AdminDashboard.tsx for property approvals
- [ ] Add admin role checks in middleware
- [ ] Implement approval/rejection notifications

### 3. Frontend Features
- [ ] Add "Schedule Visit" button/modal in ListingDetail.tsx
- [ ] Add "Book Now" flow with payment integration
- [ ] Update UserDashboard.tsx to show active rentals, payments, agreements
- [ ] Update OwnerDashboard.tsx to show rented properties and payments received
- [ ] Integrate Google Maps API for location search in Search.tsx
- [ ] Add payment receipt/agreement download functionality

### 4. API Integrations
- [ ] Integrate Razorpay SDK for payments
- [ ] Add Google Maps API key to environment
- [ ] Implement map-based property search
- [ ] Add PDF generation for receipts/agreements

### 5. Testing & Validation
- [ ] Test complete booking flow (search → visit → payment → dashboard)
- [ ] Verify payment processing with Razorpay
- [ ] Test map search functionality
- [ ] Validate admin approval workflow
- [ ] Test review submission after tenancy

## Dependencies
- Razorpay SDK
- Google Maps API key (provided by user)
- PDF generation library (e.g., pdfkit or puppeteer)

## Notes
- Ensure all changes align with the provided workflow scenario
- Maintain existing UI/UX consistency
- Add proper error handling and loading states
- Implement notifications for all user actions
