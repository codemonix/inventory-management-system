import request from 'supertest';
import app from '../app.js';

// Import Models
import User from '../models/users.model.js'; 
import Location from '../models/location.model.js';
import Item from '../models/item.model.js';
import Inventory from '../models/inventory.model.js'; 

// Import Utilities
import generateToken from '../utils/generateToken.js';

import Transaction from '../models/transaction.model.js';

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

        // Verify the stock actually moved in the database
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

    describe('Hardening', () => {
        const auth = () => ({ Authorization: `Bearer ${adminToken}` });

        it('should reject a negative quantity in a direct transfer and leave stock untouched', async () => {
            const response = await request(app)
                .post('/api/transfers')
                .set(auth())
                .send({ fromLocation: locAId, toLocation: locBId, items: [{ item: itemId, quantity: -50 }] });

            expect(response.status).toBe(400);
            const stock = await Inventory.findOne({ itemId, locationId: locAId });
            expect(stock?.quantity).toBe(20);
        });

        it('should reject a negative quantity when adding to a draft', async () => {
            await request(app).post('/api/transfers/temp/init').set(auth())
                .send({ fromLocation: locAId, toLocation: locBId });
            const response = await request(app).post('/api/transfers/temp/add').set(auth())
                .send({ itemId, quantity: -5, sourceLocationId: locAId });

            expect(response.status).toBe(400);
            const stock = await Inventory.findOne({ itemId, locationId: locAId });
            expect(stock?.quantity).toBe(20);
        });

        it('should return reserved stock when a draft is replaced', async () => {
            await request(app).post('/api/transfers/temp/init').set(auth())
                .send({ fromLocation: locAId, toLocation: locBId });
            await request(app).post('/api/transfers/temp/add').set(auth())
                .send({ itemId, quantity: 5, sourceLocationId: locAId });
            expect((await Inventory.findOne({ itemId, locationId: locAId }))?.quantity).toBe(15);

            const reinit = await request(app).post('/api/transfers/temp/init').set(auth())
                .send({ fromLocation: locAId, toLocation: locBId });

            expect(reinit.status).toBe(201);
            expect((await Inventory.findOne({ itemId, locationId: locAId }))?.quantity).toBe(20);
        });

        it('should reject an add-item request without itemId and leave stock untouched', async () => {
            await request(app).post('/api/transfers/temp/init').set(auth())
                .send({ fromLocation: locAId, toLocation: locBId });
            // Old client payload used `item` instead of `itemId`
            const response = await request(app).post('/api/transfers/temp/add').set(auth())
                .send({ item: itemId, quantity: 2, sourceLocationId: locAId });

            expect(response.status).toBe(400);
            expect((await Inventory.findOne({ itemId, locationId: locAId }))?.quantity).toBe(20);
        });

        it('should keep drafts separate per user', async () => {
            const other = await User.create({
                name: 'Other', email: 'other@ims.com', password: 'hashedpassword', role: 'user', isApproved: true,
            });
            const otherToken = generateToken(other.id, other.role);

            await request(app).post('/api/transfers/temp/init').set(auth())
                .send({ fromLocation: locAId, toLocation: locBId });
            await request(app).post('/api/transfers/temp/add').set(auth())
                .send({ itemId, quantity: 5, sourceLocationId: locAId });

            // Another user starting a draft must not delete the admin's draft
            await request(app).post('/api/transfers/temp/init').set('Authorization', `Bearer ${otherToken}`)
                .send({ fromLocation: locAId, toLocation: locBId });

            const adminDraft = await request(app).get('/api/transfers/temp').set(auth());
            expect(adminDraft.body.temp.items).toHaveLength(1);
            expect((await Inventory.findOne({ itemId, locationId: locAId }))?.quantity).toBe(15);
        });

        it('should record who confirmed a transfer and log TRANSFER transactions', async () => {
            const created = await request(app).post('/api/transfers').set(auth())
                .send({ fromLocation: locAId, toLocation: locBId, items: [{ item: itemId, quantity: 4 }] });
            expect(created.status).toBe(201);

            const confirmed = await request(app).put(`/api/transfers/${created.body.transfer._id}/confirm`).set(auth());
            expect(confirmed.status).toBe(200);
            expect(confirmed.body.transfer.confirmedBy).toBeDefined();
            expect(confirmed.body.transfer.confirmedAt).toBeDefined();

            const logs = await Transaction.find({ type: 'TRANSFER' });
            expect(logs).toHaveLength(2); // dispatched + received
            expect((await Inventory.findOne({ itemId, locationId: locBId }))?.quantity).toBe(4);
        });

        it('should return in-transit stock to the source when an admin clears transfers', async () => {
            await request(app).post('/api/transfers').set(auth())
                .send({ fromLocation: locAId, toLocation: locBId, items: [{ item: itemId, quantity: 6 }] });
            expect((await Inventory.findOne({ itemId, locationId: locAId }))?.quantity).toBe(14);

            const cleared = await request(app).post('/api/system/clear').set(auth()).send({ target: 'transfers' });
            expect(cleared.status).toBe(200);
            expect((await Inventory.findOne({ itemId, locationId: locAId }))?.quantity).toBe(20);
        });
    });

    describe('Confirmation permissions and history', () => {
        const auth = () => ({ Authorization: `Bearer ${adminToken}` });

        const createTransfer = async (quantity = 1) => {
            const res = await request(app).post('/api/transfers').set(auth())
                .send({ fromLocation: locAId, toLocation: locBId, items: [{ item: itemId, quantity }] });
            expect(res.status).toBe(201);
            return res.body.transfer._id as string;
        };

        it('should forbid a regular user from confirming a transfer', async () => {
            const worker = await User.create({
                name: 'Worker', email: 'worker@ims.com', password: 'hashedpassword', role: 'user', isApproved: true,
            });
            const id = await createTransfer();

            const response = await request(app).put(`/api/transfers/${id}/confirm`)
                .set('Authorization', `Bearer ${generateToken(worker.id, worker.role)}`);

            expect(response.status).toBe(403);
            expect((await Inventory.findOne({ itemId, locationId: locBId }))).toBeNull();
        });

        it('should let a manager confirm a transfer', async () => {
            const manager = await User.create({
                name: 'Manager', email: 'manager@ims.com', password: 'hashedpassword', role: 'manager', isApproved: true,
            });
            const id = await createTransfer();

            const response = await request(app).put(`/api/transfers/${id}/confirm`)
                .set('Authorization', `Bearer ${generateToken(manager.id, manager.role)}`);

            expect(response.status).toBe(200);
        });

        it('should page transfer history newest first', async () => {
            for (let i = 0; i < 3; i++) await createTransfer();

            const first = await request(app).get('/api/transfers?page=1&limit=2').set(auth());
            expect(first.status).toBe(200);
            expect(first.body.transfers).toHaveLength(2);
            expect(first.body.total).toBe(3);
            expect(first.body.hasMore).toBe(true);

            const second = await request(app).get('/api/transfers?page=2&limit=2').set(auth());
            expect(second.body.transfers).toHaveLength(1);
            expect(second.body.hasMore).toBe(false);
        });

        it('should filter by status and location', async () => {
            const confirmedId = await createTransfer();
            await createTransfer();
            await request(app).put(`/api/transfers/${confirmedId}/confirm`).set(auth());

            const confirmed = await request(app).get('/api/transfers?status=confirmed').set(auth());
            expect(confirmed.body.total).toBe(1);
            expect(confirmed.body.transfers[0]._id).toBe(confirmedId);

            const toA = await request(app).get(`/api/transfers?toLocation=${locAId}`).set(auth());
            expect(toA.body.total).toBe(0);
        });

        it('should search by item name and location name', async () => {
            await createTransfer();

            const byItem = await request(app).get('/api/transfers?search=transferitem').set(auth());
            expect(byItem.body.total).toBe(1);

            const byLocation = await request(app).get('/api/transfers?search=warehouse%20b').set(auth());
            expect(byLocation.body.total).toBe(1);

            const noMatch = await request(app).get('/api/transfers?search=nothing-like-this').set(auth());
            expect(noMatch.body.total).toBe(0);
        });

        it('should reject an invalid status or date filter', async () => {
            expect((await request(app).get('/api/transfers?status=lost').set(auth())).status).toBe(400);
            expect((await request(app).get('/api/transfers?dateFrom=yesterday').set(auth())).status).toBe(400);
        });
    });

    describe('Discarding drafts and cancelling transfers', () => {
        const auth = () => ({ Authorization: `Bearer ${adminToken}` });
        const stockAt = async (locationId: string) => (await Inventory.findOne({ itemId, locationId }))?.quantity;

        const createTransfer = async (quantity: number) => {
            const res = await request(app).post('/api/transfers').set(auth())
                .send({ fromLocation: locAId, toLocation: locBId, items: [{ item: itemId, quantity }] });
            return res.body.transfer._id as string;
        };

        it('should discard a draft and return its reserved stock', async () => {
            await request(app).post('/api/transfers/temp/init').set(auth()).send({ fromLocation: locAId, toLocation: locBId });
            await request(app).post('/api/transfers/temp/add').set(auth()).send({ itemId, quantity: 7, sourceLocationId: locAId });
            expect(await stockAt(locAId)).toBe(13);

            const response = await request(app).delete('/api/transfers/temp').set(auth());

            expect(response.status).toBe(200);
            expect(await stockAt(locAId)).toBe(20);
            expect((await request(app).get('/api/transfers/temp').set(auth())).body.temp).toBeNull();
        });

        it('should return 404 when there is no draft to discard', async () => {
            expect((await request(app).delete('/api/transfers/temp').set(auth())).status).toBe(404);
        });

        it('should let an admin cancel an in-transit transfer and return the stock', async () => {
            const id = await createTransfer(5);
            expect(await stockAt(locAId)).toBe(15);

            const response = await request(app).put(`/api/transfers/${id}/cancel`).set(auth());

            expect(response.status).toBe(200);
            expect(response.body.transfer.status).toBe('cancelled');
            expect(response.body.transfer.cancelledBy).toBeDefined();
            expect(await stockAt(locAId)).toBe(20);
            const notes = (await Transaction.find({ type: 'TRANSFER' })).map(t => t.note);
            expect(notes.some(n => n?.includes('cancelled'))).toBe(true);
        });

        it('should forbid managers from cancelling', async () => {
            const manager = await User.create({
                name: 'Manager', email: 'manager2@ims.com', password: 'hashedpassword', role: 'manager', isApproved: true,
            });
            const id = await createTransfer(5);

            const response = await request(app).put(`/api/transfers/${id}/cancel`)
                .set('Authorization', `Bearer ${generateToken(manager.id, manager.role)}`);

            expect(response.status).toBe(403);
            expect(await stockAt(locAId)).toBe(15);
        });

        it('should refuse to cancel a confirmed or already cancelled transfer', async () => {
            const confirmedId = await createTransfer(2);
            await request(app).put(`/api/transfers/${confirmedId}/confirm`).set(auth());
            expect((await request(app).put(`/api/transfers/${confirmedId}/cancel`).set(auth())).status).toBe(400);

            const cancelledId = await createTransfer(2);
            await request(app).put(`/api/transfers/${cancelledId}/cancel`).set(auth());
            expect((await request(app).put(`/api/transfers/${cancelledId}/cancel`).set(auth())).status).toBe(400);
            expect((await request(app).put(`/api/transfers/${cancelledId}/confirm`).set(auth())).status).toBe(400);
        });

        it('should filter history by the cancelled status', async () => {
            const id = await createTransfer(1);
            await createTransfer(1);
            await request(app).put(`/api/transfers/${id}/cancel`).set(auth());

            const response = await request(app).get('/api/transfers?status=cancelled').set(auth());
            expect(response.body.total).toBe(1);
            expect(response.body.transfers[0]._id).toBe(id);
        });
    });
});
