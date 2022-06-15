
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import fs from 'fs';

export default class EmailSenderService
{
    constructor(){

    }

    getTransporter() : nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : 'sundayluckyenyinnadeveloper@gmail.com',
                pass : '123456Professor??'
            }
        });

        return transporter;
    }

    getMailOptions( payload : Object | any  ) {
        const mailOptions = {
            from : 'Quatron@springarr.development.backup',
            sender : 'Quatron@springarr.development.backup',
            to : payload.emails,
            subject : payload.subject,
            html: payload.html,
            text : payload.text,
            attachments:[
                {
                    filename : payload.filename + '.zip',
                    content : fs.createReadStream( payload.zipFilePath )
                }
            ]
        };
        // console.log( mailOptions );
        return mailOptions;
    }

    async sendEmail( payload : Object | any ) : Promise<boolean> {
        
        let success : boolean = false;
        try{
            const sentInfo = await this.getTransporter().sendMail( this.getMailOptions( payload ));
            console.log( sentInfo );
            success = true;
        }catch( error ){
            console.log( error )
            success = false;
        }

        return success;
    }


}