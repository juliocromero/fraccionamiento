var cron = require("node-cron");
const Voucher = use("App/Models/Voucher");
var moment = require('moment');
//const UtilAlarma = use('../App/Utils/Alarma');


cron.schedule("* * */23 * * *", async function () {
    const fech = moment().format('YYYY-MM-DD HH:mm:ss')
    let voucher = await Voucher.query().where('status', 1).fetch()
    voucher = voucher.toJSON();
    voucher.forEach( async item => { 
        if (item.expiration_date <= fech) {         
            let voucher_id = await Voucher.findOrFail(item.id);
            voucher_id.status = 2
            await voucher_id.save()
           // const alar =  await UtilAlarma.newAviso(`voucher vecido ${voucher_id.sap}`, null)
        }  
    });
    console.log("Servicio ejecutandose control de Vouchers ", moment().format('HH:mm:ss'));
});
