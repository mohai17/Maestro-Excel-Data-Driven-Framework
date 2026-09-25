// Auto-generated setup file for Example_LoginData
var response = http.get('http://localhost:8080/Example_LoginData');
var data = response && response.body ? JSON.parse(response.body) : [];

var index = typeof ROW_NO != 'undefined' ? parseInt(ROW_NO, 10) - 1 : 0;
var row = Array.isArray(data) ? data[index] : null;

if (row) {
  Object.keys(row).forEach(function(key) {
    output[key] = row[key] != null ? String(row[key]) : "";
  });
}
