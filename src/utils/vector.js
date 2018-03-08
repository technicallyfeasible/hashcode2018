export function distance(start, end) {
  return Math.abs(end.row - start.row) + Math.abs(end.col - start.col);
}

export function equals(start, end) {
  return start.row === end.row && start.col === end.col;
}

export function move(start, end, distance) {
  let position = {
    ...start,
  };
  let remaining = distance;
  const rows = Math.abs(end.row - start.row);
  const cols = Math.abs(end.col - start.col);

  if (rows > 0) {
    const toMove = Math.min(remaining, rows);
    position.row += Math.sign(end.row - start.row) * toMove;
    remaining -= toMove;
  }
  if (cols > 0) {
    const toMove = Math.min(remaining, cols);
    position.col += Math.sign(end.col - start.col) * toMove;
    remaining -= toMove;
  }
  if (remaining < 0) {
    console.error('This is awkward, we moved more than we should have!', remaining, start, end, position);
  }
  return position;
}
