// const { PrismaClient, PrismaClientKnownRequestError } = require('@prisma/client');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const { v4: uuidv4 } = require('uuid');
// const logger = require('morgan');

// const prisma = new PrismaClient();

const app = express();

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, '../public')));

// Routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// /**
//  * Experimental route with SQL calls
//  * delete after testing
//  */
// const todosql_Router = require('./routes/todosql');
// app.use('/todosql', todosql_Router);

// app.get('/', authCheck, async (req, res) => {
//     console.log('/ authenticated state checker: ', res.locals.authenticated)
//     if(res.locals.authenticated) { 
//         return res.redirect('/dex') 
//     }
//     res.sendFile(path.join(__dirname, '../public/login.html'));
// })
  
// app.get('/cool', authCheck, async (req, res) => {
//     console.log('/ authenticated state checker: ', res.locals.authenticated)
//     res.sendFile(path.join(__dirname, '/web/cool.html'));
// })

// app.get('/dex', authCheck, async (req, res) => {
//     console.log('/ authenticated state checker: ', res.locals.authenticated)
//     if(!res.locals.authenticated) {
//         return res.redirect('/');;
//     }
//     res.sendFile(path.join(__dirname, '../public/dex.html'));
// })

// app.get('/admin', authCheck, async (req, res) => {
//     console.log('/ authenticated state checker: ', res.locals.authenticated)
//     if(!res.locals.authenticated || !res.locals.adminAccess) {
//         return res.redirect('/');;
//     }
//     res.sendFile(path.join(__dirname, '../public/admin.html'));
// })

// //404 route
// app.use((req, res, next) => {
//     res.sendfile(path.join(__dirname, '../public/404.html'))
// });

module.exports = app;
