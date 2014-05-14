function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function drawMapCircle(radius, latitude, longitude, hexColor) {
    var R = 6371; // earth's mean radius in km

    var rgbColor = hexToRgb(hexColor);

    var backgroundColor = new Microsoft.Maps.Color(80, rgbColor.r, rgbColor.g, rgbColor.b);
    var borderColor = new Microsoft.Maps.Color(128, rgbColor.r, rgbColor.g, rgbColor.b);

    var lat = (latitude * Math.PI) / 180;
    var lon = (longitude * Math.PI) / 180;

    var d = parseFloat(radius) / R;
    var circlePoints = new Array();

    for (x = 0; x <= 360; x += 1) {
        var p2 = new Microsoft.Maps.Location(0, 0);
        brng = x * Math.PI / 180;
        p2.latitude = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(brng));

        p2.longitude = ((lon + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat),
                         Math.cos(d) - Math.sin(lat) * Math.sin(p2.latitude))) * 180) / Math.PI;
        p2.latitude = (p2.latitude * 180) / Math.PI;
        circlePoints.push(p2);
    }

    var circle = new Microsoft.Maps.Polygon(circlePoints, {
        fillColor: backgroundColor,
        strokeColor: borderColor,
        strokeThickness: 1
    });

    App.map.entities.push(circle);

    return circle;
}