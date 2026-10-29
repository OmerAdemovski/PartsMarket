export const BRANDS = ['Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Porsche', 'Opel', 'Ford', 'Toyota', 'Peugeot', 'Renault']

export const CATEGORIES = {
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

export const CONDITIONS = ['Used - like new', 'Used - good', 'Used - fair', 'For parts']
export const QUALITIES = ['Original/OEM', 'Aftermarket', 'Refurbished']
export const SELLER_TYPES = { individual: 'Individual', company: 'Company' }
export const YEARS = Array.from({ length: new Date().getFullYear() - 1899 }, (_, index) => String(new Date().getFullYear() - index))
