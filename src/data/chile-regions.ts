export interface Region {
  id: string;
  name: string;
  communes: Commune[];
}

export interface Commune {
  id: string;
  name: string;
  regionId: string;
}

export const chileRegions: Region[] = [
  {
    id: "15",
    name: "Arica y Parinacota",
    communes: [
      { id: "15101", name: "Arica", regionId: "15" },
      { id: "15102", name: "Camarones", regionId: "15" },
      { id: "15201", name: "Putre", regionId: "15" },
      { id: "15202", name: "General Lagos", regionId: "15" }
    ]
  },
  {
    id: "01",
    name: "Tarapacá",
    communes: [
      { id: "01101", name: "Iquique", regionId: "01" },
      { id: "01107", name: "Alto Hospicio", regionId: "01" },
      { id: "01401", name: "Pozo Almonte", regionId: "01" },
      { id: "01402", name: "Camiña", regionId: "01" },
      { id: "01403", name: "Colchane", regionId: "01" },
      { id: "01404", name: "Huara", regionId: "01" },
      { id: "01405", name: "Pica", regionId: "01" }
    ]
  },
  {
    id: "02",
    name: "Antofagasta",
    communes: [
      { id: "02101", name: "Antofagasta", regionId: "02" },
      { id: "02102", name: "Mejillones", regionId: "02" },
      { id: "02103", name: "Sierra Gorda", regionId: "02" },
      { id: "02104", name: "Taltal", regionId: "02" },
      { id: "02201", name: "Calama", regionId: "02" },
      { id: "02202", name: "Ollagüe", regionId: "02" },
      { id: "02203", name: "San Pedro de Atacama", regionId: "02" },
      { id: "02301", name: "Tocopilla", regionId: "02" },
      { id: "02302", name: "María Elena", regionId: "02" }
    ]
  },
  {
    id: "03",
    name: "Atacama",
    communes: [
      { id: "03101", name: "Copiapó", regionId: "03" },
      { id: "03102", name: "Caldera", regionId: "03" },
      { id: "03103", name: "Tierra Amarilla", regionId: "03" },
      { id: "03201", name: "Chañaral", regionId: "03" },
      { id: "03202", name: "Diego de Almagro", regionId: "03" },
      { id: "03301", name: "Vallenar", regionId: "03" },
      { id: "03302", name: "Alto del Carmen", regionId: "03" },
      { id: "03303", name: "Freirina", regionId: "03" },
      { id: "03304", name: "Huasco", regionId: "03" }
    ]
  },
  {
    id: "04",
    name: "Coquimbo",
    communes: [
      { id: "04101", name: "La Serena", regionId: "04" },
      { id: "04102", name: "Coquimbo", regionId: "04" },
      { id: "04103", name: "Andacollo", regionId: "04" },
      { id: "04104", name: "La Higuera", regionId: "04" },
      { id: "04105", name: "Paiguano", regionId: "04" },
      { id: "04106", name: "Vicuña", regionId: "04" },
      { id: "04201", name: "Illapel", regionId: "04" },
      { id: "04202", name: "Canela", regionId: "04" },
      { id: "04203", name: "Los Vilos", regionId: "04" },
      { id: "04204", name: "Salamanca", regionId: "04" },
      { id: "04301", name: "Ovalle", regionId: "04" },
      { id: "04302", name: "Combarbalá", regionId: "04" },
      { id: "04303", name: "Monte Patria", regionId: "04" },
      { id: "04304", name: "Punitaqui", regionId: "04" },
      { id: "04305", name: "Río Hurtado", regionId: "04" }
    ]
  },
  {
    id: "05",
    name: "Valparaíso",
    communes: [
      { id: "05101", name: "Valparaíso", regionId: "05" },
      { id: "05102", name: "Casablanca", regionId: "05" },
      { id: "05103", name: "Concón", regionId: "05" },
      { id: "05104", name: "Juan Fernández", regionId: "05" },
      { id: "05105", name: "Puchuncaví", regionId: "05" },
      { id: "05107", name: "Quintero", regionId: "05" },
      { id: "05109", name: "Viña del Mar", regionId: "05" },
      { id: "05201", name: "Isla de Pascua", regionId: "05" },
      { id: "05301", name: "Los Andes", regionId: "05" },
      { id: "05302", name: "Calle Larga", regionId: "05" },
      { id: "05303", name: "Rinconada", regionId: "05" },
      { id: "05304", name: "San Esteban", regionId: "05" },
      { id: "05401", name: "La Ligua", regionId: "05" },
      { id: "05402", name: "Cabildo", regionId: "05" },
      { id: "05403", name: "Papudo", regionId: "05" },
      { id: "05404", name: "Petorca", regionId: "05" },
      { id: "05405", name: "Zapallar", regionId: "05" },
      { id: "05501", name: "Quillota", regionId: "05" },
      { id: "05502", name: "Calera", regionId: "05" },
      { id: "05503", name: "Hijuelas", regionId: "05" },
      { id: "05504", name: "La Cruz", regionId: "05" },
      { id: "05506", name: "Nogales", regionId: "05" },
      { id: "05601", name: "San Antonio", regionId: "05" },
      { id: "05602", name: "Algarrobo", regionId: "05" },
      { id: "05603", name: "Cartagena", regionId: "05" },
      { id: "05604", name: "El Quisco", regionId: "05" },
      { id: "05605", name: "El Tabo", regionId: "05" },
      { id: "05606", name: "Santo Domingo", regionId: "05" },
      { id: "05701", name: "San Felipe", regionId: "05" },
      { id: "05702", name: "Catemu", regionId: "05" },
      { id: "05703", name: "Llaillay", regionId: "05" },
      { id: "05704", name: "Panquehue", regionId: "05" },
      { id: "05705", name: "Putaendo", regionId: "05" },
      { id: "05706", name: "Santa María", regionId: "05" }
    ]
  },
  {
    id: "13",
    name: "Metropolitana de Santiago",
    communes: [
      { id: "13101", name: "Santiago", regionId: "13" },
      { id: "13102", name: "Cerrillos", regionId: "13" },
      { id: "13103", name: "Cerro Navia", regionId: "13" },
      { id: "13104", name: "Conchalí", regionId: "13" },
      { id: "13105", name: "El Bosque", regionId: "13" },
      { id: "13106", name: "Estación Central", regionId: "13" },
      { id: "13107", name: "Huechuraba", regionId: "13" },
      { id: "13108", name: "Independencia", regionId: "13" },
      { id: "13109", name: "La Cisterna", regionId: "13" },
      { id: "13110", name: "La Florida", regionId: "13" },
      { id: "13111", name: "La Granja", regionId: "13" },
      { id: "13112", name: "La Pintana", regionId: "13" },
      { id: "13113", name: "La Reina", regionId: "13" },
      { id: "13114", name: "Las Condes", regionId: "13" },
      { id: "13115", name: "Lo Barnechea", regionId: "13" },
      { id: "13116", name: "Lo Espejo", regionId: "13" },
      { id: "13117", name: "Lo Prado", regionId: "13" },
      { id: "13118", name: "Macul", regionId: "13" },
      { id: "13119", name: "Maipú", regionId: "13" },
      { id: "13120", name: "Ñuñoa", regionId: "13" },
      { id: "13121", name: "Pedro Aguirre Cerda", regionId: "13" },
      { id: "13122", name: "Peñalolén", regionId: "13" },
      { id: "13123", name: "Providencia", regionId: "13" },
      { id: "13124", name: "Pudahuel", regionId: "13" },
      { id: "13125", name: "Quilicura", regionId: "13" },
      { id: "13126", name: "Quinta Normal", regionId: "13" },
      { id: "13127", name: "Recoleta", regionId: "13" },
      { id: "13128", name: "Renca", regionId: "13" },
      { id: "13129", name: "San Joaquín", regionId: "13" },
      { id: "13130", name: "San Miguel", regionId: "13" },
      { id: "13131", name: "San Ramón", regionId: "13" },
      { id: "13132", name: "Vitacura", regionId: "13" },
      { id: "13201", name: "Puente Alto", regionId: "13" },
      { id: "13202", name: "Pirque", regionId: "13" },
      { id: "13203", name: "San José de Maipo", regionId: "13" },
      { id: "13301", name: "Colina", regionId: "13" },
      { id: "13302", name: "Lampa", regionId: "13" },
      { id: "13303", name: "Tiltil", regionId: "13" },
      { id: "13401", name: "San Bernardo", regionId: "13" },
      { id: "13402", name: "Buin", regionId: "13" },
      { id: "13403", name: "Calera de Tango", regionId: "13" },
      { id: "13404", name: "Paine", regionId: "13" },
      { id: "13501", name: "Melipilla", regionId: "13" },
      { id: "13502", name: "Alhué", regionId: "13" },
      { id: "13503", name: "Curacaví", regionId: "13" },
      { id: "13504", name: "María Pinto", regionId: "13" },
      { id: "13505", name: "San Pedro", regionId: "13" },
      { id: "13601", name: "Talagante", regionId: "13" },
      { id: "13602", name: "El Monte", regionId: "13" },
      { id: "13603", name: "Isla de Maipo", regionId: "13" },
      { id: "13604", name: "Padre Hurtado", regionId: "13" },
      { id: "13605", name: "Peñaflor", regionId: "13" }
    ]
  },
  {
    id: "06",
    name: "O'Higgins",
    communes: [
      { id: "06101", name: "Rancagua", regionId: "06" },
      { id: "06102", name: "Codegua", regionId: "06" },
      { id: "06103", name: "Coinco", regionId: "06" },
      { id: "06104", name: "Coltauco", regionId: "06" },
      { id: "06105", name: "Doñihue", regionId: "06" },
      { id: "06106", name: "Graneros", regionId: "06" },
      { id: "06107", name: "Las Cabras", regionId: "06" },
      { id: "06108", name: "Machalí", regionId: "06" },
      { id: "06109", name: "Malloa", regionId: "06" },
      { id: "06110", name: "Mostazal", regionId: "06" },
      { id: "06111", name: "Olivar", regionId: "06" },
      { id: "06112", name: "Peumo", regionId: "06" },
      { id: "06113", name: "Pichidegua", regionId: "06" },
      { id: "06114", name: "Quinta de Tilcoco", regionId: "06" },
      { id: "06115", name: "Rengo", regionId: "06" },
      { id: "06116", name: "Requínoa", regionId: "06" },
      { id: "06117", name: "San Vicente", regionId: "06" },
      { id: "06201", name: "Pichilemu", regionId: "06" },
      { id: "06202", name: "La Estrella", regionId: "06" },
      { id: "06203", name: "Litueche", regionId: "06" },
      { id: "06204", name: "Marchihue", regionId: "06" },
      { id: "06205", name: "Navidad", regionId: "06" },
      { id: "06206", name: "Paredones", regionId: "06" },
      { id: "06301", name: "San Fernando", regionId: "06" },
      { id: "06302", name: "Chépica", regionId: "06" },
      { id: "06303", name: "Chimbarongo", regionId: "06" },
      { id: "06304", name: "Lolol", regionId: "06" },
      { id: "06305", name: "Nancagua", regionId: "06" },
      { id: "06306", name: "Palmilla", regionId: "06" },
      { id: "06307", name: "Peralillo", regionId: "06" },
      { id: "06308", name: "Placilla", regionId: "06" },
      { id: "06309", name: "Pumanque", regionId: "06" },
      { id: "06310", name: "Santa Cruz", regionId: "06" }
    ]
  },
  {
    id: "07",
    name: "Maule",
    communes: [
      { id: "07101", name: "Talca", regionId: "07" },
      { id: "07102", name: "Constitución", regionId: "07" },
      { id: "07103", name: "Curepto", regionId: "07" },
      { id: "07104", name: "Empedrado", regionId: "07" },
      { id: "07105", name: "Maule", regionId: "07" },
      { id: "07106", name: "Pelarco", regionId: "07" },
      { id: "07107", name: "Pencahue", regionId: "07" },
      { id: "07108", name: "Río Claro", regionId: "07" },
      { id: "07109", name: "San Clemente", regionId: "07" },
      { id: "07110", name: "San Rafael", regionId: "07" },
      { id: "07201", name: "Cauquenes", regionId: "07" },
      { id: "07202", name: "Chanco", regionId: "07" },
      { id: "07203", name: "Pelluhue", regionId: "07" },
      { id: "07301", name: "Curicó", regionId: "07" },
      { id: "07302", name: "Hualañé", regionId: "07" },
      { id: "07303", name: "Licantén", regionId: "07" },
      { id: "07304", name: "Molina", regionId: "07" },
      { id: "07305", name: "Rauco", regionId: "07" },
      { id: "07306", name: "Romeral", regionId: "07" },
      { id: "07307", name: "Sagrada Familia", regionId: "07" },
      { id: "07308", name: "Teno", regionId: "07" },
      { id: "07309", name: "Vichuquén", regionId: "07" },
      { id: "07401", name: "Linares", regionId: "07" },
      { id: "07402", name: "Colbún", regionId: "07" },
      { id: "07403", name: "Longaví", regionId: "07" },
      { id: "07404", name: "Parral", regionId: "07" },
      { id: "07405", name: "Retiro", regionId: "07" },
      { id: "07406", name: "San Javier", regionId: "07" },
      { id: "07407", name: "Villa Alegre", regionId: "07" },
      { id: "07408", name: "Yerbas Buenas", regionId: "07" }
    ]
  },
  {
    id: "08",
    name: "Ñuble",
    communes: [
      { id: "08101", name: "Chillán", regionId: "08" },
      { id: "08102", name: "Bulnes", regionId: "08" },
      { id: "08103", name: "Cobquecura", regionId: "08" },
      { id: "08104", name: "Coelemu", regionId: "08" },
      { id: "08105", name: "Coihueco", regionId: "08" },
      { id: "08106", name: "Chillán Viejo", regionId: "08" },
      { id: "08107", name: "El Carmen", regionId: "08" },
      { id: "08108", name: "Ninhue", regionId: "08" },
      { id: "08109", name: "Ñiquén", regionId: "08" },
      { id: "08110", name: "Pemuco", regionId: "08" },
      { id: "08111", name: "Pinto", regionId: "08" },
      { id: "08112", name: "Portezuelo", regionId: "08" },
      { id: "08113", name: "Quillón", regionId: "08" },
      { id: "08114", name: "Quirihue", regionId: "08" },
      { id: "08115", name: "Ránquil", regionId: "08" },
      { id: "08116", name: "San Carlos", regionId: "08" },
      { id: "08117", name: "San Fabián", regionId: "08" },
      { id: "08118", name: "San Ignacio", regionId: "08" },
      { id: "08119", name: "San Nicolás", regionId: "08" },
      { id: "08120", name: "Treguaco", regionId: "08" },
      { id: "08121", name: "Yungay", regionId: "08" }
    ]
  },
  {
    id: "09",
    name: "Biobío",
    communes: [
      { id: "09101", name: "Concepción", regionId: "09" },
      { id: "09102", name: "Coronel", regionId: "09" },
      { id: "09103", name: "Chiguayante", regionId: "09" },
      { id: "09104", name: "Florida", regionId: "09" },
      { id: "09105", name: "Hualqui", regionId: "09" },
      { id: "09106", name: "Lota", regionId: "09" },
      { id: "09107", name: "Penco", regionId: "09" },
      { id: "09108", name: "San Pedro de la Paz", regionId: "09" },
      { id: "09109", name: "Santa Juana", regionId: "09" },
      { id: "09110", name: "Talcahuano", regionId: "09" },
      { id: "09111", name: "Tomé", regionId: "09" },
      { id: "09112", name: "Hualpén", regionId: "09" },
      { id: "09201", name: "Lebu", regionId: "09" },
      { id: "09202", name: "Arauco", regionId: "09" },
      { id: "09203", name: "Cañete", regionId: "09" },
      { id: "09204", name: "Contulmo", regionId: "09" },
      { id: "09205", name: "Curanilahue", regionId: "09" },
      { id: "09206", name: "Los Álamos", regionId: "09" },
      { id: "09207", name: "Tirúa", regionId: "09" },
      { id: "09301", name: "Los Ángeles", regionId: "09" },
      { id: "09302", name: "Antuco", regionId: "09" },
      { id: "09303", name: "Cabrero", regionId: "09" },
      { id: "09304", name: "Laja", regionId: "09" },
      { id: "09305", name: "Mulchén", regionId: "09" },
      { id: "09306", name: "Nacimiento", regionId: "09" },
      { id: "09307", name: "Negrete", regionId: "09" },
      { id: "09308", name: "Quilaco", regionId: "09" },
      { id: "09309", name: "Quilleco", regionId: "09" },
      { id: "09310", name: "San Rosendo", regionId: "09" },
      { id: "09311", name: "Santa Bárbara", regionId: "09" },
      { id: "09312", name: "Tucapel", regionId: "09" },
      { id: "09313", name: "Yumbel", regionId: "09" },
      { id: "09314", name: "Alto Biobío", regionId: "09" }
    ]
  },
  {
    id: "14",
    name: "La Araucanía",
    communes: [
      { id: "14101", name: "Temuco", regionId: "14" },
      { id: "14102", name: "Carahue", regionId: "14" },
      { id: "14103", name: "Cunco", regionId: "14" },
      { id: "14104", name: "Curarrehue", regionId: "14" },
      { id: "14105", name: "Freire", regionId: "14" },
      { id: "14106", name: "Galvarino", regionId: "14" },
      { id: "14107", name: "Gorbea", regionId: "14" },
      { id: "14108", name: "Lautaro", regionId: "14" },
      { id: "14109", name: "Loncoche", regionId: "14" },
      { id: "14110", name: "Melipeuco", regionId: "14" },
      { id: "14111", name: "Nueva Imperial", regionId: "14" },
      { id: "14112", name: "Padre Las Casas", regionId: "14" },
      { id: "14113", name: "Perquenco", regionId: "14" },
      { id: "14114", name: "Pitrufquén", regionId: "14" },
      { id: "14115", name: "Pucón", regionId: "14" },
      { id: "14116", name: "Saavedra", regionId: "14" },
      { id: "14117", name: "Teodoro Schmidt", regionId: "14" },
      { id: "14118", name: "Toltén", regionId: "14" },
      { id: "14119", name: "Vilcún", regionId: "14" },
      { id: "14120", name: "Villarrica", regionId: "14" },
      { id: "14121", name: "Cholchol", regionId: "14" },
      { id: "14201", name: "Angol", regionId: "14" },
      { id: "14202", name: "Collipulli", regionId: "14" },
      { id: "14203", name: "Curacautín", regionId: "14" },
      { id: "14204", name: "Ercilla", regionId: "14" },
      { id: "14205", name: "Lonquimay", regionId: "14" },
      { id: "14206", name: "Los Sauces", regionId: "14" },
      { id: "14207", name: "Lumaco", regionId: "14" },
      { id: "14208", name: "Purén", regionId: "14" },
      { id: "14209", name: "Renaico", regionId: "14" },
      { id: "14210", name: "Traiguén", regionId: "14" },
      { id: "14211", name: "Victoria", regionId: "14" }
    ]
  },
  {
    id: "10",
    name: "Los Lagos",
    communes: [
      { id: "10101", name: "Puerto Montt", regionId: "10" },
      { id: "10102", name: "Calbuco", regionId: "10" },
      { id: "10103", name: "Cochamó", regionId: "10" },
      { id: "10104", name: "Fresia", regionId: "10" },
      { id: "10105", name: "Frutillar", regionId: "10" },
      { id: "10106", name: "Los Muermos", regionId: "10" },
      { id: "10107", name: "Llanquihue", regionId: "10" },
      { id: "10108", name: "Maullín", regionId: "10" },
      { id: "10109", name: "Puerto Varas", regionId: "10" },
      { id: "10201", name: "Castro", regionId: "10" },
      { id: "10202", name: "Ancud", regionId: "10" },
      { id: "10203", name: "Chonchi", regionId: "10" },
      { id: "10204", name: "Curaco de Vélez", regionId: "10" },
      { id: "10205", name: "Dalcahue", regionId: "10" },
      { id: "10206", name: "Puqueldón", regionId: "10" },
      { id: "10207", name: "Queilén", regionId: "10" },
      { id: "10208", name: "Quellón", regionId: "10" },
      { id: "10209", name: "Quemchi", regionId: "10" },
      { id: "10210", name: "Quinchao", regionId: "10" },
      { id: "10301", name: "Osorno", regionId: "10" },
      { id: "10302", name: "Puerto Octay", regionId: "10" },
      { id: "10303", name: "Purranque", regionId: "10" },
      { id: "10304", name: "Puyehue", regionId: "10" },
      { id: "10305", name: "Río Negro", regionId: "10" },
      { id: "10306", name: "San Juan de la Costa", regionId: "10" },
      { id: "10307", name: "San Pablo", regionId: "10" },
      { id: "10401", name: "Chaitén", regionId: "10" },
      { id: "10402", name: "Futaleufú", regionId: "10" },
      { id: "10403", name: "Hualaihué", regionId: "10" },
      { id: "10404", name: "Palena", regionId: "10" }
    ]
  },
  {
    id: "11",
    name: "Aysén",
    communes: [
      { id: "11101", name: "Coyhaique", regionId: "11" },
      { id: "11102", name: "Lago Verde", regionId: "11" },
      { id: "11201", name: "Aysén", regionId: "11" },
      { id: "11202", name: "Cisnes", regionId: "11" },
      { id: "11203", name: "Guaitecas", regionId: "11" },
      { id: "11301", name: "Cochrane", regionId: "11" },
      { id: "11302", name: "O'Higgins", regionId: "11" },
      { id: "11303", name: "Tortel", regionId: "11" },
      { id: "11401", name: "Chile Chico", regionId: "11" },
      { id: "11402", name: "Río Ibáñez", regionId: "11" }
    ]
  },
  {
    id: "12",
    name: "Magallanes",
    communes: [
      { id: "12101", name: "Punta Arenas", regionId: "12" },
      { id: "12102", name: "Laguna Blanca", regionId: "12" },
      { id: "12103", name: "Río Verde", regionId: "12" },
      { id: "12104", name: "San Gregorio", regionId: "12" },
      { id: "12201", name: "Cabo de Hornos", regionId: "12" },
      { id: "12202", name: "Antártica", regionId: "12" },
      { id: "12301", name: "Porvenir", regionId: "12" },
      { id: "12302", name: "Primavera", regionId: "12" },
      { id: "12303", name: "Timaukel", regionId: "12" },
      { id: "12401", name: "Natales", regionId: "12" },
      { id: "12402", name: "Torres del Paine", regionId: "12" }
    ]
  }
];

export const getAllCommunes = (): Commune[] => {
  return chileRegions.flatMap(region => region.communes);
};

export const getCommunesByRegion = (regionId: string): Commune[] => {
  const region = chileRegions.find(r => r.id === regionId);
  return region ? region.communes : [];
};

export const getRegionById = (regionId: string): Region | undefined => {
  return chileRegions.find(r => r.id === regionId);
};

export const getCommuneById = (communeId: string): Commune | undefined => {
  return getAllCommunes().find(c => c.id === communeId);
}; 