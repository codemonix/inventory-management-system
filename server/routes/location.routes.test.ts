import request from 'supertest';
import app from '../app.js';

// Import Models
import User from '../models/users.model.js';
import Location from '../models/location.model.js';

// Import Utility
import generateToken from '../utils/generateToken.js';

describe('Integration: Location Endpoints', () => {

    let adminToken: string;
    let userToken: string;
    let existingLocationId: string;

    const mockLocationPayload = {
        name: 'Secondary Warehouse',
    };

    beforeEach(async () => {
        // Create an Admin User
        const admin = await User.create({
            name: 'Location Admin',
            email: 'admin@ims.com',
            password: 'hashedpassword',
            role: 'admin',
            isApproved: true
        });
        adminToken = generateToken(admin.id, admin.role);

        // Create a Standard User 
        const standardUser = await User.create({
            name: 'Standard Worker',
            email: 'worker@ims.com',
            password: 'hashedpassword',
            role: 'user', 
            isApproved: true
        });
        userToken = generateToken(standardUser.id, standardUser.role);

        // Seed an initial location for the GET and DELETE tests
        const location = await Location.create({
            name: 'Main Warehouse'
        });
        existingLocationId = location.id;
    });

    describe('GET /api/locations', () => {
        
        it('should allow any authenticated user to fetch locations', async () => {
            const response = await request(app)
                .get('/api/locations')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            
            const locationsArray = response.body.locations
            
            expect(Array.isArray(locationsArray)).toBe(true);
            expect(locationsArray.length).toBe(1);
            expect(locationsArray[0].name).toBe('Main Warehouse');
        });

        it('should block unauthenticated requests', async () => {
            const response = await request(app).get('/api/locations');
            expect(response.status).toBe(401); 
        });
    });

    describe('POST /api/locations', () => {
        
        it('should successfully create a location if user is Admin', async () => {
            const response = await request(app)
                .post('/api/locations')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(mockLocationPayload);

            expect(response.status).toBe(201);
            
            const createdLoc = response.body.location;
            expect(createdLoc.name).toBe(mockLocationPayload.name);
        });

        it('should FORBID creation if user is not an Admin', async () => {
            const response = await request(app)
                .post('/api/locations')
                .set('Authorization', `Bearer ${userToken}`) 
                .send(mockLocationPayload);

            expect(response.status).toBe(403); 
            
            const count = await Location.countDocuments();
            expect(count).toBe(1); // Still only the "Main Warehouse" from beforeEach
        });
    });

    describe('DELETE /api/locations/:id', () => {
        
        it('should successfully delete a location if user is Admin', async () => {
            const response = await request(app)
                .delete(`/api/locations/${existingLocationId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);

            // Check the database directly to ensure it is actually gone
            const deletedLoc = await Location.findById(existingLocationId);
            expect(deletedLoc).toBeNull();
        });

        it('should FORBID deletion if user is not an Admin', async () => {
            const response = await request(app)
                .delete(`/api/locations/${existingLocationId}`)
                .set('Authorization', `Bearer ${userToken}`); // Using the worker token

            expect(response.status).toBe(403);

            // Prove the location survived the attack
            const survivingLoc = await Location.findById(existingLocationId);
            expect(survivingLoc).toBeDefined();
        });

        it('should return 404 if trying to delete a non-existent location', async () => {
            // Generate a perfectly valid, but fake, MongoDB ObjectId
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/api/locations/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
        });
    });
});