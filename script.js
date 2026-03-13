// Configuration des couleurs pour chaque polluant
const pollutantColors = {
    co: {
        line: 'rgba(255, 99, 132, 1)',
        fill: 'rgba(255, 99, 132, 0.2)',
        label: 'CO (ppm)'
    },
    pm25: {
        line: 'rgba(75, 192, 192, 1)',
        fill: 'rgba(75, 192, 192, 0.2)',
        label: 'PM2.5 (μg/m³)'
    },
    pm10: {
        line: 'rgba(153, 102, 255, 1)',
        fill: 'rgba(153, 102, 255, 0.2)',
        label: 'PM10 (μg/m³)'
    },
    co2: {
        line: 'rgba(255, 159, 64, 1)',
        fill: 'rgba(255, 159, 64, 0.2)',
        label: 'CO₂ (ppm)'
    }
};

let chart;
let measurementData = {
    timestamps: [],
    co: [],
    pm25: [],
    pm10: [],
    co2: [],
    temp: [],
    hum: []
};

// Fonction pour parser le fichier de données
async function loadData() {
    try {
        const response = await fetch('parcdemerldata.txt');
        const text = await response.text();
        const lines = text.split('\n');
        
        let lastCO2 = null;
        let lastTemp = null;
        let lastHum = null;
        
        // Parcourir chaque ligne
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Vérifier si c'est une ligne de mesures de gaz (avec timestamp)
            const timeMatch = line.match(/^(\d+)s/);
            if (timeMatch) {
                const time = parseInt(timeMatch[1]);
                
                // Format: 129s CO:0.62 NH3:38.45 CH4:0.14 PM25:3.5 PM10:18.8
                const coMatch = line.match(/CO:([\d.]+)/);
                const pm25Match = line.match(/PM25:([\d.]+)/);
                const pm10Match = line.match(/PM10:([\d.]+)/);
                
                if (coMatch && pm25Match && pm10Match) {
                    measurementData.timestamps.push(time);
                    measurementData.co.push(parseFloat(coMatch[1]));
                    measurementData.pm25.push(parseFloat(pm25Match[1]));
                    measurementData.pm10.push(parseFloat(pm10Match[1]));
                    
                    // Ajouter les dernières valeurs CO2, temp et humidité connues
                    measurementData.co2.push(lastCO2 !== null ? lastCO2 : 0);
                    measurementData.temp.push(lastTemp !== null ? lastTemp : 0);
                    measurementData.hum.push(lastHum !== null ? lastHum : 0);
                }
            } 
            // Vérifier si c'est une ligne CO2/TEMP/HUM
            else if (line.includes('CO2:')) {
                // Format: CO2:868 TEMP:20.417715724422067 HUM:49.71694514381628
                const co2Match = line.match(/CO2:([\d.]+)/);
                const tempMatch = line.match(/TEMP:([\d.]+)/);
                const humMatch = line.match(/HUM:([\d.]+)/);
                
                if (co2Match) lastCO2 = parseFloat(co2Match[1]);
                if (tempMatch) lastTemp = parseFloat(tempMatch[1]);
                if (humMatch) lastHum = parseFloat(humMatch[1]);
            }
        }
        
        console.log(`Données chargées: ${measurementData.timestamps.length} mesures`);
        initChart();
        updateStats();
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

// Initialiser le graphique
function initChart() {
    const ctx = document.getElementById('pollutionChart').getContext('2d');
    
    const datasets = [];
    
    // Créer les datasets pour chaque polluant
    if (document.getElementById('toggle-co').checked) {
        datasets.push({
            label: pollutantColors.co.label,
            data: measurementData.co,
            borderColor: pollutantColors.co.line,
            backgroundColor: pollutantColors.co.fill,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
            yAxisID: 'y-ppm'
        });
    }
    
    if (document.getElementById('toggle-co2').checked) {
        datasets.push({
            label: pollutantColors.co2.label,
            data: measurementData.co2,
            borderColor: pollutantColors.co2.line,
            backgroundColor: pollutantColors.co2.fill,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
            yAxisID: 'y-ppm'
        });
    }
    
    if (document.getElementById('toggle-pm25').checked) {
        datasets.push({
            label: pollutantColors.pm25.label,
            data: measurementData.pm25,
            borderColor: pollutantColors.pm25.line,
            backgroundColor: pollutantColors.pm25.fill,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
            yAxisID: 'y-pm'
        });
    }
    
    if (document.getElementById('toggle-pm10').checked) {
        datasets.push({
            label: pollutantColors.pm10.label,
            data: measurementData.pm10,
            borderColor: pollutantColors.pm10.line,
            backgroundColor: pollutantColors.pm10.fill,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
            yAxisID: 'y-pm'
        });
    }
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: measurementData.timestamps.map(t => t + 's'),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                title: {
                    display: true,
                    text: 'Évolution des Polluants dans le Temps',
                    color: '#00d4ff',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    titleColor: '#00d4ff',
                    bodyColor: '#ffffff',
                    borderColor: '#00d4ff',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y.toFixed(2);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Temps',
                        color: '#94a3b8',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#94a3b8',
                        maxTicksLimit: 20
                    },
                    grid: {
                        color: 'rgba(0, 212, 255, 0.1)'
                    }
                },
                'y-ppm': {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Concentration (ppm)',
                        color: '#94a3b8',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(0, 212, 255, 0.1)'
                    }
                },
                'y-pm': {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Particules (μg/m³)',
                        color: '#94a3b8',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(0, 212, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Mettre à jour les statistiques
function updateStats() {
    // Calculer les moyennes
    const avgCO = (measurementData.co.reduce((a, b) => a + b, 0) / measurementData.co.length).toFixed(2);
    const avgPM25 = (measurementData.pm25.reduce((a, b) => a + b, 0) / measurementData.pm25.length).toFixed(1);
    const avgPM10 = (measurementData.pm10.reduce((a, b) => a + b, 0) / measurementData.pm10.length).toFixed(1);
    const avgCO2 = (measurementData.co2.reduce((a, b) => a + b, 0) / measurementData.co2.length).toFixed(0);
    
    // Afficher les valeurs
    document.getElementById('avg-co').textContent = avgCO;
    document.getElementById('avg-pm25').textContent = avgPM25;
    document.getElementById('avg-pm10').textContent = avgPM10;
    document.getElementById('avg-co2').textContent = avgCO2;
}

// Event listeners pour les checkboxes
document.getElementById('toggle-co').addEventListener('change', initChart);
document.getElementById('toggle-pm25').addEventListener('change', initChart);
document.getElementById('toggle-pm10').addEventListener('change', initChart);
document.getElementById('toggle-co2').addEventListener('change', initChart);

// ===== CARTOGRAPHIE =====
let map;
let markers = [];
let gpsData = [];
let pollutionMapData = [];

// Variables pour la deuxième carte
let map2;
let markers2 = [];
let gpsData2 = [];
let pollutionMapData2 = [];
let measurementData2 = {
    timestamps: [],
    co: [],
    pm25: [],
    pm10: [],
    co2: [],
    temp: [],
    hum: []
};

// Fonction pour parser le fichier KML
async function loadGPSData() {
    try {
        const response = await fetch('parcdemerlgps.kml');
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        const whenElements = xmlDoc.getElementsByTagName('when');
        const coordElements = xmlDoc.getElementsByTagName('gx:coord');
        
        const gpsPoints = [];
        for (let i = 0; i < whenElements.length && i < coordElements.length; i++) {
            const timestamp = new Date(whenElements[i].textContent);
            const coords = coordElements[i].textContent.trim().split(' ');
            
            gpsPoints.push({
                timestamp: timestamp,
                lon: parseFloat(coords[0]),
                lat: parseFloat(coords[1]),
                alt: parseFloat(coords[2])
            });
        }
        
        return gpsPoints;
    } catch (error) {
        console.error('Erreur lors du chargement des données GPS:', error);
        return [];
    }
}

// Fonction pour associer les données de pollution aux points GPS
function mergePollutionWithGPS(gpsPoints) {
    const merged = [];
    
    // La mission GPS commence à 17:00:24 (première mesure GPS)
    // Les données de pollution commencent à 0s
    // On va assumer que 0s de pollution correspond au début GPS
    
    const startTime = gpsPoints[0].timestamp;
    
    for (let i = 0; i < gpsPoints.length; i++) {
        const gpsPoint = gpsPoints[i];
        
        // Calculer l'index approximatif dans les données de pollution
        const secondsFromStart = Math.round((gpsPoint.timestamp - startTime) / 1000);
        
        // Trouver les données de pollution correspondantes
        if (secondsFromStart >= 0 && secondsFromStart < measurementData.timestamps.length) {
            const idx = measurementData.timestamps.findIndex(t => t >= secondsFromStart);
            
            if (idx !== -1) {
                merged.push({
                    lat: gpsPoint.lat,
                    lon: gpsPoint.lon,
                    alt: gpsPoint.alt,
                    timestamp: gpsPoint.timestamp,
                    co: measurementData.co[idx],
                    co2: measurementData.co2[idx],
                    pm25: measurementData.pm25[idx],
                    pm10: measurementData.pm10[idx]
                });
            }
        }
    }
    
    return merged;
}

// Fonction pour obtenir la couleur selon le niveau de pollution
function getPollutionColor(value, pollutant) {
    // Seuils pour chaque polluant
    const thresholds = {
        co: { low: 0.3, medium: 0.5, high: 1.0 },
        co2: { low: 800, medium: 1200, high: 1600 },
        pm25: { low: 3, medium: 5, high: 8 },
        pm10: { low: 15, medium: 25, high: 35 }
    };
    
    const t = thresholds[pollutant];
    
    if (value < t.low) return '#00ff00';      // Vert - Faible
    if (value < t.medium) return '#ffff00';   // Jaune - Modéré
    if (value < t.high) return '#ff9900';     // Orange - Élevé
    return '#ff0000';                         // Rouge - Très élevé
}

// Initialiser la carte
async function initMap() {
    // Charger les données GPS
    gpsData = await loadGPSData();
    
    if (gpsData.length === 0) {
        console.error('Aucune donnée GPS chargée');
        return;
    }
    
    // Fusionner avec les données de pollution
    pollutionMapData = mergePollutionWithGPS(gpsData);
    
    // Calculer le centre de la carte
    const centerLat = gpsData.reduce((sum, p) => sum + p.lat, 0) / gpsData.length;
    const centerLon = gpsData.reduce((sum, p) => sum + p.lon, 0) / gpsData.length;
    
    // Créer la carte
    map = L.map('pollution-map').setView([centerLat, centerLon], 17);
    
    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Afficher les marqueurs pour le polluant sélectionné
    updateMapMarkers('co');
    
    // Event listeners pour les boutons radio
    document.querySelectorAll('input[name=\"map-pollutant\"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateMapMarkers(e.target.value);
        });
    });
}

