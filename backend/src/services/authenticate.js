const jwt = require('jsonwebtoken');
const axios = require('axios');

const confirmUser= async (req, res, next) => {
    try {
        const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_KEY_SECRET);
        const query = `query GetUser($userId: Int!) {
                        users(where: { id: { _eq: $userId } }) {
                            id
                            username
                            email
                        }
                      }`;
        const headers = { "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET };
        const { data } = await axios.post(process.env.HASURA_ENDPOINT, { query, variables: { userId } }, { headers } );
        if (data.errors) return res.status(500).json({ message: "Something went wrong."});
        else {
            const user = data.data.users[0];
            if (!user) throw new Error("You are not authorized for this.")
            req.user = user;
            next();
        }
    }
    catch (err) {
        
        res.status(401).json(err.message);
    }
};

module.exports = confirmUser;