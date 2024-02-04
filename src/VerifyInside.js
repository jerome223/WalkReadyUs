// VerifyInside.js

export function isPointInsidePolygon(point, polygonCoordinates) {
    const x = point[0];
    const y = point[1];
  
    let inside = false;
    for (let i = 0, j = polygonCoordinates.length - 1; i < polygonCoordinates.length; j = i++) {
      const xi = polygonCoordinates[i].lat;
      const yi = polygonCoordinates[i].lng;
      const xj = polygonCoordinates[j].lat;
      const yj = polygonCoordinates[j].lng;
  
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    
    return inside;
  }
  