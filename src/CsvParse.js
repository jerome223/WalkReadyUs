async function fetchAndParseCSV(csvFile) {
    const response = await fetch(csvFile);
    const csvText = await response.text();
    // Split the text into lines
    const lines = csvText.trim().split('\n');
    // Skip the header row and map the rest to points
    const points = lines.slice(1).map(line => {
      const parts = line.split(',');

      // Assuming the second and third columns are latitude and longitude, respectively
      // Adjust the indexing if your CSV structure is different
      return { lat: parseFloat(parts[2]), lng: parseFloat(parts[1]) };
    });
    return points;
  }
  
  export { fetchAndParseCSV };
  