interface Campus {
  id: string;
  name: string;
}

interface University {
  id: string;
  name: string;
  campuses: Campus[];
}

export const universities: University[] = [
  {
    id: "uchile",
    name: "Universidad de Chile",
    campuses: [
      { id: "beauchef", name: "Sede Beauchef" },
      { id: "jgm", name: "Sede Juan Gómez Millas" },
      { id: "medicina", name: "Sede Norte - Medicina" },
      { id: "central", name: "Casa Central" }
    ]
  },
  {
    id: "uc",
    name: "Universidad Católica",
    campuses: [
      { id: "casa-central", name: "Casa Central" },
      { id: "san-joaquin", name: "Campus San Joaquín" },
      { id: "oriente", name: "Campus Oriente" },
      { id: "villarrica", name: "Campus Villarrica" }
    ]
  },
  {
    id: "unab",
    name: "Universidad Andrés Bello",
    campuses: [
      { id: "republica", name: "República" },
      { id: "casona", name: "Casona Las Condes" },
      { id: "vina", name: "Viña del Mar" },
      { id: "concepcion", name: "Concepción" }
    ]
  },
  {
    id: "duoc",
    name: "Duoc UC",
    campuses: [
      { id: "san-carlos", name: "San Carlos de Apoquindo" },
      { id: "maipu", name: "Sede Maipú" },
      { id: "melipilla", name: "Sede Melipilla" },
      { id: "san-joaquin", name: "Campus San Joaquín" },
      { id: "plaza-oeste", name: "Plaza Oeste" },
      { id: "puente-alto", name: "Sede Puente Alto" }
    ]
  }
];
