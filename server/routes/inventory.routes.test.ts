// server/routes/inventory.routes.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';

// Import Models
import User from '../models/users.model.js';
import Item from '../models/item.model.js';
import Location from '../models/location.model.js';

// Import the Token Utility!
import generateToken from '../utils/generateToken.js'; 

describe('Integration: Inventory Endpoints', () => {

    let token: string;
    let itemId: string;
    let locationId: string;

    // Use beforeEach so EVERY test gets a fresh database state
    beforeEach(async () => {
        // 1. Create an Admin User directly in MongoDB
        const admin = await User.create({
            name: 'Inventory Admin',
            email: 'admin@ims.com',
            password: 'hashedpassword', // Doesn't matter, we bypass HTTP login!
            role: 'admin',
            isApproved: true
        });

        // 2. The Enterprise Auth Bypass: Mint the token locally!
        token = generateToken(admin.id, admin.role);

        // 3. Inject prerequisite data directly into MongoDB
        const location = await Location.create({ 
            name: 'Main Warehouse',
            code: 'MAIN-01' 
        });
        locationId = location.id;

        const item = await Item.create({ 
            name: 'StockItem',
            nameLower: 'stockitem',
            code: 'ITEM-001',
            description: 'Test Item' 
        });
        itemId = item.id;
    });

    describe('POST /api/inventory/:id/in', () => {
        
        it('should successfully add stock to an item', async () => {
            const response = await request(app)
                .post(`/api/inventory/${itemId}/in`)
                .set('Authorization', `Bearer ${token}`) // Pass our bypassed token!
                .send({
                    locationId,
                    quantity: 10,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            
            // Optional: Assert the response returns the updated quantity
            // expect(response.body.inventory.quantity).toBe(10); 
        });

        it('should reject without a valid authorization token', async () => {
            const response = await request(app)
                .post(`/api/inventory/${itemId}/in`)
                // Notice we DO NOT set the Authorization header here
                .send({
                    locationId,
                    quantity: 10,
                });

            expect(response.status).toBe(401); 
        });
    });

    describe('POST /api/inventory/:id/out', () => {
        
        it('should successfully remove stock from an item', async () => {
            // First, seed the inventory with 10 items via HTTP
            await request(app)
                .post(`/api/inventory/${itemId}/in`)
                .set('Authorization', `Bearer ${token}`)
                .send({ locationId, quantity: 10 });
            
            // Now, remove 5 items
            const response = await request(app)
                .post(`/api/inventory/${itemId}/out`)
                .set('Authorization', `Bearer ${token}`)
                .send({ locationId, quantity: 5 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should block removing more stock than is available', async () => {
            // Seed with ONLY 5 items
            await request(app)
                .post(`/api/inventory/${itemId}/in`)
                .set('Authorization', `Bearer ${token}`)
                .send({ locationId, quantity: 5 });
            
            // Try to remove 20 items (This should trigger your custom business logic error!)
            const response = await request(app)
                .post(`/api/inventory/${itemId}/out`)
                .set('Authorization', `Bearer ${token}`)
                .send({ locationId, quantity: 20 });

            // Expect your Global Error Handler to catch the bad request
            expect(response.status).toBe(400); 
            expect(response.body.success).toBe(false);
            // expect(response.body.message).toContain('Insufficient stock'); // Update to match your actual error message
        });
    });
});