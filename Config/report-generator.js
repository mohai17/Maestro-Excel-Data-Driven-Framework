const fs = require("fs");
const path = require("path");

const REPORT_DIR = process.argv[2];

if (!REPORT_DIR) {
    console.error("ERROR: Report folder not passed.");
    process.exit(1);
}

if (!fs.existsSync(REPORT_DIR)) {
    console.error("ERROR: Folder not found:");
    console.error(REPORT_DIR);
    process.exit(1);
}

console.log("Reading reports from:");
console.log(REPORT_DIR);

const OUTPUT_FILE = path.join(
    path.dirname(REPORT_DIR),
    "Combined_Report.html"
);

const files = fs.readdirSync(REPORT_DIR)
    .filter(file =>
        file.toLowerCase().endsWith(".html") &&
        file.toLowerCase() !== "combined_report.html"
    )
    .sort();

let passed = 0;
let failed = 0;
let unknown = 0;

const reportCards = files.map((file, index) => {

    const html = fs.readFileSync(
        path.join(REPORT_DIR, file),
        "utf8"
    );

let status = "UNKNOWN";
let badge = "badge-unknown";

const testResultMatch =
    html.match(/Test\s*Result\s*:?\s*(PASSED|FAILED)/i);

if (testResultMatch) {

    const testResult =
        testResultMatch[1].toUpperCase();

    if (testResult === "PASSED") {

        status = "PASS";
        badge = "badge-pass";
        passed++;

    } else {

        status = "FAIL";
        badge = "badge-fail";
        failed++;

    }

} else {

    const successCount =
        (html.match(/:\s*SUCCESS/gi) || []).length;

    const failedCount =
        (html.match(/:\s*FAILED/gi) || []).length;

    if (successCount > 0 && failedCount === 0) {

        status = "PASS";
        badge = "badge-pass";
        passed++;

    }
    else if (failedCount > 0) {

        status = "FAIL";
        badge = "badge-fail";
        failed++;

    }
    else {

        unknown++;

    }

}

console.log(
    `[${status}] ${file}`
);

    const escapedHtml = html
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;");

    return `
    <div class="report-card"
         data-file="${file.toLowerCase()}"
         data-status="${status}">

        <div class="card-header"
             onclick="toggleReport('report${index}')">

            <div class="report-name">
                📄 ${file}
            </div>

            <div>
                <span class="badge ${badge}">
                    ${status}
                </span>
            </div>

        </div>

        <div id="report${index}" class="report-content">

            <iframe
                id="frame${index}"
                srcdoc="${escapedHtml}"
                loading="lazy"
                onload="resizeFrame(this)">
            </iframe>

        </div>

    </div>
    `;
}).join("");

const total = files.length;

const passRate =
    total === 0
        ? 0
        : ((passed * 100) / total).toFixed(1);

const finalHtml = `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<title>Maestro Combined Report</title>

<style>

*{
    box-sizing:border-box;
}

body{
    margin:0;
    font-family:'Segoe UI',sans-serif;
    background:#f4f7fb;
}

.header{
    background:
        linear-gradient(
            135deg,
            #0f172a,
            #2563eb
        );
    color:white;
    padding:25px 35px;
}

.header h1{
    margin:0;
    font-size:30px;
}

.header p{
    margin-top:8px;
    opacity:.9;
}

.stats{
    padding:20px;
    display:grid;
    grid-template-columns:
        repeat(
            auto-fit,
            minmax(220px,1fr)
        );
    gap:20px;
}

.stat-card{
    background:white;
    border-radius:15px;
    padding:20px;
    box-shadow:
        0 4px 12px
        rgba(0,0,0,.08);
}

.stat-value{
    font-size:34px;
    font-weight:700;
}

.stat-label{
    margin-top:8px;
    color:#666;
}


.toolbar{
    padding:0 20px 20px;
}

.search-box{
    width:100%;
    padding:14px;
    border-radius:10px;
    border:1px solid #d1d5db;
    font-size:15px;
}

.filters{
    padding:0 20px 10px;
}

.filters button{
    margin-right:10px;
    padding:8px 14px;
    border:none;
    border-radius:8px;
    cursor:pointer;
    background:#2563eb;
    color:white;
}

.report-card{
    margin:20px;
    border-radius:15px;
    overflow:hidden;
    background:white;
    box-shadow:
        0 4px 12px
        rgba(0,0,0,.08);
}

.card-header{

    display:flex;
    justify-content:space-between;
    align-items:center;

    padding:18px;

    cursor:pointer;

    background:white;
}

.card-header:hover{
    background:#f8fafc;
}

.report-name{
    font-size:17px;
    font-weight:600;
}

.badge{
    color:white;
    font-size:13px;
    font-weight:bold;
    border-radius:20px;
    padding:7px 14px;
}

.badge-pass{
    background:#16a34a;
}

.badge-fail{
    background:#dc2626;
}

.badge-unknown{
    background:#64748b;
}

.report-content{
    display:none;
    background:white;
}

iframe{
    width:100%;
    border:none;
    min-height:300px;
    display:block;
}

.footer{
    padding:30px;
    color:#666;
    text-align:center;
}

</style>

<script>

function toggleReport(id){

    const el =
        document.getElementById(id);

    if(el.style.display==="block"){

        el.style.display="none";

    }else{

        el.style.display="block";

    }
}

function resizeFrame(frame){

    try{

        setTimeout(() => {

            const doc =
                frame.contentWindow.document;

            const height =
                Math.max(
                    doc.body.scrollHeight,
                    doc.documentElement.scrollHeight
                );

            frame.style.height =
                (height + 20) + "px";

        },300);

    }catch(e){}
}

function searchReports(){

    const value =
        document.getElementById("search")
        .value
        .toLowerCase();

    document
        .querySelectorAll(".report-card")
        .forEach(card=>{

            card.style.display =
                card.dataset.file.includes(value)
                ? "block"
                : "none";
        });
}

function filterStatus(status){

    document
        .querySelectorAll(".report-card")
        .forEach(card=>{

            if(
                status === "ALL" ||
                card.dataset.status === status
            ){
                card.style.display="block";
            }else{
                card.style.display="none";
            }

        });
}

</script>

</head>

<body>

<div class="header">

    <h1>Combined Execution Report</h1>

    <p>
        Generated:
        ${new Date().toLocaleString()}
    </p>

</div>

<div class="stats">

    <div class="stat-card">
        <div class="stat-value">${total}</div>
        <div class="stat-label">
            Total Executions
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-value">${passed}</div>
        <div class="stat-label">
            Passed
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-value">${failed}</div>
        <div class="stat-label">
            Failed
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-value">
            ${passRate}%
        </div>
        <div class="stat-label">
            Pass Rate
        </div>
    </div>

</div>


<div class="toolbar">

    <input
        id="search"
        class="search-box"
        type="text"
        placeholder="🔍 Search reports..."
        onkeyup="searchReports()">

</div>

<div class="filters">

    <button onclick="filterStatus('ALL')">
        All
    </button>

    <button onclick="filterStatus('PASS')">
        Passed
    </button>

    <button onclick="filterStatus('FAIL')">
        Failed
    </button>

</div>

${reportCards}

<div class="footer">
    Generated by Open Source Customized Report Generator
</div>

</body>
</html>
`;

fs.writeFileSync(
    OUTPUT_FILE,
    finalHtml,
    "utf8"
);

console.log("Combined report generated:");
console.log(OUTPUT_FILE);