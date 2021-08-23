const express = require('express')
const router = express.Router()
const db = require('../db')
const ExpressError = require("../ExpressError")

router.get('', async (req, res) => {

    const results = await db.query("SELECT * FROM industries ")

    let returnObj = {"industries": results.rows}

    return res.json(returnObj)
})


router.post('', async (req, res, next) => {
    try{
        //get the params for the code being searched
        let {code, industry} = req.body
        
        //get and await the results
        const results = await db.query("INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry", [code, industry])

        //if the results return none, throw a not found error
        if (results.rowCount == 0){
            throw new ExpressError("Unable to Create Entry", 500)
        }

        let returnObj = {"industry": results.rows[0]}
        
        //otherwise return the results
        return res.json(returnObj)
    } catch (err) {

        //catch and process the error
        return next(err)
    }

})

router.post('/:code', async (req, res, next) => {
    try{
        //get the params for the code being searched
        const industry = req.params.code
        let companyCode = req.body.company
        
        //get and await the results
        const results = await db.query("INSERT INTO companies_industries (ind_code, comp_code) VALUES ($1, $2) RETURNING ind_code, comp_code", [industry, companyCode])

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