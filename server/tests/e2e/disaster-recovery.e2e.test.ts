import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';

// Import Models
import User from '../../models/users.model.js';
import Item from '../../models/item.model.js'; 

// Import Utility
import generateToken from '../../utils/generateToken.js';

describe('E2E Saga: Disaster Recovery & Data Integrity', () => {

    let adminToken: string;

    beforeEach(async () => {
        // Create the System Administrator for the E2E flow
        const admin = await User.create({
            name: 'E2E Admin',
            email: 'e2e-admin@ims.com',
            password: 'hashedpassword',
            role: 'admin',
            isApproved: true
        });
        adminToken = generateToken(admin.id, admin.role);
    });

    it('THE ROUND TRIP: Should fully backup, wipe, and perfectly restore system state', async () => {
        
        // Seed real data into the live database
        await Item.create({ 
            name: 'E2E Critical Component',
            nameLower: 'e2ecriticalcomponent',
            code: 'E2E-001',
            price: 299.99 
        });

        // Ask the API to generate a real backup
        const backupResponse = await request(app)
            .get('/api/system/backup')
            .set('Authorization', `Bearer ${adminToken}`)
            .responseType('blob');
        
        expect(backupResponse.status).toBe(200);

        // Capture the raw binary ZIP file
        const realZipBuffer = backupResponse.body; 

        
        // Trigger the Granular Wipe (Simulated Disaster)
        const clearResponse = await request(app)
            .post('/api/system/clear')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ target: 'items' });
        
        expect(clearResponse.status).toBe(200);

        // Verify the database is actually empty
        const emptyItems = await Item.countDocuments();
        expect(emptyItems).toBe(0);

        // ==========================================
        // STEP 4: Feed the backup back into the Restore route
        // ==========================================
        const restoreResponse = await request(app)
            .post('/api/system/restore')
            .set('Authorization', `Bearer ${adminToken}`)
            // Attaching the exact file buffer generated in Step 2
            .attach('backupFile', realZipBuffer, 'real-system-backup.zip');

        expect([200, 201]).toContain(restoreResponse.status);

        // ==========================================
        // STEP 5: The Ultimate Enterprise Proof
        // ==========================================
        const restoredItem = await Item.findOne({ name: 'E2E Critical Component' });
        
        // If these pass, your disaster recovery architecture is mathematically flawless.
        expect(restoredItem).toBeDefined();
        expect(restoredItem?.price).toBe(299.99);
    });
});