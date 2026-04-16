import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

// Import Models
import User from '../models/users.model.js';
import Transaction from '../models/transaction.model.js';

// Import Utility
import generateToken from '../utils/generateToken.js';

describe('Integration: Transaction Log Endpoints', () => {

    let adminToken: string;
    let managerToken: string;
    let userToken: string;

    beforeEach(async () => {
        // Create the Admin User
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@ims.com',
            password: 'hashedpassword',
            role: 'admin',
            isApproved: true
        });
        adminToken = generateToken(admin.id, admin.role);

        // Create the Manager User
        const manager = await User.create({
            name: 'Warehouse Manager',
            email: 'manager@ims.com',
            password: 'hashedpassword',
            role: 'manager', 
            isApproved: true
        });
        managerToken = generateToken(manager.id, manager.role);

        // Create the Standard User
        const worker = await User.create({
            name: 'Standard Worker',
            email: 'worker@ims.com',
            password: 'hashedpassword',
            role: 'user', 
            isApproved: true
        });
        userToken = generateToken(worker.id, worker.role);

        // Seed a generic transaction log so the GET request has data to return
        await Transaction.create({
            itemId: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(),
            locationId: new mongoose.Types.ObjectId(),
            type: 'IN',
            quantity: 50,
            note: 'Test Setup Stocking'
        });
    });

    describe('GET /api/transactions/logs', () => {
        
        it('should allow an Admin to fetch transaction logs', async () => {
            const response = await request(app)
                .get('/api/transactions/logs')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            
            const logsArray = response.body.logs ;
            expect(Array.isArray(logsArray)).toBe(true);
            expect(logsArray.length).toBeGreaterThan(0);
        });

        it('should allow a Manager to fetch transaction logs', async () => {
            // Testing the "Or" in isManagerOrAdmin!
            const response = await request(app)
                .get('/api/transactions/logs')
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(200);
            
            const logsArray = response.body.logs;
            expect(Array.isArray(logsArray)).toBe(true);
        });

        it('should FORBID a standard user from fetching transaction logs', async () => {
            const response = await request(app)
                .get('/api/transactions/logs')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
        });

        it('should REJECT completely unauthenticated requests', async () => {
            const response = await request(app)
                .get('/api/transactions/logs');

            expect(response.status).toBe(401);
        });
    });
});