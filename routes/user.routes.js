import express from 'express'
import db from '../db/index.js'
import {usersTable, usersSession} from '../db/schema.js'
import {eq} from 'drizzle-orm'
import { randomBytes, createHmac } from 'crypto'
import { ensureAuthenticated } from '../middleware/auth.middleware.js'
import jwt from 'jsonwebtoken'

const router = express.Router();

router.patch('/', ensureAuthenticated, async (req, res) => {

    const { name } = req.body
    await db.update(usersTable).set({ name }).where(eq(usersTable.id, user.id));

    return res.json({ status: 'success'})
})

router.get('/', async (req, res) => {
    const user = req.user;

    if(!user){
        return res.status(401).json({error: 'You are not logged in'})
    }

    return res.json({ user })
});

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    const [existingUsers] = await db
        .select({
            email: usersTable.email,
        })
        .from(usersTable)
        .where((table) => eq(table.email, email));

        if(existingUsers){
            return res.status(400).json({error: `user with email ${email} already exists`})
        }

        const salt = randomBytes(256).toString('hex')
        const hashedPassowrd = createHmac('sha256', salt)
               .update(password)
               .digest('hex');

        const [user] = await db.insert(usersTable).values({name, email, password: hashedPassowrd, salt}).returning({id: usersTable.id})

        return res.status(201).json({status: 'success', data: { userId: user.id }})
})

router.post('/login',  async (req, res) => {
    const {email, password} = req.body;

    const [existingUsers] = await db
        .select({
            id: usersTable.id,
            email: usersTable.email,
            salt: usersTable.salt,
            role: usersTable.role,
            password: usersTable.password
        })
        .from(usersTable)
        .where((table) => eq(table.email, email));

        console.log(existingUsers);
        
    
            if(!existingUsers){
                return res.status(404).json({error: `user with email ${email} doesn't exists`})
            }

            const salt = existingUsers.salt
            const existingHash = existingUsers.password

            const newHash = createHmac('sha256', salt)
               .update(password)
               .digest('hex');


            if(newHash !== existingHash) {
                return res.status(400).json({error: 'Incorrect Password'})
            }

            const payload = {
                id: existingUsers.id,
                email: existingUsers.email,
                name: existingUsers.name,
                role: existingUsers.role,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET)

        //Generate a session
        // const [session] = await db.insert(usersSession).values({
        //     userId: existingUsers.id
        // }).returning({id: usersSession.id,})
    return res.json({status: 'success', token})
});

export default router;
