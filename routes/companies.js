const express = require('express')
const router = express.Router()
const db = require('../db')
const ExpressError = require("../ExpressError")

router.get('', async (req, res) => {

    const results = await db.query("SELECT * FROM companies")

    let returnObj = {"companies": results.rows}

    return res.json(returnObj)
})

router.get('/:code', async (req, res, next) => {
    try{
        //get the params for the code being searched
        const code = req.params.code
        
        //get and await the results
        const invoices = await db.query("SELECT * FROM invoices where comp_code=$1", [code])
        const results = await db.query("SELECT * FROM companies WHERE code=$1", [code])

        //if the results return none, throw a not found error
        if (results.rowCount == 0){
            throw new ExpressError("Not Found", 404)
        }

        let returnObj = {"company": results.rows[0]}
        returnObj.company['invoices'] = invoices.rows
        
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
        let {name, description, code} = req.body
        
        //get and await the results
        const results = await db.query("INSERT INTO companies (name, description, code) VALUES ($1, $2, $3) RETURNING code, name, description", [name, description, code])

        //if the results return none, throw a not found error
        if (results.rowCount == 0){
            throw new ExpressError("Unable to Create Entry", 500)
        }

        let returnObj = {"company": results.rows[0]}
        
        //otherwise return the results
        return res.json(returnObj)
    } catch (err) {

        //catch and process the error
        return next(err)
    }

})

router.put('/:code', async (req, res, next) => {
    try{
        //get the params for the code being searched
        const code = req.params.code
        let {name, description} = req.body
        
        //get and await the results
        const results = await db.query("UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description", [name, description, code])

        //if the results return none, throw a not found error
        if (results.rowCount == 0){
            throw new ExpressError("Not Found", 404)
        }

        //build the return object properly
        let returnObj = {"company": results.rows[0]}
        
        //otherwise return the results
        return res.json(returnObj)
    } catch (err) {

        //catch and process the error
        return next(err)
    }

})

router.delete('/:code', async (req, res, next) => {
    try{
        //get the params for the code being searched
        const code = req.params.code
        
        //get and await the results
        const results = await db.query("DELETE FROM companies WHERE code=$1", [code])

        //if the results return none, throw a not found error
        if (results.rowCount == 0){
            throw new ExpressError("Not Found", 404)
        }

        // let results = {"company": results.rows}
        
        //otherwise return the results
        return res.json({"status": "deleted"})
    } catch (err) {

        //catch and process the error
        return next(err)
    }

})

module.exports = router;