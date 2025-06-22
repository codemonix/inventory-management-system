
import request from 'supertest';
import app from '../app.js';
import User from '../models/users.model.js';

let token, locA, locB, itemId, transfer;

beforeAll(async () => {
    // Create admin user
    const res = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Transfer',
            email: 'transfer@test.com',
            password: '123456',
            isApproved: true,
            role: 'admin'
        });

    token = res.body.token;
    const users = await User.find();
    console.log("user registered user list -> ", users.map((user) => user.email));

    // Create two locations
    const [ a, b ] = await Promise.all([
        request(app)
            .post('/api/locations')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'LocA'}),
        request(app)
            .post('/api/locations')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'LocB'})
    ]);
    console.log("transfer.test locA:", a.body.location._id);
    locA = a.body.location._id;
    locB = b.body.location._id;

    // Create Item
    const item = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'TransferItem' });
    itemId = item.body.item._id;

    // Add quantity to created item
    await request(app)
        .post(`/api/inventory/${itemId}/in`)
        .set('Authorization', `Bearer ${token}`)
        .send({ locationId: locA, quantity: 20 });
});

describe('Transfer Logic', () => {
    
    it('initialize temp transfer', async () => {
        console.log("transfer logic token:", token)
        const res = await request(app)
            .post('/api/transfers/temp/init')
            .set('Authorization', `Bearer ${token}`)
            .send({ fromLocation: locA, toLocation: locB })
        const users = await User.find();
        console.log("init temp user list -> ", users.map((user) => user.email));
        console.log("init temp trans. -> ", res.body)
        expect(res.statusCode).toBe(201)
    });

    it('adds item to tempTransfer', async () => {
        const res = await request(app)
            .post('/api/transfers/temp/add')
            .set('Authorization', `Bearer ${token}`)
            .send({ itemId, quantity: 5, sourceLocationId: locA });

        expect(res.statusCode).toBe(201)
        console.log("adds item to temp:", res.body)
    });

    it('finalaize temp transfer', async () => {
        const res = await request(app)
            .post('/api/transfers/temp/finalize')
            .set('Authorization', `Bearer ${token}`)
            
        transfer = res.body;
        console.log("finalize temp trans.", transfer);
        expect(res.statusCode).toBe(201)
    })

    it('confirms transfer updates inventory', async () => {
        console.log("transfer_id -> :", transfer._id)
        const res = await request(app)
            .put(`/api/transfers/${transfer._id}/confirm`)
            .set('Authorization', `Bearer ${token}`)
         console.log("cinfirm trans:", res.body)
        expect(res.statusCode).toBe(200);
       
    })
})