// Mettre à jour les marqueurs sur la carte
function updateMapMarkers(pollutant) {
    // Supprimer les anciens marqueurs
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Ajouter les nouveaux marqueurs
    pollutionMapData.forEach((point, index) => {
        const value = point[pollutant];
        const color = getPollutionColor(value, pollutant);
        
        // Créer une icône personnalisée
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
            iconSize: [15, 15]
        });
        
        // Créer le marqueur
        const marker = L.marker([point.lat, point.lon], { icon: icon }).addTo(map);
        
        // Ajouter un popup avec les informations
        const pollutantNames = {
            co: 'CO',
            co2: 'CO₂',
            pm25: 'PM2.5',
            pm10: 'PM10'
        };
        
        const units = {
            co: 'ppm',
            co2: 'ppm',
            pm25: 'μg/m³',
            pm10: 'μg/m³'
        };
        
        marker.bindPopup(`
            <b>Point ${index + 1}</b><br>
            <b>${pollutantNames[pollutant]}:</b> ${value.toFixed(2)} ${units[pollutant]}<br>
            <small>Lat: ${point.lat.toFixed(6)}, Lon: ${point.lon.toFixed(6)}</small>
        `);
        
        markers.push(marker);
    });
    
    // Tracer la trajectoire
    const coordinates = pollutionMapData.map(p => [p.lat, p.lon]);
    const polyline = L.polyline(coordinates, {
        color: '#00d4ff',
        weight: 2,
        opacity: 0.6,
        dashArray: '5, 5'
    }).addTo(map);
    
    markers.push(polyline);
}

