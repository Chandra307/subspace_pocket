const token = localStorage.getItem("token");

document.addEventListener('DOMContentLoaded', async function() {
    try {
        if (!token) {
            alert('Login again');
            window.location.href = './login.html';
        }
        const { data } = await axios.get('/user/account', { headers: { "Authorization": token } });
        const accounts = data.accounts;
        
        const accountSelect = document.getElementById('account');
        
        const tableBody = document.querySelector('#accounts-table tbody');
        tableBody.innerHTML = '';
  
        accounts.forEach(account => {
            const row = document.createElement('tr');
            row.id = "acc-" + account.id;
            row.innerHTML = `
            <td>${account.accountnumber}</td>
            <td>${account.accounttype}</td>
            <td>${account.balance}</td>
            `;
            tableBody.appendChild(row);
        });

        document.getElementById('transaction-form').onclick = async function (event) {
            try {
                event.preventDefault();
                const accountNumber = event.currentTarget.querySelector('#account-id').value;
                const amount = event.currentTarget.querySelector('#amount').value;

                let transaction;
                if (event.target.id === 'deposit-btn') transaction = 'deposit';
                else if (event.target.id === 'withdraw-btn') transaction = 'withdrawal';
                if (transaction) {

                    if (!accountNumber || !amount) alert("Please do enter account number and amount!");
                    else {

                        const { data } = await axios.put(
                            `/user/account/${accountNumber}`,
                            { amount, transaction },
                            { headers: { "Authorization": token }
                        });
                        this.reset();
                        const tableBody = document.querySelector('#accounts-table tbody');
                        const id = 'acc-'+ data.account.id;
                        const row = document.getElementById(id);
                        alert(data.message);
                        row.lastElementChild.innerHTML =  data.account.balance;
                    }

                }
            }
            catch (err) {
                console.log(err);
                alert(err.response.data.reason);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
});

document.getElementById('logout').onclick = () => {
    localStorage.removeItem('token');
    window.location.href = './login.html';
}
