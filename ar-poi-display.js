AFRAME.registerComponent('arjs-map', {
  schema: {
    query: {type: 'string', default: '/map?bbox=-74.0067,40.7130,-74.0031,40.7174'},
    pointGeometryProperty: {type: 'string', default: 'geometry'},
    pointProperties: {type: 'string', default: 'osm_id,name'},
    pointTemplate: {type: 'selector', default: '#poi-template'},
  },

  async init() {
    const res = await fetch(this.data.query);
    const data = await res.json();

    data.features.forEach((feature) => {
      const properties = feature.properties;
      const geometry = feature[this.data.pointGeometryProperty];
      const poi = this.data.pointTemplate.cloneNode(true);

      poi.setAttribute('position', geometry.coordinates);
      poi.setAttribute('data-name', properties.name);
      poi.setAttribute('data-osm-id', properties.osm_id);

      this.el.appendChild(poi);
    });
  },
});
