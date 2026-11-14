import chronoSurface from '../assets/images/specimen_chronograph_surface_1794636161452.jpg';
import chronoXray from '../assets/images/specimen_chronograph_xray_1794636161624.jpg';
import transducerSurface from '../assets/images/specimen_transducer_surface_1794636162264.jpg';
import transducerXray from '../assets/images/specimen_transducer_xray_1794636162578.jpg';
import chassisSurface from '../assets/images/specimen_chassis_surface_1794636162920.jpg';

export type SpecimenCategory = 'Horology' | 'Acoustics' | 'Dynamics';

export interface SpecimenTelemetryNode {
  label: string;
  value: string;
  xPercent: number;
  yPercent: number;
}

export interface SpecimenItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: SpecimenCategory;
  year: string;
  client: string;
  tolerance: string;
  mass: string;
  aspect: 'wide' | 'square' | 'tall';
  surfaceImage: string;
  xrayImage: string;
  xrayNeedsProceduralFilter?: boolean;
  xrayTint: string;
  summary: string;
  architectureNote: string;
  telemetryNodes: SpecimenTelemetryNode[];
}

export const SPECIMENS: SpecimenItem[] = [
  {
    id: 'chronograph-calibre-09',
    code: 'KA-01',
    title: 'Chronograph Calibre 09',
    subtitle: 'Grade-5 Titanium Monopusher',
    category: 'Horology',
    year: '2026',
    client: 'Manufacture Vaucher, Fleurier',
    tolerance: '±0.002 mm',
    mass: '48.4 g',
    aspect: 'wide',
    surfaceImage: chronoSurface,
    xrayImage: chronoXray,
    xrayNeedsProceduralFilter: false,
    xrayTint: '#7DD3FC',
    summary:
      'A matte-blasted Grade-5 titanium monopusher whose dial conceals a 312-part column-wheel gear train revealed dynamically through proximity radiography.',
    architectureNote:
      'Dual-barrel torque regulation paired with a silicon escapement running at 36,000 vph, calibrated for zero-backlash chronograph engagement.',
    telemetryNodes: [
      { label: 'Column Wheel', value: '8-Pillar Steel', xPercent: 34, yPercent: 31 },
      { label: 'Mainspring Barrel', value: '72h Reserve', xPercent: 64, yPercent: 28 },
      { label: 'Balance Assembly', value: '5 Hz Free-Sprung', xPercent: 48, yPercent: 74 },
    ],
  },
  {
    id: 'acoustic-horn-transducer',
    code: 'KA-02',
    title: 'Acoustic Horn Transducer',
    subtitle: 'Exponential Waveguide Monitor',
    category: 'Acoustics',
    year: '2026',
    client: 'Bregenz Sound Labs',
    tolerance: '±0.015 mm',
    mass: '14.2 kg',
    aspect: 'square',
    surfaceImage: transducerSurface,
    xrayImage: transducerXray,
    xrayNeedsProceduralFilter: false,
    xrayTint: '#93C5FD',
    summary:
      'CNC-turned aluminum flare and smoked optical glass baffle concealing a folded acoustic transmission maze and neodymium compression motor.',
    architectureNote:
      'Beryllium compression dome coupled to a 1.4-meter internal labyrinth that eliminates cabinet standing waves down to 38 Hz.',
    telemetryNodes: [
      { label: 'Folded Waveguide', value: '1,420 mm Path', xPercent: 36, yPercent: 27 },
      { label: 'Copper Voice Coil', value: '75 mm Edge-Wound', xPercent: 49, yPercent: 58 },
      { label: 'Flux Gap', value: '2.1 Tesla', xPercent: 50, yPercent: 78 },
    ],
  },
  {
    id: 'monocoque-kinetic-chassis',
    code: 'KA-03',
    title: 'Monocoque Kinetic Chassis',
    subtitle: 'Autoclaved Carbon & Titanium Rocker',
    category: 'Dynamics',
    year: '2026',
    client: 'Stuttgart Aero Dynamics',
    tolerance: '±0.040 mm',
    mass: '62.0 kg',
    aspect: 'wide',
    surfaceImage: chassisSurface,
    xrayImage: chassisSurface,
    xrayNeedsProceduralFilter: true,
    xrayTint: '#BAE6FD',
    summary:
      'Pre-preg carbon monocoque platform engineered with internal pushrod suspension geometry and active downforce load paths.',
    architectureNote:
      'Honeycomb Nomex core laminated in 14 directional plies around CNC-milled 6Al-4V titanium bulkhead pick-up nodes.',
    telemetryNodes: [
      { label: 'Front Pushrod', value: '4.2:1 Motion Ratio', xPercent: 37, yPercent: 62 },
      { label: 'Carbon Bulkhead', value: '38,400 Nm/deg', xPercent: 53, yPercent: 48 },
      { label: 'Rear Diffuser Path', value: '1,180 N @ 160 km/h', xPercent: 66, yPercent: 59 },
    ],
  },
  {
    id: 'coaxial-escapement-bridge',
    code: 'KA-04',
    title: 'Coaxial Escapement Bridge',
    subtitle: 'Micro-Milled Tungsten Rotor Study',
    category: 'Horology',
    year: '2025',
    client: 'Atelier Jurassien',
    tolerance: '±0.001 mm',
    mass: '19.8 g',
    aspect: 'square',
    surfaceImage: chronoSurface,
    xrayImage: chronoXray,
    xrayNeedsProceduralFilter: false,
    xrayTint: '#7DD3FC',
    summary:
      'Skeletonized bridge study analyzing radial shear under 5,000G shock loads using real-time fluid radiographic inspection.',
    architectureNote:
      'Wire-EDM fluted spokes reduce rotational inertia by 29% while preserving coaxial impulse geometry.',
    telemetryNodes: [
      { label: 'Impulse Pin', value: 'Synthetic Ruby', xPercent: 44, yPercent: 44 },
      { label: 'Gear Train', value: 'Epicycloidal Profile', xPercent: 60, yPercent: 54 },
    ],
  },
  {
    id: 'phase-coherent-baffle',
    code: 'KA-05',
    title: 'Phase-Coherent Baffle',
    subtitle: 'Isobaric Studio Reference Array',
    category: 'Acoustics',
    year: '2025',
    client: 'Nordic Mastering Collective',
    tolerance: '±0.010 mm',
    mass: '9.6 kg',
    aspect: 'square',
    surfaceImage: transducerSurface,
    xrayImage: transducerXray,
    xrayNeedsProceduralFilter: false,
    xrayTint: '#93C5FD',
    summary:
      'Acoustic diffraction control surface pairing brushed aerospace alloy with an internal damped compression cavity.',
    architectureNote:
      'Zero-diffraction edge radius matched to 18 kHz quarter-wavelength dispersion.',
    telemetryNodes: [
      { label: 'Phase Plug', value: 'Anodized Alloy', xPercent: 68, yPercent: 45 },
      { label: 'Magnetic Yoke', value: 'Low-Hysteresis Iron', xPercent: 48, yPercent: 72 },
    ],
  },
  {
    id: 'aero-wishbone-node',
    code: 'KA-06',
    title: 'Aero Wishbone Node',
    subtitle: 'Topology-Optimized Suspension Joint',
    category: 'Dynamics',
    year: '2025',
    client: 'Turin Mobility Lab',
    tolerance: '±0.025 mm',
    mass: '1.42 kg',
    aspect: 'square',
    surfaceImage: chassisSurface,
    xrayImage: chassisSurface,
    xrayNeedsProceduralFilter: true,
    xrayTint: '#BAE6FD',
    summary:
      'Direct metal laser sintered titanium upright housing dual ceramic bearings and internal thermal dissipation channels.',
    architectureNote:
      'Internal lattice infill cuts unsprung mass by 41% without sacrificing lateral camber stiffness.',
    telemetryNodes: [
      { label: 'Ceramic Bearing', value: 'Si3N4 Hybrid', xPercent: 46, yPercent: 64 },
      { label: 'Lattice Core', value: 'Gyroid 0.8 mm', xPercent: 58, yPercent: 52 },
    ],
  },
];
