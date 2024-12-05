const express = require("express")
const fs = require('fs')
const port = 8001
var data = require('./model.json')
const app = express()

app.use(express.urlencoded({extended:false}))

app.use((req,res,next)=>{
        fs.appendFile(
                'log.txt',`${Date.now()} : ${req.method} at ${req.path} by ip ${req.ip}\n`,
                (err,data)=>next()
        )      
})


app
        .route('/')
        .get((req,res)=>{
                return res.json(data)
        })
        


app     
        .route("/prev/:id")
        .get((req,res)=>{
                const id = Number(req.params.id)
                const user = data.previousLogs["singh."+id+"@iitj.ac.in"]
                const dates = Object.keys(user)

                const html = `<ol>
                                ${
                                        dates.map((date) => `
                                                                <li>
                                                                        date    : ${date}<br>
                                                                        jeans   : ${user[date].jeans}<br>
                                                                        tshirt  : ${user[date].tshirt}<br>
                                                                        jacket  : ${user[date].jacket}<br>
                                                                        pyjama  : ${user[date].pyjama}<br>
                                                                        shirt   : ${user[date].shirt}<br>
                                                                        <br>
                                                                </li>
                                                           `
                                                )
                                        .join("")
                                }
                                </ol>`

                return res.send(html)
        })


app
        .route("/last/:id")
        .get((req,res)=>{
                const id = Number(req.params.id)
                const dep = data.LastDeposit["singh."+id+"@iitj.ac.in"]
                return res.json(dep)                
        })

app
        .route("/dc/:id")
        .get((req,res)=>{
                const id = Number(req.params.id)
                const dc = data.DryCleaning["singh."+id+"@iitj.ac.in"]
                return res.json(dc)                
        })
        .post((req,res)=>{
                const body = req.body
                const id = req.params.id
                const d = getCurrentDate()
                body["date"] = d
                body["returnDate"] = getDateAfter7Days(new Date())
                
                data.DryCleaning["singh."+id+"@iitj.ac.in"] = body
                fs.writeFile('./model.json',JSON.stringify(data),(err,dat)=>{
                        return res.status(201).json({status:'completed'})
                })
        
        })

app
        .route("/addSlip/:id")
        .post((req,res)=>{
                const body = req.body
                const id = req.params.id
                const d = getCurrentDate()

                data.previousLogs["singh."+id+"@iitj.ac.in"][d] = body
                data.LastDeposit["singh."+id+"@iitj.ac.in"] = {}
                data.LastDeposit["singh."+id+"@iitj.ac.in"][d] = body
                fs.writeFile('./model.json',JSON.stringify(data),(err,dat)=>{
                        return res.status(201).json({status:'completed'})
                })
        })

        app
        .route("/addDC/:id")
        .post((req,res)=>{
                const body = req.body
                const id = req.params.id
                const d = getCurrentDate()
                body["date"] = d
                body["returnDate"] = getDateAfter7Days(new Date())
                
                data.DryCleaning[id] = body
                fs.writeFile('./model.json',JSON.stringify(data),(err,dat)=>{
                        return res.status(201).json({status:'completed'})
                })
        
        })



app.listen(port, ()=>console.log('server started at port : '+port))

function getCurrentDate(){
        var currentDate = new Date();

        // Extract year, month, and day
        var year = currentDate.getFullYear();
        var month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        var day = currentDate.getDate().toString().padStart(2, '0');

        // Format the date as yyyy-mm-dd
        var formattedDate = year + '-' + month + '-' + day;

        return formattedDate;
}

function getDateAfter7Days(currentDate) {
        // var currentDate = new Date();
        var targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7);

        var day = targetDate.getDate().toString().padStart(2, '0');
        var month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
        var year = targetDate.getFullYear().toString();

        var outputDate = year + '-' + month + '-' + day;

        return outputDate;
}

function convertDate(dateString) {                              //date string to date object
        var year = dateString.slice(0, 4);
        var month = dateString.slice(5, 7);
        var day = dateString.slice(8, 10);

        var targetDate = new Date(year,month-1,day);

        return targetDate;
}