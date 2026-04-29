// Path tolerance for stroke recognition (pixels)
const STROKE_TOLERANCE = 30;
const MIN_STROKE_LENGTH = 20;

export const calculateStrokeDistance = (point1, point2) => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getPointsAlongPath = (path) => {
  const points = [];
  let totalDistance = 0;
  
  for (let i = 0; i < path.length; i++) {
    if (i === 0) {
      points.push({ ...path[i], distance: 0 });
    } else {
      const dist = calculateStrokeDistance(path[i], path[i - 1]);
      totalDistance += dist;
      points.push({ ...path[i], distance: totalDistance });
    }
  }
  return points;
};

export const isStrokeValid = (userStroke, referencePath) => {
  if (userStroke.length < MIN_STROKE_LENGTH) return false;
  
  let matchedPoints = 0;
  for (const userPoint of userStroke) {
    const closestDistance = referencePath.reduce((min, refPoint) => {
      const dist = calculateStrokeDistance(userPoint, refPoint);
      return dist < min ? dist : min;
    }, Infinity);
    
    if (closestDistance <= STROKE_TOLERANCE) {
      matchedPoints++;
    }
  }
  
  const matchPercentage = (matchedPoints / userStroke.length) * 100;
  return matchPercentage >= 50;
};

export const calculateStrokeAccuracy = (userStroke, referencePath) => {
  if (userStroke.length < MIN_STROKE_LENGTH) return 0;
  
  let totalDistance = 0;
  let matchedPoints = 0;
  
  for (const userPoint of userStroke) {
    const closestDistance = referencePath.reduce((min, refPoint) => {
      const dist = calculateStrokeDistance(userPoint, refPoint);
      return dist < min ? dist : min;
    }, Infinity);
    
    totalDistance += Math.min(closestDistance, STROKE_TOLERANCE);
    if (closestDistance <= STROKE_TOLERANCE) {
      matchedPoints++;
    }
  }
  
  const accuracy = (matchedPoints / userStroke.length) * 100;
  return Math.round(accuracy);
};

// Sample reference paths for common letters/numbers (normalized coordinates 0-1)
export const tracingPaths = {
  'A': [
    { x: 0.3, y: 0.9 }, { x: 0.5, y: 0.1 }, { x: 0.7, y: 0.9 }, // triangle outline
    { x: 0.35, y: 0.6 }, { x: 0.65, y: 0.6 }, // horizontal line
  ],
  'B': [
    { x: 0.2, y: 0.1 }, { x: 0.2, y: 0.9 }, // left line
    { x: 0.2, y: 0.1 }, { x: 0.65, y: 0.1 }, { x: 0.65, y: 0.45 }, { x: 0.2, y: 0.45 }, // top bump
    { x: 0.2, y: 0.45 }, { x: 0.7, y: 0.45 }, { x: 0.7, y: 0.9 }, { x: 0.2, y: 0.9 }, // bottom bump
  ],
  '1': [
    { x: 0.3, y: 0.2 }, { x: 0.5, y: 0.1 }, // top diagonal
    { x: 0.5, y: 0.1 }, { x: 0.5, y: 0.9 }, // vertical line
    { x: 0.3, y: 0.9 }, { x: 0.7, y: 0.9 }, // base line
  ],
  '2': [
    { x: 0.2, y: 0.2 }, { x: 0.7, y: 0.2 }, { x: 0.7, y: 0.45 }, { x: 0.2, y: 0.45 },
    { x: 0.2, y: 0.45 }, { x: 0.7, y: 0.45 }, { x: 0.2, y: 0.9 }, { x: 0.7, y: 0.9 },
  ],
  'circle': [
    { x: 0.5, y: 0.1 }, { x: 0.75, y: 0.25 }, { x: 0.85, y: 0.5 }, 
    { x: 0.75, y: 0.75 }, { x: 0.5, y: 0.9 }, { x: 0.25, y: 0.75 }, 
    { x: 0.15, y: 0.5 }, { x: 0.25, y: 0.25 }, { x: 0.5, y: 0.1 },
  ],
  'square': [
    { x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, { x: 0.8, y: 0.8 }, { x: 0.2, y: 0.8 }, { x: 0.2, y: 0.2 },
  ],
};