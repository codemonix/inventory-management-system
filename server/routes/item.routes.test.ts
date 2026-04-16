import request from 'supertest';
import app from '../app.js';
import User from '../models/users.model.js';
import Item from '../models/item.model.js';
import generateToken from '../utils/generateToken.js';

describe('Integration: Item Endpoints', () => {

    let adminToken: string;

    const mockItem = {
        name: 'Enterprise Server Rack',
        price: 1250.00,
        description: '42U standard server rack'
    };

    beforeEach(async () => {
        const admin = await User.create({
            name: 'Item Admin',
            email: 'admin@ims.com',
            password: 'hashedpassword', 
            role: 'admin',
            isApproved: true
        });

        adminToken = generateToken(admin.id, admin.role);
    });

    describe('POST /api/items', () => {
        
        it('should successfully create a new item and auto-generate a code', async () => {
            const response = await request(app)
                .post('/api/items')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(mockItem);

            expect(response.status).toBe(201);
            
            const createdItem = response.body.item || response.body;

            expect(createdItem.name).toBe(mockItem.name);
            expect(createdItem.price).toBe(mockItem.price);
            
            // Check if backend generate item code 
            expect(createdItem.code).toBeDefined();
            expect(typeof createdItem.code).toBe('string');
        });

        it('should prevent creating an item with a duplicate name', async () => {
            await request(app)
                .post('/api/items')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(mockItem);

            const response = await request(app)
                .post('/api/items')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(mockItem);

            expect(response.status).toBe(400); 
            
            const errorMessage = response.body.error || response.body.message;
            expect(errorMessage).toBeDefined(); 
        });
    });

    describe('GET /api/items', () => {
        
        it('should fetch a list of all items', async () => {
            await request(app).post('/api/items').set('Authorization', `Bearer ${adminToken}`).send(mockItem);
            await request(app).post('/api/items').set('Authorization', `Bearer ${adminToken}`).send({
                name: 'Network Switch',
                price: 400.00
            });

            const response = await request(app)
                .get('/api/items')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            
            const itemsArray = response.body.result.items
            
            expect(Array.isArray(itemsArray)).toBe(true);
            expect(itemsArray.length).toBe(2);
            expect(itemsArray[0].name).toBeDefined();
            expect(itemsArray[0].code).toBeDefined();
        });
    });
});