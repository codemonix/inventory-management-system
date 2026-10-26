import request from 'supertest';
import app from '../app.js';
import AdmZip from 'adm-zip';

// Import Models
import User from '../models/users.model.js';
import Transfer from '../models/transfer.model.js';
import Item from '../models/item.model.js';

// Import Utility
import generateToken from '../utils/generateToken.js';

import fs from 'fs';
import os from 'os';
import path from 'path';

describe('Integration: System & Infrastructure Endpoints', () => {

    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
        // Create the System Administrator
        const admin = await User.create({
            name: 'System Admin',
            email: 'sysadmin@ims.com',
            password: 'hashedpassword',
            role: 'admin',
            isApproved: true
        });
        adminToken = generateToken(admin.id, admin.role);

        // Create a Standard User (To test the RBAC firewall!)
        const worker = await User.create({
            name: 'Warehouse Worker',
            email: 'worker@ims.com',
            password: 'hashedpassword',
            role: 'user',
            isApproved: true
        });
        userToken = generateToken(worker.id, worker.role);
    });

    // TELEMETRY & SETTINGS ROUTES
    describe('Telemetry & Settings', () => {
        
        it('GET /logs - should allow Admin to fetch system logs', async () => {
            const response = await request(app)
                .get('/api/system/logs')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.logs)).toBe(true);
        });

        it('PUT /settings - should FORBID standard users from updating settings', async () => {
            const response = await request(app)
                .put('/api/system/settings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ theme: 'dark', maintenanceMode: true });

            expect(response.status).toBe(403); 
        });
    });

    // INFRASTRUCTURE & BACKUP ROUTES
    describe('Infrastructure & Backup', () => {
        
        it('GET /backup - should allow Admin to generate a backup', async () => {
            const response = await request(app)
                .get('/api/system/backup')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.headers['content-disposition']).toContain('attachment');
        });

        it('POST /restore - should process a multipart/form-data file upload via Multer', async () => {
            // Create a fake backup JSON payload
            const fakeBackupData = JSON.stringify({ 
                users: [{ name: "Test", 
                    email: "test@ims.com", 
                    password: "hashedpassword123!", 
                    role: "admin",
                    isApproved: true
                }], 
                inventory: [] 
            });

            // Use AdmZip to dynamically create a .zip file in RAM
            const zip = new AdmZip();
            
            // Inject the file 
            zip.addFile('database_dump.json', Buffer.from(fakeBackupData));
            
            // Convert it to a buffer so Supertest can upload it
            const validZipBuffer = zip.toBuffer();

            const response = await request(app)
                .post('/api/system/restore')
                .set('Authorization', `Bearer ${adminToken}`)
                // .attach is Supertest's method for multipart file uploads!
                .attach('backupFile', validZipBuffer, 'mock-backup.zip'); 

            expect([200, 201]).toContain(response.status);
            expect(response.body.success).toBe(true);
        });

        it('POST /restore - should FORBID standard users from uploading backups', async () => {
            const fakeFileBuffer = Buffer.from('{"fake": "data"}');

            const response = await request(app)
                .post('/api/system/restore')
                .set('Authorization', `Bearer ${userToken}`)
                .attach('backupFile', fakeFileBuffer, 'mock-backup.json');

            expect(response.status).toBe(403);
        });

        it('POST /clear - should successfully wipe application data (Destructive Isolation)', async () => {
            // Verify we currently have 2 users in the database
            const userCount = await User.countDocuments();
            expect(userCount).toBe(2);

            // Trigger the clear option for Transfers
            const responseTransfer = await request(app)
                .post('/api/system/clear')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ target: 'transfers'});
            expect(responseTransfer.status).toBe(200);

            // Check if Transfer clear works
            const transferCount = await Transfer.countDocuments();
            const userCountTransferClear = await User.countDocuments();
            expect(transferCount).toBe(0);
            expect(userCountTransferClear).toBeGreaterThan(0);

            // Trigger the clear option for Items
            const responseItems = await request(app)
                .post('/api/system/clear')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ target: 'items'});
            expect(responseItems.status).toBe(200);

            // Check if Item clear works
            const itemCount = await Item.countDocuments();
            const userCountItemClear = await User.countDocuments();
            expect(itemCount).toBe(0);
            expect(userCountItemClear).toBeGreaterThan(0);
        });
    });

    describe('Hardening', () => {
        it('should reject a backup that contains no admin user', async () => {
            const zip = new AdmZip();
            zip.addFile('database_dump.json', Buffer.from(JSON.stringify({
                users: [{ name: 'U', email: 'u@ims.com', password: 'x', role: 'user', isApproved: true }],
            })));

            const response = await request(app)
                .post('/api/system/restore')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('backupFile', zip.toBuffer(), 'no-admin.zip');

            expect(response.status).toBe(400);
            expect(await User.countDocuments()).toBe(2);
        });

        it('should keep admin accounts on factory reset', async () => {
            // Point uploads at a throwaway folder so the real uploads directory is untouched
            const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ims-reset-'));
            const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
            try {
                const response = await request(app)
                    .post('/api/system/reset')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ confirmation: 'DELETE EVERYTHING' });

                expect(response.status).toBe(200);
                const remaining = await User.find();
                expect(remaining).toHaveLength(1);
                expect(remaining[0].email).toBe('sysadmin@ims.com');
            } finally {
                cwdSpy.mockRestore();
                fs.rmSync(tmpDir, { recursive: true, force: true });
            }
        });

        it('should reject an invalid log level', async () => {
            const response = await request(app)
                .put('/api/system/settings')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ logLevel: 'everything', enableDbLogging: true });

            expect(response.status).toBe(400);
        });
    });
});