// Charger les données au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    loadData().then(() => {
        // Initialiser la carte après le chargement des données de pollution
        initMap();
        // Charger et initialiser la deuxième carte
        loadData2().then(() => {
            initMap2();
        });
    });
});

// ===== FONCTIONS POUR LA DEUXIÈME CARTE =====

// Fonction pour charger les données de la deuxième mission
async function loadData2() {
    try {
        const response = await fetch('mesure_forume_gese.txt');
        const text = await response.text();
        const lines = text.split('\n');
        
        let lastCO2 = null;
        let lastTemp = null;
        let lastHum = null;
        
        // Parcourir chaque ligne
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Vérifier si c'est une ligne de mesures de gaz (avec timestamp)
            const timeMatch = line.match(/^(\d+)s/);
            if (timeMatch) {
                const time = parseInt(timeMatch[1]);
                
                // Format: 61s CO:3.82 NH3:0.13 CH4:0.00 PM25:1.6 PM10:6.7
                const coMatch = line.match(/CO:([\d.]+)/);
                const pm25Match = line.match(/PM25:([\d.]+)/);
                const pm10Match = line.match(/PM10:([\d.]+)/);
                
                if (coMatch && pm25Match && pm10Match) {
                    measurementData2.timestamps.push(time);
                    measurementData2.co.push(parseFloat(coMatch[1]));
                    measurementData2.pm25.push(parseFloat(pm25Match[1]));
                    measurementData2.pm10.push(parseFloat(pm10Match[1]));
                    
                    // Ajouter les dernières valeurs CO2, temp et humidité connues
                    measurementData2.co2.push(lastCO2 !== null ? lastCO2 : 0);
                    measurementData2.temp.push(lastTemp !== null ? lastTemp : 0);
                    measurementData2.hum.push(lastHum !== null ? lastHum : 0);
                }
            } 
            // Vérifier si c'est une ligne CO2/TEMP/HUM
            else if (line.includes('CO2:')) {
                // Format: CO2:1886 TEMP:18.516441596093685 HUM:52.4055848020142
                const co2Match = line.match(/CO2:([\d.]+)/);
                const tempMatch = line.match(/TEMP:([\d.]+)/);
                const humMatch = line.match(/HUM:([\d.]+)/);
                
                if (co2Match) lastCO2 = parseFloat(co2Match[1]);
                if (tempMatch) lastTemp = parseFloat(tempMatch[1]);
                if (humMatch) lastHum = parseFloat(humMatch[1]);
            }
        }
        
        console.log(`Données mission 2 chargées: ${measurementData2.timestamps.length} mesures`);
        
    } catch (error) {
        console.error('Erreur lors du chargement des données mission 2:', error);
    }
}

