const express = require('express')
const router = express.Router()
const db = require('../db')
const ExpressError = require("../ExpressError")

router.get('', async (req, res) => {

    const results = await db.query("SELECT * FROM invoices")

    let returnObj = {"invoices": results.rows}

    return res.json(returnObj)
})

router.get('/:id', async (req, res, next) => {
    try{
        //get the params for the code being searched
        const id = req.params.id
        
        //get and await the results
        const results = await db.query("SELECT * FROM invoices WHERE id=$1", [id])

        //if the results return none, throw a not found error
        if (results.rowCount == 0){
            throw new ExpressError("Not Found", 404)
        }

        let returnObj = {"invoice": results.rows[0]}
        
        //otherwise return the results
        return res.json(returnObj)
    } catch (err) {

        //catch and process the error
        return next(err)
    }

})

router.post('', async (req, res, next) => {
    try{
        //get the params for the code being searched
        let {comp_code, amt} = req.body
        
        //get and await the results
        const results = await db.query("INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, add_date, paid_date", [comp_code, amt])

        //if the results return none, throw a not found error
        if (results.rowCount == 0){
            throw new ExpressError("Unable to Create Entry", 500)
        }

        let returnObj = {"invoice": results.rows[0]}
        
        //otherwise return the results
        return res.json(returnObj)
    } catch (err) {

        //catch and process the error
        return next(err)
    }

})

router.put('/:id', async (req, res, next) => {
    try{
        //get the params for the code being searched
        const id = req.params.id
        let {amt, paid} = req.body
        let paidDate
        
        //get and await the results
        const currentInvoice = await db.query("SELECT * FROM invoices WHERE id=$1", [id])

        if (!currentInvoice.rows[0].paid && paid){
            paidDate = new Date
        } else if (currentInvoice.rows[0].paid && !paid) {
            paidDate = null
        } else if (currentInvoice.rows[0].paid_date != null){
            paidDate = currentInvoice.rows[0].paid_date
        }

        const results = await db.query("UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date", [amt, paid, paidDate, id])

        //if the results return none, throw a not found error
        if (results.rowCount == 0){
            throw new ExpressError("Not Found", 404)
        }

        //build the return object properly
        let returnObj = {"invoice": results.rows[0]}
        
        //otherwise return the results
        return res.json(returnObj)
    } catch (err) {

        //catch and process the error
        return next(err)
    }

})

router.delete('/:id', async (req, res, next) => {
    try{
        //get the params for the code being searched
        const id = req.params.id
        
        //get and await the results
        const results = await db.query("DELETE FROM invoices WHERE id=$1", [id])

        //if the results return none, throw a not found error
        if (results.rowCount == 0){
            throw new ExpressError("Not Found", 404)
        }

        return res.json({"status": "deleted"})
    } catch (err) {

        //catch and process the error
        return next(err)
    }

})

module.exports = router;