'use strict'

const   multer = require('multer'),
        storage = multer.diskStorage({ 
            destination: function (req, file, cb) {
                cb(null, './uploads/')
            },
            filename: function (req, file, cb) {
                let datetimestamp = Date.now()
                cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
            }
        }),
        upload = multer({ 
            storage: storage,
            fileFilter : function(req, file, callback) { 
                if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                    return callback(new Error('Wrong extension type'))
                }
                callback(null, true);
            }
        }).single('file')

module.exports = {
    storage,
    upload
}