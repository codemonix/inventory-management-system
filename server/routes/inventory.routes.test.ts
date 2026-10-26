// server/routes/inventory.routes.test.ts
import request from 'supertest';
import app from '../app.js';

// Import Models
import User from '../models/users.model.js';
import Item from '../models/item.model.js';
import Location from '../models/location.model.js';
import Inventory from '../models/inventory.model.js';

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
            password: 'hashedpassword', // unused: the test signs its own token
            role: 'admin',
            isApproved: true
        });

        // 2. Sign a token directly instead of logging in over HTTP
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

    describe('Hardening', () => {
        it('should reject a non-numeric quantity', async () => {
            const response = await request(app)
                .post(`/api/inventory/${itemId}/in`)
                .set('Authorization', `Bearer ${token}`)
                .send({ locationId, quantity: 'abc' });

            expect(response.status).toBe(400);
            expect(await Inventory.countDocuments()).toBe(0);
        });

        it('should reject stock IN for a location that does not exist', async () => {
            const response = await request(app)
                .post(`/api/inventory/${itemId}/in`)
                .set('Authorization', `Bearer ${token}`)
                .send({ locationId: '507f1f77bcf86cd799439011', quantity: 5 });

            expect(response.status).toBe(404);
            expect(await Inventory.countDocuments()).toBe(0);
        });

        it('should let an admin delete an empty inventory record (route now authenticates first)', async () => {
            const record = await Inventory.create({ itemId, locationId, quantity: 0 });
            const response = await request(app)
                .delete(`/api/inventory/${record.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
        });

        it('should only count search matches in pagination totals', async () => {
            const other = await Item.create({ name: 'Unrelated', nameLower: 'unrelated', code: 'ITEM-002' });
            await Inventory.create({ itemId, locationId, quantity: 1 });
            await Inventory.create({ itemId: other.id, locationId, quantity: 1 });

            const response = await request(app)
                .get('/api/inventory?search=StockItem')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.pagination.totalCount).toBe(1);
        });
    });

    describe('Stock totals and items by id', () => {
        it('should return totals only for the requested items, with 0 for items without stock', async () => {
            const other = await Item.create({ name: 'NoStock', nameLower: 'nostock', code: 'ITEM-003' });
            const secondLocation = await Location.create({ name: 'Second' });
            await Inventory.create({ itemId, locationId, quantity: 4 });
            await Inventory.create({ itemId, locationId: secondLocation.id, quantity: 6 });

            const response = await request(app)
                .get(`/api/inventory/totals?itemIds=${itemId},${other.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.totals).toEqual({ [itemId]: 10, [other.id]: 0 });
        });

        it('should reject malformed item ids', async () => {
            const response = await request(app)
                .get('/api/inventory/totals?itemIds=not-an-id')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(400);
        });

        it('should fetch only the requested items from /items', async () => {
            await Item.create({ name: 'Other', nameLower: 'other', code: 'ITEM-004' });

            const response = await request(app)
                .get(`/api/items?ids=${itemId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.result.items).toHaveLength(1);
            expect(response.body.result.items[0]._id).toBe(itemId);
        });
    });
});
