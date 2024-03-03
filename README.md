# Whatsapp_automation
This will send automated messages through whatsapp

To get started:

1) Make sure npm is installed
2) Run command: `npm install`
3) Run the app using: `node .\app.js`

```
Usage: whatsapp_automation_tool.exe [options]
Options:
  --workbook <path>      Path to the Excel workbook file
  --message <path>       Path to the message template file
  --chrome-path <path>   Path to to Chrome.exe
  --help                 Display this help message and exit
```

The workbook should have columns 'Mobile' for phone numbers and 'Fullname' for names.

To create the package:
`pkg . --targets node14-win-x64 --output whatsapp_automation_tool.exe`