// Fonction pour parser le fichier KML de la mission 2
async function loadGPSData2() {
    try {
        const response = await fetch('13_mars_2026_à_08_17_52_gps.txt');
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        const whenElements = xmlDoc.getElementsByTagName('when');
        const coordElements = xmlDoc.getElementsByTagName('gx:coord');
        
        const gpsPoints = [];
        for (let i = 0; i < whenElements.length && i < coordElements.length; i++) {
            const timestamp = new Date(whenElements[i].textContent);
            const coords = coordElements[i].textContent.trim().split(' ');
            
            gpsPoints.push({
                timestamp: timestamp,
                lon: parseFloat(coords[0]),
                lat: parseFloat(coords[1]),
                alt: parseFloat(coords[2])
            });
        }
        
        return gpsPoints;
    } catch (error) {
        console.error('Erreur lors du chargement des données GPS mission 2:', error);
        return [];
    }
}

// Fonction pour associer les données de pollution aux points GPS (mission 2)
function mergePollutionWithGPS2(gpsPoints) {
    const merged = [];
    
    if (gpsPoints.length === 0 || measurementData2.timestamps.length === 0) {
        return merged;
    }
    
    const startTime = gpsPoints[0].timestamp;
    
    for (let i = 0; i < gpsPoints.length; i++) {
        const gpsPoint = gpsPoints[i];
        
        // Calculer l'index approximatif dans les données de pollution
        const secondsFromStart = Math.round((gpsPoint.timestamp - startTime) / 1000);
        
        // Trouver les données de pollution correspondantes
        // Les données de pollution commencent à 61s dans le fichier
        const adjustedTime = secondsFromStart + 61;
        
        const idx = measurementData2.timestamps.findIndex(t => t >= adjustedTime);
        
        if (idx !== -1) {
            merged.push({
                lat: gpsPoint.lat,
                lon: gpsPoint.lon,
                alt: gpsPoint.alt,
                timestamp: gpsPoint.timestamp,
                co: measurementData2.co[idx],
                co2: measurementData2.co2[idx],
                pm25: measurementData2.pm25[idx],
                pm10: measurementData2.pm10[idx]
            });
        }
    }
    
    return merged;
}

