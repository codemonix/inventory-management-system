
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Location from '../models/location.model.js';
import User from '../models/users.model.js';
import Transfer from '../models/transfer.model.js';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
import Item from '../models/item.model.js';
// import Inventory from '../models/inventory.model';
import { nanoid } from 'nanoid';
// import Inventory from '../models/inventory.model.js';
// import { updateInventory } from '../controllers/inventory.controller.js';
// import { from } from 'form-data';



let token, fromLocation, toLocation, itemId;
beforeAll(async () => {
    const userRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Test User',
            email: `test-${nanoid(4)}@email.com`,
            password: 'testpass123',
            role: 'admin'
        });

    token = userRes.body.token;

    // Create two locations
    const fromLoc = await Location.create({ name: 'From Location'});
    const toLoc = await Location.create({ name: 'To Location' });
    fromLocation = fromLoc._id;
    toLocation = toLoc._id;
    // console.log('token:', token)

    const item = await Item.create({
        name: 'Test Item ' + nanoid(4),
        code: 'TEST-' + nanoid(6),
    });
    console.log('item name:', item.name);
    itemId = item._id
    try {
        // const itemStock = 
        await request(app)
            .post('/api/inventory')
            .set('Authorization', `Bearer ${token}`)
            .send({ itemId: itemId, locationId: fromLocation, quantity: 0 })
        // console.log(itemStock);
        // const itemUpdate = 
        await request(app)
            .put(`/api/inventory/${itemId}/quantity`)
            .set('Authorization', `Bearer ${token}`)
            .send({ locationId: fromLocation, quantity: 5} );
            // console.log(itemUpdate);
    } catch (error) {
        console.error(error.message);
        console.log("Cannot update item quantity -> transfer.test");
    }
    
});

afterAll(async () => {
    await User.deleteMany({});
    await Location.deleteMany({});
    await Item.deleteMany({});
    await Transfer.deleteMany({});
    await mongoose.connection.close();
});

describe('Transfer API', () => {
    it('should create a valid transfer', async () => {
        console.log('create a valid transfer test: from, to, item', fromLocation, toLocation, itemId)
        const res = await request(app)
            .post('/api/transfers')
            .set('Authorization', `Bearer ${token}`)
            .send({
                fromLocation: fromLocation,
                toLocation: toLocation,
                items: [
                    {
                        item: itemId,
                        quantity: 3
                    }
                ]
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.transfer).toHaveProperty('_id');
        expect(res.body.transfer.fromLocation.toString()).toBe(fromLocation.toString());
        expect(res.body.transfer.toLocation.toString()).toBe(toLocation.toString());
        expect(res.body.transfer.items.length).toBe(1);
        expect(res.body.transfer.items[0].quantity).toBe(3);
    });

    it('should fail to create a transfer without items', async () => {
        const res = await request(app)
            .post('/api/transfers')
            .set('Authorization', `Bearer ${token}`)
            .send({
                fromLocation: fromLocation,
                toLocation: toLocation,
                items: []
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/empty/i);
    });

});

