const express = require("express");
const app = express();
const storage = require("node-persist");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

app.use(cors());
app.use(express.json());


(async () => {
    await storage.init({
        forgiveParseErrors: true
    });

 })();


 const storages = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const unquie = Date.now() + '-' +  Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + unquie + ext)
    }
 })

 const upload = multer({storage : storages})


app.post("/GiveitemstoServersides", upload.single('image'),async (req, res) => {
    const { name , price } = req.body
    let data = await storage.getItem("UploadData") || [];
    data.push({
        filename : req.file.filename,
        filetype : req.file.mimetype,
        ProductName : name,
        ProductPrice : price
    })
    await storage.setItem("UploadData", data)
    res.status(200).json({done : true})
})

app.post("/RemoveDataFromObjects", async (req, res) => {
    let data = await storage.getItem("UploadData") || [];
    let done = false
    data.forEach((items, index) => {
        if (items.ProductName === req.body.cb)
        {
            const pathfile = path.join(__dirname, 'uploads', items.filename) 
            fs.unlink(pathfile, (err) => {if (err) {return}})
            data.splice(index, 1)
            done = true
        }
    })

    if (done) {
        res.status(200).json({done : true})
        await storage.setItem("UploadData", data)
    }
})


app.post("/Checkifcorrectornot", async (req,res) => {
    let Database = await storage.getItem("LoginSystem") || [];
    let found = false
    let newrole = ""
    Database.forEach((items) => {
        if (items.Username === req.body.Username && items.Password === req.body.Password) {
            found = true
            newrole = items.Role
        }
    })

    if (found === true) {
        res.status(200).json({done : true, newrole : newrole})
    } else {
        res.status(200).json({done : false})
    }
})

app.post("/ReomveUsersFromhost", async (req, res) => {
    let Database = await storage.getItem("LoginSystem") || [];
    let found = false
    Database.forEach((items, index) => {
        if (items.Username === req.body.Username) {
            Database.splice(index, 1)
            found = true
        }
    })
    if (found === true) {
        res.status(200).json({done : true})
        await storage.setItem("LoginSystem", Database)
    }
})

app.post("/GetLoginHistory", async (req, res) => {
    let Database = await storage.getItem("LoginSystem") || [];
    let found = false

    Database.forEach((items) => {
        if (items.Username === req.body.data.Username) {
            found = true
        }
    })
    
    res.status(200).json({datas : Database, found : found})
    
})

app.post("/SetUserNameNew", async (req, res) => {
    let Database = await storage.getItem("LoginSystem") || [];
    let found = false

    Database.forEach((items) => {
        if (items.Username === req.body.Username) {
            found = true
            return res.status(200).json({message: "هذا المستخدم موجود بل فعل"})
        }
    })

    if (!found) {
        Database.push({
            Username : req.body.Username,
            Password : req.body.Password,
            Role : req.body.Role
        })
        res.status(200).json({done : true})
        await storage.setItem("LoginSystem", Database)
    }
})

app.post("/RemoveProductFromLists", async(req, res) => {
    let Menulist = await storage.getItem("MenuListData") || [];
    let found = false
    Menulist.forEach((items, index) => {
        if (items.Details === req.body.Details && Number(items.price) === Number(req.body.price)) {
            Menulist.splice(index, 1)
            found = true
        }
    })
    
    res.status(200).json({done : found})
    await storage.setItem("MenuListData", Menulist)    
})

app.post("/GetDataUploadsOfdata", async (req, res) => {
    let data = await storage.getItem("UploadData") || [];
    let LoginData = await storage.getItem("LoginSystem") || [];
    let Menulist = await storage.getItem("MenuListData") || [];
    let found = false
    console.log("hello world")
    LoginData.forEach((items) => {
        console.log(items.Username)
        console.log(req.body.data.Username)
        if (items.Username === req.body.data.Username) {
            found = true
        }
    })

    const dataupload = [];
    data.forEach((items) => {
        const imagePath = path.join(__dirname, 'uploads', items.filename);
        const datafile = fs.readFileSync(imagePath)
        const convartbase64 = datafile.toString("base64")
        dataupload.push({
            image: `data:${items.filetype};base64,${convartbase64}`,
            ProductName  : items.ProductName,
            ProductPrice: items.ProductPrice  
        })
       /* dataupload.push({
            file : items.filename,
            ProductName : items.ProductName,
            ProductPrice: items.ProductPrice
        })*/
    })

    if (!found) {
        res.status(200).json({data : dataupload, OrdersList : Menulist, found : false})
    }

    if (found === true) { 
        res.status(200).json({data : dataupload, OrdersList : Menulist, found : true})
    }
    
})
 
app.post("/MenuDetailsDataGetitNow", async (req, res) => {
    let data = await storage.getItem("MenuListData") || []
    let found = false
    data.forEach((items) => {
        if (data.length !== 0) {
            if (items.ip === req.body.ip) {
                 res.status(200).json({error : "erorr"})
                 found = true
                 return
            }
        }
    });

    if (!found) {
        data.push({
            ip : req.body.ip,
            name : req.body.name,
            Details : req.body.Details,
            count : req.body.count,
            Location : req.body.location,
            price : req.body.price
           })
       
           await storage.setItem("MenuListData", data)
           res.status(200).json({done : "done"})
    }
}) 


app.listen(4126, () => {
    console.log("Server is Ready")
})

 