// Initialiser la deuxième carte
async function initMap2() {
    // Charger les données GPS
    gpsData2 = await loadGPSData2();
    
    if (gpsData2.length === 0) {
        console.error('Aucune donnée GPS chargée pour mission 2');
        return;
    }
    
    // Fusionner avec les données de pollution
    pollutionMapData2 = mergePollutionWithGPS2(gpsData2);
    
    if (pollutionMapData2.length === 0) {
        console.error('Aucune donnée de pollution fusionnée pour mission 2');
        return;
    }
    
    // Calculer le centre de la carte
    const centerLat = gpsData2.reduce((sum, p) => sum + p.lat, 0) / gpsData2.length;
    const centerLon = gpsData2.reduce((sum, p) => sum + p.lon, 0) / gpsData2.length;
    
    // Créer la carte
    map2 = L.map('pollution-map-2').setView([centerLat, centerLon], 17);
    
    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map2);
    
    // Afficher les marqueurs pour le polluant sélectionné
    updateMapMarkers2('co');
    
    // Event listeners pour les boutons radio
    document.querySelectorAll('input[name=\"map-pollutant-2\"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateMapMarkers2(e.target.value);
        });
    });
}

// Mettre à jour les marqueurs sur la deuxième carte
function updateMapMarkers2(pollutant) {
    // Supprimer les anciens marqueurs
    markers2.forEach(marker => map2.removeLayer(marker));
    markers2 = [];
    
    // Ajouter les nouveaux marqueurs
    pollutionMapData2.forEach((point, index) => {
        const value = point[pollutant];
        const color = getPollutionColor(value, pollutant);
        
        // Créer une icône personnalisée
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
            iconSize: [15, 15]
        });
        
        // Créer le marqueur
        const marker = L.marker([point.lat, point.lon], { icon: icon }).addTo(map2);
        
        // Ajouter un popup avec les informations
        const pollutantNames = {
            co: 'CO',
            co2: 'CO₂',
            pm25: 'PM2.5',
            pm10: 'PM10'
        };
        
        const units = {
            co: 'ppm',
            co2: 'ppm',
            pm25: 'μg/m³',
            pm10: 'μg/m³'
        };
        
        marker.bindPopup(`
            <b>Point ${index + 1}</b><br>
            <b>${pollutantNames[pollutant]}:</b> ${value.toFixed(2)} ${units[pollutant]}<br>
            <small>Lat: ${point.lat.toFixed(6)}, Lon: ${point.lon.toFixed(6)}</small>
        `);
        
        markers2.push(marker);
    });
    
    // Tracer la trajectoire
    const coordinates = pollutionMapData2.map(p => [p.lat, p.lon]);
    const polyline = L.polyline(coordinates, {
        color: '#00d4ff',
        weight: 2,
        opacity: 0.6,
        dashArray: '5, 5'
    }).addTo(map2);
    
    markers2.push(polyline);
}
