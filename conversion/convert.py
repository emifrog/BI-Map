import json

def convert_to_geojson(input_file, output_file):
    # Lire le fichier JSON d'entrée
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Créer la structure GeoJSON
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    # Convertir chaque point en feature GeoJSON
    for point in data:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    float(point["longitude"]),
                    float(point["latitude"])
                ]
            },
            "properties": {
                "title": point["title"],
                "num": point["num"],                
            }
        }
        geojson["features"].append(feature)

    # Écrire le fichier GeoJSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)

# Utilisation
convert_to_geojson('BI BV.json', 'bv.geojson')