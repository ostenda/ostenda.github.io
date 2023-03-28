AFRAME.registerComponent("poi", {
    init: function() {
        let update = false;

        this.el.addEventListener("gps-camera-update-position", async(e) => {
            if(!update) {
                const response = await fetch(`https://hikar.org/webapp/map?bbox=${west},${south},${east},${north}&layers=poi&outProj=4326`);
                
                const west = e.detail.position.longitude - 0.01,
                      east = e.detail.position.longitude + 0.01,
                      south = e.detail.position.latitude - 0.01;
                      north = e.detail.position.latitude + 0.01;
                      const pois = await response.json();
                pois.features.forEach ( feature => {
                    const compoundEntity = document.createElement("a-entity");
                    compoundEntity.setAttribute('gps-new-entity-place', {
                            latitude: feature.geometry.coordinates[1],
                            longitude: feature.geometry.coordinates[0]
                    });
                    const box = document.createElement("a-box");
                    box.setAttribute("scale", {
                        x: 20,
                        y: 20,
                        z: 20
                    });
                    box.setAttribute('material', { color: 'green' } );
                    box.setAttribute("position", { 
                        x : 0,
                        y : 20,
                        z: 0 
                    } );
                    
                    compoundEntity.appendChild(box);
                    document.querySelector("a-scene").appendChild(compoundEntity);
                });
            }
            update = true;
        });
    }    
});