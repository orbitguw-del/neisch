const fs = require('fs');
const head = Buffer.from(
  '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  '<title>EOSS Dealer Credit-Note Tool</title>\n<script>\n', 'utf8');
const lib = fs.readFileSync('C:/consne/node_modules/xlsx/dist/xlsx.full.min.js');
const mid = Buffer.from('\n</script>\n', 'utf8');
const tail = fs.readFileSync('C:/consne/eoss_tail.html');
const out = Buffer.concat([head, lib, mid, tail]);
fs.writeFileSync('C:/Users/model/Downloads/EOSS-CN-Tool.html', out);

// sanity: no raw HTML entities inside the app <script> block
const txt = out.toString('utf8');
const appStart = txt.lastIndexOf('<script>');
const ents = txt.slice(appStart).match(/&(?:amp|lt|gt|mdash|rarr|le|ge);/g);
console.log('Output bytes:', out.length, '| app-block HTML entities:', ents ? ents.join(',') : 'none');
