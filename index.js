const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set up FreshSales CRM API key and base URL
const API_KEY = 'cV33FFhqbnnEMz2tFDHlkQ';
const BASE_URL = 'https://domain.freshsales.io/api';

// set up MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shankar8331',
  database: 'contactdatabase'
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('MySQL database connected');
  }
});

// create a contact and store in MySQL database
app.post('/contact/createContact/:data_store', async (req, res) => {
  try {
    const { data_store } = req.params;
    const { email, first_name,last_name, mobile_number} = req.body;
    if (data_store == 'CRM') {

        const response = await axios.post(`${BASE_URL}/contacts`, {
            contact: {
              email: email,
              first_name: first_name,
              last_name: last_name,
              mobile_number: mobile_number
            },
          }, {
            headers: {
              Authorization: `Token token=${API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('Contact created and stored in CRM');
          res.status(201).json(response.data);
    } 
    else if( data_store == 'DATABASE'){

    const insertQuery = 'INSERT INTO contacts (first_name, last_name, email, mobile_number) VALUES ( ?, ?, ?, ?)';
    const values = [first_name, last_name, email, mobile_number];
    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
      } else {
        console.log('Contact created and stored in MySQL database');
        res.status(201).json(result);
      }
    });
}
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// retrieve a contact from FreshSales CRM API and MySQL database
app.get('/contact/getContact/:id/:data_store', async (req, res) => {
  try {
    const { id, data_store } = req.params;

    if (data_store == 'CRM'){

            const response = await axios.get(`${BASE_URL}/contacts/${id}`, {
              headers: {
                Authorization: `Token token=${API_KEY}`,
                'Content-Type': 'application/json',
              },
            });
            console.log('Contact retrieved from FreshSales CRM API');
            res.status(200).json(response.data);

    }
    else if (data_store == 'DATABASE'){
            const selectQuery = 'SELECT * FROM contacts WHERE id = ?';
            db.query(selectQuery, [id], async (err, result) => {
            if (err) 
            {
                console.log(err);
                res.status(500).json({ message: 'Internal server error' });
            } 
            else 
            {
                if (result.length > 0) 
                {
                    console.log('Contact retrieved from MySQL database');
                    res.status(200).json(result[0]);
                }
            }
            });
        } 
    }
    catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// --------------------UPDATE--------------------------

// update a contact in FreshSales CRM API and MySQL database
app.put('/contact/updateContact/:id/:data_store', async (req, res) => {
    try {
      const { id, data_store } = req.params;
      const { email, mobile_number} = req.body;

      if (data_store == 'CRM')
      {

            const response = await axios.put(`${BASE_URL}/contacts/${id}`, {
                contact: {
                    email: email,
                    mobile_number: mobile_number
                },
                headers: {
                Authorization: `Token token=${API_KEY}`,
                'Content-Type': 'application/json',
                }
            });
            console.log('Contact retrieved from FreshSales CRM API');
            res.status(200).json(response.data);
            
      }

      else if (data_store == 'DATABASE'){

            const updateQuery = 'UPDATE contacts SET email=? , mobile_number=? where id = ?'
            db.query(updateQuery, [email,mobile_number,id], async (err, result) => {
                if (err) {
                console.log(err);
                res.status(500).json({ message: 'Internal server error' });
                } else {
                if (result.changedRows > 0) {
                    console.log('Contact Updated MySQL database');
                    res.status(200).json(result[0]);
                } 
                }
            });
      }

    } // Try Block of Update/PUT Ends
    catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

//   ------------------------ DELETE------------------------------
  
  // delete a contact
  app.delete('/contact/deleteContact/:id/:data_store', async (req, res) => {
    try {
        const { id, data_store} = req.params;

        if (data_store == 'CRM')
         {

            const response = await axios.delete(`${BASE_URL}/contacts/${id}`, {
                headers: {
                Authorization: `Token token=${API_KEY}`,
                'Content-Type': 'application/json',
                },
            });
            res.status(204).json(response.data);

         }
 
        else if( data_store == 'DATABASE')
        {
                const deleteQuery = 'DELETE contacts where id=?'
                db.query(deleteQuery, [id] , async (err, result) =>
                {
                    if(err)
                    {
                        console.log(err);
                        res.status(500).json({ message: 'Internal server error' });
                    }
                    else
                    {
                        if (result.affectedRows > 0) 
                        {
                            console.log('Contact Updated MySQL database');
                            res.status(200).json(result[0]);
                        } 
                    }
                }
                )
        }

    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


  // start the server
  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });