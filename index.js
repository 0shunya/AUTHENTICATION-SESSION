import express from'express';
import userRouter from './routes/user.routes.js'
import db from './db/index.js'
import {usersTable, usersSession} from './db/schema.js'
import {eq} from 'drizzle-orm'
import jwt from 'jsonwebtoken'

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());

app.use( async function (req, res, next) {
    // const sessionId = req.headers['session-id']
    const tokenHeader = req.headers['authorization']

    //Header authorization: Bearer <TOKEN>


    if(!tokenHeader){
       return next();
    }

    if(!tokenHeader.startsWith('Bearer')){
       return res.status(400).json({ error: 'authorization header must start with bearer'})
    }

    const token = tokenHeader.split(' ')[1]

    const decoded =  jwt.verify(token, process.env.JWT_SECRET)

    // const [data] = await db.select({
    //     sessionId: usersSession.id,
    //     id: usersTable.id,
    //     userId: usersTable.id,
    //     name: usersTable.name,
    //     email: usersTable.email
    // })
    // .from(usersSession)
    // .rightJoin(usersTable, eq(usersTable.id, usersSession.userId))
    // .where((table)=> eq(table.sessionId, sessionId));

    // if(!data){
    //     return next()
    // }

    req.user = decoded
    next();
});

app.get(`/`, (req, res) => {
    return res.json({ status: 'Server is running'});
})

app.use('/user', userRouter)

app.listen(PORT, () => console.log(`Server is running ${PORT}`));