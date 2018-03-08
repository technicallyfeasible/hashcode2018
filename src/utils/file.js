import path from 'path';
import fs from 'fs';

const EXTENSION = '.in';

export function getFilesInFolder(folder) {
  return fs.readdirSync(folder)
    .filter(filename => filename.indexOf(EXTENSION) === filename.length - EXTENSION.length)
    .map(filename => path.resolve(path.join(folder, filename)));
}

export function readIn(filename) {
  const data = fs.readFileSync(filename);
  const rows = data.toString('utf8').split('\n');
  return rows.filter(Boolean).map(row => {
    return row.split(' ').map(num => parseInt(num, 10));
  });
}

export function writeOut(filename, rows) {
  let output = '';
  rows.forEach(row => {
    output += `${row.rides.length} `;
    output += row.rides.join(' ');
    output += '\n';
  });

  fs.writeFileSync(filename, output);
}
