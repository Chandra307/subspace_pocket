const bcrypt = require('bcrypt');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const {v4: uuidv4 } = require('uuid');
require('dotenv').config();

const headers = { "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET };

function generateJWT(userId, email) {
  const payload = { userId, email };
  return jwt.sign(payload, process.env.JWT_KEY_SECRET, { expiresIn: "2d" });
}

function signUpErrorType(string) {
  if (string === '"users_email_key"') return "A user with this email already exists. Try logging in."
  else if (string === '"unique_username"') return "This username is not available."
}




exports.addUser = async (req, res, next) => {
  try {
    
    let { username, email, password } = req.body;
    const query = `mutation CreateUser($username: String!, $email: String!, $password: String!) {
                    insert_users_one(object: {username: $username, email: $email, password: $password}) {            
                      id  
                      username
                      email            
                    }
                  }`;
        bcrypt.hash(password, 10, async (err, hash) => {
          try {
            
            if (err) console.log(err, 'in hashing password');
            password = hash;
            const {data} = await axios.post(process.env.HASURA_ENDPOINT, { query, variables: { username, email, password } }, { headers } );
            if (data.errors) {
              const reason = signUpErrorType(data.errors[0].message.substr(69));
              return res.status(400).json({ message: "Signup unsuccessful!", reason });
            }
            return res.status(201).json({ message: "New user created", userDeets: data });
            
          }
          catch (err) {
            res.status(500).json({ message: "Something wrong!", reason: err.message });  
          }
        });
      }
      catch (err) {
        res.status(500).json({ message: "Something wrong!", reason: err.message });  
      }
    };
    
exports.getUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const query = `query CheckUserByEmail($email: String!) {
                    users(where: { email: { _eq: $email } }) {
                      id
                      email
                      password
                    }
                  }`;
        
        const { data: { data: { users } } } = await axios.post(process.env.HASURA_ENDPOINT, { query, variables: { email } }, { headers });
        
        if (users.length) {
          
          const [user] = users;
          bcrypt.compare(password, user.password, (err, result) => {
            
            if (err) console.log(err, 'in comapring passwords');
            else if (result) return res.status(200).json({ message: "login successful", token: generateJWT(user.id, user.email) });
            return res.status(401).json({ message: "Login failure", reason: "Invalid password!"});
            
          });
        }
        else {
          return res.status(401).json({ message: "Login unsuccessful", reason: "User with this email does not exist. Please signup!" })
        }
        
      }
  catch (err) {
    res.status(500).json({ message: "Something went wrong!", reason: err.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountType } = req.body;
    const accountNumber = uuidv4().substring(0, 11);
    const query = `mutation CreateAccount($userId: Int!, $accountType: String!, $accountNumber: String!) {
                    insert_accounts_one(object: {userid: $userId, accountnumber: $accountNumber, accounttype: $accountType, balance: 0}) {
                      id
                      userid
                      accountnumber
                      accounttype
                      balance
                    }
                  }`;
    const { data } = await axios.post(process.env.HASURA_ENDPOINT, { query, variables: { accountNumber, accountType, userId } }, { headers });
    res.status(201).json(data);
  }
  catch (err) {
    res.status(500).json({ message: "Something went wrong!", reason: err.message });
  }
};

exports.getAllAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `query ($userId: Int!) {
                    accounts(where: { userid: { _eq: $userId } }) {
                      id
                      accountnumber
                      accounttype
                      balance
                      userid
                    }
                  }`;
    const { data } = await axios.post (process.env.HASURA_ENDPOINT, { query, variables: { userId } }, { headers });
    res.json({ accounts: data.data.accounts });
  }
  catch (err) {
    res.status(500).json({ message: "Something went wrong!", reason: err.message });
  }
};

exports.updateAccountBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountNumber } = req.params;
    let { amount, transaction } = req.body;
    const query = `query GetAccountByNumber($accountNumber: String!, $userId: Int!) {
                    accounts(where: {
                      accountnumber: { _eq: $accountNumber },
                      userid: { _eq: $userId }
                    }) {
                      id
                      accountnumber
                      balance
                    }
                  }`;
    const { data } = await axios.post(process.env.HASURA_ENDPOINT, { query, variables: { accountNumber, userId } }, { headers });
    if (data.errors) {
      console.log(data.errors, 'in updation');
    }
    else {
      if (!data.data.accounts.length) return res.status(401).json({ message: "Couldn't perform transaction", reason: "You are not authorized." });
      else {
        let account = data.data.accounts[0];
        amount = +amount;

        if (transaction === 'withdrawal') {
          amount *= -1;
          if (amount > 0) return res.status(400).json({ message: "Withdrawal unsuccessful", reason: "Enter amount greater than zero!"});
          if (account.balance < Math.abs(amount)) return res.status(400).json({ message: "Withdrawal unsuccessful", reason: "Insufficient balance."});
        }
        else if (transaction === 'deposit' && amount <= 0) {
          return res.status(400).json({ message: "Deposit unsuccessful", reason: "Enter amount greater than zero!"});
        }

        const query = `mutation UpdateAccountBalance($account_id: Int!, $amount: numeric!, $userId: Int!) {
                        update_accounts(
                          where: { id: { _eq: $account_id },
                                    userid: { _eq: $userId }
                          },
                          _inc: { balance: $amount }
                        ) {
                            affected_rows
                        }
                      }`;

        const variables = {
          account_id: account.id,
          userId,
          amount
        };
        const response = await axios.post(process.env.HASURA_ENDPOINT, { query, variables }, { headers });
        if (response.data.errors) throw new Error(response.data.errors[0].message);
        account.balance += amount; 
        res.status(200).json({ message: "Transaction successful", account });
      }
    }
  }
  catch (err) {
    res.status(500).json({ message: "Update unsuccessful", reason: err.message });
  }
}