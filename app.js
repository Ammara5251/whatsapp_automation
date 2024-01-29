const { Client, LocalAuth } = require('./index');
const xlsx = require('xlsx');
const fs = require('fs').promises;

// Function to display usage information
function displayHelp() {
    console.log(`Usage: whatsapp_automation_tool.exe [options]
Options:
  --workbook <path>      Path to the Excel workbook file
  --message <path>       Path to the message template file
  --chrome-path <path>   Path to to Chrome.exe
  --help                 Display this help message and exit

The workbook should have columns 'Mobile' for phone numbers and 'Fullname' for names.`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const workbookArgIndex = args.indexOf('--workbook');
const chromePathArgIndex = args.indexOf('--chrome-path');
const chromeExecutablePath = chromePathArgIndex !== -1 ? args[chromePathArgIndex + 1] : null;

const messageArgIndex = args.indexOf('--message');
const helpArgIndex = args.indexOf('--help');

if (helpArgIndex !== -1 || args.length === 0) {
    displayHelp();
    process.exit(0);
}

const workbookPath = workbookArgIndex !== -1 ? args[workbookArgIndex + 1] : 'DataUpdateIncomplete.xlsx';
const messagePath = messageArgIndex !== -1 ? args[messageArgIndex + 1] : 'DataUpdate.txt';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        executablePath: chromeExecutablePath
    },
    userDataDir: './cache'
});

client.initialize();

client.on('ready', async () => {
    console.log('Client is ready!');

    // Load the Excel file
    const workbook = xlsx.readFile(workbookPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Check if the columns exist
    if (data.length > 0) {
        const sampleRow = data[0];
        if (!sampleRow.hasOwnProperty('Mobile') || !sampleRow.hasOwnProperty('Fullname')) {
            console.error('Error: The specified columns "Mobile" or "Fullname" were not found in the workbook.');
            process.exit(1);
        }
    } else {
        console.error('Error: No data found in the workbook.');
        process.exit(1);
    }

    // Read the message from the text file
    const messageTemplate = await fs.readFile(messagePath, 'utf8');

    for (const row of data) {
        const phoneNumber = String(row.Mobile); // Replace 'Mobile' with your column name for phone numbers
        const formattedNumber = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
        let fullName = String(row.Fullname); // Replace 'Fullname' with your column name for full names

        // Extract name up to the first occurrence of 'bhai' or 'bai'
        const regex = /(.*?\b(bhai|bai)\b)/i;
        const match = fullName.match(regex);
        if (match && match[0]) {
            fullName = match[0];
        }

        // Customize the message with the recipient's full name
        const personalizedMessage = messageTemplate.replace('{fullname}', fullName.trim());

        // Send the message
        await client.sendMessage(formattedNumber, personalizedMessage);
        console.log(`Message sent to ${phoneNumber}`);

        // Random delay between 10 to 30 seconds
        const delay = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
        console.log(`Waiting for ${delay} milliseconds`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // After sending all messages, close the client
    await client.destroy();
    console.log('Client closed.');
});