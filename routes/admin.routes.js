import express from 'express';
import db from '../db/index.js';
import { usersTable } from '../db/schema.js';
import { ensureAuthenticated, restrictToRole } from '../middleware/auth.middleware.js'

const router = express.Router();

const adminRestrictMiddleware = restrictToRole('ADMIN');

router.get('/users',ensureAuthenticated, adminRestrictMiddleware, async(req, res) => {

  const users = await db
            .select({
                id: usersTable.id,
                name: usersTable.name,
                email: usersTable.email,
            })
            .from(usersTable);
    return res.json({ users });
})


export default router;