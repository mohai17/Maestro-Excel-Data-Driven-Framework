# Maestro Excel Data-Driven Framework

🚀 Enable Excel-Based Data-Driven Testing in Maestro Mobile Automation

Official Maestro does not natively support Excel data-driven testing. This framework extends Maestro's capabilities by automatically converting Excel test data into JavaScript data providers that can be consumed directly inside Maestro YAML flows.

With this framework, automation engineers can maintain test data in Excel sheets and execute the same Maestro flow with multiple datasets without manually editing YAML files.

---

## Features

- ✅ Excel-based test data management
- ✅ Automatic JSON generation from Excel sheets
- ✅ Automatic JavaScript data provider generation
- ✅ Seamless integration with Maestro flows
- ✅ No modification required in Maestro itself
- ✅ Supports multiple Excel files and sheets
- ✅ Easy setup and execution
- ✅ HTML reporting support
- ✅ Open-source and customizable


---

## Project Structure

```text
Maestro-Excel-Data-Driven-Framework/
│
├── Config/
│
├── Flows/
│   └── example.yaml
│
├── JsonData/
│   └── ExampleData/
│       ├── Example_LoginData.json
│       └── Example_LogoutData.json
│
├── node_modules/
│
├── Reports/
│   └── maestro-report.html
│
├── Scripts/
│   └── ExampleData/
│       ├── Example_LoginData.js
│       └── Example_LogoutData.js
│
├── TestData/
│   └── ExampleData.xlsx
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── run.bat
```

---

## Prerequisites

Before using the framework, make sure you have:

- `Maestro Studio` and `Maestro CLI` installed
- Node.js installed
- Java installed (required by Maestro)
- A mobile device or emulator connected
- Microsoft Excel file containing test data
- Windows OS (for `run.bat` execution)

---

## Installation & Setup

### 1. Clone the Repository

Clone the framework inside your Maestro Studio project source folder.

---

### 2. Open Maestro Studio

Launch Maestro Studio.

---

### 3. Connect Your Mobile Device

Connect your Android or iOS device and verify that Maestro detects the device successfully.

---

### 4. Add Test Data

Place your Excel file inside the `TestData` directory.

Example:

```text
TestData/
└── LoginData.xlsx
```

---

### 5. Create a Maestro YAML Flow

Create a new Maestro YAML flow inside the `Flows` folder.

Example:

```yaml
appId: com.example.app

---
- launchApp
```

---

### 6. Add the Data Provider Script

Add a `runScript` command to your Maestro YAML flow.

#### Syntax

#### Example

```yaml
- runScript: "../Scripts/ExampleData/Example_LoginData.js"
```

### Important Notes

- `ExampleData` is the Excel file name without the `.xlsx` extension.
- `Example_LoginData.js` is the generated JavaScript data provider.
- The framework automatically:
  - Reads data from Excel sheets.
  - A folder will be automatically generated using the `Excel file name`. For each `worksheet` in the Excel file, separate `JavaScript (.js) and JSON (.json) files` will be generated.  
  - Generates JSON files inside the `JsonData` directory.
  - Generates JavaScript data provider files inside the `Scripts` directory.


Generated structure:

```text
JsonData/
└── ExampleData/
    ├── Example_LoginData.json
    └── Example_LogoutData.json

Scripts/
└── ExampleData/
    ├── Example_LoginData.js
    └── Example_LogoutData.js
```

---

### 7. Execute the Framework

Open the project directory and double-click:

```text
run.bat
```

Or run manually:

```cmd
run.bat
```

The framework will automatically:

1. Read Excel test data.
2. Generate JSON files.
3. Generate JavaScript data provider files.
4. Execute the Maestro flow.
5. Run the automation on the connected mobile device.
6. Generate an HTML execution report.

---

## Example Excel Data

### TestData/ExampleData.xlsx

| Username | Password |
|----------|-----------|
| user1 | pass1 |
| user2 | pass2 |
| user3 | pass3 |

---

## Example YAML Usage

```yaml
appId: com.example.app

---
- runScript: "../Scripts/ExampleData/Example_LoginData.js"

- tapOn: "Username"

- inputText: ${output.Username}

- tapOn: "Password"

- inputText: ${output.Password}

- tapOn: "Login"
```

---

## Generated Files

After execution, the framework automatically creates:

### JSON Data

```text
JsonData/
└── ExampleData/
    └── Example_LoginData.json
```

### JavaScript Data Provider

```text
Scripts/
└── ExampleData/
    └── Example_LoginData.js
```

### HTML Report

```text
Reports/
└── maestro-report.html
```

---

## Why Use This Framework?

### Without This Framework

- ❌ Maestro does not natively support Excel-based data-driven testing.
- ❌ Test data must be maintained manually.
- ❌ Difficult to manage large datasets.
- ❌ Requires duplication of flows.

### With This Framework

- ✅ Maintain test data in Excel.
- ✅ Reuse the same Maestro flow.
- ✅ Automatically generate data providers.
- ✅ Easy test maintenance.
- ✅ Better scalability.
- ✅ Faster automation execution.
- ✅ Cleaner and more organized test data management.

---

## Example Workflow

```text
1. Place Excel file in TestData folder
             │
             ▼
2. Run Framework
             │
             ▼
3. JSON Files Generated
             │
             ▼
4. JavaScript Data Providers Generated
             │
             ▼
5. Maestro Flow Executes
             │
             ▼
6. HTML Report Generated
```

---

## How It Works

The framework follows the workflow below:

```text
Excel File (.xlsx)
       │
       ▼
Framework Reads Excel Data
       │
       ▼
Generates JSON Files
       │
       ▼
Generates Maestro JavaScript Data Providers
       │
       ▼
Maestro YAML Flow Uses runScript
       │
       ▼
Flow Executes on Connected Device
       │
       ▼
HTML Report Generated
```

---

## Contributing

Contributions are welcome!

If you would like to improve this project:

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your changes.
5. Submit a Pull Request.

---

## Issues & Feature Requests

Found a bug?

Have a feature suggestion?

Please create an issue in the GitHub repository.

---

## License

This project is licensed under the MIT License.

---

## Author

**Md. Mohai Minul Islam**

Software QA Engineer | Test Automation Engineer

Email: mohai.cse@gmail.com

Built to bring Excel Data-Driven Testing capabilities to the Maestro ecosystem.

---

## Support the Project

If this project helps you and saves your team time, please consider giving it a ⭐ Star on GitHub.

Your support helps improve and maintain the framework for the Maestro community.