import request from 'supertest';
import app from '../app.js';

// Import Models
import User from '../models/users.model.js'; 
import Location from '../models/location.model.js';
import Item from '../models/item.model.js';
import Inventory from '../models/inventory.model.js'; 

// Import Utilities
import generateToken from '../utils/generateToken.js';

describe('Integration: Transfer Workflow Endpoints', () => {

    let adminToken: string;
    let locAId: string;
    let locBId: string;
    let itemId: string;

    beforeEach(async () => {
        // Setup Admin and bypass HTTP Login
        const admin = await User.create({
            name: 'Transfer Admin',
            email: 'transfer@ims.com',
            password: 'hashedpassword',
            role: 'admin',
            isApproved: true
        });
        adminToken = generateToken(admin.id, admin.role);

        // Direct DB Seeding: Locations
        const locA = await Location.create({ name: 'Warehouse A', code: 'W-A' });
        const locB = await Location.create({ name: 'Warehouse B', code: 'W-B' });
        locAId = locA.id;
        locBId = locB.id;

        // Direct DB Seeding: Item
        const item = await Item.create({ 
            name: 'TransferItem',
            nameLower: 'transferitem',
            code: 'ITEM-001',
            description: 'Test Item',
            price: 100 
        });
        itemId = item.id;

        // Direct DB Seeding: Inject Initial Stock 
        await Inventory.create({
            itemId: item.id,
            locationId: locA.id,
            quantity: 20
        });
    });

    it('should successfully complete a full transfer workflow (Init -> Add -> Finalize -> Confirm)', async () => {
        
        // Initialize Temp Transfer
        const initResponse = await request(app)
            .post('/api/transfers/temp/init')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ fromLocation: locAId, toLocation: locBId });
        
        expect(initResponse.status).toBe(201);

        // Add Item to Temp Transfer
        const addResponse = await request(app)
            .post('/api/transfers/temp/add')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ 
                itemId: itemId, 
                quantity: 5, 
                sourceLocationId: locAId 
            });

        expect(addResponse.status).toBe(201);

        // Finalize Temp Transfer
        const finalizeResponse = await request(app)
            .post('/api/transfers/temp/finalize')
            .set('Authorization', `Bearer ${adminToken}`);
            
        expect(finalizeResponse.status).toBe(201);
        
        // Extract the actual transfer ID (Adjust based on your API's JSON wrapper)
        const transferId = finalizeResponse.body.transfer?._id;
        expect(transferId).toBeDefined();

        // Confirm Transfer
        const confirmResponse = await request(app)
            .put(`/api/transfers/${transferId}/confirm`)
            .set('Authorization', `Bearer ${adminToken}`);
            
        expect(confirmResponse.status).toBe(200);

        // mathematically prove the database actually moved the stock!
        const stockA = await Inventory.findOne({ itemId, locationId: locAId });
        const stockB = await Inventory.findOne({ itemId, locationId: locBId });

        expect(stockA?.quantity).toBe(15); // Started with 20, moved 5
        expect(stockB?.quantity).toBe(5);  // Started with 0, received 5
    });

    it('should reject a transfer if requested quantity exceeds available stock', async () => {
        // Init
        await request(app)
            .post('/api/transfers/temp/init')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ fromLocation: locAId, toLocation: locBId });

        // Try to add 50 items (only 20 exist in LocA)
        const addResponse = await request(app)
            .post('/api/transfers/temp/add')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ 
                itemId: itemId, 
                quantity: 50, 
                sourceLocationId: locAId 
            });

        // Expect the Global Error Handler to block it!
        expect(addResponse.status).toBe(422);
    });
});