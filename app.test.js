const request = require('supertest');
const express = require('express');
const app = express();

describe('Users functionality', ()=>{
    
    it('should run', ()=>{});
    it('POST /api/users --> create a user with form data username', () => {
        //create a new user if there is no users of that name
    });
    it('POST /api/users --> response json{username, _id}', () => {
        //return user of that name from data base or create a new user and return
        //them if no user is there.
        return request(app)
        .post('/api/users')
        .send({username: 'testUser1'})
        .expect('Content-Type', /json/)
        .expect(201)
        .then((response) => {
            expect(response.body).toEuqal(
                expect.arrayContaining([
                    expect.objectContaining({
                        username: expect.any(String),
                        id: expect.any(Number),
                    }),
                ])
            )
        });
    });
    it('POST /api/users --> create a user', () => {});
    
});
