const brands = ['Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Porsche', 'Opel', 'Ford', 'Toyota', 'Peugeot', 'Renault']

const categories = {
  Engine: ['Complete engines', 'Cylinder heads', 'Pistons and connecting rods', 'Gaskets and seals'],
  'Transmission and drivetrain': ['Automatic transmissions', 'Manual transmissions', 'Differentials', 'Driveshafts and CV joints'],
  'Turbo and intake': ['Turbochargers', 'Intercoolers', 'Intake manifolds', 'Air filters'],
  'Fuel and injection': ['Injectors', 'Fuel pumps', 'Fuel rails', 'Throttle bodies'],
  'Electrical and electronics': ['ECUs', 'Alternators', 'Starters', 'Batteries', 'Wiring'],
  Lighting: ['Headlights', 'Taillights', 'Fog lights', 'Bulbs and modules'],
  Brakes: ['Brake discs', 'Brake pads', 'Calipers', 'ABS components'],
  'Suspension and steering': ['Shock absorbers', 'Springs', 'Control arms', 'Steering racks'],
  Cooling: ['Radiators', 'Water pumps', 'Cooling fans', 'Thermostats'],
  Exhaust: ['Catalytic converters', 'DPF filters', 'Mufflers', 'Exhaust manifolds'],
  Clutch: ['Clutch kits', 'Flywheels', 'Pressure plates'],
  'Body and interior': ['Bumpers', 'Doors', 'Mirrors', 'Seats and trim'],
  'Sensors and switches': ['Engine sensors', 'Parking sensors', 'Window switches', 'Steering-column switches'],
}

const qualities = ['Original/OEM', 'Aftermarket', 'Refurbished']

function isSupportedCategory(category) {
  return Object.prototype.hasOwnProperty.call(categories, category)
}

function isValidSubcategory(category, subcategory) {
  return isSupportedCategory(category) && categories[category].includes(subcategory)
}

module.exports = { brands, categories, qualities, isSupportedCategory, isValidSubcategory }
